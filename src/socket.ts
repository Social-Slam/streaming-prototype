import { Server } from 'socket.io';

export interface User {
	username: string
}

export interface Artist extends User {


}

export interface Viewer extends User {

}

export interface JamSession {
	artist: Array<Artist>
	viewer: Array<Viewer>
}

export type Connection = string
export type SocketId = string


export type UserTypes = 'artist' | 'viewer'

export interface ConnectionConnect {
	streamId: Connection
	username: string
	type: UserTypes
}

export const socket = (io: Server): void => {

	const dbStream = [
		{
			id: 1,
			isFree: true,
			artists: ['alfa'],
			viewers: ['charlie'],
			startsAt: '2020-05-13 17:30:00',
			isComplete: false,
			socket: 'asdf'
		},
		{
			id: 2,
			isFree: false,
			artists: ['echo', 'foxtrot'],
			viewers: ['gamma', 'hotel']
		}
	]

	const dbUser = [
		{
			username: 'alfa'
		},
		{
			username: 'charlie',
			tickets: [
				{
					streamId: '1'
				}
			]
		}
	]

	const jams: Record<Connection, JamSession> = {};
	const socketToJams: Record<SocketId, Connection> = {}

	io.on('connection', socket => {
		socket.on("connect", ({ streamId, username }: ConnectionConnect) => {
			const stream = dbStream[streamId]

			if (!stream) {
				socket.emit('invalid_connection')
				return
			} else if (stream.isComplete) {
				socket.emit('stream_complete')
				return
			} else if (Date.parse(stream.startsAt) > Date.now()) {
				socket.emit('stream_not_started')
				return
			}
			socketToJams[socket.id] = streamId
			const user = dbUser.find(el => el.username === username)

			if (!user) {
				socket.emit('no_access')
				return
			}

			const isArtist = stream.artists.find(el => el === username)

			if (isArtist) {
				dbStream[streamId].artists.push(socket.id)
			} else if (!user.tickets.find(el => el.streamId === streamId)) {
				socket.emit('no_access')
				return
			} else {
				dbStream[streamId].viewers.push(socket.id)
			}

			socket.emit('artists', stream.artists.filter(id => id !== socket.id))
		});

		socket.on('disconnect', () => {
			const conn: Connection = socketToJams[socket.id]
			const stream = dbStream[conn]

			if (stream) {
				stream.artists = stream.artists.filter(id => id !== socket.id);
				stream.viewers = stream.viewers.filter(id => id !== socket.id)
				jams[conn] = stream;
			}
		});
	});

}
