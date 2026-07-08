import { Role } from '@prisma/client';
export declare class UpdateUserDto {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
    role?: Role;
    photoUrl?: string;
}
