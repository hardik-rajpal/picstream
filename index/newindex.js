const express = require('express')
const { request } = require('http')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server, { cors:{origin:"*"}})
//CONFIGURE NAMESPACES
//SEEMINGLY PASSIVE LINE OF CODE BRINGS FETCH FUNCTION
//ALONG WITH IT:
createClient = require('pexels').createClient


pexels_key = '563492ad6f9170000100000176c6251e8f354cc986a3a9290a5b6c64'
pixabay_key = '23369502-34b58c3596905a4822a8b8670'
use_api = 'pixabay'
app.set("view engine", "ejs")
app.engine('html', require('ejs').renderFile)
app.get('/home/artist:roomkey',(req, res)=>{
    res.render('artist.html', {roomkey:req.params.roomkey})
    //looks for home.html in views.
}

)
app.get('/home/detective:roomkey',(req, res)=>{
    res.render('detective.html', {roomkey:req.params.roomkey})
    //looks for home.html in views.
})
server.listen(3001, ()=>{
    console.log("Server running...")
})
rooms = []
function processGuess(q, socket){
    url = "https://api.pexels.com/v1/search?query={" + q +"}&per_page=5"
    fetch(url, {
        method:'GET',
        headers:{
            Accept:'application/json',
            Authorization:pexels_key,
        }
    }).then( response=>{
        return response.json()
    }
    ).then( data=>{
        var i = 0
        while(urls_sent.includes(data.photos[i].src.tiny)&&i<4){
            i+=1;
        }
        if(i==4){return;}
        urltosend = data.photos[i].src.tiny
        urls_sent.push(urltosend)
        while(urls_sent.length>5){
            urls_sent.shift();
        }
        socket.to(rk).emit("imgurl", (urltosend))
    }).catch( reason=>{
        console.log(reason)
    })
}


io.on("connection", (socket)=>{
    fixed_word = ""
    hsData = socket.request;
    role = hsData._query["role"]
    roomkey = hsData._query["roomkey"]
    if(!rooms.includes(roomkey)){
        rooms.push(roomkey)
    }
    socket.join(roomkey)
    console.log(rooms)
    console.log("User role: ")
    console.log("User connected: " + socket.id + "User role="+role);
    urls_sent = []
    socket.on("setword", word=>{
        fixed_word = word
        urlfirsts = ['https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=280',
        'https://images.pexels.com/photos/3726525/pexels-photo-3726525.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=280',
        'https://images.pexels.com/photos/1089438/pexels-photo-1089438.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=280',
        'https://images.pexels.com/photos/978947/pexels-photo-978947.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=280',
        ]
        socket.emit("setpic1", urlfirsts)
    })
    socket.on("guess", (data)=>{       
        console.log(data)
        guess = data.guess
        rk = data.roomkey
        if(guess==fixed_word){
            io.to(rk).emit("winner", socket.id)
            // socket.emit("winner")
            //wrong code line below. Change asap.
            // socket.broadcast.emit("winner", socket.id)
        }
        q = guess
        processGuess(q, socket)
    })
    socket.on("mainFocus", (data)=>{
        io.to(data.roomkey).emit("mainFocus", data.src)
    })
    
})
