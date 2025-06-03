import express, { json, urlencoded } from 'express';
import cors from 'cors';
import path from 'path';
import config from '@/config';

// controllers
import transporter from '@/domain/email/transporter';
import UserController from '@/controllers/api/user-controller';
import AnnouncementController from "@/controllers/api/announcement-controller";
import ArticleController from "@/controllers/api/article-controller";
import EventController from "@/controllers/api/event-controller";


import SessionController from '@/controllers/api/session-controller';
import EmailPreviewController from '@/controllers/email-preview-controller';
import PassResetController from '@/controllers/api/pass-reset-controller';
import MembershipController from '@/controllers/api/membership-controller';
import OrganizationController from '@/controllers/api/organization-controller';



//services
import OrgsService from '@/domain/orgs/orgs-service';
import AuthService from '@/services/auth_service';
import EmailService from '@/domain/email/email-service';
import BlogService from '@/services/blog_service';
import { auth } from 'google-auth-library';



// app start and configuration and actions
const app = express();
app.use(cors({
  origin: '*', // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(json());
app.use(urlencoded({ extended: true }));
// app.use(requestLoggerMiddleware);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//services and controllers initialization
const emailService = new EmailService(transporter);
const authService = new AuthService(emailService);
const blogService = new BlogService();

const orgsService = new OrgsService(emailService);
const emailPreviewController = new EmailPreviewController(emailService);

const userController = new UserController(authService);
const announcementController = new AnnouncementController(blogService);
const articleController = new ArticleController(blogService);
const eventController = new EventController(blogService);

const sessionController = new SessionController(authService);
const passResetController = new PassResetController(authService);
const membershipController = new MembershipController(orgsService);
const organizationController = new OrganizationController(orgsService);


// Define the user router with all the controllers
const userRouter = [
  userController.router,
  announcementController.router,
  articleController.router,
  eventController.router,
  sessionController.router,
  passResetController.router,
  membershipController.router,
  organizationController.router
];


app.use('/api', userRouter);
app.use('/', emailPreviewController.router);

// app.get('/', async (req, res) => {
//   // const result = await test(1, 2);
//   res.send({ health: 'ok' });
// });

// //signup
// app.post('/signup', async (req, res) => {
//   try {
//     const user = await singup(req.body.email, req.body.password);
//     res.status(200).send({ createdUser: user });
//   } catch (error) {
//     console.error('Error creating user:', error);
//     res.status(422).send({ error: 'Error creating user' });
//   }
//   // res.status(200).contentType('text/html').send(`<h1>Success: id: ${25}, email: ${req.body.email}</h1>`);
// });
// app.get('/admin/see_all_users', async (req, res) => {
//   const allUsers = await seeAllUsers();
//   res.status(200).send({ allUsers });
// });



// // announcements
// app.get('/announcements', async (req, res) => {
//   const allAnnouncements = await announcementsForAll();
//   res.status(200).send({ allAnnouncements });
// });
// app.get('/announcements/:announcement_id', async (req, res) => {
//   const announcement = await showAnnouncement(req.params.announcement_id);
//   res.status(200).send({ announcement });
// });

// app.post('/announcements', async (req, res) => {
//   const { title, content } = req.body;
//   if (!title || !content) {
//     return res.status(400).send({ error: 'Title and content are required' });
//   }
//   const announcement = await creatNewAnnouncement(title, content);
//   if (!announcement) {
//     return res.status(500).send({ error: 'Failed to create announcement' });
//   }
//   res.status(201).send({ announcement });
// });

// app.delete('/announcements/:announcement_id', async (req, res) => {
//   const { announcement_id } = req.params;
//   if (!announcement_id) {
//     return res.status(400).send({ error: 'Announcement ID is required' });
//   }
//   const announcement = await deleteAnnouncement(announcement_id);
//   if (!announcement) {
//     return res.status(500).send({ error: 'Failed to delete announcement' });
//   }
//   res.status(200).send({ message: 'Announcement deleted successfully' });
// });

// app.put('/announcements/:announcement_id', async (req, res) => {
//   const { announcement_id } = req.params;
//   const { title, content } = req.body;
//   if (!announcement_id || !title || !content) {
//     return res.status(400).send({ error: 'Announcement ID, title, and content are required' });
//   }
//   const announcement = await updateAnnouncement(announcement_id, title, content);
//   if (!announcement) {
//     return res.status(500).send({ error: 'Failed to update announcement' });
//   }
//   res.status(200).send({ announcement });
// });

// //event
// app.get('/events', async (req, res) => {
//   const allEvents = await showAllEvents();
//   res.status(200).send({ allEvents });
// });
// app.post('/events', async (req, res) => {
//   const { title, content,date} = req.body;
//   if (!title || !content || !date) {
//     return res.status(400).send({ error: 'Title and content are required' });
//   }
//   const event = await createNewEvent(title, content,date);
//   if (!event) {
//     return res.status(500).send({ error: 'Failed to create event' });
//   }
//   res.status(201).send({ event });
// });
// app.get('/events/:event_id', async (req, res) => {
//   const { event_id } = req.params;
//   if (!event_id) {
//     return res.status(400).send({ error: 'Event ID is required' });
//   }
//   const event = await showSingleEvent(event_id);
//   if (!event) {
//     return res.status(404).send({ error: 'Event not found' });
//   }
//   res.status(200).send({ event });
// });
// app.delete('/events/:event_id', async (req, res) => {
//   const { event_id } = req.params;
//   if (!event_id) {
//     return res.status(400).send({ error: 'Event ID is required' });
//   }
//   const event = await deleteEvent(event_id);
//   if (!event) {
//     return res.status(500).send({ error: 'Failed to delete event' });
//   }
//   res.status(200).send({ message: 'Event deleted successfully' });
// });
// app.put('/events/:event_id', async (req, res) => {
//   const { event_id } = req.params;
//   const { title, content } = req.body;
//   if (!event_id || !title || !content) {
//     return res.status(400).send({ error: 'Event ID, title, and content are required' });
//   }
//   const event = await updateEvent(event_id, title, content);
//   if (!event) {
//     return res.status(500).send({ error: 'Failed to update event' });
//   }
//   res.status(200).send({ event });
// });

// //articles
// app.post('/articles', async (req, res) => {
//   const { title, content } = req.body;
//   if (!title || !content) {
//     return res.status(400).send({ error: 'Title and content are required' });
//   }
//   const article = await createNewArticle(title, content);
//   if (!article) {
//     return res.status(500).send({ error: 'Failed to create article' });
//   }
//   res.status(201).send({ article });
// });

// app.get('/articles', async (req, res) => {
//   const status = req.query.status as ArticleStatus;
//   const allArticles = await showAllArticles(status);
//   res.status(200).send({ allArticles });
// });

// app.put('/articles/:article_id', async (req, res) => {
//   const { article_id } = req.params;
//   const { status } = req.body;
//   const article = await updateArticle(article_id, status);
//   res.status(200).send({ article });
// });


app.listen(config.PORT, () => {
  console.log(`Server is running on http://localhost:${config.PORT}`);
});

process.on('uncaughtException', err => {
  console.error(err)
  console.log(`Uncaught Exception: ${err.message}`)
  process.exit(1)
})

process.on('exit', code => {
  console.log(`Process exited with code: ${code}`)
})