import express, { json, urlencoded } from 'express';
import { PrismaClient, User } from '@prisma/client'
import cors from 'cors';
import path from 'path';
import config from '@/config';

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

app.get('/', async (req, res) => {
  // const result = await test(1, 2);
  res.send({ health: 'ok' });
});

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