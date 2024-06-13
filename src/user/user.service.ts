import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  InjectModel,
} from '@nestjs/mongoose';
import {
  Model,
  Types,
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
import axios, {
  AxiosError,
  AxiosResponse,
} from 'axios';
import {
  catchError,
  firstValueFrom,
} from 'rxjs';


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
    /* this.rabbitMQService.sendToQueue({
       event: 'user_created',
       user: createdUser,
     });*/
    // Dummy email sending
    console.log(`Email sent to ${createdUser.email}`);
    return createdUser;
  }

  async findById(userId: string): Promise<User> {
    return await this.fetchUserFromApi(userId);
  }

  async getUserAvatar(userId: string): Promise<{
    _id: string;
    base64: string;
  }> {
    if (Types.ObjectId.isValid(userId)) {
      const user = await this.userModel.findById(userId).exec();
      const filePath = `./avatars/${user.avatarHash}`;
      const file = await readFile(filePath);
      return {
        _id: userId,
        base64: file.toString('base64'),
      };
    } else {
      const objectId = new Types.ObjectId();
      const data = await this.fetchUserFromApi(userId);
      const avatarUrl = data.avatar;
      const avatar = await this.downloadAvatar(avatarUrl);
      await this.userModel.findByIdAndUpdate(
        objectId,
        {
          avatarUrl: avatarUrl,
          name: `${data['first_name']} ${data['last_name']}`,
          email: data['email'],
          avatarHash: avatar.hash,
        },
        {
          new: true,
          upsert: true,
        },
      );
      return {
        _id: objectId.toString(),
        base64: avatar.base64,
      };
    }
  }

  async deleteUserAvatar(userId: string): Promise<void> {
    const user = await this.userModel.findByIdAndDelete(this.toObjectId(userId)).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const filePath = `./avatars/${user.avatarHash}`;
    try {
      await unlink(filePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`File ${filePath} not found.`);
      } else {
        throw error; // re-throw the error if it's not a 'file not found' error
      }
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


  private async fetchUserFromApi(userId: string): Promise<any> {
    const response = await axios.get(`https://reqres.in/api/users/${userId}`);
    return response.data.data;
  }

  private toObjectId(userId: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Invalid user ID');
    }
    return new Types.ObjectId(userId);
  }

}