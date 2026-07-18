import {

  BadRequestException,

  ForbiddenException,

  Injectable,

  NotFoundException,

} from '@nestjs/common';

import {

  ClinicalNoteAuthorType,

  ClinicalNotePriority,

  NotificationType,

  PatientAlertSeverity,

  PatientAlertStatus,

  Prisma,

  UserRole,

  UserStatus,

} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { NotificationsService } from '../notifications/notifications.service';



const NOTE_INCLUDE = {

  doctor: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },

  patient: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },

  author: { select: { id: true, firstName: true, lastName: true, role: true } },

  appointment: { select: { id: true, scheduledAt: true, status: true, consultationType: true } },

} satisfies Prisma.PatientClinicalNoteInclude;



type NoteListQuery = {

  page?: number;

  limit?: number;

  search?: string;

  category?: string;

  priority?: ClinicalNotePriority;

  authorType?: ClinicalNoteAuthorType;

  appointmentId?: string;

  readStatus?: 'read' | 'unread';

  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'priority';

  sortOrder?: 'asc' | 'desc';

};



@Injectable()

export class ClinicalRecordsService {

  constructor(

    private prisma: PrismaService,

    private notificationsService: NotificationsService,

  ) {}



  private async getDoctorForUser(userId: string) {

    const doctor = await this.prisma.doctorProfile.findUnique({ where: { userId } });

    if (!doctor) throw new ForbiddenException('Doctor profile not found');

    return doctor;

  }



  private async getPatientForUser(userId: string) {

    const patient = await this.prisma.patientProfile.findUnique({

      where: { userId },

      include: { user: { select: { id: true, firstName: true, lastName: true } } },

    });

    if (!patient) throw new ForbiddenException('Patient profile not found');

    return patient;

  }



  private async assertPatientRelationship(doctorId: string, patientId: string) {

    const appointment = await this.prisma.appointment.findFirst({

      where: { doctorId, patientId },

    });

    if (!appointment) throw new ForbiddenException('Patient not linked to this doctor');

    return appointment;

  }



  private async resolveLatestAppointmentId(doctorId: string, patientId: string) {

    const appointment = await this.prisma.appointment.findFirst({

      where: { doctorId, patientId },

      orderBy: { scheduledAt: 'desc' },

      select: { id: true },

    });

    return appointment?.id ?? null;

  }



  private stripHtml(html: string) {

    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  }



  private previewText(note: { clinicalNotes: string; followUpNotes?: string | null }) {

    const text = [this.stripHtml(note.clinicalNotes), note.followUpNotes?.trim()]

      .filter(Boolean)

      .join(' ');

    return text.length > 160 ? `${text.slice(0, 157)}...` : text;

  }



  private buildSort(

    sortBy?: NoteListQuery['sortBy'],

    sortOrder?: NoteListQuery['sortOrder'],

  ): Prisma.PatientClinicalNoteOrderByWithRelationInput {

    const order = sortOrder ?? 'desc';

    switch (sortBy) {

      case 'title':

        return { title: order };

      case 'updatedAt':

        return { updatedAt: order };

      case 'priority':

        return { priority: order };

      default:

        return { createdAt: order };

    }

  }



  private mapNoteForDoctor(note: Prisma.PatientClinicalNoteGetPayload<{ include: typeof NOTE_INCLUDE }>) {

    const isUnread =

      note.authorType === ClinicalNoteAuthorType.PATIENT ? !note.doctorReadAt : false;

    return {

      ...note,

      preview: this.previewText(note),

      isUnread,

      readStatus: isUnread ? 'Unread' : 'Read',

    };

  }



  private mapNoteForPatient(note: Prisma.PatientClinicalNoteGetPayload<{ include: typeof NOTE_INCLUDE }>) {

    const { privateNotes: _private, ...rest } = note;

    const isUnread =

      note.authorType === ClinicalNoteAuthorType.DOCTOR ? !note.patientReadAt : false;

    return {

      ...rest,

      privateNotes: undefined,

      preview: this.previewText(note),

      isUnread,

      readStatus: isUnread ? 'Unread' : 'Read',

    };

  }



  private async notifyNoteCreated(

    note: Prisma.PatientClinicalNoteGetPayload<{ include: typeof NOTE_INCLUDE }>,

  ) {

    if (note.authorType === ClinicalNoteAuthorType.DOCTOR) {

      const doctorName = `Dr. ${note.doctor.user.firstName} ${note.doctor.user.lastName}`.trim();

      await this.notificationsService.create(note.patient.user.id, {

        type: NotificationType.CLINICAL_NOTE,

        title: 'New consultation note',

        body: `${doctorName} has added a new note to your consultation.`,

        data: {

          noteId: note.id,

          appointmentId: note.appointmentId,

          patientId: note.patientId,

          doctorId: note.doctorId,

        },

      });

      return;

    }



    const patientName = `${note.patient.user.firstName} ${note.patient.user.lastName}`.trim();

    await this.notificationsService.create(note.doctor.user.id, {

      type: NotificationType.CLINICAL_NOTE,

      title: 'New patient note',

      body: `${patientName} has added a new note regarding your consultation.`,

      data: {

        noteId: note.id,

        appointmentId: note.appointmentId,

        patientId: note.patientId,

        doctorId: note.doctorId,

      },

    });

  }



  async getPatientDetail(doctorUserId: string, patientId: string) {

    const doctor = await this.getDoctorForUser(doctorUserId);

    await this.assertPatientRelationship(doctor.id, patientId);



    const patient = await this.prisma.patientProfile.findUnique({

      where: { id: patientId },

      include: {

        user: {

          select: {

            id: true,

            firstName: true,

            lastName: true,

            email: true,

            phone: true,

            avatarUrl: true,

            createdAt: true,

          },

        },

        prescriptions: {

          where: { doctorId: doctor.id },

          orderBy: { createdAt: 'desc' },

          take: 10,

        },

        criticalAlerts: {

          where: { doctorId: doctor.id, status: PatientAlertStatus.ACTIVE },

          orderBy: { createdAt: 'desc' },

          take: 1,

        },

      },

    });

    if (!patient) throw new NotFoundException('Patient not found');



    const appointments = await this.prisma.appointment.findMany({

      where: { doctorId: doctor.id, patientId },

      orderBy: { scheduledAt: 'desc' },

      take: 10,

      include: { prescription: true },

    });



    const notes = await this.prisma.patientClinicalNote.findMany({

      where: { doctorId: doctor.id, patientId, isDraft: false },

      orderBy: { createdAt: 'desc' },

      take: 5,

      include: NOTE_INCLUDE,

    });



    const activeAlert = patient.criticalAlerts[0] ?? null;

    const latestAppt = appointments[0] ?? null;



    return {

      patientId: patient.id,

      patientNumber: patient.patientNumber,

      user: patient.user,

      dateOfBirth: patient.dateOfBirth,

      gender: patient.gender,

      bloodGroup: patient.bloodGroup,

      allergies: patient.allergies,

      medicalHistory: patient.medicalHistory,

      emergencyContact: patient.emergencyContact,

      memberSince: patient.user.createdAt,

      status: activeAlert

        ? activeAlert.severity === PatientAlertSeverity.CRITICAL

          ? 'Critical'

          : activeAlert.severity === PatientAlertSeverity.URGENT

            ? 'Follow-up'

            : 'Active'

        : 'Active',

      isCritical: activeAlert?.severity === PatientAlertSeverity.CRITICAL,

      activeAlert,

      lastVisit: latestAppt?.scheduledAt ?? null,

      nextAppt:

        appointments

          .filter((a) => a.scheduledAt > new Date() && !['CANCELLED', 'COMPLETED'].includes(a.status))

          .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())[0]?.scheduledAt ?? null,

      condition: latestAppt?.reason ?? patient.medicalHistory ?? null,

      medications: this.extractMedications(patient.prescriptions),

      consultationHistory: appointments.map((a) => ({

        id: a.id,

        scheduledAt: a.scheduledAt,

        status: a.status,

        reason: a.reason,

        consultationType: a.consultationType,

        hasPrescription: !!a.prescription,

      })),

      recentNotes: notes.map((n) => this.mapNoteForDoctor(n)),

    };

  }



  private extractMedications(

    prescriptions: Array<{ items: Prisma.JsonValue; createdAt: Date }>,

  ) {

    const meds: Array<{ name: string; dosage: string; status: string }> = [];

    for (const rx of prescriptions) {

      const items = Array.isArray(rx.items) ? rx.items : [];

      for (const item of items) {

        if (item && typeof item === 'object' && !Array.isArray(item)) {

          const row = item as Record<string, string>;

          meds.push({

            name: row.medication ?? row.name ?? 'Medication',

            dosage: [row.dosage, row.frequency].filter(Boolean).join(' — ') || 'As directed',

            status: 'Active',

          });

        }

      }

    }

    return meds.slice(0, 8);

  }



  async listNotes(doctorUserId: string, patientId: string, query: NoteListQuery) {

    const doctor = await this.getDoctorForUser(doctorUserId);

    await this.assertPatientRelationship(doctor.id, patientId);



    const page = query.page ?? 1;

    const limit = query.limit ?? 10;

    const skip = (page - 1) * limit;

    const search = query.search?.trim();



    const where: Prisma.PatientClinicalNoteWhereInput = {

      doctorId: doctor.id,

      patientId,

      isDraft: false,

      ...(query.category && { noteType: query.category }),

      ...(query.priority && { priority: query.priority }),

      ...(query.authorType && { authorType: query.authorType }),

      ...(query.appointmentId && { appointmentId: query.appointmentId }),

      ...(query.readStatus === 'unread' && {

        authorType: ClinicalNoteAuthorType.PATIENT,

        doctorReadAt: null,

      }),

      ...(query.readStatus === 'read' && {

        OR: [

          { authorType: ClinicalNoteAuthorType.DOCTOR },

          { doctorReadAt: { not: null } },

        ],

      }),

      ...(search && {

        OR: [

          { title: { contains: search, mode: 'insensitive' } },

          { clinicalNotes: { contains: search, mode: 'insensitive' } },

          { followUpNotes: { contains: search, mode: 'insensitive' } },

          { noteType: { contains: search, mode: 'insensitive' } },

        ],

      }),

    };



    const [items, total] = await Promise.all([

      this.prisma.patientClinicalNote.findMany({

        where,

        skip,

        take: limit,

        orderBy: this.buildSort(query.sortBy, query.sortOrder),

        include: NOTE_INCLUDE,

      }),

      this.prisma.patientClinicalNote.count({ where }),

    ]);



    return {

      items: items.map((n) => this.mapNoteForDoctor(n)),

      total,

      page,

      limit,

      totalPages: Math.ceil(total / limit),

    };

  }



  async getNoteForDoctor(doctorUserId: string, patientId: string, noteId: string) {

    const doctor = await this.getDoctorForUser(doctorUserId);

    await this.assertPatientRelationship(doctor.id, patientId);



    const note = await this.prisma.patientClinicalNote.findFirst({

      where: { id: noteId, doctorId: doctor.id, patientId, isDraft: false },

      include: NOTE_INCLUDE,

    });

    if (!note) throw new NotFoundException('Note not found');



    return this.mapNoteForDoctor(note);

  }



  async markNoteReadForDoctor(doctorUserId: string, noteId: string) {

    const doctor = await this.getDoctorForUser(doctorUserId);

    const note = await this.prisma.patientClinicalNote.findUnique({ where: { id: noteId } });

    if (!note || note.doctorId !== doctor.id) throw new ForbiddenException();



    if (!note.doctorReadAt) {

      await this.prisma.patientClinicalNote.update({

        where: { id: noteId },

        data: { doctorReadAt: new Date() },

      });

    }



    return { success: true };

  }



  async getNoteDraft(doctorUserId: string, patientId: string) {

    const doctor = await this.getDoctorForUser(doctorUserId);

    await this.assertPatientRelationship(doctor.id, patientId);

    return this.prisma.patientClinicalNote.findFirst({

      where: { doctorId: doctor.id, patientId, isDraft: true },

      orderBy: { updatedAt: 'desc' },

    });

  }



  async upsertNoteDraft(

    doctorUserId: string,

    patientId: string,

    data: {

      title?: string;

      noteType?: string;

      clinicalNotes?: string;

      followUpNotes?: string;

      privateNotes?: string;

      appointmentId?: string;

      priority?: ClinicalNotePriority;

      attachments?: Prisma.InputJsonValue;

      followUpReminderAt?: string;

    },

  ) {

    const doctor = await this.getDoctorForUser(doctorUserId);

    await this.assertPatientRelationship(doctor.id, patientId);



    const appointmentId =

      data.appointmentId ?? (await this.resolveLatestAppointmentId(doctor.id, patientId));



    const existing = await this.prisma.patientClinicalNote.findFirst({

      where: { doctorId: doctor.id, patientId, isDraft: true },

    });



    const payload = {

      title: data.title ?? 'Untitled Note',

      noteType: data.noteType ?? 'Progress Note',

      clinicalNotes: data.clinicalNotes ?? '',

      followUpNotes: data.followUpNotes ?? null,

      privateNotes: data.privateNotes ?? null,

      appointmentId,

      priority: data.priority ?? ClinicalNotePriority.NORMAL,

      attachments: data.attachments,

      followUpReminderAt: data.followUpReminderAt ? new Date(data.followUpReminderAt) : null,

      isDraft: true,

    };



    if (existing) {

      return this.prisma.patientClinicalNote.update({

        where: { id: existing.id },

        data: payload,

      });

    }



    return this.prisma.patientClinicalNote.create({

      data: {

        ...payload,

        doctorId: doctor.id,

        patientId,

        authorId: doctor.userId,

        authorType: ClinicalNoteAuthorType.DOCTOR,

      },

    });

  }



  async createNote(

    doctorUserId: string,

    patientId: string,

    data: {

      title: string;

      noteType?: string;

      clinicalNotes: string;

      followUpNotes?: string;

      privateNotes?: string;

      appointmentId?: string;

      priority?: ClinicalNotePriority;

      attachments?: Prisma.InputJsonValue;

      followUpReminderAt?: string;

    },

  ) {

    const doctor = await this.getDoctorForUser(doctorUserId);

    await this.assertPatientRelationship(doctor.id, patientId);



    const clinicalText = this.stripHtml(data.clinicalNotes ?? '');

    const hasContent =

      clinicalText.length > 0 ||

      (data.followUpNotes?.trim().length ?? 0) > 0 ||

      (data.privateNotes?.trim().length ?? 0) > 0;

    if (!hasContent) {

      throw new BadRequestException('Note must include clinical, follow-up, or private content');

    }



    const appointmentId =

      data.appointmentId ?? (await this.resolveLatestAppointmentId(doctor.id, patientId));



    await this.prisma.patientClinicalNote.deleteMany({

      where: { doctorId: doctor.id, patientId, isDraft: true },

    });



    const note = await this.prisma.patientClinicalNote.create({

      data: {

        doctorId: doctor.id,

        patientId,

        appointmentId,

        authorId: doctor.userId,

        authorType: ClinicalNoteAuthorType.DOCTOR,

        title: data.title,

        noteType: data.noteType ?? 'Progress Note',

        clinicalNotes: data.clinicalNotes,

        followUpNotes: data.followUpNotes ?? null,

        privateNotes: data.privateNotes ?? null,

        priority: data.priority ?? ClinicalNotePriority.NORMAL,

        attachments: data.attachments,

        followUpReminderAt: data.followUpReminderAt ? new Date(data.followUpReminderAt) : null,

        doctorReadAt: new Date(),

        isDraft: false,

      },

      include: NOTE_INCLUDE,

    });



    await this.notifyNoteCreated(note);

    return this.mapNoteForDoctor(note);

  }



  async updateNote(

    doctorUserId: string,

    noteId: string,

    data: Partial<{

      title: string;

      noteType: string;

      clinicalNotes: string;

      followUpNotes: string;

      privateNotes: string;

      appointmentId: string;

      priority: ClinicalNotePriority;

      attachments: Prisma.InputJsonValue;

      followUpReminderAt: string;

    }>,

  ) {

    const doctor = await this.getDoctorForUser(doctorUserId);

    const note = await this.prisma.patientClinicalNote.findUnique({ where: { id: noteId } });

    if (!note || note.doctorId !== doctor.id) throw new ForbiddenException();

    if (note.authorId !== doctor.userId) {

      throw new ForbiddenException('You can only edit notes you authored');

    }



    const updated = await this.prisma.patientClinicalNote.update({

      where: { id: noteId },

      data: {

        ...data,

        followUpReminderAt: data.followUpReminderAt

          ? new Date(data.followUpReminderAt)

          : undefined,

      },

      include: NOTE_INCLUDE,

    });



    return this.mapNoteForDoctor(updated);

  }



  async deleteNote(doctorUserId: string, noteId: string) {

    const doctor = await this.getDoctorForUser(doctorUserId);

    const note = await this.prisma.patientClinicalNote.findUnique({ where: { id: noteId } });

    if (!note || note.doctorId !== doctor.id) throw new ForbiddenException();

    if (note.authorId !== doctor.userId) {

      throw new ForbiddenException('You can only delete notes you authored');

    }

    await this.prisma.patientClinicalNote.delete({ where: { id: noteId } });

    return { success: true };

  }



  async listPatientNotes(patientUserId: string, query: NoteListQuery & { doctorId?: string }) {

    const patient = await this.getPatientForUser(patientUserId);



    const page = query.page ?? 1;

    const limit = query.limit ?? 10;

    const skip = (page - 1) * limit;

    const search = query.search?.trim();



    const where: Prisma.PatientClinicalNoteWhereInput = {

      patientId: patient.id,

      isDraft: false,

      ...(query.doctorId && { doctorId: query.doctorId }),

      ...(query.category && { noteType: query.category }),

      ...(query.priority && { priority: query.priority }),

      ...(query.authorType && { authorType: query.authorType }),

      ...(query.appointmentId && { appointmentId: query.appointmentId }),

      ...(query.readStatus === 'unread' && {

        authorType: ClinicalNoteAuthorType.DOCTOR,

        patientReadAt: null,

      }),

      ...(query.readStatus === 'read' && {

        OR: [

          { authorType: ClinicalNoteAuthorType.PATIENT },

          { patientReadAt: { not: null } },

        ],

      }),

      ...(search && {

        OR: [

          { title: { contains: search, mode: 'insensitive' } },

          { clinicalNotes: { contains: search, mode: 'insensitive' } },

          { followUpNotes: { contains: search, mode: 'insensitive' } },

          { noteType: { contains: search, mode: 'insensitive' } },

        ],

      }),

    };



    const [items, total] = await Promise.all([

      this.prisma.patientClinicalNote.findMany({

        where,

        skip,

        take: limit,

        orderBy: this.buildSort(query.sortBy, query.sortOrder),

        include: NOTE_INCLUDE,

      }),

      this.prisma.patientClinicalNote.count({ where }),

    ]);



    return {

      items: items.map((n) => this.mapNoteForPatient(n)),

      total,

      page,

      limit,

      totalPages: Math.ceil(total / limit),

    };

  }



  async getNoteForPatient(patientUserId: string, noteId: string) {

    const patient = await this.getPatientForUser(patientUserId);



    const note = await this.prisma.patientClinicalNote.findFirst({

      where: { id: noteId, patientId: patient.id, isDraft: false },

      include: NOTE_INCLUDE,

    });

    if (!note) throw new NotFoundException('Note not found');



    return this.mapNoteForPatient(note);

  }



  async markNoteReadForPatient(patientUserId: string, noteId: string) {

    const patient = await this.getPatientForUser(patientUserId);

    const note = await this.prisma.patientClinicalNote.findUnique({ where: { id: noteId } });

    if (!note || note.patientId !== patient.id) throw new ForbiddenException();



    if (!note.patientReadAt) {

      await this.prisma.patientClinicalNote.update({

        where: { id: noteId },

        data: { patientReadAt: new Date() },

      });

    }



    return { success: true };

  }



  async createPatientNote(

    patientUserId: string,

    data: {

      doctorId: string;

      title: string;

      noteType?: string;

      clinicalNotes: string;

      followUpNotes?: string;

      appointmentId?: string;

      priority?: ClinicalNotePriority;

      attachments?: Prisma.InputJsonValue;

      followUpReminderAt?: string;

    },

  ) {

    const patient = await this.getPatientForUser(patientUserId);

    await this.assertPatientRelationship(data.doctorId, patient.id);



    const clinicalText = this.stripHtml(data.clinicalNotes ?? '');

    const hasContent = clinicalText.length > 0 || (data.followUpNotes?.trim().length ?? 0) > 0;

    if (!hasContent) {

      throw new BadRequestException('Note must include content');

    }

    if (!data.title?.trim()) {

      throw new BadRequestException('Note title is required');

    }



    const appointmentId =

      data.appointmentId ?? (await this.resolveLatestAppointmentId(data.doctorId, patient.id));



    const note = await this.prisma.patientClinicalNote.create({

      data: {

        doctorId: data.doctorId,

        patientId: patient.id,

        appointmentId,

        authorId: patient.userId,

        authorType: ClinicalNoteAuthorType.PATIENT,

        title: data.title.trim(),

        noteType: data.noteType ?? 'Patient Note',

        clinicalNotes: data.clinicalNotes,

        followUpNotes: data.followUpNotes ?? null,

        priority: data.priority ?? ClinicalNotePriority.NORMAL,

        attachments: data.attachments,

        followUpReminderAt: data.followUpReminderAt ? new Date(data.followUpReminderAt) : null,

        patientReadAt: new Date(),

        isDraft: false,

      },

      include: NOTE_INCLUDE,

    });



    await this.notifyNoteCreated(note);

    return this.mapNoteForPatient(note);

  }



  async updatePatientNote(

    patientUserId: string,

    noteId: string,

    data: Partial<{

      title: string;

      noteType: string;

      clinicalNotes: string;

      followUpNotes: string;

      priority: ClinicalNotePriority;

      attachments: Prisma.InputJsonValue;

      followUpReminderAt: string;

    }>,

  ) {

    const patient = await this.getPatientForUser(patientUserId);

    const note = await this.prisma.patientClinicalNote.findUnique({ where: { id: noteId } });

    if (!note || note.patientId !== patient.id) throw new ForbiddenException();

    if (note.authorId !== patient.userId) {

      throw new ForbiddenException('You can only edit notes you authored');

    }



    const updated = await this.prisma.patientClinicalNote.update({

      where: { id: noteId },

      data: {

        ...data,

        followUpReminderAt: data.followUpReminderAt

          ? new Date(data.followUpReminderAt)

          : undefined,

      },

      include: NOTE_INCLUDE,

    });



    return this.mapNoteForPatient(updated);

  }



  async deletePatientNote(patientUserId: string, noteId: string) {

    const patient = await this.getPatientForUser(patientUserId);

    const note = await this.prisma.patientClinicalNote.findUnique({ where: { id: noteId } });

    if (!note || note.patientId !== patient.id) throw new ForbiddenException();

    if (note.authorId !== patient.userId) {

      throw new ForbiddenException('You can only delete notes you authored');

    }

    await this.prisma.patientClinicalNote.delete({ where: { id: noteId } });

    return { success: true };

  }



  async listAlerts(doctorUserId: string, patientId: string) {

    const doctor = await this.getDoctorForUser(doctorUserId);

    await this.assertPatientRelationship(doctor.id, patientId);



    return this.prisma.patientCriticalAlert.findMany({

      where: { doctorId: doctor.id, patientId },

      orderBy: { createdAt: 'desc' },

      include: {

        history: { orderBy: { createdAt: 'desc' }, take: 20 },

        doctor: { include: { user: { select: { firstName: true, lastName: true } } } },

      },

    });

  }



  async createAlert(

    doctorUserId: string,

    patientId: string,

    data: {

      severity: PatientAlertSeverity;

      category: string;

      reason: string;

      clinicalNotes?: string;

      attachments?: Prisma.InputJsonValue;

      reviewDate?: string;

      notifyTeam?: boolean;

    },

  ) {

    const doctor = await this.getDoctorForUser(doctorUserId);

    await this.assertPatientRelationship(doctor.id, patientId);



    if (!data.reason?.trim()) {

      throw new BadRequestException('Alert reason is required');

    }

    if (!data.category?.trim()) {

      throw new BadRequestException('Alert category is required');

    }



    const patient = await this.prisma.patientProfile.findUnique({

      where: { id: patientId },

      include: { user: { select: { id: true, firstName: true, lastName: true } } },

    });

    if (!patient) throw new NotFoundException('Patient not found');



    const activeAlerts = await this.prisma.patientCriticalAlert.findMany({

      where: {

        doctorId: doctor.id,

        patientId,

        status: PatientAlertStatus.ACTIVE,

      },

    });



    const alert = await this.prisma.$transaction(async (tx) => {

      for (const previous of activeAlerts) {

        await tx.patientCriticalAlert.update({

          where: { id: previous.id },

          data: {

            status: PatientAlertStatus.RESOLVED,

            resolvedAt: new Date(),

            resolvedById: doctor.userId,

          },

        });

        await tx.patientCriticalAlertHistory.create({

          data: {

            alertId: previous.id,

            action: 'ALERT_SUPERSEDED',

            details: `Superseded by new ${data.severity} alert`,

            performedById: doctor.userId,

          },

        });

      }



      return tx.patientCriticalAlert.create({

        data: {

          patientId,

          doctorId: doctor.id,

          severity: data.severity,

          category: data.category.trim(),

          reason: data.reason.trim(),

          clinicalNotes: data.clinicalNotes?.trim() ?? null,

          attachments: data.attachments,

          reviewDate: data.reviewDate ? new Date(data.reviewDate) : null,

          notifyTeam: data.notifyTeam ?? true,

          history: {

            create: {

              action: 'ALERT_CREATED',

              details: `${data.severity} alert: ${data.category}`,

              performedById: doctor.userId,

            },

          },

        },

        include: { history: true },

      });

    });



    if (data.notifyTeam ?? true) {

      const patientName = `${patient.user.firstName} ${patient.user.lastName}`.trim();

      const severityLabel =

        data.severity === PatientAlertSeverity.CRITICAL

          ? 'Critical'

          : data.severity === PatientAlertSeverity.URGENT

            ? 'Urgent'

            : 'Stable';



      await this.notificationsService.create(patient.user.id, {

        type: NotificationType.SYSTEM,

        title: `${severityLabel} care alert recorded`,

        body: `Your physician flagged a ${severityLabel.toLowerCase()} alert: ${data.reason.trim()}`,

        data: { alertId: alert.id, patientId, severity: data.severity },

      });



      const admins = await this.prisma.user.findMany({

        where: { role: UserRole.ADMIN, status: UserStatus.ACTIVE },

        select: { id: true },

      });

      await Promise.all(

        admins.map((admin) =>

          this.notificationsService.create(admin.id, {

            type: NotificationType.SYSTEM,

            title: `🚨 ${severityLabel} patient alert`,

            body: `${patientName}: ${data.category} — ${data.reason.trim()}`,

            data: { alertId: alert.id, patientId, doctorId: doctor.id, severity: data.severity },

          }),

        ),

      );

    }



    return alert;

  }



  async resolveAlert(doctorUserId: string, alertId: string, details?: string) {

    const doctor = await this.getDoctorForUser(doctorUserId);

    const alert = await this.prisma.patientCriticalAlert.findUnique({ where: { id: alertId } });

    if (!alert || alert.doctorId !== doctor.id) throw new ForbiddenException();



    return this.prisma.patientCriticalAlert.update({

      where: { id: alertId },

      data: {

        status: PatientAlertStatus.RESOLVED,

        resolvedAt: new Date(),

        resolvedById: doctor.userId,

        history: {

          create: {

            action: 'ALERT_RESOLVED',

            details: details ?? 'Alert resolved by physician',

            performedById: doctor.userId,

          },

        },

      },

      include: { history: true },

    });

  }



  async removeAlert(doctorUserId: string, alertId: string, details?: string) {

    const doctor = await this.getDoctorForUser(doctorUserId);

    const alert = await this.prisma.patientCriticalAlert.findUnique({ where: { id: alertId } });

    if (!alert || alert.doctorId !== doctor.id) throw new ForbiddenException();



    return this.prisma.patientCriticalAlert.update({

      where: { id: alertId },

      data: {

        status: PatientAlertStatus.REMOVED,

        resolvedAt: new Date(),

        resolvedById: doctor.userId,

        history: {

          create: {

            action: 'ALERT_REMOVED',

            details: details ?? 'Alert removed by physician',

            performedById: doctor.userId,

          },

        },

      },

      include: { history: true },

    });

  }

  async upsertConsultationNote(
    doctorUserId: string,
    data: { appointmentId: string; title: string; content: string; noteId?: string },
  ) {
    const doctor = await this.getDoctorForUser(doctorUserId);
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: data.appointmentId },
    });
    if (!appointment || appointment.doctorId !== doctor.id) {
      throw new ForbiddenException('Invalid appointment for consultation note');
    }

    if (data.noteId) {
      const existing = await this.prisma.patientClinicalNote.findFirst({
        where: { id: data.noteId, doctorId: doctor.id, appointmentId: data.appointmentId },
      });
      if (existing) {
        return this.prisma.patientClinicalNote.update({
          where: { id: existing.id },
          data: {
            title: data.title,
            privateNotes: data.content,
            isDraft: true,
          },
        });
      }
    }

    return this.prisma.patientClinicalNote.create({
      data: {
        doctorId: doctor.id,
        patientId: appointment.patientId,
        appointmentId: data.appointmentId,
        authorId: doctorUserId,
        authorType: ClinicalNoteAuthorType.DOCTOR,
        title: data.title,
        clinicalNotes: '',
        privateNotes: data.content,
        isDraft: true,
      },
    });
  }

}


