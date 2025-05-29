"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function getLoggedInUser() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield prisma.user.findFirstOrThrow();
    });
}
class BlogService {
    constructor() { }
    //announcements
    announcementsForAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const announcements = yield prisma.announcement.findMany({
                take: 100,
                orderBy: { 'createdAt': 'desc' }
            });
            return announcements;
        });
    }
    creatNewAnnouncement(title, content) {
        return __awaiter(this, void 0, void 0, function* () {
            const myuser = yield getLoggedInUser();
            const announcement = yield prisma.announcement.create({
                data: {
                    title,
                    content,
                    userId: myuser.id
                }
            });
            return announcement;
        });
    }
    showAnnouncement(announcementId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.announcement.findUniqueOrThrow({
                where: { id: announcementId },
            });
        });
    }
    deleteAnnouncement(announcementId) {
        return __awaiter(this, void 0, void 0, function* () {
            const myuser = yield getLoggedInUser();
            if (myuser.role !== client_1.UserRole.ADMIN) {
                throw new Error('Unauthorized');
            }
            const announcement = yield prisma.announcement.delete({
                where: {
                    id: announcementId,
                },
            });
            return announcement;
        });
    }
    updateAnnouncement(announcementId, title, content) {
        return __awaiter(this, void 0, void 0, function* () {
            const myuser = yield getLoggedInUser();
            if (myuser.role !== client_1.UserRole.ADMIN) {
                throw new Error('Unauthorized');
            }
            const announcement = yield prisma.announcement.update({
                where: {
                    id: announcementId,
                },
                data: {
                    title,
                    content,
                },
            });
            return announcement;
        });
    }
    //events
    showAllEvents() {
        return __awaiter(this, void 0, void 0, function* () {
            const events = yield prisma.event.findMany({
                take: 100,
                orderBy: { 'date': 'desc' }
            });
            return events;
        });
    }
    createNewEvent(name, content, date) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield getLoggedInUser();
            const event = yield prisma.event.create({
                data: {
                    name,
                    content,
                    date,
                    userId: user.id
                }
            });
            return event;
        });
    }
    showSingleEvent(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = yield prisma.event.findUnique({
                where: {
                    id: eventId,
                },
            });
            return event;
        });
    }
    deleteEvent(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Only allow admin
            const event = yield prisma.event.delete({
                where: {
                    id: eventId,
                },
            });
            return event;
        });
    }
    updateEvent(eventId, name, content) {
        return __awaiter(this, void 0, void 0, function* () {
            // Only allow admin
            const event = yield prisma.event.update({
                where: {
                    id: eventId,
                },
                data: {
                    name,
                    content,
                },
            });
            return event;
        });
    }
    //articles
    createNewArticle(title, content) {
        return __awaiter(this, void 0, void 0, function* () {
            // set logged in user id instead
            const article = yield prisma.article.create({
                data: {
                    title,
                    content,
                    userId: "1", // Replace with the actual user ID
                }
            });
            return article;
        });
    }
    showAllArticles(status) {
        return __awaiter(this, void 0, void 0, function* () {
            const whereClause = status ? { status } : {};
            const articles = yield prisma.article.findMany({
                where: whereClause,
                take: 100,
                orderBy: { 'createdAt': 'desc' }
            });
            return articles;
        });
    }
    // public async showSingleArticle(articleId: string) {
    //   const article = await prisma.article.findUnique({
    //     where: {
    //       id: articleId,
    //     },
    //   });
    //   return article;
    // }
    updateArticle(articleId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const article = yield prisma.article.update({
                where: {
                    id: articleId,
                },
                data: {
                    status,
                },
            });
            return article;
        });
    }
}
exports.default = BlogService;
