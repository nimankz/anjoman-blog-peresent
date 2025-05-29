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
const prisma_client_1 = require("@/prisma-client");
const errors_1 = require("@/domain/errors");
class OrgsService {
    constructor(emailService) {
        this.emailService = emailService;
    }
    listUserMemberships(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const memberships = yield prisma_client_1.prisma.membership.findMany({
                where: { userId },
                include: { organization: true }
            });
            return memberships;
        });
    }
    createOrganization(userId, name) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const organization = yield prisma_client_1.prisma.organization.create({
                    data: {
                        name,
                        memberships: { create: { userId, role: 'OWNER', status: 'ACTIVE' } }
                    }
                });
                return organization;
            }
            catch (error) {
                const constraintViolation = (0, errors_1.getUniqueConstraintViolation)(error);
                if ((constraintViolation === null || constraintViolation === void 0 ? void 0 : constraintViolation.model) === 'Organization' && (constraintViolation === null || constraintViolation === void 0 ? void 0 : constraintViolation.field) === 'name') {
                    throw new errors_1.ValidationError({ name: 'This name is already taken' });
                }
                throw error;
            }
        });
    }
}
exports.default = OrgsService;
