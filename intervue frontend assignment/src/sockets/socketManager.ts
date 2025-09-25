import { io, Socket } from 'socket.io-client';
import type { LiveQuestion } from '../types';
import { storage } from '../utils';
import type { AppDispatch } from '../store';
import { roomActions } from '../store/roomSlice';

// const SOCKET_PATH = import.meta.env.VITE_SOCKET_PATH ?? '';
// const URL = import.meta.env.VITE_API_URL ?? '';

class SocketManager {
  private socket: Socket | null = null;
  private dispatch: AppDispatch | null = null;
  private currentCode: string | null = null;

  init(dispatch: AppDispatch) {
    this.dispatch = dispatch;
  }

  private ensureSocket() {
    if (!this.socket) {
      this.socket = io("http://localhost:3000", {
        // transports: ['websocket'],
        reconnection : true
      });

      this.socket.on('connect', () => {
        if (this.currentCode) {
          const token = storage.getTeacherToken();
          if (token) {
            this.socket?.emit('teacher:join', { code: this.currentCode, token });
          } else {
            const clientId = storage.getClientId();
            this.socket?.emit('student:join', { code: this.currentCode, clientId });
          }
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('socket disconnected', reason);
      });

      this.socket.on('connect_error', (err) => {
        console.error('socket connect_error', err);
      });

      this.socket.on('question:started', (q: LiveQuestion & { remainingTime?: number }) => {
        if (!this.dispatch) return;
        this.dispatch(roomActions.setActiveQuestion(q));
      });

      this.socket.on('results:update', (payload: { questionId: string; counts: Record<string, number> }) => {
        if (!this.dispatch) return;
        const counts = payload.counts || {};
        const total = Object.values(counts).reduce((s, v) => s + (v || 0), 0);
        const percentages: Record<string, number> = {};
        if (total === 0) {
          Object.keys(counts).forEach((k) => (percentages[k] = 0));
        } else {
          Object.keys(counts).forEach((k) => {
            percentages[k] = Math.round((counts[k] / total) * 100); // integer percent
          });
        }
        this.dispatch(roomActions.setQuestionCounts({ counts, percentages }));
      });

      this.socket.on('question:ended', () => {
        if (!this.dispatch) return;
        this.dispatch(roomActions.clearActiveQuestion());
      });

      this.socket.on('removed', () => {
        if (!this.dispatch) return;
        this.dispatch(roomActions.kickedOut());
      });

      this.socket.on('error', (err: any) => {
        console.error('socket error', err);
      });
    }
    return this.socket;
  }

  connectAsTeacher(code: string, teacherId: string, token: string) {
    this.currentCode = code;
    const s = this.ensureSocket();
    s?.connect();
    s?.emit('teacher:join', { code, teacherId, token });
  }

  connectAsStudent(code: string, name?: string) {
    this.currentCode = code;
    const s = this.ensureSocket();
    s?.connect();
    const clientId = storage.getClientId();
    s?.emit('student:join', { code, name, clientId });
  }

  disconnect() {
    this.currentCode = null;
    if (this.socket) {
      try {
        this.socket.disconnect();
      } catch {}
      this.socket = null;
    }
  }

  // actions
  startQuestion(questionId: string, code?: string) {
    this.socket?.emit('teacher:start_question', { code: code ?? this.currentCode, questionId });
  }
  endQuestion(code?: string) {
    this.socket?.emit('teacher:end_question', { code: code ?? this.currentCode });
  }
  removeStudent(studentSocketId: string, code?: string) {
    this.socket?.emit('teacher:remove_student', { code: code ?? this.currentCode, studentSocketId });
  }
  submitAnswer(payload: { code?: string; optionId: string; clientId?: string; name?: string }) {
    this.socket?.emit('student:submit_answer', { code: payload.code ?? this.currentCode, optionId: payload.optionId, clientId: payload.clientId, name: payload.name });
  }
}

const socketManager = new SocketManager();
export default socketManager;
