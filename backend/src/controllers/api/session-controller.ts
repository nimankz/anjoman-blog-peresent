import { Request, Response, Router } from 'express';
import AuthService from '@/services/auth_service';
import { User } from '@prisma/client';
import {
  CreateSessionRequestSchema,
  CreateSessionResponseSchema,
  GetSessionResponseSchema
} from 'api-types';
import { decorate, decorateWithAuth } from '@/utils';

export default class SessionController {
  public router: Router;
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
    this.router = Router();
    this.router.get('/session', decorateWithAuth(this.handleGetSession));
    this.router.post('/sessions', decorate(this.handlePostSessions));
  }

  private handlePostSessions = async (req: Request, res: Response) => {
    const params = CreateSessionRequestSchema.parse(req.body);
    const { provider } = params;
    let user: User;
    if (provider === 'credentials') {
      user = await this.authService.authenticateWithCreds(params.email, params.password);
    } else if (provider === 'email_confirmation') {
      user = await this.authService.authenticateWithEmailConfirmation(params.token);
    } else if (provider === 'google') {
      user = await this.authService.authenticateWithGoogle(params.token);
    } else if (provider === 'invitation') {
      // user = await this.authService.authenticateWithInvitation(params.token);
    } else {
      throw new Error('Invalid provider');
    }
    const accessToken = this.authService.createAccessToken(user.id);
    const createSessionResponse = CreateSessionResponseSchema.parse({ user, accessToken });
    res.send(createSessionResponse).status(200);
  }

  private handleGetSession = async (req: Request, res: Response, userId: string) => {
    const user = await this.authService.findUserById(userId);
    const getSessionResponse = GetSessionResponseSchema.parse({ user });
    res.send(getSessionResponse).status(200);
  }
}