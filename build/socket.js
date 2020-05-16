"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socket = function (io) {
    var dbStream = [
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
    ];
    var dbUser = [
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
    ];
    var jams = {};
    var socketToJams = {};
    io.on('connection', function (socket) {
        socket.on("connect", function (_a) {
            var streamId = _a.streamId, username = _a.username;
            var stream = dbStream[streamId];
            if (!stream) {
                socket.emit('invalid_connection');
                return;
            }
            else if (stream.isComplete) {
                socket.emit('stream_complete');
                return;
            }
            else if (Date.parse(stream.startsAt) > Date.now()) {
                socket.emit('stream_not_started');
                return;
            }
            socketToJams[socket.id] = streamId;
            var user = dbUser.find(function (el) { return el.username === username; });
            if (!user) {
                socket.emit('no_access');
                return;
            }
            var isArtist = stream.artists.find(function (el) { return el === username; });
            if (isArtist) {
                dbStream[streamId].artists.push(socket.id);
            }
            else if (!user.tickets.find(function (el) { return el.streamId === streamId; })) {
                socket.emit('no_access');
                return;
            }
            else {
                dbStream[streamId].viewers.push(socket.id);
            }
            socket.emit('artists', stream.artists.filter(function (id) { return id !== socket.id; }));
        });
        socket.on('disconnect', function () {
            var conn = socketToJams[socket.id];
            var stream = dbStream[conn];
            if (stream) {
                stream.artists = stream.artists.filter(function (id) { return id !== socket.id; });
                stream.viewers = stream.viewers.filter(function (id) { return id !== socket.id; });
                jams[conn] = stream;
            }
        });
    });
};
//# sourceMappingURL=socket.js.map