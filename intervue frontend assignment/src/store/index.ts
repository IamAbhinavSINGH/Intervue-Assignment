import { configureStore } from '@reduxjs/toolkit';
import roomReducer from './roomSlice';
import socketManager from '../sockets/socketManager';

export const store = configureStore({
  reducer: {
    room: roomReducer,
  },
  middleware: (getDefault) => getDefault(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

socketManager.init(store.dispatch);

export default store;
