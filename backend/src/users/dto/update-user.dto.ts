import { UserRole } from '../user.entity';

export class UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}