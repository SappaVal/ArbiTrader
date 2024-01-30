import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { UserRole } from '../../entities/enum/user-role.enum';

export class UserPayload {
  id: number;
  name: string;
  mail: string;
  role: UserRole;
}
