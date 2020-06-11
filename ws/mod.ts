import { serve } from "https://deno.land/std/http/server.ts";
import {
  acceptWebSocket,
  isWebSocketCloseEvent,
  isWebSocketPingEvent,
  WebSocket,
} from "https://deno.land/std/ws/mod.ts";
import { reset } from "https://deno.land/std/fmt/colors.ts";
import { Connection, SlamSessionServer, SocketId, DBStream, DBUser } from '../lib/index.ts'
import { getToken, verifyToken, GetTokenResponse, VerifyTokenResponse } from './Queries.ts';
import "https://deno.land/x/dotenv/load.ts";

Deno.env.get("URL_GRAPHQL")

const dbStream: DBStream[] = [
  {
    id: '1',
    isFree: true,
    artists: ['social_slam_admin', 'bravo'],
    viewers: ['bravo'],
    startsAt: '2020-05-13 17:30:00',
    isComplete: false,
    socket: 'asdf'
  },
  {
    id: '2',
    isFree: false,
    artists: ['echo', 'foxtrot'],
    viewers: ['gamma', 'hotel'],
    startsAt: '2020-05-13 17:30:00',
    isComplete: false,
    socket: 'asdfg'
  }
]

const dbUser: DBUser[] = [
  {
    username: 'social_slam_admin',
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

const slams: Record<Connection, SlamSessionServer> = {}
const socketToSlam: Record<SocketId, Connection> = {}

const devTokenReq = getToken("social_slam_admin", "social_slamming_2020")

const webRtcHandshake = async (sock: WebSocket, slamId: string, msg: string) => {
  if (!slams.has(slamId)) slams.set(slamId, { artists: new Set(), sockets: new Set() })

  const slam = slams.get(slamId)

  const slamJson = JSON.stringify(slam)

  slams.get(slamId)!.artists.add(sock.conn.rid)
  socketToSlam.set(sock.conn.rid, slamId)

  sock.send(slamJson)
}

const graphQlRequest = async <T = any>(query: any): Promise<T> => {
  const result = await fetch(Deno.env.get("URL_GRAPHQL")!, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    method: "post",
    body: JSON.stringify({ query })
  })

  const parsedResult: T = (await result.json()) as unknown as T
  return parsedResult
}

type Message = {
  type: 'connect'
  streamId: string
  token: string
}

const handleWs = async (sock: WebSocket) => {
  console.log("socket connected!");
  try {
    for await (const ev of sock) {
      if (typeof ev === "string") {
        console.log("ws:Text", ev);

        const msg: Message = JSON.parse(ev)
        console.log(msg)
        switch (msg.type) {
          case "connect":
            // const tokenRes = await graphQlRequest<GetTokenResponse>(devTokenReq)
            // console.log(tokenRes.data.tokenAuth.token)
            const result = await graphQlRequest<VerifyTokenResponse>(verifyToken(msg.token))
            console.log(result)

            if (!result.data.verifyToken.success) throw new Error("invalid_token")

            const stream = dbStream.find(el => el.id === msg.streamId)
            if (!stream) throw new Error("stream_not_found")
            const isArtist = stream.artists.includes(result.data.verifyToken.payload.username)
            console.log(isArtist)

            if (isArtist) {
              sendToSlamRoom(msg.streamId, JSON.stringify({}))

            } else if (stream.viewers.includes(result.data.verifyToken.payload.username)) {

            }



            webRtcHandshake(sock, msg.streamId, result.data.verifyToken.payload.username)
            break;



          default:
            break;
        }












        // await webRtcHandshake(sock, ev);


      } else if (isWebSocketCloseEvent(ev)) {
        // close
        const { code, reason } = ev;

        console.log("ws:Close", code, reason);

        const slamId = socketToSlam.get(sock.conn.rid)

        if (slamId) {
          const slam = slams.get(slamId)
          if (slam) {
            slam.artists.delete(sock.conn.rid)
            slam.sockets.delete(sock.conn.rid)
          }
        }
      }
    }
  } catch (err) {
    console.error(`failed to receive frame: ${err}`);

    if (!sock.isClosed) {
      await sock.close(1000).catch(console.error);
    }
  }
}

const sendToSlamRoom = (slamId: string, msg: string, exclude?: string) => {
  slams[slamId].sockets.forEach(conn => {
    if (!exclude || exclude === conn.conn.rid.toString()) conn.send(msg)
  })
}


const main = async () => {
  const port = Deno.args[0] || "8080";
  console.log(`websocket server is running on :${port}`);
  for await (const req of serve(`:${port}`)) {
    const { conn, r: bufReader, w: bufWriter, headers } = req;

    try {
      const ws = await acceptWebSocket({
        conn,
        bufReader,
        bufWriter,
        headers,
      })
      await handleWs(ws)
    } catch (e) {
      console.error(`failed to accept websocket: ${e}`);
      await req.respond({ status: 400 });
    };
  }
}

await main()