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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ejs_1 = require("ejs");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const html_to_text_1 = require("html-to-text");
const config_1 = __importDefault(require("@/config"));
class EmailService {
    constructor(transporter) {
        this.sentEmails = [];
        this.sendEmail = (from, to, subject, html) => __awaiter(this, void 0, void 0, function* () {
            const text = (0, html_to_text_1.convert)(html);
            const email = yield this.transporter.sendMail({ from, to, subject, html, text });
            if (config_1.default.NODE_ENV !== 'production') {
                this.sentEmails.push(JSON.parse(email.message));
            }
            return email;
        });
        this.readTemplate = (templateName, context) => __awaiter(this, void 0, void 0, function* () {
            const layoutTemplate = yield promises_1.default.readFile(path_1.default.join(__dirname, '../../views/emails/layout.ejs'), 'utf-8');
            const bodyTemplate = yield promises_1.default.readFile(path_1.default.join(__dirname, `../../views/emails/${templateName}.ejs`), 'utf-8');
            const bodyContent = (0, ejs_1.render)(bodyTemplate, context);
            return (0, ejs_1.render)(layoutTemplate, { body: bodyContent });
        });
        this.transporter = transporter;
    }
    getSentEmails() {
        return this.sentEmails;
    }
    getSentEmailById(id) {
        return this.sentEmails.find(email => email.messageId === id);
    }
    sendAccountConfirmation(to, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const from = 'no-reply@awesome-app.com';
            const subject = 'Confirm your account';
            const htmlContent = yield this.readTemplate('account-confirmation', context);
            return this.sendEmail(from, to, subject, htmlContent);
        });
    }
    sendPassReset(to, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const from = 'no-reply@awesome-app.com';
            const subject = 'Reset your password';
            const htmlContent = yield this.readTemplate('pass-reset', context);
            return this.sendEmail(from, to, subject, htmlContent);
        });
    }
}
exports.default = EmailService;
