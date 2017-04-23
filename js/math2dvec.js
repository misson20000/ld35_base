let temp1 = {};

export let linesegIntersection = (lineAStart, lineADisplacement, lineBStart, lineBDisplacement, result) => {
  let p = lineAStart;
  let q = lineBStart;
  let r = lineADisplacement;
  let s = lineBDisplacement;

  // v * w = (VxWy-VyWx)
  // if we can find t and u such that
  //  p+tr = q+us
  // there is an intersection
  // cross both sides with s
  //  (p + tr) × s = (u + us) × s
  // since s × s = 0
  //  t(r × s) = (q - p) × s
  //  t = (q - p) × s / (r × s)
  //  u = (q - p) × r / (r × s)

  if(cross(r, s) == 0) {
    return false; //colinear or parallel
  }

  temp1.x = q.x - p.x;
  temp1.y = q.y - p.y;
  let t = cross(temp1, s) / cross(r, s);
  let u = cross(temp1, r) / cross(r, s);
  if(t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    result.x = p.x + t * r.x;
    result.y = p.y + t * r.y;
    return true;
  } else {
    return false;
  }
};

export let cross = (a, b) => {
  return (a.x*b.y) - (a.y*b.x);
};

// copy-pasted from stackoverflow <3
export let distancePointLineSeg = (x, y, x1, y1, x2, y2) => {
  var A = x - x1;
  var B = y - y1;
  var C = x2 - x1;
  var D = y2 - y1;
  
  var dot = A * C + B * D;
  var len_sq = C * C + D * D;
  var param = -1;
  if (len_sq != 0) //in case of 0 length line
      param = dot / len_sq;

  var xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  }
  else if (param > 1) {
    xx = x2;
    yy = y2;
  }
  else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  var dx = x - xx;
  var dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
};
