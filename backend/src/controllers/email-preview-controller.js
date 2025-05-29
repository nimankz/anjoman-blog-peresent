"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const config_1 = __importDefault(require("@/config"));
class EmailPreviewController {
    constructor(emailService) {
        this.handleListEmails = (req, res) => {
            const emails = this.emailService.getSentEmails();
            res.render('email-previews/index', { emails });
        };
        this.handleViewEmail = (req, res) => {
            const email = this.emailService.getSentEmailById(req.params.id);
            if (!email) {
                return res.status(404).send('Email not found');
            }
            res.render('email-previews/show', { email });
        };
        this.emailService = emailService;
        this.router = (0, express_1.Router)();
        if (config_1.default.NODE_ENV === 'development') {
            this.router.get('/email-previews', this.handleListEmails);
            this.router.get('/email-previews/:id', this.handleViewEmail);
        }
    }
}
exports.default = EmailPreviewController;
