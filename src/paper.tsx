import React from 'react';

type Vertex = {
  x: number;
  y: number;
  id: number;
  selected: boolean;
}

// little object for determining what vertex is being dragged, and once it's
// picked up, how much the mouse was initially offset from the center of the 
// vertex.
type dragVertexState = {
  vertex: Vertex | null;
  offsetX: number;
  offsetY: number;
}

export const Paper: React.FC<{ selectedTool: string }> = (
  { selectedTool }: { selectedTool: string }
) => {
  const PAPER_BORDER_WIDTH: number = 0.01;
  const VERTEX_RADIUS = 0.005;
  
  const [vertices, setVertices] = React.useState<Vertex[]>([] as Vertex[]);
  const [draggingVertex, setDraggingVertex] = React.useState<dragVertexState>(
    {vertex: null, offsetX: 0, offsetY: 0}
  );
  const [vertexIdCounter, setVertexIdCounter] = React.useState<number>(0);
  /**
   * Get the coordinates of the click event relative to the paper. This is used
   * in pretty much all mouse events.
   * @param e - The click event
   * @returns The coordinates of the click event relative to the paper
   */
  function getClickCoordinates(e: React.MouseEvent<SVGSVGElement>) {
    const svgBB = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - svgBB.left) / svgBB.width;
    const y = (e.clientY - svgBB.top) / svgBB.height;
    return { x, y };
  }

  const addVertex = (x: number, y: number) => {
    const newVertex: Vertex = {
      x,
      y,
      id: vertexIdCounter,
      selected: false
    };
    setVertices(prev => [...prev, newVertex]);
    setVertexIdCounter(prev => prev + 1);
  };

  /**
   * Remove all vertices within 1.1 * VERTEX_RADIUS of the click coordinates.
   * @param x - The x coordinate in the svg coordinate system
   * @param y - The y coordinate in the svg coordinate system
   */
  const removeNearbyVertices = (x: number, y: number) => {
    setVertices(prev => 
      prev.filter(v => Math.hypot(v.x - x, v.y - y) > 1.1 * VERTEX_RADIUS)
    );
  };

  /**
   * Handle a click event on the paper. 
   *  - If the left mouse button is clicked and the "add-vertex" tool is 
   *    selected, add a vertex at the click coordinates.
   *  - If the right mouse button is clicked, remove all vertices within 
   *    1.1 * VERTEX_RADIUS of the click coordinates.
   * @param e - The click event
   */
  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const { x, y } = getClickCoordinates(e);
    if (e.button === 0) { // Left click
      if (selectedTool === "add-vertex") {
        addVertex(x, y);
      }
    } else if (e.button === 2) { // Right click
      removeNearbyVertices(x, y);
    }
  };

  // Prevent right click from opening context menu
  const handleContextMenu = (e: React.MouseEvent<SVGSVGElement>) => {
    e.preventDefault();
  };

  /**
   * Handle a mouse down event on the paper.
   *  - If the right mouse button is clicked, remove all vertices within 
   *    1.1 * VERTEX_RADIUS of the click coordinates.
   * @param e - The mouse down event
   */
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    const { x, y } = getClickCoordinates(e);
    if (e.button === 2) { // Right click = erase
      removeNearbyVertices(x, y);
    }
  };

  /**
   * This is the event listener that is triggered when the user clicks on a 
   * vertex.
   * @param e - The mouse down event
   * @param vertex - The vertex that was clicked on
   */
  const handleMouseDownOnVertex = (
    e: React.MouseEvent<SVGCircleElement>, 
    vertex: Vertex
  ) => {
    const svg = e.currentTarget.parentElement;
    if (!svg) return; // should never happen as added vertex is a child of svg
    const svgBB = svg.getBoundingClientRect();
    const x = (e.clientX - svgBB.left) / svgBB.width;
    const y = (e.clientY - svgBB.top) / svgBB.height;
    setDraggingVertex({
      vertex: vertex,
      offsetX: x - vertex.x,
      offsetY: y - vertex.y
    });
  }
  
  /**
   * Render all of the vertices on the paper as svg circles. We also add an
   * onMouseDown event listener to each vertex that allows us to drag it 
   * (see handleMouseDownOnVertex()).
   * @returns The vertices rendered on the paper.
   */
  const renderVertices = () => {
    return vertices.map((vertex: Vertex) => {
      // When we're hovering over a vertex, change cursor according to the 
      // selected tool.
      //     - move-vertex => double arrow
      //     - add-edge => pointer
      let cursorStyle = "default";
      if(selectedTool === "move-vertex"){
        cursorStyle = "move";
      } else if (selectedTool === "add-edge"){
        cursorStyle = "pointer";
      }

      // if the vertex is selected, color it cyan
      let color = "black";
      if (vertex.selected){
        color = "cyan";
      }
      return (
        <circle
          key={vertex.id}
          cx={vertex.x}
          cy={vertex.y}
          r={VERTEX_RADIUS}
          style={{cursor: cursorStyle, fill: color}}
          onMouseDown={(e) => handleMouseDownOnVertex(e, vertex)}
        />
      )
    });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const { x, y } = getClickCoordinates(e);
    
    if (e.buttons === 2) {
      removeNearbyVertices(x, y);
    }

    // Update vertex position if one is being dragged
    if (draggingVertex.vertex && selectedTool === "move-vertex"){
      setVertices((prev: Vertex[]) => {
        const vertices = [...prev];
        if (!draggingVertex.vertex){
          return vertices;
        }
        const vertexBeingDragged = vertices.find(
          v => v === draggingVertex.vertex
        );
        if (!vertexBeingDragged) {
          return vertices;
        }
        vertexBeingDragged.x = x - draggingVertex.offsetX;
        vertexBeingDragged.y = y - draggingVertex.offsetY;
        return vertices;
      });
    }
  };

  // Add useEffect to handle global mouse up events
  React.useEffect(
    () => {
      const handleGlobalMouseUp = () => {
        if (draggingVertex.vertex) {
          setDraggingVertex({vertex: null, offsetX: 0, offsetY: 0});
        }
      };
      
      // Add event listener to window
      window.addEventListener('mouseup', handleGlobalMouseUp);
      
      // Clean up the event listener when component unmounts
      return () => {
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }, 
    [draggingVertex.vertex] // Only re-add listener when 
                            // draggingVertex.vertex changes
  );

  /**
   * This is the event listener that is triggered when the user releases the 
   * mouse button. (It's responsible for letting go of a vertex)
   */
  const handleMouseUp = () => {
    if (draggingVertex.vertex){
      setDraggingVertex({vertex: null, offsetX: 0, offsetY: 0});
    }
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
      onMouseUp={handleMouseUp}
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