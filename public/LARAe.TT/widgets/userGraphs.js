/**
 * Created by svenc on 06/08/14.
 */
var userGraphs = function(){
    var drawnGraphs = {};
    var _data = undefined;
    var addGraph = function(name)
    {
        var xf = crossfilter(_data);
        var byUser = xf.dimension(function(d){return d.username.toLowerCase()});
        byUser.filter(name);
        var userData=  byUser.top("Infinity");

        var graph = new eventRelation();
        graph.eventrelation_init(userData, name, _div);

        drawnGraphs[name] = graph;


    }

    return {
        "init" : function(data,div)
        {
            _data = data;
            _div = div;
        },
        "selectUsers" : function(users)
        {
            //get rid of the ones we don't need anymore
            Object.keys(drawnGraphs).forEach(function(g){
                if(users.indexOf(g) < 0)
                {
                    //graph.delete;
                    drawnGraphs.splice(users.indexOf(g),1);
                }
            });
            users.forEach(function(u){
                if(Object.keys(drawnGraphs).indexOf(u) >= 0)
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
