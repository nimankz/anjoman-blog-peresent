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
exports.logger = exports.decorateWithAuth = exports.decorate = void 0;
const winston_1 = require("winston");
const jsonwebtoken_1 = require("jsonwebtoken");
const errors_1 = require("@/domain/errors");
const config_1 = __importDefault(require("@/config"));
const decorate = (handler) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield handler(req, res, next);
        }
        catch (err) {
            next(err);
        }
    });
};
exports.decorate = decorate;
const decorateWithAuth = (handler) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const accessToken = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
            const decoded = (0, jsonwebtoken_1.verify)(accessToken || '', config_1.default.JWT_SECRET);
            yield handler(req, res, decoded.sub);
        }
        catch (err) {
            if (err instanceof jsonwebtoken_1.JsonWebTokenError) {
                next(new errors_1.AuthenticationFailedError(`Access token verification failed: ${err.message}`));
            }
            else {
                next(err);
            }
        }
    });
};
exports.decorateWithAuth = decorateWithAuth;
// Learn more about winston logging
// https://betterstack.com/community/guides/logging/how-to-install-setup-and-use-winston-and-morgan-to-log-node-js-applications/
function safeStringify(obj) {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return '[Circular]';
            }
            seen.add(value);
        }
        return value;
    }, 2);
}
const logFormats = [
    winston_1.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSS' }),
    winston_1.format.splat(),
];
if (config_1.default.NODE_ENV === 'production') {
    logFormats.push(winston_1.format.json());
}
else {
    logFormats.push(winston_1.format.colorize());
    logFormats.push(winston_1.format.printf((info) => {
        let message = info.message;
        if (typeof message === 'object') {
            message = safeStringify(message);
        }
        return `${info.timestamp} [${info.level}] ${message}`;
    }));
}
exports.logger = (0, winston_1.createLogger)({
    level: config_1.default.LOG_LEVEL,
    format: winston_1.format.combine(...logFormats),
    defaultMeta: { service: config_1.default.SERVICE_NAME },
    transports: [new winston_1.transports.Console()]
});
