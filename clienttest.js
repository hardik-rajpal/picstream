const HOST = '127.0.0.1';
const PORT = 3001;
const socketIO = require('socket.io-client')
var role = "artist"
var roomkey = "123abc"
var userid = "123cde"
var client = socketIO('http://localhost:3001',{query:"role="+role+"&roomkey="+roomkey+"&userid="+userid});

client.on('addpic', (data)=>{
    console.log("new pic received: "+data)
})
client.on("winner", (data)=>{
    console.log(data+"is the winner")
})
client.emit('setword', {word:"parrots"})
client.emit('wordguess', {word:"lame"})
client.emit("wordguess", {word:"parrots"})