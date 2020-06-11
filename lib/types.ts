import { SignalData } from "https://cdn.pika.dev/simple-peer@^9.7.2";
import { WebSocket } from "https://deno.land/std/ws/mod.ts";

export interface DBStream {
  id: string;
  isFree: boolean;
  artists: Array<string>;
  viewers: Array<string>;
  startsAt: string;
  isComplete: boolean;
  socket: string;
}
export interface DBUser {
  username: string;
  isArtist: boolean;
  tickets: Array<DBTicket>;
}
export interface DBTicket {
  streamId: string;
}

export type Connection = string;
export type SocketId = string;
export type SocketIdToSocket = Record<string, WebSocket>;

export type SlamSessionServer = {
  artists: Set<string>;
  sockets: Set<string>;
};
export type SlamSessionClient = {
  artists: Array<SocketId>;
  sockets: Array<SocketId>;
};
export type MessageToServer = {
  type: "connect_to_room";
  streamId: string;
  token: string;
} | {
  type: "send_signal";
  connId: string;
  signal: SignalData;
  originId: string;
} | {
  type: "confirm_signal";
  signal: SignalData;
  originId: string;
};

export type MessageToClient = {
  type: "connections";
  socketId: string;
  slammers: string[];
  connections: string[];
} | {
  type: "new_connection";
  signal: SignalData;
  originId: string;
  isArtist: boolean;
} | {
  type: "returned_signal";
  signal: SignalData;
  originId: string;
};

//Server
// export type SlamSessionServer = {
//   artists: Set<WebSocket>
//   sockets: Set<WebSocket>
// }
// export type payloadConnectToRoom = {
//   streamId: Connection
//   token: string
// }
// export type payloadSendSignal = {
//   callerId: SocketId
//   signal: Peer.SignalData
//   socketId: SocketId
// }
// export type payloadReturnSignal = {
//   callerId: SocketId
//   signal: Peer.SignalData
// }
// export type payloadConfirmingConnection = {
//   socketId: SocketId
//   signal: any
// }
// export type socketMessage = {
//   isError?: boolean
//   msg?: string
// }

// //Client
// export type peerT = {
//   peerId: string
//   peer: Peer.Instance
// }

// export type streamProps = {
//   peers: Peer.Instance[]
//   stream?: React.MutableRefObject<MediaStream>
// }

// export type SocketConnectionProps = {
//   url: string
//   streamId: string
//   token: string
//   socketRef: React.MutableRefObject<SocketIOClient.Socket>
//   peersRef: React.MutableRefObject<peerT[]>
//   peers: Peer.Instance[]
//   setPeers: React.Dispatch<React.SetStateAction<Peer.Instance[]>>
//   streamRef: any//React.MutableRefObject<MediaStream>
//   // createStream?: boolean
//   onIncomingMessage?: (msg: any) => void
// }
