/**
 * Created by svenc on 06/08/14.
 */
var userGraphs = function(){
    var drawnGraphs = {};
    var _data = undefined;
    var _div = undefined;
    var _filterClass = undefined;

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


            })
        graph.eventrelation_init(userData, name, "#userGraph_" + name);

        drawnGraphs[name] = graph;


    }

    return {
        "init" : function(data,div,filterClass)
        {
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

                }
            });
            users.forEach(function(u){
                if(Object.keys(drawnGraphs).indexOf(u) >= 0 && drawnGraphs[u] != undefined)
                {
                    return;
                }
                addGraph(u);
            });
        }

    }
}();/**
 * Created by svenc on 06/08/14.
 */
