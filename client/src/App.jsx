import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Navbar from "./components/shared/Navbar";

import Matches from "./pages/Matches";
import Chat from "./pages/Chat";
import AI from "./pages/AI";
import Trips from "./pages/Trips";
import Dashboard from "./pages/Dashboard";
import CreateTrip from "./pages/CreateTrip";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

import Expenses from "./pages/Expenses";

import ProtectedRoute from "./routes/ProtectedRoute";

import Notifications from "./pages/Notifications";

function App() {

  return (

    <>

      <Navbar />

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
  path="/notifications"
  element={<Notifications />}
       />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/matches"
          element={<Matches />}
        />

        <Route
          path="/chat"
          element={<Chat />}
        />

        <Route
          path="/ai"
          element={<AI />}
        />

        <Route
          path="/trips"
          element={<Trips />}
        />

        <Route
          path="/create-trip"
          element={<CreateTrip />}
        />

        <Route
          path="/expenses/:tripId"
          element={<Expenses />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

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