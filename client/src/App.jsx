import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Matches from "./pages/Matches";
import Chat from "./pages/Chat";
import AI from "./pages/AI";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/ai" element={<AI />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;