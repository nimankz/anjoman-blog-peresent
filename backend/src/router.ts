import { Router} from "express";
import AnnouncementController from "@/controllers/api/announcement-controller";
import ArticleController from "@/controllers/api/article-controller";
import EventController from "@/controllers/api/event-controller";
import UserController from "@/controllers/api/user-controller";
import AuthService from "@/services/auth_service";
import EmailService from "@/domain/email/email-service";
import BlogService from "@/services/blog_service";
import transporter from "@/domain/email/transporter";
import { auth } from "google-auth-library";


export default class RouterConfig {
  public static configure(): Router {
    const router = Router();

    const emailService = new EmailService(transporter);
    const authService = new AuthService(emailService);
    const blogService = new BlogService();

    const announcementController = new AnnouncementController(blogService);
    const articleController = new ArticleController(blogService);
    const eventController = new EventController(blogService);
    const userController = new UserController(authService);

    // Define API routes
    router.use('/api', [
      userController.router,
      announcementController.router,
      articleController.router,
      eventController.router,
    ]);

    return router;
  }
}
const router = RouterConfig.configure();
console.log('Router configured successfully');
console.log(router.stack.map(r => r.route?.path || 'No path'));
//   // sessionController.router,
//   // passResetController.router,
//   // membershipController.router,
//   // organizationController.router,
// ]);
//
// app.use('/api', router);
//
// app.use('/public', express.static(path.join(__dirname, 'public')));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//
// app.use('/blog', blogService.router);
// app.use('/auth', authService.router);
// app.use('/auth/google', authService.googleAuthRouter);
// app.use('/auth/google/callback', authService.googleAuthCallbackRouter);
//


