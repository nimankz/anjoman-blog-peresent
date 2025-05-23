import express, { json, urlencoded } from 'express';
import { PrismaClient, User } from '@prisma/client'
import cors from 'cors';
import path from 'path';
import config from '@/config';
import { date } from 'zod';

const app = express();
const prisma = new PrismaClient();

async function singup(email: string, password: string): Promise<User> {
  const user: User = await prisma.user.create({
    data: {
      email,
      hashedPassword: password + "1234",
    },
  });
  return user;
}

async function getLoggedInUser() {
  return await prisma.user.findFirst()
}

async function seeAllUsers(): Promise<User[]> {
  const users = await prisma.user.findMany({
    take: 100,
    orderBy: { 'email': 'desc' }
  });
  return users;
}

//announcements
async function announcementsForAll(): Promise<any[]> {
  const announcements = await prisma.announcement.findMany({
    take: 100,
    orderBy: { 'createdAt': 'desc' }
  });
  return announcements;
}
async function creatNewAnnouncement(title: string, content: string): Promise<any> {

  const announcement = await prisma.announcement.create({
    data: {
      title,
      content,
      userId: "1", // Replace with the actual user ID
    }});
  return announcement
}
async function deleteAnnouncement(announcementId: string): Promise<any> {
  const announcement = await prisma.announcement.delete({
    where: {
      id: announcementId,
    },
  });
  return announcement;
}
async function updateAnnouncement(announcementId: string, title: string, content: string): Promise<any> {
  const announcement = await prisma.announcement.update({
    where: {
      id: announcementId,
    },
    data: {
      title,
      content,
    },
  });
  return announcement;
}

//events
async function showAllEvents(): Promise<any[]> {
  const events = await prisma.event.findMany({
    take: 100,
    orderBy: { 'date': 'desc' }
  });
  return events;
}
async function createNewEvent(name: string, content: string, date: Date): Promise<any> {
  const event = await prisma.event.create({
    data: {
      name,
      content,
      date,
      userId: "1", // Replace with the actual user ID
    }});
  return event
}
async function showSingleEvent(eventId: string): Promise<any> {
  const event = await prisma.event.findUnique({
    where: {
      id: eventId,
    },
  });
  return event;
}
async function deleteEvent(eventId: string): Promise<any> {
  const event = await prisma.event.delete({
    where: {
      id: eventId,
    },
  });
  return event;
}
async function updateEvent(eventId: string, name: string, content: string):Promise<any> {
  const event = await prisma.event.update({
    where: {
      id: eventId,
    },
    data: {
      name,
      content,
    },
  });
  return event;
}

//articles
async function createNewArticle(title: string, content: string): Promise<any> {
  const article = await prisma.article.create({
    data:{
      title,
      content,
      status: 'unprocessed',
      userId: "1", // Replace with the actual user ID
    }});
  return article
}
async function showAllArticles(): Promise<any[]> {
  const articles = await prisma.article.findMany({
    take: 100,
    orderBy: { 'createdAt': 'desc' }
  });
  return articles;
}
async function showUnprocessedArticles(): Promise<any[]> {
  const articles = await prisma.article.findMany({
    where: {
      status: 'unprocessed',
    },
    take: 100,
    orderBy: { 'createdAt': 'desc' }
  });
  return articles;
}
async function showPublishedArticles(): Promise<any[]> {
  const articles = await prisma.article.findMany({
    where: {
      status: 'published',
    },
    take: 100,
    orderBy: { 'createdAt': 'desc' }
  });
  return articles;
}
async function showSingleArticle(articleId: string): Promise<any> {
  const article = await prisma.article.findUnique({
    where: {
      id: articleId,
    },
  });
  return article;
}
async function articleValidation(articleId: string, status: string): Promise<any> {
  const article = await prisma.article.update({
    where: {
      id: articleId,
    },
    data: {
      status,
    },
  });
  return article;
}

// Middleware to log requests




  
// app.use(cors());
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
//initialize the public folder
app.get('/', async (req, res) => {
  // const result = await test(1, 2);
  res.send({ health: 'ok' });
});

//signup
app.post('/signup', async (req, res) => {
  try {
    const user = await singup(req.body.email, req.body.password);
    res.status(200).send({ createdUser: user });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(422).send({ error: 'Error creating user' });
  }
  // res.status(200).contentType('text/html').send(`<h1>Success: id: ${25}, email: ${req.body.email}</h1>`);
});
app.get('/admin/see_all_users', async (req, res) => {
  const allUsers = await seeAllUsers();
  res.status(200).send({ allUsers });
});

// announcements
app.get('/announcements', async (req, res) => {
  const allAnnouncements = await announcementsForAll();
  res.status(200).send({ allAnnouncements });
});
app.post('/announcements', async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).send({ error: 'Title and content are required' });
  }
  const announcement = await creatNewAnnouncement(title, content);
  if (!announcement) {
    return res.status(500).send({ error: 'Failed to create announcement' });
  }
  res.status(201).send({ announcement });
});
app.delete('/announcements/:announcement_id', async (req, res) => {
  const { announcement_id } = req.params;
  if (!announcement_id) {
    return res.status(400).send({ error: 'Announcement ID is required' });
  }
  const announcement = await deleteAnnouncement(announcement_id);
  if (!announcement) {
    return res.status(500).send({ error: 'Failed to delete announcement' });
  }
  res.status(200).send({ message: 'Announcement deleted successfully' });
});
app.put('/announcements/:announcement_id', async (req, res) => {
  const { announcement_id } = req.params;
  const { title, content } = req.body;
  if (!announcement_id || !title || !content) {
    return res.status(400).send({ error: 'Announcement ID, title, and content are required' });
  }
  const announcement = await updateAnnouncement(announcement_id, title, content);
  if (!announcement) {
    return res.status(500).send({ error: 'Failed to update announcement' });
  }
  res.status(200).send({ announcement });
});

//event
app.get('/events', async (req, res) => {
  const allEvents = await showAllEvents();
  res.status(200).send({ allEvents });
});
app.post('/events', async (req, res) => {
  const { title, content,date} = req.body;
  if (!title || !content || !date) {
    return res.status(400).send({ error: 'Title and content are required' });
  }
  const event = await createNewEvent(title, content,date);
  if (!event) {
    return res.status(500).send({ error: 'Failed to create event' });
  }
  res.status(201).send({ event });
});
app.get('/events/:event_id', async (req, res) => {
  const { event_id } = req.params;
  if (!event_id) {
    return res.status(400).send({ error: 'Event ID is required' });
  }
  const event = await showSingleEvent(event_id);
  if (!event) {
    return res.status(404).send({ error: 'Event not found' });
  }
  res.status(200).send({ event });
});
app.delete('/events/:event_id', async (req, res) => {
  const { event_id } = req.params;
  if (!event_id) {
    return res.status(400).send({ error: 'Event ID is required' });
  }
  const event = await deleteEvent(event_id);
  if (!event) {
    return res.status(500).send({ error: 'Failed to delete event' });
  }
  res.status(200).send({ message: 'Event deleted successfully' });
});
app.put('/events/:event_id', async (req, res) => {
  const { event_id } = req.params;
  const { title, content } = req.body;
  if (!event_id || !title || !content) {
    return res.status(400).send({ error: 'Event ID, title, and content are required' });
  }
  const event = await updateEvent(event_id, title, content);
  if (!event) {
    return res.status(500).send({ error: 'Failed to update event' });
  }
  res.status(200).send({ event });
});

//articles
app.post('/articles', async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).send({ error: 'Title and content are required' });
  }
  const article = await createNewArticle(title, content);
  if (!article) {
    return res.status(500).send({ error: 'Failed to create article' });
  }
  res.status(201).send({ article });
});
app.get('/articles?staus=unprocessed', async (req, res) => {
  const allArticles = await showUnprocessedArticles();
  res.status(200).send({ allArticles });
});
app.put('/articles/:article_id', async (req, res) => {
  const { article_id } = req.params;
  const { status } = req.body;
  if (!article_id || !status) {
    return res.status(400).send({ error: 'Article ID and status are required' });
  }
  const article = await articleValidation(article_id, status);
  if (!article) {
    return res.status(500).send({ error: 'Failed to update article' });
  }
  res.status(200).send({ article });
});


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