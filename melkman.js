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

// Do the lines p0p1 and p2p3 intersect?
function intersect(p0, p1, p2, p3){
    var r0_x_min = Math.min(p0[0], p1[0]),
        r0_x_max = Math.max(p0[0], p1[0]),
        r1_x_min = Math.min(p2[0], p3[0]),
        r1_x_max = Math.max(p2[0], p3[0]),
        r0_y_min = Math.min(p0[1], p1[1]),
        r0_y_max = Math.max(p0[1], p1[1]),
        r1_y_min = Math.min(p2[1], p3[1]),
        r1_y_max = Math.max(p2[1], p3[1]),
        bb_not_intersect = (r0_x_max < r1_x_min || r0_x_min > r1_x_max) &&
                       (r0_y_max < r1_y_min || r0_y_min > r1_y_max)

    if (bb_not_intersect) return false;

    var dir0 = leftTurn(p2, p0, p1),
        dir1 = leftTurn(p3, p0, p1)

    return dir0 != dir1;
}

function intersectsAny(p0, p1){
    var ret = false;
    d3.selectAll(".err").remove();
    for (var i = 0; i < points.length-2; i++){
        if (intersect(p0, p1, points[i], points[i+1])){
            ret = true
            console.log("gotcha")
            line(points[i], points[i+1])
                .style("stroke", "red")
                .attr("class", "err")
        }
    }
    return ret;
}

function line(p0, p1){
    return svg.append("line")
        .attr("x1", p0[0])
        .attr("y1", p0[1])
        .attr("x2", p1[0])
        .attr("y2", p1[1])
        .style({stroke: "black", "stroke-width": 2})
}

function circle(p){
    return svg.append("circle")
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
        if (intersectsAny(prev, pos)){ return;}
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
