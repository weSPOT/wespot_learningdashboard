/**
 * Created by svenc on 06/08/14.
 */
var userList = function(){

    var _users;

    var drawUsers = function(data,identifier, div,filterClass)
    {
        var svg = d3.select(div)
            .append("svg")
            .attr("id",identifier + "_root" )
            .attr("width", 350)
            .attr("height", 600);
        var rootG = svg.append("g")
        .attr("id", identifier + "_root_g");
        var g = rootG.selectAll("g")
            .data(data)
            .enter()
            .append("g")
             
            ;
        //surrounding rect  
         g
            .append("rect")
            .attr("class","user_surrounding_rect")
            .attr("x", 0)
            .attr("y", function(d,i){return i * 40 -15;})
            .attr("width", 250)
            .attr("height" ,40)
            
            ;
            
        //button 1
        g
            .append("rect")
            .attr("class","user_rect_button1")
            .attr("x", 250)
            .attr("y", function(d,i){return i * 40 -15;})
            .attr("width", 35)
            .attr("height" ,40)
            
            .attr("selected",false)
            .on("touchstart",function(d){
                if(this.attributes.selected.value == "false")
                {
                    filterClass.highlight(d.key,"user");
                    //filterClass.highlight(d.key,"user");
                    this.setAttribute("selected",true);
                    this.setAttribute("class","selected");
                }
                else{
                    filterClass.unhighlight(d.key,"user");
                    //filterClass.unhighlight(d.key,"user");
                    this.setAttribute("selected",false);
                    this.setAttribute("class","unselected");

                }


            })
            .on("mousedown",function(d){
                if(this.attributes.selected.value == "false")
                {
                    //filterClass.select(d.key,"user");
                    filterClass.filter(d.key,"user");
                    this.setAttribute("selected",true);
                    this.setAttribute("class","selected");
                }
                else{
                    //filterClass.deselect(d.key,"user");
                    filterClass.unfilter(d.key,"user");
                    this.setAttribute("selected",false);
                    this.setAttribute("class","unselected");

                }
            });
         g
            .append("rect")
            .attr("class","user_rect_button2")
            .attr("x", 285)
            .attr("y", function(d,i){return i * 40 -15;})
            .attr("width", 35)
            .attr("height" ,40)
           
            .attr("selected",false)
            .on("touchstart",function(d){
               if(this.attributes.selected.value == "false")
                {
                    //filterClass.select(d.key,"user");
                    filterClass.highlight(d.key,"user");
                    this.setAttribute("selected",true);
                    this.setAttribute("class","selected");
                }
                else{
                    //filterClass.deselect(d.key,"user");
                    filterClass.unhighlight(d.key,"user");
                    this.setAttribute("selected",false);
                    this.setAttribute("class","unselected");

                }


            })
            .on("mousedown",function(d){
                if(this.attributes.selected.value == "false")
                {
                    //filterClass.select(d.key,"user");
                    filterClass.highlight(d.key,"user");
                    this.setAttribute("selected",true);
                    this.setAttribute("class","selected");
                }
                else{
                    //filterClass.deselect(d.key,"user");
                    filterClass.unhighlight(d.key,"user");
                    this.setAttribute("selected",false);
                    this.setAttribute("class","unselected");

                }
            });
        var spans = g
       
            .append("text")
            
            .attr("class","user_text")
           
            .attr("x", 10)
            .attr("y", function(d,i){return i * 40;})
            
            
            .text(function(d){
                var key = this.parentNode.__data__.key;
                if(_users[key] != undefined)
                    return _users[key].name;
                return key;
            });
            var phase_colors = ["#33FF99","#33CCFF","#CCFF33","#FF0066","#CCFFFF","#FF66CC"];
             var colors_dark = ["#197F4C","#19667F","#667F19", "#7F0033","#667F7F","#7F3366" ];
            for(var k = 1;k < 7;k++)
            {
                g.append("text")
                    .attr("x", function(d,i){return 10 + (k-1) * 40;})
                    .attr("y", function(d,i){return i * 40 + 20;})
                    .attr("fill",phase_colors[k-1])
                    .text(function(d){
                        if(this.parentNode.__data__.value.countByPhase[k] != undefined)
                        return this.parentNode.__data__.value.countByPhase[k];
                        else return 0;
                    })
                    ;
            } 

            var zoom = d3.behavior.zoom()
            .scaleExtent([1, 10])
            .on("zoom", ul_zoomed);

        
            g.call(zoom);



    }
    var preprocess = function(data)
    {
        var xf = crossfilter(data);
        var dim = xf.dimension(function(f){return f.username.toLowerCase();});
        return dim.group().reduce(
            function(p,v){
                if(p.countByPhase[v.context.phase] == undefined)
                    p.countByPhase[v.context.phase] = 0;
                p.countByPhase[v.context.phase]++;return p;

            },
            function(p,v){
                p.countByPhase[v.context.phase]--;return p;},
            function(){return {countByPhase:{}};}
        ).top(Infinity);
    }
    return {
        "init" : function(data,allUsers, identifier, div,filterClass)
        {
            _users = allUsers;
            var users = preprocess(data);
            drawUsers(users,identifier,div,filterClass);
        }
    }
}();

function ul_zoomed(d) {
  var g = d3.select("#users_root_g");
 
  
  g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}