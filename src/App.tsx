import "./App.css";
import LeftPanel from "./leftPanel";
import { Edge, Paper } from "./paper";
import React, { useState, useEffect } from 'react';
import ErrorIndicator from './ErrorIndicator';

import { Vertex } from "./paper";
import { ErrorInfo } from "./ErrorIndicator";
import { useFncStateManager } from './fncStateManager';

const header = (
    <header>Fold N' Cut</header>
);

const footer = (
    <footer>
        &copy; 2025 &nbsp;
        <a
            href="https://github.com/Omri-Shavit"
            target="_blank"
            rel="noopener noreferrer"
        >
            Omri Shavit
        </a>
    </footer>
);

const App: React.FC = () => {
    // state shared between components
    const [vertices, setVertices] = useState<Vertex[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [selectedTool, setSelectedTool] = useState<string>("add-vertex");
    const [errorInfo, setErrorInfo] = useState<ErrorInfo>({
        viewErrorIndicator: true,
        lowDegreeVertices: [] as Vertex[],
        intersectingEdges: [] as Edge[][]
    });
    
    // Initialize the state manager with our state
    useFncStateManager(vertices, edges, setVertices, setEdges);
    
    // Log welcome message only once on component mount
    useEffect(() => {
        console.log("Fold N' Cut implementation created by Omri Shavit (2025)");
    }, []);
    
    return (
        <div className="app">
            {header}
            <ErrorIndicator 
                errorInfo={errorInfo} 
            />
            <LeftPanel
                selectedTool={selectedTool} setSelectedTool={setSelectedTool}
                vertexCount={vertices.length}
            />
            <Paper
                selectedTool={selectedTool}
                vertices={vertices} setVertices={setVertices}
                edges={edges} setEdges={setEdges}
                errorInfo={errorInfo} setErrorInfo={setErrorInfo}
            />
            {footer}
        </div>
    );
};

export default App;
