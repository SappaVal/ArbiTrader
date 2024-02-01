import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AdminGuard } from 'src/auth/guards/admin-auth.guard';
import { JwtGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/entities/user.entity';
import { UserRole } from '../entities/enum/user-role.enum';
import { ExchangesService } from './../exchanges/exchanges.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly exchangesService: ExchangesService,
  ) {}

  @Get()
  @UseGuards(AdminGuard)
  async getUsers(@Query('role') role?: UserRole): Promise<User[]> {
    return await this.usersService.findAll(role);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  async getUser(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return await this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe)
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return await this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async removeUser(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.remove(id);
  }

  @Post('/exchanges')
  @UseGuards(JwtGuard)
  async getExchangesByUser(@Request() req) {
    const userId = req.user.id;
    console.log('userId', userId);
    return this.usersService.findUserExchangesDetails(+userId);
  }
}
