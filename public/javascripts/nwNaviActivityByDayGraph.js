function nwNaviActivityByDayGraph()
{
	var name = "nwNaviActivityByDayGraph";
	var states = [];
	var animations = [];
	var eventHandler =  
	{
		onHit: function(point, obj)
		{
		},
		onLetGo: function(obj)
		{
		},
		onMove: function(point, obj)
		{

		}
	};






}

var svgW = 600;//1200;
var svgH = 170;
var graphBarPadding = 1;
var graphPadding = 38;
var graphTransformX = [];
var graphTransformY = [];
var axisX = {};
var axisY = {};
var graphDays = 0;

function redrawAllGraphs()
{
    //always draw them, as they will auto reset the values with an empty array
    var graphs = ["nwActivityGraph","nwTweetGraph","nwBlogPostGraph","nwBlogCommentGraph", "nwBadgeActivityGraph"];

    graphs.forEach(function(d){
        var svg = d3.select("#"+d);
        var mainBars = svg.select(".mainBars");
        drawGraph(dataCache[d].DATA, d,colors[0][d]);
        if(dataCache[d].DATA_USERS2.length == 0  && dataCache[d].DATA_USERS.length == 0)
        {
            mainBars.selectAll("rect").transition()
                .duration(500).attr("fill", colors[0][d]);
        }
        else
        {
            mainBars.selectAll("rect").transition()
                .duration(500).attr("fill", fadedColors[d]);
        }

        if(dataCache[d].DATA_USERS2.length == 0)
            drawSubGraph(subGraph_mode.ONE_LIST, d,dataCache[d].DATA_USERS);
        else
            drawSubGraph(subGraph_mode.FIRST_LIST, d,dataCache[d].DATA_USERS);
        drawSubGraph(subGraph_mode.SECOND_LIST, d,dataCache[d].DATA_USERS2);



    });

    loadBlockChart(dataCache["nwActivityGraph"].DATA);




}

function drawGraph(data, id, color) {

    var svg = d3.select("#"+id);
    var mainBars = svg.select(".mainBars");
    var subBars = svg.select(".subBars");

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
            return graphTransformX[id](d.key);// * (w / dataset.length);
        })
        .attr("width", (svgW - 2*graphPadding) /graphDays)
        .attr("y", function (d) {
            return graphTransformY[id](d.value.count);//d[1];
        })
        .attr("height", function (d) {
            //console.log("height is " + d[1] + " yScale is" + yScale(d[1]));
            return svgH - graphTransformY[id](d.value.count) - graphPadding;
        })
        .attr("fill", color);//"teal");

    p.exit().remove();

    var toAddToFw = svg.selectAll("rect");
    var objects = [];
    for (var i = 0; i < toAddToFw[0].length; i++) {
        //console.log(test[0][t].id);
        //objects.push(new nwNaviGraphBar(id, toAddToFw[0][i].id, data[i].key));
        if(data[i] != null)
        {
            var key = data[i].key;
            toAddToFw[0][i].addEventListener('mousedown', function(event){
                barClick_callback(event.srcElement.__data__.value.actualEvents)
                //graphBarHit(event.srcElement.attributes["chart"].value, event.srcElement.__data__.key);
            });
        }
    }

}

var subGraph_mode = {ONE_LIST:0, FIRST_LIST:1, SECOND_LIST:2};

function drawSubGraph(mode, id, data) {
    var svg = d3.select("#"+id);

    var mainBars = svg.select(".mainBars");




    var barXOffset;
    var barWidth;
    var barGroupName;
    var barColor;
    switch(mode)
    {
        case  subGraph_mode.FIRST_LIST:
            barXOffset = 0;
            barWidth = ((svgW - 2*graphPadding) / graphDays) / 2;
            barGroupName = "#subBars";
            barColor = colors[1][id];
            break;
        case subGraph_mode.SECOND_LIST:
            barXOffset = ((svgW - 2*graphPadding) / graphDays) / 2;
            barWidth = ((svgW - 2*graphPadding) / graphDays) / 2;
            barGroupName = "#subBars2";
            barColor = colors[2][id];
            break;
        case subGraph_mode.ONE_LIST:
            barXOffset = 0;
            barWidth = ((svgW - 2*graphPadding) / graphDays);
            barGroupName = "#subBars";
            //reset if there is still a comparison
            barColor = colors[1][id];
            break;
    }






    /*mainBars.selectAll("rect").transition()
        .duration(500).attr("fill", fadedColors[id]);
    */
    var subBars = svg.select(barGroupName);

    var p = subBars.selectAll("rect")
        .data(data)
        .attr("class", "subBar")
        .attr("x", function (d) {
            return graphTransformX[id](d.key) + barXOffset;
        })
        .attr("width", barWidth)
        .attr("y", function (d) {
            return graphTransformY[id](d.value.count);//d[1];
        })
        .attr("height", function (d) {
            return svgH - graphTransformY[id](d.value.count) - graphPadding;
        });
    p
        .enter()
        .append("rect")
        .attr("class", "subBar")
        .attr("id", function (d, i) {
            return id + i;
        })
        .attr("x", function (d) {
            return graphTransformX[id](d.key) + barXOffset;
        })
        .attr("width", barWidth)
        .attr("y", function (d) {
            return graphTransformY[id](d.value.count);//d[1];
        })
        .attr("height", function (d) {
            return svgH - graphTransformY[id](d.value.count) - graphPadding;
        })
        .attr("fill", barColor);
    p.exit().remove();

    /*subBars.selectAll("rect")
        .data(data)
        .transition()
        .duration(500)
        .attr("id", function (d, i) {
            return id + i;
        })
        .attr("x", function (d) {
            return graphTransformX[id](d.key) + barXOffset;
        })
        .attr("width", barWidth)
        .attr("y", function (d) {
            return graphTransformY[id](d.value);//d[1];
        })
        .attr("height", function (d) {
            return svgH - graphTransformY[id](d.value) - graphPadding;
        })
        .attr("fill", barColor);
    ; */
}


function addGraph(data, id, title, color) {

    var w = svgW;
    var h = svgH;
    var svg = d3.select("#nwContainerArea")
        .append("svg")
        .attr("id", id )
        .attr("width", w)   // <-- Here
        .attr("height", h); // <-- and here!


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
    svg.append("g").attr("class","subBars");
    svg.append("g").attr("class","subBars2");

}

var colors = [];
var fadedColors = {};
colors[0] = {};
colors[1] = {};
colors[2] = {};

colors[0]["nwTweetGraph"] = "#008293";
colors[0]["nwActivityGraph"] = "#008293";
colors[0]["nwBlogCommentGraph"] = "#008293";
colors[0]["nwBlogPostGraph"] = "#008293";
colors[0]["nwBadgeActivityGraph"] = "#008293";

fadedColors["nwTweetGraph"] = "#004959";
fadedColors["nwActivityGraph"] = "#004959";
fadedColors["nwBlogCommentGraph"] = "#004959";
fadedColors["nwBlogPostGraph"] = "#004959";
fadedColors["nwBadgeActivityGraph"] = "#004959";

colors[2]["nwTweetGraph"] = "#ff877f";
colors[2]["nwActivityGraph"] = "#ff877f";
colors[2]["nwBlogCommentGraph"] = "#ff877f";
colors[2]["nwBlogPostGraph"] = "#ff877f";
colors[2]["nwBadgeActivityGraph"] = "#ff877f";

colors[1]["nwTweetGraph"] = "#00daec";
colors[1]["nwActivityGraph"] = "#00daec";
colors[1]["nwBlogCommentGraph"] = "#00daec";
colors[1]["nwBlogPostGraph"] = "#00daec";
colors[1]["nwBadgeActivityGraph"] = "#00daec";

var dataCache = {
        "nwTweetGraph": {DATA:[], DATA_USERS: [], DATA_USERS2: []},
        "nwActivityGraph": {DATA:[], DATA_USERS: [], DATA_USERS2: []},
        "nwBlogCommentGraph": {DATA:[], DATA_USERS: [], DATA_USERS2: []},
        "nwBlogPostGraph": {DATA:[], DATA_USERS: [], DATA_USERS2: []},
    "nwBadgeActivityGraph": {DATA:[], DATA_USERS: [], DATA_USERS2: []} ,
    "nwBadgeGraphs": {DATA:[], DATA_USERS: [], DATA_USERS2: []}
};




var activityData = [];


var minDate = new Date(1361145600000);
var maxDate = new Date(1369612800000);
var variableMinDate = minDate;
var variableMaxDate = maxDate;

var graphsActivated = [{"nwActivityGraph":false},{"nwTweetGraph":false},{"nwBlogPostGraph":false},{"nwBlogCommentGraph":false},{"nwBadgeActivityGraph":false},{"nwBadgeGraphs":false} ];

function getActivityPerDay(activityPerDayFilteredArray) {

    var dateRange = crossfilter(activityPerDayFilteredArray);
    var dateRangeWithDayDimension = dateRange.dimension(function (f) {
        var d = Date.parse(f.starttime.split(" ")[0]);
        return Date.UTC(new Date(d).getFullYear(), new Date(d).getMonth(), new Date(d).getDate());
    });

    var activityPerDayFiltered = dateRangeWithDayDimension.group().reduce(
        function(p,v){
            p.actualEvents.push(v);
            p.count++;return p;
        },
        function(p,v){
            p.count--;return p;},
        function(){return {count:0, actualEvents:[]};}

    );


    //.reduceCount();

    // main activity graph
    return activityPerDayFiltered.top(Infinity);

}

function getCountPerBadge(activityArray) {
    var badgeRange = crossfilter(activityArray);
    var badgeRangeDimension = badgeRange.dimension(function (f) {
       return f.badge_image.replace(/\/|\./g, "_");;
    });
    var badgeFiltered = badgeRangeDimension.group().reduce(
         function(p,v){
             p.count++;p.badge_image = v.badge_image;return p;},
        function(p,v){
            p.count--;p.badge_image = v.badge_image;return p;},
        function(){return {count:0, badge_image:""};}

    );

    // main activity graph
    return badgeFiltered.order(function(d){
        return d.badge_image;
    }).top(Infinity);
}

function filterByUsersAndReturnGroupByDay(dataToFilter,userList)
{
    if(userList.length > 0)
    {
        var filteredActivityCF = crossfilter(dataToFilter);
        var filteredActivityCFdimension = filteredActivityCF.dimension(function(f){return f.username;});
        filteredActivityCFdimension.filterFunction(function(f)
        {
            for(var i=0;i<userList.length;i++)
            {
                if(userList[i] == f)
                    return true;
            }
            return false;
        });
        return getActivityPerDay(filteredActivityCFdimension.top(Infinity));

    }
    else
    {
        return [];
    }
}

function filterByUsersAndReturnCountPerBadge(dataToFilter,userList)
{
    if(userList.length > 0)
    {
        var filteredActivityCF = crossfilter(dataToFilter);
        var filteredActivityCFdimension = filteredActivityCF.dimension(function(f){return f.username;});
        filteredActivityCFdimension.filterFunction(function(f)
        {
            for(var i=0;i<userList.length;i++)
            {
                if(userList[i] == f)
                    return true;
            }
            return false;
        });
        return getCountPerBadge(filteredActivityCFdimension.top(Infinity));

    }
    else
    {
        return [];
    }
}


function updateGraph(data)
{
    if(data != null)
        activityData = data;
    activityData.forEach(function(d){
        var json = null;
        try
        {
             json = JSON.parse(d.originalrequest);
        }
        catch(error)
        {
            //console.log(d);
        }
        if(json){
            d.originalrequest = json;
            if(d.verb == "awarded")
                d.badge_image = d.originalrequest.badge != null ? d.originalrequest.badge.image : d.originalrequest.originalrequest.badge.image;
                if(d.badge_image == null)
                    d.verb = "incorrectformat";
         }
    });


    //only get the activity of the period we need
    var activity = crossfilter(activityData);
    var activityPerDayDimension = activity.dimension(function(f) {
        var d = Date.parse(f.starttime.split(" ")[0]);
        return Date.UTC(new Date(d).getFullYear(), new Date(d).getMonth(), new Date(d).getDate());
    });
    var _minDate = variableMinDate;
    var _maxDate = variableMaxDate;
    var filteredActivity = activityPerDayDimension.filter([_minDate.valueOf(), _maxDate.valueOf()]).top(Infinity);

    //here we have the date range set. now we can filter per verb

    //first, all activity
    //get rid of badges in this one
    var activityWithoutBadges = crossfilter(filteredActivity);
    var activityWithoutBadgesDimension = activityWithoutBadges.dimension(function(f) {return f.verb;});
    var activityWithoutBadgesArray = activityWithoutBadgesDimension.filter(function(f) {return f!="awarded"}).top(Infinity);

    dataCache["nwActivityGraph"]["DATA"] = getActivityPerDay(activityWithoutBadgesArray);
    if(!graphsActivated["nwActivityGraph"])
    {
        graphsActivated["nwActivityGraph"] = true;
        addGraph(dataCache["nwActivityGraph"]["DATA"], "nwActivityGraph","Total Activity", colors[0]["nwActivityGraph"]);
    }
    //filter by users if users selected
    dataCache["nwActivityGraph"]["DATA_USERS"] = filterByUsersAndReturnGroupByDay(filteredActivity,graph_selectedUsers[0]);
    dataCache["nwActivityGraph"]["DATA_USERS2"] = filterByUsersAndReturnGroupByDay(filteredActivity,graph_selectedUsers[1]);


    //other 3 graphs
    var verbs = [{verb:"tweeted", graph:"nwTweetGraph", title:"Tweets"}  ,
        {verb:"posted", graph:"nwBlogPostGraph", title:"Blog Posts"},
        {verb:"commented", graph:"nwBlogCommentGraph", title:"Blog Comments"},
        {verb:"awarded", graph:"nwBadgeActivityGraph", title:"Badges"}];

    verbs.forEach(function(d){
        var onlyTweets = crossfilter(filteredActivity);
        var onlyTweetsDimension = onlyTweets.dimension(function(f) {return f.verb;});
        var onlyTweetsFilteredArray = onlyTweetsDimension.filter(d.verb).top(Infinity);

        dataCache[d.graph]["DATA"] = getActivityPerDay(onlyTweetsFilteredArray);
        dataCache[d.graph]["DATA_USERS"] = filterByUsersAndReturnGroupByDay(onlyTweetsFilteredArray,graph_selectedUsers[0]);
        dataCache[d.graph]["DATA_USERS2"] = filterByUsersAndReturnGroupByDay(onlyTweetsFilteredArray,graph_selectedUsers[1]);
        if(!graphsActivated[d.graph])
        {
            graphsActivated[d.graph] = true;
            addGraph(dataCache[d.graph]["DATA"], d.graph, d.title, colors[0][d.graph]);
        }
        if(d.verb == "awarded")
        {
            //per badge graph
            dataCache["nwBadgeGraphs"]["DATA"] = getCountPerBadge(onlyTweetsFilteredArray);
            dataCache["nwBadgeGraphs"]["DATA_USERS"] = {};
            //get them per key, easier to fetch later
            //set 1
            var keyValue  = filterByUsersAndReturnCountPerBadge(onlyTweetsFilteredArray,graph_selectedUsers[0]);
            keyValue.forEach(function(d)
            {
                dataCache["nwBadgeGraphs"]["DATA_USERS"][d.key] = d.value;
            });

            //set 2
            keyValue  = filterByUsersAndReturnCountPerBadge(onlyTweetsFilteredArray,graph_selectedUsers[1]);
            keyValue.forEach(function(d)
            {
                dataCache["nwBadgeGraphs"]["DATA_USERS2"][d.key] = d.value;
            });
            if(!graphsActivated["nwBadgeGraphs"])
            {
                graphsActivated["nwBadgeGraphs"] = true;
               // initSingleBadgeGraphs();
            }
            //loadSingleBadgeGraphs();
        }

    });





    //redraw all

    redrawAllGraphs();

    updateActivityWithSelectedUsers();

    ///




}

function updateActivityWithSelectedUsers()
{

    var activities = $(".activityEntry");
    //check activity tab, see if we need to color us some students
    for(var i = 0; i < activities.length; i++)
    {
        if(activities[i].attributes["student"] == null) continue;
        if(graph_selectedUsers[0].indexOf(activities[i].attributes["student"].value) != -1)
        {
            activities[i].setAttribute("class","activityEntry activitySet1");
        }

        else if(graph_selectedUsers[1].indexOf(activities[i].attributes["student"].value) != -1)
        {
            activities[i].setAttribute("class","activityEntry activitySet2");
        }
        else
        {
            activities[i].setAttribute("class","activityEntry");
        }

    }
}



var graph_selectedUsers = []
    graph_selectedUsers[0] = [];
    graph_selectedUsers[1] = [];

function updateGraph_Users(user)
{

    graph_selectedUsers[compareGroupStatus].push(user);
    updateGraph();
}

function updateGraph_UsersDeleted(user)
{

    var index = graph_selectedUsers[compareGroupStatus].indexOf(user);
    if(index != -1)
        graph_selectedUsers[compareGroupStatus].splice(index, 1);
    updateGraph();

}


