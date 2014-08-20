/**
 * Created by svenc on 06/08/14.
 */
var phaseList = function(){


    var drawPhases = function(phases,identifier, div,filterClass)
    {
        phases.sort(function(a,b) 
            {
                if(a.key < b.key) return -1;
                if(a.key > b.key) return 1;
                return 0;
            }
            )
        var g = d3.select(div)
            .append("ul")
            .attr("id",identifier + "_root" );
        var spans = g.selectAll("li")
            .data(phases);
        spans.enter()
            .append("li")
            .attr("selected",false)
            .on("mousedown",function(d){
                if(this.attributes.selected.value == "false")
                {
                    filterClass.filter(d.key,"phase");
                    //filterClass.highlight(d.key,"user");
                    this.setAttribute("selected",true);
                    this.setAttribute("class","selected");
                }
                else{
                    filterClass.unfilter(d.key,"phase");
                    //filterClass.unhighlight(d.key,"user");
                    this.setAttribute("selected",false);
                    this.setAttribute("class","unselected");

                }


            })
            .attr("style","display:block;")
            .text(function(d){
                return "phase " + d.key
            })
            .append("span")
            .attr("style",function(d){
                var phase_colors = ["#33FF99","#33CCFF","#CCFF33","#FF0066","#CCFFFF","#FF66CC"];
                return "margin-left:10px;height:10px;width:" + d.value.count + "px;display:inline-block; background-color: " + phase_colors[d.key-1];
            })
           ;
    }
    var preprocess = function(data)
    {
        var xf = crossfilter(data);
        var dim = xf.dimension(function(f){return f.context.phase;});
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
            var phases = preprocess(data);
            drawPhases(phases,identifier,div,filterClass);
        }
    }
}();