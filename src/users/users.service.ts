import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class Userservice {
constructor(private prisma: PrismaService) {}

async create(data: Prisma.UserCreateInput): Promise<User> {
   return this.prisma.user.create({ data });
}}