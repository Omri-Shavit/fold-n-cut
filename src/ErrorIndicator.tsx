import React from 'react';
import { Edge, Vertex } from './paper';

export type ErrorInfo = {
    viewErrorIndicator: boolean;
    lowDegreeVertices: Vertex[];
    intersectingEdges: Edge[][];
}

const ErrorIndicator: React.FC<{errorInfo: ErrorInfo}> = ({ errorInfo }) => {
    const errorMessages: string[] = [];

    // report vertices with degree < 2
    const lowDegreeVertexCount = errorInfo.lowDegreeVertices.length;
    if (lowDegreeVertexCount > 0) {
        errorMessages.push(`- ${lowDegreeVertexCount} 
            ${lowDegreeVertexCount === 1 ? "vertex is" : "vertices are"} 
            missing edges (all vertices must have 2 adjacent edges).`);
    }

    // report intersecting edges
    const numberOfIntersectingEdges = errorInfo.intersectingEdges.length;
    if (numberOfIntersectingEdges > 0) {
        errorMessages.push(`- ${numberOfIntersectingEdges} 
            ${numberOfIntersectingEdges === 1 ? "pair of edges is" : "pairs of edges are"} 
            intersecting (no two edges can intersect).`);
    }

    const totalErrors = lowDegreeVertexCount 
        + numberOfIntersectingEdges;
    
    let errorMessage;
    if (totalErrors === 0) {
        errorMessage = 'No errors';
    } else {
        errorMessage = `(${totalErrors} ${totalErrors === 1 ? 'error' : 'errors'})`;
        errorMessage = <>{errorMessage}<br />{errorMessages.map((msg, i) => 
            <React.Fragment key={i}>{msg}{i < errorMessages.length - 1 && <br />}</React.Fragment>
        )}</>;
    }
    
    const indicatorColor = (totalErrors === 0) ? 'limegreen' : 'red';
    return (
        <div className="error-indicator" style={{ color: indicatorColor }}>
            {errorMessage}
        </div>
    );
};

export default ErrorIndicator; 