var Deque = require("collections/deque")
var convexHull = require("quick-hull-2d")
var _visibility = require("vishull2d")
var intersect = require("segseg")
var explanations = require("./explanation")

//extend the deque to support peeking at the second item on either end
Deque.prototype.peek2 = function () {
    if (this.length < 2) {
        console.warn("Deque too small to peek2", this.toArray())
        return;
    }
    var index = (this.front + 1) & (this.capacity - 1);
    return this[index];
};

Deque.prototype.peekBack2 = function () {
    if (this.length < 2) {
        console.warn("Deque too small to peekBack2", this.toArray())
        return;
    }
    var index = (this.front + this.length - 2) & (this.capacity - 1);
    return this[index];
};

function visibility(pts, cen){
    // convert vertex chain to line segments
    var segments = [
        [[0,0], [0,height]],
        [[0,height], [width,height]],
        [[width,height], [width, 0]],
        [[width, 0], [0,0]] ]
    for (var i = 0; i < pts.length; ++i) {
        var j = i+1;
        if (j == pts.length) j = 0;
        segments.push([pts[i], pts[j]]);
    }
    return _visibility(segments, cen);
}

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
    if (k > 0 && h >= 0 && h <= height) return [0, h];

    // top wall
    var k = -y/dy;
    var w = x + dx*k;
    if (k > 0 && w >= 0 && w <= width) return [w, 0];

    // right wall
    var k = (width-x)/dx;
    var h = y + dy*k;
    if (k > 0 && h >= 0 && h <= height) return [width, h];

    // top wall
    var k = (height-y)/dy;
    var w = x + dx*k;
    if (k > 0 && w >= 0 && w <= width) return [w, height];

    console.warn("toBoundary found unsatisfactory result for", p0, p1);
    return p1;
}

// Given two points on boundary edges, return an array of points of the
// corners hit traveling clockwise
function corners(b0, b1){
    var top = 0, right = 1, bottom = 2, left = 3;

    sideOf = function(b){
        if (b[0]===0){
            return left;
        }else if (b[0]===width){
            return right;
        }else if (b[1]===0){
            return top;
        }else if (b[1]===height){
            return bottom;
        }else{
            console.warn("corners called with non-boundary point", b)
        }
    }

    var s0 = sideOf(b0), s1 = sideOf(b1);

    var cornerPoints = [[width,0], [width, height], [0,height], [0,0]];
    ret = []

    while (s0 != s1){
        ret.push(cornerPoints[s0])
        s0++;
        s0 %= 4;
    }

    return ret;
}

var line_gen = d3.svg.line();
function line(){
    return g_lines.select("#path_poly").datum(points).attr("d", line_gen)
}

function hullPoint(p){
    var g = g_points.append("g").attr("class", "hull-vertex").translate(p).datum(p);
    g.append("circle").attr("r", 10).style({fill: "white", stroke: "black"})
    if (p.s){ g.append("text").text(p.s).attr("dy", "4px").style("font-size", "14px"); }
    return g;
}

function interiorPoint(p){
    var g = g_points.append("g").attr("class", "interior-vertex").translate(p)
    g.append("circle").attr("r", 4).style({fill: "black", stroke: "none"})
    return g;
}

function hullToInterior(p){
    var point = g_points.selectAll(".hull-vertex")
        .filter(function(d){return d.s===p.s})
        .attr("class", "interior-vertex")
        .transition();
    point.select("circle")
        .attr("r", 4)
        .style({fill: "black", stroke: "none"})
    point.select("text")
        .attr("dy", "0px")
        .style("font-size", "0px")
        .remove();
    // TODO place the letter in the letter queue
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

var g_deque = svg_deque.append("g")
    .attr("transform", "translate("+((width - 60*4)/2)+",0)");

svg_deque.selectAll(".cover").data([0,0.5]).enter().append("rect")
    .attr({class: "cover", width: (width+margin.right)/2, height: margin.top})
    .attr("x", function(d){return d*(width+margin.right)});

var g_yellow = svg_polygon.append("g"),
    g_regions = svg_polygon.append("g"),
    g_lines  = svg_polygon.append("g"),
    g_points = svg_polygon.append("g");

g_lines.append("path").attr("id", "path_poly");
g_lines.append("path").attr("id", "path_hull");

// Sin Bin: Global state of the algorithm
var points = [];
var deque, lastOnHull, newPos;
var freeze = false;
var popping = false;
var state = 0;
var initalLeftTurn;

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
    lastOnHull = c;
    if (leftTurn(a,b,c)){
        deque = new Deque([b,a])
    }else{
        deque = new Deque([a,b])
    }
    renderDeque();
    svg_deque.selectAll(".cover").transition()
        .duration(1000)
        .attr("x", function(d,i){
            return i ? width+margin.right+10 : -(width+margin.right)/2 -10;
        })
        .remove();
}

function renderDeque(){
    var data = !popping ? [lastOnHull].concat(deque.toArray(), [lastOnHull]) : deque.toArray();
    console.log(data.map(function(d){return d.s}), lastOnHull.s);
    g_deque.transition().duration(750)
        .attr("transform", "translate("+((width - 60*data.length)/2)+",0)")
    var items = g_deque.selectAll(".deque-vertex")
        .data(data, function(d,i){
            if (d.s === lastOnHull.s){
                return d.s + (i ? 1 : 0);
            }
            return d.s;
        });
    var entering = items.enter().append("g").attr("class", "deque-vertex")
        .attr("transform", function(d,i){if (i<items.enter().size()/2){
            return "translate(-60,"+ (margin.top / 2 - 35)+")"
        }else{
            return "translate("+((i+1)*60)+","+(margin.top / 2 - 35)+")"
        }})
    entering.append("rect")
        .attr({width: "40px", height: "40px", rx: "8px", ry: "8px", x: "0px", y: "0px"})
    entering.append("text")
        .translate(20,20)
        .attr("dy", "5px")
    items.selectAll("text").text(function(d){ return d.s});
    items.order();
    var exiting = items.exit().transition().duration(1000).ease("cubic");
    exiting.select("rect").attr({width: 0, height: 0, x: "20px", y: "20px", rx: "0px", ry: "0px"});
    exiting.select("text").style("font-size", 0).attr("dy", "0px");
    exiting.remove();

    if (!popping){
    var lastIndex = items.size() - 1;
    items.transition()
        .attr("transform", function(d,i){return "translate(" + (i*60) + ","+ (margin.top / 2 - 35)+")"})
        .select("rect")
        .style("fill", function(d,i){
                        if (i == 0 || i == lastIndex) { return purple }
                        if (i == 1) { return red }
                        if (i == lastIndex-1) { return blue }
        });
    }
}

function pointC(){
    state++;
    var a = points[0], b = points[1], c = points[2];
    initialLeftTurn = leftTurn(a,b,c);
    text.html(explanations.pointC(initialLeftTurn));
    renderFills();
}

function renderFills(){
    svg_polygon.selectAll(".hull-vertex circle")
        .transition()
        //.duration(2000)
        .style("fill", function(d,i){
                        if (d.s === lastOnHull.s) { return purple; }
        })
        .transition()
        //.delay(3000)
        .style("fill", function(d){
                        if (d.s === lastOnHull.s) { return purple; }
                        if (d.s === deque.peek().s) { return red; }
                        if (d.s === deque.peekBack().s) { return blue; }
                        return "white";
        });

}

function rbpRegions(){
    state++;
    text.html(explanations.rbpRegions);
    renderRBPregions();
}

function renderRBPregions(){
    var transitionOutLen = 200;
    var transitionInLen = 300; // 1200?
    g_regions.selectAll("path.region").transition().duration(transitionOutLen)
        .style("fill", "white")
        .remove();
    var region = function(order, color, p1, p2, p3, p4){
        var b0 = toBoundary(p1, p2),
            b1 = toBoundary(p3, p4),
            outline = convexHull([b0, lastOnHull, b1].concat(corners(b0, b1)));
        g_regions.append("path")
            .datum(outline)
            .attr("d", line_gen)
            .attr("class", "region")
            .style("fill", "white")
          .transition()
            .duration(transitionInLen)
            .delay(order*transitionInLen + transitionOutLen)
            .style("fill", color)
    }
    var p_r = deque.peek();
    var p_b = deque.peekBack();
    var p_p = lastOnHull;
    region(0, blue,   p_p, p_b, p_r, p_p);
    region(1, red,    p_b, p_p, p_p, p_r);
    region(2, purple, p_r, p_p, p_b, p_p);
}

function yellowRegion(){
    state++;
    freeze = false;
    text.html(explanations.yellowRegion);
    renderYellowRegion();
}

function renderYellowRegion(){
    var transitionOutLen = 200;
    var transitionInLen = 300; // 1200?
    g_yellow.selectAll("path").transition().duration(transitionOutLen)
        .style("fill", "white")
        .remove();

    g_yellow.append("path")
        .datum(visibility(points, points[points.length-1]))
        .attr("d", line_gen)
        .style("fill", "white")
        .attr("class", "region")
      .transition()
        //.duration(1200)
        .style("fill", yellow)
}

function newPoint(pos){
    freeze = true;
    var red = rightTurn(deque.peek(), lastOnHull, pos);
    var blue = leftTurn(deque.peekBack(), lastOnHull, pos);
    console.log("red:", red, "blue:", blue)

    if (!red && !blue){
        interiorPoint(pos);
        points.push(pos);
        line();
        text.html(explanations.pointInYellow);
        renderYellowRegion();
        freeze = false;
    }else{
        hullPoint(pos);
        points.push(pos);
        line();
        text.html(explanations.pointInRed);
        deque.push(lastOnHull);
        deque.unshift(lastOnHull);
        popping = true
        state = 20;
        newPos = pos;
    }
}

function fixLeft(){
    if (rightTurn(deque.peek2(), deque.peek(), newPos)){
        var removed = deque.shift();
        console.log("shifting", removed);
        if (removed.s !== lastOnHull.s){
            hullToInterior(removed);
        }
        renderDeque();
    }else{
        state = 21;
        fixRight();
    }
}

function fixRight(){
    if (leftTurn(deque.peekBack2(), deque.peekBack(), newPos)){
        var removed = deque.pop();
        console.log("popping", removed);
        if (removed.s !== lastOnHull.s){
            hullToInterior(removed);
        }
        renderDeque();
    }else{
        lastOnHull = newPos;
        newPos = undefined;
        popping = false;
        renderDeque();
        renderFills();
        renderRBPregions();
        renderYellowRegion();
        freeze = false;
        state = 5;
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
    pos.s = alphabet[points.length];
    if (points.length >= 3) return newPoint(pos);
    hullPoint(pos);
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
            case 20:
                fixLeft();
            break;
            case 21:
                fixRight();
            break;
            default:
        }
    }
})
