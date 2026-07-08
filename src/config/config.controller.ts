import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ConfigService } from './config.service';
import { UpdateConfigDto } from './dto/update-config.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Public()
  @Get()
  get() {
    return this.configService.get();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch()
  update(@Body() dto: UpdateConfigDto) {
    return this.configService.update(dto);
  }
}
