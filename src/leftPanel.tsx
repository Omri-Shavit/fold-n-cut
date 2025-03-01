import React, { useState } from "react";
import '@fortawesome/fontawesome-free/css/all.min.css';

const LeftPanel: React.FC = () => {
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  const hidePanel = () => {
    setPanelCollapsed(true);
  };

  const showPanel = () => {
    setPanelCollapsed(false);
  };
  
  return (
    <div className="container">
      <div className={`side-panel ${panelCollapsed ? "collapsed" : ""}`} id="sidePanel">
        <button className="hide-panel" id="hidePanel" onClick={hidePanel}>
          <i className="fas fa-angle-double-left"></i>
        </button>
        
        <div className="button-row">
          <div className="buttons">
            <button>
              <i className="fas fa-undo"></i>
            </button>
            <button>
              <i className="fas fa-redo"></i>
            </button>
          </div>
        </div>

        <div className="button-row">
          <div className="button-label">Vertices</div>
          <div className="buttons">
            <button>
              <i className="fa-solid fa-plus"></i>
            </button>
            <button>
              <i className="fa-solid fa-arrows"></i>
            </button>
          </div>
        </div>

        <div className="button-row">
          <div className="button-label">Edges</div>
          <div className="buttons">
            <button>
              <i className="fa-solid fa-plus"></i>
            </button>
          </div>
        </div>
      </div>
      
      <button
        className={`show-panel ${panelCollapsed ? "visible" : ""}`}
        id="showPanel"
        onClick={showPanel}
      >
        <i className="fas fa-angle-double-right"></i>
      </button>
    </div>
  );
};

export default LeftPanel; 