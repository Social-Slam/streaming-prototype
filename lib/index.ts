// import * as Peer from 'simple-peer'
// import { MutableRefObject } from 'react'
import { WebSocket } from "https://deno.land/std/ws/mod.ts"
export interface DBStream {
  id: string
  isFree: boolean
  artists: Array<string>,
  viewers: Array<string>,
  startsAt: string,
  isComplete: boolean,
  socket: string
}

export interface DBUser {
  username: string
  isArtist: boolean,
  tickets: Array<DBTicket>
}

export interface DBTicket {
  streamId: string
}

//Server
export type SlamSessionServer = {
  artists: Set<WebSocket>
  sockets: Set<WebSocket>
}
export type slamSessionClient = {
  artists: Array<SocketId>
  sockets: Array<SocketId>
}

export type Connection = string
export type SocketId = number

export type payloadConnections = slamSessionClient
export type payloadConnectToRoom = {
  streamId: Connection
  token: string
}
// export type payloadNewConnection = {
//   callerId: SocketId
//   signal: Peer.SignalData
//   isArtist: boolean
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
export type payloadConfirmingConnection = {
  socketId: SocketId
  signal: any
}
export type socketMessage = {
  isError?: boolean
  msg?: string
}


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
