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
class UserController {
    constructor(authService) {
        this.handlePostUsers = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const params = api_types_1.CreateUserRequestSchema.parse(req.body);
            const user = yield this.authService.signupWithEmail(params.email, params.password);
            const createUserResponse = api_types_1.CreateUserResponseSchema.parse({ user });
            res.send(createUserResponse).status(201);
        });
        this.handlePutUser = (req, res, userId) => __awaiter(this, void 0, void 0, function* () {
            const params = api_types_1.UpdateUserRequestSchema.parse(req.body);
            const user = yield this.authService.onboardUser(userId, params);
            const updateUserResponse = api_types_1.UpdateUserResponseSchema.parse({ user });
            res.send(updateUserResponse);
        });
        this.authService = authService;
        this.router = (0, express_1.Router)();
        this.router.post('/users', (0, utils_1.decorate)(this.handlePostUsers));
        this.router.put('/user', (0, utils_1.decorateWithAuth)(this.handlePutUser));
    }
}
exports.default = UserController;
