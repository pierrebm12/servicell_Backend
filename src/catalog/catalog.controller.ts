import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CreateDeviceTypeDto, CreateBrandDto, CreateDeviceModelDto, CreateServiceTypeDto } from './dto/create-catalog.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('device-types')
  getDeviceTypes() { return this.catalogService.getDeviceTypes(); }

  @Get('brands')
  getBrands() { return this.catalogService.getBrands(); }

  @Get('models')
  getModels(@Query('deviceTypeId') deviceTypeId?: string, @Query('brandId') brandId?: string) {
    return this.catalogService.getModels(deviceTypeId ? +deviceTypeId : undefined, brandId ? +brandId : undefined);
  }

  @Get('service-types')
  getServiceTypes() { return this.catalogService.getServiceTypes(); }

  @Post('device-types')
  createDeviceType(@Body() dto: CreateDeviceTypeDto) { return this.catalogService.createDeviceType(dto); }

  @Post('brands')
  createBrand(@Body() dto: CreateBrandDto) { return this.catalogService.createBrand(dto); }

  @Post('models')
  createModel(@Body() dto: CreateDeviceModelDto) { return this.catalogService.createModel(dto); }

  @Post('service-types')
  createServiceType(@Body() dto: CreateServiceTypeDto) { return this.catalogService.createServiceType(dto); }
}
