"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.teacherAuth = teacherAuth;
const db_1 = __importDefault(require("../db"));
async function teacherAuth(req, res, next) {
    try {
        console.log("teacher auth called");
        const token = req.body?.token;
        const roomCode = req.body?.roomCode;
        if (!roomCode || roomCode === null) {
            return res.status(400).json({ error: "The room code is required!!" });
        }
        if (!token || token === null) {
            return res.status(400).json({ error: "The token is required!!" });
        }
        const room = await db_1.default.room.findUnique({
            where: { code: roomCode },
            include: { teacher: true }
        });
        if (!room || room === null) {
            return res.status(404).json({ error: "Room not found!!" });
        }
        if (!room.teacher || room.teacher.token !== token) {
            return res.status(403).json({ error: 'Invalid teacher token for this room' });
        }
        req.teacher = { id: room.teacher.id, name: room.teacher.name ?? undefined };
        return next();
    }
    catch (err) {
        console.error("teacher auth error : ", err);
        return res.status(500).json({ error: "Internal Server error!!" });
    }
}
