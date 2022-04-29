const express = require('express')
const { PlayerThread } = require('./playerThread')
const { Room } = require('./Room')

// const classes = require('./PlayerThread')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server, { cors:{origin:"*"}})
//initiates socket server on 3001
server.listen(3001, ()=>{
    console.log("Server running...")
})

let rooms = {}
let players = {}
io.on("connection", (socket)=>{
    hsData = socket.request;
    username = hsData._query["username"]
    roomkey = hsData._query["roomkey"]
    userid = hsData._query["userid"]
    if(!rooms[roomkey]){
        rooms[roomkey] = new Room(roomkey, "", io);
    }
    console.log(username+" "+roomkey+" "+userid)
    players[userid] = new PlayerThread(socket, roomkey, userid, username, io)
    rooms[roomkey].addPlayer(players[userid])
})


