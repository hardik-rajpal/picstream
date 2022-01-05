const { Room } = require("./Room");
const imageFromGuess = (guessword)=>{
    return ''
}
class PlayerThread{
    constructor(socket, roomkey, userid, username, io){
        this.socket = socket
        this.roomkey = roomkey
        this.username = username;
        // this.role = role;//starts undecided.
        this.userid = userid
        // this.io = io
        this.room = new Room(roomkey, "");
        socket.join(roomkey)
        socket.on("setword", (data)=>{
            console.log(data.word)
            this.room.startRound(data.word, this.userid)
            console.log("setword called")            
        })
        socket.on("wordguess", (data)=>{
            //called by det.
            console.log("wordguess called")
            console.log(this.room.answer + " vs " +data.word)
            if(data.word===this.room.answer){
                //endround with winner as userid.
                this.room.endRound(this.userid)
            }
            var url = imageFromGuess(data.word)
            io.to(this.roomkey).emit("addpic", url)
        })
        socket.on("setpic", (data)=>{
            this.room.pastImages.push(this.room.images[0])
            this.room.images.splice(0, 1)
            this.room.images.push(data.url)
            io.to(this.roomkey).emit("setpic", data.url)
            console.log("setpic called")
        })
        socket.on("timeup", (data)=>{
            //called by system.
            console.log("timeup called")
        })
        socket.on('disconnect', (data)=>{
            // console.log("Heya")
            this.room.dropPlayer(this.userid)
        })

    }
}
module.exports = {PlayerThread};