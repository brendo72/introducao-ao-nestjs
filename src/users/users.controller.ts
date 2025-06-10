import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { Userservice } from './users.service';
import { User } from '@prisma/client';

@Controller('users')
export class UsersController {
constructor(private readonly usersService: Userservice) {}

@Post('create')
create(@Body() data: any) {
   return this.usersService.create(data);
}}