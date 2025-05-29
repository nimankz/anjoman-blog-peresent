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
const jsonwebtoken_1 = require("jsonwebtoken");
const google_auth_library_1 = require("google-auth-library");
const uuid_1 = require("uuid");
const bcrypt_1 = require("bcrypt");
const client_1 = require("@prisma/client");
const config_1 = __importDefault(require("@/config"));
const prisma_client_1 = require("@/prisma-client");
const errors_1 = require("@/domain/errors");
class AuthService {
    constructor(emailService) {
        this.emailService = emailService;
    }
    onboardUser(userId, updateParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma_client_1.prisma.user.findUnique({ where: { id: userId } });
            if (!user) {
                throw new errors_1.ResourceNotFoundError('User');
            }
            const updatedUser = yield prisma_client_1.prisma.user.update({
                where: { id: userId },
                data: Object.assign(Object.assign({}, updateParams), { onboarded: true })
            });
            return updatedUser;
        });
    }
    createPassReset(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma_client_1.prisma.user.findUnique({ where: { email: this.sanitizeEmail(email) } });
            if (!user) {
                return true;
            }
            const updatedUser = yield prisma_client_1.prisma.user.update({
                where: { id: user.id },
                data: {
                    passResetToken: (0, uuid_1.v4)(),
                    passResetTokenCreatedAt: new Date()
                },
            });
            yield this.emailService.sendPassReset(updatedUser.email, { link: this.getPassResetLink(updatedUser) });
            return true;
        });
    }
    getPassReset(passResetToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma_client_1.prisma.user.findUnique({ where: { passResetToken } });
            if (!user || !user.passResetToken || !user.passResetTokenCreatedAt) {
                throw new errors_1.InvalidLinkError();
            }
            return user;
        });
    }
    updatePassReset(passResetToken, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma_client_1.prisma.user.findUnique({ where: { passResetToken } });
            if (!user || !user.passResetTokenCreatedAt) {
                throw new errors_1.InvalidLinkError();
            }
            // Check if the token is expired (e.g., after 24 hours)
            const tokenAge = Date.now() - user.passResetTokenCreatedAt.getTime();
            if (tokenAge > 24 * 60 * 60 * 1000) {
                throw new errors_1.InvalidLinkError();
            }
            const hashedPassword = yield (0, bcrypt_1.hash)(newPassword, 10);
            yield prisma_client_1.prisma.user.update({
                where: { id: user.id },
                data: {
                    hashedPassword,
                    passResetToken: null,
                    passResetTokenCreatedAt: null,
                },
            });
            return true;
        });
    }
    verifyAccessToken(accessToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const decoded = (0, jsonwebtoken_1.verify)(accessToken || '', config_1.default.JWT_SECRET);
                return decoded.sub;
            }
            catch (error) {
                if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
                    throw new errors_1.AuthenticationFailedError(`access token verification failed: ${error.message}`);
                }
                throw error;
            }
        });
    }
    findUserById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma_client_1.prisma.user.findUnique({ where: { id: userId } });
            if (!user) {
                throw new errors_1.ResourceNotFoundError('User');
            }
            return user;
        });
    }
    signupWithEmail(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const sanitizedEmail = this.sanitizeEmail(email);
            const hashedPassword = yield (0, bcrypt_1.hash)(password, 10);
            let user = yield prisma_client_1.prisma.user.findUnique({ where: { email: sanitizedEmail } });
            if (user && user.emailConfirmed) {
                throw new errors_1.ValidationError({ email: 'Email already in use' });
            }
            let shouldSendEmail = false;
            if (user && this.shouldResendConfirmationEmail(user)) {
                user = yield prisma_client_1.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        emailConfirmationToken: (0, uuid_1.v4)(),
                        emailConfirmationTokenSentAt: new Date(),
                    },
                });
                shouldSendEmail = true;
            }
            if (!user) {
                user = yield prisma_client_1.prisma.user.create({
                    data: {
                        email: sanitizedEmail,
                        hashedPassword,
                        source: client_1.Source.SELF_SIGNUP,
                        emailConfirmed: false,
                        emailConfirmationToken: (0, uuid_1.v4)(),
                        emailConfirmationTokenSentAt: new Date(),
                    },
                });
                shouldSendEmail = true;
            }
            if (shouldSendEmail) {
                yield this.emailService.sendAccountConfirmation(user.email, { link: this.getConfirmationLink(user) });
            }
            return user;
        });
    }
    shouldResendConfirmationEmail(user) {
        return !user.emailConfirmed &&
            user.emailConfirmationTokenSentAt !== null &&
            user.emailConfirmationTokenSentAt < new Date(Date.now() - 5 * 60 * 1000);
    }
    createAccessToken(userId) {
        return (0, jsonwebtoken_1.sign)({}, config_1.default.JWT_SECRET, {
            expiresIn: '1w',
            audience: config_1.default.SERVICE_NAME,
            subject: userId,
            issuer: config_1.default.SERVICE_NAME
        });
    }
    authenticateWithCreds(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma_client_1.prisma.user.findUnique({ where: { email: this.sanitizeEmail(email) } });
            if (!user) {
                throw new errors_1.AuthenticationFailedError('Invalid credentials');
            }
            const passwordIsCorrect = yield (0, bcrypt_1.compare)(password, user.hashedPassword || '');
            if (!passwordIsCorrect) {
                throw new errors_1.AuthenticationFailedError('Invalid credentials');
            }
            if (!user.emailConfirmed) {
                throw new errors_1.AuthenticationFailedError('Email not confirmed.');
            }
            return user;
        });
    }
    authenticateWithEmailConfirmation(emailConfirmationToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma_client_1.prisma.user.findUnique({
                where: { emailConfirmationToken },
            });
            if (!user) {
                throw new errors_1.AuthenticationFailedError('Invalid token');
            }
            yield this.confirmUserEmail(user);
            return user;
        });
    }
    authenticateWithGoogle(idToken) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const client = new google_auth_library_1.OAuth2Client("config.GOOGLE_CLIENT_ID");
            const ticket = yield client.verifyIdToken({
                idToken: idToken,
                audience: "config.GOOGLE_CLIENT_ID",
            });
            const email = (_a = ticket.getPayload()) === null || _a === void 0 ? void 0 : _a.email;
            if (!email) {
                throw new Error('Invalid token');
            }
            const sanitizedEmail = this.sanitizeEmail(email);
            const user = yield prisma_client_1.prisma.user.findUnique({ where: { email: sanitizedEmail } });
            if (!user) {
                return yield prisma_client_1.prisma.user.create({
                    data: {
                        email: sanitizedEmail,
                        source: 'SELF_SIGNUP',
                        emailConfirmed: true,
                    },
                });
            }
            yield this.confirmUserEmail(user);
            return user;
        });
    }
    authenticateWithInvitation(invitationToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const membership = yield prisma_client_1.prisma.membership.findUnique({
                where: { invitationToken },
                include: {
                    user: true,
                },
            });
            if (!membership) {
                throw new Error('Invalid invitation token');
            }
            yield (0, prisma_client_1.withTransaction)(tx => {
                tx.membership.update({
                    where: { id: membership.id },
                    data: {
                        invitationToken: null,
                        invitationSentAt: null,
                    },
                });
                return this.confirmUserEmail(membership.user);
            });
            return membership.user;
        });
    }
    confirmUserEmail(user) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, prisma_client_1.withTransaction)(tx => {
                return tx.user.update({
                    where: { id: user.id },
                    data: {
                        emailConfirmed: true,
                        emailConfirmationToken: null,
                        emailConfirmationTokenSentAt: null,
                    },
                });
            });
        });
    }
    sanitizeEmail(email) {
        return email.toLowerCase();
    }
    getConfirmationLink(user) {
        return `http://localhost:3000/confirm/${user.emailConfirmationToken}`;
    }
    getPassResetLink(user) {
        return `http://localhost:3000/new-password/${user.passResetToken}`;
    }
}
exports.default = AuthService;
