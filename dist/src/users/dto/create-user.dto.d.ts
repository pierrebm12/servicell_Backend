import { Role } from '@prisma/client';
export declare class CreateUserDto {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: Role;
    photoUrl?: string;
}
