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
exports.withTransaction = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const async_hooks_1 = require("async_hooks");
exports.prisma = new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'production' ? [] : ['query'],
});
class TransactionManager {
    constructor() {
        this.asyncLocalStorage = new async_hooks_1.AsyncLocalStorage();
    }
    withinTransaction(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingTx = this.asyncLocalStorage.getStore();
            if (existingTx) {
                return callback(existingTx);
            }
            return exports.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                return this.asyncLocalStorage.run(tx, () => callback(tx));
            }));
        });
    }
}
const transactionManager = new TransactionManager();
exports.withTransaction = transactionManager.withinTransaction.bind(transactionManager);
