"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv = require("dotenv");
var express = require("express");
var http = require("http");
var socketio = require("socket.io");
var socket_1 = require("./socket");
dotenv.config();
var PORT = process.env.PORT || 4000;
var app = express();
var server = http.createServer(app);
var io = socketio(server);
socket_1.socket(io);
server.listen(PORT, function () { return console.log("server is running on port " + PORT); });
//# sourceMappingURL=index.js.map