/**
 * Created by svenc on 30/07/14.
 */

/*
 data
    .startDate
    .endDate
    .data
        .date
        .count

 */

var eventRelation = function(){

    var eventrelation_variableMinDate = {};
    var eventrelation_variableMaxDate = {};

    var eventrelation_svgW = 3200;//1200;
    var eventrelation_svgH = 1500;


    var eventrelation_graphPadding = 38;
    var eventrelation_graphTransformX = [];
    var eventrelation_graphTransformY = [];
    var eventrelation_axisX = {};
    var eventrelation_axisY = {};
    var eventrelation_graphDays = 0;

    var id;


    var old_eventrelation_preprocess = function(data)
    {
        var objectRange = crossfilter(data);
        var dimension = objectRange.dimension(function (f) {
            return f.object;
        });

        return dimension.group().reduce(
            function(p,v){
                p.actualEvents.push(v);
                var date = Date.parse(v.starttime);
                if(p.date == 0 || p.date > date) //look for the smallest date within this "thread" (we want to order events from first to last, so we need first even
                    p.date = date;

                p.count++;return p;

            },
            function(p,v){
                p.count--;return p;},
            function(){return {count:0, actualEvents:[],date:0};}
        ).order(function(d){return -d.date;}).top(Infinity);
    }

    var preprocess_nodes = function(data)
    {
        var xf = crossfilter(data);
        var dim = xf.dimension(function(f){return f.event_id;});
        return dim.bottom(Infinity);
    }

    var preprocess_links = function(data)
    {
        var xf = crossfilter(data);
        var dim = xf.dimension(function(f){return f.object;});
        return dim.top(Infinity);
        //SHOULD WE SORT BY DATE? //MAYBE NOT .. nodes visualized are already sorted
    }




    this.eventrelation_addGraph = function(data, id, title, color) {

        var w = eventrelation_svgW;
        var h = eventrelation_svgH;
        var svg = d3.select("body")
            .append("svg")
            .attr("id", id )
            .attr("width", w)   // <-- Here
            .attr("height", h); // <-- and here!

        eventrelation_variableMinDate = new Date(data[0].key - (1000 * 60 * 60 * 24));
        eventrelation_variableMaxDate = new Date(data[data.length-1].key+(1000 * 60 * 60 * 24));


        var xScale = d3.scale.linear()
            .domain([0, 20000])
            .range([eventrelation_graphPadding, w - eventrelation_graphPadding * 2]);
        var yMax = d3.max(data, function (d) {
            return (300)});
        var yScale = d3.scale.linear()
            .domain([0, yMax])
            .range([eventrelation_graphPadding, h+eventrelation_graphPadding]);



        eventrelation_axisX[id] = d3.svg.axis()
            .scale(xScale)
            .orient("bottom")
            .ticks(3);
        eventrelation_axisY[id] = d3.svg.axis()
            .scale(yScale)
            .orient("left")
            .ticks(1);
        eventrelation_graphTransformX[id] = xScale;
        eventrelation_graphTransformY[id] = yScale;

        svg.append("text")
            .attr("class", "ActivityGraphTitle")
            .attr("x", 35)
            .attr("y", 20)
            .attr("fill","white")
            .text(title);


        /*svg.append("g")
            .attr("id", "axis" + id)
            .attr("class", "ActivityGraphAxis")
            .attr("transform", "translate(0," + (h/2 + eventrelation_graphPadding) + ")")
            .call(eventrelation_axisX[id]);
        svg.append("g")
            .attr("class", "ActivityGraphAxis")
            .attr("transform", "translate(" + eventrelation_graphPadding + ",0)")
            .call(eventrelation_axisY[id]);
    */
        var mainBars = svg.append("g").attr("class","mainCircles");


    }

    var drawLines = function(nodes,type,root,nodeRadius)
    {
        var line = {x1:0,y1:0,x2:0,y2:0};
        var i = 0;

        nodes.each(function(e){

            if(i > 0)
            {

                line.x2 = this.getAttribute("cx");
                line.y2 = this.getAttribute("cy");
                if(type != "user")
                {
                    root.append("line")
                        .attr("hover",function(d){if(type == "hover") return true; else return false;})
                        .attr("x1",line.x1)
                        .attr("y1",function(d){ if(line.y1 < 0) return line.y1+nodeRadius*2; else return line.y1;})
                        .attr("x2",line.x1)
                        .attr("y2",line.y2)
                        .attr("stroke","white")
                        .style("stroke-opacity", function(d){
                         if(type == "relation") return .02;
                         else 1.0;
                     });
                    root.append("line")
                        .attr("hover",function(d){if(type == "hover") return true; else return false;})
                        .attr("x1",line.x1)
                        .attr("y1",line.y2)
                        .attr("x2",line.x2-nodeRadius*2)
                        .attr("y2",line.y2)
                        .attr("stroke","white")
                        .style("stroke-opacity", function(d){
                            if(type == "relation") return .02;
                            else 1.0;
                        });
                }
                else
                {
                    root.append("line")

                        .attr("x1",line.x1)
                        .attr("y1",function(d){ if(line.y1 < 0) return line.y1+nodeRadius*2; else return line.y1;})
                        .attr("x2",line.x2)
                        .attr("y2",line.y2)
                        .attr("stroke","#c9ffae")
                        .attr("stroke-width",2)
                        ;
                }

                line.x1 = this.getAttribute("cx");
                line.y1 = this.getAttribute("cy");
            }
            else
            {
                line.x1 = this.getAttribute("cx");
                line.y1 = this.getAttribute("cy");
            }
            i++;
        })
    }

    var drawHoverLine = function(d,type)
    {
        //draw lines for this thread
        var relatedEvents = d3.selectAll("[e='"+ d.object + "']");
        var svg = d3.select("#"+id);
        var mainBars = svg.select(".mainCircles");
        drawLines(relatedEvents,type,mainBars,1.5);
    }

    var isDataCollection = function(d)
    {
        if(d.verb == "read" || d.verb == "answer_given" || d.verb == "startRun" || d.verb == "response")
        return true;
        else return false;
    }


    this.eventrelation_drawGraph = function(data, links, id, color)
    {

        var svg = d3.select("#"+id);
        var mainBars = svg.select(".mainCircles");

        eventrelation_graphDays = 1+ Math.floor((eventrelation_variableMaxDate.getTime() - eventrelation_variableMinDate.getTime()) / (1000 * 60 * 60 * 24));
        eventrelation_graphTransformX[id].domain([0, data.length]);

        d3.select("#axis"+id).call(eventrelation_axisX[id]);

        var globalVariables = {eventVsPosition:{},farthestEvent:undefined, lastEvent:undefined};


        var g = mainBars

                .append("g")
                .data([globalVariables])

            ;



        var circles = g.selectAll("circle")
            .data(data)
            .attr("eventId" , function(d){
                    return d;})
           /* .attr("cx", function (d,i) {
                return eventrelation_graphTransformX[id](this.parentNode.getAttribute("index"));
            })
            .attr("cy", function (d,i) { return eventrelation_graphTransformY[id](i);})
            .attr("r", 5)
            .attr("fill","white")
            .on('mouseover', function(d){
                var nodeSelection = d3.select(this).style({opacity:'0.8'});
                nodeSelection.append("text").text("test");
            })*/
    ;



        circles
            .enter()
            .append("circle")
            .attr("e" , function(d){
                if(isDataCollection(d)) return "datacollection"; else return d.object;})

            .attr("cx", function (d,i) {

                //get global vars
                var eventVsPosition = this.parentNode.__data__.eventVsPosition;
                var farthestEvent = this.parentNode.__data__.farthestEvent;
                var x;

                var structureIdentifier = d.object;
                if(isDataCollection(d)) structureIdentifier = "datacollection";

                // start of the cycle, reset all
                if(farthestEvent == undefined)
                {
                    x = 0;

                    this.parentNode.__data__.eventVsPosition[structureIdentifier] = {x:0, y:0};

                    this.parentNode.__data__.farthestEvent = {event:d, x:0, y:0};
                    //console.log("we're still initializing");
                    return eventrelation_graphTransformX[id](x);

                }
                //we're in an existing thread, so either go to it if farthest thread, otherwise, start new column
                if(eventVsPosition[structureIdentifier] != undefined)
                {


                    //we are the last thread
                    if(this.parentNode.__data__.farthestEvent.event.object == d.object
                        || (isDataCollection(d) && isDataCollection(this.parentNode.__data__.farthestEvent.event)))
                    {
                        x = eventVsPosition[structureIdentifier].x;
                        this.parentNode.__data__.eventVsPosition[structureIdentifier].x = x;
                        //console.log("we're still in the last thread");

                    }
                    //no we're not
                    else
                    {
                        x = farthestEvent.x + 2;
                        this.parentNode.__data__.eventVsPosition[structureIdentifier] = {x: x, y:eventVsPosition[structureIdentifier].y};
                        this.parentNode.__data__.farthestEvent = {event:d, x:x, y:eventVsPosition[structureIdentifier].y};

                        if(isDataCollection(d))
                        {
                            this.parentNode.__data__.eventVsPosition[structureIdentifier].y = 0;
                            this.parentNode.__data__.farthestEvent.y = 0;
                            console.log("resetting Y");
                        }

                        //console.log("we should be moving to a new column in same thread");


                    }


                    return eventrelation_graphTransformX[id](x);

                }
                //we discovered a new thread, so go to the next column
                if(eventVsPosition[structureIdentifier] == undefined)
                {

                    x =  farthestEvent.x + 2;
                    this.parentNode.__data__.eventVsPosition[structureIdentifier]=  {x: x, y:0}

                    this.parentNode.__data__.farthestEvent = {event:d, x:x, y:0};


                    return eventrelation_graphTransformX[id](x);
                }
                console.log("ERROR: we missed a case!");



            })
            .attr("cy", function (d,i) {

                var eventVsPosition = this.parentNode.__data__.eventVsPosition;

                var y;

                var structureIdentifier = d.object;
                if(isDataCollection(d)) structureIdentifier = "datacollection";
                if(this.parentNode.__data__.lastEvent == undefined)
                    this.parentNode.__data__.lastEvent = d;

                //we're in an existing thread, so either go to it if farthest thread, otherwise, start new column
                if(eventVsPosition[structureIdentifier] != undefined)
                {
                    y = eventVsPosition[structureIdentifier].y + 2;
                    if(isDataCollection(d) && !isDataCollection(this.parentNode.__data__.lastEvent))
                    {
                        y=2;
                    }


                    this.parentNode.__data__.eventVsPosition[structureIdentifier].y = y;
                    this.parentNode.__data__.lastEvent = d;
                    return eventrelation_graphTransformY[id](y);

                }
                //we discovered a new thread, so go to the next column
                if(eventVsPosition[structureIdentifier] == undefined)
                {
                    y =  0;
                    this.parentNode.__data__.eventVsPosition[structureIdentifier].y = y;

                    this.parentNode.__data__.lastEvent = d;
                    return eventrelation_graphTransformY[id](y);
                }
                console.log("ERROR: we missed a case!");


            })
            .attr("r", function(d)
            {
               // if(d.username == "Google_109002798505335212351")
                 //return 3;
                //else return 2;
                return 3;
            })
            .attr("fill", function(d) {
                if(d.verb == "create")
                    return "#8accff";
                if(d.verb == "comment" || d.verb == "answer")
                    return "#a68aff";
                if(d.verb == "like")
                    return "#e5ff8a";
                if(d.verb == "rated" || d.verb == "rating_updated")
                    return "#e5ff8a";
                if(d.verb == "edit")
                    return "#ffa08a";
                if(d.verb == "read" || d.verb == "answer_given" || d.verb == "startRun")
                    return "red";
                if(d.verb == "response")
                    return "red";
                if(d.verb == "delete_like" || d.verb == "delete_comment")
                    return "#e6009d"
                return "white";

            })
            .on("mouseover", function(d){drawHoverLine(d,"hover");})
            .on("mouseleave",function(d){
                d3.selectAll("line[hover='true']").remove();

            })
            .attr("isRoot", function(d){
                if(this.parentNode.__data__.eventVsPosition[d.object] == undefined)
                    return true;
                else return false;
            })
            .attr("username", function(d){
                return d.username;
            })
            .append('svg:title')
            .text( function(d){
                return d.object + " " + d.starttime + " " + d.verb;
            })
        ;

        circles
            .exit()
            .remove();


        //draw lines
        links.forEach(function(l)
        {
            var nodes = d3.selectAll("[e='"+ l.object + "']");
            var svg = d3.select("#"+id);
            var mainBars = svg.select(".mainCircles");
            drawLines(nodes,"relation",mainBars,1.5);
        });
        //let's highlight a user
        var nodes = d3.selectAll("[username='Google_109002798505335212351']");
        var svg = d3.select("#"+id);
        var mainBars = svg.select(".mainCircles");
        drawLines(nodes,"user",mainBars,1.5);


    }

    return {
        "eventrelation_init" : function(data, identifier)
        {
            id = identifier;
            var n = preprocess_nodes(data);
            var l = preprocess_links(data);
            eventrelation_addGraph(n,identifier,identifier,"#008293");
            eventrelation_drawGraph(n,l, identifier, "#008293");

        }
    }
}();
