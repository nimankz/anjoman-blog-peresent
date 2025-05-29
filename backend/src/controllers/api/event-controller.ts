import BlogService from "@/services/blog_service";
import { Request, Response, Router } from 'express';


export default class EventController {
    constructor(private blogService: BlogService) {
        this.router = Router();
        this.router.get('/events', this.handleGetEvents);
        this.router.post('/events', this.handlePostEvent);
        this.router.get('/events/:id', this.handleGetEvent);
        this.router.delete('/events/:id', this.handleDeleteEvent);
        this.router.put('/events/:id', this.handleUpdateEvent);
        this.router.get('/events/:id/comments', this.handelAllEventComments);
        this.router.post('/events/newComment', this.createNewCommentEvent);
    }
    public router: Router;
    
    private handleGetEvents = async (req: Request, res: Response) => {
        const events = await this.blogService.showAllEvents();
        res.json(events).status(200);
    }

    
    private handlePostEvent = async (req: Request, res: Response) => {
        const { title, content, date } = req.body;
        if (!title || !content || !date) {
            return res.status(400).send({ error: 'Title, content, and date are required' });
        }
        const event = await this.blogService.createNewEvent(title, content, date);
        res.json(event).status(201);
    }

    
    private handleGetEvent = async (req: Request, res: Response) => {
        const { id } = req.params;
        const event = await this.blogService.showSingleEvent(id);
        if (!event) {
            return res.status(404).send({ error: 'Event not found' });
        }
        res.json(event).status(200);
    }

    
    private handleDeleteEvent = async (req: Request, res: Response) => {
        const { id } = req.params;
        const event = await this.blogService.deleteEvent(id);
        res.json(event).status(200);
    }

    
    private handleUpdateEvent = async (req: Request, res: Response) => {
        const { id } = req.params;
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).send({ error: 'Title and content are required' });
        }
        const event = await this.blogService.updateEvent(id, title, content);
        res.json(event).status(200);
    }

    
    private handelAllEventComments = async (req: Request, res: Response) => {
        const { id } = req.params;
        const comments = await this.blogService.showAllEventComments(id);
        if (!comments) {
            return res.status(404).send({ error: 'Comments not found' });
        }
        res.json(comments).status(200);
    }

    
    private createNewCommentEvent = async (req: Request, res: Response) => {
        const { eventId, content, title } = req.body;
        if (!eventId || !content) {
            return res.status(400).send({ error: 'Event ID and content are required' });
        }
        const comment = await this.blogService.createNewCommentEvent(content, eventId, title);
        if (!comment) {
            return res.status(500).send({ error: 'Failed to create comment' });
        }
        res.json(comment).status(201);
    }
}
