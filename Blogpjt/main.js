
let groupset=['Home','New Haven','Providence','Boston','Me']
let sortedData=[];
let fileurl='./img/'

var templateInfo=document.getElementById('album-template').innerHTML;
//grocery-template element in the HTML gives the blue print for the handlebar

var template = Handlebars.compile(templateInfo);
// template , Handlebars.compile does read the template given
// and generate a method?

var context={
    values:[
    ]
}
let mouseX;
let mouseY;


d3.json('/ptcapi').then((d)=>{
    let lats=[];
    let lons=[];
    let data = Array.from(d)

    // since geometry has a set of string not an accurate lat/lon value, need to convert them.
    d.forEach((d,i)=>{
        let lat=parseFloat(d.geometry.split('coordinates":')[1].split(',')[0].replace('[',''))
        let lon=parseFloat(d.geometry.split('coordinates":')[1].split(',')[1].replace(']','').replace('}',''))
        lats.push(lat)
        lons.push(lon)
        data[i].geometry=[lat,lon]    
    })


    console.log(data.length);
    let cleanedData=groupset.map((t)=>{
            
        let tempobj = {name:t};
        let tempvalue=[];

        data.forEach((d)=>{
            if(d.place==t && d.event=='false'){
                tempvalue.push(
                    {
                        date:d.date,
                        temperature:+d.temperature
                    }
                )
            }
        })
        tempobj.values=tempvalue;
        return tempobj
        })

        data.forEach((d)=>{
            if(d.event!=='false'){
                cleanedData[4].values.push(                    {
                    date:d.date,
                    temperature:+d.temperature,
                    event:d.event
                })
            }
        })

        console.log(cleanedData);
        


        cleanedData.forEach((d)=>{
            let sortedName=d.name
            let sortedValue=d.values.slice().sort((a,b)=>d3.ascending(a.date,b.date))

            sortedData.push({
                name:sortedName,
                values:sortedValue
            })
        })

        console.log(sortedData);

        sortedData[4].values.forEach((d,i)=>{
            context.values.push(
                {
                    name:locationtag(i),
                    date:d.date,
                    src1:`${fileurl}${d.date.split('-')[1]}${d.date.split('-')[2]}_1.jpg`,
                    src2:`${fileurl}${d.date.split('-')[1]}${d.date.split('-')[2]}_2.jpg`,
                    src3:`${fileurl}${d.date.split('-')[1]}${d.date.split('-')[2]}_3.jpg`
                }
            )
        })
        setTimeout(()=>{
            $('.albums').click(function(event){
                let dateSelected = $(event.target).parent().children('.dates').text()
                let location=$(event.target).parent().children('.placetag').text()
                let mouseCoord=[event.pageX,event.pageY];

                console.log(dateSelected);

                showData(dateSelected,mouseCoord,location)
             })
     
        },1000)
     

// template receives a data given by me

    var templateData = template(context);
        
    document.getElementById('contentDiv').innerHTML+=templateData
    // templateData 는 template가 compile한 html바디이고
    // 이 html body를 최종적으로 contentDiv에 붙여넣은것이라고보면됨

    setTimeout(()=>{
        let myTimeline=gsap.timeline();

        myTimeline.staggerTo(".albums", 1, {visibility:'visible'}, 0.1);
    },500)


       

})






function locationtag(t){
    let i = t;
    return i==0?  'Home':i==1?  'New Haven':i==2?  'Providence I':i==3?  'Providence II'
    :i==4?  'Boston I':i==5?  'Boston II':i==6?  'Boston III':i==7?  'Boston IV':i==8?  'Home Again I'
    :i==9?  'Home Again II':i==10?  'Home again III':i==11?  'Home Again IV':i==12?  'Home Again V'
    :i==13?  'Home Again VI':i==14?  'Home Again VII':i==15?  'Home Again VIII':'N/A'
}

function showData(date,coord,location){

    hideBack(coord[1])
    // removeContainer();
    console.log(date,coord);

    let filedate=`${date.split('-')[1]}${date.split('-')[2]}`
    let temp,myEvent,mapCoord;


    sortedData[4].values.forEach((d,i)=>{
        if(d.date==date){
            temp=d.temperature;
            myEvent=d.event;
            mapCoord=coordTrack(i)
        }
    })
    console.log(temp);
    console.log(myEvent);
    console.log(mapCoord);



    $('body').append(`<div style='position:absolute;top:${coord[1]-100}px;left:0px' class='visContainer'>
            <div class='backbtn'>
            <p onclick='removeContainer()'><span>&#8678</span>Back to Album</p>
            </div>
            <div class='photoContainer'>
                <img src='${fileurl}${filedate}_1.jpg' class='detailImg'>
                <img src='${fileurl}${filedate}_2.jpg' class='detailImg'>
                <img src='${fileurl}${filedate}_3.jpg' class='detailImg'>
            </div>
            <div id='mymap'></div>
            <div class='detailContainer'>
                <div class='detailHeader'>${location}</div>
                <span class='vertical'></span>
                <div class='detailInfo'>
                    <span style='margin-top:15px'>Date: ${date}</span>
                    <span style='margin-top:15px'>Temperature: ${temp}</span>
                    <span style='margin-top:15px'>Event: ${myEvent}</span>
                </div>
            </div>
        </div>`
    )

        renderMap(mapCoord)

 
}

function removeContainer(){
    $('.visContainer').remove()
    $('#contentDiv').css('visibility','visible')
    $('.heading').css('position','fixed')
                 .css('top',`0px`)
                 .css('filter','none')
    $('.albums').css('visibility','visible')

}
function coordTrack(i){
    let answer;
    let Home=[40.77072887826365,-73.92110109329224];
    let NewHaven=[41.31335431129952,-72.93093681335449];
    let Providence=[41.84603570059349,-71.48655652999878];
    let Boston=[42.35645485511916,-71.05637848377228];

    return i==0? Home
    :i==1? NewHaven
    :i==2? Providence
    :i==3? Providence
    :i==4? Boston
    :i==5? Boston
    :i==6? Boston
    :i==7? Boston
    :i==8 || 9 || 10 || 11 || 12 || 13 || 14 || 15? Home
    :'N/A'

}

function renderMap(mapCoord){


    let mymap = L.map('mymap',{zoomControl:false}).setView(mapCoord, 14)

    var mytile = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png')
    .addTo(mymap);

    let markerStyle={
        fillColor:'#FF0000',
        color:'#ffffff',
        radius:200,
        opacity:0.8,
        weight:0.5
    }
    var circle=L.circle(mapCoord,markerStyle).addTo(mymap)


}

function hideBack(toppos){
    $('.albums').css('visibility','hidden')
    $('#contentDiv').css('visibility','hidden')
    $('.heading').css('position','absolute')
                 .css('top',`${toppos-300}px`)
                 .css('filter','blur(1px)')
   
}