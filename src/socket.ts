import { Server } from 'socket.io';
import { filterJamSession } from './utils';
import * as jwt from 'jsonwebtoken'
export interface User {
	username: string
}

export interface Artist extends User {


}

export interface Viewer extends User {

}

export interface JamSession {
	artists: Set<SocketId>
	sockets: Set<SocketId>
}

export type Connection = string
export type SocketId = string


export type UserTypes = 'artist' | 'viewer'

export interface ConnectionConnect {
	streamId: Connection
	token: string
}

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

	const jams: Record<Connection, JamSession> = {};
	const socketToJam: Record<SocketId, Connection> = {}

	io.on('connection', socket => {
		socket.on("connect_to_room", (options: ConnectionConnect) => {
			const { streamId, token } = options

			let username
			try {
				const decoded = jwt.verify(token, JWT_SECRET)
				username = decoded['sub']
			} catch (e) {
				console.warn(e)
				socket.send({ error: 'invalid_token' })
				return
			}

			const stream = dbStream.find(el => el.id === streamId)

			if (!stream) {
				socket.send({ error: 'invalid_connection' })
				return
			} else if (stream.isComplete) {
				socket.send({ msg: 'stream_complete' })
				return
			} else if (Date.parse(stream.startsAt) > Date.now()) {
				socket.send({ msg: 'stream_not_started' })
				return
			}

			socketToJam[socket.id] = streamId

			const user = dbUser.find(el => el.username === username)

			if (!user) {
				socket.send({ error: 'no_access' })
				return
			}

			const isArtist = stream.artists.find(el => el === username)

			if (!jams[streamId]) jams[streamId] = { artists: new Set(), sockets: new Set() }

			if (isArtist) {
				jams[streamId].artists.add(socket.id)
			} else if (!user.tickets.find(el => el.streamId === streamId)) {
				socket.send({ error: 'no_access' })
				return
			}

			jams[streamId].sockets.add(socket.id)

			socket.emit('connections', filterJamSession(jams[streamId], id => id !== socket.id, true))
		});

		socket.on("send_signal", payload => {
			io.to(payload.socketId).emit('new_connection', { signal: payload.signal, callerId: payload.callerID });
		});

		socket.on("receive_signal", payload => {
			io.to(payload.callerId).emit('confirming_connection', { signal: payload.signal, socketId: socket.id });
		});

		socket.on('disconnect', () => {
			const streamId: Connection = socketToJam[socket.id]
			const stream = jams[streamId]

			if (stream) {
				jams[streamId] = filterJamSession(stream, id => id !== socket.id) as JamSession;
			}
		});
	});

}
