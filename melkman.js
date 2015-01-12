var Deque = require("collections/deque")
var explanations = require("./explanation")

function leftTurn(p0, p1, p2){
    var a = p1[0] - p0[0],
        b = p1[1] - p0[1],
        c = p2[0] - p1[0],
        d = p2[1] - p1[1];
    return a*d - b*c < -0.001;
}

function rightTurn(p0, p1, p2){
    var a = p1[0] - p0[0],
        b = p1[1] - p0[1],
        c = p2[0] - p1[0],
        d = p2[1] - p1[1];
    return a*d - b*c > 0.001;
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
            var p0 = points[i], p1 = points[i+1];
            g_lines.append("line")
                .attr("x1", p0[0])
                .attr("y1", p0[1])
                .attr("x2", p1[0])
                .attr("y2", p1[1])
                .attr("class", "err")
        }
    }
    return ret;
}

// Proceeding from p0 to p1, what point on the canvas boundary do you hit?
function toBoundary(p0, p1){
    var x = p1[0], y = p1[1],
        dx = x - p0[0],
        dy = y - p0[1];
    if (x===0 || y===0) return p1;

    // left wall
    var k = -x/dx;
    var h = y + dy*k;
    if (k > 0 && h >= 0) return [0, h];

    // top wall
    var k = -y/dy;
    var w = x + dx*k;
    if (k > 0 && w >= 0) return [w, 0];

    // right wall
    var k = (width-x)/dx;
    var h = y + dy*k;
    if (k > 0 && h <= height) return [width, h];

    // top wall
    var k = (height-y)/dy;
    var w = x + dx*k;
    if (k > 0 && w <= width) return [w, height];

    console.warn("toBoundary found unsatisfactory result for", p0, p1);
    return p1;
}

// Given two points on adjacent boundary edges, find the corner where the edges meet
// TODO return an array of points to accomodate b0 = top b1 = bottom
function corner(b0, b1){
    // And this is _after_ refactoring...
    var top = 0, right = 1, bottom = 2, left = 3;
    var s0, s1;

    if (b0[0]===0){
        s0 = left;
    }else if (b0[0]===width){
        s0 = right;
    }else if (b0[1]===0){
        s0 = top;
    }else if (b0[1]===height){
        s0 = bottom;
    }
    if (b1[0]===0){
        s1 = left;
    }else if (b1[0]===width){
        s1 = right;
    }else if (b1[1]===0){
        s1 = top;
    }else if (b1[1]===height){
        s1 = bottom;
    }
    console.log(s0, s1)


    var s2 = Math.min(s0, s1),
        s3 = Math.max(s0, s1)

    if (s2===top && s3==right){
        return [width, 0]
    }else if (s2==right && s3===bottom){
        return [width, height]
    }else if (s2==bottom && s3===left){
        return [0, height]
    }else if (s2==top && s3===left){
        return [0, 0]
    }

    console.warn("toBoundary found unsatisfactory result for", b0, b1);
    return [0,0]
}

var line_gen = d3.svg.line();
function line(){
    return g_lines.select("#path_poly").datum(points).attr("d", line_gen)
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

var red = "#FF7777", blue = "#7777FF", purple = "#DA54FF", yellow = "#FFFF84";

var margin = {top: 120, right: 20, bottom: 20, left: 400},
    width = window.innerWidth - margin.left - margin.right,
    height = window.innerHeight - margin.top - margin.bottom;

console.log("width", width, "height", height);

var svg_deque = d3.select("#deque")
            .attr("width", width + margin.right)
            .attr("height", margin.top - 10)

var svg_polygon = d3.select("#polygon")
            .attr("width", width + margin.right)
            .attr("height", height + margin.bottom)

d3.selectAll("svg").append("rect")
    .attr({width: width-2, x: 1, y: 1, class: "bg"})
    .attr("height", function(d,i){return i ? height : margin.top - 30})

var g_deque = svg_deque.append("g");
svg_deque.selectAll(".cover").data([0,0.5]).enter().append("rect")
    .attr({class: "cover", width: (width+margin.right)/2, height: margin.top})
    .attr("x", function(d){return d*(width+margin.right)});

var g_regions = svg_polygon.append("g"),
    g_lines  = svg_polygon.append("g"),
    g_points = svg_polygon.append("g");

g_lines.append("path").attr("id", "path_poly");
g_lines.append("path").attr("id", "path_hull");

var points = [];
var deque;
var freeze = false;
var state = 0;

var text = d3.select("#text");

function first3(){
    freeze = true;
    state = 1;
    text.html(explanations.okayStop)
    var a = points[0], b = points[1], c = points[2];
}

function revealDeque(){
    state++;
    text.html(explanations.dequeIntro);
    var a = points[0], b = points[1], c = points[2];
    if (leftTurn(a,b,c)){
        deque = new Deque("cbac".split(""))
    }else{
        deque = new Deque("cabc".split(""))
    }
    var items = g_deque.selectAll(".deque-vertex")
        .data(deque.toArray())
        .enter()
        .append("g")
        .attr("transform", function(d,i){return "translate(" + (i*60) + ","+ (margin.top / 2 - 25)+")"})
        .attr("class", "deque-vertex");
    items.append("rect")
        .attr({width: "40px", height: "40px", rx: "8px", ry: "8px"})
    items.append("text")
        .translate(20,20)
        .attr("dy", "5px")
        .text(function(d){ return d});
    svg_deque.selectAll(".cover").transition()
        .duration(1000)
        .attr("x", function(d,i){
            return i ? width+margin.right+10 : -(width+margin.right)/2 -10;
        })
        .remove();
}

function pointC(){
    state++;
    var a = points[0], b = points[1], c = points[2];
    var wasLeftTurn = leftTurn(a,b,c);
    text.html(explanations.pointC(wasLeftTurn));
    svg_polygon.selectAll(".graph-vertex circle")
        .transition()
        .duration(2000)
        .style("fill", function(d,i){
                        if (i == 2) { return purple; }
        })
        .transition()
        .delay(3000)
        .style("fill", function(d,i){
                        if (i == 2) { return purple; }
                        return (wasLeftTurn ^ i) ? blue : red;
        });

    svg_deque.selectAll(".deque-vertex rect")
        .transition()
        .duration(2000)
        .style("fill", function(d,i){
                        if (i == 0 || i == 3) { return purple }
        })
        .transition()
        .delay(3000)
        .style("fill", function(d,i){
                        if (i == 0 || i == 3) { return purple }
                        if (i == 1) { return red }
                        if (i == 2) { return blue }
        });

}

function yellowRegion(){
    state++;
    text.html(explanations.yellowRegion);
    g_regions.append("path")
        .datum(points)
        .attr("d", line_gen)
        .style("fill", yellow)
}

function rbpRegions(){
    state++;
    text.html(explanations.rbpRegions);
    var a = points[0], b = points[1], c = points[2];
    var wasLeftTurn = leftTurn(a,b,c);
    if (wasLeftTurn){
        console.log("It was a left turn")
        var b0 = toBoundary(points[2], points[0]),
            b1 = toBoundary(points[1], points[2]),
            outline = [b0, points[2], b1, corner(b0, b1)];
        console.log(outline)
        g_regions.append("path")
            .datum(outline)
            .attr("d", line_gen)
            .style("fill",blue)
            .style("stroke", "none")

            b0 = toBoundary(points[2], points[1]),
            b1 = toBoundary(points[0], points[2]),
            outline = [b0, points[2], b1, corner(b0, b1)]
        console.log(outline)
        g_regions.append("path")
            .datum(outline)
            .attr("d", line_gen)
            .style("fill", red)
            .style("stroke", "none")

            b0 = toBoundary(points[1], points[2]),
            b1 = toBoundary(points[0], points[2]),
            outline = [b0, points[2], b1]
        console.log(outline)
        g_regions.append("path")
            .datum(outline)
            .attr("d", line_gen)
            .style("fill", purple)
            .style("stroke", "none")
    }
}

svg_polygon.on("click", function(){
    if (freeze) return;
    var pos = d3.mouse(svg_polygon.node());
    if (points.length > 0){
        var prev = points[points.length-1]
        if (intersectsAny(prev, pos)){
            return;
        }
    }
    point(pos, alphabet[points.length]);
    points.push(pos);
    line();
    if (points.length === 3) first3();
})

d3.select("body").on("keydown", function(){
    if (d3.event.keyCode == 32){
        switch (state){
            case 1:
                revealDeque();
            break;
            case 2:
                pointC();
            break;
            case 3:
                rbpRegions();
            break;
            case 4:
                yellowRegion();
            break;
            default:
        }
    }
})
