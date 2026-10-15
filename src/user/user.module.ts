import { Module } from "@nestjs/common";
import { USER_REPOSITORY } from "./application/ports/user.repository.port";
import { CreateUserUseCase } from "./application/use-cases/command/create-user.use-case";
import { UserController } from "./presentation/user.controller";
import { GetUserUseCase } from "./application/use-cases/query/get-user.use-case";
import { ListUsersUseCase } from "./application/use-cases/query/list-users.use-case";
import { DeleteUserUseCase } from "./application/use-cases/command/delete-user.use-case";
import { UpdateUserUseCase } from "./application/use-cases/command/update-user.use-case";
import { DrizzleUserRepository } from "./infrastructure/adapters/user.repository";

@Module({
    controllers: [UserController],
    providers: [
        CreateUserUseCase,
        GetUserUseCase,
        ListUsersUseCase,
        DeleteUserUseCase,
        UpdateUserUseCase,
        {
            provide: USER_REPOSITORY,
            useClass: DrizzleUserRepository
        }
    ]
})
export class UserModule {}