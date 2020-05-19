import * as Peer from 'simple-peer'
import { MutableRefObject } from 'react'

//Server
export type jamSessionServer = {
	artists: Set<SocketId>
	sockets: Set<SocketId>
}
export type jamSessionClient = {
	artists: Array<SocketId>
	sockets: Array<SocketId>
}

export type Connection = string
export type SocketId = string

export type payloadConnections = jamSessionClient
export type payloadConnectToRoom = {
	streamId: Connection
	token: string
}
export type payloadNewConnection = {
	callerId: SocketId
	signal: Peer.SignalData
	isArtist: boolean
}
export type payloadSendSignal = {
	callerId: SocketId
	signal: Peer.SignalData
	socketId: SocketId
}
export type payloadReturnSignal = {
	callerId: SocketId
	signal: Peer.SignalData
}
export type payloadConfirmingConnection = {
	socketId: SocketId
	signal: any
}
export type socketMessage = {
	isError?: boolean
	msg?: string
}


//Client
export type peerT = {
	peerId: string
	peer: Peer.Instance
}

export type streamProps = {
	peers: Peer.Instance[]
	stream?: React.MutableRefObject<MediaStream>
}

export type SocketConnectionProps = {
	url: string
	streamId: string
	token: string
	socketRef: React.MutableRefObject<SocketIOClient.Socket>
	peersRef: React.MutableRefObject<peerT[]>
	peers: Peer.Instance[]
	setPeers: React.Dispatch<React.SetStateAction<Peer.Instance[]>>
	streamRef: any//React.MutableRefObject<MediaStream>
	// createStream?: boolean
	onIncomingMessage?: (msg: any) => void
}
