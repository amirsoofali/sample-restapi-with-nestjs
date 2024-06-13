import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import {
  UsersService,
} from './user.service';
import {
  CreateUserDto,
} from './dto/create-user.dto';
import {
  User,
} from './user.schema';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get(':userId')
  async findById(@Param('userId') userId: string): Promise<User> {
    return this.usersService.findById(userId);
  }

  @Get(':userId/avatar')
  async getUserAvatar(@Param('userId') userId: string): Promise<{
    _id: string,
    base64: string
  }> {
    return await this.usersService.getUserAvatar(userId);
  }

  @Delete(':userId/avatar')
  async deleteUserAvatar(@Param('userId') userId: string): Promise<void> {
    await this.usersService.deleteUserAvatar(userId);
  }
}
