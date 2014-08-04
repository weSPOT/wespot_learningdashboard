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


var eventflow_variableMinDate = {};
var eventflow_variableMaxDate = {};

var eventflow_svgW = 2000;//1200;
var eventflow_svgH = 1000;


var eventflow_graphPadding = 38;
var eventflow_graphTransformX = [];
var eventflow_graphTransformY = [];
var eventflow_axisX = {};
var eventflow_axisY = {};
var eventflow_graphDays = 0;



function eventflow_preprocess(data)
{
    var dateRange = crossfilter(data);
    var dateRangeWithDayDimension = dateRange.dimension(function (f) {
        var d = Date.parse(f.starttime.split(" ")[0]);
        return Date.UTC(new Date(d).getFullYear(), new Date(d).getMonth(), new Date(d).getDate());
    });

    return dateRangeWithDayDimension.group().reduce(
        function(p,v){
            p.actualEvents.push(v);
            var date = Date.parse(v.starttime.split(" ")[0]);

            p.date = Date.UTC(new Date(date).getFullYear(), new Date(date).getMonth(), new Date(date).getDate());
            p.count++;return p;

        },
        function(p,v){
            p.count--;return p;},
        function(){return {count:0, actualEvents:[],date:0};}
    ).order(function(d){return -d.date;}).top(Infinity);
}

function eventflow_init(data)
{

    var d = eventflow_preprocess(data);
    eventflow_addGraph(d,"flow","flow","#008293");
    eventflow_drawGraph(d, "flow", "#008293");

}

function eventflow_update(data)
{

}


function eventflow_addGraph(data, id, title, color) {

    var w = eventflow_svgW;
    var h = eventflow_svgH;
    var svg = d3.select("body")
        .append("svg")
        .attr("id", id )
        .attr("width", w)   // <-- Here
        .attr("height", h); // <-- and here!

    eventflow_variableMinDate = new Date(data[0].key - (1000 * 60 * 60 * 24));
    eventflow_variableMaxDate = new Date(data[data.length-1].key+(1000 * 60 * 60 * 24));


    var xScale = d3.time.scale()
        .domain([eventflow_variableMinDate, eventflow_variableMaxDate])
        .range([eventflow_graphPadding, w - eventflow_graphPadding * 2]);
    var yMax = d3.max(data, function (d) {
        return (1000 * 60 * 60 * 24);
    });
    var yScale = d3.time.scale()
        .domain([0, yMax])
        .range([eventflow_graphPadding, h/2+eventflow_graphPadding]);



    eventflow_axisX[id] = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .tickFormat(d3.time.format("%d/%m"));
    eventflow_axisY[id] = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .tickFormat(d3.time.format("%H:%M"));
    eventflow_graphTransformX[id] = xScale;
    eventflow_graphTransformY[id] = yScale;

    svg.append("text")
        .attr("class", "ActivityGraphTitle")
        .attr("x", 35)
        .attr("y", 20)
        .attr("fill","white")
        .text(title);


    svg.append("g")
        .attr("id", "axis" + id)
        .attr("class", "ActivityGraphAxis")
        .attr("transform", "translate(0," + (h/2 + eventflow_graphPadding) + ")")
        .call(eventflow_axisX[id]);
    svg.append("g")
        .attr("class", "ActivityGraphAxis")
        .attr("transform", "translate(" + eventflow_graphPadding + ",0)")
        .call(eventflow_axisY[id]);

    var mainBars = svg.append("g").attr("class","mainCircles");


}

function eventflow_drawGraph(data, id, color)
{

    var svg = d3.select("#"+id);
    var mainBars = svg.select(".mainCircles");

    eventflow_graphDays = 1+ Math.floor((eventflow_variableMaxDate.getTime() - eventflow_variableMinDate.getTime()) / (1000 * 60 * 60 * 24));
    eventflow_graphTransformX[id].domain([eventflow_variableMinDate, eventflow_variableMaxDate]);

    d3.select("#axis"+id).call(eventflow_axisX[id]);



    var g = mainBars
            .selectAll("g")
            .data(data)
       ;

    g
            .enter()
            .append("g")
        ;

    g.exit().remove();


    var circles = g.selectAll("circle")
        .data(function(d){return d.value.actualEvents;})
        .attr("cx", function (d) {
            return eventflow_graphTransformX[id](new Date(d.starttime).getTime());
        })
        .attr("cy", function (d,i) { return eventflow_graphTransformY[id](new Date(d.starttime).getHours()*60*60*1000);})
        .attr("r", 5)
        .attr("fill","white");



    circles
        .enter()
        .append("circle")
        .attr("cx", function (d) {
            return eventflow_graphTransformX[id](new Date(d.starttime).getTime());
        })
        .attr("cy", function (d,i) { return eventflow_graphTransformY[id](new Date(d.starttime).getHours()*60*60*1000);})
        .attr("r", 5)
        .attr("fill", function(d) {
            if(d.username == "facebook_696307806")
                return "red";
            else
                return "white";

        });

    circles
        .exit()
        .remove();



}

