import React, { useState, useEffect } from "react";
import '@fortawesome/fontawesome-free/css/all.min.css';

// Define the global interface for LeftPanelProps
interface LeftPanelProps {
    selectedTool: string;
    setSelectedTool: (tool: string) => void;
    vertexCount: number;
}

const hotkeyMap = {
    "add-vertex": "A",
    "move-vertex": "S",
    "add-edge": "E",
    "undo": "Ctrl+Z",
    "redo": "Ctrl+Shift+Z"
};

function undo() {
    // TODO: Implement undo
    console.log("Undo action triggered");
}

function redo() {
    // TODO: Implement redo
    console.log("Redo action triggered");
}

const verticesRow = (
    { selectedTool, setSelectedTool }:
        { selectedTool: string, setSelectedTool: (tool: string) => void }
) => {
    return (
        <div className="button-row">
            <div className="button-label">Vertices</div>
            <div className="btn-group" role="group">
                <input
                    type="radio"
                    className="btn-check"
                    name="tool-options"
                    id="add-vertex"
                    value="add-vertex"
                    checked={selectedTool === "add-vertex"}
                    onChange={() => setSelectedTool("add-vertex")}
                />
                <label className="btn tooltip-container" htmlFor="add-vertex">
                    <i className="fa-solid fa-plus"></i>
                    <span className="tooltip">
                        Add Vertex
                        <br />
                        <strong>Hotkey: {hotkeyMap["add-vertex"]}</strong>
                    </span>
                </label>

                <input
                    type="radio"
                    className="btn-check"
                    name="tool-options"
                    id="move-vertex"
                    value="move-vertex"
                    checked={selectedTool === "move-vertex"}
                    onChange={() => setSelectedTool("move-vertex")}
                />
                <label className="btn tooltip-container" htmlFor="move-vertex">
                    <i className="fa-solid fa-arrows"></i>
                    <span className="tooltip">
                        Move Vertex
                        <br />
                        <strong>Hotkey: {hotkeyMap["move-vertex"]}</strong>
                    </span>
                </label>
            </div>
        </div>
    );
}

const edgesRow = (
    { selectedTool, setSelectedTool, vertexCount }:
        { selectedTool: string, setSelectedTool: (tool: string) => void, vertexCount: number }
) => {
    const disabled = vertexCount < 2;

    return (
        <div className="button-row">
            <div className="button-label">Edges</div>
            <div className="btn-group" role="group">
                <input
                    type="radio"
                    className="btn-check"
                    name="tool-options"
                    id="add-edge"
                    value="add-edge"
                    checked={selectedTool === "add-edge"}
                    onChange={() => setSelectedTool("add-edge")}
                    disabled={disabled}
                />
                <label
                    className={`btn tooltip-container ${disabled ? "disabled" : ""}`}
                    htmlFor="add-edge"
                >
                    <i className="fa-solid fa-plus"></i>
                    <span className="tooltip">
                        Add Edge
                        <br />
                        <strong>Hotkey: {hotkeyMap["add-edge"]}</strong>
                        {disabled && <br />}
                        {disabled && <span>Need at least 2 vertices</span>}
                    </span>
                </label>
            </div>
        </div>
    );
}

const undoRedoRow = () => {
    return (
        <div className="button-row">
            <div className="buttons">
                <button className="tooltip-container" onClick={undo}>
                    <i className="fas fa-undo"></i>
                    <span className="tooltip">
                        Undo
                        <br />
                        <strong>Hotkey: {hotkeyMap["undo"]}</strong>
                    </span>
                </button>
                <button className="tooltip-container" onClick={redo}>
                    <i className="fas fa-redo"></i>
                    <span className="tooltip">
                        Redo
                        <br />
                        <strong>Hotkey: {hotkeyMap["redo"]}</strong>
                    </span>
                </button>
            </div>
        </div>
    );
}

const LeftPanel: React.FC<LeftPanelProps> = (
    { selectedTool, setSelectedTool, vertexCount }
) => {
    const [panelCollapsed, setPanelCollapsed] = useState(false);

    const hidePanel = () => {
        setPanelCollapsed(true);
    };

    const showPanel = () => {
        setPanelCollapsed(false);
    };

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Convert key to uppercase for case-insensitive comparison
            const key = e.key.toUpperCase();

            // Handle Ctrl+Z for undo
            if (e.ctrlKey && !e.shiftKey && key === 'Z') {
                e.preventDefault();
                undo();
                return;
            }

            // Handle Ctrl+Shift+Z for redo (changed from Ctrl+Y)
            if (e.ctrlKey && e.shiftKey && key === 'Z') {
                e.preventDefault();
                redo();
                return;
            }

            // Handle single key shortcuts (only when not typing in an input)
            if (!e.ctrlKey && !e.altKey && !e.metaKey &&
                !(e.target instanceof HTMLInputElement) &&
                !(e.target instanceof HTMLTextAreaElement)) {

                // Check for tool hotkeys
                if (key === hotkeyMap["add-vertex"].toUpperCase()) {
                    setSelectedTool("add-vertex");
                } else if (key === hotkeyMap["move-vertex"].toUpperCase()) {
                    setSelectedTool("move-vertex");
                } else if (key === hotkeyMap["add-edge"].toUpperCase() && vertexCount >= 2) {
                    setSelectedTool("add-edge");
                }
            }
        };

        // Add event listener
        window.addEventListener('keydown', handleKeyDown);

        // Clean up
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [setSelectedTool, vertexCount]); // Add vertexCount to dependencies

    return (
        <div className="container">
            <div className={`side-panel ${panelCollapsed ? "collapsed" : ""}`} id="sidePanel">
                {undoRedoRow()}
                {verticesRow({ selectedTool, setSelectedTool })}
                {edgesRow({ selectedTool, setSelectedTool, vertexCount })}
            </div>
            {!panelCollapsed ? (
                <button
                    className="hide-panel tooltip-container"
                    id="hidePanel"
                    onClick={hidePanel}
                >
                    <i className="fas fa-angle-double-left"></i>
                    <span className="tooltip tooltip-right">Hide Panel</span>
                </button>
            ) : (
                <button
                    className="show-panel tooltip-container"
                    id="showPanel"
                    onClick={showPanel}>
                    <i className="fas fa-angle-double-right"></i>
                    <span className="tooltip tooltip-right">Show Panel</span>
                </button>
            )}
        </div>
    );
};

export default LeftPanel; 