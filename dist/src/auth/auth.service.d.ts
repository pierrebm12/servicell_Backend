import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: number;
            name: string;
            email: string;
            role: string;
            phone: string | null;
            photoUrl: string | null;
        };
    }>;
    refreshTokens(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: number): Promise<{
        message: string;
    }>;
    requestPasswordReset(email: string): Promise<{
        message: string;
    }>;
    private generateTokens;
    seedTestData(): Promise<{
        message: string;
        clients?: undefined;
        orders?: undefined;
        inventoryItems?: undefined;
    } | {
        message: string;
        clients: {
            email: string | null;
            id: number;
            name: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            document: string;
            address: string | null;
        }[];
        orders: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            orderNumber: string;
            reportedFault: string;
            observations: string | null;
            physicalState: string | null;
            devicePassword: string | null;
            devicePattern: string | null;
            lockCode: string | null;
            lockCodeType: string | null;
            laborCost: number | null;
            clientPhotoUrl: string | null;
            status: import("@prisma/client").$Enums.OrderStatusEnum;
            estimatedCost: number | null;
            finalCost: number | null;
            downPayment: number | null;
            estimatedDate: Date | null;
            deliveredAt: Date | null;
            clientId: number;
            equipmentId: number;
            createdById: number;
            assignedToId: number | null;
            deviceTypeId: number | null;
            brandId: number | null;
            modelId: number | null;
            serviceTypeId: number | null;
        }[];
        inventoryItems: number;
    }>;
}
