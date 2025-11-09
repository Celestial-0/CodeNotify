import { Controller, Get, Header } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @Header('Content-Type', 'text/html')
  gethome(): string {
    return this.appService.gethome();
  }
}
