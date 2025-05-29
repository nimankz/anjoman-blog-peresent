import BlogService from "@/services/blog_service";
import { Request, Response, Router } from 'express';


export default class AnnouncementController {
  public router: Router;
  private blogService: BlogService;

  constructor(blogService: BlogService) {
    this.blogService = blogService;
    this.router = Router();
    this.router.get('/announcements', this.handleGetAnnouncements);
    this.router.post('/announcements', this.handlePostAnnouncement);
    this.router.get('/announcements/:id', this.handleGetAnnouncement);
    this.router.delete('/announcements/:id', this.handleDeleteAnnouncement);
    this.router.put('/announcements/:id', this.handleUpdateAnnouncement);
    this.router.get('/announcements/newComment', this.newComment);
    this.router.get('/announcements/:id/comments', this.getComments);
  }

  private handleGetAnnouncements = async (req: Request, res: Response) => {
    const announcements = await this.blogService.announcementsForAll();
    res.json(announcements).status(200);
  }

  private handlePostAnnouncement = async (req: Request, res: Response) => {
    const { title, content } = req.body;
    const announcement = await this.blogService.creatNewAnnouncement(title, content);
    res.json(announcement).status(201);
  }

  private newComment = async (req: Request, res: Response) => {
    const { announcementId, content, title } = req.body;
    if (!announcementId || !content) { 
      return res.status(400).send({ error: 'Announcement ID and content are required' });
    }
    const comment = await this.blogService.createNewCommentAnnouncment(content, announcementId, title);
    if (!comment) {
      return res.status(500).send({ error: 'Failed to create comment' });
    }
    res.json(comment).status(201);
  } 

  private getComments = async (req: Request, res: Response) => {
    const { id } = req.params;
    const comments = await this.blogService.showAllAnoncementComments(id);
    if (!comments) {
      return res.status(404).send({ error: 'Comments not found' });
    }
    res.json(comments).status(200);
  }

  private handleGetAnnouncement = async (req: Request, res: Response) => {
    const { id } = req.params;
    const announcement = await this.blogService.showAnnouncement(id);
    if (!announcement) {
      return res.status(404).send({ error: 'Announcement not found' });
    }
    res.json(announcement).status(200);
  }

  private handleDeleteAnnouncement = async (req: Request, res: Response) => {
    const { id } = req.params;
    const comment = await this.blogService.deleteAllAnnouncementComments(id);
    res.json(comment).status(200);
    const announcement = await this.blogService.deleteAnnouncement(id);
    res.json(announcement).status(200);
    
  }

  private handleUpdateAnnouncement = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, content } = req.body;
    const announcement = await this.blogService.updateAnnouncement(id, title, content);
    res.json(announcement).status(200);
  }
}