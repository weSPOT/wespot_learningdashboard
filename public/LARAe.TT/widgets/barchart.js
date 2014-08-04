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

var minDate = new Date(1361145600000);
var maxDate = new Date(1369612800000);
var variableMinDate = minDate;
var variableMaxDate = maxDate;

var svgW = 600;//1200;
var svgH = 170;
var graphBarPadding = 1;
var graphPadding = 38;
var graphTransformX = [];
var graphTransformY = [];
var axisX = {};
var axisY = {};
var graphDays = 0;

function preprocess(data)
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

function barchart_init(data)
{

    var d = preprocess(data);
    addGraph(d,"test","test","#008293");
    drawGraph(d, "test", "#008293");

}

function barchart_update(data)
{

}


function addGraph(data, id, title, color) {

    var w = svgW;
    var h = svgH;
    var svg = d3.select("body")
        .append("svg")
        .attr("id", id )
        .attr("width", w)   // <-- Here
        .attr("height", h); // <-- and here!

    variableMinDate = new Date(data[0].key - (1000 * 60 * 60 * 24));
    variableMaxDate = new Date(data[data.length-1].key+(1000 * 60 * 60 * 24));


    var xScale = d3.time.scale()
        .domain([variableMinDate, variableMaxDate])
        .range([graphPadding, w - graphPadding * 2]);
    var yMax = d3.max(data, function (d) {
        return d.value.count;
    });
    var yScale = d3.scale.linear()
        .domain([0, yMax])
        .range([h - graphPadding, graphPadding]);



    axisX[id] = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .tickFormat(d3.time.format("%d/%m"));
    axisY[id] = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .ticks(3);
    graphTransformX[id] = xScale;
    graphTransformY[id] = yScale;

    svg.append("text")
        .attr("class", "ActivityGraphTitle")
        .attr("x", 35)
        .attr("y", 20)
        //.attr("x", -h/2)
        //.attr("y", 20)
        //.attr("text-anchor", "middle")
        //.attr("transform", "rotate(-90)")
        .attr("fill","white")
        .text(title);


    svg.append("g")
        .attr("id", "axis" + id)
        .attr("class", "ActivityGraphAxis")
        .attr("transform", "translate(0," + (h - graphPadding) + ")")
        .call(axisX[id]);
    svg.append("g")
        .attr("class", "ActivityGraphAxis")
        .attr("transform", "translate(" + graphPadding + ",0)")
        .call(axisY[id]);

    var mainBars = svg.append("g").attr("class","mainBars");


}

function drawGraph(data, id, color)
{

    var svg = d3.select("#"+id);
    var mainBars = svg.select(".mainBars");

    graphDays = 1+ Math.floor((variableMaxDate.getTime() - variableMinDate.getTime()) / (1000 * 60 * 60 * 24));
    graphTransformX[id].domain([variableMinDate, variableMaxDate]);

    d3.select("#axis"+id).call(axisX[id]);

    var p = mainBars.selectAll("rect")
        .data(data)

        .attr("x", function (d) {
            return graphTransformX[id](d.key);// * (w / dataset.length);
        })
        .attr("width", (svgW - 2*graphPadding) / graphDays)
        .attr("y", function (d) {
            return graphTransformY[id](d.value.count);//d[1];
        })
        .attr("height", function (d) {

            //console.log("height is " + d[1] + " yScale is" + yScale(d[1]));
            return svgH - graphTransformY[id](d.value.count) - graphPadding;
        })
        .attr("fill", color);

    p
        .enter()
        .append("rect")
        .attr("class", "mainBar")
        .attr("chart", id)
        .attr("id", function (d, i) {
            return id + i;
        })
        .attr("x", function (d) {
            return graphTransformX[id](d.key);
        })
        .attr("width", (svgW - 2*graphPadding) /graphDays)
        .attr("y", function (d) {
            return graphTransformY[id](d.value.count);//d[1];
        })
        .attr("height", function (d) {
            return svgH - graphTransformY[id](d.value.count) - graphPadding;
        })
        .attr("fill", color);//"teal");

    p.exit().remove();


}
