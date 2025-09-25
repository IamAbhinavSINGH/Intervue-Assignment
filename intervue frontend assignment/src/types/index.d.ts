export type ID = string;

export interface Option {
  id: ID;
  text: string;
  isCorrect?: boolean;
}

export interface Question {
  id: ID;
  text: string;
  timeLimit: number;
  options: Option[];
  status?: 'CREATED' | 'ACTIVE' | 'ENDED';
  startedAt?: number | null;
  endAt?: number | null;
}

export interface LiveQuestion extends Question {
  // runtime responses are not stored here in DB shape; we store aggregated view externally
}

export interface RoomMeta {
  id: ID;
  code: string;
  title?: string;
  teacher?: { id: ID; name?: string } | null;
  questions?: { id: ID; text: string; status?: string }[];
}

export interface TeacherCreateResponse {
  roomId: ID;
  roomCode: string;
  teacherToken: string;
  teacherId: ID;
}

export interface JoinRoomResponseStudent {
  roomId: ID;
  roomCode: string;
  title?: string;
}
