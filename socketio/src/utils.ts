import { jamSessionServer, jamSessionClient, SocketId } from '../../lib';

export const filterJamSession = (jams: jamSessionServer, socketId, toArrays: boolean = false): jamSessionClient | jamSessionServer => {
	const artists = new Set<string>(), sockets = new Set<string>()

	jams.artists.forEach(id => {
		if (id !== socketId) artists.add(id);
	})
	jams.sockets.forEach(id => {
		if (id !== socketId) sockets.add(id);
	})

	if (toArrays) {
		return { artists: Array.from(artists), sockets: Array.from(sockets) }
	} else {
		return { artists, sockets };
	}
}