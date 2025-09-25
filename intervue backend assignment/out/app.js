"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = __importDefault(require("./config/config"));
const routes_1 = __importDefault(require("./routes"));
const pollHandlers_1 = __importDefault(require("./sockets/pollHandlers"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
    }
});
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['*'],
}));
app.use(express_1.default.json());
io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);
    (0, pollHandlers_1.default)(io, socket);
});
app.use('/api/v1', routes_1.default);
httpServer.listen(config_1.default.port, () => {
    console.log("Socket Server listening on port", config_1.default.port);
});
