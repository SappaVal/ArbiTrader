import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { comparePassword } from '../utils/bcrypt';
import { User } from 'src/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { UserPayload } from 'src/auth/dto/user-payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(userMail: string, password: string) {
    const user = await this.usersService.findOneByMail(userMail);
    if (user && comparePassword(password, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }

    return null;
  }

  async login(user: User) {
    const payload: UserPayload = this.createUserPayload(user);

    return {
      ...payload,
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: '7d',
      }),
    };
  }

  async refreshToken(user: User) {
    return {
      accessToken: this.jwtService.sign(this.createUserPayload(user)),
    };
  }

  private createUserPayload(user: User): UserPayload {
    return {
      id: user.id,
      name: user.name,
      mail: user.email,
      role: user.role,
    };
  }
}
