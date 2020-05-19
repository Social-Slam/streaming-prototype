import Peer, { SignalData } from 'simple-peer'
import io from 'socket.io-client'
import { payloadConfirmingConnection, payloadConnections, payloadConnectToRoom, payloadNewConnection, payloadReturnSignal, payloadSendSignal, SocketConnectionProps, SocketId, socketMessage, streamProps } from '../../lib/index'

export const SocketConnection = async (props: SocketConnectionProps): Promise<void> => {
	props.socketRef = io(props.url)

	if (props.createStream) {
		if (props.stream) {
			removeStream(props)
		}

		props.stream = await createStream()
	}

	const socketConnection = () => {
		props.socketRef.emit('connect_to_room', {
			streamId: props.streamId,
			token: props.token,
		} as payloadConnectToRoom)

		props.socketRef.on('connections', (payload: payloadConnections) => {
			const { artists, sockets } = payload

			sockets.forEach((socketId) => initPeer(socketId, true, artists.includes(socketId)))
		})

		props.socketRef.on('message', (payload: socketMessage) => {
			if (payload.isError) {
				console.error(payload)
			} else {
				console.info(payload)
			}
		})

		props.socketRef.on('new_connection', (payload: payloadNewConnection) => {
			const peer = initPeer(payload.signal, false, payload.isArtist, payload.callerId)
		})

		props.socketRef.on('confirming_connection', (payload: payloadConfirmingConnection) => {
			const connection = props.peersRef.current.find((peer) => peer.peerId === payload.socketId)
			connection.peer.signal(payload.signal)
		})

		return props.socketRef
	}

	const initPeer = (
		connection: string | Peer.SignalData,
		initiator: boolean = false,
		isArtist: boolean = false,
		callerId: SocketId = props.socketRef.id
	): Peer.Instance => {
		const peerOptions: Peer.Options = {
			initiator,
			trickle: false,
			stream: props.stream
		}

		const peer = new Peer(peerOptions)

		peer.on('data', props.onIncomingMessage)

		peer.on('signal', (signal: SignalData) => {
			if (initiator) {
				props.socketRef.emit('send_signal', {
					socketId: connection,
					callerId,
					signal,
				} as payloadSendSignal)
			} else {
				props.socketRef.emit('return_signal', {
					callerId,
					signal,
				} as payloadReturnSignal)
			}
		})

		if (!initiator) peer.signal(connection)

		props.peersRef.current.push({ peerId: callerId, peer })

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
		props.stream = await createStream()
	}

	props.peers.forEach(el => el.addStream(props.stream))
}

export const removeStream = (props: streamProps): void => {
	props.peers.forEach(el => el.removeStream(props.stream))
}

export default { SocketConnection, addStream, removeStream, messagePeers }
