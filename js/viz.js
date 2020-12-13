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

function initSvg() {
    return d3.select("#svgCanvas")
        .append("svg")
        .attr("xmlns", 'http://www.w3.org/2000/svg')
        .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
        .attr("id", "svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .on("click", (e, d) => mousedown(e))
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

// gridlines in x axis function
function make_x_gridlines() {
    return d3.axisBottom(xScale).ticks(10)
}

// gridlines in y axis function
function make_y_gridlines() {
    return d3.axisLeft(yScale).ticks(10)
}

function clear() {
    d3.selectAll("#svgCanvas").selectAll("svg").remove();

    svg = initSvg()

    // add the horizontal gridlines
    svg.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + height + ")")
        .call(make_x_gridlines().tickSize(-height).tickFormat(""))

    // add the vertical gridlines
    svg.append("g")
        .attr("class", "grid")
        .call(make_y_gridlines().tickSize(-width).tickFormat(""))

    // add the x-axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

    // add the y-axis
    svg.append("g")
        .call(d3.axisLeft(yScale));

}

function makePointPair(x, y) {
    return {"x": parseFloat(x), "y": parseFloat(y)}
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
    const v1 = makePointPair(b.x - a.x, b.y - a.y);
    const v2 = makePointPair(c.x - a.x, c.y - a.y);
    if (cross(v1, v2) > eps) return +1;       // counter clockwise
    if (cross(v1, v2) < eps) return -1;       // clockwise
    if (dot(v1, v2) < eps) return +2;       // c--a--b on line
    if (norm(v1) < norm(v2)) return -2;       // a--b--c on line
    return 0;
}

function intersectSS(s, t) {
    return ccw(s[0], s[1], t[0]) * ccw(s[0], s[1], t[1]) <= 0 && ccw(t[0], t[1], s[0]) * ccw(t[0], t[1], s[1]) <= 0;
}

function samePoint(p1, p2) {
    return Math.abs(p1.x - p2.x) < eps && Math.abs(p1.y - p2.y) < eps
}

function intersectionExist(edge) {
    if(poly.length < 2) return false
    for (let i = 0; i < poly.length; i++) {
        let p1 = poly[i], p2 = poly[(i + 1) % poly.length]
        if (samePoint(p1, edge[0]) || samePoint(p1, edge[1]) ||
            samePoint(p2, edge[0]) || samePoint(p2, edge[1])
        ) {
            continue
        }
        if (intersectSS([p1, p2], edge)) {
            return true
        }
    }
    return false
}


function mousedown(e, t) {
    let cx = (d3.pointer(e)[0]  - margin.left)
    let cy = height - (d3.pointer(e)[1] - margin.top)

    // validation
    if (cx < 0 || cy < 0 || cx > width || cy > height) {
        return
    }

    cx = (cx / (width / scaleWidth)).toFixed(1);
    cy = (cy / (height / scaleHeight)).toFixed(1);

    const point = makePointPair(cx, cy)
    drawVertex(point);
    if (poly.length > 0) {
        drawLine(poly[poly.length - 1], point)
    }
    if (intersectionExist([poly[poly.length - 1], point])) {
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
            drawLine(poly[i], poly[i + 1])
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
    const numOfvertices = poly.length
    if (numOfvertices < 3) {
        alert("The number of points should be more than 2.")
        return false
    }
    if (intersectionExist([poly[numOfvertices - 1], poly[0]])) {
        alert("The last edge is intersected with other edges.")
        return false
    }
    clear()
    for (let i = 0; i < numOfvertices; i++) {
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
    const e = document.getElementById("shape-select");
    const vizByTriangle = (parseInt(e.value) === 0)
    const numOfVertices = poly.length
    for (let i = 0; i < numOfVertices; i++) {
        if (vizByTriangle) {
            // triangle
            let tri = []
            tri.push({"x": 0, "y": 0});
            tri.push({"x": poly[i].x, "y": poly[i].y});
            tri.push({"x": poly[(i + 1) % numOfVertices].x, "y": poly[(i + 1) % numOfVertices].y});
            drawTriangle(tri, delayUnit * i)
        } else {
            // trapezoid
            let tra = []
            tra.push(makePointPair(poly[i].x,  0));
            tra.push(makePointPair(poly[(i + 1) % numOfVertices].x, 0));
            tra.push(makePointPair(poly[(i + 1) % numOfVertices].x, poly[(i + 1) % numOfVertices].y));
            tra.push(makePointPair(poly[i].x, poly[i].y));
            drawTrapezoid(tra, delayUnit * i)
        }
    }
    timeouts.push(setTimeout(() => {
        drawPolygon(areaColor(1), areaOpacity(1))
    }, delayUnit * poly.length))
}

function appendPolygon(polygon, area) {
    svg.append("polygon")
        .data([polygon])
        .style("fill", areaColor(area))
        .style("opacity", areaOpacity(area))
        .attr("points", function (d) {
            return d.map(function (e) {
                return [xScale(e.x), yScale(e.y)].join(",");
            }).join(" ");
        });
}

function drawTrapezoid(tra, delay) {
    const area = (tra[2].y + tra[3].y) * (tra[0].x - tra[1].x) / 2
    timeouts.push(setTimeout( () => { appendPolygon(tra, area) }, delay))
}

function drawTriangle(tri, delay) {
    const x1 = tri[1].x - tri[0].x, y1 = tri[1].y - tri[0].y
    const x2 = tri[2].x - tri[0].x, y2 = tri[2].y - tri[0].y
    const area = (x1 * y2 - x2 * y1) / 2
    timeouts.push(setTimeout( () => { appendPolygon(tri, area) }, delay))
}

function drawVertex(point) {
    svg.append("circle")
        .attr("r", vertexRadius)
        .attr("cx", xScale(point.x))
        .attr("cy", yScale(point.y))
}

function drawLine(p1, p2) {
    svg.append("g").append("line")
        .attr("x1", xScale(p1.x))
        .attr("y1", yScale(p1.y))
        .attr("x2", xScale(p2.x))
        .attr("y2", yScale(p2.y))
        .attr("stroke", "black");
}
