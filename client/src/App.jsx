import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Navbar from "./components/shared/Navbar";

import Matches from "./pages/Matches";
import Chat from "./pages/Chat";
import AI from "./pages/AI";
import Trips from "./pages/Trips";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

import ProtectedRoute from "./routes/ProtectedRoute";

function App() {

  return (
    <>

      <Navbar />

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/matches" element={<Matches />} />

        <Route path="/chat" element={<Chat />} />

        <Route path="/ai" element={<AI />} />

        <Route path="/trips" element={<Trips />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/protected"
          element={<ProtectedRoute />}
        />

      </Routes>

    </>
  );
}

export default App;