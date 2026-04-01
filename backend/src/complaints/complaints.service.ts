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
      include: {
        views: {
          include: {
            admin: { select: { name: true, email: true } },
          },
        },
      },
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
        views: {
          include: {
            admin: { select: { name: true, email: true } },
          },
        },
      },
    });
  }

  /** PATCH /complaints/:id/view — Admin marks complaint as viewed */
  async markAsViewed(id: string, adminId: string) {
    const complaint = await this.prisma.complaint.findUnique({ where: { id } });
    if (!complaint) {
      throw new NotFoundException(`Complaint with id "${id}" not found`);
    }

    // Create view record if it doesn't exist
    await this.prisma.complaintView.upsert({
      where: {
        complaintId_adminId: {
          complaintId: id,
          adminId,
        },
      },
      update: {}, // No update needed if already viewed
      create: {
        complaintId: id,
        adminId,
      },
    });

    // Automatically switch status from Pending to Seen
    if (complaint.status === 'Pending') {
      return this.prisma.complaint.update({
        where: { id },
        data: { status: 'Seen' },
        include: {
          views: {
            select: {
              admin: { select: { name: true, email: true } },
            },
          },
          student: {
            select: { name: true, email: true },
          },
        },
      });
    }

    return this.prisma.complaint.findUnique({
      where: { id },
      include: {
        views: {
          include: { admin: { select: { name: true, email: true } } },
        },
        student: {
          select: { name: true, email: true },
        },
      },
    });
  }

  /** PATCH /complaints/:id/status — Admin updates complaint status manually */
  async updateStatus(id: string, dto: UpdateComplaintStatusDto) {
    const complaint = await this.prisma.complaint.findUnique({ where: { id } });
    if (!complaint) {
      throw new NotFoundException(`Complaint with id "${id}" not found`);
    }

    return this.prisma.complaint.update({
      where: { id },
      data: {
        status: dto.status,
        adminComment: dto.adminComment,
      },
    });
  }
}
