import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';

type Tx = Prisma.TransactionClient;

@Injectable()
export class ProfileNumberService {
  constructor(private prisma: PrismaService) {}

  private formatDoctorNumber(value: bigint | number | string): string {
    const n = typeof value === 'bigint' ? Number(value) : Number(value);
    return `DOC-${String(n).padStart(4, '0')}`;
  }

  private formatPatientNumber(value: bigint | number | string): string {
    const n = typeof value === 'bigint' ? Number(value) : Number(value);
    return `PT-${String(n).padStart(4, '0')}`;
  }

  async allocateDoctorNumber(tx?: Tx): Promise<string> {
    const client = tx ?? this.prisma;
    const rows = await client.$queryRaw<[{ nextval: bigint }]>`SELECT nextval('doctor_profile_number_seq')`;
    return this.formatDoctorNumber(rows[0]?.nextval ?? 1001);
  }

  async allocatePatientNumber(tx?: Tx): Promise<string> {
    const client = tx ?? this.prisma;
    const rows = await client.$queryRaw<[{ nextval: bigint }]>`SELECT nextval('patient_profile_number_seq')`;
    return this.formatPatientNumber(rows[0]?.nextval ?? 1001);
  }

  async ensureDoctorNumber(doctorProfileId: string, tx?: Tx): Promise<string> {
    const client = tx ?? this.prisma;
    const existing = await client.doctorProfile.findUnique({
      where: { id: doctorProfileId },
      select: { doctorNumber: true },
    });
    if (existing?.doctorNumber) return existing.doctorNumber;

    const doctorNumber = await this.allocateDoctorNumber(client);
    await client.doctorProfile.update({
      where: { id: doctorProfileId },
      data: { doctorNumber },
    });
    return doctorNumber;
  }

  async ensurePatientNumber(patientProfileId: string, tx?: Tx): Promise<string> {
    const client = tx ?? this.prisma;
    const existing = await client.patientProfile.findUnique({
      where: { id: patientProfileId },
      select: { patientNumber: true },
    });
    if (existing?.patientNumber) return existing.patientNumber;

    const patientNumber = await this.allocatePatientNumber(client);
    await client.patientProfile.update({
      where: { id: patientProfileId },
      data: { patientNumber },
    });
    return patientNumber;
  }
}
