---
title: Visualizing Shoelace Formula!
editedDate: 2020/12/7
tags: computer-science, math
---

<style>
    .unselectable {
        -moz-user-select: -moz-none;
        -khtml-user-select: none;
        -webkit-user-select: none;
        -o-user-select: none;
        user-select: none;
    }
</style>
<script src="https://d3js.org/d3.v4.min.js"></script>
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
                  placeholder="Coordinates displayed here."></textarea>
    </form>
</div>
<div  id="svgCanvas" style="float:left; margin-left:20px; unselectable="on" class="unselectable">
<p><span style="background:dodgerblue;opacity:0.5;">blue</span> : <strong>+</strong>positive area, <span style="background:indianred;opacity:0.5;">red</span> : <strong>-</strong>negative area</p>
<div"></div>
</div>

