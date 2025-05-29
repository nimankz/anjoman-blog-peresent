"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidLinkError = exports.ResourceNotFoundError = exports.AuthenticationFailedError = exports.getUniqueConstraintViolation = exports.ValidationError = exports.ClientError = void 0;
const client_1 = require("@prisma/client");
class ClientError extends Error {
    constructor(message) {
        super(message);
    }
    getErrorData() {
        return {
            id: this.constructor.name,
            params: this.getErrorParams(),
        };
    }
}
exports.ClientError = ClientError;
class ValidationError extends ClientError {
    constructor(errors) {
        super("Validation Error");
        this.getErrorParams = () => {
            return this.errors;
        };
        this.errors = errors;
    }
    getStatusCode() {
        return 422;
    }
}
exports.ValidationError = ValidationError;
const getUniqueConstraintViolation = (error) => {
    var _a, _b, _c;
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const fieldName = Array.isArray((_a = error.meta) === null || _a === void 0 ? void 0 : _a.target) ? (_b = error.meta) === null || _b === void 0 ? void 0 : _b.target[0] : 'unkown';
        const modelName = typeof ((_c = error.meta) === null || _c === void 0 ? void 0 : _c.modelName) === 'string' ? error.meta.modelName : 'unknown';
        return { model: modelName, field: fieldName };
    }
    return undefined;
};
exports.getUniqueConstraintViolation = getUniqueConstraintViolation;
class AuthenticationFailedError extends ClientError {
    constructor(message) {
        super(message);
    }
    getStatusCode() {
        return 401;
    }
    getErrorParams() {
        return {
            message: this.message,
        };
    }
}
exports.AuthenticationFailedError = AuthenticationFailedError;
class ResourceNotFoundError extends ClientError {
    constructor(resourceName) {
        super(`${resourceName} not found`);
        this.resourceName = resourceName;
    }
    getStatusCode() {
        return 404;
    }
    getErrorParams() {
        return {
            resource: this.resourceName,
            message: this.message,
        };
    }
}
exports.ResourceNotFoundError = ResourceNotFoundError;
class InvalidLinkError extends ClientError {
    constructor() {
        super('This link is either invalid or expired');
    }
    getStatusCode() {
        return 400;
    }
    getErrorParams() {
        return {
            message: this.message,
        };
    }
}
exports.InvalidLinkError = InvalidLinkError;
