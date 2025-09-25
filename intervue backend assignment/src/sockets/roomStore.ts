import { Socket , Server } from 'socket.io';
import { RoomRuntime } from '../types';

export const activeRooms : Map<string , RoomRuntime> = new Map();