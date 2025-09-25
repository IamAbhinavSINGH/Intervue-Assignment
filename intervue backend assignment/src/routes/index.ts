import { Router } from "express";
import {
    joinRoom,
    createRoom,
    getRoomHistory
} from '../controllers/roomController';
import { createQuestion, getPollHistory } from "../controllers/questionController";
import { teacherAuth } from "../middleware/teacherAuth";

const router = Router();


// Room Routes
router.post('/room' , createRoom);
router.post('/room/:code' , joinRoom);

// Question Routes
router.post('/room/:code/question', teacherAuth, createQuestion);
router.get('/room/:code/history', getPollHistory);


export default router;

