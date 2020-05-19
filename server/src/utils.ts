import { jamSessionServer, jamSessionClient, SocketId } from '../../lib';

export const filterJamSession = (jam: jamSessionServer, filter: (el: SocketId) => boolean, toArrays: boolean = false): jamSessionClient | jamSessionServer => {
	const artists = new Set<string>(), sockets = new Set<string>()

	for (let v of jam.artists) if (filter(v)) artists.add(v);
	for (let v of jam.sockets) if (filter(v)) sockets.add(v);

	if (toArrays) {
		return { artists: [...artists], sockets: [...sockets] }
	} else {
		return { artists, sockets };
	}
}