const semaphore = require("semaphore");
const { APIS } = require("./test");
// const { default: getImgUrl } = require("./apis");
const MAXPLAYERS = 10;
class Room{
    //TODO: allow other users to guess even after one gets it.
    constructor(roomkey, answer, io){
        this.roomkey = roomkey
        this.answer = answer
        this.io = io
        this.pastImages = []
        this.images = []
        this.players = []
        this.roundSem = semaphore(1);
        this.roundRunning = false;
        this.artistID = '';
        //true if the hidden word has been set.
        //false if the hidden word has not been set/has just been guessed.
    }
    //called by artist selecting a word.
    startRound(newAnswer, artistID){
        this.roundSem.take(()=>{
            if(this.roundRunning){
                this.roundSem.leave();
                return;
            }
            this.answer = newAnswer
            this.artistID = artistID;
            this.roundRunning = true;
            this.roundSem.leave();
        })
    }
    //called by a player emitting the right guess.
    //sets roundRunning to false.
    //picks the next artist and lets them know.
    endRound(winnerid){
        this.roundSem.take(()=>{
            if(!this.roundRunning){
                this.roundSem.leave();
                return;
            }
            this.roundRunning = false;
            //share points.?
            this.io.to(this.roomkey).emit("winner", winnerid)
            //client should understand "" winnerid as artist dropped.

            let i = this.players.findIndex((player, i, [])=>{
                return (player.userid===this.artistID);
            });
            let j = (i+1);
            if(j===this.players.length){
                //return;
            }
            if(j<this.players.length){
                this.io.to(this.roomkey).emit("artist", this.players[j].userid)
                //client on receiving this event (with the right userid)
                //has to choose between 3 words to start choosing pics.
                //timer starts on him selecting a word.
            }
            this.roundSem.leave();
        });
    }
    addPlayer(player){
        this.roundSem.take(()=>{
            if(this.roundRunning||(this.players.length===MAXPLAYERS)){
                this.roundSem.leave();
                return;
            }
            if(this.players.findIndex((v,i,o)=>v.userid==player.userid)!==-1){
                this.roundSem.leave();
                return;
            }
            player.room = this
            this.players.push(player);
            if(this.players.length===1){
                this.io.to(this.roomkey).emit('artist', player.userid)
            }
            this.sharePlayerNames();
            this.roundSem.leave();
        })

    }
    dropPlayer(userid){
        this.roundSem.take(()=>{
            let i = this.players.findIndex((v, i, o)=>{
                return (v.userid===userid);
            });
            // console.log(i);
            if(this.artistID===userid){
                this.players.splice(i, 1)
                this.roundSem.leave();
                this.endRound('')
            }
            else{
                this.players.splice(i, 1);
                this.roundSem.leave();
            }
            this.sharePlayerNames();
        })
        if(this.players.length===0){
            //no ref to this room, it's probably cleared 
            //by GC.
        }

    }
    sharePlayerNames(){
        this.roundSem.take(()=>{
            if(this.players.length==0){
                this.roundSem.leave();
                return;
            }
            let playernames = this.players.map((v, i, [])=>{
                return {
                    index:i+1,
                    username:(v.username),
                    score:v.score,
                    userid:v.userid
                };
            });
            // console.log(this.io);
            // console.log("room io printed above.")
            // // console.log(this.players[0].io);
            // console.log("player io printed above.")
            this.io.to(this.roomkey).emit('players', JSON.stringify(playernames))
            console.log('shared players')
            this.roundSem.leave();
        })

    }
    broadcast(event,data){
        this.io.to(this.roomkey).emit(event, JSON.stringify(data));
    }
    imageFromGuess(word){
        APIS.getImgUrl(word, this);
        // return url;
    }
}
module.exports = {Room};