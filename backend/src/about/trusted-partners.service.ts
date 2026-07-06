import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTrustedPartnerDto,
  ReorderTrustedPartnersDto,
  UpdateTrustedPartnerDto,
} from './dto/trusted-partner.dto';

@Injectable()
export class TrustedPartnersService {
  constructor(private prisma: PrismaService) {}

  async findPublic() {
    return this.prisma.trustedPartner.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: 'asc' }, { companyName: 'asc' }],
      select: {
        id: true,
        companyName: true,
        websiteUrl: true,
        description: true,
        logoUrl: true,
        displayOrder: true,
      },
    });
  }

  async findAllAdmin(query: { page?: number; limit?: number; search?: string; status?: 'all' | 'active' | 'inactive' }) {
    const page = query.page || 1;
    const limit = query.limit || 12;
    const skip = (page - 1) * limit;

    const where: Prisma.TrustedPartnerWhereInput = {
      ...(query.search && {
        OR: [
          { companyName: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
          { websiteUrl: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
      ...(query.status === 'active' && { isActive: true }),
      ...(query.status === 'inactive' && { isActive: false }),
    };

    const [data, total] = await Promise.all([
      this.prisma.trustedPartner.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ displayOrder: 'asc' }, { companyName: 'asc' }],
      }),
      this.prisma.trustedPartner.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 } };
  }

  async create(dto: CreateTrustedPartnerDto) {
    const maxOrder = await this.prisma.trustedPartner.aggregate({ _max: { displayOrder: true } });
    const displayOrder = dto.displayOrder ?? (maxOrder._max.displayOrder ?? 0) + 1;

    return this.prisma.trustedPartner.create({
      data: {
        companyName: dto.companyName,
        websiteUrl: dto.websiteUrl,
        description: dto.description,
        logoUrl: dto.logoUrl,
        displayOrder,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateTrustedPartnerDto) {
    await this.ensureExists(id);
    return this.prisma.trustedPartner.update({
      where: { id },
      data: dto,
    });
  }

  async setStatus(id: string, isActive: boolean) {
    await this.ensureExists(id);
    return this.prisma.trustedPartner.update({
      where: { id },
      data: { isActive },
    });
  }

  async reorder(dto: ReorderTrustedPartnersDto) {
    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.trustedPartner.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        }),
      ),
    );
    return { success: true };
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.trustedPartner.delete({ where: { id } });
    return { success: true };
  }

  private async ensureExists(id: string) {
    const partner = await this.prisma.trustedPartner.findUnique({ where: { id } });
    if (!partner) throw new NotFoundException('Trusted partner not found');
    return partner;
  }
}
