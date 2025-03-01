import "./App.css";
import LeftPanel from "./leftPanel";
import { Paper } from "./paper";

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

function App() {
  return (
    <>
      <header>Fold N' Cut</header>
      <LeftPanel />
      <div className="main-content" id="mainContent">
        <Paper/>
      </div>
      {footer}
    </>
  );
}

export default App;
