import {
  Controller,
} from '@nestjs/common';
import { UsersService } from './user.service';

@Controller('users')

export class UsersController {
  constructor(private usersService: UsersService) {}
    //todo: deal with auth and crud opaerationd
}