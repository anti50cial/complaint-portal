import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

/**
 * Runs once on every application start.
 *
 * Guarantees that a SUPER_ADMIN account always exists and that its stored
 * password hash matches the plaintext value in SUPER_ADMIN_PASSWORD.
 * If the account is missing it is created; if the password drifted it is
 * re-hashed and updated automatically.
 */
@Injectable()
export class SuperAdminBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SuperAdminBootstrapService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap(): Promise<void> {
    const email = process.env.SUPER_ADMIN_EMAIL;
    const password = process.env.SUPER_ADMIN_PASSWORD;
    const name = process.env.SUPER_ADMIN_NAME ?? 'Super Admin';

    if (!email || !password) {
      this.logger.warn(
        'SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD is not set in .env — skipping super admin bootstrap.',
      );
      return;
    }

    const existing = await this.prisma.user.findUnique({ where: { email } });

    if (!existing) {
      const hashed = await bcrypt.hash(password, 10);
      await this.prisma.user.create({
        data: { email, name, password: hashed, role: 'SUPER_ADMIN' },
      });
      this.logger.log(`Super admin created → ${email}`);
      return;
    }

    // Ensure the stored role is correct regardless of how the account was created
    const roleOk = existing.role === 'SUPER_ADMIN';
    const passwordOk = await bcrypt.compare(password, existing.password);

    if (roleOk && passwordOk) {
      this.logger.log(`Super admin verified → ${email}`);
      return;
    }

    // Something drifted — fix it
    const hashed = passwordOk
      ? existing.password
      : await bcrypt.hash(password, 10);
    await this.prisma.user.update({
      where: { email },
      data: { role: 'SUPER_ADMIN', password: hashed },
    });
    this.logger.log(
      `Super admin updated (role=${roleOk ? 'ok' : 'fixed'}, password=${passwordOk ? 'ok' : 'resynced'}) → ${email}`,
    );
  }
}
