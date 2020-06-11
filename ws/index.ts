import * as dotenv from 'dotenv'
import * as ws from "ws"
import {Connection, jamSessionServer, SocketId} from '../lib'

dotenv.config()

const dbStream:Array<Record<string, any>> = [
  {
    id: '1',
    isFree: true,
    artists: ['alpha', 'bravo'],
    viewers: ['bravo'],
    startsAt: '2020-05-13 17:30:00',
    isComplete: false,
    socket: 'asdf'
  },
  {
    id: '2',
    isFree: false,
    artists: ['echo', 'foxtrot'],
    viewers: ['gamma', 'hotel']
  }
]

const dbUser = [
  {
    username: 'alpha',
    isArtist: true,
    tickets: []
  },
  {
    username: 'bravo',
    isArtist: true,
    tickets: []
  },
  {
    username: 'charlie',
    isArtist: false,
    tickets: [
      {
        streamId: '1'
      }
    ]
  }
]

const jams: Record<Connection, jamSessionServer> = {};
const socketToJam: Record<SocketId, Connection> = {}

const PORT = parseInt(process.env.PORT) || 4000

const wss = new ws.Server({ port: PORT });

wss.on('connection', (ws) =>{
  console.log("connected")
  ws.on("open",(connection:WebSocket)=>{
    // connection.send()
  })
  ws.on('message', (message) =>{
    console.log('received: %s', message);
  });

  ws.on("close",(code,msg)=>{
    console.log(code,msg)
  })
});
