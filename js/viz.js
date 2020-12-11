const margin = {top: 20, right: 20, bottom: 30, left: 50}, width = 400, height = 400;
const delayUnit = 1000
const eps = 1e-5
const scaleWidth = 50, scaleHeight = 50
const xScale = d3.scaleLinear().range([0, width]);
const yScale = d3.scaleLinear().range([height, 0]);

let svg = initSvg();
xScale.domain([0, scaleWidth]);
yScale.domain([0, scaleHeight]);

let vertexRadius = 3
let timeouts = []
let poly = []

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function initSvg() {
    return d3.select("#svgCanvas")
        .append("svg")
        .attr("xmlns", 'http://www.w3.org/2000/svg')
        .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
        .attr("id", "svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .on('mousedown', mousedown)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
}

function clearTimeouts() {
    timeouts.forEach(item => {
        clearTimeout(item)
    });
    timeouts = []
}

function resetPoints() {
    clearTimeouts();
    clear()
    poly = []
    document.getElementById('pointsForm').value = ""
}
window.onload = () => { resetPoints() }

function clear() {
    d3.select("svg").remove();

    svg = initSvg()

    // add the X Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

    // add the Y Axis
    svg.append("g")
        .call(d3.axisLeft(yScale));

}

function makePointPair(x, y) {
    return {"x": x, "y": y}
}

function pointToString(point) {
    return "(" + point.x + "," + point.y + ")"
}

function cross(a, b) {
    return a.x * b.y - a.y * b.x;
}

function dot(a, b) {
    return a.x * b.x + a.y * b.y;
}

function norm(p) {
    return p.x * p.x + p.y * p.y
}

function ccw(a, b, c) {
    var v1 = makePointPair(b.x - a.x, b.y - a.y);
    var v2 = makePointPair(c.x - a.x, c.y - a.y);
    if (cross(v1, v2) > eps) return +1;       // counter clockwise
    if (cross(v1, v2) < eps) return -1;       // clockwise
    if (dot(v1, v2) < eps) return +2;       // c--a--b on line
    if (norm(v1) < norm(v2)) return -2;       // a--b--c on line
    return 0;
}

function intersectSS(s, t) {
    return ccw(s[0], s[1], t[0]) * ccw(s[0], s[1], t[1]) <= 0 && ccw(t[0], t[1], s[0]) * ccw(t[0], t[1], s[1]) <= 0;
}

function mousedown() {
    let cx = (d3.event.pageX - document.getElementById("svg").getBoundingClientRect().x - margin.left)
    let cy = height - (d3.event.pageY - document.getElementById("svg").getBoundingClientRect().y - margin.top)
    console.log("cx = " + cx + ", cy = " + cy)
    if (cx < 0 || cy < 0) {
        return
    }
    cx /= width / scaleWidth;
    cy /= height / scaleHeight;
    cx = Math.floor(cx * 10) / 10.0
    cy = Math.floor(cy * 10) / 10.0
    const point = makePointPair(cx, cy)
    drawVertex(point);
    if (poly.length > 0) {
        drawLine(poly[poly.length - 1].x, poly[poly.length - 1].y, point.x, point.y)
    }
    let newPer = [poly[poly.length - 1], point]
    let flg = false
    for (let i = 0; i < poly.length - 2; i++) {
        let exPer = [poly[i], poly[i + 1]]
        if (intersectSS(exPer, newPer)) {
            flg = true
            break
        }
    }
    if (flg) {
        alert("There should be no self-intersections.")
        clear()
        redrawPerimeter()
    } else {
        document.getElementById('pointsForm').value += pointToString(point) + "\n"
        poly.push(point);
    }
}

function redrawPerimeter() {
    for (let i = 0; i < poly.length; i++) {
        drawVertex(poly[i])
        if (i + 1 < poly.length) {
            drawLine(poly[i].x, poly[i].y, poly[i + 1].x, poly[i + 1].y)
        }
    }
}

function abort() {
    clear()
    clearTimeouts()
    redrawPerimeter()
}

function areaColor(area) {
    if (area > 0) return "dodgerblue"
    return "red"
}

function areaOpacity(area) {
    if (area > 0) return "0.8"
    return "0.5"
}

function drawPolygon(fillColor, fillOpacity) {
    if (poly.length < 3) {
        alert("The number of points should be more than 2!")
        return false
    }
    clear()
    for (let i = 0; i < poly.length; i++) {
        drawVertex(poly[i])
    }
    let polys = [poly]
    svg.selectAll(".polygon")
        .append("g")
        .classed('polygon', true)
        .data(polys)
        .enter().append("polygon")
        .style("fill", fillColor)
        .style("opacity", fillOpacity)
        .style("stroke", "black")
        .attr("points", function (d) {
            return d.map(function (e) {
                return [xScale(e.x), yScale(e.y)].join(",");
            }).join(" ");
        });
    return true
}

function visualize() {
    clearTimeouts()
    if (!drawPolygon("transparent")) {
        return
    }
    var e = document.getElementById("shape-select")
    const vizByTriangle = (parseInt(e.value) == 0)
    for (var i = 0; i < poly.length; i++) {
        if (vizByTriangle) {
            // triangle
            let tri = []
            tri.push({"x": 0, "y": 0});
            tri.push({"x": poly[i].x, "y": poly[i].y});
            tri.push({"x": poly[(i + 1) % poly.length].x, "y": poly[(i + 1) % poly.length].y});
            drawTriangle(tri, delayUnit * i)
        } else {
            // trapezoid
            let tra = []
            tra.push({"x": poly[i].x, "y": 0});
            tra.push({"x": poly[(i + 1) % poly.length].x, "y": 0});
            tra.push({"x": poly[(i + 1) % poly.length].x, "y": poly[(i + 1) % poly.length].y});
            tra.push({"x": poly[i].x, "y": poly[i].y});
            drawTrapizoid(tra, delayUnit * i)
        }
    }
    timeouts.push(setTimeout(() => {
        drawPolygon(areaColor(1), areaOpacity(1))
    }, delayUnit * poly.length))
}

function drawTrapizoid(tra, delay) {
    let area = (tra[2].y + tra[3].y) * (tra[0].x - tra[1].x) / 2
    timeouts.push(setTimeout(() => {
        svg.append("polygon")
            .data([tra])
            .style("fill", areaColor(area))
            .style("opacity", areaOpacity(area))
            .attr("points", function (d) {
                return d.map(function (e) {
                    return [xScale(e.x), yScale(e.y)].join(",");
                }).join(" ");
            });
    }, delay))
}

function drawTriangle(tri, delay) {
    let x1 = tri[1].x - tri[0].x, y1 = tri[1].y - tri[0].y
    let x2 = tri[2].x - tri[0].x, y2 = tri[2].y - tri[0].y
    let area = (x1 * y2 - x2 * y1) / 2
    timeouts.push(setTimeout(() => {
        svg.append("polygon")
            .data([tri])
            .style("fill", areaColor(area))
            .style("opacity", areaOpacity(area))
            .attr("points", function (d) {
                return d.map(function (e) {
                    return [xScale(e.x), yScale(e.y)].join(",");
                }).join(" ");
            });
    }, delay))
}

function drawVertex(point) {
    svg.append("circle")
        .attr("r", vertexRadius)
        .attr("cx", xScale(point.x))
        .attr("cy", yScale(point.y))
}

function drawLine(x1, y1, x2, y2) {
    svg.append("g").append("line")
        .attr("x1", xScale(x1))
        .attr("y1", yScale(y1))
        .attr("x2", xScale(x2))
        .attr("y2", yScale(y2))
        .attr("stroke", "black");
}
