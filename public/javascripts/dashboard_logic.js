/* ****************************************************************************
 * Copyright (C) 2014 KU Leuven
 * <p/>
 * This library is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * <p/>
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 * <p/>
 * You should have received a copy of the GNU Lesser General Public License
 * along with this library.  If not, see <http://www.gnu.org/licenses/>.
 * <p/>
 * Contributors: Sven Charleer
 * *************************************************************************** */

var innerR = 0;
var outerR = 5;
var arc0 = d3.svg.arc()
    .innerRadius(innerR)
    .outerRadius(outerR)
    .startAngle(0 )
    .endAngle( 0 * (Math.PI/180)) ;
var arc1 = d3.svg.arc()
    .innerRadius(innerR)
    .outerRadius(outerR)
    .startAngle(0 )
    .endAngle( 72 * (Math.PI/180)) ;
var arc2 = d3.svg.arc()
    .innerRadius(innerR)
    .outerRadius(outerR)
    .startAngle(0 ) //converting from degs to radians
    .endAngle( 2* 72 * (Math.PI/180)) //just radians
var arc3 = d3.svg.arc()
    .innerRadius(innerR)
    .outerRadius(outerR)
    .startAngle(0 ) //converting from degs to radians
    .endAngle( 3* 72 * (Math.PI/180)) //just radians
var arc4 = d3.svg.arc()
    .innerRadius(innerR)
    .outerRadius(outerR)
    .startAngle(0 ) //converting from degs to radians
    .endAngle( 4* 72 * (Math.PI/180)) //just radians
var arc5 = d3.svg.arc()
    .innerRadius(innerR)
    .outerRadius(outerR)
    .startAngle(0 ) //converting from degs to radians
    .endAngle( 5* 72 * (Math.PI/180)) //just radians


function scrollToAnchor(aid){
    var aTag = $("[rightbar_id='"+ aid +"']");
    $('#eventData').animate({scrollTop: aTag.position().top - $("#userList").position().top},'slow');
}




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




            $("#eventData").empty("");

            var list = document.createElement('ul');
            $(list).appendTo("#eventData");

            //get all the data for the thread
            var toAdd = [];
            d3.selectAll("circle").attr("stroke","none");
            d3.selectAll("path").attr("stroke-width","3px");
            d3.selectAll("path").attr("stroke","none");
            var relatedItems = [];
            if(data.tags != undefined && data.tags != "")
                relatedItems = d3.selectAll('circle[tags="' + data.tags + '"],circle[object="' + data.object + '"]');
            else
                relatedItems = d3.selectAll('circle[object="' + data.object + '"]');
            relatedItems[0].forEach(function(d){


                //meanwhile indicate which ones are related in the visualisation
                $(d)
                       // .attr("fill",colors[1])
                    .attr("stroke","#6BAAFC");

            });
            if(data.tags != undefined && data.tags != "")
                relatedItems = d3.selectAll('path[tags="' + data.tags + '"],path[object="' + data.object + '"]');
            else
                relatedItems = d3.selectAll('path[object="' + data.object + '"]');
            relatedItems[0].forEach(function(d){
                toAdd.push(d.__data__);

                //meanwhile indicate which ones are related in the visualisation
                $(d)
                    //.attr("fill","#565656")
                    .attr("stroke","#6BAAFC");

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
                        listItem.setAttribute("rightbar_id", f.id);
                        if(f.id == data.id) listItem.setAttribute("class","oneEvent highlightEvent");
                        $(listItem).html(f.html).appendTo(list);
                    });

                });




            });
            scrollToAnchor(data.id);

            //add tracking to each anchor
            $('a').click(function(){
                trackData(username, "click", "source", defaultInquiry, {"url":$(this).attr('href')});
            });

            trackData(username, "click", "event", defaultInquiry, {"original_event":data});
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
            svgs.selectAll("svg")
                    .attr("visibility", function(){
                        if(widget == "" || this.__data__.subphase == widget)
                                return "visible"
                        else
                            return "hidden";
                    });
            //select the right dropdown
            $("#dropdown-phase"+phase + " .dd_selected")[0].setAttribute("class","");
            $("#dropdown-phase"+phase + "_" + widget)[0].setAttribute("class","dd_selected");
            trackData(userAuthProvider + " " + userAuthId, "filter", "widgets", defaultInquiry, {"phase":phase,"widget":widget});





        }
        function drawPhase(data, username,phase, ratings)
         {
             /* create 5 arcs for star ratings */


             var rUsername = username.replace(".","\\.");
             var tr = d3.select("#box_"+rUsername);
             tr.attr("entries" + phase, data.length);

             var svgCollection = tr
                     .append("td")

                     .attr("class","visualization vis_phase" + phase)

                     .attr("height",height)

                     .text("");

            data = data.sort(function(a, b){ return d3.ascending(a.startTime, b.startTime); });

             var xdata = crossfilter(data);
             var xdata_skillDimension = xdata.dimension(function (f){ return f.activityId});
             xdata_skillDimension.filterFunction(
                 function (f) {
                     if(activeSkills.length == 0) return true;
                     if(activeSkills.indexOf(f)>=0) return true; else return false;
                 });
             var tmp = xdata_skillDimension.top(Infinity);

             svgCollection.selectAll("svg").data(tmp)
                 .enter().append("svg")
                 .attr("height", 12)
                 .attr("width",12)
                 .append("circle")
                 .attr("class", "vis_circle")
                 .attr("cx", 6)
                 .attr("cy", 6)
                 .attr("r", 5)
                 .attr("fill", "#565656")
                 .attr("tags", function(d){return d.tags;})
                 .attr("object", function(d){return d.object;})
                 .on("click",function(d){ loadContent(d, username); });;
             svgCollection.selectAll("svg")

                 .append("path")
                 .attr("class", "vis_circle")

                 .attr("d", function(d) {
                     if(_showAdminRating)
                     {
                         if(ratings[d.object]!= undefined && ratings[d.object].adminRatingCount != 0) {
                             /*if (Math.round(ratings[d.object].adminRating / ratings[d.object].adminRatingCount) == 1)
                                 return arc1();
                             if (Math.round(ratings[d.object].adminRating / ratings[d.object].adminRatingCount) == 2)
                                 return arc2();
                             if (Math.round(ratings[d.object].adminRating / ratings[d.object].adminRatingCount) == 3)
                                 return arc3();
                             if (Math.round(ratings[d.object].adminRating / ratings[d.object].adminRatingCount) == 4)
                                 return arc4();
                             if (Math.round(ratings[d.object].adminRating / ratings[d.object].adminRatingCount) == 5)
                             */
                             return arc5();
                         }
                     }
                     else {
                         if (ratings[d.object] == undefined || ratings[d.object].ratingCount == 0) {
                             return arc5();
                         }
                         /*if (ratings[d.object] != undefined && ratings[d.object].ratingCount != 0) {
                             if (Math.round(ratings[d.object].rating / ratings[d.object].ratingCount) == 1)
                                 return arc1();
                             if (Math.round(ratings[d.object].rating / ratings[d.object].ratingCount) == 2)
                                 return arc2();
                             if (Math.round(ratings[d.object].rating / ratings[d.object].ratingCount) == 3)
                                 return arc3();
                             if (Math.round(ratings[d.object].rating / ratings[d.object].ratingCount) == 4)
                                 return arc4();
                             if (Math.round(ratings[d.object].rating / ratings[d.object].ratingCount) == 5)
                                 return arc5();
                         }*/
                         return arc5();
                     }
                     return arc5();})
                 .attr("stroke", "#595959")
                 .attr("transform", "translate(6,6)")
                 .attr("class", function(d){ return "eventSquare widget_" + d.subphase;})

                 .attr("fill", function(d){
                     // if(!d.today)
                     //    return colors_dark[d.phase-1];
                     // else

                     if(_showAdminRating) {
                         if(ratings[d.object]!= undefined && ratings[d.object].adminRatingCount != 0) {
                             var rating = Math.round(ratings[d.object].adminRating / ratings[d.object].adminRatingCount);

                             return colors_rating[rating - 1];
                         }
                     }
                     else
                     {
                         if (ratings[d.object] != undefined && ratings[d.object].ratingCount != 0) {
                             var rating = Math.round(ratings[d.object].rating / ratings[d.object].ratingCount);

                             return colors_rating[rating - 1];
                         }
                     }

                     //return "#000000";
                    // return "#71b9f7";
                 })
                 .attr("stroke-width", "0px")
                 .attr("tags", function(d){return d.tags;})
                 .attr("object", function(d){return d.object;})
                 .on("click",function(d){ loadContent(d, username); });

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
        //if(user_phases.username.toLowerCase() == (userAuthProvider + "_" + userAuthId).toLowerCase()) continue;
        var displayUser = "";
        if(users[user_phases.username] != undefined)
            displayUser= users[user_phases.username].name;
        else
            displayUser = user_phases.username;
        usersOfSelectedInquiries.push({user:user_phases.username, name: displayUser});

        $("#mainTable").append("<tr id='box_" +  user_phases.username + "_" + selectedInquiry.inquiry.inquiryId + "' class='box_vis'><td class='studentName'>" + displayUser
            + "<span>[" + selectedInquiry.inquiry.title +"]</span></td></tr>");;

        phases.forEach(function(i){
            var user_events = user_phases[i]
            if(user_events == undefined) return;
            var d = user_events;
            drawPhase(d, user_phases.username+ "_" + selectedInquiry.inquiry.inquiryId,i, selectedInquiry.data.ratings);
        });
    }
}

var activeSkills = [];
function skillSelectionChanged()
{
    var selectedOptions = $("#skillSelection option:selected").toArray();
    activeSkills = [];
    for(var s in selectedOptions)
    {
        filters[$(selectedOptions[s]).attr("value")].activities.forEach(function(activity){
            activeSkills.push(activity.activity_id);
        });
        //activeSkills.push($(selectedOptions[s]).attr("value"));
    }

    /*var newlySelectedInquiry =  $("#inquirySelection option:selected").attr("value");
     var indexOfNewlySelected = activeInquiry.indexOf(newlySelectedInquiry);
     if(indexOfNewlySelected < 0)
     activeInquiry.push(newlySelectedInquiry);
     else
     activeInquiry.splice(indexOfNewlySelected, 1);
     */


    regenerate();
    correctSizes();
    trackData(userAuthProvider + " " + userAuthId, "filter", "skills", defaultInquiry, {"active_skills":activeSkills});

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

    correctSizes();
    trackData(userAuthProvider + " " + userAuthId, "filter", "inquiry", defaultInquiry, {"active_inquiries":activeInquiry});

}

function studentSelectionChanged()
{
    var selectedOptions = $("#studentSelection option:selected").toArray();
    var students = [];
    $('[class="box_vis"]').hide();
    for(var s in selectedOptions)
    {
        var student = $(selectedOptions[s]).attr("value");
        $('[id*="' + student + '"]').show();
        students.push(student);
    }
    trackData(userAuthProvider + " " + userAuthId, "filter", "student", defaultInquiry, {"active_students":students});


}


var sortingDirections = {};
function sortBy(type)
{


    //set direction
    if(sortingDirections[type] == undefined)
        sortingDirections[type] = 1;
    else sortingDirections[type] = -sortingDirections[type];


    switch(type){
        case "name":
            $("#mainTable").each(function(i){
                var trs = $(this).children().children().get();
                trs.sort(function(a,b){

                    return sortingDirections[type] * $(a).text().localeCompare($(b).text());
                });
                $(this).append(trs);
            });
            trackData(userAuthProvider + " " + userAuthId, "sort", "name", defaultInquiry, {"sort_direction":sortingDirections[type]});

            break;
        default:
            //it's a verb, sort by verb
            $("#mainTable").each(function(i){
                var trs = $($(this).children()[0]).children().get();
                trs.sort(function(a,b){

                    if(+$(a).attr("entries"+type) < +$(b).attr("entries"+type)) return -1 * sortingDirections[type];
                    if(+$(a).attr("entries"+type) > +$(b).attr("entries"+type)) return 1 * sortingDirections[type];
                    if(+$(a).attr("entries"+type) == +$(b).attr("entries"+type)) return 0 * sortingDirections[type];
                });
                $(this).append(trs);
                trackData(userAuthProvider + " " + userAuthId, "sort", "phase"+type, defaultInquiry, {"sort_direction":sortingDirections[type]});

            });
            break;
    }
    ;
}

var _showAdminRating = false;
function adminRatingChanged(){
    if($("#adminRating").is(':checked'))
        _showAdminRating =true;
    else
        _showAdminRating = false;
    regenerate();

    correctSizes();
    trackData(userAuthProvider + " " + userAuthId, "filter", "adminRating", defaultInquiry, {"show_admin_rating_only":_showAdminRating});

}