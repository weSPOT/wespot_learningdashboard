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
/**
 * Created by svenc on 06/08/14.
 */
var userGraphs = function(){
    var drawnGraphs = {};
    var _data = undefined;
    var _div = undefined;
    var _filterClass = undefined;
    var _users = undefined;

    var addGraph = function(name)
    {
        var xf = crossfilter(_data);
        var byUser = xf.dimension(function(d){return d.username.toLowerCase()});
        byUser.filter(name);
        var userData=  byUser.top("Infinity");

        var graph = new eventRelation();
        var div = d3.select(_div).append("div")
            .attr("id","userGraph_" + name)
            .attr("selected","false")
            .on("mousedown",function(d){
                if(this.attributes.selected.value == "false")
                {
                    _filterClass.highlight(name,"user");

                    this.setAttribute("selected",true);
                    this.setAttribute("class","selected");
                }
                else{
                    _filterClass.unhighlight(name,"user");

                    this.setAttribute("selected",false);
                    this.setAttribute("class","unselected");

                }


            });
        div.append("h2")
            .text(function(d){
                if(_users[name] != undefined)
                    return _users[name].name;
                return name;
        });
        graph.eventrelation_init(userData, name, "#userGraph_" + name);

        drawnGraphs[name] = graph;


    }

    return {
        "init" : function(data,users,div,filterClass)
        {
            _users = users;
            _data = data;
            _div = div;
            _filterClass = filterClass;
        },
        "selectUsers" : function(users)
        {
            //get rid of the ones we don't need anymore
            Object.keys(drawnGraphs).forEach(function(g){
                if(users.indexOf(g) < 0)
                {
                    if(drawnGraphs[g] == undefined) return;
                    drawnGraphs[g].delete();
                    drawnGraphs[g] = undefined;
                    d3.select("#userGraph_"+g).remove();

                }
            });
            users.forEach(function(u){
                if(Object.keys(drawnGraphs).indexOf(u) >= 0 && drawnGraphs[u] != undefined)
                {
                    return;
                }
                addGraph(u);
            });
        },
        "dataUpdated" : function(data)
        {
            _data = data;
            Object.keys(drawnGraphs).forEach(function(g){
                if(drawnGraphs[g] == undefined) return;
                var xf = crossfilter(_data);
                var byUser = xf.dimension(function(d){return d.username.toLowerCase()});
                byUser.filter(g);
                var userData=  byUser.top("Infinity");
                drawnGraphs[g].dataUpdated(userData);
            });
        }

    }
}();/**
 * Created by svenc on 06/08/14.
 */
