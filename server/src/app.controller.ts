import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  gethome(): string {
    return this.appService.gethome();
  }

  @Public()
  @Get('health')
  health() {
    return this.appService.health();
  }
}
