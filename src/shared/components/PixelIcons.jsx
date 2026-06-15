function PixelSvg({ rects, size = 24 }) {
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true">
      {rects.map((rect, index) => (
        <rect key={index} x={rect[0]} y={rect[1]} width={rect[2] || 3} height={rect[3] || 3} />
      ))}
    </svg>
  );
}

export function IconSelector() {
  const rects = [];
  for (let x = 3; x <= 18; x += 6) {
    for (let y = 3; y <= 18; y += 6) rects.push([x, y, 3, 3]);
  }
  rects.push([9, 9, 6, 6]);
  return <PixelSvg rects={rects} />;
}

export function IconDice() {
  return (
    <PixelSvg
      rects={[
        [9, 2, 6, 2],
        [7, 4, 2, 2],
        [15, 4, 2, 2],
        [5, 6, 2, 2],
        [17, 6, 2, 2],
        [4, 8, 2, 8],
        [18, 8, 2, 8],
        [6, 16, 2, 2],
        [16, 16, 2, 2],
        [8, 18, 2, 2],
        [14, 18, 2, 2],
        [10, 19, 4, 2],
        [11, 7, 2, 2],
        [8, 12, 2, 2],
        [14, 12, 2, 2],
      ]}
    />
  );
}

export function IconGames() {
  return (
    <PixelSvg
      rects={[
        [7, 3, 12, 3],
        [7, 6, 3, 12],
        [16, 6, 3, 12],
        [7, 15, 12, 3],
        [3, 7, 3, 12],
        [3, 7, 11, 3],
        [3, 16, 11, 3],
        [11, 7, 3, 12],
      ]}
    />
  );
}

export function IconOrder() {
  return <PixelSvg rects={[[3, 3, 4, 4], [10, 3, 11, 3], [3, 10, 4, 4], [10, 10, 11, 3], [3, 17, 4, 4], [10, 17, 11, 3]]} />;
}

export function IconTeams() {
  return <PixelSvg rects={[[3, 4, 7, 7], [14, 4, 7, 7], [3, 13, 7, 7], [14, 13, 7, 7]]} />;
}

export function IconStart() {
  return <PixelSvg rects={[[5, 5, 14, 14]]} />;
}

export function IconCheck() {
  return <PixelSvg rects={[[4, 11, 3, 3], [7, 14, 3, 3], [10, 11, 3, 3], [13, 8, 3, 3], [16, 5, 3, 3]]} />;
}

export function IconMore() {
  return <PixelSvg rects={[[10, 4, 4, 4], [10, 10, 4, 4], [10, 16, 4, 4]]} />;
}

export function IconArrowRight() {
  return <PixelSvg rects={[[3, 11, 12, 2], [13, 8, 2, 2], [15, 10, 2, 2], [15, 12, 2, 2], [13, 14, 2, 2]]} />;
}
