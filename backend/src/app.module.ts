import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { AuthModule } from './auth/auth.module';
import { SuperAdminModule } from './super-admin/super-admin.module';

@Module({
  imports: [PrismaModule, ComplaintsModule, AuthModule, SuperAdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
