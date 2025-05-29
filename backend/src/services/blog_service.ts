import { PrismaClient, UserRole, ArticleStatus } from '@prisma/client'
import e from 'express';

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
    const myuser = await getLoggedInUser();
    if (myuser.role !== UserRole.ADMIN) {
      throw new Error('Unauthorized');
    } 
    else {
    const event = await prisma.event.delete({
      where: {
        id: eventId,
      },
    });
    return event;}
  }

  
  public async updateEvent(eventId: string, name: string, content: string) {
    // Ensure that the event exists before updating
    const existingEvent = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });
    if (!existingEvent) {
      throw new Error('Event not found');
    }
    // Check if the user is an admin before updating
    const myuser = await getLoggedInUser();
    if (myuser.role !== UserRole.ADMIN) {
      throw new Error('Unauthorized');
    }
    else if (myuser.role === UserRole.ADMIN) {
    // Proceed with the update if the user is an admin
    
    const event = await prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        name,
        content,
      },
    });
    return event;}
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


  public async showSingleArticle(articleId: string) {
    const article = await prisma.article.findUnique({
      where: {
        id: articleId,
      },
    });
    return article;
  }


  public async updateArticle(articleId: string, status: ArticleStatus, content?: string, title?: string) {
    // Ensure that the article exists before updating
    const existingArticle = await prisma.article.findUnique({
      where: {
        id: articleId,
      },
    });
    if (!existingArticle) {
      throw new Error('Article not found');
    }
    // Check if the user is an admin before updating
    const myuser = await getLoggedInUser();
    if (myuser.role !== UserRole.ADMIN) {
      throw new Error('Unauthorized');
    }
    else if (myuser.role === UserRole.ADMIN) {
    const article = await prisma.article.update({
      where: {
        id: articleId,
      },
      data: {
        status,
        content: content || existingArticle.content, // Use existing content if not provided
        title: title || existingArticle.title, // Use existing title if not provided
        userId: myuser.id, // Update with the logged-in user's ID
      },
    });
    return article;
  }
  }


  public async deleteArticle(articleId: string) {
    // Ensure that the article exists before deleting
    const existingArticle = await prisma.article.findUnique({
      where: {
        id: articleId,
      },
    });
    if (!existingArticle) {
      throw new Error('Article not found');
    }

    const myuser = await getLoggedInUser();
    if (myuser.role !== UserRole.ADMIN) {
      throw new Error('Unauthorized');
    }
    else if (myuser.role === UserRole.ADMIN) {
    
    const article = await prisma.article.delete({
      where: {
        id: articleId,
      },
    });
    return article;
  }
  }



  //comments
  public async createNewCommentAnnouncment(content: string, announcementId: string ,title?: string) {
    const myuser = await getLoggedInUser();
    const comment = await prisma.comment.create({
      data: {
        content,
        announcementId,
        userId: myuser.id,
        title: title || '', // Optional title, default to empty string if not provided
      }});
    return comment;
  }


  public async createNewCommentArticle(content: string, articleId: string, title?: string) {
    const myuser = await getLoggedInUser();
    const comment = await prisma.comment.create({
      data: {
        content,
        articleId,
        userId: myuser.id,
        title: title || '', // Optional title, default to empty string if not provided
      }});
    return comment;
  }


  public async createNewCommentEvent(content: string, eventId: string, title?: string ) {
    const myuser = await getLoggedInUser();
    const comment = await prisma.comment.create({
      data: {
        content,
        eventId,
        userId: myuser.id,
        title: title || '', // Optional title, default to empty string if not provided
      }});
    return comment;
  }


  public async showAllArticleComments(articleId?: string) {
    if (!articleId) {
      throw new Error('Article ID is required to fetch comments');
    }
    // Fetch comments for the specified article
    const comments = await prisma.comment.findMany({
      where: {
        articleId: articleId, // Filter by articleId if provided
      },
      take: 100,
      orderBy: { 'createdAt': 'desc' }
    });
    return comments;
  }


  public async showAllAnoncementComments(announcementId?: string) {
    if (!announcementId) {
      throw new Error('Announcement ID is required to fetch comments');
    }
    // Fetch comments for the specified announcement
    const comments = await prisma.comment.findMany({
      where: {
        announcementId: announcementId, // Filter by announcementId if provided
      },
      take: 100,
      orderBy: { 'createdAt': 'desc' }
    });
    return comments;
  }


  public async deleteAllAnnouncementComments(announcementId: string) {
    const myuser = await getLoggedInUser();
    if (myuser.role !== UserRole.ADMIN) {
      throw new Error('Unauthorized');
    }
    const comments = await prisma.comment.deleteMany({
      where: {
        announcementId: announcementId, // Filter by announcementId
      },
    });
    return comments;
  }


  public async showAllEventComments(eventId?: string) {
    if (!eventId) {
      throw new Error('Event ID is required to fetch comments');
    }
    // Fetch comments for the specified event

    const comments = await prisma.comment.findMany({
      where: {
        eventId: eventId, // Filter by eventId if provided
      },
      take: 100,
      orderBy: { 'createdAt': 'desc' }
    });
    return comments;
  }

  public async deleteComment(commentId: string,userId?: string) {

    const myuser = await getLoggedInUser();
    if (myuser.id !== userId && myuser.role !== UserRole.ADMIN) {
      throw new Error('Unauthorized');
    }
    else if (myuser.role === UserRole.ADMIN || myuser.id === userId) {
    const comment = await prisma.comment.delete({
      where: {
        id: commentId,
      },
    });
    return comment;
  }
  }

  public async updateComment(commentId: string, content: string) {
    // Ensure that the comment exists before updating
    const existingComment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
    });
    if (!existingComment) {
      throw new Error('Comment not found');
    }
    // Check if the user is an admin before updating
    const myuser = await getLoggedInUser();
    if (myuser.role !== UserRole.ADMIN && myuser.id !== existingComment.userId) {
      throw new Error('Unauthorized');
    }
    else if (myuser.role === UserRole.ADMIN || myuser.id === existingComment.userId) {
      const comment = await prisma.comment.update({
        where: {
          id: commentId,
        },
        data: {
          content,
          userId: myuser.id, // Update with the logged-in user's ID
        },
      });
      return comment;
    }
  }

}