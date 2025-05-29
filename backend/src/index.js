"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("@/config"));
const transporter_1 = __importDefault(require("@/domain/email/transporter"));
// import EmailPreviewController from '@/controllers/email-preview-controller';
const user_controller_1 = __importDefault(require("@/controllers/api/user-controller"));
// import PassResetController from '@/controllers/api/pass-reset-controller';
// import MembershipController from '@/controllers/api/membership-controller';
// import OrganizationController from '@/controllers/api/organization-controller';
const auth_service_1 = __importDefault(require("@/services/auth_service"));
// import OrgsService from '@/domain/orgs/orgs-service';
const email_service_1 = __importDefault(require("@/domain/email/email-service"));
const blog_service_1 = __importDefault(require("@/services/blog_service"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: '*', // Allow all origins in development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use((0, express_1.json)());
app.use((0, express_1.urlencoded)({ extended: true }));
// app.use(requestLoggerMiddleware);
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(__dirname, 'views'));
const emailService = new email_service_1.default(transporter_1.default);
const authService = new auth_service_1.default(emailService);
const blogService = new blog_service_1.default();
// const orgsService = new OrgsService(emailService);
// const emailPreviewController = new EmailPreviewController(emailService);
const userController = new user_controller_1.default(authService);
// const sessionController = new SessionController(authService);
// const passResetController = new PassResetController(authService);
// const membershipController = new MembershipController(orgsService);
// const organizationController = new OrganizationController(orgsService);
// app.use('/', emailPreviewController.router);
app.use('/api', [
    userController.router,
    //   sessionController.router,
    //   passResetController.router,
    //   membershipController.router,
    //   organizationController.router
]);
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
app.listen(config_1.default.PORT, () => {
    console.log(`Server is running on http://localhost:${config_1.default.PORT}`);
});
process.on('uncaughtException', err => {
    console.error(err);
    console.log(`Uncaught Exception: ${err.message}`);
    process.exit(1);
});
process.on('exit', code => {
    console.log(`Process exited with code: ${code}`);
});
