import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, ComplaintsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
