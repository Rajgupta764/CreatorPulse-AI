import { Injectable, NotFoundException, HttpException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsageService {
  constructor(private prisma: PrismaService) {}

  async getUsage(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usage = await this.prisma.dailyUsage.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    const used = usage?.count ?? 0;
    const limit = user.dailyLimit;

    return {
      isAuthenticated: true,
      tier: user.tier,
      used,
      limit,
      remaining: Math.max(0, limit - used),
      hasAnalyzedToday: used > 0,
    };
  }

  async checkAndIncrement(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const used = await this.prisma.dailyUsage.findUnique({
      where: { userId_date: { userId, date: today } },
    });
    const current = used?.count ?? 0;
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const limit = user?.dailyLimit ?? 3;

    if (current >= limit) {
      throw new HttpException(
        { error: "Daily generation limit reached. Upgrade to Pro for 100/day." },
        429,
      );
    }

    await this.prisma.dailyUsage.upsert({
      where: { userId_date: { userId, date: today } },
      update: { count: { increment: 1 } },
      create: { userId, date: today, count: 1 },
    });
  }
}
