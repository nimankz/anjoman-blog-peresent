"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const zod_1 = require("zod");
(0, dotenv_1.config)();
const configSchema = zod_1.z.object({
    SERVICE_NAME: zod_1.z.string(),
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    LOG_LEVEL: zod_1.z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    PORT: zod_1.z.string().default('4000').transform(Number),
    DATABASE_URL: zod_1.z.string(),
    JWT_SECRET: zod_1.z.string(), // generate using: `openssl rand -hex 32`
});
const configData = configSchema.parse(process.env);
exports.default = configData;
