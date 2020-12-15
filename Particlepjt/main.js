let margin={top:10,left:50,right:50,bottom:10}
let width=1000-margin.left-margin.right;
let height=500-margin.top-margin.bottom;
let svg = d3.select('.graph').attr('width',width+margin.left+margin.right)
            .attr('height',height+margin.top+margin.bottom)
let colorscheme=['#858F95','#5FFB71','#5F83FB','#F7A0F7','#FB865F']
let groupset=['Home','New Haven','Providence','Boston','Me']
let sortedData=[];
let linecolor;
let xscale;
let yscale;
let lgdsvg=d3.select('.legends').attr('width',400).attr('height',height/3)


var areaGradient = svg.append("defs")
.append("linearGradient")
.attr("id","areaGradient")
.attr("x1", "0%").attr("y1", "0%")
.attr("x2", "0%").attr("y2", "100%");

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
    let time=d3.timeParse("%Y-%m-%d")

   

    console.log(data.length);
    let cleanedData=groupset.map((t)=>{
            
        let tempobj = {name:t};
        let tempvalue=[];

        data.forEach((d)=>{
            if(d.place==t && d.event=='false'){
                tempvalue.push(
                    {
                        date:time(d.date),
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
                    date:time(d.date),
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
        let xextent=d3.extent(sortedData[0].values,(d)=>{return d.date})
        
        let yextent=[0,25]

        xscale=d3.scaleTime().domain(xextent).range([0+margin.left,width-margin.right])

        let xaxis=svg.append('g').attr('class','xaxis').attr('transform',`translate(0,${height})`)
        .call(d3.axisBottom(xscale).tickFormat(d3.timeFormat("%y/%m/%d")).ticks(15))


        linecolor=d3.scaleOrdinal().domain(sortedData).range(colorscheme)

        yscale=d3.scaleLinear().domain(yextent).range([height,0])
        let yaxis=svg.append('g').attr('class','yaxis').attr('transform',`translate(${margin.left},0)`)
        .call(d3.axisLeft(yscale).ticks(8))

        let line = d3.line()
                     .x(d=>xscale(d.date))
                     .y(d=>yscale(d.temperature))
                     .curve(d3.curveCardinal)

        // add the X gridlines
        svg.append("g")			
        .attr("class", "grid")
        .attr("transform", "translate(0," + height + ")")
        .call(make_x_gridlines()
            .tickSize(-height)
            .tickFormat("")
        )
               
        // add the Y gridlines

               

        // selectAll 에서 line을 선택한것과 안한것의 차이를 볼까
        // axis도 path이기 때문에, path를 선택하고 데이터를 바인딩하면 안된다
    svg.selectAll('linegraph')
        .data(sortedData)
        .join('path')
        .attr('d',d=>line(d.values))
        .attr('class',d=>d.name.replace(' ',''))
        .attr('stroke',d=>linecolor(d.name))
        .style('stroke-width',1)
        .style('fill','none')
    
    svg.selectAll('labels')
       .data(sortedData)
       .join('text')
       .attr('class','labels')
       .attr('class',d=>d.name.replace(' ',''))
       .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; }) 
       .attr("transform", function(d,i) {return `translate(${xscale(d.value.date)},${yscale(d.value.temperature)+i*8})`})
       .attr("x", 5)
       .attr('y',(d,i)=>{
           if(d.name=='Me'){return -25}
           else{return i}
       })
       .text(function(d) { return d.name; })
       .style("fill", function(d){ return linecolor(d.name) })
       .style("font-size", 15)
       .style('font-family','Helvetica')
       .on('click',selectObj)

       placeDots(1,5)
       placeDots(2,5)
       placeDots(4,5)
       placeDots(8,5)
       legendMaking()

    })

    function selectObj(){
        let selected=d3.select(this).attr('class')
        groupset.forEach((d)=>{
            d3.selectAll(`.${d.replace(' ','')}`).style('opacity',0.3)
        })
        d3.selectAll(`.${selected}`).style('opacity',1)
        renderArea(selected)

    }

    function renderArea(target){
        d3.select('.areagraph').remove()
        let areaselect=target;
        let targetData=[];

        if(areaselect=='NewHaven'){
            targetData.push(sortedData[1])
        }
        sortedData.forEach((d)=>{
            if(d.name==areaselect){
              targetData.push(d)
            }
        })

        let colorname=targetData[0].name

        d3.selectAll('stop').remove()

        areaGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", `${linecolor(colorname)}`)
        .attr("stop-opacity", 0.6);
        areaGradient.append("stop")
        .attr("offset", "80%")
        .attr("stop-color", "#f2f2f2")
        .attr("stop-opacity", 0);



        // console.log(targetData[0])
        
        console.log(targetData[0].values)
        svg.append('path')
           .datum(targetData[0].values)
           .attr('class','areagraph')
           .style("fill", "url(#areaGradient)")
           .attr('d',d3.area()
                       .x((d)=>{return xscale(d.date)})
                       .y0(d=>yscale(d.temperature))
                       .y1(d=>yscale(d.temperature))
                       .curve(d3.curveCardinal)
           )
           .style('opacity',0.0)
           .transition().duration(1000)
           .style('opacity',0.5)
           .attr('d',d3.area()
           .x((d)=>{return xscale(d.date)})
           .y0(d=>yscale(d.temperature))
           .y1((d,i)=>{return yscale(sortedData[4].values[i].temperature)})
           .curve(d3.curveCardinal)
           )
          
    }

    function make_x_gridlines() {		
        return d3.axisBottom(xscale)
            .ticks(15)
    }

    function placeDots(lindex,radius){
    let placetag = lindex==1? 'New Haven':lindex==2? 'Providence': lindex==4? 'Boston' : lindex==8? 'Back to Home':'N/A'
    let circle=svg.append('circle')
           .attr('class','circletag')
           .attr('cx',xscale(sortedData[4].values[lindex].date))
           .attr('cy',yscale(sortedData[4].values[lindex].temperature))
           .attr('r',radius)
           .attr('fill','rgba(255,0,0,0.4)')
           .attr('stroke','red')
        svg.append('text')
           .attr('class','placetag')
           .attr('x',xscale(sortedData[4].values[lindex].date))
           .attr('y',yscale(sortedData[4].values[lindex].temperature)+Math.pow(-1,lindex)*20)    
           .text(placetag)
    }
    
    function legendMaking(){
        let x1,x2,y1,y2,y3,y4,y5,y6
        let gap=25
        x1=10
        x2=x1+gap;
        x3=x2+gap;
        y1=20
        y2=y1+gap;
        y3=y2+gap;
        y4=y3+gap;
        y5=y4+gap;
        y6=y5+gap;
        let center = (x1+x2)/2

        lgdsvg.append('circle')
              .attr('class','legendcircle')
              .attr('cx',center)
              .attr('cy',y1)
              .attr('r',5)
              .attr('fill','rgba(255,0,0,0.4)')
              .attr('stroke','red')
        lgdsvg.append('text')
              .text('location change')
              .attr('x',x3)
              .attr('y',y1)

        lgdsvg.append('line')
              .attr('x1',x1)
              .attr('y1',y2)
              .attr('x2',x2)
              .attr('y2',y2)
              .attr('stroke',linecolor(colorscheme[0]))
        lgdsvg.append('text')
              .text('Temperature of Home location')
              .attr('x',x3)
              .attr('y',y2)

              lgdsvg.append('line')
              .attr('x1',x1)
              .attr('y1',y3)
              .attr('x2',x2)
              .attr('y2',y3)
              .attr('stroke',linecolor(colorscheme[1]))
        lgdsvg.append('text')
              .text('Temperature of New Haven')
              .attr('x',x3)
              .attr('y',y3)

              lgdsvg.append('line')
              .attr('x1',x1)
              .attr('y1',y4)
              .attr('x2',x2)
              .attr('y2',y4)
              .attr('stroke',linecolor(colorscheme[2]))
        lgdsvg.append('text')
              .text('Temperature of Providence')
              .attr('x',x3)
              .attr('y',y4)
                          

              lgdsvg.append('line')
              .attr('x1',x1)
              .attr('y1',y5)
              .attr('x2',x2)
              .attr('y2',y5)
              .attr('stroke',linecolor(colorscheme[3]))
        lgdsvg.append('text')
              .text('Temperature of Boston')
              .attr('x',x3)
              .attr('y',y5)


              lgdsvg.append('line')
              .attr('x1',x1)
              .attr('y1',y6)
              .attr('x2',x2)
              .attr('y2',y6)
              .attr('stroke',linecolor(colorscheme[4]))
        lgdsvg.append('text')
              .text('Temperature of Me')
              .attr('x',x3)
              .attr('y',y6)
    }
    // gridlines in y axis function
