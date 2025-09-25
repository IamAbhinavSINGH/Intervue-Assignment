import { Request , Response , NextFunction } from "express";
import db from "../db";

export interface AuthRequest extends Request{
    teacher? : { id : string , name? : string };
}

export async function teacherAuth(req : AuthRequest , res : Response , next : NextFunction) {
    try{
        console.log("teacher auth called");

        const token = req.body?.token as string | undefined;
        const roomCode = req.body?.roomCode as string | undefined;

        if(!roomCode || roomCode === null){
            return res.status(400).json({ error : "The room code is required!!" });
        }
        if(!token || token === null){
            return res.status(400).json({ error : "The token is required!!" });
        }

        const room = await db.room.findUnique({
            where : { code : roomCode },
            include : { teacher : true }
        });

        if(!room || room === null){
            return res.status(404).json({ error : "Room not found!!" });
        }

        if (!room.teacher || room.teacher.token !== token) {
            return res.status(403).json({ error: 'Invalid teacher token for this room' });
        }

        req.teacher = { id: room.teacher.id, name: room.teacher.name ?? undefined };
        return next();
    }catch(err){
        console.error("teacher auth error : " , err);
        return res.status(500).json({ error : "Internal Server error!!" });
    }
}