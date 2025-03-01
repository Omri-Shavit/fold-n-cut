import React from 'react';

class Vertex {
  static radius: number = 0.005;
  static color: string = "black";

  x: number;
  y: number;
  color: string;

  constructor(x: number, y: number, color=Vertex.color) {
    this.x = x;
    this.y = y;
    this.color = color;
  }

  render(){
    return (<circle 
      cx={this.x}
      cy={this.y}
      r={Vertex.radius}
      fill={this.color}
    />);
  }
}

export const Paper: React.FC<{ selectedTool: string }> = ({ selectedTool }) => {
  const PAPER_BORDER_WIDTH: number = 0.01;
  const [vertices, setVertices] = React.useState<Vertex[]>([]);

  function getClickCoordinates(e: React.MouseEvent<SVGSVGElement>) {
    const svgBB = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - svgBB.left) / svgBB.width;
    const y = (e.clientY - svgBB.top) / svgBB.height;
    return { x, y };
  }

  const addVertex = (x: number, y: number) => {
    const newVertex = new Vertex(x, y);
    setVertices(prev => [...prev, newVertex]);
  };

  const removeNearbyVertices = (x: number, y: number) => {
    setVertices(prev => 
      prev.filter(v => Math.hypot(v.x - x, v.y - y) > 1.1 * Vertex.radius)
    );
  };

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    console.log(`current tool selected: ${selectedTool}`);
    if (e.button === 0) { // Left click
      const { x, y } = getClickCoordinates(e);
      if (selectedTool === "add-vertex") {
        addVertex(x, y);
      }
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
    return vertices.map((vertex) => (
      vertex.render()
    ));
  };
  

  return (
    <svg 
      id="paper"
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