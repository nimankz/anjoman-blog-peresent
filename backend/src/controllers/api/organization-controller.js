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
class OrganizationController {
    constructor(orgsService) {
        this.handlePostOrganizations = (req, res, userId) => __awaiter(this, void 0, void 0, function* () {
            const params = api_types_1.CreateOrganizationRequestSchema.parse(req.body);
            const organization = yield this.orgsService.createOrganization(userId, params.name);
            const createOrganizationResponse = api_types_1.CreateOrganizationResponseSchema.parse({ organization });
            res.send(createOrganizationResponse).status(200);
        });
        this.orgsService = orgsService;
        this.router = (0, express_1.Router)();
        this.router.post('/organizations', (0, utils_1.decorateWithAuth)(this.handlePostOrganizations));
    }
}
exports.default = OrganizationController;
