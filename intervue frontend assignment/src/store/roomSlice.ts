import { createSlice, type PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import type { RoomMeta, TeacherCreateResponse,  JoinRoomResponseStudent, Question } from '../types/index';
import * as api from '../api/roomApi';
import { storage } from '../utils';
import socketManager from '../sockets/socketManager';

export const createRoom = createAsyncThunk(
  'room/createRoom',
  async (payload: { teacherName?: string; title?: string }, thunkAPI) => {
    const res: TeacherCreateResponse = await api.createRoom(payload.teacherName, payload.title);
    storage.setTeacherToken(res.teacherToken);
    socketManager.connectAsTeacher(res.roomCode, res.teacherId, res.teacherToken);
    const meta = {
      id : res.roomId,
      title : 'New Room',
      code : res.roomCode,
      teacher : {
        id : res.teacherId,
        name : 'New Teacher'
      },
      questions : []
    } as RoomMeta

    return { meta, code: res.roomCode, teacherToken: res.teacherToken };
  }
);

export const joinRoomAsStudent = createAsyncThunk(
  'room/joinStudent',
  async (payload: { code: string; name?: string }, thunkAPI) => {
    const res : JoinRoomResponseStudent = await api.joinRoomAsStudent(payload.code, payload.name);
    socketManager.connectAsStudent(payload.code, payload.name);
    const meta = {
      id : res.roomId,
      title : 'New Room',
      code : res.roomCode,
      teacher : null,
      questions : []
    } as RoomMeta

    return { meta , code: payload.code };
  }
);

export const createQuestion = createAsyncThunk(
  'room/createQuestion',
  async (payload: { code: string; question: string; options: { text: string; isCorrect?: boolean }[]; timeLimit?: number }, thunkAPI) => {
    const token = storage.getTeacherToken();
    if (!token) throw new Error('Teacher token missing');
    const res = await api.createQuestion(payload.code, { question: payload.question, options: payload.options, timeLimit: payload.timeLimit }, token);
    return { created: res, code: payload.code };
  }
);

// slice state
interface RoomState {
  room?: RoomMeta | null;
  code?: string | null;
  teacherToken?: string | null;
  activeQuestion?: Question | null;
  questionCounts: Record<string, number>;
  questionPercentages: Record<string, number>;
  students: Array<{ socketId: string; name?: string; clientId?: string }>;
  status: 'idle' | 'loading' | 'error';
  error?: string | null;
  kickedOut?: boolean;
}

const initialState: RoomState = {
  room: null,
  code: null,
  teacherToken: storage.getTeacherToken(),
  activeQuestion: null,
  questionCounts: {},
  questionPercentages: {},
  students: [],
  status: 'idle',
  error: null,
  kickedOut: false,
};

const slice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setRoom(state, action: PayloadAction<{ meta: RoomMeta; code?: string }>) {
      state.room = action.payload.meta;
      if (action.payload.code) state.code = action.payload.code;
    },
    setCode(state, action: PayloadAction<string>) {
      state.code = action.payload;
    },
    setTeacherToken(state, action: PayloadAction<string | null>) {
      state.teacherToken = action.payload;
      if (action.payload) storage.setTeacherToken(action.payload);
      else storage.removeTeacherToken();
    },
    setActiveQuestion(state, action: PayloadAction<Question | null>) {
      state.activeQuestion = action.payload;
      // reset counts
      state.questionCounts = {};
      state.questionPercentages = {};
      if (action.payload) {
        // ensure zero counts for each option id
        action.payload.options.forEach((opt) => {
          state.questionCounts[opt.id] = 0;
          state.questionPercentages[opt.id] = 0;
        });
      }
    },
    setQuestionCounts(state, action: PayloadAction<{ counts: Record<string, number>; percentages: Record<string, number> }>) {
      state.questionCounts = action.payload.counts;
      state.questionPercentages = action.payload.percentages;
    },
    clearActiveQuestion(state) {
      state.activeQuestion = null;
      state.questionCounts = {};
      state.questionPercentages = {};
    },
    addStudent(state, action: PayloadAction<{ socketId: string; name?: string; clientId?: string }>) {
      state.students.push(action.payload);
    },
    removeStudent(state, action: PayloadAction<{ socketId: string }>) {
      state.students = state.students.filter((s) => s.socketId !== action.payload.socketId);
    },
    kickedOut(state) {
      state.kickedOut = true;
    },
    resetKicked(state) {
      state.kickedOut = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createRoom.pending, (s) => { s.status = 'loading'; })
      .addCase(createRoom.fulfilled, (s, action) => {
        s.status = 'idle';
        s.room = action.payload.meta;
        s.code = action.payload.code;
        s.teacherToken = action.payload.teacherToken;
      })
      .addCase(createRoom.rejected, (s, action) => {
        s.status = 'error';
        s.error = action.error.message ?? 'createRoom failed';
      })

      .addCase(joinRoomAsStudent.pending, (s) => { s.status = 'loading'; })
      .addCase(joinRoomAsStudent.fulfilled, (s, action) => {
        s.status = 'idle';
        s.room = action.payload.meta;
        s.code = action.payload.code;
      })
      .addCase(joinRoomAsStudent.rejected, (s, action) => {
        s.status = 'error';
        s.error = action.error.message ?? 'join failed';
      })

      .addCase(createQuestion.pending, (s) => { s.status = 'loading'; })
      .addCase(createQuestion.fulfilled, (s, action) => {
        s.status = 'idle';
        // We could push the newly created question into room.questions if shape matches
      })
      .addCase(createQuestion.rejected, (s, action) => {
        s.status = 'error';
        s.error = action.error.message ?? 'createQuestion failed';
      });
  },
});

export const roomActions = slice.actions;
export default slice.reducer;
