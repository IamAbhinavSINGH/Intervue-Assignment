"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoomHistory = exports.joinRoom = exports.createRoom = void 0;
const db_1 = __importDefault(require("../db"));
const utils_1 = require("../utils");
// api/v1/room  (POST)
const createRoom = async (req, res) => {
    try {
        const isStudent = req.query.isStudent === 'true';
        if (isStudent) {
            return res.status(400).json({ error: "Student cannot create rooms!!" });
        }
        let code = (0, utils_1.generateRoomCode)();
        while (await db_1.default.room.findUnique({ where: { code } })) {
            code = (0, utils_1.generateRoomCode)();
        }
        const token = (0, utils_1.generateToken)();
        const teacher = await db_1.default.teacher.create({
            data: {
                name: "New Teacher",
                token: token
            }
        });
        const room = await db_1.default.room.create({
            data: {
                title: "New Room",
                code: code,
                teacherId: teacher.id
            }
        });
        await db_1.default.teacher.update({
            where: { id: teacher.id },
            data: {
                roomId: room.id
            }
        });
        return res.json({
            roomId: room.id,
            roomCode: room.code,
            teacherId: teacher.id,
            teacherToken: teacher.token,
            teacherName: teacher.name
        });
    }
    catch (err) {
        console.log("create room error : ", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.createRoom = createRoom;
// api/v1/room/:code?isStudent=true  (POST)
const joinRoom = async (req, res) => {
    try {
        const { code } = req.params;
        const isStudent = req.query.isStudent === 'true';
        const name = req.query.name;
        if (!code || code === null) {
            return res.status(400).json({ error: "Room Code required!!" });
        }
        const room = await db_1.default.room.findUnique({
            where: { code: code },
            include: { teacher: true },
        });
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }
        if (isStudent) {
            return res.json({
                roomId: room.id,
                code: room.code,
                title: room.title,
            });
        }
        if (room.teacher) {
            return res.status(403).json({
                error: 'Room already has a teacher. Please provide teacher token to authenticate.',
            });
        }
        const token = (0, utils_1.generateToken)();
        const teacher = await db_1.default.teacher.create({
            data: {
                name: name ?? 'Teacher',
                token: token,
                roomId: room.id,
            },
        });
        await db_1.default.room.update({
            where: { id: room.id },
            data: {
                teacherId: teacher.id,
            },
        });
        return res.json({
            message: 'Teacher joined as owner for this room',
            teacherToken: token,
            teacherId: teacher.id,
            roomId: room.id,
            roomCode: room.code
        });
    }
    catch (err) {
        console.error("Join room error : ", err);
        return res.status(500).json({ error: "Internal Server Error!!" });
    }
};
exports.joinRoom = joinRoom;
// api/v1/room/:code/history (GET)
const getRoomHistory = async (req, res) => {
    try {
        const { code } = req.params;
        const room = await db_1.default.room.findUnique({
            where: { code },
            include: {
                questions: {
                    include: {
                        options: {
                            include: {
                                responses: true,
                            },
                        },
                    },
                },
            },
        });
        if (!room)
            return res.status(404).json({ error: 'Room not found' });
        const history = room.questions.map((q) => ({
            id: q.id,
            text: q.text,
            timeLimit: q.timeLimit,
            status: q.status,
            createdAt: q.createdAt,
            startedAt: q.startedAt,
            endAt: q.endAt,
            options: q.options.map((opt) => ({
                id: opt.id,
                text: opt.text,
                isCorrect: opt.isCorrect,
                responseCount: opt.responses.length,
            })),
        }));
        return res.json({
            roomId: room.id,
            code: room.code,
            history: history
        });
    }
    catch (err) {
        console.error('getRoomHistory error', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getRoomHistory = getRoomHistory;
