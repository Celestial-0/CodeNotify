import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class AppService {
  gethome(): string {
    const htmlPath = join(process.cwd(), 'test', 'ui', 'index.html');
    return readFileSync(htmlPath, 'utf-8');
  }
}
