import { JamSession, SocketId } from './socket';

export const filterJamSession = (jam: JamSession, filter: (el: SocketId) => boolean, toArrays: boolean = false): JamSession | object => {
	const artists = new Set<string>(), sockets = new Set<string>()

	for (let v of jam.artists) if (filter(v)) artists.add(v);
	for (let v of jam.sockets) if (filter(v)) sockets.add(v);

	if (toArrays) {
		return { artists: [...artists], sockets: [...sockets] }
	} else {
		return { artists, sockets };
	}
}