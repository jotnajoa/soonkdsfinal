
let accessToken='05d335963f5a43969286836323e5f2ed'
let accessToken2='pJfnboGvofro9s43CHtxKZJdhys903xXBfxOo181pEHfhhNB62Gvut0kmmxy4HwP'
let apiaddress='./locations.json'
let circleRadius=100;
let homeaddress=[40.77043636839421,-73.91998663544655]
let shopaddress=[40.771,-73.912]
let grilladdress=[40.774,-73.954]


let circleArray=[];
let shapeStyle={
	fillColor:'red',
	color:'#ffffff',
	weight:0.5,
	fillOpacity:0.5
}

	let mapmarker = L.icon({
		iconUrl:'./img/map-marker.svg',
		iconSize:[38,95],
		iconAnchor:[19,95],
		popupAnchor:[-3,-76]
	});


	var mymap = L.map('mymap',{
		zoomControl:false
	}).setView(homeaddress, 13)


	let myTile=L.tileLayer(`https://tile.jawg.io/1bd98bad-7982-478b-990f-3d592d4d1daa/{z}/{x}/{y}.png?access-token=${accessToken2}`, {}).addTo(mymap);
	
	mymap.attributionControl.addAttribution("<a href=\"https://www.jawg.io\" target=\"_blank\">&copy; Jawg</a> - <a href=\"https://www.openstreetmap.org\" target=\"_blank\">&copy; OpenStreetMap</a>&nbsp;contributors")









	var customMarker1 = L.circle(shopaddress,100,{

	})

	var customMarker2 = L.circle(grilladdress,100,{

	})

	var customMarker3=L.circle(shopaddress,100,{

	})

	let arrays=[];
	arrays.push(customMarker1);
	arrays.push(customMarker2);
	arrays.push(customMarker3)



	let myCircle=L.circle(homeaddress,300,shapeStyle).addTo(mymap)
	mymap.on('click',addMarker)

	


let myFeatureGroup=L.featureGroup(arrays)
  .bindPopup('Im feature Group 1')
  .on('click',function(){console.log(this);})

  mymap.addLayer(myFeatureGroup)

