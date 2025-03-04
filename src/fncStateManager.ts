/**
 * This file defines the Fnc API which currently supports only getState and 
 * setState.
 * 
 * The API is available globally as window.Fnc.
 * 
 * The API is used by the Paper component to get the current state and update 
 * the state.
 */
import { useRef, useEffect } from 'react';
import { Vertex, Edge } from './paper';

// Define the state interface
export interface FncState {
    vertices_coords: number[][];
    edges_vertices: number[][];
}

// Define the global type
declare global {
    interface Window {
        Fnc: {
            getState: () => FncState;
            setState: (state: FncState) => void;
        };
    }
}

/**
 * Hook that creates and manages the Fold N' Cut state API
 * @param vertices Current vertices array
 * @param edges Current edges array
 * @param setVertices Function to update vertices
 * @param setEdges Function to update edges
 */
export function useFncStateManager(
    vertices: Vertex[],
    edges: Edge[],
    setVertices: React.Dispatch<React.SetStateAction<Vertex[]>>,
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
) {
    // Create refs to access current state values in the global functions
    const verticesRef = useRef<Vertex[]>(vertices);
    const edgesRef = useRef<Edge[]>(edges);

    // Update refs when state changes
    useEffect(() => {
        verticesRef.current = vertices;
    }, [vertices]);

    useEffect(() => {
        edgesRef.current = edges;
    }, [edges]);

    // Define getState function
    const getState = (): FncState => {
        const currentVertices = verticesRef.current;
        const currentEdges = edgesRef.current;

        // Convert vertices to coordinates
        const vertices_coords = currentVertices.map(vertex => [vertex.x, vertex.y]);

        // Convert edges to vertex indices by finding the positions of vertices in the array
        const edges_vertices = currentEdges.map(edge => {
            const startIndex = currentVertices.indexOf(edge.endpoint1);
            const endIndex = currentVertices.indexOf(edge.endpoint2);

            // Skip edges with vertices that don't exist in the array
            if (startIndex === -1 || endIndex === -1) {
                console.warn('Invalid edge found:', {
                    edge,
                    startFound: startIndex !== -1,
                    endFound: endIndex !== -1
                });
            }

            return [startIndex, endIndex];
        }).filter(([startIndex, endIndex]) => startIndex !== -1 && endIndex !== -1);

        return {
            vertices_coords,
            edges_vertices
        };
    };

    // Define setState function
    const setState = (state: FncState): void => {
        // Validate state
        if (!Array.isArray(state.vertices_coords)) {
            throw new Error("vertices_coords must be an array");
        }

        if (!Array.isArray(state.edges_vertices)) {
            throw new Error("edges_vertices must be an array");
        }

        // Validate vertices_coords format
        state.vertices_coords.forEach((coord, i) => {
            if (!Array.isArray(coord) || coord.length !== 2 ||
                typeof coord[0] !== 'number' || typeof coord[1] !== 'number') {
                throw new Error(
                    `Invalid vertex coordinate at index ${i}.` +
                    `Must be [x, y] with numeric values.`);
            }
        });

        // Create new vertices with properly typed arrays
        const newVertices = state.vertices_coords.map((coord) => ({
            x: coord[0],
            y: coord[1],
            incidentEdges: [] as Edge[], // Explicitly type as Edge[]
            neighboringVertices: [] as Vertex[] // Explicitly type as Vertex[]
        }));

        // Validate edges_vertices format and bounds
        const newEdges: Edge[] = [];
        state.edges_vertices.forEach((edgeIndices, i) => {
            if (!Array.isArray(edgeIndices) || edgeIndices.length !== 2 ||
                typeof edgeIndices[0] !== 'number' 
                || typeof edgeIndices[1] !== 'number') {
                throw new Error(`Invalid edge at index ${i}.` +
                    `Must be [startIdx, endIdx] with numeric values.`);
            }

            const [startIdx, endIdx] = edgeIndices;
            if (startIdx < 0 || startIdx >= newVertices.length ||
                endIdx < 0 || endIdx >= newVertices.length) {
                throw new Error(
                    `Edge at index ${i}` +
                    `has out-of-bounds vertex indices.`
                );
            }

            // Create the edge with direct references to vertex objects
            const edge: Edge = {
                endpoint1: newVertices[startIdx],
                endpoint2: newVertices[endIdx]
            };

            // Update the incidentEdges and neighboringVertices arrays for both 
            // endpoints
            newVertices[startIdx].incidentEdges.push(edge);
            newVertices[endIdx].incidentEdges.push(edge);
            newVertices[startIdx].neighboringVertices.push(
                newVertices[endIdx]
            );
            newVertices[endIdx].neighboringVertices.push(
                newVertices[startIdx]
            );

            newEdges.push(edge);
        });

        // Update state
        setVertices(newVertices);
        setEdges(newEdges);
    };

    // Setup global Fnc object
    useEffect(() => {
        window.Fnc = {
            getState,
            setState
        };

        console.log("Fold N' Cut API available:" +
            "Fnc.getState() and Fnc.setState()");

        // No need to clean up since we want the API to be available throughout 
        // the app lifecycle
    }, []);

    // Return the functions in case they need to be used within the component
    return { getState, setState };
}