import { JamSession, SocketId } from './socket';

export const filterJamSession = (jam: JamSession, filter: (el: SocketId) => boolean): JamSession => {
	let newJam: JamSession = { artists: new Set(), sockets: new Set() }

	for (let v of newJam.artists) if (filter(v)) newJam.artists.add(v);
	for (let v of newJam.sockets) if (filter(v)) newJam.sockets.add(v);

	return newJam;
}