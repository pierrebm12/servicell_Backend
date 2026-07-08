import { DiagnosticsService } from './diagnostics.service';
import { CreateDiagnosticDto } from './dto/create-diagnostic.dto';
export declare class DiagnosticsController {
    private readonly diagnosticsService;
    constructor(diagnosticsService: DiagnosticsService);
    create(dto: CreateDiagnosticDto, userId: number): Promise<{
        user: {
            email: string;
            password: string;
            id: number;
            name: string;
            phone: string | null;
            role: import("@prisma/client").$Enums.Role;
            isActive: boolean;
            photoUrl: string | null;
            refreshToken: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: number;
        createdAt: Date;
        estimatedCost: number | null;
        orderId: number;
        userId: number;
        approved: boolean;
        diagnosis: string;
        neededParts: string | null;
        estimatedTime: string | null;
        approvedAt: Date | null;
    }>;
    findByOrder(orderId: number): Promise<({
        user: {
            email: string;
            password: string;
            id: number;
            name: string;
            phone: string | null;
            role: import("@prisma/client").$Enums.Role;
            isActive: boolean;
            photoUrl: string | null;
            refreshToken: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: number;
        createdAt: Date;
        estimatedCost: number | null;
        orderId: number;
        userId: number;
        approved: boolean;
        diagnosis: string;
        neededParts: string | null;
        estimatedTime: string | null;
        approvedAt: Date | null;
    })[]>;
    approve(id: number): Promise<{
        id: number;
        createdAt: Date;
        estimatedCost: number | null;
        orderId: number;
        userId: number;
        approved: boolean;
        diagnosis: string;
        neededParts: string | null;
        estimatedTime: string | null;
        approvedAt: Date | null;
    }>;
}
