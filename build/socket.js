"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socket = void 0;
var utils_1 = require("./utils");
var jwt = require("jsonwebtoken");
var JWT_SECRET = 'your-256-bit-secret';
exports.socket = function (io) {
    var dbStream = [
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
    ];
    var dbUser = [
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
    ];
    var jams = {};
    var socketToJam = {};
    io.on('connection', function (socket) {
        socket.on("connect_to_room", function (options) {
            var streamId = options.streamId, token = options.token;
            var username;
            try {
                var decoded = jwt.verify(token, JWT_SECRET);
                username = decoded['sub'];
            }
            catch (e) {
                console.warn(e);
                socket.send({ error: 'invalid_token' });
                return;
            }
            var stream = dbStream.find(function (el) { return el.id === streamId; });
            if (!stream) {
                socket.send({ error: 'invalid_connection' });
                return;
            }
            else if (stream.isComplete) {
                socket.send({ msg: 'stream_complete' });
                return;
            }
            else if (Date.parse(stream.startsAt) > Date.now()) {
                socket.send({ msg: 'stream_not_started' });
                return;
            }
            socketToJam[socket.id] = streamId;
            var user = dbUser.find(function (el) { return el.username === username; });
            if (!user) {
                socket.send({ error: 'no_access' });
                return;
            }
            var isArtist = stream.artists.find(function (el) { return el === username; });
            if (!jams[streamId])
                jams[streamId] = { artists: new Set(), sockets: new Set() };
            if (isArtist) {
                jams[streamId].artists.add(socket.id);
            }
            else if (!user.tickets.find(function (el) { return el.streamId === streamId; })) {
                socket.send({ error: 'no_access' });
                return;
            }
            jams[streamId].sockets.add(socket.id);
            socket.emit('connections', utils_1.filterJamSession(jams[streamId], function (id) { return id !== socket.id; }, true));
        });
        socket.on("send_signal", function (payload) {
            io.to(payload.socketId).emit('new_connection', { signal: payload.signal, callerId: payload.callerID });
        });
        socket.on("receive_signal", function (payload) {
            io.to(payload.callerId).emit('confirming_connection', { signal: payload.signal, socketId: socket.id });
        });
        socket.on('disconnect', function () {
            var streamId = socketToJam[socket.id];
            var stream = jams[streamId];
            if (stream) {
                jams[streamId] = utils_1.filterJamSession(stream, function (id) { return id !== socket.id; });
            }
        });
    });
};
//# sourceMappingURL=socket.js.map