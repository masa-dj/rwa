import { Controller, Post, UseGuards, Request, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { UsersService } from "../users/user.service";
import { RegisterUserDto } from "../users/dto/register-user.dto";

@Controller("auth")
export class AuthController {
    constructor(
        private authService: AuthService,
        private usersService: UsersService,
    ) {}

    @UseGuards(LocalAuthGuard)
    @Post("login")
    login(@Request() req: any) {
        return this.authService.login(req.user);
    }

    @Post("register")
    register(@Body() dto: RegisterUserDto) {
        return this.usersService.registerStudent(dto);
    }
}
