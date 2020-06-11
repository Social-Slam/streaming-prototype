import {serve} from 'https://deno.land/std/http/server.ts'
import {acceptWebSocket, isWebSocketCloseEvent, WebSocket} from 'https://deno.land/std/ws/mod.ts'
import {Connection, DBStream, DBUser, SocketId} from '../lib/types.ts'
import {getToken, verifyToken} from './Queries.ts'
import 'https://deno.land/x/dotenv/load.ts'

type SocketIdToSocket = Record<number, WebSocket>

export type SlamSessionServer = {
  artists: SocketIdToSocket
  sockets: SocketIdToSocket
}

const dbStream: DBStream[] = [
  {
    id: '1',
    isFree: true,
    artists: [Deno.env.get('GRAPHQL_USER')!, 'bravo'],
    viewers: ['bravo'],
    startsAt: '2020-05-13 17:30:00',
    isComplete: false,
    socket: 'asdf',
  },
  {
    id: '2',
    isFree: false,
    artists: ['echo', 'foxtrot'],
    viewers: ['gamma', 'hotel'],
    startsAt: '2020-05-13 17:30:00',
    isComplete: false,
    socket: 'asdfg',
  },
]

const dbUser: DBUser[] = [
  {
    username: Deno.env.get('GRAPHQL_USER')!,
    isArtist: true,
    tickets: [],
  },
  {
    username: 'bravo',
    isArtist: true,
    tickets: [],
  },
  {
    username: 'charlie',
    isArtist: false,
    tickets: [
      {
        streamId: '1',
      },
    ],
  },
]

const slams: Record<Connection, SlamSessionServer> = {}
const socketToSlam: Record<SocketId, Connection> = {}

const devTokenReq = getToken(Deno.env.get('GRAPHQL_USER')!, Deno.env.get('GRAPHQL_PASSWORD')!)

const webRtcHandshake = async (sock: WebSocket, slamId: string, msg: string) => {
  if (!slams[slamId]) slams[slamId] = {artists: {}, sockets: {}}

  const slam = slams[slamId]

  const slamJson = JSON.stringify(slam)

  slams[slamId].artists[sock.conn.rid] = sock
  socketToSlam[sock.conn.rid] = slamId

  sock.send(slamJson)
}

type Message = {
  type: 'connect'
  streamId: string
  token: string
}

const handleWs = async (sock: WebSocket) => {
  console.log('socket connected!')
  try {
    for await (const ev of sock) {
      if (typeof ev === 'string') {
        console.log('ws:Text', ev)

        const msg: Message = JSON.parse(ev)
        console.log(msg)
        switch (msg.type) {
          case 'connect':
            // const tokenRes = await graphQlRequest<GetTokenResponse>(devTokenReq)
            // console.log(tokenRes.data.tokenAuth.token)
            const result = await verifyToken(msg.token)
            console.log(result)

            if (!result.data.verifyToken.success) throw new Error('invalid_token')

            const stream = dbStream.find(el => el.id === msg.streamId)
            if (!stream) throw new Error('stream_not_found')
            const isArtist = stream.artists.includes(result.data.verifyToken.payload.username)
            console.log(isArtist)

            if (isArtist) {
              sendToSlamRoom(msg.streamId, JSON.stringify({}))

            } else if (stream.viewers.includes(result.data.verifyToken.payload.username)) {

            }

            webRtcHandshake(sock, msg.streamId, result.data.verifyToken.payload.username)
            break

          default:
            break
        }

        // await webRtcHandshake(sock, ev);

      } else if (isWebSocketCloseEvent(ev)) {
        // close
        const {code, reason} = ev

        console.log('ws:Close', code, reason)

        const slamId = socketToSlam[sock.conn.rid]

        if (slamId) {
          const slam = slams[slamId]
          if (slam) {
            delete slam.artists[sock.conn.rid]
            delete slam.sockets[sock.conn.rid]
          }
        }
      }
    }
  } catch (err) {
    console.error(`failed to receive frame: ${err}`)

    if (!sock.isClosed) {
      await sock.close(1000).catch(console.error)
    }
  }
}

const sendToSlamRoom = (slamId: string, msg: string, exclude?: string) => {
  const room = slams[slamId]
  for (let [key,value] of Object.entries(room.artists)) {
    if(!exclude||key!==exclude){
      value.send(msg)
    }
  }
}

const main = async () => {
  const port = Deno.args[0] || '8080'
  console.log(`websocket server is running on :${port}`)
  for await (const req of serve(`:${port}`)) {
    const {conn, r: bufReader, w: bufWriter, headers} = req

    try {
      const ws = await acceptWebSocket({
        conn,
        bufReader,
        bufWriter,
        headers,
      })
      await handleWs(ws)
    } catch (e) {
      console.error(`failed to accept websocket: ${e}`)
      await req.respond({status: 400})
    }

  }
}

await main()
