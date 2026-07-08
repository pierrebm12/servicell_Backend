import { Module } from '@nestjs/common';
import { PhotographsService } from './photographs.service';
import { PhotographsController } from './photographs.controller';

@Module({
  controllers: [PhotographsController],
  providers: [PhotographsService],
  exports: [PhotographsService],
})
export class PhotographsModule {}
