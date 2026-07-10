import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';

@Controller('versions')
export class VersionsController {
  @Public()
  @Get('latest')
  getLatest() {
    return {
      latestVersionCode: 1,
      latestVersion: '1.0.0',
      apkUrl: '',
      forceUpdate: false,
      updateMessage: '',
    };
  }
}
