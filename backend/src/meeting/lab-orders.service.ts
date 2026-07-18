import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { LabOrderPriority, LabOrderStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MeetingService } from './meeting.service';
import { CreateLabOrderDto } from './dto/meeting.dto';

@Injectable()
export class LabOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly meetingService: MeetingService,
  ) {}

  async create(doctorUserId: string, dto: CreateLabOrderDto) {
    await this.meetingService.assertMeetingAccess(dto.appointmentId, doctorUserId, UserRole.DOCTOR, {
      requireDoctor: true,
      allowEnded: true,
    });

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: dto.appointmentId },
      include: { doctor: true, patient: { include: { user: true } } },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    if (appointment.doctor.userId !== doctorUserId) throw new ForbiddenException();

    const order = await this.prisma.labOrder.create({
      data: {
        appointmentId: dto.appointmentId,
        doctorId: appointment.doctorId,
        patientId: appointment.patientId,
        tests: dto.tests as object,
        instructions: dto.instructions,
        priority: dto.priority ?? LabOrderPriority.ROUTINE,
        status: LabOrderStatus.ORDERED,
      },
      include: {
        doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
        patient: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    });

    await this.notifications.create(appointment.patient.user.id, {
      type: 'LAB_ORDER',
      title: 'Lab Order Received',
      body: 'Your doctor has ordered lab tests during your consultation.',
      data: { appointmentId: dto.appointmentId, labOrderId: order.id },
    });

    return order;
  }

  async listForAppointment(appointmentId: string, userId: string, role: UserRole) {
    await this.meetingService.assertMeetingAccess(appointmentId, userId, role, { allowEnded: true });
    return this.prisma.labOrder.findMany({
      where: { appointmentId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
