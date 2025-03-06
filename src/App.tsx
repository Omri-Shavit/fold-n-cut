import "./App.css";
import LeftPanel from "./LeftPanel";
import { Edge, Paper } from "./Paper";
import React, { useState } from 'react';
import ErrorIndicator from './ErrorIndicator';

import { Vertex } from "./Paper";
import { ErrorInfo } from "./ErrorIndicator";

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
