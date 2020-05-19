import { Server } from 'socket.io';
import { filterJamSession } from './utils';
import * as jwt from 'jsonwebtoken'
import { Connection, jamSessionServer, SocketId, payloadConnectToRoom, socketMessage, payloadNewConnection, payloadConfirmingConnection, payloadSendSignal } from '../../lib'

const JWT_SECRET = 'your-256-bit-secret'

export const socket = (io: Server): void => {

	const dbStream = [
		{
			id: '1',
			isFree: true,
			artists: ['alpha'],
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

	io.on('connection', socket => {
		socket.on("connect_to_room", ({ streamId, token }: payloadConnectToRoom) => {
			let username: string

			try {
				const decoded = jwt.verify(token, JWT_SECRET)
				username = decoded['sub']
			} catch (e) {
				console.warn(e)
				sendMessage('invalid_token', true)
				return
			}

			const stream = dbStream.find(el => el.id === streamId)

			if (!stream) {
				sendMessage('invalid_connection', true)
				return
			} else if (stream.isComplete) {
				sendMessage('stream_complete')
				return
			} else if (Date.parse(stream.startsAt) > Date.now()) {
				sendMessage('stream_not_started')
				return
			}

			socketToJam[socket.id] = streamId

			const user = dbUser.find(el => el.username === username)

			if (!user) {
				sendMessage('no_access', true)
				return
			}

			const isArtist = stream.artists.find(el => el === username)

			if (!jams[streamId]) jams[streamId] = { artists: new Set(), sockets: new Set() }

			if (isArtist) {
				jams[streamId].artists.add(socket.id)
			} else if (!user.tickets.find(el => el.streamId === streamId)) {
				sendMessage('no_access', true)
				return
			}

			jams[streamId].sockets.add(socket.id)

			socket.emit('connections', filterJamSession(jams[streamId], id => id !== socket.id, true))
		});

		socket.on("send_signal", (payload: payloadSendSignal) => {
			const returnPayload: payloadNewConnection = {
				signal: payload.signal,
				callerId: payload.callerId
			}

			io.to(payload.socketId).emit('new_connection', returnPayload);
		});

		socket.on("receive_signal", (payload: payloadNewConnection) => {
			const returnPayload: payloadConfirmingConnection = {
				signal: payload.signal,
				socketId: socket.id
			}

			io.to(payload.callerId).emit('confirming_connection', returnPayload);
		});

		socket.on('disconnect', () => {
			const streamId: Connection = socketToJam[socket.id]
			const stream = jams[streamId]

			if (stream) {
				jams[streamId] = filterJamSession(stream, id => id !== socket.id) as jamSessionServer;
			}
		});

		const sendMessage = (message: string, isError: boolean = false) => {
			const payload: socketMessage = { msg: message, isError }
			socket.send(payload)
		}
	});

}
