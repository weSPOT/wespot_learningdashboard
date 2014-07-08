
function loadContent(data, username)
        {
            /*var allData = <%- JSON.stringify(events) %>;

             var xdata = crossfilter(allData);
             var xdata_userDimension = xdata.dimension(function (f){ return f.tag});
xdata_userDimension.filterFunction(
function (f) {
    if(f.tags == data.tags) return true; else return false;
    });
var tmp = xdata_userDimension.top(Infinity);*/
$("#eventData").html("");
            var list = document.createElement('ul');
            $(list).appendTo("#eventData");

            //get all the data for the thread
            var toAdd = [];
            d3.selectAll("circle").attr("stroke-width","2px");
            var relatedItems = d3.selectAll('[tags="' + data.tags + '"],[object="' + data.object + '"]');
            relatedItems[0].forEach(function(d){
                toAdd.push(d.__data__);

                //meanwhile indicate which ones are related in the visualisation
                $(d)
                        .attr("stroke-width", "5px");

            });
            var byPhaseByObjectByTime = {};
            toAdd.forEach(function(d){
                if(byPhaseByObjectByTime[d.phase] == undefined)
                    byPhaseByObjectByTime[d.phase] = {};
                if(byPhaseByObjectByTime[d.phase][d.object] == undefined)
                    byPhaseByObjectByTime[d.phase][d.object] = [];
                byPhaseByObjectByTime[d.phase][d.object].push(d);

            });
            var sortByTime = function(a,b)
            {
                if(a.startTime < b.startTime) return -1;
                if(a.startTime > b.startTime) return 1;
                return 0;
            }
            Object.keys(byPhaseByObjectByTime).forEach(function(d){
                Object.keys(byPhaseByObjectByTime[d]).forEach(function(e){
                    byPhaseByObjectByTime[d][e].sort(sortByTime);
                    byPhaseByObjectByTime[d][e].forEach(function(f){
                        var listItem = document.createElement('li');
                        listItem.setAttribute("class", "oneEvent");

                        $(listItem).html(f.html).appendTo(list);
                    });

                });




            });


        }


         var heighestNumberOfEvents_ForAPhase = 50;
         var sizeOfBox = 10;
         var width = 120;
         var spacingBetweenSquares = 2;
         var columns  = parseInt(width / (sizeOfBox + spacingBetweenSquares));  //parseInt(Math.sqrt(heighestNumberOfEvents_ForAPhase));
         //$('.visualization').width();

         //var sizeOfBox = (width / columns);

         var numberOfRows = (heighestNumberOfEvents_ForAPhase / columns);
         var height = numberOfRows *  (sizeOfBox + spacingBetweenSquares);

        function filter(phase, widget)
        {
            //make small the circles that aren't selected
            var svgs = d3.selectAll(".vis_phase" + phase);
            svgs.selectAll("circle")
                    .attr("visibility", function(){
                        if(widget == "" || this.__data__.subphase == widget)
                                return "visible"
                        else
                            return "hidden";
                    });
            //select the right dropdown
            $("#dropdown-phase"+phase + " .dd_selected")[0].setAttribute("class","");
            $("#dropdown-phase"+phase + "_" + widget)[0].setAttribute("class","dd_selected");




        }
        function drawPhase(data, username,phase)
         {

             var tr = d3.select("#box_"+username);
             var svgCollection = tr
                     .append("td")

                     .attr("class","visualization vis_phase" + phase)

                     .attr("height",height)
                     .text("");

            data = data.sort(function(a, b){ return d3.ascending(a.startTime, b.startTime); });
             svgCollection.selectAll("svg")
                     .data(data)
                     .enter()
                     .append("svg")
                     .attr("class", "vis_circle")
                     .attr("height", 20)
                     .attr("width",20)
                     .append("circle")
                     .attr("cx", 10)
                     .attr("cy", 10)
                     .attr("r", function(d) {
                         if(ratings[d.object]!= undefined && ratings[d.object].ratingCount != 0)
                             return ((ratings[d.object].rating/ratings[d.object].ratingCount)/5)*7 +2;
                         return 4;
                     })

                     .attr("class", function(d){ return "eventSquare widget_" + d.subphase;})
                     .attr("stroke", "#595959")
.attr("fill", function(d){
                        // if(!d.today)
                        //    return colors_dark[d.phase-1];
                        // else
                            return colors[d.phase-1];
                          })
                     .attr("stroke-width", "2px")
                     .attr("tags", function(d){return d.tags;})
                     .attr("object", function(d){return d.object;})
                     .on("click",function(d){ loadContent(d, username); });
             /*svgCollection.selectAll("svg")
                     .data(data)

                     .append("text")
                     .attr("fill","white")
                     .attr("font-size","10px")
                     .attr("x", 8)
                     .attr("y", 11)
                     //.attr("class","unselectable eventSquare")
                     .attr("text-anchor","middle")
                     .on("click",function(d){ loadContent(d, username); })
                     .text(function(d) {
                        if(ratings[d.object]!= undefined && ratings[d.object].ratingCount != 0)
                         return ratings[d.object].rating/ratings[d.object].ratingCount;
                     });*/
         }

var usersOfSelectedInquiries = [];

function regenerate()
{
    $("#mainTable").html("");
    usersOfSelectedInquiries = [];
    for(var a in activeInquiry)
    {
        generateInquiry(dataPerInquiry[activeInquiry[a]]);
    }
    $("#studentSelection").html("");
    //fill list of users
    for(var a in usersOfSelectedInquiries)
    {
        $("#studentSelection").append('<option selected="true" value="'+ usersOfSelectedInquiries[a].user +'">' + usersOfSelectedInquiries[a].name + '</option>')
    }
    //sort just about everything

    $("#inquirySelection").find("option").sort(function(a,b){
        return $(a).text().localeCompare($(b).text());
    }).appendTo($("#inquirySelection"));

    $("#studentSelection").find("option").sort(function(a,b){
        return $(a).text().localeCompare($(b).text());
    }).appendTo($("#studentSelection"));

    var tbody = $("#mainTable").find("tbody");
    tbody.find("tr").sort(function(a,b){
            return $(a).text().localeCompare($(b).text());
        }

    ).appendTo(tbody);

}

function generateInquiry(selectedInquiry)
{

    var events = selectedInquiry.data.events;
    for(var user_phases_key in events)
    {
        var user_phases = events[user_phases_key];
        if(user_phases.username.toLowerCase() == (userAuthProvider + "_" + userAuthId).toLowerCase()) continue;
        var displayUser = "";
        if(users[user_phases.username] != undefined)
            displayUser= users[user_phases.username].name;
        else
            displayUser = user_phases.username;
        usersOfSelectedInquiries.push({user:user_phases.username, name: displayUser});

        $("#mainTable").append("<tr id='box_" +  user_phases.username + "_" + selectedInquiry.inquiry.inquiryId + "' class='box_vis'><td class='studentName'>" + displayUser
            + "<span>[" + selectedInquiry.inquiry.title +"]</span></td></tr>");;
        for(var i=1;i<=6;i++)
        {
            var user_events = user_phases[i]
            if(user_events == undefined) continue;
            var d = user_events;
            drawPhase(d, user_phases.username+ "_" + selectedInquiry.inquiry.inquiryId,i);
        }
    }
}



function inquirySelectionChanged()
{
    var selectedOptions = $("#inquirySelection option:selected").toArray();
    activeInquiry = [];
    for(var s in selectedOptions)
    {
        activeInquiry.push($(selectedOptions[s]).attr("value"));
    }
    /*var newlySelectedInquiry =  $("#inquirySelection option:selected").attr("value");
    var indexOfNewlySelected = activeInquiry.indexOf(newlySelectedInquiry);
    if(indexOfNewlySelected < 0)
        activeInquiry.push(newlySelectedInquiry);
    else
        activeInquiry.splice(indexOfNewlySelected, 1);
   */


    regenerate();
}

function studentSelectionChanged()
{
    var selectedOptions = $("#studentSelection option:selected").toArray();

    $('[class="box_vis"]').hide();
    for(var s in selectedOptions)
    {
        var student = $(selectedOptions[s]).attr("value");
        $('[id*="' + student + '"]').show();
    }

}