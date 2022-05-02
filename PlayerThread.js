const { Room } = require("./Room");
class PlayerThread{
    constructor(socket, roomkey, userid, username, io){
        this.socket = socket
        this.roomkey = roomkey
        this.username = username;
        // this.role = role;//starts undecided.
        this.userid = userid
        this.io = io
        this.score = 0;
        this.room = new Room(roomkey, "");
        socket.join(roomkey)
        socket.on("setword", (data)=>{
            console.log(data.word)
            this.room.startRound(data.word, this.userid)
			this.room.broadcast('startround', {started: true, nigger_is_slave: true})
            console.log("setword called")            
        })
        socket.on("wordguess", (data)=>{
            //called by det socket from frontend.
            console.log("wordguess called")
            console.log(this.room.answer + " vs " +data.word)
            if(data.word===this.room.answer){
                //endround with winner as userid.
                this.room.endRound(this.userid)
				return;
            }
            var url = this.room.imageFromGuess(data.word)
            console.log(url)
            // io.to(this.roomkey).emit("art-addpic", {url:url})
        })
        //set main pic, visible to artists and detectives
        socket.on("setpic", (data)=>{
            this.room.pastImages.push(this.room.images[0])
            this.room.images.splice(0, 1)
            this.room.images.push(data.url)
            io.to(this.roomkey).emit("all-setpic", data.url)
            console.log("setpic called")
        })
        //time for guessing is over
        socket.on("timeup", (data)=>{
            //end round.
            //broadcast what the word was.
			this.room.endRound("-1");
            console.log("timeup called")
        })
        //player disconnects from frontend.
        socket.on('disconnect', (data)=>{
            this.room.dropPlayer(this.userid)
        })

    }
}
module.exports = {PlayerThread};