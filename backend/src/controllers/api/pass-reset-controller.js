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
class PassResetController {
    constructor(authService) {
        this.handlePostPassResets = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const params = api_types_1.CreatePassResetRequestSchema.parse(req.body);
            yield this.authService.createPassReset(params.email);
            const createPassResetResponse = api_types_1.CreatePassResetResponseSchema.parse({ success: true });
            res.send(createPassResetResponse).status(200);
        });
        this.handleGetPassReset = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const passResetToken = (_a = req.params) === null || _a === void 0 ? void 0 : _a.passResetToken;
            const user = yield this.authService.getPassReset(passResetToken);
            const getPassResetResponse = api_types_1.GetPassResetResponseSchema.parse({
                passResetToken: (_b = user.passResetToken) !== null && _b !== void 0 ? _b : '',
                passResetTokenCreatedAt: (_d = (_c = user.passResetTokenCreatedAt) === null || _c === void 0 ? void 0 : _c.toISOString()) !== null && _d !== void 0 ? _d : '',
            });
            res.send(getPassResetResponse).status(200);
        });
        this.handlePutPassReset = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const passResetToken = (_a = req.params) === null || _a === void 0 ? void 0 : _a.passResetToken;
            const params = api_types_1.UpdatePassResetRequestSchema.parse(req.body);
            yield this.authService.updatePassReset(passResetToken, params.password);
            const updatePassResetResponse = api_types_1.UpdatePassResetResponseSchema.parse({ success: true });
            res.send(updatePassResetResponse).status(200);
        });
        this.authService = authService;
        this.router = (0, express_1.Router)();
        this.router.post('/pass-resets', (0, utils_1.decorate)(this.handlePostPassResets));
        this.router.get('/pass-resets/:passResetToken', (0, utils_1.decorate)(this.handleGetPassReset));
        this.router.put('/pass-resets/:passResetToken', (0, utils_1.decorate)(this.handlePutPassReset));
    }
}
exports.default = PassResetController;
