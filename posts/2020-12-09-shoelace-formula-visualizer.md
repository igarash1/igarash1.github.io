---
title: Visualizing Shoelace Formula, the formula for area of polygons
editedDate: 2020/12/7
tags: computer-science, math
---

I found some people are getting stuck with understanding the [Shoelace Formula](https://en.wikipedia.org/wiki/Shoelace_formula),
which is the area formula for polygons including irregular ones.

In this article, I would like to try to explain the formula intuitively using the visualizer I made.

To note first, we assume 

- we consider only polygons in 2D. 
- the edges of polygon are not self-intersecting.
- the number of vertices of polygon is $n$.
- the coordinates of the vertices are in counter-clockwise order and represented as $P_1(x_1, y_1)$, ..., $P_2(x_n, y_n), P_{n+1}(x_{n+1}, y_{n+1})$, where $x_{n+1} = x_{1}, y_{n+1} = y_{1}$ for simplicity.

then, we can calculate the area of polygon $S$ by the great Shoelace formula:
$$ S = \sum_{i = 1}^{n} \frac{1}{2}(x_{i} y_{i + 1} - x_{i + 1} y_{i}) $$
The most difficult part of understanding this is the fact that the term inside the sigma can be negative,
which enables us to calculate areas of irregular polygons.
As [the Wikipedia](https://en.wikipedia.org/wiki/Shoelace_formula#Examples) explains it well, 
you can interpret the term as the *signed * area of triangle $\bigtriangleup OP_{i}P_{i+1}$.
By the way, you can understand the formula in another way - to interpret it as the sum of trapezoids.
Let me explain this a little. 
<div class="proposition">
The above equation (Shorlace Formula) can be transformed into the sum of trapezoids as below:
$$
S = \sum_{i = 1}^{n} \frac{1}{2}(x_{i} - x_{i + 1})(y_{i} + y_{i + 1})
$$
</div>
<em>Proof.</em>
$$
\begin{align}&{} \sum_{k = 1}^{N} \frac {1}{2} (y_k+y_{k+1})(x_k - x_{k+1}) \\
&=\frac {1}{2} \sum_{k = 1}^{N} (x_ky_{k+1}- x_{k+1}y_k + x_ky_k - x_{k+1}y_{k+1}) \\
&=\frac {1}{2} \sum_{k = 1}^{N} (x_ky_{k+1}- x_{k+1}y_k) + \frac{1}{2}\sum_{k = 1}^{N}( x_ky_k - x_{k+1}y_{k+1}) \\
&=\frac {1}{2} \sum_{k = 1}^{N} (x_ky_{k+1}- x_{k+1}y_k)
\end{align}
$$
*The term inside the sigma corresponds to a signed area of trapezoid consisting of
  $(x_i, 0)$, $(x_{i+1}, 0)$, $P_{i+1}$, $P_i$*

![](../images/bytrapezoid.png#center)

I assume you know [the area formula for trapezoids](https://en.wikipedia.org/wiki/Trapezoid#Area) :)
Also, we can see the formula also works correctly with negative coordinates.

Anyway, I made the visualizer with JS to help you understand the area calculation, so please try this. 
I hope this may help you understand the formula more intuitively.

### Source

You can check my JS source and an example html on [Gist](https://gist.github.com/igarash1/83f7343026fa4b23fe5abe06ec5cc8ac) or [JSFiddle](https://jsfiddle.net/igarash1/8j56kcy7/10/).

### Usage
Choose the vertices of polygon and click `Visualize!`.
You can understand the area calculation in 2 ways as I explained - in the triangle way and the trapezoid way.
Select `Triangle` or `Trapezoid` from the pull-down menu.
Also, the coordinates of vertices will be shown in the left side area.

<em><span style="background:dodgerblue;opacity:0.5;">blue</span> : <strong>+</strong>positive area, <span style="background:indianred;opacity:0.5;">red</span> : <strong>-</strong>negative area</em>
<br>
<em><strong>The points of polygon should be in counter-clockwise order.</strong></em>

<style>
    .unselectable {
        -moz-user-select: -moz-none;
        -khtml-user-select: none;
        -webkit-user-select: none;
        -o-user-select: none;
        user-select: none;
    }
</style>
<script src="https://d3js.org/d3.v6.min.js"></script>
<script src="../js/viz.js"></script>
<div style="float:left"> <input type="button" value="Reset" onclick="resetPoints()"/>
    <br>
    <select id="shape-select" >
        <option value="0" selected="selected">Triangle</option>
        <option value="1">Trapezoid</option>
    </select> <br>
    <input type="button" value="Visualize!" onclick="visualize()"/><br>
    <input type="button" value="Abort" onclick="abort()"/><br>
    <form name="pointsForm" >
        <p>Points:</p>
        <textarea id="pointsForm"
                  name="points"
                  value="1"
                  cols="10"
                  rows=20
                  placeholder="Coordinates displayed here." readonly></textarea>
    </form>
</div>

<div id="svgCanvas" style="float:left; margin-left:20px; unselectable="on" class="unselectable">
</div>
