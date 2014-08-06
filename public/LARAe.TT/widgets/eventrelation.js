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

    var eventrelation_svgW = 5200;//1200;
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
        var byEvents = xf.dimension(function(f){return f.event_id;});
        var byVerb =  xf.dimension(function(f){return f.verb;});
        byVerb.filter(function(d){
            if(d != "read" && d != "answer_given" && d != "startRun" && d != "like" && d != "delete_like")
                return d;
        });
        return byEvents.bottom(Infinity);
    }

    var preprocess_links = function(data)
    {
        var xf = crossfilter(data);
        var dim = xf.dimension(function(f){return f.object;});
        return dim.top(Infinity);
        //SHOULD WE SORT BY DATE? //MAYBE NOT .. nodes visualized are already sorted
    }

    var preprocess_users = function(data)
    {
        var xf = crossfilter(data);
        var dim = xf.dimension(function(f){return f.username.toLowerCase();});
        return dim.group().reduce(
            function(p,v){
                p.count++;return p;

            },
            function(p,v){
                p.count--;return p;},
            function(){return {count:0};}
        ).top(Infinity);
    }




    var eventrelation_addGraph = function(data, id, title, color,div) {

        var w = eventrelation_svgW;
        var h = eventrelation_svgH;
        var svg = d3.select(div)
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
            return (100)});
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

    var drawLines = function(nodes,type,root,nodeRadius,color)
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
                        .attr("stroke-width",4)
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
                        .attr("stroke-width",4)
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
                        .attr("stroke",color)
                        .attr("stroke-width",4)
                        .attr("line", "userLine")
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
        drawLines(relatedEvents,type,mainBars,3);
    }

    var isDataCollection = function(d)
    {
        if(d.verb == "read" || d.verb == "answer_given" || d.verb == "startRun" || d.verb == "response")
        return true;
        else return false;
    }


    var eventrelation_drawGraph = function(data, links, users, id, color)
    {

        var svg = d3.select("#"+id);
        var mainBars = svg.select(".mainCircles");

        eventrelation_graphDays = 1+ Math.floor((eventrelation_variableMaxDate.getTime() - eventrelation_variableMinDate.getTime()) / (1000 * 60 * 60 * 24));
        eventrelation_graphTransformX[id].domain([0, data.length]);

        d3.select("#axis"+id).call(eventrelation_axisX[id]);

        var globalVariables = {eventVsPosition:{},farthestEvent:undefined, lastEvent:undefined, highestX:0, highestY:0};


        var g = mainBars

                .append("g")
                .data([globalVariables])
                .attr("id",id+"_root")

            ;



        var circles = g.selectAll("g")
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
            .append("g")
            .attr("vis", true)
            .attr("e" , function(d){
                if(isDataCollection(d)) return "datacollection"; else return d.object;})
            .attr("verb", function(d){ return d.verb;})
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
                    this.setAttribute("column", true);
                    x = 30;

                    this.parentNode.__data__.eventVsPosition[structureIdentifier] = {x:x, y:40};

                    this.parentNode.__data__.farthestEvent = {event:d, x:x, y:40};
                    this.parentNode.__data__.highestX = x;
                    //console.log("we're still initializing");
                    return x;//eventrelation_graphTransformX[id](x);

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
                        this.setAttribute("column", true);
                        x = farthestEvent.x + 30;
                        this.parentNode.__data__.eventVsPosition[structureIdentifier] = {x: x, y:eventVsPosition[structureIdentifier].y};
                        this.parentNode.__data__.farthestEvent = {event:d, x:x, y:eventVsPosition[structureIdentifier].y};

                        if(isDataCollection(d))
                        {
                            this.parentNode.__data__.eventVsPosition[structureIdentifier].y = 40;
                            this.parentNode.__data__.farthestEvent.y = 40;
                            console.log("resetting Y");
                        }

                        //console.log("we should be moving to a new column in same thread");


                    }

                    if(x > this.parentNode.__data__.highestX) this.parentNode.__data__.highestX = x;
                    return x;// eventrelation_graphTransformX[id](x);

                }
                //we discovered a new thread, so go to the next column
                if(eventVsPosition[structureIdentifier] == undefined)
                {
                    this.setAttribute("column", true);
                    x =  farthestEvent.x + 30;
                    this.parentNode.__data__.eventVsPosition[structureIdentifier]=  {x: x, y:40}

                    this.parentNode.__data__.farthestEvent = {event:d, x:x, y:40};


                    return x;//eventrelation_graphTransformX[id](x);
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
                    y = eventVsPosition[structureIdentifier].y + 15;
                    if(isDataCollection(d) && !isDataCollection(this.parentNode.__data__.lastEvent))
                    {
                        y=40;
                    }


                    this.parentNode.__data__.eventVsPosition[structureIdentifier].y = y;
                    this.parentNode.__data__.lastEvent = d;
                    if(y > this.parentNode.__data__.highestY) this.parentNode.__data__.highestY = y;
                    return y;//eventrelation_graphTransformY[id](y);

                }
                //we discovered a new thread, so go to the next column
                if(eventVsPosition[structureIdentifier] == undefined)
                {
                    y =  40;
                    this.parentNode.__data__.eventVsPosition[structureIdentifier].y = y;

                    this.parentNode.__data__.lastEvent = d;
                    return y;//eventrelation_graphTransformY[id](y);
                }
                console.log("ERROR: we missed a case!");


            })
            .attr("r", function(d)
            {
               // if(d.username == "Google_109002798505335212351")
                 //return 3;
                //else return 2;
                return 6;
            })
            .attr("fill", function(d) {
                if(d.verb == "create")
                    return "#8accff";
                if(d.verb == "comment" || d.verb == "answer")
                    return "#a68aff";
                if(d.verb == "like")
                    return "#feff90";
                if(d.verb == "rated" || d.verb == "rating_updated")
                    return "#feff90";
                if(d.verb == "edit")
                    return "#8accff";
                if(d.verb == "read" || d.verb == "answer_given" || d.verb == "startRun")
                    return "#fd6cff";
                if(d.verb == "response")
                    return "#fd6cff";
                if(d.verb == "delete_like" || d.verb == "delete_comment")
                    return "red"
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
                return d.username.toLowerCase();
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

            var svg = d3.select("#"+id);
            var nodes = svg.selectAll("[e='"+ l.object + "']");
            var mainBars = svg.select(".mainCircles");
            drawLines(nodes,"relation",mainBars,3);
        });
       /* //let's highlight a user
        var nodes = d3.selectAll("[username='google_105939139551108473521']");
        var svg = d3.select("#"+id);
        var mainBars = svg.select(".mainCircles");
        drawLines(nodes,"user",mainBars,3);
*/
        //let's highlight ALL users :D
        /*users.forEach(function(u){
            var nodes = d3.selectAll("[username='"+ u.key +"']");
            var svg = d3.select("#"+id);
            var mainBars = svg.select(".mainCircles");
            drawLines(nodes,"user",mainBars,3, "#c9ffae");
            console.log("user " + u.key);
        });*/
        var phase_colors = ["#33FF99","#33CCFF","#CCFF33","#FF0066","#CCFFFF","#FF66CC"];
        mainBars.selectAll("g[column='true']")
            .append("rect")
            .attr("width",30)
            .attr("height",25)
            .attr("fill",function(d)
            {
                return phase_colors[d.context.phase-1];
            })
            .attr("fill-opacity",.9)
            .attr("transform", function(d){
                var x = this.parentNode.attributes.cx.value-15;
                var y = 10;
                return "translate(" + x + "," + y + ")";
            });

        mainBars
            .selectAll("g[e='datacollection']")
            .append("polygon")
            .attr("points","0,10, 5,0, 10,10")
            .attr("transform", function(d){
                var x = this.parentNode.attributes.cx.value - 5;
                var y = this.parentNode.attributes.cy.value - 5;
                return "translate(" + x + "," + y + ")";
            })
            .attr("fill",function(d){return this.parentNode.attributes.fill.value;})

            ;

        mainBars
            .selectAll("g[verb='create']")
            .append("rect")
            .attr("width",10)
            .attr("height",10)

            .attr("x",
            function(d){
                return this.parentNode.attributes.cx.value-5;
            })
            .attr("fill",function(d){return this.parentNode.attributes.fill.value;})
            .attr("y",
            function(d){
                return this.parentNode.attributes.cy.value-5;
            });

        mainBars
            .selectAll("g[vis]:not([verb='create']):not([e='datacollection'])")
            .append("circle")
            .attr("r",6)

            .attr("fill",function(d){return this.parentNode.attributes.fill.value;})
            .attr("cx",
            function(d){
                return this.parentNode.attributes.cx.value;
            })
            .attr("cy",
            function(d){
                return this.parentNode.attributes.cy.value;
            });
            //resize SVG;

            svg
                .attr("width",svg.select("[id='" + id + "_root']")[0][0].__data__.highestX+15)
                .attr("height",svg.select("[id='" + id + "_root']")[0][0].__data__.highestY+15);


    }

    return {
        "highlightUsers" : function(filter)
        {
            var svg = d3.select("#"+id);
            //if(filter.length == 0)
            {
                svg.selectAll("line[line='userLine']").remove();
                return;
            }
            filter.forEach(function(f){
                var nodes = svg.selectAll("[username='"+f+"']");
                var mainBars = svg.select(".mainCircles");
                drawLines(nodes,"user",mainBars,3,"#c9ffae");
            });

        },
        "eventrelation_init" : function(data, identifier, div)
        {
            id = identifier;
            var n = preprocess_nodes(data);
            var l = preprocess_links(data);
            var users = preprocess_users(data);
            eventrelation_addGraph(n,identifier,identifier,"#008293",div);
            eventrelation_drawGraph(n,l,users, identifier, "#008293");

        }
    }
};