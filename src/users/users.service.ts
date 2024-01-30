import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../entities/enum/user-role.enum';
import { User } from '../entities/user.entity';
import { encodePassword } from '../utils/bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async findAll(role?: UserRole): Promise<User[]> {
    if (role) {
      const users = await this.userRepository.find({ where: { role } });
      if (users.length === 0) {
        throw new NotFoundException(`Users with role ${role} not found`);
      }
      return users;
    }

    return await this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async findOneByMail(userMail: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: [{ email: userMail }],
    });

    if (!user) {
      throw new NotFoundException(`User with mail ${userMail} not found`);
    }

    return user;
  }

  async createUser(createUserDto: CreateUserDto) {
    const user = await this.userRepository.findOne({
      where: [{ email: createUserDto.email }],
    });

    if (user) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = encodePassword(createUserDto.password);
    const newUser = this.userRepository.create({
      ...createUserDto,
      passwordHash: hashedPassword,
    });

    return await this.userRepository.save(newUser);
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, updateUserDto);
    return await this.findOne(id);
  }

  async deleteUser(id: number): Promise<User> {
    const removedUser = this.findOne(id);
    await this.userRepository.delete(id);
    return removedUser;
  }
}
