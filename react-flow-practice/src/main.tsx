import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Home from "./pages/Home";
import Tutorial1 from "./pages/Tutorial1";
import Tutorial2 from "./pages/Tutorial2";
import Tutorial3 from "./pages/Tutorial3";
import CustomNodes from "./pages/CustomNodes";
import CustomEdges from "./pages/CustomEdges";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tutorial1" element={<Tutorial1 />} />
        <Route path="/tutorial2" element={<Tutorial2 />} />
        <Route path="/tutorial3" element={<Tutorial3 />} />
        <Route path="/custom-nodes" element={<CustomNodes />} />
        <Route path="/custom-edges" element={<CustomEdges />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
