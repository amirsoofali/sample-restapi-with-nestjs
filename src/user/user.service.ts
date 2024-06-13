import {
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  InjectModel,
} from '@nestjs/mongoose';
import {
  Model,
} from 'mongoose';
import {
  User,
} from './user.schema';
import {
  CreateUserDto,
} from './dto/create-user.dto';
import {
  RabbitMQService,
} from '../rabbitmq/rabbitmq.service';
import {
  readFile,
  unlink,
  writeFile,
} from 'fs/promises';
import {
  createHash,
} from 'crypto';
import {
  HttpService,
} from '@nestjs/axios';
import {
  catchError,
  firstValueFrom,
} from 'rxjs';
import {
  AxiosError,AxiosResponse
} from 'axios';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private rabbitMQService: RabbitMQService,
    private httpService: HttpService,
  ) {
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    await createdUser.save();
    this.rabbitMQService.sendToQueue({
      event: 'user_created',
      user: createdUser,
    });
    // Dummy email sending
    console.log(`Email sent to ${createdUser.email}`);
    return createdUser;
  }

  async findById(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      return await this.fetchUserFromApi(userId);
    }
    return user;
  }

  async getUserAvatar(userId: string): Promise<string> {
    const user = await this.userModel.findById(userId).exec();
    if (!user || !user.avatarUrl) {
      const data = await this.fetchUserFromApi(userId);
      const avatarUrl = data.avatarUrl;
      const avatar = await this.downloadAvatar(avatarUrl);
      user.avatarUrl = avatarUrl;
      user.avatarHash = avatar.hash;
      await user.save();
      return avatar.base64;
    }
    const filePath = `./avatars/${user.avatarHash}`;
    const file = await readFile(filePath);
    return file.toString('base64');
  }

  async deleteUserAvatar(userId: string): Promise<void> {
    const user = await this.userModel.findById(userId).exec();
    if (user && user.avatarHash) {
      const filePath = `./avatars/${user.avatarHash}`;
      await unlink(filePath);
      user.avatarUrl = null;
      user.avatarHash = null;
      await user.save();
    }
  }

  private async downloadAvatar(url: string): Promise<{
    base64: string;
    hash: string;
  }> {
    try {
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.get(url, { responseType: 'arraybuffer' }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data || error.message);
            throw new Error('An error occurred while downloading the avatar!');
          }),
        ),
      );

      const buffer = Buffer.from(response.data);
      const hash = createHash('sha256').update(buffer).digest('hex');
      const filePath = `./avatars/${hash}`;

      await writeFile(filePath, buffer);

      return {
        base64: buffer.toString('base64'),
        hash,
      };
    } catch (error) {
      this.logger.error(`Failed to download avatar: ${error.message}`);
      throw error;
    }
  }

  // private async downloadAvatar(url: string): Promise<{
  //   base64: string,
  //   hash: string
  // }> {
  //   const response = await this.httpService.get(url, { responseType: 'arraybuffer' }).toPromise();
  //   const buffer = Buffer.from(response.data);
  //   const hash = createHash('sha256').update(buffer).digest('hex');
  //   const filePath = `./avatars/${hash}`;
  //   await writeFile(filePath, buffer);
  //   return {
  //     base64: buffer.toString('base64'),
  //     hash,
  //   };
  // }

  private async fetchUserFromApi(userId: string): Promise<User> {
    const { data } = await firstValueFrom(
      this.httpService.get<User>(`https://reqres.in/api/users/${userId}`).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.response?.data || error.message);
          throw new Error('An error occurred while fetching user data!');
        }),
      ),
    );
    return data;
  }
}