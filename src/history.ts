import { Edge, Vertex } from "./Paper";

type SimpleVertex = [number, number];
type SimpleEdge = [number, number]; // two indices of simple vertices array

type FoldNCutState = {
    vertices_coords: SimpleVertex[];
    edges_vertices: SimpleEdge[];
}

export class HistoryManager {
    private states: FoldNCutState[] = [];
    private currentIndex: number = 0;
    private setEdges: (edges: Edge[]) => void;
    private setVertices: (vertices: Vertex[]) => void;
    private quiet: boolean = true; // console.log stuff for debugging

    constructor(
        setEdges: (edges: Edge[]) => void, 
        setVertices: (vertices: Vertex[]) => void
    ) {
        this.setEdges = setEdges;
        this.setVertices = setVertices;

        const initialState: FoldNCutState = {
            vertices_coords: [] as SimpleVertex[],
            edges_vertices: [] as SimpleEdge[]
        }
        this.states = [initialState];
        this.currentIndex = 0;
    }
    
    saveState(vertices: Vertex[], edges: Edge[], reason: string = "") {
        // remove all states after the current index
        this.states = this.states.slice(0, this.currentIndex + 1);

        // construct the FoldNCutState object using the vertices and edges
        const vertices_coords: SimpleVertex[] = vertices.map(v => [v.x, v.y]);
        const edges_vertices: SimpleEdge[] = [];
        for (const edge of edges) {
            const v1Index = vertices.indexOf(edge.endpoint1);
            const v2Index = vertices.indexOf(edge.endpoint2);
            
            if (v1Index !== -1 && v2Index !== -1) {
                edges_vertices.push([v1Index, v2Index]);
            } else {
                console.warn('Edge references a vertex that is not in the vertices array');
            }
        }
        
        const nextState: FoldNCutState = {
            vertices_coords,
            edges_vertices
        }

        // add the new state to the history, increment the current index
        this.states.push(nextState);
        this.currentIndex += 1;
        if (reason === "" || this.quiet) return;
        console.log(
            `History updated, index=${this.currentIndex},`
            + `(V=${nextState.vertices_coords.length},`
            + `E=${nextState.edges_vertices.length}),`
            + `reason: ${reason}`
        );
    }

    canUndo(): boolean {
        return this.currentIndex > 0;
    }

    canRedo(): boolean {
        return this.currentIndex < this.states.length - 1;
    }

    private static convertSimpleToComplex(
        simpleVertices: SimpleVertex[],
        simpleEdges: SimpleEdge[]
    ): {vertices: Vertex[], edges: Edge[]} {
        
        // construct vertices[] and edges[] from the current state
        const vertices: Vertex[] = simpleVertices.map(v => ({
            x: v[0],
            y: v[1],
            incidentEdges: [] as Edge[],
            neighboringVertices: [] as Vertex[]
        } as Vertex));

        const edges: Edge[] = [];
        for (const simpleEdge of simpleEdges) {
            // Validate indices before accessing the array
            if (simpleEdge[0] >= 0 && simpleEdge[0] < vertices.length && 
                simpleEdge[1] >= 0 && simpleEdge[1] < vertices.length) {
                
                const v1 = vertices[simpleEdge[0]];
                const v2 = vertices[simpleEdge[1]];
                
                v1.neighboringVertices.push(v2);
                v2.neighboringVertices.push(v1);
                
                const edge: Edge = {
                    endpoint1: v1,
                    endpoint2: v2
                }
                
                v1.incidentEdges.push(edge);
                v2.incidentEdges.push(edge);
                edges.push(edge);
            } else {
                console.warn('Invalid vertex indices in edge:', simpleEdge);
            }
        }

        return {vertices, edges};
    }


    undo() {
        if (!this.canUndo()) {
            return;
        }

        // decrement the current index
        this.currentIndex -= 1;
        const currentState: FoldNCutState = this.states[this.currentIndex];
        const currentVertices: SimpleVertex[] = currentState.vertices_coords;
        const currentEdges: SimpleEdge[] = currentState.edges_vertices;

        // construct vertices[] and edges[] from the current state
        const {vertices, edges} = HistoryManager.convertSimpleToComplex(
            currentVertices,
            currentEdges
        );

        // update the vertices and edges
        this.setVertices(vertices);
        this.setEdges(edges);
    }

    redo() {
        if (!this.canRedo()) {
            return;
        }

        // increment the current index
        this.currentIndex += 1;
        const currentState: FoldNCutState = this.states[this.currentIndex];
        const currentVertices: SimpleVertex[] = currentState.vertices_coords;
        const currentEdges: SimpleEdge[] = currentState.edges_vertices;

        // construct vertices[] and edges[] from the current state
        const {vertices, edges} = HistoryManager.convertSimpleToComplex(
            currentVertices,
            currentEdges
        );

        // update the vertices and edges
        this.setVertices(vertices);
        this.setEdges(edges);
    }
}

