import { serve } from "https://deno.land/std/http/server.ts";
import {
  acceptWebSocket,
  isWebSocketCloseEvent,
  WebSocket,
} from "https://deno.land/std/ws/mod.ts";
import "https://deno.land/x/dotenv/load.ts";
import {
  Connection,
  DBStream,
  DBUser,
  MessageToClient,
  MessageToServer,
  SlamSessionServer,
  SocketId,
} from "../lib/types.ts";
import { getToken, verifyToken } from "./Queries.ts";

const slams: Record<Connection, SlamSessionServer> = {};
const socketToSlam: Record<SocketId, Connection> = {};
const ridToWs: Record<string, WebSocket> = {};

const dbStream: DBStream[] = [
  {
    id: "1",
    isFree: true,
    artists: [Deno.env.get("GRAPHQL_USER")!, "bravo"],
    viewers: ["bravo"],
    startsAt: "2020-05-13 17:30:00",
    isComplete: false,
    socket: "asdf",
  },
  {
    id: "2",
    isFree: false,
    artists: ["echo", "foxtrot"],
    viewers: ["gamma", "hotel"],
    startsAt: "2020-05-13 17:30:00",
    isComplete: false,
    socket: "asdfg",
  },
];

const dbUser: DBUser[] = [
  {
    username: Deno.env.get("GRAPHQL_USER")!,
    isArtist: true,
    tickets: [],
  },
  {
    username: "bravo",
    isArtist: true,
    tickets: [],
  },
  {
    username: "charlie",
    isArtist: false,
    tickets: [
      {
        streamId: "1",
      },
    ],
  },
];

const devTokenReq = getToken(
  Deno.env.get("GRAPHQL_USER")!,
  Deno.env.get("GRAPHQL_PASSWORD")!,
);

const handleWs = async (sock: WebSocket) => {
  const socketId: string = sock.conn.rid.toString();
  let isArtist: boolean = false;
  console.log("socket connected!");
  try {
    for await (const ev of sock) {
      if (typeof ev === "string") {
        console.log("ws:Text", ev);

        const msg: MessageToServer = JSON.parse(ev);
        console.log(msg);
        if (msg.type === "connect_to_room") {
          // const tokenRes = await graphQlRequest<GetTokenResponse>(devTokenReq)
          // console.log(tokenRes.data.tokenAuth.token)
          const result = await verifyToken(msg.token);
          console.log(result);
          if (!result.data.verifyToken.success) {
            throw new Error("invalid_token");
          }

          const stream = dbStream.find((el) => el.id === msg.streamId);
          console.log(stream);
          if (!stream) throw new Error("stream_not_found");

          isArtist = stream.artists.includes(
            result.data.verifyToken.payload.username,
          );
          console.log(isArtist);

          if (!slams[msg.streamId]) {
            slams[msg.streamId] = { artists: new Set(), sockets: new Set() };
          }

          if (isArtist) {
            slams[msg.streamId].artists.add(socketId);
          } else if (
            !stream.viewers.includes(result.data.verifyToken.payload.username)
          ) {
            throw new Error("no_access");
          }

          ridToWs[socketId] = sock;
          slams[msg.streamId].sockets.add(socketId);

          const [slammers, connections] = getConnectionsFromSlam(
            msg.streamId,
            socketId,
          );

          const payload: MessageToClient = {
            type: "connections",
            socketId: socketId,
            slammers,
            connections,
          };

          sock.send(JSON.stringify(payload));
        } else if (msg.type === "send_signal") {
          const payload: MessageToClient = {
            type: "new_connection",
            signal: msg.signal,
            originId: msg.originId,
            isArtist,
          };
          ridToWs[msg.connId].send(
            JSON.stringify(
              payload,
            ),
          );
        } else if (msg.type === "confirm_signal") {
          const payload: MessageToClient = {
            type: "returned_signal",
            signal: msg.signal,
            originId: socketId,
          };
          ridToWs[msg.originId].send(
            JSON.stringify(payload),
          );
        }

        // await webRtcHandshake(sock, ev);
      } else if (isWebSocketCloseEvent(ev)) {
        // close
        const { code, reason } = ev;

        console.log("ws:Close", code, reason);

        const slamId = socketToSlam[socketId];
        delete socketToSlam[socketId];
        delete ridToWs[socketId];

        if (slamId) {
          const slam = slams[slamId];
          if (slam) {
            slam.artists.delete(socketId);
            slam.sockets.delete(socketId);
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
};

const getConnectionsFromSlam = (slamId: string, filter?: string) => {
  const artists = [...slams[slamId].artists].filter((el) => el !== filter);
  const connections = [...slams[slamId].sockets].filter((el) => el !== filter);
  return [artists, connections];
};

const sendToSlamRoom = (slamId: string, msg: string, exclude?: string) => {
  const room = slams[slamId];
  for (let [key, value] of Object.entries(room.artists)) {
    if (!exclude || key !== exclude) {
      value.send(msg);
    }
  }
};

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
      });
      await handleWs(ws);
    } catch (e) {
      console.error(`failed to accept websocket: ${e}`);
      await req.respond({ status: 400 });
    }
  }
};

await main();
