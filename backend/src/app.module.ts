import { Module } from '@nestjs/common';
import { ServisModule } from './servis/servis.module.js';

@Module({
  imports: [ServisModule],
})
export class AppModule {}
