import "./App.css";
import LeftPanel from "./leftPanel";
import { Paper } from "./paper";
import React, { useState } from 'react';
import ErrorIndicator from './ErrorIndicator';

import { Vertex } from "./paper";
import { ErrorInfo } from "./ErrorIndicator";

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
    const [selectedTool, setSelectedTool] = useState<string>("add-vertex");
    const [vertices, setVertices] = useState<Vertex[]>([]);
    const [errorInfo, setErrorInfo] = useState<ErrorInfo>({
        errorCount: 0,
        errorMessage: ""
    });

    return (
        <div className="app">
            <header>Fold N' Cut</header>
            <ErrorIndicator errorInfo={errorInfo} setErrorInfo={setErrorInfo} />
            <LeftPanel
                selectedTool={selectedTool}
                setSelectedTool={setSelectedTool}
                vertexCount={vertices.length}
            />
            <div className="main-content" id="mainContent">
                <Paper
                    selectedTool={selectedTool}
                    vertices={vertices}
                    setVertices={setVertices}
                />
            </div>
            {footer}
        </div>
    );
};

export default App;
