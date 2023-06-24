import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../user/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(username, pass) {
    const user = await this.userService.findOne(username);
    if (!user) {
      throw new NotFoundException('user does not exists');
    }
    const match = await bcrypt.compare(pass, user.password);
    if (!match) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.id, username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(body: CreateUserDto) {
    const user = await this.userService.findOne(body.username);
    if (user) {
      throw new BadRequestException('email in use');
    }

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(body.password, salt);
    body.password = hashPassword;

    const currentUser = await this.userService.createUser(body);
    const payload = { sub: currentUser.id, username: currentUser.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
