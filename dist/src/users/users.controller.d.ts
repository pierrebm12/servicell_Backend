import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(dto: CreateUserDto): Promise<{
        role: string;
        email: string;
        id: number;
        name: string;
        phone: string | null;
        isActive: boolean;
        photoUrl: string | null;
        createdAt: Date;
    }>;
    findAll(): Promise<{
        role: string;
        email: string;
        id: number;
        name: string;
        phone: string | null;
        isActive: boolean;
        photoUrl: string | null;
        createdAt: Date;
    }[]>;
    findOne(id: number): Promise<{
        role: string;
        email: string;
        id: number;
        name: string;
        phone: string | null;
        isActive: boolean;
        photoUrl: string | null;
        createdAt: Date;
    }>;
    update(id: number, dto: UpdateUserDto): Promise<{
        role: string;
        email: string;
        id: number;
        name: string;
        phone: string | null;
        isActive: boolean;
        photoUrl: string | null;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
