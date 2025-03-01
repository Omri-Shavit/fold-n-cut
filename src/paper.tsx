import React from 'react';

export type Vertex = {
  x: number;
  y: number;
  id: number;
  incidentEdges: Edge[];
  neighboringVertices: Vertex[];
  selected: boolean;
}

/**
 * A little object for determining what vertex is being dragged, and once it's
 * picked up, how much the mouse was initially offset from the center of the 
 * vertex.
 */
type dragVertexState = {
  vertex: Vertex | null;
  offsetX: number;
  offsetY: number;
}

/**
 * An edge is a line segment between two vertices.
 */
type Edge = {
  endpoint1: Vertex;
  endpoint2: Vertex;
}

/**
 * The main component for the paper.
 * @param selectedTool - The tool that is currently selected.
 * @returns The paper component.
 */
export const Paper: React.FC<{
  selectedTool: string, 
  vertices: Vertex[], 
  setVertices: React.Dispatch<React.SetStateAction<Vertex[]>> 
}> = (
  { selectedTool, vertices, setVertices }: { 
    selectedTool: string, 
    vertices: Vertex[], 
    setVertices: React.Dispatch<React.SetStateAction<Vertex[]>> 
  }
) => {
  // Constants TODO: maybe make these variable some increase/decrease buttons
  const PAPER_BORDER_WIDTH: number = 0.01;
  const EDGE_WIDTH: number = 0.005;
  const VERTEX_RADIUS = 0.005;
  
  const [edges, setEdges] = React.useState<Edge[]>([] as Edge[]);
  const [draggingVertex, setDraggingVertex] = React.useState<dragVertexState>(
    {vertex: null, offsetX: 0, offsetY: 0}
  );
  const [firstEndpoint, setFirstEndpoint] = React.useState<Vertex | null>(
    null
  );
  const [vertexIdCounter, setVertexIdCounter] = React.useState<number>(0);
  const [pointerPosition, setPointerPosition] = React.useState<
    {x: number, y: number}
  >({x: 0, y: 0});
  
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
      incidentEdges: [],
      neighboringVertices: [],
      selected: false
    };
    setVertices(prev => [...prev, newVertex]);
    setVertexIdCounter(prev => prev + 1);
  };

  /**
   * Calculate the distance from a point to a line segment (edge)
   * @param x - The x coordinate of the point
   * @param y - The y coordinate of the point
   * @param edge - The edge to calculate distance to
   * @returns The distance from the point to the edge
   */
  const distanceToEdge = (x: number, y: number, edge: Edge): number => {
    const { x: x1, y: y1 } = edge.endpoint1;
    const { x: x2, y: y2 } = edge.endpoint2;
    
    // Calculate the length of the edge
    const lineLength = Math.hypot(x2 - x1, y2 - y1);
    
    if (lineLength === 0) return Math.hypot(x - x1, y - y1);
    
    // Calculate the distance from the point to the line
    const t = Math.max(0, Math.min(
      1, 
      ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / (lineLength * lineLength)
    ));
    const projX = x1 + t * (x2 - x1);
    const projY = y1 + t * (y2 - y1);
    
    return Math.hypot(x - projX, y - projY);
  };

  /**
   * Remove all edges within a certain distance of the given coordinates
   * @param x - The x coordinate in the svg coordinate system
   * @param y - The y coordinate in the svg coordinate system
   */
  const removeNearbyEdges = (x: number, y: number) => {
    const EDGE_REMOVAL_THRESHOLD = 2 * EDGE_WIDTH;
    setEdges(prev => 
      prev.filter(edge => distanceToEdge(x, y, edge) > EDGE_REMOVAL_THRESHOLD)
    );
  };

  /**
   * Remove all vertices within 1.1 * VERTEX_RADIUS of the click coordinates.
   * @param x - The x coordinate in the svg coordinate system
   * @param y - The y coordinate in the svg coordinate system
   */
  const removeNearbyVertices = (x: number, y: number) => {
    setVertices((prev: Vertex[]) => {
      // Get the list of vertices we're about to remove
      const verticesToRemove = prev.filter(v => 
        Math.hypot(v.x - x, v.y - y) <= 1.1 * VERTEX_RADIUS
      );
      
      // remove any edges that have an endpoint due for removal
      setEdges(prev => prev.filter(e => !(
        verticesToRemove.includes(e.endpoint1) 
        || verticesToRemove.includes(e.endpoint2)
      )));

      // remove said vertices
      return prev.filter(v => Math.hypot(v.x - x, v.y - y) > 1.1 * VERTEX_RADIUS);
    });
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
      removeNearbyEdges(x, y);
    }
  };

  // Prevent right click from opening a context menu
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
      removeNearbyEdges(x, y);
    }
  };

  /**
   * This is the event listener that is triggered when the user clicks on a 
   * vertex. 
   *  - If the "move-vertex" tool is selected, start dragging the vertex.
   *  - If the "add-edge" tool is selected, set the first endpoint of the edge
   *    or complete the edge if already started.
   * @param e - The mouse down event
   * @param vertex - The vertex that was clicked on
   */
  const handleMouseDownOnVertex = (
    e: React.MouseEvent<SVGCircleElement>, 
    vertex: Vertex
  ) => {
    if (selectedTool === "move-vertex"){
      const svg = e.currentTarget.parentElement;
      if (!svg) return;
      const svgBB = svg.getBoundingClientRect();
      const x = (e.clientX - svgBB.left) / svgBB.width;
      const y = (e.clientY - svgBB.top) / svgBB.height;
      setDraggingVertex({
      vertex: vertex,
      offsetX: x - vertex.x,
        offsetY: y - vertex.y
      });
    } else if (selectedTool === "add-edge"){
      if (firstEndpoint === null){
        setFirstEndpoint(vertex);
      } else if (
        firstEndpoint === vertex || 
        firstEndpoint.neighboringVertices.includes(vertex)
      ){
        // cancel making an edge if we click the same vertex twice or try to
        // make an existing edge.
        setFirstEndpoint(null);
      } else if (firstEndpoint !== vertex){
        // add new edge to the list of edges
        const newEdge = {endpoint1: firstEndpoint, endpoint2: vertex};
        setEdges(prev => [...prev, newEdge]);
        setFirstEndpoint(null);
        // also, update the list of neighboring vertices and incident edges
        firstEndpoint.neighboringVertices.push(vertex);
        vertex.neighboringVertices.push(firstEndpoint);
        firstEndpoint.incidentEdges.push(newEdge);
        vertex.incidentEdges.push(newEdge);
      }
    }
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

      return (
        <circle
          key={vertex.id}
          cx={vertex.x}
          cy={vertex.y}
          r={VERTEX_RADIUS}
          fill="black"
          style={{cursor: cursorStyle}}
          onMouseDown={(e) => handleMouseDownOnVertex(e, vertex)}
        />
      )
    });
  };

  /**
   * Render all of the edges on the paper as svg lines.
   * @returns The edges rendered on the paper.
   */
  const renderEdges = () => {
    return edges.map((edge: Edge) => (<line 
        key={`${edge.endpoint1.id},${edge.endpoint2.id}`} 
        x1={edge.endpoint1.x}
        y1={edge.endpoint1.y} 
        x2={edge.endpoint2.x} 
        y2={edge.endpoint2.y} 
        stroke="black"
        strokeWidth={EDGE_WIDTH}
      />
    ));
  };

  /**
   * Render a preview of the edge that is being drawn. This edge shows what the 
   * first endpoint of the edge will be.
   * @returns The preview of the edge being drawn.
   */
  const renderPreviewEdge = () => {
    return (
      (selectedTool === "add-edge" && firstEndpoint)?
        <line 
          x1={firstEndpoint.x}
          y1={firstEndpoint.y}
          x2={pointerPosition.x} 
          y2={pointerPosition.y} 
          stroke="black"
          strokeWidth={EDGE_WIDTH}
        /> : <></>
    );
  }

  /**
   * Handle a mouse move event on the paper.
   *  - If the right mouse button is clicked, remove all vertices within 
   *    1.1 * VERTEX_RADIUS of the click coordinates.
   *  - If a vertex is being dragged, update its position.
   *  - Update pointer position for edge preview.
   * @param e - The mouse move event
   */
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const { x, y } = getClickCoordinates(e);
    
    // Update pointer position for edge preview
    setPointerPosition({ x, y });
    
    if (e.buttons === 2) { // Right mouse button is being dragged
      removeNearbyVertices(x, y);
      removeNearbyEdges(x, y);
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

  // Add useEffect to handle tool changes
  React.useEffect(() => {
    // Reset firstEndpoint when tool changes
    if (selectedTool !== "add-edge" && firstEndpoint !== null) {
      setFirstEndpoint(null);
    }
  }, [selectedTool, firstEndpoint]);
  
  // Add useEffect to handle keyboard events (Escape key)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && firstEndpoint !== null) {
        setFirstEndpoint(null);
      }
    };
    
    // Add event listener to window
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up the event listener when component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [firstEndpoint]); // Only re-add listener when firstEndpoint changes

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
      {renderEdges()}
      {renderPreviewEdge()}
      {renderVertices()}
    </svg>
  );
};