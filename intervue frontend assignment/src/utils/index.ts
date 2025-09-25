const TEACHER_TOKEN_KEY = 'teacherToken';
const CLIENT_ID_KEY = 'clientId';

export const storage = {
  setTeacherToken: (token: string) => localStorage.setItem(TEACHER_TOKEN_KEY, token),
  getTeacherToken: (): string | null => localStorage.getItem(TEACHER_TOKEN_KEY),
  removeTeacherToken: () => localStorage.removeItem(TEACHER_TOKEN_KEY),

  setClientId: (cid: string) => sessionStorage.setItem(CLIENT_ID_KEY, cid),
  getClientId: (): string | null => sessionStorage.getItem(CLIENT_ID_KEY),
};
