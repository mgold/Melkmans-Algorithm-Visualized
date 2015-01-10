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
    var g = g_points.append("g").attr("class", "graph-vertex").translate(p)
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

var margin = {top: 120, right: 20, bottom: 20, left: 400},
    width = window.innerWidth - margin.left - margin.right,
    height = window.innerHeight - margin.top - margin.bottom;

var svg = d3.select("body").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

var g_polygon = svg.append("g").translate(margin.left, margin.top);
g_polygon.append("rect").attr({width: width, height: height, class: "bg"})
var g_region = g_polygon.append("g"),
    g_lines  = g_polygon.append("g"),
    g_points = g_polygon.append("g"),
    g_deque = svg.append("g").translate(margin.left, 20),
    g_text  = svg.append("g").translate(10, margin.top + 15);
g_deque.append("rect").attr({width: width, height: margin.top - 30, class: "bg"})

svg.append("text")
    .attr("id", "title")
    .translate(margin.left/2, margin.top/2 - 10)
    .text("Melkman's Algorithm")
svg.append("text")
    .attr("id", "subtitle")
    .translate(margin.left/2, margin.top/2 + 15)
    .text("Visualized by Max Goldstein")

var text_big = g_text.append("text")
                .attr("class", "body1")
                .text("Start by placing three points on the canvas.")

var points = [];
var deque;
var freeze = false;

function first3(){
    freeze = true;
    var a = points[0], b = points[1], c = points[2];
    if (leftTurn(a,b,c)){
        deque = new Deque("abc".split(""))
    }else{
        deque = new Deque("cba".split(""))
    }
    console.log(deque.toArray())
    var items = g_deque.selectAll("g")
        .data(deque.toArray())
        .enter()
        .append("g")
        .attr("transform", function(d,i){return "translate(" + (i*60) + ",0)"})
        .attr("class", "deque-vertex")
    items.append("rect").attr({width: "40px", height: "40px", rx: "8px", ry: "8px"})
    items.append("text")
        .translate(20,20)
        .attr("dy", "5px")
        .text(function(d){ return d})
}

g_polygon.on("click", function(){
    if (freeze) return;
    var pos = d3.mouse(g_polygon.node());
    if (points.length > 0){
        var prev = points[points.length-1]
        if (intersectsAny(prev, pos)){
            return;
        }
        line(prev, pos);
    }
    point(pos, alphabet[points.length]);
    points.push(pos);
    if (points.length === 3) first3();
})

d3.select("body").on("keydown", function(){
    if (d3.event.keyCode == 32) console.log("You pressed space!")})
