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

var cluster = function(){


    this.cluster_preprocess = function(data)
    {
        var objectRange = crossfilter(data);
        var dimension = objectRange.dimension(function (f) {
            return f.object;
        });

        return dimension.group().reduce(
            function(p,v){
                p.children.push(v);
                var date = Date.parse(v.starttime);
                if(p.date == 0 || p.date > date) //look for the smallest date within this "thread" (we want to order events from first to last, so we need first even
                {
                    p.date = date;
                    p.event = v;
                }
                p.count++;return p;

            },
            function(p,v){
                p.count--;return p;},
            function(){return {event: undefined, count:0, children:[],date:0};}
        ).order(function(d){return -d.date;}).top(Infinity);
    }


    return {
        "init" : function(data, identifier)
        {
            var pdata = eventrelation_preprocess(data);
            var width = 960,
                height = 2200;

            var cluster = d3.layout.cluster()
                .size([height, width - 160]);

            var diagonal = d3.svg.diagonal()
                .projection(function(d) { return [d.y, d.x]; });

            var svg = d3.select("body").append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(40,0)");



            var nodes = cluster.nodes(pdata),
                links = cluster.links(nodes)

                ;


                var link = svg.selectAll(".link")
                    .data(links)
                    .enter().append("path")
                    .attr("class", "link")
                    .attr("d", diagonal);

                var node = svg.selectAll(".node")
                    .data(nodes)
                    .enter().append("g")
                    .attr("class", "node")
                    .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })

                node.append("circle")
                    .attr("r", 4.5);

                node.append("text")
                    .attr("dx", function(d) { return d.children ? -8 : 8; })
                    .attr("dy", 3)
                    .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
                    .text(function(d) { return d.name; });


            d3.select(self.frameElement).style("height", height + "px");

        }
    }
}();
