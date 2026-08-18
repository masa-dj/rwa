import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, ApprovalStatus } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  //Create
  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepository.create({ ...dto, password: hashed });
    return this.usersRepository.save(user);
  }

  //Read all
  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'status', 'createdAt'],
    });
  }

  //Read by ID
  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'createdAt'],
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  //Update
  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, dto);
    return this.usersRepository.save(user);
  }

  //Delete
  async remove(id: string): Promise<{ message: string }> {
    const user = await this.findById(id);
    await this.usersRepository.remove(user);
    return { message: `User ${id} deleted` };
  }

  //Find by email for login purposes
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  //Update when was the user last seen
  async updateLastSeen(userId: string, date: Date) {
    await this.usersRepository.update(userId, { lastSeenAt: date });
  }

  //FInd students that are present
  async findAllWithPresence(onlineUserIds: string[]) {
    const users = await this.usersRepository.find({
      where: { role: UserRole.STUDENT }, //supervisors only care about students
      select: ['id', 'firstName', 'lastName', 'email', 'lastSeenAt'],
    });

    return users.map((u) => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      status: onlineUserIds.includes(u.id) ? 'active' : 'offline',
      lastSeenAt: u.lastSeenAt,
    }));
  }

  async registerStudent(dto: RegisterUserDto): Promise<User> {
    const existing = await this.usersRepository.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepository.create({
      ...dto,
      password: hashed,
      role: UserRole.STUDENT,
      status: ApprovalStatus.PENDING,
    });
    return this.usersRepository.save(user);
  }

  async updateStatus(id: string, status: ApprovalStatus): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    user.status = status;
    return this.usersRepository.save(user);
  }
}