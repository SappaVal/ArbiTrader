import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserExchange } from 'src/entities/user-exchange.entity.ts';
import { Repository } from 'typeorm';
import { UserRole } from '../entities/enum/user-role.enum';
import { User } from '../entities/user.entity';
import { encodePassword } from '../utils/bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserExchangeDetailsDTO } from './dto/user-exchange-details.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(UserExchange)
    private userExchangeRepository: Repository<UserExchange>,
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

  async create(createUserDto: CreateUserDto) {
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

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, updateUserDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<User> {
    const removedUser = this.findOne(id);
    await this.userRepository.delete(id);
    return removedUser;
  }

  async findExchangesByUserId(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['exchanges'],
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    return user.exchanges;
  }

  async findUserExchangesDetails(
    userId: number,
  ): Promise<UserExchangeDetailsDTO[]> {
    return this.userExchangeRepository
      .createQueryBuilder('ue')
      .select([
        'ue.id as id',
        'ue.updatedAt as updatedAt',
        'e.id as exchangeId',
        'e.name AS exchangeName',
        'ue.apiKey as apiKey',
      ])
      .innerJoin('ue.user', 'u', 'u.id = :userId', { userId })
      .innerJoin('ue.exchange', 'e')
      .getRawMany();
  }
}
