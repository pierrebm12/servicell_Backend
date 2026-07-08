import { Controller, Get, Post, Body, Delete, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PhotographsService } from './photographs.service';
import { CreatePhotographDto } from './dto/create-photograph.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('photographs')
export class PhotographsController {
  constructor(private readonly photographsService: PhotographsService) {}

  @Post()
  create(@Body() dto: CreatePhotographDto) {
    return this.photographsService.create(dto);
  }

  @Get('order/:orderId')
  findByOrder(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.photographsService.findByOrder(orderId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.photographsService.remove(id);
  }
}
