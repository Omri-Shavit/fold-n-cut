import "./App.css";
import LeftPanel from "./leftPanel";
import { Edge, Paper } from "./paper";
import React, { useState } from 'react';
import ErrorIndicator from './ErrorIndicator';

import { Vertex } from "./paper";
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
    const [selectedTool, setSelectedTool] = useState<string>("add-vertex");
    const [vertices, setVertices] = useState<Vertex[]>([]);
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
            <div className="main-content" id="mainContent">
                <Paper
                    selectedTool={selectedTool}
                    vertices={vertices} setVertices={setVertices}
                    errorInfo={errorInfo} setErrorInfo={setErrorInfo}
                />
            </div>
            {footer}
        </div>
    );
};

export default App;
