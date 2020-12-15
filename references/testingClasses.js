
let accessToken='05d335963f5a43969286836323e5f2ed'
let apiaddress='./locations.json'
let circleRadius=100;
let homeaddress=[40.77043636839421,-73.91998663544655]


let circleArray=[];



	var mymap = L.map('mymap').setView(homeaddress, 15)

	var Thunderforest_Transport = L.tileLayer(`https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=${accessToken}`, {
		attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		apikey: '05d335963f5a43969286836323e5f2ed'
	}).addTo(mymap)




class Circle{

	days;
	radius=circleRadius;

	constructor(lat,lon,daysNum,styles){
		this.lat=lat;
		this.lon=lon;
		this.styles=styles;
		this.daysNum=daysNum;
		this.days=`days${this.daysNum.toString()}`
	}

}

async function circleArrGen(){
// 시작할 때 기존의 존재하던것들 모두 죽여야 하지않나...? 혹은 그냥 updatefunction을 따로만들까?

	let myData = await $.getJSON(`${apiaddress}`,(d)=>{'data is loaded',d})
	console.log(myData);

	let data = myData.map(d=>({
		...d,
		geometry:{
			"type":"Point",
			"coordinates":[d.geometry.coordinates[1],
						   d.geometry.coordinates[0]
						]
		}
	})
	);


	for (let i=0;i<data.length;i++){
		circleArray[i]=new Circle(data[i].geometry.coordinates[0],
			data[i].geometry.coordinates[1],
			i,
			stylefunc(i))
	}
	console.log('circle Array is like',circleArray);

	document.querySelector('.render').addEventListener('click',render.bind(this,circleArray))


}

circleArrGen();

function stylefunc(i){
let color;
(()=>{
	if(i % 5 ==0){color= 'red'}
	else if(i % 5==1){color= 'green'}
	else if(i % 5==2){color= 'blue'}
	else if(i % 5==3){color= 'yellow'}
	else if(i % 5==4){color= 'tomato'}
})();

return {
	fillColor:color,
	fillOpacity:0.5,
	color:'#ffffff',
	weight:0.5}
}
function render(parents){
	parents.forEach((d)=>{
		circleRender(d)
	})
}
function circleRender(target){
	let coordArray;
	
	L.circle(
		[target.lat,target.lon],circleRadius,target.styles
	).addTo(mymap)

}