const express = require('express')
const { request } = require('http')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server, { cors:{origin:"*"}})

pexels_key = '563492ad6f9170000100000176c6251e8f354cc986a3a9290a5b6c64'
pixabay_key = '23369502-34b58c3596905a4822a8b8670'
use_api = 'pixabay'
app.set("view engine", "ejs")
app.engine('html', require('ejs').renderFile)
app.get('/home/artist',(req, res)=>{
    res.render('artist.html')
    //looks for home.html in views.
}

)
app.get('/home/detective',(req, res)=>{
    res.render('detective.html')
    //looks for home.html in views.
})
server.listen(3001, ()=>{
    console.log("Server running...")
})

artist = ""
io.on("connection", (socket)=>{
    fixed_word = ""
    hsData = socket.request;
    role = hsData._query["role"]
    if(role=="artist"){
        artist = socket
    }    
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
    socket.on("guess", (guess)=>{       
        if(guess==fixed_word){
            socket.emit("winner")
            artist.emit("winner", socket.id)
        }
        q = guess
        if(use_api=='pexels'){
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
                socket.broadcast.emit("imgurl", (urltosend))
            }).catch( reason=>{
                console.log(reason)
            })
        }
        else{
            url = 'https://pixabay.com/api/?key='+pixabay_key+'&q='+q
            fetch(url, {
                method:'GET'
            }).then( response=>{
                return response.json()
            }
            ).then( data=>{
                // console.log(data)
                var i = 0
                // console.log(data.hits[0])
                while(urls_sent.includes(data.hits[i].pageURL)&&i<4){
                    i+=1;
                }
                console.log(i)
                if(i==4){return;}
                urltosend = data.hits[i].largeImageURL
                urls_sent.push(data.hits[i].pageURL)
                console.log(urls_sent)
                while(urls_sent.length>5){
                    urls_sent.shift();
                }
                console.log(urltosend)
                socket.broadcast.emit("imgurl", (urltosend))
            }).catch( reason=>{
                console.log(reason)
            })
        }
        

    })
    socket.on("mainFocus", (data)=>{
        socket.broadcast.emit("mainFocus", data)
    })
    
})
createClient = require('pexels').createClient

// const client = createClient(pexels_key)
// client.
// q = "man"
// req.open("GET", "https://api.pexels.com/v1/search?query={" + q +"}&per_page=5")
// req.onload = () =>{
//     console.log(JSON.parse(req.response))
// }