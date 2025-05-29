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
const express_1 = require("express");
const api_types_1 = require("api-types");
const utils_1 = require("@/utils");
class SessionController {
    constructor(authService) {
        this.handlePostSessions = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const params = api_types_1.CreateSessionRequestSchema.parse(req.body);
            const { provider } = params;
            let user;
            if (provider === 'credentials') {
                user = yield this.authService.authenticateWithCreds(params.email, params.password);
            }
            else if (provider === 'email_confirmation') {
                user = yield this.authService.authenticateWithEmailConfirmation(params.token);
            }
            else if (provider === 'google') {
                user = yield this.authService.authenticateWithGoogle(params.token);
            }
            else if (provider === 'invitation') {
                // user = await this.authService.authenticateWithInvitation(params.token);
            }
            else {
                throw new Error('Invalid provider');
            }
            const accessToken = this.authService.createAccessToken(user.id);
            const createSessionResponse = api_types_1.CreateSessionResponseSchema.parse({ user, accessToken });
            res.send(createSessionResponse).status(200);
        });
        this.handleGetSession = (req, res, userId) => __awaiter(this, void 0, void 0, function* () {
            const user = yield this.authService.findUserById(userId);
            const getSessionResponse = api_types_1.GetSessionResponseSchema.parse({ user });
            res.send(getSessionResponse).status(200);
        });
        this.authService = authService;
        this.router = (0, express_1.Router)();
        this.router.get('/session', (0, utils_1.decorateWithAuth)(this.handleGetSession));
        this.router.post('/sessions', (0, utils_1.decorate)(this.handlePostSessions));
    }
}
exports.default = SessionController;
