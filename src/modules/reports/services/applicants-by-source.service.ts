import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ApplicantsBySourceQueryDto } from '../dto/applicants-by-source.query.dto';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import type { Response } from 'express';

type SourceParam = 'agency' | 'self' | 'mub-staff';
type RegistrationSource = 'AGENCY' | 'SELF' | 'MUB_STAFF';

type ApplicantRow = {
  applicantId: string;
  applicationNumber: string;
  phone: string;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  profileStatus: string;
  registrationSource: string;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type CreatorUser = {
  id: string;
  fullName: string | null;
  phone: string;
  email: string | null;
};

@Injectable()
export class ApplicantsBySourceService {
  constructor(private readonly prisma: PrismaService) {}

  private parseSourceParam(source: string): SourceParam {
    const s = String(source || '').trim().toLowerCase();
    if (s === 'agency' || s === 'self' || s === 'mub-staff') return s;
    throw new BadRequestException('Invalid source. Allowed: agency | self | mub-staff');
  }

  private toRegistrationSource(source: SourceParam): RegistrationSource {
    if (source === 'agency') return 'AGENCY';
    if (source === 'self') return 'SELF';
    return 'MUB_STAFF';
  }

  private buildCreatedAtWhere(q: ApplicantsBySourceQueryDto) {
    if (!q.dateFrom && !q.dateTo) return undefined;

    const where: any = {};
    if (q.dateFrom) where.gte = new Date(q.dateFrom);

    if (q.dateTo) {
      const end = new Date(q.dateTo);
      end.setHours(23, 59, 59, 999);
      where.lte = end;
    }

    return where;
  }

  private buildWhere(sourceParam: string, q: ApplicantsBySourceQueryDto) {
    const src = this.toRegistrationSource(this.parseSourceParam(sourceParam));
    const createdAt = this.buildCreatedAtWhere(q);

    const where: any = { registrationSource: src };
    if (createdAt) where.createdAt = createdAt;

    if (q.createdBy) {
      if (src === 'SELF') throw new BadRequestException('createdBy filter is not applicable for SELF source');
      where.createdBy = q.createdBy;
    }

    return where;
  }

  private async fetchUsersMap(userIds: string[]) {
    const ids = Array.from(new Set(userIds.filter(Boolean)));
    if (!ids.length) return new Map<string, CreatorUser>();

    const users = await this.prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, fullName: true, phone: true, email: true }
    });

    return new Map(users.map((u) => [u.id, u]));
  }

  private fullNameOf(row: { firstName: any; middleName: any; lastName: any }) {
    return [row.firstName, row.middleName, row.lastName].filter(Boolean).join(' ').trim();
  }

  async count(sourceParam: string, q: ApplicantsBySourceQueryDto) {
    const source = this.parseSourceParam(sourceParam);
    const where = this.buildWhere(source, q);
    const total = await this.prisma.applicantProfile.count({ where });
    return { source: this.toRegistrationSource(source), total };
  }

  async creators(sourceParam: string, q: ApplicantsBySourceQueryDto) {
    const source = this.parseSourceParam(sourceParam);
    const src = this.toRegistrationSource(source);

    if (src === 'SELF') {
      const createdAt = this.buildCreatedAtWhere(q);
      const total = await this.prisma.applicantProfile.count({
        where: { registrationSource: 'SELF', ...(createdAt ? { createdAt } : {}) }
      });
      return { source: 'SELF', creators: [], selfTotal: total };
    }

    const createdAt = this.buildCreatedAtWhere(q);
    const where: any = { registrationSource: src };
    if (createdAt) where.createdAt = createdAt;

    const grouped = await this.prisma.applicantProfile.groupBy({
      by: ['createdBy'],
      where,
      _count: { applicantId: true }
    });

    const creatorIds = grouped.map((g) => g.createdBy).filter((x): x is string => !!x);
    const usersMap = await this.fetchUsersMap(creatorIds);

    const creators = grouped
      .filter((g) => !!g.createdBy)
      .map((g) => {
        const u = usersMap.get(g.createdBy as string) ?? null;
        return {
          createdBy: g.createdBy as string,
          total: g._count.applicantId,
          createdByUser: u
            ? { id: u.id, fullName: u.fullName, phone: u.phone, email: u.email }
            : null
        };
      })
      .sort((a, b) => b.total - a.total);

    return { source: src, creators };
  }

  async list(sourceParam: string, q: ApplicantsBySourceQueryDto) {
    const source = this.parseSourceParam(sourceParam);

    const page = q.page ? Number(q.page) : 1;
    const pageSize = q.pageSize ? Number(q.pageSize) : 50;

    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safePageSize = Number.isFinite(pageSize) && pageSize > 0 && pageSize <= 500 ? pageSize : 50;

    const skip = (safePage - 1) * safePageSize;

    const where = this.buildWhere(source, q);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.applicantProfile.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { applicantId: 'desc' }],
        skip,
        take: safePageSize,
        select: {
          applicantId: true,
          applicationNumber: true,
          phone: true,
          firstName: true,
          middleName: true,
          lastName: true,
          profileStatus: true,
          registrationSource: true,
          createdBy: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      this.prisma.applicantProfile.count({ where })
    ]);

    const userIds = items.map((x) => x.createdBy).filter((x): x is string => !!x);
    const usersMap = await this.fetchUsersMap(userIds);

    const enriched = items.map((it) => {
      const u = it.createdBy ? usersMap.get(it.createdBy) ?? null : null;
      return {
        ...it,
        createdByUser: u ? { id: u.id, fullName: u.fullName, phone: u.phone, email: u.email } : null
      };
    });

    return {
      source: this.toRegistrationSource(source),
      createdBy: q.createdBy ?? null,
      dateFrom: q.dateFrom ?? null,
      dateTo: q.dateTo ?? null,
      page: safePage,
      pageSize: safePageSize,
      total,
      items: enriched
    };
  }

  private async fetchChunk(where: any, take: number, cursor?: { createdAt: Date; applicantId: string }) {
    const cursorWhere =
      cursor
        ? {
            OR: [
              { createdAt: { lt: cursor.createdAt } },
              { createdAt: cursor.createdAt, applicantId: { lt: cursor.applicantId } }
            ]
          }
        : undefined;

    const rows = await this.prisma.applicantProfile.findMany({
      where: cursorWhere ? { AND: [where, cursorWhere] } : where,
      orderBy: [{ createdAt: 'desc' }, { applicantId: 'desc' }],
      take,
      select: {
        applicantId: true,
        applicationNumber: true,
        phone: true,
        firstName: true,
        middleName: true,
        lastName: true,
        profileStatus: true,
        registrationSource: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const nextCursor =
      rows.length
        ? { createdAt: rows[rows.length - 1].createdAt, applicantId: rows[rows.length - 1].applicantId }
        : null;

    return { rows: rows as ApplicantRow[], nextCursor };
  }

  async streamExcel(sourceParam: string, q: ApplicantsBySourceQueryDto, res: Response) {
    const source = this.parseSourceParam(sourceParam);
    const where = this.buildWhere(source, q);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="applicants-by-source-${this.toRegistrationSource(source).toLowerCase()}-${Date.now()}.xlsx"`
    );

    const wb = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: res });
    const ws = wb.addWorksheet('Applicants');

    ws.columns = [
      { header: 'Applicant ID', key: 'applicantId', width: 38 },
      { header: 'Application No', key: 'applicationNumber', width: 18 },
      { header: 'Full Name', key: 'fullName', width: 24 },
      { header: 'Phone', key: 'phone', width: 16 },
      { header: 'Status', key: 'profileStatus', width: 12 },
      { header: 'Source', key: 'registrationSource', width: 12 },
      { header: 'Created By ID', key: 'createdBy', width: 38 },
      { header: 'Created By Name', key: 'createdByName', width: 22 },
      { header: 'Created By Phone', key: 'createdByPhone', width: 16 },
      { header: 'Created By Email', key: 'createdByEmail', width: 24 },
      { header: 'Created At', key: 'createdAt', width: 22 }
    ];

    let cursor: { createdAt: Date; applicantId: string } | undefined;
    const take = 1000;

    while (true) {
      const { rows, nextCursor } = await this.fetchChunk(where, take, cursor);
      if (!rows.length) break;

      const userIds = rows.map((r) => r.createdBy).filter((x): x is string => !!x);
      const usersMap = await this.fetchUsersMap(userIds);

      for (const r of rows) {
        const u = r.createdBy ? usersMap.get(r.createdBy) ?? null : null;
        const fullName = this.fullNameOf(r);

        ws.addRow({
          applicantId: r.applicantId,
          applicationNumber: r.applicationNumber,
          fullName: fullName || '',
          phone: r.phone,
          profileStatus: r.profileStatus,
          registrationSource: r.registrationSource,
          createdBy: r.createdBy ?? '',
          createdByName: u?.fullName ?? '',
          createdByPhone: u?.phone ?? '',
          createdByEmail: u?.email ?? '',
          createdAt: r.createdAt.toISOString()
        }).commit();
      }

      cursor = nextCursor ?? undefined;
      if (!cursor) break;
    }

    ws.commit();
    await wb.commit();
  }

  async streamPdf(sourceParam: string, q: ApplicantsBySourceQueryDto, res: Response) {
    const source = this.parseSourceParam(sourceParam);
    const where = this.buildWhere(source, q);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="applicants-by-source-${this.toRegistrationSource(source).toLowerCase()}-${Date.now()}.pdf"`
    );

    const doc = new PDFDocument({ size: 'A4', margin: 36 });
    doc.pipe(res);

    const title = `Applicants by Source: ${this.toRegistrationSource(source)}`;
    const subtitle = `Range: ${q.dateFrom ?? 'Any'} → ${q.dateTo ?? 'Any'}   CreatedBy: ${q.createdBy ?? 'Any'}`;

    doc.fontSize(16).text(title);
    doc.moveDown(0.25);
    doc.fontSize(10).text(subtitle);
    doc.moveDown(0.75);

    let cursor: { createdAt: Date; applicantId: string } | undefined;
    const take = 1000;

    while (true) {
      const { rows, nextCursor } = await this.fetchChunk(where, take, cursor);
      if (!rows.length) break;

      const userIds = rows.map((r) => r.createdBy).filter((x): x is string => !!x);
      const usersMap = await this.fetchUsersMap(userIds);

      for (const r of rows) {
        const u = r.createdBy ? usersMap.get(r.createdBy) ?? null : null;
        const fullName = this.fullNameOf(r);
        const createdByName = u?.fullName ?? '';
        const line =
          `${r.applicationNumber} | ${fullName || '-'} | ${r.phone} | ${r.profileStatus} | ` +
          `${createdByName || '-'} | ${r.createdAt.toISOString()}`;

        doc.fontSize(9).text(line, { width: 520 });
      }

      cursor = nextCursor ?? undefined;
      if (!cursor) break;

      if (doc.y > 760) {
        doc.addPage();
      }
    }

    doc.end();
  }
}
