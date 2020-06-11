import Peer, { SignalData } from 'simple-peer'
import io from 'socket.io-client'
import { payloadConfirmingConnection, payloadConnections, payloadConnectToRoom, payloadNewConnection, payloadReturnSignal, payloadSendSignal, SocketConnectionProps, SocketId, socketMessage, streamProps } from '../../lib/types.ts'

export const SocketConnection = async (props: SocketConnectionProps): Promise<void> => {
	props.socketRef.current = io(props.url)

	// if (props.createStream) {
	// 	if (props.streamRef) {
	// 		removeStream(props)
	// 	}

	// 	props.streamRef.current.srcObject = await createStream()
	// }

	const socketConnection = (): void => {
		props.socketRef.current.emit('connect_to_room', {
			streamId: props.streamId,
			token: props.token,
		} as payloadConnectToRoom)

		props.socketRef.current.on('connections', (payload: payloadConnections) => {
			console.log('connections', payload)
			const { artists, sockets } = payload

			sockets.forEach((socketId) => initPeer(socketId, true, artists.includes(socketId)))
		})

		props.socketRef.current.on('message', (payload: socketMessage) => {
			if (payload.isError) {
				console.error(payload)
			} else {
				console.info(payload)
			}
		})

		props.socketRef.current.on('new_connection', (payload: payloadNewConnection) => {
			console.log('new_connection', payload)

			const peer = initPeer(payload.signal, false, payload.isArtist, payload.callerId)
		})

		props.socketRef.current.on('confirming_connection', (payload: payloadConfirmingConnection) => {
			console.log('confirming_connection', payload)

			const connection = props.peersRef.current.find((peer) => peer.peerId === payload.socketId)
			connection.peer.signal(payload.signal)
		})
	}

	const initPeer = (
		connection: string | Peer.SignalData,
		initiator: boolean = false,
		isArtist: boolean = false,
		callerId: SocketId = props.socketRef.current.id
	): Peer.Instance => {
		const peerOptions: Peer.Options = {
			initiator,
			trickle: false,
		}

		if (props.streamRef.current.srcObject) peerOptions.stream = props.streamRef.current.srcObject

		console.log(peerOptions)
		const peer = new Peer(peerOptions)

		peer.on('data', props.onIncomingMessage)

		peer.on('signal', (signal: SignalData) => {
			console.log('signal', signal)

			if (initiator) {
				props.socketRef.current.emit('send_signal', {
					socketId: connection,
					callerId,
					signal,
				} as payloadSendSignal)
			} else {
				props.socketRef.current.emit('return_signal', {
					callerId,
					signal,
				} as payloadReturnSignal)
			}
		})

		if (!initiator) peer.signal(connection)

		props.peersRef.current.push({ peerId: callerId, peer })
		console.log(isArtist)
		if (isArtist) props.setPeers([...props.peers, peer])

		return peer
	}

	socketConnection()
}

export const messagePeers = (peers: Peer.Instance[], newMsg: string): void => {
	peers.forEach((peer) => {
		peer.send(newMsg)
	})
}

export const createStream = async () => {
	return await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
}

export const addStream = async (props: streamProps): Promise<void> => {
	if (!props.stream) {
		props.stream.current = await createStream()
	}

	props.peers.forEach(el => el.addStream(props.stream.current))
}

export const removeStream = (props: streamProps): void => {
	props.peers.forEach(el => el.removeStream(props.stream.current))
}

export default { SocketConnection, addStream, removeStream, messagePeers }
