import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';

@Controller('versions')
export class VersionsController {
  @Public()
  @Get('latest')
  getLatest() {
    return {
      latestVersionCode: Number(process.env.LATEST_VERSION_CODE) || 1,
      latestVersion: process.env.LATEST_VERSION_NAME || '1.0.0',
      apkUrl: process.env.APK_URL || '',
      forceUpdate: process.env.FORCE_UPDATE === 'true',
      updateMessage: process.env.UPDATE_MESSAGE || '',
    };
  }
}
