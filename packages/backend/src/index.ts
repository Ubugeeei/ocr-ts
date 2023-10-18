import type { Position, TecackStroke, TecackDataset } from "@tecack/shared";
import { momentNormalize } from "./momentNormalize";
import { extractFeatures } from "./extractFeatures";

export { extractFeatures } from "./extractFeatures";
export { momentNormalize } from "./momentNormalize";

type EndPointDistance = (pattern1: TecackStroke, pattern2: TecackStroke) => number;
type InitialDistance = (pattern1: TecackStroke, pattern2: TecackStroke) => number;
type GetLargerAndSize = <T extends Array<any>>(pattern1: T, pattern2: T) => [T, T, number, number];
type WholeWholeDistance = (pattern1: TecackStroke, pattern2: TecackStroke) => number;
type InitStrokeMap = (
  pattern1: Array<TecackStroke>,
  pattern2: Array<TecackStroke>,
  distanceMetric: (a: TecackStroke, n: TecackStroke) => number,
) => Position;
type GetMap = (
  pattern1: Array<TecackStroke>,
  pattern2: Array<TecackStroke>,
  distanceMetric: (a: TecackStroke, n: TecackStroke) => number,
) => Position;
type CompleteMap = (
  pattern1: Array<TecackStroke>,
  pattern2: Array<TecackStroke>,
  distanceMetric: (a: TecackStroke, n: TecackStroke) => number,
  map: Array<number>,
) => Array<number>;
type ComputeDistance = (
  pattern1: Array<TecackStroke>,
  pattern2: Array<TecackStroke>,
  distanceMetric: (a: TecackStroke, n: TecackStroke) => number,
  map: Array<number>,
) => number;
type ComputeWholeDistanceWeighted = (
  pattern1: Array<TecackStroke>,
  pattern2: Array<TecackStroke>,
  map: Position,
) => number;
type CoarseClassification = (inputPattern: Array<TecackStroke>) => TecackStroke;
type FineClassification = (inputPattern: Array<TecackStroke>, inputCandidates: TecackStroke) => string[];

export function recognize(input: Readonly<Array<TecackStroke>>, dataset: Readonly<Array<TecackDataset>>): string[] {
  let dii: number;
  let j_of_i: number;
  let minDist: number;
  let min_j: number;

  const endPointDistance: EndPointDistance = (pattern1, pattern2) => {
    var dist = 0;
    var l1 = typeof pattern1 == "undefined" ? 0 : pattern1.length;
    var l2 = typeof pattern2 == "undefined" ? 0 : pattern2.length;
    if (l1 == 0 || l2 == 0) {
      return 0;
    } else {
      var x1y1 = pattern1[0];
      var x2y2 = pattern2[0];
      dist += Math.abs(x1y1[0] - x2y2[0]) + Math.abs(x1y1[1] - x2y2[1]);
      x1y1 = pattern1[l1 - 1];
      x2y2 = pattern2[l2 - 1];
      dist += Math.abs(x1y1[0] - x2y2[0]) + Math.abs(x1y1[1] - x2y2[1]);
    }
    return dist;
  };

  const initialDistance: InitialDistance = (pattern1, pattern2) => {
    var l1 = pattern1.length;
    var l2 = pattern2.length;
    var l_min = Math.min(l1, l2);
    var l_max = Math.max(l1, l2);
    var dist = 0;
    for (var i = 0; i < l_min; i++) {
      var x1y1 = pattern1[i];
      var x2y2 = pattern2[i];
      dist += Math.abs(x1y1[0] - x2y2[0]) + Math.abs(x1y1[1] - x2y2[1]);
    }
    return dist * (l_max / l_min);
  };

  // given to pattern, determine longer (more strokes)
  // and return quadruple with sorted patterns and their
  // stroke numbers [k1,k2,n,m] where n >= m and
  // they denote the #of strokes of k1 and k2
  const getLargerAndSize: GetLargerAndSize = (pattern1, pattern2) => {
    var l1 = typeof pattern1 == "undefined" ? 0 : pattern1.length;
    var l2 = typeof pattern2 == "undefined" ? 0 : pattern2.length;
    // definitions as in paper
    // i.e. n is larger
    var n = l1;
    var m = l2;
    var k1 = pattern1;
    var k2 = pattern2;
    if (l1 < l2) {
      m = l1;
      n = l2;
      k1 = pattern2;
      k2 = pattern1;
    }
    return [k1, k2, n, m];
  };

  const wholeWholeDistance: WholeWholeDistance = (pattern1, pattern2) => {
    // [k1, k2, n, m]
    // a[0], a[1], a[2], a[3]
    var a = getLargerAndSize(pattern1, pattern2);
    var dist = 0;
    for (var i = 0; i < a[3]; i++) {
      j_of_i = parseInt((parseInt((a[2] / a[3]) as any) * i) as any);
      var x1y1 = a[0][j_of_i];
      var x2y2 = a[1][i];
      dist += Math.abs(x1y1[0] - x2y2[0]) + Math.abs(x1y1[1] - x2y2[1]);
    }
    return parseInt((dist / a[3]) as any);
  };

  // initialize N-stroke map by greedy initialization
  const initStrokeMap: InitStrokeMap = (pattern1, pattern2, distanceMetric) => {
    // [k1, k2, n, m]
    // a[0], a[1], a[2], a[3]
    var a = getLargerAndSize(pattern1, pattern2);
    // larger is now k1 with length n
    var map = new Array() as Position;
    for (var i = 0; i < a[2]; i++) {
      map[i] = -1;
    }
    var free = new Array();
    for (var i = 0; i < a[2]; i++) {
      free[i] = true;
    }
    for (var i = 0; i < a[3]; i++) {
      minDist = 10000000;
      min_j = -1;
      for (var j = 0; j < a[2]; j++) {
        if (free[j] == true) {
          var d = distanceMetric(a[0][j], a[1][i]);
          if (d < minDist) {
            minDist = d;
            min_j = j;
          }
        }
      }
      free[min_j] = false;
      map[min_j] = i;
    }
    return map;
  };

  // get best N-stroke map by iterative improvement
  const getMap: GetMap = (pattern1, pattern2, distanceMetric) => {
    // [k1, k2, n, m]
    // a[0], a[1], a[2], a[3]
    var a = getLargerAndSize(pattern1, pattern2);
    // larger is now k1 with length n
    var L = 3;
    var map = initStrokeMap(a[0], a[1], distanceMetric);
    for (var l = 0; l < L; l++) {
      for (var i = 0; i < map.length; i++) {
        if (map[i] != -1) {
          dii = distanceMetric(a[0][i], a[1][map[i]]);
          for (var j = 0; j < map.length; j++) {
            // we need to check again, since
            // manipulation of map[i] can occur within
            // the j-loop
            if (map[i] != -1) {
              if (map[j] != -1) {
                var djj = distanceMetric(a[0][j], a[1][map[j]]);
                var dij = distanceMetric(a[0][j], a[1][map[i]]);
                var dji = distanceMetric(a[0][i], a[1][map[j]]);
                if (dji + dij < dii + djj) {
                  var map_j = map[j];
                  map[j] = map[i];
                  map[i] = map_j;
                  dii = dij;
                }
              } else {
                var dij = distanceMetric(a[0][j], a[1][map[i]]);
                if (dij < dii) {
                  map[j] = map[i];
                  map[i] = -1;
                  dii = dij;
                }
              }
            }
          }
        }
      }
    }
    return map;
  };

  // from optimal N-stroke map create M-N stroke map
  const completeMap: CompleteMap = (pattern1, pattern2, distanceMetric, map) => {
    // [k1, k2, _, _]
    // a[0], a[1], a[2], a[3]
    var a = getLargerAndSize(pattern1, pattern2);
    if (!map.includes(-1)) {
      return map;
    }
    // complete at the end
    var lastUnassigned = map[map.length];
    var mapLastTo = -1;
    for (var i = map.length - 1; i >= 0; i--) {
      if (map[i] == -1) {
        lastUnassigned = i;
      } else {
        mapLastTo = map[i];
        break;
      }
    }
    for (var i = lastUnassigned; i < map.length; i++) {
      map[i] = mapLastTo;
    }
    // complete at the beginning
    var firstUnassigned = -1;
    var mapFirstTo = -1;
    for (var i = 0; i < map.length; i++) {
      if (map[i] == -1) {
        firstUnassigned = i;
      } else {
        mapFirstTo = map[i];
        break;
      }
    }
    for (var i = 0; i <= firstUnassigned; i++) {
      map[i] = mapFirstTo;
    }
    // for the remaining unassigned, check
    // where to "split"
    for (var i = 0; i < map.length; i++) {
      if (i + 1 < map.length && map[i + 1] == -1) {
        // we have a situation like this:
        //   i       i+1   i+2   ...  i+n
        //   start   -1    ?     -1   stop
        var start = i;

        var stop = i + 1;
        while (stop < map.length && map[stop] == -1) {
          stop++;
        }

        var div = start;
        var max_dist = 1000000;
        for (var j = start; j < stop; j++) {
          var stroke_ab = a[0][start];
          // iteration of concat, possibly slow
          // due to memory allocations; optimize?!
          for (var temp = start + 1; temp <= j; temp++) {
            stroke_ab = stroke_ab.concat(a[0][temp]);
          }
          var stroke_bc = a[0][j + 1];

          for (var temp = j + 2; temp <= stop; temp++) {
            stroke_bc = stroke_bc.concat(a[0][temp]);
          }

          var d_ab = distanceMetric(stroke_ab, a[1][map[start]]);
          var d_bc = distanceMetric(stroke_bc, a[1][map[stop]]);
          if (d_ab + d_bc < max_dist) {
            div = j;
            max_dist = d_ab + d_bc;
          }
        }
        for (var j = start; j <= div; j++) {
          map[j] = map[start];
        }
        for (var j = div + 1; j < stop; j++) {
          map[j] = map[stop];
        }
      }
    }
    return map as [number, number];
  };

  // given two patterns, M-N stroke map and distanceMetric function,
  // compute overall distance between two patterns
  const computeDistance: ComputeDistance = (pattern1, pattern2, distanceMetric, map) => {
    // [k1, k2, n, m]
    // a[0], a[1], a[2], a[3]
    var a = getLargerAndSize(pattern1, pattern2);
    var dist = 0.0;
    var idx = 0;
    while (idx < a[2]) {
      var stroke_idx = a[1][map[idx]];
      var start = idx;
      var stop = start + 1;
      while (stop < map.length && map[stop] == map[idx]) {
        stop++;
      }
      var stroke_concat = a[0][start];
      for (var temp = start + 1; temp < stop; temp++) {
        stroke_concat = stroke_concat.concat(a[0][temp]);
      }
      dist += distanceMetric(stroke_idx, stroke_concat);
      idx = stop;
    }
    return dist;
  };

  // given two patterns, M-N stroke_map, compute weighted (respect stroke
  // length when there are concatenated strokes using the wholeWhole distance
  const computeWholeDistanceWeighted: ComputeWholeDistanceWeighted = (pattern1, pattern2, map) => {
    // [k1, k2, n, m]
    // a[0], a[1], a[2], a[3]
    var a = getLargerAndSize(pattern1, pattern2);
    var dist = 0.0;
    var idx = 0;
    while (idx < a[2]) {
      var stroke_idx = a[1][map[idx]];
      var start = idx;
      var stop = start + 1;
      while (stop < map.length && map[stop] == map[idx]) {
        stop++;
      }
      var stroke_concat = a[0][start];
      for (var temp = start + 1; temp < stop; temp++) {
        stroke_concat = stroke_concat.concat(a[0][temp]);
      }

      var dist_idx = wholeWholeDistance(stroke_idx, stroke_concat);
      if (stop > start + 1) {
        // concatenated stroke, adjust weight
        var mm = typeof stroke_idx == "undefined" ? 0 : stroke_idx.length;
        var nn = stroke_concat.length;
        if (nn < mm) {
          var temp = nn;
          nn = mm;
          mm = temp;
        }
        dist_idx = dist_idx * (nn / mm);
      }
      dist += dist_idx;
      idx = stop;
    }
    return dist;
  };

  // apply coarse classfication w.r.t. inputPattern
  // considering _all_ referencePatterns using endpoint distance
  const coarseClassification: CoarseClassification = inputPattern => {
    var inputLength = inputPattern.length;
    var candidates: TecackStroke = [];
    for (var i = 0; i < dataset.length; i++) {
      var iLength = dataset[i][1];
      if (inputLength < iLength + 2 && inputLength > iLength - 3) {
        var iPattern = dataset[i][2];
        var iMap = getMap(iPattern, inputPattern, endPointDistance);
        iMap = completeMap(iPattern, inputPattern, endPointDistance, iMap) as Position;
        var dist = computeDistance(iPattern, inputPattern, endPointDistance, iMap);
        var m = iLength;
        var n = iPattern.length;
        if (n < m) {
          var temp = n;
          n = m;
          m = temp;
        }
        candidates.push([i, dist * (m / n)]);
      }
    }
    candidates.sort(function (a, b) {
      return a[1] - b[1];
    });

    return candidates;
  };

  // fine classfication. returns best 100 matches for inputPattern
  // and candidate list (which should be provided by coarse classification
  const fineClassification: FineClassification = (inputPattern, inputCandidates) => {
    var inputLength = inputPattern.length;
    var candidates = [];
    for (var i = 0; i < Math.min(inputCandidates.length, 100); i++) {
      var j = inputCandidates[i][0];
      var iLength = dataset[j][1];
      var iPattern = dataset[j][2];
      if (inputLength < iLength + 2 && inputLength > iLength - 3) {
        var iMap = getMap(iPattern, inputPattern, initialDistance);

        iMap = completeMap(iPattern, inputPattern, wholeWholeDistance, iMap) as Position;
        if (dataset[j][0] == "委") {
          console.log("finished imap, fine:");
          console.log(iMap);
          console.log("weight:");
          console.log(computeDistance(iPattern, inputPattern, wholeWholeDistance, iMap));
          console.log("weight intended:");
          console.log(computeDistance(iPattern, inputPattern, wholeWholeDistance, [0, 1, 2, 3, 4, 7, 5, 6]));
        }
        var dist = computeWholeDistanceWeighted(iPattern, inputPattern, iMap);
        var n = inputLength;
        var m = iPattern.length;
        if (m > n) {
          m = n;
        }
        dist = dist / m;
        candidates.push([j, dist]);
      }
    }
    candidates.sort(function (a, b) {
      return a[1] - b[1];
    });
    const outputs: string[] = [];
    for (var i = 0; i < Math.min(candidates.length, 10); i++) {
      outputs.push(dataset[candidates[i][0]][0]);
    }

    return outputs;
  };

  const _recognize = () => {
    const mn = momentNormalize(input);
    const extractedFeatures = extractFeatures(mn, 20);

    let map = getMap(extractedFeatures, dataset[0][2], endPointDistance);
    map = completeMap(extractedFeatures, dataset[0][2], endPointDistance, map) as Position;

    const candidates = coarseClassification(extractedFeatures);
    return fineClassification(extractedFeatures, candidates);
  };

  return _recognize();
}
