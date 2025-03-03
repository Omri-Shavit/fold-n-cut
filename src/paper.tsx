/**
 * This file contains the definition of the Vertex and Edge types, as well as
 * the Paper user interface. The paper component is the main component the user
 * interfaces with for creating the fold and cut pattern.
 */

import React from 'react';
import { ErrorInfo } from './ErrorIndicator';
export type Vertex = {
    x: number;
    y: number;
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
export type Edge = {
    endpoint1: Vertex;
    endpoint2: Vertex;
}

/**
 * Props for the Paper component
 */
type PaperProps = {
    selectedTool: string, 
    vertices: Vertex[], 
    setVertices: React.Dispatch<React.SetStateAction<Vertex[]>>,
    edges: Edge[],
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
    errorInfo: ErrorInfo,
    setErrorInfo: React.Dispatch<React.SetStateAction<ErrorInfo>>
}

/**
 * The main component for the paper.
 * @param selectedTool - The tool that is currently selected.
 * @returns The paper component.
 */
export const Paper: React.FC<PaperProps> = ({
    selectedTool, 
    vertices, 
    setVertices, 
    edges, 
    setEdges, 
    errorInfo, 
    setErrorInfo
}) => {
    // Constants TODO: maybe make these variable some increase/decrease buttons
    const PAPER_BORDER_WIDTH: number = 0.01;
    const EDGE_WIDTH: number = 0.005;
    const VERTEX_RADIUS = 0.005;
    
    const [draggingVertex, setDraggingVertex] = React.useState<dragVertexState>(
        {vertex: null, offsetX: 0, offsetY: 0}
    );
    const [firstEndpoint, setFirstEndpoint] = React.useState<Vertex | null>(
        null
    );
    const [pointerPosition, setPointerPosition] = React.useState<
        {x: number, y: number}
    >({x: 0, y: 0}); // for edge preview (maybe this isn't needed...)
    
    /**
     * Get the coordinates of the click event relative to the paper. This is 
     * used in pretty much all mouse events.
     * @param e - The click event
     * @returns The coordinates of the click event relative to the paper
     */
    function getClickCoordinates(e: React.MouseEvent<SVGSVGElement>) {
        const svgBB = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - svgBB.left) / svgBB.width;
        const y = (e.clientY - svgBB.top) / svgBB.height;
        return { x, y };
    }

    /**
     * Add a vertex to the paper.
     * @param x - The x coordinate of the vertex
     * @param y - The y coordinate of the vertex
     */
    const addVertex = (x: number, y: number) => {
        const newVertex: Vertex = {
            x,
            y,
            incidentEdges: [],
            neighboringVertices: [],
            selected: false
        };
        setVertices(prev => [...prev, newVertex]);
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
     * Remove an edge from the paper.
     * @param edge - The edge to remove
     */
    const removeEdge = (edge: Edge) => {
        // Remove the edge from the incidentEdges arrays
        edge.endpoint1.incidentEdges = edge.endpoint1.incidentEdges
            .filter(e => e !== edge);
        edge.endpoint2.incidentEdges = edge.endpoint2.incidentEdges
            .filter(e => e !== edge);
        
        // Remove the vertices from each other's neighboringVertices arrays
        edge.endpoint1.neighboringVertices = edge.endpoint1.neighboringVertices
            .filter(v => v !== edge.endpoint2);
        edge.endpoint2.neighboringVertices = edge.endpoint2.neighboringVertices
            .filter(v => v !== edge.endpoint1);
        
        // Force a re-render of vertices
        setVertices([...vertices]);
        
        // remove the edge from list of intersecting edges (if it is there)
        setErrorInfo(prev => ({
            ...prev,
            intersectingEdges: prev.intersectingEdges.filter(
                pair => pair[0] !== edge && pair[1] !== edge
            )
        }));

        // remove the edge from the list of edges
        setEdges(prev => prev.filter(e => e !== edge));
    };

    /**
     * Remove all edges within a certain distance of the given coordinates
     * @param x - The x coordinate in the svg coordinate system
     * @param y - The y coordinate in the svg coordinate system
     */
    const removeNearbyEdges = (x: number, y: number) => {
        const EDGE_REMOVAL_THRESHOLD = 2 * EDGE_WIDTH;
        for (const edge of edges){
            if (distanceToEdge(x, y, edge) < EDGE_REMOVAL_THRESHOLD){
                removeEdge(edge);
            }
        }
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
            for (const edge of edges){
                if (verticesToRemove.includes(edge.endpoint1) 
                    || verticesToRemove.includes(edge.endpoint2)){
                    removeEdge(edge);
                }
            }
            
            // remove said vertices
            return prev.filter(
                v => Math.hypot(v.x - x, v.y - y) > 1.1 * VERTEX_RADIUS
            );
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
        } else if (selectedTool === "add-edge" && e.button === 0){
            if (vertex.incidentEdges.length === 2){ // clicked edge is saturated
                // cancel making an edge
                setFirstEndpoint(null);
            } else if (firstEndpoint === null){ // no first endpoint selected yet
                if (vertex.incidentEdges.length < 2) setFirstEndpoint(vertex);
            } else if ( // trying to add a self loop or repeat an existing edge
                firstEndpoint === vertex || 
                firstEndpoint.neighboringVertices.includes(vertex)
            ){
                console.log("tried to add an existing edge")
                // cancel making an edge if we click the same vertex twice or 
                // try to make an existing edge.
                setFirstEndpoint(null);
            } else if (firstEndpoint !== vertex){ // add edge
                // add the edge to the list of edges
                const newEdge = {endpoint1: firstEndpoint, endpoint2: vertex};
                setEdges(prev => [...prev, newEdge]);
                setFirstEndpoint(null);

                // update the list of neighboring vertices and incident edges
                firstEndpoint.neighboringVertices.push(vertex);
                vertex.neighboringVertices.push(firstEndpoint);
                firstEndpoint.incidentEdges.push(newEdge);
                vertex.incidentEdges.push(newEdge);

                // validate the edge
                validateEdge(newEdge);
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
        return vertices.map((vertex: Vertex, index: number) => {
            // When we're hovering over a vertex, change cursor according to 
            // the selected tool.
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
                    key={index}
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
     * Render a preview of the edge that is being drawn. This edge shows what 
     * the first endpoint of the edge will be.
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
            setVertices((prev: Vertex[]) => { // move vertex
                const vertices = [...prev];
                if (!draggingVertex.vertex) return vertices;
                draggingVertex.vertex.x = x - draggingVertex.offsetX;
                draggingVertex.vertex.y = y - draggingVertex.offsetY;

                // see that no incident edges begin to intersect other edges
                for (const edge of draggingVertex.vertex.incidentEdges){
                    validateEdge(edge);
                }
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
        // Only re-add listener when draggingVertex.vertex changes
        [draggingVertex.vertex]
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

    /**
     * Check if an edge intersects with any other edge. If it does, add the 
     * intersecting edge pair to the list of intersecting edges.
     * @param edge - The edge to check.
     */
    function validateEdge(edge: Edge){
        // First remove any existing intersections involving this edge
        setErrorInfo(prevInfo => {
            const filteredIntersections = prevInfo.intersectingEdges.filter(
                pair => pair[0] !== edge && pair[1] !== edge
            );
            
            // Find new intersections for this edge
            const newIntersections: Edge[][] = [];
            const edgeIdx = edges.indexOf(edge);

            for (let otherEdgeIdx = 0; otherEdgeIdx < edges.length; otherEdgeIdx++){
                const otherEdge = edges[otherEdgeIdx];
                if (otherEdge === edge) continue;
                if (!theseEdgesIntersect(edge, otherEdge)) continue;
                
                const intersectingEdgePair = (edgeIdx < otherEdgeIdx) ? 
                    [edge, otherEdge] : [otherEdge, edge];
                    
                newIntersections.push(intersectingEdgePair);
            }
            
            // Return updated error info with both existing and new 
            // intersections
            return {
                ...prevInfo,
                intersectingEdges: [...filteredIntersections, ...newIntersections]
            };
        });
    }
    

    /**
     * Check if two edges intersect.
     * @param edge1 - The first edge.
     * @param edge2 - The second edge.
     * @returns True if the edges intersect, false otherwise.
     */
    function theseEdgesIntersect(edge1: Edge, edge2: Edge): boolean {
        // if the edges share an endpoint, they don't intersect
        if (
            edge1.endpoint1 === edge2.endpoint1 
            || edge1.endpoint1 === edge2.endpoint2 
            || edge1.endpoint2 === edge2.endpoint1 
            || edge1.endpoint2 === edge2.endpoint2
        ){
            return false;
        }
        
        // Extract coordinates from edges
        const [x1, y1] = [edge1.endpoint1.x, edge1.endpoint1.y];
        const [x2, y2] = [edge1.endpoint2.x, edge1.endpoint2.y];
        
        const [x3, y3] = [edge2.endpoint1.x, edge2.endpoint1.y];
        const [x4, y4] = [edge2.endpoint2.x, edge2.endpoint2.y];
        
        // Calculate determinants
        const denominator = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
        
        // If lines are parallel (denominator is 0), they don't intersect
        if (denominator === 0) return false;
        
        const ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denominator;
        const ub = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))) / denominator;
        
        // Check if intersection point is within both line segments
        return (ua >= 0 && ua <= 1) && (ub >= 0 && ub <= 1);
    }

    /**
     * Identify vertices with degree less than 2, and update
     * errorInfo.lowDegreeVertices with the list of such vertices.
     */
    function validateVertices() {
        // Find vertices with degree less than 2
        const lowDegreeVertices = vertices.filter(v => v.incidentEdges.length < 2);
        
        // Update error info with the new list of low degree vertices
        setErrorInfo(prevErrorInfo => ({
            ...prevErrorInfo,
            lowDegreeVertices: lowDegreeVertices,
        }));
    }

    // Add useEffect to validate vertices whenever vertices or edges change
    React.useEffect(() => {
        validateVertices();
    }, [vertices, edges]);


    /**
     * Render a small red triangle centered at every vertex in
     * errorInfo.lowDegreeVertices
     */
    const renderLowDegreeVerticesWarning = () => {
        // Triangle size relative to vertex radius
        const triangleSize = VERTEX_RADIUS * 3.5;
        
        return (
            <>
                {errorInfo.lowDegreeVertices.map((vertex) => {
                    // Calculate the points for an equilateral triangle centered at the vertex
                    const points = [
                        `${vertex.x},${vertex.y - triangleSize}`, // Top point
                        `${vertex.x - triangleSize * 0.866},${vertex.y + triangleSize * 0.5}`, // Bottom left
                        `${vertex.x + triangleSize * 0.866},${vertex.y + triangleSize * 0.5}`  // Bottom right
                    ].join(' ');
                    
                    return (
                        <polygon
                            points={points}
                            fill="red"
                            opacity="0.7"
                            stroke="none"
                        />
                    );
                })}
            </>
        );
    };

    /**
     * Render a small red triangle centered at the intersection of every pair of 
     * edges in errorInfo.intersectingEdges
     */
    const renderIntersectingEdgesWarning = () => {
        // X mark size relative to vertex radius
        const xSize = VERTEX_RADIUS * 3;
        
        return (
            <>
                {errorInfo.intersectingEdges.map((edgePair) => {
                    // Get the coordinates of the two edges
                    const [edge1, edge2] = edgePair;
                    const [x1, y1] = [edge1.endpoint1.x, edge1.endpoint1.y];
                    const [x2, y2] = [edge1.endpoint2.x, edge1.endpoint2.y];
                    const [x3, y3] = [edge2.endpoint1.x, edge2.endpoint1.y];
                    const [x4, y4] = [edge2.endpoint2.x, edge2.endpoint2.y];
                    
                    // Calculate the intersection point
                    const denominator = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
                    const ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denominator;
                    
                    const intersectionX = x1 + ua * (x2 - x1);
                    const intersectionY = y1 + ua * (y2 - y1);
                    
                    // Return an X mark at the intersection point
                    return (
                        <g>
                            <line 
                                x1={intersectionX - xSize/2} 
                                y1={intersectionY - xSize/2}
                                x2={intersectionX + xSize/2} 
                                y2={intersectionY + xSize/2}
                                stroke="red"
                                strokeWidth={EDGE_WIDTH}
                            />
                            <line 
                                x1={intersectionX - xSize/2} 
                                y1={intersectionY + xSize/2}
                                x2={intersectionX + xSize/2} 
                                y2={intersectionY - xSize/2}
                                stroke="red"
                                strokeWidth={EDGE_WIDTH}
                            />
                        </g>
                    );
                })}
            </>
        );
    };

    return (
        <div className="main-content" id="mainContent">
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
                {renderLowDegreeVerticesWarning()}
                {renderIntersectingEdgesWarning()}
                {renderEdges()}
                {renderPreviewEdge()}
                {renderVertices()}
            </svg>  
        </div>
    );
};