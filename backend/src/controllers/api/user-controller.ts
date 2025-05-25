import { Request, Response, Router } from 'express';
import AuthService from '@/services/auth_service';
import { CreateUserRequestSchema, CreateUserResponseSchema, UpdateUserRequestSchema, UpdateUserResponseSchema } from 'api-types';
import { decorate, decorateWithAuth } from '@/utils';

export default class UserController {
  public router: Router;
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
    this.router = Router();
    this.router.post('/users', decorate(this.handlePostUsers));
    this.router.put('/user', decorateWithAuth(this.handlePutUser));
  }

  private handlePostUsers = async (req: Request, res: Response) => {
    const params = CreateUserRequestSchema.parse(req.body);
    const user = await this.authService.signupWithEmail(params.email, params.password);
    const createUserResponse = CreateUserResponseSchema.parse({ user });
    res.send(createUserResponse).status(201);
  }

  private handlePutUser = async (req: Request, res: Response, userId: string) => {
    const params = UpdateUserRequestSchema.parse(req.body);
    const user = await this.authService.onboardUser(userId, params);
    const updateUserResponse = UpdateUserResponseSchema.parse({ user });
    res.send(updateUserResponse);
  }
}