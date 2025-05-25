import { sign, verify, JsonWebTokenError } from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { v4 as uuidv4 } from 'uuid';
import { hash, compare } from 'bcrypt';
import { User, Source } from '@prisma/client';
import config from '@/config';
import { prisma, withTransaction } from '@/prisma-client';
import EmailService from '@/domain/email/email-service';
import { AuthenticationFailedError, ValidationError, InvalidLinkError, ResourceNotFoundError } from '@/domain/errors';

export default class AuthService {
  private emailService: EmailService;

  constructor(emailService: EmailService) {
    this.emailService = emailService;
  }

  public async onboardUser(
    userId: string,
    updateParams: {
      firstName: string,
      lastName: string
    }
  ): Promise<User> {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new ResourceNotFoundError('User');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...updateParams,
        onboarded: true,
      }
    });

    return updatedUser;
  }

  public async createPassReset(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { email: this.sanitizeEmail(email) } });

    if (!user) {
      return true;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        passResetToken: uuidv4(),
        passResetTokenCreatedAt: new Date()
      },
    });

    await this.emailService.sendPassReset(
      updatedUser.email,
      { link: this.getPassResetLink(updatedUser) }
    );

    return true;
  }

  public async getPassReset(passResetToken: string): Promise<User> {
    const user = await prisma.user.findUnique({ where: { passResetToken } });

    if (!user || !user.passResetToken || !user.passResetTokenCreatedAt) {
      throw new InvalidLinkError();
    }

    return user;
  }

  public async updatePassReset(passResetToken: string, newPassword: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { passResetToken } });

    if (!user || !user.passResetTokenCreatedAt) {
      throw new InvalidLinkError();
    }

    // Check if the token is expired (e.g., after 24 hours)
    const tokenAge = Date.now() - user.passResetTokenCreatedAt.getTime();
    if (tokenAge > 24 * 60 * 60 * 1000) {
      throw new InvalidLinkError();
    }

    const hashedPassword = await hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        hashedPassword,
        passResetToken: null,
        passResetTokenCreatedAt: null,
      },
    });

    return true;
  }

  public async verifyAccessToken(accessToken: string | undefined): Promise<string> {
    try {
      const decoded = verify(accessToken || '', config.JWT_SECRET);
      return decoded.sub as string;
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw new AuthenticationFailedError(`access token verification failed: ${error.message}`);
      }
      throw error;
    }
  }

  public async findUserById(userId: string): Promise<User> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new ResourceNotFoundError('User');
    }

    return user;
  }

  public async signupWithEmail(email: string, password: string): Promise<User> {
    const sanitizedEmail = this.sanitizeEmail(email);
    const hashedPassword = await hash(password, 10);

    let user = await prisma.user.findUnique({ where: { email: sanitizedEmail } });
    if (user && user.emailConfirmed) {
      throw new ValidationError({ email: 'Email already in use' });
    }

    let shouldSendEmail = false;
    if (user && this.shouldResendConfirmationEmail(user)) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          emailConfirmationToken: uuidv4(),
          emailConfirmationTokenSentAt: new Date(),
        },
      });
      shouldSendEmail = true;
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: sanitizedEmail,
          hashedPassword,
          source: Source.SELF_SIGNUP,
          emailConfirmed: false,
          emailConfirmationToken: uuidv4(),
          emailConfirmationTokenSentAt: new Date(),
        },
      });
      shouldSendEmail = true;
    }

    if (shouldSendEmail) {
      await this.emailService.sendAccountConfirmation(
        user.email,
        { link: this.getConfirmationLink(user) }
      );
    }

    return user;
  }

  private shouldResendConfirmationEmail(user: User): boolean {
    return !user.emailConfirmed &&
      user.emailConfirmationTokenSentAt !== null &&
      user.emailConfirmationTokenSentAt < new Date(Date.now() - 5 * 60 * 1000);
  }

  public createAccessToken(userId: string): string {
    return sign(
      {},
      config.JWT_SECRET,
      {
        expiresIn: '1w',
        audience: config.SERVICE_NAME,
        subject: userId,
        issuer:
        config.SERVICE_NAME
      }
    );
  }

  public async authenticateWithCreds(email: string, password: string): Promise<User> {
    const user = await prisma.user.findUnique({ where: { email: this.sanitizeEmail(email) } });
    if (!user) {
      throw new AuthenticationFailedError('Invalid credentials');
    }

    const passwordIsCorrect = await compare(password, user.hashedPassword || '');
    if (!passwordIsCorrect) {
      throw new AuthenticationFailedError('Invalid credentials');
    }

    if (!user.emailConfirmed) {
      throw new AuthenticationFailedError('Email not confirmed.');
    }

    return user;
  }

  public async authenticateWithEmailConfirmation(emailConfirmationToken: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { emailConfirmationToken },
    });

    if (!user) {
      throw new AuthenticationFailedError('Invalid token');
    }

    await this.confirmUserEmail(user);

    return user;
  }

  public async authenticateWithGoogle(idToken: string): Promise<User> {
    const client = new OAuth2Client("config.GOOGLE_CLIENT_ID");
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: "config.GOOGLE_CLIENT_ID",
    });

    const email = ticket.getPayload()?.email;

    if (!email) {
      throw new Error('Invalid token');
    }

    const sanitizedEmail = this.sanitizeEmail(email);
    const user = await prisma.user.findUnique({ where: { email: sanitizedEmail} });

    if (!user) {
      return await prisma.user.create({
        data: {
          email: sanitizedEmail,
          source: 'SELF_SIGNUP',
          emailConfirmed: true,
        },
      });
    }

    await this.confirmUserEmail(user);
    return user;
  }

  // public async authenticateWithInvitation(invitationToken: string): Promise<User> {
  //   const membership = await prisma.membership.findUnique({
  //     where: { invitationToken },
  //     include: {
  //       user: true,
  //     },
  //   });

  //   if (!membership) {
  //     throw new Error('Invalid invitation token');
  //   }

  //   await withTransaction(tx => {
  //     tx.membership.update({
  //       where: { id: membership.id },
  //       data: {
  //         invitationToken: null,
  //         invitationSentAt: null,
  //       },
  //     });

  //     return this.confirmUserEmail(membership.user);
  //   });

  //   return membership.user;
  // }


  private async confirmUserEmail(user: User) {
    await withTransaction(tx => {
      return tx.user.update({
        where: { id: user.id },
        data: {
          emailConfirmed: true,
          emailConfirmationToken: null,
          emailConfirmationTokenSentAt: null,
        },
      });
    })
  }

  private sanitizeEmail(email: string): string {
    return email.toLowerCase();
  }

  private getConfirmationLink(user: User): string {
    return `http://localhost:3000/confirm/${user.emailConfirmationToken}`;
  }

  private getPassResetLink(user: User): string {
    return `http://localhost:3000/new-password/${user.passResetToken}`;
  }
}