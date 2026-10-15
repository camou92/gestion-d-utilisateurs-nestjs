import { Injectable } from '@nestjs/common';
import { UserRepositoryPort } from '../../application/ports/user.repository.port';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class InMemoryUserRepository implements UserRepositoryPort {
  private readonly users: Map<string, User> = new Map();

  save(user: User) {
    this.users.set(user.getId().getValue(), user);
    return user;
  }

  findById(id: string) {
    return this.users.get(id) || null;
  }

  findByEmail(email: string) {
    const users = Array.from(this.users.values());
    return users.find((user) => user.getEmail().getValue() === email) || null;
  }

  findAll() {
    return Array.from(this.users.values());
  }

  delete(id: string) {
    this.users.delete(id);
  }
}
