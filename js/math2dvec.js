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
