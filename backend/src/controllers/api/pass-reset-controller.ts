import { Request, Response, Router } from 'express';
import AuthService from '@/services/auth_service';
import {
  CreatePassResetRequestSchema,
  CreatePassResetResponseSchema,
  GetPassResetResponseSchema,
  UpdatePassResetRequestSchema,
  UpdatePassResetResponseSchema
} from 'api-types';
import { decorate } from '@/utils';

export default class PassResetController {
  public router: Router;
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
    this.router = Router();
    this.router.post('/pass-resets', decorate(this.handlePostPassResets));
    this.router.get('/pass-resets/:passResetToken', decorate(this.handleGetPassReset));
    this.router.put('/pass-resets/:passResetToken', decorate(this.handlePutPassReset));
  }

  private handlePostPassResets = async (req: Request, res: Response) => {
    const params = CreatePassResetRequestSchema.parse(req.body);
    await this.authService.createPassReset(params.email);
    const createPassResetResponse = CreatePassResetResponseSchema.parse({ success: true });
    res.send(createPassResetResponse).status(200);
  }

  private handleGetPassReset = async (req: Request, res: Response) => {
    const passResetToken = req.params?.passResetToken;
    const user = await this.authService.getPassReset(passResetToken);
    const getPassResetResponse = GetPassResetResponseSchema.parse({
      passResetToken: user.passResetToken ?? '',
      passResetTokenCreatedAt: user.passResetTokenCreatedAt?.toISOString() ?? '',
    });
    res.send(getPassResetResponse).status(200);
  }

  private handlePutPassReset = async (req: Request, res: Response) => {
    const passResetToken = req.params?.passResetToken;
    const params = UpdatePassResetRequestSchema.parse(req.body);
    await this.authService.updatePassReset(passResetToken, params.password);
    const updatePassResetResponse = UpdatePassResetResponseSchema.parse({ success: true });
    res.send(updatePassResetResponse).status(200);
  }
}
