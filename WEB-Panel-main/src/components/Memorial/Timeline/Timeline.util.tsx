import { SIDE_OFFSET, VIEWBOX_WIDTH, X_POSITIONS } from './Timeline.config';

export interface CurvePoint {
  x: number;
  y: number;
}
export interface CurvePositions {
  start: CurvePoint;
  control: CurvePoint;
  end: CurvePoint;
}
// Function to solve quadratic Bézier for y given x
const solveQuadraticBezier = (targetX: number, curve: CurvePositions) => {
  const { start, control, end } = curve;
  // Quadratic Bézier formula: P(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
  // For x: x(t) = (1-t)²x₀ + 2(1-t)tx₁ + t²x₂
  // Rearranging: at² + bt + c = 0, where we solve for x(t) = targetX

  const a = start.x - 2 * control.x + end.x;
  const b = 2 * (control.x - start.x);
  const c = start.x - targetX;

  // Solve quadratic equation
  const discriminant = b * b - 4 * a * c;

  const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
  const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);

  // Calculate y using the t parameter
  const y1 = (1 - t1) * (1 - t1) * start.y + 2 * (1 - t1) * t1 * control.y + t1 * t1 * end.y;
  const y2 = (1 - t2) * (1 - t2) * start.y + 2 * (1 - t2) * t2 * control.y + t2 * t2 * end.y;
  return { y1, y2 };
};

export const createYPositions = (path: string) => {
  const positions: CurvePoint[] = [];
  const start = path.indexOf('M') + 1;
  const end = path.indexOf('Q');

  let [startX, startY] = path
    .slice(start, end)
    .split(' ')
    .map((item) => parseFloat(item));

  const curveSegments = path
    .slice(end + 1)
    .trim()
    .split('Q')
    .map((segment) => segment.slice());
  for (let i = 0; i < curveSegments.length; i++) {
    const normalizedXIndex = (i * 2) % X_POSITIONS.length;
    const normalizedNextXIndex = (i * 2 + 1) % X_POSITIONS.length;
    const segment = curveSegments[i];
    const [controlX, controlY, endX, endY] = segment.split(' ').map((item) => parseFloat(item));
    const curve = {
      start: { x: startX, y: startY },
      control: { x: controlX, y: controlY },
      end: { x: endX, y: endY },
    };
    startX = endX;
    startY = endY;
    const { y1, y2 } = solveQuadraticBezier(X_POSITIONS[normalizedXIndex], curve);

    positions.push({ x: X_POSITIONS[normalizedXIndex], y: i % 2 === 0 ? y1 : y2 });
    positions.push({ x: X_POSITIONS[normalizedNextXIndex], y: i % 2 === 0 ? y2 : y1 });
  }
  return positions;
};

export const createIndicators = (points: CurvePoint[], height: number) => {
  const indicators: React.ReactNode[] = [];
  points.forEach((point, index) => {
    const yEnd = point.y + height;
    const filterName = 'indicatorGradient' + point.x + '-' + point.y;
    indicators.push(
      <g key={`indicator-${index}`}>
        <linearGradient
          id={filterName}
          x1={point.x}
          y1={point.y}
          x2={point.x}
          y2={yEnd}
          gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="white" stopOpacity="0.6" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <path
          d={`M${point.x} ${point.y} L${point.x} ${yEnd}`}
          stroke={`url(#${filterName})`}
          strokeWidth="0.3"
          fill="none"
        />
      </g>,
    );
  });
  return indicators;
};

function getPointOnQuadraticBezier(curve: CurvePositions, t: number): CurvePoint {
  const { start, control, end } = curve;
  const x = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * control.x + t * t * end.x;
  const y = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * control.y + t * t * end.y;
  return { x, y };
}

// Function to subdivide a quadratic Bézier curve from tStart to tEnd
function subdivideQuadraticBezier(
  curve: CurvePositions,
  tStart: number,
  tEnd: number,
): CurvePositions {
  const { start, control, end } = curve;

  // Clamp values
  tStart = Math.max(0, Math.min(1, tStart));
  tEnd = Math.max(0, Math.min(1, tEnd));

  if (tStart >= tEnd) {
    const point = getPointOnQuadraticBezier(curve, tStart);
    return { start: point, control: point, end: point };
  }

  // First, split the curve at tStart to get the portion from tStart to 1
  let tempCurve = curve;
  if (tStart > 0) {
    // Split at tStart using De Casteljau's algorithm
    const t = tStart;
    const p01 = {
      x: (1 - t) * start.x + t * control.x,
      y: (1 - t) * start.y + t * control.y,
    };
    const p12 = {
      x: (1 - t) * control.x + t * end.x,
      y: (1 - t) * control.y + t * end.y,
    };
    const p012 = {
      x: (1 - t) * p01.x + t * p12.x,
      y: (1 - t) * p01.y + t * p12.y,
    };

    // The right portion from tStart to 1
    tempCurve = {
      start: p012,
      control: p12,
      end: end,
    };
  }

  // Now split the temp curve at the adjusted parameter for tEnd
  if (tEnd < 1) {
    // Adjust tEnd for the new parameter space
    const adjustedT = tStart > 0 ? (tEnd - tStart) / (1 - tStart) : tEnd;
    const t = adjustedT;

    const p01 = {
      x: (1 - t) * tempCurve.start.x + t * tempCurve.control.x,
      y: (1 - t) * tempCurve.start.y + t * tempCurve.control.y,
    };
    const p12 = {
      x: (1 - t) * tempCurve.control.x + t * tempCurve.end.x,
      y: (1 - t) * tempCurve.control.y + t * tempCurve.end.y,
    };
    const p012 = {
      x: (1 - t) * p01.x + t * p12.x,
      y: (1 - t) * p01.y + t * p12.y,
    };

    // The left portion from 0 to adjustedT
    return {
      start: tempCurve.start,
      control: p01,
      end: p012,
    };
  }

  return tempCurve;
}
// Parse SVG path string to extract quadratic curves
function parsePath(pathString: string): CurvePositions[] {
  const curves: CurvePositions[] = [];

  // Clean up the path string and split by commands
  const cleanPath = pathString.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();

  // Extract numbers and commands
  const tokens = cleanPath.match(/[MQ]|[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/g) || [];

  let currentPoint: CurvePoint = { x: 0, y: 0 };
  let i = 0;

  while (i < tokens.length) {
    const cmd = tokens[i];

    if (cmd === 'M') {
      currentPoint = {
        x: parseFloat(tokens[i + 1]),
        y: parseFloat(tokens[i + 2]),
      };
      i += 3;
    } else if (cmd === 'Q') {
      const control = {
        x: parseFloat(tokens[i + 1]),
        y: parseFloat(tokens[i + 2]),
      };
      const end = {
        x: parseFloat(tokens[i + 3]),
        y: parseFloat(tokens[i + 4]),
      };

      curves.push({
        start: currentPoint,
        control: control,
        end: end,
      });

      currentPoint = end;
      i += 5;
    } else {
      i++;
    }
  }

  return curves;
}

// Main function: trim path from start point to end point
export function trimPath(pathString: string, startPoint: CurvePoint, endPoint: CurvePoint): string {
  const curves = parsePath(pathString);
  if (curves.length === 0) return '';

  // Find which curves contain the start and end points
  let startCurveIndex = -1;
  let startT = 0;
  let endCurveIndex = -1;
  let endT = 1;

  // Find start point
  for (let i = 0; i < curves.length; i++) {
    const curve = curves[i];

    // Check if point lies on this curve by solving for t
    // Use x coordinate to find t, then verify y matches
    const a = curve.start.x - 2 * curve.control.x + curve.end.x;
    const b = 2 * (curve.control.x - curve.start.x);
    const c = curve.start.x - startPoint.x;

    if (Math.abs(a) < 1e-10) {
      // Linear case
      if (Math.abs(b) > 1e-10) {
        const t = -c / b;
        if (t >= 0 && t <= 1) {
          const testY =
            (1 - t) * (1 - t) * curve.start.y +
            2 * (1 - t) * t * curve.control.y +
            t * t * curve.end.y;
          if (Math.abs(testY - startPoint.y) < 1e-6) {
            startCurveIndex = i;
            startT = t;
            break;
          }
        }
      }
    } else {
      const discriminant = b * b - 4 * a * c;
      if (discriminant >= 0) {
        const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);

        for (const t of [t1, t2]) {
          if (t >= 0 && t <= 1) {
            const testY =
              (1 - t) * (1 - t) * curve.start.y +
              2 * (1 - t) * t * curve.control.y +
              t * t * curve.end.y;
            if (Math.abs(testY - startPoint.y) < 1e-6) {
              startCurveIndex = i;
              startT = t;
              break;
            }
          }
        }
        if (startCurveIndex !== -1) break;
      }
    }
  }

  // Find end point
  for (let i = 0; i < curves.length; i++) {
    const curve = curves[i];

    const a = curve.start.x - 2 * curve.control.x + curve.end.x;
    const b = 2 * (curve.control.x - curve.start.x);
    const c = curve.start.x - endPoint.x;

    if (Math.abs(a) < 1e-10) {
      if (Math.abs(b) > 1e-10) {
        const t = -c / b;
        if (t >= 0 && t <= 1) {
          const testY =
            (1 - t) * (1 - t) * curve.start.y +
            2 * (1 - t) * t * curve.control.y +
            t * t * curve.end.y;
          if (Math.abs(testY - endPoint.y) < 1e-6) {
            endCurveIndex = i;
            endT = t;
            break;
          }
        }
      }
    } else {
      const discriminant = b * b - 4 * a * c;
      if (discriminant >= 0) {
        const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);

        for (const t of [t1, t2]) {
          if (t >= 0 && t <= 1) {
            const testY =
              (1 - t) * (1 - t) * curve.start.y +
              2 * (1 - t) * t * curve.control.y +
              t * t * curve.end.y;
            if (Math.abs(testY - endPoint.y) < 1e-6) {
              endCurveIndex = i;
              endT = t;
              break;
            }
          }
        }
        if (endCurveIndex !== -1) break;
      }
    }
  }

  if (startCurveIndex === -1 || endCurveIndex === -1) {
    throw new Error('Start or end point not found on the curve');
  }

  // Build the trimmed path
  const pathSegments: string[] = [];

  if (startCurveIndex === endCurveIndex) {
    // Both points are on the same curve
    const trimmedCurve = subdivideQuadraticBezier(curves[startCurveIndex], startT, endT);
    pathSegments.push(`M${trimmedCurve.start.x} ${trimmedCurve.start.y}`);
    pathSegments.push(
      `Q${trimmedCurve.control.x} ${trimmedCurve.control.y} ${trimmedCurve.end.x} ${trimmedCurve.end.y}`,
    );
  } else {
    // Start curve (trimmed from startT to 1)
    const startCurve = subdivideQuadraticBezier(curves[startCurveIndex], startT, 1);
    pathSegments.push(`M${startCurve.start.x} ${startCurve.start.y}`);
    pathSegments.push(
      `Q${startCurve.control.x} ${startCurve.control.y} ${startCurve.end.x} ${startCurve.end.y}`,
    );

    // Middle curves (complete)
    for (let i = startCurveIndex + 1; i < endCurveIndex; i++) {
      const curve = curves[i];
      pathSegments.push(`Q${curve.control.x} ${curve.control.y} ${curve.end.x} ${curve.end.y}`);
    }

    // End curve (trimmed from 0 to endT)
    const endCurve = subdivideQuadraticBezier(curves[endCurveIndex], 0, endT);
    pathSegments.push(
      `Q${endCurve.control.x} ${endCurve.control.y} ${endCurve.end.x} ${endCurve.end.y}`,
    );
  }

  return pathSegments.join(' ');
}

export const createPath = (segments: number, heightSteps: number) => {
  const viewBoxHeight = segments * heightSteps;
  let path = `M${VIEWBOX_WIDTH / 2} 0`;
  for (let i = 0; i < segments; i++) {
    path += `Q${i % 2 === 0 ? 150 - SIDE_OFFSET : -50 + SIDE_OFFSET} ${i * heightSteps + heightSteps / 2} 50 ${i * heightSteps + heightSteps} `;
  }
  return { path, viewBoxHeight };
};
