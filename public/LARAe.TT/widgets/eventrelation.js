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

    var eventrelation_svgW = 1200;//1200;
    var eventrelation_svgH = 800;


    var eventrelation_graphPadding = 38;
    var eventrelation_graphTransformX = [];
    var eventrelation_graphTransformY = [];
    var eventrelation_axisX = {};
    var eventrelation_axisY = {};
    var eventrelation_graphDays = 0;



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

    var preprocess = function(data)
    {
        var xf = crossfilter(data);
        var dim = xf.dimension(function(f){return f.event_id;});
        return dim.bottom(Infinity);
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

    this.eventrelation_drawGraph_old = function(data, id, color)
    {

        var svg = d3.select("#"+id);
        var mainBars = svg.select(".mainCircles");

        eventrelation_graphDays = 1+ Math.floor((eventrelation_variableMaxDate.getTime() - eventrelation_variableMinDate.getTime()) / (1000 * 60 * 60 * 24));
        eventrelation_graphTransformX[id].domain([0, data.length]);

        d3.select("#axis"+id).call(eventrelation_axisX[id]);



        var g = mainBars
                .selectAll("g")
                .data(data)
                .attr("index", function(d,i){return i;})
           ;

        g
                .enter()
                .append("g")
              .attr("index", function(d,i){return i;})
            ;

        g.exit().remove();


        var circles = g.selectAll("circle")
            .data(function(d){

                d.value.actualEvents.sort(
                    function(a,b){
                        if(a.starttime > b.starttime) return 1;
                        if(a.starttime < b.starttime) return -1;
                        return 0;
                    }
                );
                return d.value.actualEvents;})

            .attr("cx", function (d,i) {
                return eventrelation_graphTransformX[id](this.parentNode.getAttribute("index"));
            })
            .attr("cy", function (d,i) { return eventrelation_graphTransformY[id](i);})
            .attr("r", 5)
            .attr("fill","white")
            .on('mouseover', function(d){
                var nodeSelection = d3.select(this).style({opacity:'0.8'});
                nodeSelection.append("text").text("test");
            });



        circles
            .enter()
            .append("circle")
            .attr("cx", function (d,i) {
                return eventrelation_graphTransformX[id](this.parentNode.getAttribute("index"));
            })
            .attr("cy", function (d,i) { return eventrelation_graphTransformY[id](i);})
            .attr("r", 2)
            .attr("fill", function(d) {
                if(d.username == "facebook_696307806")
                    return "red";
                else
                    return "white";

            })
            .append('svg:title')
            .text( function(d){
                return d.object + " " + d.starttime + " " + d.verb;
            })
        ;

        circles
            .exit()
            .remove();



    }

    this.eventrelation_drawGraph = function(data, id, color)
    {

        var svg = d3.select("#"+id);
        var mainBars = svg.select(".mainCircles");

        eventrelation_graphDays = 1+ Math.floor((eventrelation_variableMaxDate.getTime() - eventrelation_variableMinDate.getTime()) / (1000 * 60 * 60 * 24));
        eventrelation_graphTransformX[id].domain([0, data.length]);

        d3.select("#axis"+id).call(eventrelation_axisX[id]);

        var globalVariables = {eventVsPosition:{},farthestEvent:undefined};


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
            .attr("eventRootObject" , function(d){
                return d.object;})
            .attr("cx", function (d,i) {

                //get global vars
                var eventVsPosition = this.parentNode.__data__.eventVsPosition;
                var farthestEvent = this.parentNode.__data__.farthestEvent;
                var x;
                // start of the cycle, reset all
                if(farthestEvent == undefined)
                {
                    x = 0;

                    this.parentNode.__data__.eventVsPosition[d.object] = {x:0, y:0};

                    this.parentNode.__data__.farthestEvent = {event:d, x:0, y:0};
                    //console.log("we're still initializing");
                    return eventrelation_graphTransformX[id](x);

                }
                //we're in an existing thread, so either go to it if farthest thread, otherwise, start new column
                if(eventVsPosition[d.object] != undefined)
                {
                    //we are the last thread
                    if(this.parentNode.__data__.farthestEvent.event.object == d.object)
                    {
                        x = eventVsPosition[d.object].x;
                        this.parentNode.__data__.eventVsPosition[d.object].x = x;
                        //console.log("we're still in the last thread");
                    }
                    //no we're not
                    else
                    {
                        x = farthestEvent.x + 2;
                        this.parentNode.__data__.eventVsPosition[d.object] = {x: x, y:0};
                        this.parentNode.__data__.farthestEvent = {event:d, x:x, y:0};
                        //console.log("we should be moving to a new column in same thread");
                    }

                    return eventrelation_graphTransformX[id](x);

                }
                //we discovered a new thread, so go to the next column
                if(eventVsPosition[d.object] == undefined)
                {

                    x =  farthestEvent.x + 2;
                    this.parentNode.__data__.eventVsPosition[d.object]=  {x: x, y:0}

                    this.parentNode.__data__.farthestEvent = {event:d, x:x, y:0};

                    return eventrelation_graphTransformX[id](x);
                }
                console.log("ERROR: we missed a case!");



            })
            .attr("cy", function (d,i) {

                var eventVsPosition = this.parentNode.__data__.eventVsPosition;

                var y;

                //we're in an existing thread, so either go to it if farthest thread, otherwise, start new column
                if(eventVsPosition[d.object] != undefined)
                {

                    y = eventVsPosition[d.object].y + 2;
                    this.parentNode.__data__.eventVsPosition[d.object].y = y;


                    return eventrelation_graphTransformY[id](y);

                }
                //we discovered a new thread, so go to the next column
                if(eventVsPosition[d.object] == undefined)
                {
                    y =  0;
                    this.parentNode.__data__.eventVsPosition[d.object].y = y;



                    return eventrelation_graphTransformY[id](y);
                }
                console.log("ERROR: we missed a case!");


            })
            .attr("r", function(d)
            {
                if(d.username == "Google_109002798505335212351")
                 return 3;
                else return 2;
            })
            .attr("fill", function(d) {
                if(d.verb == "create")
                    return "#8accff";
                if(d.verb == "comment" || d.verb == "answer")
                    return "#a68aff";
                if(d.verb == "like")
                    return "#8aff9d";
                if(d.verb == "rated" || d.verb == "rating_updated")
                    return "#e5ff8a";
                if(d.verb == "edit")
                    return "#ffa08a";
                if(d.verb == "read" || d.verb == "answer_given" || d.verb == "startRun")
                    return "#ffb98a";
                if(d.verb == "response")
                    return "#b7b99e";
                if(d.verb == "delete_like" || d.verb == "delete_comment")
                    return "#e6009d"
                return "white";

            })
            .append('svg:title')
            .text( function(d){
                return d.object + " " + d.starttime + " " + d.verb;
            })
        ;

        circles
            .exit()
            .remove();



    }

    return {
        "eventrelation_init" : function(data, identifier)
        {

            var d = preprocess(data);
            eventrelation_addGraph(d,identifier,identifier,"#008293");
            eventrelation_drawGraph(d, identifier, "#008293");

        }
    }
}();
