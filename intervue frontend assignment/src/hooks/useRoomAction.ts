import { useSelector } from 'react-redux';
import { type RootState, type AppDispatch } from '../store';
import { useDispatch } from 'react-redux';
import { createRoom, joinRoomAsStudent, createQuestion } from '../store/roomSlice';
import socketManager from '../sockets/socketManager';
import useClientId from './useClientId';

export function useRoomState() {
  return useSelector((s: RootState) => s.room);
}

export function useRoomActions() {
  const dispatch = useDispatch<AppDispatch>();
  const clientId = useClientId();

  return {
    dispatch,
    createRoom: (teacherName?: string, title?: string) => dispatch(createRoom({ teacherName, title })),
    joinAsStudent: (code: string, name?: string) => dispatch(joinRoomAsStudent({ code, name })),
    createQuestion: (code: string, payload: { question: string; options: { text: string; isCorrect?: boolean }[]; timeLimit?: number }) => dispatch(createQuestion({ code, question: payload.question, options: payload.options, timeLimit: payload.timeLimit })),
    startQuestion: (questionId: string) => socketManager.startQuestion(questionId),
    endQuestion: (code?: string) => socketManager.endQuestion(code),
    submitAnswer: (optionId: string, name?: string, code?: string) => socketManager.submitAnswer({ code, optionId, clientId, name }),
    removeStudent: (socketId: string, code?: string) => socketManager.removeStudent(socketId, code),
    connectAsTeacher: (code: string, teacherId: string, token: string) => socketManager.connectAsTeacher(code, teacherId, token),
    connectAsStudent: (code: string, name?: string) => socketManager.connectAsStudent(code, name),
    disconnectSocket: () => socketManager.disconnect(),
  };
}
