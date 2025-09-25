"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const roomController_1 = require("../controllers/roomController");
const questionController_1 = require("../controllers/questionController");
const teacherAuth_1 = require("../middleware/teacherAuth");
const router = (0, express_1.Router)();
// Room Routes
router.post('/room', roomController_1.createRoom);
router.post('/room/:code', roomController_1.joinRoom);
// Question Routes
router.post('/room/:code/question', teacherAuth_1.teacherAuth, questionController_1.createQuestion);
router.get('/room/:code/history', questionController_1.getPollHistory);
exports.default = router;
