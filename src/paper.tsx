import React from 'react';

type Vertex = {
  x: number;
  y: number;
};

const PAPER_BORDER_WIDTH: number = 0.01;
const VERTEX_RADIUS: number = 0.005;

export const Paper: React.FC = () => {
  const svgRef = React.useRef<SVGSVGElement | null>(null);
  const [vertices, setVertices] = React.useState<Vertex[]>([]);

  function getClickCoordinates(e: React.MouseEvent<SVGSVGElement>) {
    const svgBB = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - svgBB.left) / svgBB.width;
    const y = (e.clientY - svgBB.top) / svgBB.height;
    return { x, y };
  }

  const addVertex = (x: number, y: number) => {
    const newVertex = { x, y };
    setVertices(prev => [...prev, newVertex]);
  };

  const removeNearbyVertices = (x: number, y: number) => {
    setVertices(prev => 
      prev.filter(v => Math.hypot(v.x - x, v.y - y) > 1.1 * VERTEX_RADIUS)
    );
  };

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button === 0) { // Left click = add
      const { x, y } = getClickCoordinates(e);
      addVertex(x, y);
    }
  };

  const handleContextMenu = (e: React.MouseEvent<SVGSVGElement>) => {
    e.preventDefault();
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button === 2) { // Right click = erase
      const { x, y } = getClickCoordinates(e);
      removeNearbyVertices(x, y);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.buttons === 2) { // Only erase when right button is held
      const { x, y } = getClickCoordinates(e);
      removeNearbyVertices(x, y);
    }
  };

  const renderVertices = () => {
    return vertices.map((vertex, index) => (
      <circle 
        key={index}
        cx={vertex.x}
        cy={vertex.y}
        r={VERTEX_RADIUS}
        fill="black"
      />
    ));
  };
  

  return (
    <svg 
      id="paper"
      ref={svgRef}
      width="80vmin"
      height="80vmin"
      viewBox="0 0 1 1"
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
    >
      <rect 
        width="1" 
        height="1" 
        fill="white" 
        stroke="black" 
        strokeWidth={PAPER_BORDER_WIDTH} 
      />
      {renderVertices()}
    </svg>
  );
}; 