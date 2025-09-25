"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const config_1 = __importDefault(require("../config/config"));
const prismaClientSingleton = () => {
    return new client_1.PrismaClient();
};
const db = globalThis.prismaGlobal ?? prismaClientSingleton();
exports.default = db;
if (config_1.default.nodeEnv !== 'production')
    globalThis.prismaGlobal = db;
