import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintStatusDto } from './dto/update-complaint-status.dto';

@Injectable()
export class ComplaintsService {
  // eslint-disable-next-line prettier/prettier
  constructor(private readonly prisma: PrismaService) { }

  /** POST /complaints — Student creates a new complaint */
  async create(studentId: string, dto: CreateComplaintDto) {
    return this.prisma.complaint.create({
      data: {
        title: dto.title,
        description: dto.description,
        studentId,
      },
    });
  }

  /** GET /complaints/mine — Student retrieves their own complaints */
  async findMine(studentId: string) {
    return this.prisma.complaint.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** GET /complaints — Admin retrieves all complaints */
  async findAll() {
    return this.prisma.complaint.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          select: { id: true, email: true, name: true, role: true },
        },
      },
    });
  }

  /** PATCH /complaints/:id/status — Admin updates complaint status */
  async updateStatus(id: string, dto: UpdateComplaintStatusDto) {
    const complaint = await this.prisma.complaint.findUnique({ where: { id } });
    if (!complaint) {
      throw new NotFoundException(`Complaint with id "${id}" not found`);
    }

    return this.prisma.complaint.update({
      where: { id },
      data: {
        status: dto.status,
        adminComment: dto.adminComment
      },
    });
  }
}
