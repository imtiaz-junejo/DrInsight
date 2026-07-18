import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrescriptionStatus, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const prescriptionInclude = {
  appointment: true,
  doctor: { include: { user: true } },
  patient: { include: { user: true } },
} as const;

type ListQuery = {
  search?: string;
  status?: PrescriptionStatus;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'patient';
};

type MedicineItem = {
  medication?: string;
  name?: string;
  strength?: string;
  dosage?: string;
  frequency?: string;
  route?: string;
  duration?: string;
  food?: string;
  instructions?: string;
  quantity?: string;
  refill?: string;
};

type IssuePayload = {
  appointmentId?: string;
  diagnosis?: string;
  items: MedicineItem[];
  notes?: string;
  extendedData?: Record<string, unknown>;
  followUpDate?: string;
  digitalSignature?: string;
  status?: PrescriptionStatus;
};

@Injectable()
export class PrescriptionsService {
  constructor(private prisma: PrismaService) {}

  private async getDoctor(userId: string) {
    const doctor = await this.prisma.doctorProfile.findUnique({ where: { userId } });
    if (!doctor) throw new ForbiddenException();
    return doctor;
  }

  private generateRxNumber() {
    const n = Math.floor(100000 + Math.random() * 900000);
    return `RX-${n}`;
  }

  private generateVerifyId() {
    return `VFY-${Date.now().toString(36).toUpperCase()}`;
  }

  private normalizeItems(items: MedicineItem[]) {
    return items.map((item) => ({
      medication: item.medication ?? item.name ?? 'Medication',
      strength: item.strength ?? '',
      dosage: item.dosage ?? '',
      frequency: item.frequency ?? '',
      route: item.route ?? 'Oral',
      duration: item.duration ?? '',
      food: item.food ?? '',
      instructions: item.instructions ?? '',
      quantity: item.quantity ?? '',
      refill: item.refill ?? '',
    }));
  }

  private async resolveAppointmentForPrescription(
    doctorId: string,
    patientId: string,
    appointmentId?: string,
  ) {
    if (appointmentId) {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { prescription: true },
      });
      if (!appointment || appointment.doctorId !== doctorId || appointment.patientId !== patientId) {
        throw new ForbiddenException('Invalid appointment for this patient');
      }
      return appointment;
    }

    const withoutPrescription = await this.prisma.appointment.findFirst({
      where: { doctorId, patientId, prescription: null },
      orderBy: { scheduledAt: 'desc' },
      include: { prescription: true },
    });
    if (withoutPrescription) return withoutPrescription;

    const latest = await this.prisma.appointment.findFirst({
      where: { doctorId, patientId },
      orderBy: { scheduledAt: 'desc' },
      include: { prescription: true },
    });
    if (!latest) {
      throw new BadRequestException('No consultation appointment found for this patient');
    }
    return latest;
  }

  private buildPrescriptionData(
    data: IssuePayload,
    items: ReturnType<PrescriptionsService['normalizeItems']>,
    status: PrescriptionStatus,
  ) {
    const now = new Date();
    return {
      diagnosis: data.diagnosis,
      items,
      notes: data.notes,
      extendedData: data.extendedData as Prisma.InputJsonValue | undefined,
      followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
      digitalSignature: data.digitalSignature ?? null,
      status,
      issuedAt:
        status === PrescriptionStatus.ISSUED || status === PrescriptionStatus.PENDING_REVIEW
          ? now
          : null,
    };
  }

  async create(doctorUserId: string, data: IssuePayload & { appointmentId: string }) {
    const doctor = await this.getDoctor(doctorUserId);
    const appointment = await this.prisma.appointment.findUnique({ where: { id: data.appointmentId } });
    if (!appointment || appointment.doctorId !== doctor.id) throw new ForbiddenException();

    const existing = await this.prisma.prescription.findUnique({
      where: { appointmentId: data.appointmentId },
    });
    if (existing) {
      if (existing.doctorId !== doctor.id) throw new ForbiddenException();
      return this.updateExisting(doctorUserId, existing.id, data);
    }

    const items = this.normalizeItems(data.items ?? []);
    if (!items.length) throw new BadRequestException('At least one medication is required');

    const status = data.status ?? PrescriptionStatus.ISSUED;
    const rxData = this.buildPrescriptionData(data, items, status);

    return this.prisma.prescription.create({
      data: {
        appointmentId: data.appointmentId,
        doctorId: doctor.id,
        patientId: appointment.patientId,
        diagnosis: rxData.diagnosis,
        items: rxData.items,
        notes: rxData.notes,
        extendedData: rxData.extendedData,
        followUpDate: rxData.followUpDate,
        digitalSignature: rxData.digitalSignature,
        status,
        prescriptionNumber: this.generateRxNumber(),
        verifyId: this.generateVerifyId(),
        issuedAt: rxData.issuedAt,
      },
      include: prescriptionInclude,
    });
  }

  private async updateExisting(doctorUserId: string, prescriptionId: string, data: IssuePayload) {
    const doctor = await this.getDoctor(doctorUserId);
    const existing = await this.prisma.prescription.findUnique({ where: { id: prescriptionId } });
    if (!existing || existing.doctorId !== doctor.id) throw new ForbiddenException();

    const items = this.normalizeItems(data.items ?? []);
    if (!items.length) throw new BadRequestException('At least one medication is required');

    const status = data.status ?? PrescriptionStatus.PENDING_REVIEW;
    const rxData = this.buildPrescriptionData(data, items, status);

    return this.prisma.prescription.update({
      where: { id: prescriptionId },
      data: {
        diagnosis: rxData.diagnosis,
        items: rxData.items,
        notes: rxData.notes,
        extendedData: rxData.extendedData,
        followUpDate: rxData.followUpDate,
        digitalSignature: rxData.digitalSignature,
        status,
        issuedAt: rxData.issuedAt ?? existing.issuedAt,
        prescriptionNumber: existing.prescriptionNumber ?? this.generateRxNumber(),
        verifyId: existing.verifyId ?? this.generateVerifyId(),
      },
      include: prescriptionInclude,
    });
  }

  private async assertDoctorOwnsPrescription(doctorUserId: string, prescriptionId: string) {
    const doctor = await this.getDoctor(doctorUserId);
    const prescription = await this.prisma.prescription.findUnique({ where: { id: prescriptionId } });
    if (!prescription) throw new NotFoundException('Prescription not found');
    if (prescription.doctorId !== doctor.id) throw new ForbiddenException();
    return { doctor, prescription };
  }

  async getDoctorStats(doctorUserId: string) {
    const doctor = await this.getDoctor(doctorUserId);
    const [total, issued, pending, draft] = await Promise.all([
      this.prisma.prescription.count({ where: { doctorId: doctor.id } }),
      this.prisma.prescription.count({ where: { doctorId: doctor.id, status: PrescriptionStatus.ISSUED } }),
      this.prisma.prescription.count({
        where: { doctorId: doctor.id, status: PrescriptionStatus.PENDING_REVIEW },
      }),
      this.prisma.prescription.count({ where: { doctorId: doctor.id, status: PrescriptionStatus.DRAFT } }),
    ]);
    return { total, issued, pending, draft };
  }

  async findForDoctorList(doctorUserId: string, query: ListQuery) {
    const doctor = await this.getDoctor(doctorUserId);
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: Prisma.PrescriptionWhereInput = {
      doctorId: doctor.id,
      ...(query.status && { status: query.status }),
    };

    if (query.search?.trim()) {
      const term = query.search.trim();
      where.OR = [
        { prescriptionNumber: { contains: term, mode: 'insensitive' } },
        { diagnosis: { contains: term, mode: 'insensitive' } },
        {
          patient: {
            user: {
              OR: [
                { firstName: { contains: term, mode: 'insensitive' } },
                { lastName: { contains: term, mode: 'insensitive' } },
              ],
            },
          },
        },
      ];
    }

    const orderBy: Prisma.PrescriptionOrderByWithRelationInput[] =
      query.sort === 'oldest'
        ? [{ createdAt: 'asc' }]
        : query.sort === 'patient'
          ? [{ patient: { user: { lastName: 'asc' } } }, { createdAt: 'desc' }]
          : [{ createdAt: 'desc' }];

    const [data, total] = await Promise.all([
      this.prisma.prescription.findMany({
        where,
        include: prescriptionInclude,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.prescription.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async updatePrescription(doctorUserId: string, prescriptionId: string, data: IssuePayload) {
    const { prescription } = await this.assertDoctorOwnsPrescription(doctorUserId, prescriptionId);
    const items = data.items ? this.normalizeItems(data.items) : undefined;
    if (items && !items.length) {
      throw new BadRequestException('At least one medication is required');
    }

    const status = data.status ?? prescription.status;
    const rxData = items
      ? this.buildPrescriptionData({ ...data, items: data.items ?? [] }, items, status)
      : null;

    return this.prisma.prescription.update({
      where: { id: prescriptionId },
      data: {
        ...(data.diagnosis !== undefined && { diagnosis: data.diagnosis }),
        ...(items && { items }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.extendedData !== undefined && {
          extendedData: data.extendedData as Prisma.InputJsonValue,
        }),
        ...(data.followUpDate !== undefined && {
          followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
        }),
        ...(data.digitalSignature !== undefined && { digitalSignature: data.digitalSignature }),
        ...(data.status && { status: data.status }),
        ...(rxData?.issuedAt && { issuedAt: rxData.issuedAt }),
      },
      include: prescriptionInclude,
    });
  }

  async deletePrescription(doctorUserId: string, prescriptionId: string) {
    await this.assertDoctorOwnsPrescription(doctorUserId, prescriptionId);
    await this.prisma.prescription.delete({ where: { id: prescriptionId } });
    return { success: true };
  }

  async duplicatePrescription(doctorUserId: string, prescriptionId: string) {
    const { doctor, prescription } = await this.assertDoctorOwnsPrescription(doctorUserId, prescriptionId);
    const draftData = {
      sourcePrescriptionId: prescription.id,
      diagnosis: prescription.diagnosis,
      items: prescription.items,
      notes: prescription.notes,
      extendedData: prescription.extendedData,
      followUpDate: prescription.followUpDate,
      digitalSignature: prescription.digitalSignature,
      appointmentId: prescription.appointmentId,
    };

    return this.prisma.prescriptionDraft.upsert({
      where: { doctorId_patientId: { doctorId: doctor.id, patientId: prescription.patientId } },
      create: {
        doctorId: doctor.id,
        patientId: prescription.patientId,
        appointmentId: prescription.appointmentId,
        data: draftData as Prisma.InputJsonValue,
      },
      update: {
        appointmentId: prescription.appointmentId,
        data: draftData as Prisma.InputJsonValue,
      },
    });
  }

  async markCompleted(doctorUserId: string, prescriptionId: string) {
    const { prescription } = await this.assertDoctorOwnsPrescription(doctorUserId, prescriptionId);
    return this.prisma.prescription.update({
      where: { id: prescription.id },
      data: {
        status: PrescriptionStatus.ISSUED,
        issuedAt: prescription.issuedAt ?? new Date(),
      },
      include: prescriptionInclude,
    });
  }

  async getDraft(doctorUserId: string, patientId: string) {
    const doctor = await this.getDoctor(doctorUserId);
    const linked = await this.prisma.appointment.findFirst({ where: { doctorId: doctor.id, patientId } });
    if (!linked) throw new ForbiddenException('Patient not linked to this doctor');

    return this.prisma.prescriptionDraft.findUnique({
      where: { doctorId_patientId: { doctorId: doctor.id, patientId } },
    });
  }

  async saveDraft(
    doctorUserId: string,
    patientId: string,
    data: { appointmentId?: string; data: Record<string, unknown> },
  ) {
    const doctor = await this.getDoctor(doctorUserId);
    const appointment = await this.resolveAppointmentForPrescription(
      doctor.id,
      patientId,
      data.appointmentId,
    );

    return this.prisma.prescriptionDraft.upsert({
      where: { doctorId_patientId: { doctorId: doctor.id, patientId } },
      create: {
        doctorId: doctor.id,
        patientId,
        appointmentId: appointment.id,
        data: data.data as Prisma.InputJsonValue,
      },
      update: {
        appointmentId: appointment.id,
        data: data.data as Prisma.InputJsonValue,
      },
    });
  }

  async issueFromDraft(doctorUserId: string, patientId: string, body: IssuePayload) {
    const doctor = await this.getDoctor(doctorUserId);
    const appointment = await this.resolveAppointmentForPrescription(
      doctor.id,
      patientId,
      body.appointmentId,
    );

    if (!body.diagnosis?.trim()) {
      throw new BadRequestException('Provisional diagnosis is required');
    }

    const items = this.normalizeItems(body.items ?? []);
    if (!items.length) {
      throw new BadRequestException('At least one medication is required');
    }

    let prescription;
    const existing = await this.prisma.prescription.findUnique({
      where: { appointmentId: appointment.id },
    });

    if (existing && existing.doctorId === doctor.id) {
      prescription = await this.updateExisting(doctorUserId, existing.id, body);
    } else {
      prescription = await this.create(doctorUserId, {
        ...body,
        appointmentId: appointment.id,
        status: body.status ?? PrescriptionStatus.PENDING_REVIEW,
      });
    }

    await this.prisma.prescriptionDraft.deleteMany({
      where: { doctorId: doctor.id, patientId },
    });

    return prescription;
  }

  async findForUser(userId: string, role: UserRole, patientId?: string) {
    if (role === UserRole.ADMIN) {
      return this.prisma.prescription.findMany({
        where: patientId ? { patientId } : undefined,
        include: {
          appointment: true,
          doctor: { include: { user: true } },
          patient: { include: { user: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    }

    if (role === UserRole.DOCTOR) {
      const doctor = await this.prisma.doctorProfile.findUnique({ where: { userId } });
      if (!doctor) return [];
      return this.prisma.prescription.findMany({
        where: {
          doctorId: doctor.id,
          ...(patientId && { patientId }),
        },
        include: { appointment: true, patient: { include: { user: true } } },
        orderBy: { createdAt: 'desc' },
      });
    }

    const patient = await this.prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) return [];
    return this.prisma.prescription.findMany({
      where: { patientId: patient.id },
      include: { appointment: true, doctor: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, role: UserRole, id: string) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        appointment: true,
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
    });
    if (!prescription) throw new NotFoundException('Prescription not found');

    if (role === UserRole.ADMIN) return prescription;

    if (role === UserRole.DOCTOR) {
      const doctor = await this.prisma.doctorProfile.findUnique({ where: { userId } });
      if (!doctor || prescription.doctorId !== doctor.id) throw new ForbiddenException();
      return prescription;
    }

    const patient = await this.prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient || prescription.patientId !== patient.id) throw new ForbiddenException();
    return prescription;
  }
}
