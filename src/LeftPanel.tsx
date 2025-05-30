import React, { useState, useEffect } from "react";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { HistoryManager } from "./history";

const hotkeyMap = {
    "add-vertex": "A",
    "move-vertex": "S",
    "add-edge": "Space",
    "undo": "Ctrl+Z",
    "redo": "Ctrl+Shift+Z"
};

function undo(historyManagerRef: React.RefObject<HistoryManager>) {
    historyManagerRef.current?.undo();
}

function redo(historyManagerRef: React.RefObject<HistoryManager>) {
    historyManagerRef.current?.redo();
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

const undoRedoRow = (
    { historyManagerRef }:
    { historyManagerRef: React.RefObject<HistoryManager> }
) => {
    // Check if undo/redo is possible
    const canUndo = historyManagerRef.current?.canUndo() || false;
    const canRedo = historyManagerRef.current?.canRedo() || false;
    
    return (
        <div className="button-row">
            <div className="buttons">
                <button 
                    className={`tooltip-container ${!canUndo ? "disabled" : ""}`} 
                    onClick={() => undo(historyManagerRef)}
                    disabled={!canUndo}
                >
                    <i className="fas fa-undo"></i>
                    <span className="tooltip">
                        Undo
                        <br />
                        <strong>Hotkey: {hotkeyMap["undo"]}</strong>
                        {!canUndo && <br />}
                        {!canUndo && <span>Nothing to undo</span>}
                    </span>
                </button>
                <button 
                    className={`tooltip-container ${!canRedo ? "disabled" : ""}`} 
                    onClick={() => redo(historyManagerRef)}
                    disabled={!canRedo}
                >
                    <i className="fas fa-redo"></i>
                    <span className="tooltip">
                        Redo
                        <br />
                        <strong>Hotkey: {hotkeyMap["redo"]}</strong>
                        {!canRedo && <br />}
                        {!canRedo && <span>Nothing to redo</span>}
                    </span>
                </button>
            </div>
        </div>
    );
}

interface LeftPanelProps {
    selectedTool: string;
    setSelectedTool: (tool: string) => void;
    vertexCount: number;
    historyManagerRef: React.RefObject<HistoryManager>;
}

const LeftPanel: React.FC<LeftPanelProps> = (
    { selectedTool, setSelectedTool, vertexCount, historyManagerRef }
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
                undo(historyManagerRef);
                return;
            }

            // Handle Ctrl+Shift+Z for redo
            if (e.ctrlKey && e.shiftKey && key === 'Z') {
                e.preventDefault();
                redo(historyManagerRef);
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
                } else if (key === ' ' && vertexCount >= 2) { // Check for spacebar
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
                {undoRedoRow({ historyManagerRef })}
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