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
exports.requestLoggerMiddleware = exports.serviceErrorMiddleware = exports.clientErrorMiddleware = exports.routeNotFoundMiddleware = void 0;
const errors_1 = require("@/domain/errors");
const zod_1 = require("zod");
const zod_validation_error_1 = require("zod-validation-error");
const morgan_1 = __importDefault(require("morgan"));
const utils_1 = require("@/utils");
const routeNotFoundMiddleware = (req, res) => {
    res.status(404).json({ error: 'Not Found' });
};
exports.routeNotFoundMiddleware = routeNotFoundMiddleware;
const clientErrorMiddleware = (err, req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (err instanceof errors_1.ClientError) {
        const clientError = err;
        res.status(clientError.getStatusCode()).json(clientError.getErrorData());
    }
    else if (err instanceof zod_1.ZodError) {
        const validationError = (0, zod_validation_error_1.fromError)(err);
        res.status(400).json({ id: 'InvalidRequest', params: { message: validationError.toString() } });
    }
    else {
        next(err);
    }
});
exports.clientErrorMiddleware = clientErrorMiddleware;
const serviceErrorMiddleware = (err, req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (res.status instanceof Function) {
        res.status(500).send({ message: 'Internal Server Error' });
    }
    next(err);
});
exports.serviceErrorMiddleware = serviceErrorMiddleware;
exports.requestLoggerMiddleware = (0, morgan_1.default)(':method :url :status - :response-time ms', {
    stream: {
        write: (message) => utils_1.logger.info(message.trim())
    }
});
