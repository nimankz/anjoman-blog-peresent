import BlogService from "@/services/blog_service";
import { Request, Response, Router } from 'express';

export default class ArticleController {
    constructor(private blogService: BlogService) {
        this.router = Router();
        this.router.get('/articles', this.handleGetArticles);
        this.router.post('/articles', this.handlePostArticle);
        this.router.get('/articles/:id', this.handleGetArticle);
        this.router.delete('/articles/:id', this.handleDeleteArticle);
        this.router.put('/articles/:id', this.handleUpdateArticle);
        this.router.get('/articles/:id/comments', this.handleGetCommentsForArticle);
        this.router.post('/articles/newComment', this.handleAddCommentToArticle);
    }
    
    public router: Router;

    private handleGetArticles = async (req: Request, res: Response) => {
        const articles = await this.blogService.showAllArticles();
        res.json(articles).status(200);
    }


    private handlePostArticle = async (req: Request, res: Response) => {
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).send({ error: 'Title and content are required' });
        }
        const article = await this.blogService.createNewArticle(title, content);
        res.json(article).status(201);
    }


    private handleGetArticle = async (req: Request, res: Response) => {
        const { id } = req.params;
        const article = await this.blogService.showSingleArticle(id);
        if (!article) {
            return res.status(404).send({ error: 'Article not found' });
        }
        res.json(article).status(200);
    }


    private handleDeleteArticle = async (req: Request, res: Response) => {
        const { id } = req.params;
        const article = await this.blogService.deleteArticle(id);
        res.json(article).status(200);
    }


    private handleUpdateArticle = async (req: Request, res: Response) => {
        const { id } = req.params;
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).send({ error: 'Title and content are required' });
        }
        const article = await this.blogService.updateArticle(id, title, content);
        res.json(article).status(200);
    }


    private handleGetCommentsForArticle = async (req: Request, res: Response) => {
        const { id } = req.params;
        const comments = await this.blogService.showAllArticleComments(id);
        if (!comments) {
            return res.status(404).send({ error: 'Comments not found for this article' });
        }
        res.json(comments).status(200);
    }


    private handleAddCommentToArticle = async (req: Request, res: Response) => {
        const { content, articleId, title } = req.body;
        if (!content) {
            return res.status(400).send({ error: 'Content is required for the comment' });
        }
        const comment = await this.blogService.createNewCommentArticle(content,articleId, title);
        if (!comment) {
            return res.status(500).send({ error: 'Failed to add comment' });
        }
        res.json(comment).status(201);
    }
}