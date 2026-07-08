import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { CreateMovementDto } from './dto/create-movement.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  create(@Body() dto: CreateInventoryItemDto) {
    return this.inventoryService.create(dto);
  }

  @Get()
  findAll(@Query('category') category?: string, @Query('search') search?: string, @Query('availableOnly') availableOnly?: string) {
    return this.inventoryService.findAll(category, search, availableOnly);
  }

  @Get('low-stock')
  getLowStock() {
    return this.inventoryService.getLowStock();
  }

  @Get('alerts')
  getAlerts() {
    return this.inventoryService.getAlerts();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInventoryItemDto) {
    return this.inventoryService.update(id, dto);
  }

  @Patch(':id/deactivate')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.remove(id);
  }

  @Post('movements')
  createMovement(@Body() dto: CreateMovementDto, @CurrentUser('id') userId: number) {
    return this.inventoryService.createMovement(dto, userId);
  }

  @Get('movements/:itemId')
  getMovements(@Param('itemId', ParseIntPipe) itemId: number) {
    return this.inventoryService.getMovements(itemId);
  }
}
