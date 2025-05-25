import { PrismaClient, UserRole, ArticleStatus } from '@prisma/client'

const prisma = new PrismaClient();

async function getLoggedInUser() {
  return await prisma.user.findFirstOrThrow();
}

export default class BlogService {
  constructor() {}

  //announcements
  public async announcementsForAll() {
    const announcements = await prisma.announcement.findMany({
      take: 100,
      orderBy: { 'createdAt': 'desc' }
    });
    return announcements;
  }

  public async creatNewAnnouncement(title: string, content: string) {
    const myuser = await getLoggedInUser();

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        userId: myuser.id
      }});
    return announcement
  }
  public async showAnnouncement(announcementId: string) {
    return await prisma.announcement.findUniqueOrThrow({
      where: { id: announcementId },
    });
  }

  public async deleteAnnouncement(announcementId: string) {
    const myuser = await getLoggedInUser();

    if (myuser.role !== UserRole.ADMIN) {
      throw new Error('Unauthorized');
    }

    const announcement = await prisma.announcement.delete({
      where: {
        id: announcementId,
      },
    });
    return announcement;
  }
  public async updateAnnouncement(announcementId: string, title: string, content: string) {
    const myuser = await getLoggedInUser();

    if (myuser.role !== UserRole.ADMIN) {
      throw new Error('Unauthorized');
    }

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
  public async showAllEvents() {
    const events = await prisma.event.findMany({
      take: 100,
      orderBy: { 'date': 'desc' }
    });
    return events;
  }

  public async createNewEvent(name: string, content: string, date: Date) {
    const user = await getLoggedInUser();
    const event = await prisma.event.create({
      data: {
        name,
        content,
        date,
        userId: user.id
      }});
    return event
  }

  public async showSingleEvent(eventId: string) {
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });
    return event;
  }
  public async deleteEvent(eventId: string) {
    // Only allow admin
    const event = await prisma.event.delete({
      where: {
        id: eventId,
      },
    });
    return event;
  }
  public async updateEvent(eventId: string, name: string, content: string) {
    // Only allow admin
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
  public async createNewArticle(title: string, content: string) {
    // set logged in user id instead
    const article = await prisma.article.create({
      data:{
        title,
        content,
        userId: "1", // Replace with the actual user ID
      }});
    return article
  }

  public async showAllArticles(status?: ArticleStatus) {
    const whereClause = status ? { status } : {};
    const articles = await prisma.article.findMany({
      where: whereClause,
      take: 100,
      orderBy: { 'createdAt': 'desc' }
    });
    return articles;
  }

  // public async showSingleArticle(articleId: string) {
  //   const article = await prisma.article.findUnique({
  //     where: {
  //       id: articleId,
  //     },
  //   });
  //   return article;
  // }

  public async updateArticle(articleId: string, status: ArticleStatus) {
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

}