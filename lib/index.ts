import * as Peer from 'simple-peer'
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
export type socketMessage = {
	isError?: boolean
	msg?: string
}
export type payloadNewConnection = {
	callerId: SocketId
	signal: any //Peer.SignalData
}
export type payloadSendSignal = {
	callerId: SocketId
	signal: any //Peer.SignalData
	socketId: SocketId
}
export type payloadConfirmingConnection = {
	socketId: SocketId
	signal: any
}
