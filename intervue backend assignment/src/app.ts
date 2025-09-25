import express from 'express';
import config from './config/config';
import router from './routes'
import registerPollHandlers from './sockets/pollHandlers';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer , {
    cors : { 
      origin : "*",
    }
});

app.use(cors({
  origin: '*', 
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['*'],
}));
app.use(express.json());


io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  registerPollHandlers(io, socket);
});

app.use('/api/v1' , router);


httpServer.listen(config.port , () => {
    console.log("Socket Server listening on port", config.port);
});