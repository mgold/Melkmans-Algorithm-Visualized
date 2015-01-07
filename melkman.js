var Deque = require("collections/deque")

function leftTurn(p0, p1, p2){
    var a = p1[0] - p0[0],
        b = p1[1] - p0[1],
        c = p2[0] - p1[0],
        d = p2[1] - p1[1];
    return a*d - b*c > 0.001;
}

function rightTurn(p0, p1, p2){
    var a = p1[0] - p0[0],
        b = p1[1] - p0[1],
        c = p2[0] - p1[0],
        d = p2[1] - p1[1];
    return a*d - b*c < -0.001;
}

function dist2(p0, p1){
    var dx = p1[0] - p0[0],
        dy = p1[1] - p0[1];
    return dx*dx + dy*dy;
}

function line(p0, p1){
    svg.append("line")
        .attr("x1", p0[0])
        .attr("y1", p0[1])
        .attr("x2", p1[0])
        .attr("y2", p1[1])
        .style({stroke: "black", "stroke-width": 2})
}

function circle(p){
    svg.append("circle")
        .attr("cx", p[0])
        .attr("cy", p[1])
        .attr("r", 3)
}

var dims = {width: 500, height: 500};
var svg = d3.select("body").style("margin", 0).append("svg").attr(dims);

var points = [];

svg.on("click", function(){
    var pos = d3.mouse(svg.node())
    if (points.length > 0){
        var prev = points[points.length-1]
        if (dist2(points[0], pos) < 25){ //complete circuit
            line(prev, points[0])
            console.log("completed circuit")
            return;
        }else{
            line(prev, pos);
        }
    }
    circle(pos)
    points.push(pos)

})

console.log(leftTurn([0,0], [1,0], [1,1]))
