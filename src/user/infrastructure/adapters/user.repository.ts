
import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { UserRepositoryPort } from '../../application/ports/user.repository.port';
import { User } from '../../domain/entities/user.entity';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { Email } from '../../domain/value-objects/email.vo';

import { db } from '../../../infrastructure/database/client';
import { users } from '../../../infrastructure/database/schema';

@Injectable()
export class DrizzleUserRepository implements UserRepositoryPort {
  async save(user: User): Promise<User> {
    const id = user.getId().getValue();

    await db
      .insert(users)
      .values({
        id,
        name: user.getName(),
        email: user.getEmail().getValue(),
        createdAt: user.getCreatedAt(),
        updatedAt: user.getUpdatedAt(),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          name: user.getName(),
          email: user.getEmail().getValue(),
          updatedAt: user.getUpdatedAt(),
        },
      });

    return user;
  }

  async findById(id: string): Promise<User | null> {
    const record = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    return record ? this.toDomain(record) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    return record ? this.toDomain(record) : null;
  }

  async findAll(): Promise<User[]> {
    const records = await db.query.users.findMany();

    return records.map((record) => this.toDomain(record));
  }

  async delete(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  private toDomain(record: typeof users.$inferSelect): User {
    return new User(
      new UserId(record.id),
      record.name,
      new Email(record.email),
      record.createdAt,
      record.updatedAt,
    );
  }
}