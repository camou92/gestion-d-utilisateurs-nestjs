import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  CreateUserDto,
  CreateUserUseCase,
} from '../application/use-cases/command/create-user.use-case';
import { User } from '../domain/entities/user.entity';
import { GetUserUseCase } from '../application/use-cases/query/get-user.use-case';
import { ListUsersUseCase } from '../application/use-cases/query/list-users.use-case';
import { DeleteUserUseCase } from '../application/use-cases/command/delete-user.use-case';
import {
  UpdateUserDto,
  UpdateUserUseCase,
} from '../application/use-cases/command/update-user.use-case';

@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
  ) {}

  @Post()
  async createUser(@Body() request: CreateUserDto) {
    const user = await this.createUserUseCase.execute(request);
    return this.mapUserToResponse(user);
  }

  @Get(':id')
  async getUser(@Param('id', new ParseUUIDPipe()) id: string) {
    const user = await this.getUserUseCase.execute(id);
    return this.mapUserToResponse(user);
  }

  @Get()
  async listUsers() {
    const users = await this.listUsersUseCase.execute();
    return users.map((user) => this.mapUserToResponse(user));
  }

  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    const user = await this.updateUserUseCase.execute(id, body);
    return this.mapUserToResponse(user);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    await this.deleteUserUseCase.execute(id);
  }

  private mapUserToResponse(user: User) {
    return {
      id: user.getId().getValue(),
      name: user.getName(),
      email: user.getEmail().getValue(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
      accountAge: user.getAccountAge(),
    };
  }
}
