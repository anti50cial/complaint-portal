import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintStatusDto } from './dto/update-complaint-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@UseGuards(JwtAuthGuard)
@Controller('complaints')
export class ComplaintsController {
  // eslint-disable-next-line prettier/prettier
  constructor(private readonly complaintsService: ComplaintsService) { }

  /**
   * POST /complaints
   * Student creates a new complaint.
   * Requires: authenticated STUDENT — studentId is taken from the JWT payload.
   */
  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateComplaintDto) {
    const studentId = req.user.id;
    return this.complaintsService.create(studentId, dto);
  }

  /**
   * GET /complaints/mine
   * Student retrieves their own complaints.
   * Requires: authenticated STUDENT.
   */
  @Get('mine')
  findMine(@Req() req: AuthenticatedRequest) {
    const studentId = req.user.id;
    return this.complaintsService.findMine(studentId);
  }

  /**
   * GET /complaints
   * Admin retrieves all complaints (with student info).
   * Requires: authenticated ADMIN.
   */
  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  findAll() {
    return this.complaintsService.findAll();
  }

  /**
   * PATCH /complaints/:id/status
   * Admin updates the status of a specific complaint.
   * Requires: authenticated ADMIN.
   */
  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateComplaintStatusDto) {
    return this.complaintsService.updateStatus(id, dto);
  }

  /**
   * PATCH /complaints/:id/view
   * Admin marks a complaint as viewed.
   */
  @Patch(':id/view')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  markAsViewed(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const adminId = req.user.id;
    return this.complaintsService.markAsViewed(id, adminId);
  }
}
