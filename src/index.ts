import * as dotenv from 'dotenv'
import * as express from 'express'
import * as http from 'http'
import * as socketio from 'socket.io'
import { socket } from './socket'


dotenv.config()

const PORT = process.env.PORT || 4000

const app = express();
const server = http.createServer(app);
const io = socketio(server);

socket(io)

server.listen(PORT, () => console.log(`server is running on port ${PORT}`));


