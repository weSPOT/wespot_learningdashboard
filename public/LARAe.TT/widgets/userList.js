/**
 * Created by svenc on 06/08/14.
 */
var userList = function(){

    var drawUsers = function(data,identifier, div,filterClass)
    {
        var g = d3.select(div)
            .append("ul")
            .attr("id",identifier + "_root" );
        var spans = g.selectAll("span")
            .data(data);
        spans.enter()
            .append("li")
            .attr("selected",false)
            .on("mousedown",function(d){
                if(this.attributes.selected.value == "false")
                {
                    filterClass.select(d.key,"user");
                    this.setAttribute("selected",true);
                    this.setAttribute("class","selected");
                }
                else{
                    filterClass.select(d.key,"user");
                    this.setAttribute("selected",false);
                    this.setAttribute("class","unselected");

                }


            })
            .text(function(d){return d.key;});
    }
    var preprocess = function(data)
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
    return {
        "init" : function(data, identifier, div,filterClass)
        {
            var users = preprocess(data);
            drawUsers(users,identifier,div,filterClass);
        }
    }
}();