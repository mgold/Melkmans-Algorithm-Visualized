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

// http://stackoverflow.com/questions/9043805
function intersect(p0, p1, p2, p3) {
    var x1=p0[0], y1=p0[1], x2=p1[0], y2=p1[1],
        x3=p2[0], y3=p2[1], x4=p3[0], y4=p3[1];

    var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    if (isNaN(x)||isNaN(y)) {
        return false;
    } else {
        if (x1>=x2) {
            if (!(x2<=x&&x<=x1)) {return false;}
        } else {
            if (!(x1<=x&&x<=x2)) {return false;}
        }
        if (y1>=y2) {
            if (!(y2<=y&&y<=y1)) {return false;}
        } else {
            if (!(y1<=y&&y<=y2)) {return false;}
        }
        if (x3>=x4) {
            if (!(x4<=x&&x<=x3)) {return false;}
        } else {
            if (!(x3<=x&&x<=x4)) {return false;}
        }
        if (y3>=y4) {
            if (!(y4<=y&&y<=y3)) {return false;}
        } else {
            if (!(y3<=y&&y<=y4)) {return false;}
        }
    }
    return true;
}

function intersectsAny(p0, p1){
    var ret = false;
    g_lines.selectAll(".err").remove();
    for (var i = 0; i < points.length-2; i++){
        if (intersect(p0, p1, points[i], points[i+1])){
            ret = true
            console.log("gotcha")
            line(points[i], points[i+1])
                .attr("class", "err")
        }
    }
    return ret;
}

function line(p0, p1){
    return g_lines.append("line")
        .attr("x1", p0[0])
        .attr("y1", p0[1])
        .attr("x2", p1[0])
        .attr("y2", p1[1])
}

function point(p, letter){
    var g = g_points.append("g").attr("class", "node").translate(p)
    g.append("circle")
        .attr("r", 10)
    if (letter) g.append("text").text(letter).attr("dy", "4px")
}

var alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

d3.selection.prototype.translate = function(a, b) {
  return arguments.length == 1
      ? this.attr("transform", "translate(" + a + ")")
      : this.attr("transform", "translate(" + a + "," + b + ")")
};

var dims = {width: 500, height: 500};
var svg = d3.select("body").style("margin", 0).append("svg").attr(dims),
    g_lines = svg.append("g"),
    g_points = svg.append("g"),
    g_deque = svg.append("g").translate(20,20);

var points = [];
var polygonMade = false;

function finishedCircuit(){
    polygonMade = true;
    g_deque.append("polyline")
        .attr("points", "0,0 10,5 10,95 0,100");
    g_deque.append("polyline")
        .attr("points", "40,0 30,5 30,95 40,100");
}

svg.on("click", function(){
    var pos = d3.mouse(svg.node())
    if (points.length > 0){
        var prev = points[points.length-1]
        if (dist2(points[0], pos) < 400){ //complete circuit
            line(prev, points[0])
            finishedCircuit();
            return;
        }else if (intersectsAny(prev, pos)){
            return;
        }else{
            line(prev, pos);
        }
    }
    point(pos, alphabet[points.length])
    points.push(pos)

})
