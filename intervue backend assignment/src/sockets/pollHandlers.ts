import { Server , Socket } from 'socket.io';
import db from '../db';
import { RoomRuntime , Student , Teacher , LiveQuestion } from '../types';
import { activeRooms } from './roomStore';

export default async function registerPollHandlers(io : Server , socket : Socket){

    // teacher joins room
    socket.on('teacher:join' , ({ code , teacherId , token }) => {
        let room = activeRooms.get(code);
        if(!room){
            room = {
                code : code,
                teacher : { 
                    id : teacherId,
                    token : token,
                    socketId : socket.id
                } as Teacher,
                questions : [],
                students : new Map()
            } as RoomRuntime

            activeRooms.set(code , room);
        }

        socket.join(code);
        console.log(`Teacher ${teacherId} joined room ${code}`);
    });

    // student joins room
    socket.on('student:join' , ({ code , name , clientId }) => {
        const room = activeRooms.get(code);
        if(!room){
            socket.emit('error' , { message : "Room not active" });
            return;
        }

        const student : Student = { socketId : socket.id , name , clientId : clientId };
        room.students.set(socket.id , student);

        socket.join(code);
        console.log(`Student ${name} joined room ${code}`);

        const studentsArray = Array.from(room.students.values());
        io.to(code).emit('total:students', { students: studentsArray });

        if(room.activeQuestion){
            socket.emit("question:started" , {
                question : room.activeQuestion,
                remainingTime : room.activeQuestion.timeLimit - (Date.now() - room.activeQuestion.startedAt) / 1000,
            });
        }
    });

    // teacher starts question 
    socket.on('teacher:start_question' , async ({ code , questionId }) => {
        console.log("start question called : " , code , questionId);
       const room = activeRooms.get(code);
       if(!room) return;
       
       const q = await db.question.findFirst({ 
            where : { id : questionId },
            include : { options : true }
        });

        if(!q) return;

        const liveQ : LiveQuestion = {
            id : q.id,
            text : q.text,
            options : q.options.map((opt) => ({
                id : opt.id,
                text : opt.text,
                isCorrect : opt.isCorrect
            })),
            timeLimit : q.timeLimit ?? 60,
            startedAt : Date.now(),
            responses : new Map()
        }

        room.activeQuestion = liveQ;
        room.questions.push(liveQ);

        io.to(code).emit("question:started", liveQ);
        
        console.log("Started question : " , questionId , liveQ.text);

        // auto end after time limit
        setTimeout(() => {
            if(room.activeQuestion?.id === liveQ.id){
                room.activeQuestion = undefined;
                io.to(code).emit("question:ended" , { questionId : q.id });
            }
        } , liveQ.timeLimit * 1000);
    });

    // Student submits answer
    socket.on("student:submit_answer" , async ({ code , optionId , clientId , name }) => {
        const room = activeRooms.get(code);
        if (!room || !room.activeQuestion) return;

        room.activeQuestion.responses.set(socket.id, optionId);

        await db.response.create({
            data: {
                optionId,
                studentName: name,
                createdAt : new Date()
            },
        });

        // Emit updated results (aggregate counts)
        const counts: Record<string, number> = {};
        room.activeQuestion.responses.forEach((opt) => {
            counts[opt] = (counts[opt] || 0) + 1;
        });

        io.to(code).emit("results:update", {
            questionId: room.activeQuestion.id,
            counts,
        });
    });


    // Teacher ends question manually
    socket.on("teacher:end_question", ({ code }) => {
        const room = activeRooms.get(code);
        if (room?.activeQuestion) {
            const endedId = room.activeQuestion.id;
            room.activeQuestion = undefined;
            io.to(code).emit("question:ended", { questionId: endedId });
        }
    });

    // Teacher removes student
    socket.on("teacher:remove_student", ({ code, studentSocketId }) => {
        const room = activeRooms.get(code);
        if (!room) return;

        if (room.students.has(studentSocketId)) {
            io.to(studentSocketId).emit("removed");
            io.to(code).emit('student:kicked' , () => { studentSocketId });
            io.sockets.sockets.get(studentSocketId)?.disconnect();
            room.students.delete(studentSocketId);
        }
    });


    socket.on("disconnect", () => {
    // Cleanup student on disconnect
        activeRooms.forEach((room) => {
        if (room.students.has(socket.id)) {
            room.students.delete(socket.id);
            console.log(`Student ${socket.id} left ${room.code}`);
        }
        if (room.teacher.socketId === socket.id) {
            console.log(`Teacher left room ${room.code}`);
            activeRooms.delete(room.code);
        }
        });
    });
}