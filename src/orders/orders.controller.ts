import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { OrderStatusEnum } from '@prisma/client';
import { IsString, IsOptional } from 'class-validator';

class CreateRepairNoteDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  step?: string;
}

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('stats')
  getStats() {
    return this.ordersService.getStats();
  }

  @Post()
  create(@Body() dto: CreateOrderDto, @CurrentUser('id') userId: number) {
    return this.ordersService.create(dto, userId);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
  ) {
    return this.ordersService.findAll({
      search,
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
      sort,
    });
  }

  @Get('by-status/:status')
  findByStatus(@Param('status') status: OrderStatusEnum) {
    return this.ordersService.findByStatus(status);
  }

  @Get('by-client/:clientId')
  findByClient(@Param('clientId', ParseIntPipe) clientId: number) {
    return this.ordersService.findByClient(clientId);
  }

  @Get('by-technician/:technicianId')
  findByTechnician(@Param('technicianId', ParseIntPipe) technicianId: number) {
    return this.ordersService.findByTechnician(technicianId);
  }

  @Get('number/:orderNumber')
  findByOrderNumber(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findByOrderNumber(orderNumber);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrderDto) {
    return this.ordersService.update(id, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.ordersService.updateStatus(id, dto, userId);
  }

  @Patch(':id/assign')
  assign(
    @Param('id', ParseIntPipe) id: number,
    @Body('technicianId') technicianId: number,
  ) {
    return this.ordersService.update(id, { assignedToId: technicianId });
  }

  @Patch(':id/deactivate')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.remove(id);
  }

  @Post(':id/repair-notes')
  addRepairNote(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateRepairNoteDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.ordersService.addRepairNote(id, dto, userId);
  }

  @Get(':id/repair-notes')
  getRepairNotes(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.getRepairNotes(id);
  }
}
