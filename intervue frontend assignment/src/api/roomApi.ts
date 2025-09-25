import api from './axios';
import type { TeacherCreateResponse, JoinRoomResponseStudent } from '../types';

export async function createRoom(teacherName?: string, title?: string): Promise<TeacherCreateResponse> {
  const res = await api.post('/room', { teacherName, title });
  return res.data;
}

export async function joinRoomAsStudent(code: string, name?: string): Promise<JoinRoomResponseStudent> {
  const res = await api.post(`/room/${encodeURIComponent(code)}`, { name }, { params: { isStudent: true , name : name }});
  return res.data;
}

export async function createQuestion(code: string, payload: { question: string; options: { text: string; isCorrect?: boolean }[]; timeLimit?: number }, teacherToken: string) {
  const res = await api.post(`/room/${encodeURIComponent(code)}/question`,
        {
          ...payload,
          token : teacherToken,
          roomCode : code
        }, 
        { headers: { 'x-teacher-token': teacherToken }}
    );
  return res.data;
}

export async function getPollHistory(code: string) {
  const res = await api.get(`/room/${encodeURIComponent(code)}/history`);
  // returns: [{ id, text, options: [{ id, text, percent }] }]
  return res.data as {
    id: string;
    text: string;
    options: { id: string; text: string; percent: number }[];
  }[];
}
