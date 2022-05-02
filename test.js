
class APIS{
	static createClient = require('pexels').createClient

	static pexels_key = '563492ad6f9170000100000176c6251e8f354cc986a3a9290a5b6c64'
	static pixabay_key = '23369502-34b58c3596905a4822a8b8670'
	// static use_api = 'pexels'
	static use_api = 'pixabay'
	static getImgUrl = async (q, room)=>{
		if(this.use_api=='pexels'){
			let url = "https://api.pexels.com/v1/search?query={" + q +"}&per_page=5"
			// let url = ''
			let resp = await fetch(url, {
				method:'GET',
				headers:{
					Accept:'application/json',
					Authorization:this.pexels_key,
				}
			});
			resp = resp.json().then(
				(data)=>{
					let photoURL = 'https://picsum.photos/200/300'
					// let photoURL = data.photos[0].src.tiny||data.photos[0].src.small;
					// console.log(data)
					// console.log(data.photos)
					room.broadcast('art-addpic',{url:photoURL, word:q});
				}
			)
		}
		else{
			let url = 'https://pixabay.com/api/?key='+this.pixabay_key+'&q='+q
			let response = await fetch(url, {
				method:'GET'
			})
			response = response.json().then(
				(data)=>{
					let photoURL = (data.hits.length > 0? data.hits[0].largeImageURL : '');
					// console.log(data)
					room.broadcast("art-addpic", {word:q, url:photoURL});
				})

		}
	}

}
module.exports = {APIS};
