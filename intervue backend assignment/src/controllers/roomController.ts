import { Request , Response } from "express";
import { AuthRequest } from "../middleware/teacherAuth";
import db from "../db";
import { generateRoomCode , generateToken } from "../utils";

// api/v1/room  (POST)
export const createRoom = async (req : Request , res : Response) => {
    try{
        const isStudent = req.query.isStudent === 'true';
        if(isStudent){
            return res.status(400).json({ error : "Student cannot create rooms!!" });
        }
        
        let code = generateRoomCode();
        while (await db.room.findUnique({ where: { code } })) {
            code = generateRoomCode();
        }
        const token = generateToken();

        const teacher = await db.teacher.create({
            data : {
                name : "New Teacher",
                token : token
            }
        });

        const room = await db.room.create({
            data : { 
               title : "New Room",
               code : code,
                teacherId : teacher.id
            }
        });

        await db.teacher.update({
            where : { id : teacher.id },
            data : {
                roomId : room.id
            }
        });

        return res.json({
            roomId : room.id,
            roomCode : room.code,
            teacherId : teacher.id,
            teacherToken : teacher.token,
            teacherName : teacher.name
        });

    }catch(err){
        console.log("create room error : " , err);
        return res.status(500).json({ error : "Internal Server Error" });
    }  
}

// api/v1/room/:code?isStudent=true  (POST)
export const joinRoom = async (req : Request , res : Response) => {
    try{
        const { code } = req.params;
        const isStudent = req.query.isStudent === 'true';
        const name = req.query.name as string | undefined;
        
        if(!code || code === null){
            return res.status(400).json({ error : "Room Code required!!" });
        }

        const room = await db.room.findUnique({
            where: { code : code },
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

        const token = generateToken();
        const teacher = await db.teacher.create({
            data: {
                name : name ?? 'Teacher',
                token : token,
                roomId: room.id,
            },
        });

        await db.room.update({
            where: { id: room.id },
            data: {
                teacherId: teacher.id,
            },
        });

        return res.json({
            message: 'Teacher joined as owner for this room',
            teacherToken: token,
            teacherId: teacher.id,
            roomId : room.id,
            roomCode : room.code
        });

    }catch(err){
        console.error("Join room error : " , err);
        return res.status(500).json({ error : "Internal Server Error!!" });
    }
}

// api/v1/room/:code/history (GET)
export const getRoomHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.params;
    const room = await db.room.findUnique({
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

    if (!room) return res.status(404).json({ error: 'Room not found' });

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
        history : history
    });
  } catch (err) {
    console.error('getRoomHistory error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};