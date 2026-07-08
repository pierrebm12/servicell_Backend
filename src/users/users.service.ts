import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const roleMap: Record<string, string> = { ADMIN: 'admin', TECNICO: 'tech', RECEPCION: 'receptionist' };
const mapRole = (r: string) => roleMap[r] || r.toLowerCase();

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { ...dto, password: hashed },
      select: { id: true, name: true, email: true, role: true, phone: true, photoUrl: true, isActive: true, createdAt: true },
    });
    return { ...user, role: mapRole(user.role) };
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, phone: true, photoUrl: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return users.map((u) => ({ ...u, role: mapRole(u.role) }));
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, phone: true, photoUrl: true, isActive: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return { ...user, role: mapRole(user.role) };
  }

  async update(id: number, dto: UpdateUserDto) {
    await this.findOne(id);
    if (dto.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (existing && existing.id !== id) throw new ConflictException('Email already in use');
    }
    const data: any = { ...dto };
    if (dto.password) data.password = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, phone: true, photoUrl: true, isActive: true },
    });
    return { ...user, role: mapRole(user.role) };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.user.update({ where: { id }, data: { isActive: false } });
    return { message: 'User deactivated' };
  }
}
