let accessToken = 'pJfnboGvofro9s43CHtxKZJdhys903xXBfxOo181pEHfhhNB62Gvut0kmmxy4HwP';
let mapdata;
let initialCoord;
let palette = {
    OD: '#F8A839',
    C: '#39DBF8',
    BB: '#FF0076',
    S: '#930044',
    O: '#3CCCB6',
    Special: '#398AF8',
    Sp: '#49D936',
    default: '#FF65AC'
}
let defaultFeature;
let circleStyle = {
    radius: 60,
    fillColor: palette.default,
    fillOpacity: 0.4,
    weight: 0.3
}

let markerGroup = [];
let selectedGroup = [];
let selectedFeature;
let mymap
window.addEventListener('load', () => {
    if (window.innerWidth > 1080) {
        $('.page1').css('width', '1080px')
        $('.page2').css('width', '1080px')
    } else {
        $('.page1').css('width', `${innerWidth*0.9}px`)
        $('.page2').css('width', `${innerWidth*0.9}px`)
    }
})
async function leafletfunc() {

    mapdata = await $.getJSON('/aaapi')

    initialCoord = [mapdata[0].lat, mapdata[0].lon]

    mymap = L.map('mymap', { zoomControl: false })
        .setView(initialCoord, 15)

    let myTile = L.tileLayer(`https://tile.jawg.io/1bd98bad-7982-478b-990f-3d592d4d1daa/{z}/{x}/{y}.png?access-token=${accessToken}`, {}).addTo(mymap);
    mymap.attributionControl.addAttribution("<a href=\"https://www.jawg.io\" target=\"_blank\">&copy; Jawg</a> - <a href=\"https://www.openstreetmap.org\" target=\"_blank\">&copy; OpenStreetMap</a>&nbsp;contributors")

    let maplength = mapdata.length;

    for (let i = 0; i < maplength; i++) {

        var eachStyle = Object.create(circleStyle);
        var eachType = mapdata[i].mtgtype.split('=')[0].trim()
        eachStyle.fillColor = palette[eachType]



        let coord = [mapdata[i].lat, mapdata[i].lon];
        let circles = L.circle(coord, eachStyle)
        circles.options.address = mapdata[i].address
        circles.options.venue = mapdata[i].venue
        circles.options.mtgday = mapdata[i].mtgday
        circles.options.mtgtime = mapdata[i].mtgtime
        circles.options.mtgtype = mapdata[i].mtgtype
        circles.on('mouseover', function(e) {
                this.setStyle({
                    fillOpacity: 0.8,
                    weight: 1
                })
            })
            .on('mouseout', function() {
                this.setStyle({
                    fillOpacity: 0.4,
                    weight: 0
                })
            })
            .on('click', showDetail)

        markerGroup.push(
            circles
        )
    }

    // console.log(markerGroup);

    defaultFeature = L.featureGroup(markerGroup)
    selectedFeature = L.featureGroup(markerGroup)

    mymap.addLayer(defaultFeature)
        // defaultFeature.addTo(mymap)
    $('.btn').click(dayjoin)
    $('.typebtn').click(typejoin)

    // Iterates the data and store the data into an arrray as a feature maybe?
    // There should be two features one-entire feature / the other - selected feature;
}

leafletfunc();

function dayjoin(e) {



    $('.types').css('opacity', 1)
    $('.selectedtype').removeClass('selectedtype')
    mymap.removeLayer(defaultFeature)
    mymap.removeLayer(selectedFeature)
    selectedGroup = [];
    // select All the other days and turns them into greyed-out version
    // add shadow

    let selectedDay = this.classList[1];
    $('.btn').removeClass('clicked')
    $('.btn').css('opacity', 0.4)
    $(`.${selectedDay}`).css('opacity', 1)
    $(`.${selectedDay}`).addClass('clicked')


    // create a featuregroup which has a circles having the day selected



    markerGroup.forEach((d) => {
        if (d.options.mtgday == selectedDay) {
            d._mRadius = 200;
            // console.log(d);
            selectedGroup.push(d)
        }
    })
    let newCenter = [selectedGroup[0]._latlng.lat, selectedGroup[0]._latlng.lng]

    mymap.setView(newCenter, 12);

    selectedFeature = L.featureGroup(selectedGroup)

    // render the circles
    mymap.addLayer(selectedFeature)
    zooomupdate()
        // reactive toward zoom level
    let totalNum = selectedGroup.length

    $('.summaries').text(`Total ${totalNum} meetings are available`)
    $('.summaries').css('opacity', 0.8)
        //option, increase the size of circles using gsap once dayjoin happens
        //function radiusChange(){}
}

function showDetail(e) {
    console.log(e.target);
    let tg = e.target.options
    let ad = tg.address
    let vn = tg.venue
    let mt = tg.mtgtime

    if (tg.venue) {
        ad = tg.address
        vn = tg.venue
        mt = tg.mtgtime
    } else {
        ad = tg.address
        vn = 'N/A'
        mt = tg.mtgtime
    }

    $('.defaultstate').removeClass('defaultstate')

    $('.address').text(ad)
    $('.venue').text(vn)
    $('.time').text(mt)

}

function typejoin(e) {
    $('.btn').css('opacity', 1)
    $('.btn').removeClass('clicked')

    mymap.removeLayer(defaultFeature)
    mymap.removeLayer(selectedFeature)
    selectedGroup = [];
    // select All the other days and turns them into greyed-out version
    // add shadow

    let selectedType = this.classList[1].split('btn')[0]
    console.log(selectedType);
    $('.typebtn').removeClass('clicked')
    $('.types').css('opacity', 0.4)
    $(`.${selectedType}`).css('opacity', 1)
    $(`.${selectedType}btn`).addClass('selectedtype')


    // create a featuregroup which has a circles having the day selected



    markerGroup.forEach((d) => {

        if (d.options.mtgtype.split('=')[0].trim() == selectedType) {
            console.log(d.options.mtgtype.split('=')[0].trim());
            d._mRadius = 200;
            selectedGroup.push(d)
        }

    })

    let totalNum = selectedGroup.length

    $('.summaries').text(`Total ${totalNum} meetings are available`)
    $('.summaries').css('opacity', 0.8)


    let newCenter = [selectedGroup[0]._latlng.lat, selectedGroup[0]._latlng.lng]

    mymap.setView(newCenter, 12);

    selectedFeature = L.featureGroup(selectedGroup)

    mymap.addLayer(selectedFeature)


    zooomupdate()
        // read type and sotre it as value

    // iterate through the mapdata, make a temparray meeting the condition

    // meeting array addLayer

}


function zooomupdate() {
    mymap.on('zoomend', function() {
        console.log('zoom ended');
        let currentZoom = mymap.getZoom();
        console.log('current Zoomlevel is ', currentZoom);
        let newCirclesize = 40;

        if (currentZoom > 16) {
            mymap.removeLayer(selectedFeature)

            selectedGroup.forEach((d) => { d._mRadius = newCirclesize })

            mymap.addLayer(selectedFeature)
        }

    })
}