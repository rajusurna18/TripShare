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

import VerifyOTP from "./pages/VerifyOTP";

import ResetPassword from "./pages/ResetPassword";

import Expenses from "./pages/Expenses";

import Notifications from "./pages/Notifications";

import Itinerary from "./pages/Itinerary";

import Profile from "./pages/Profile";

import TripDetails from "./pages/TripDetails";

import ProtectedRoute from "./routes/ProtectedRoute";

function App() {

  return (

    <>

      <Navbar />

      <Routes>

        {/* HOME */}

        <Route
          path="/"
          element={<Home />}
        />

        {/* AUTH */}

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
          path="/verify-otp"
          element={<VerifyOTP />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* PROTECTED ROUTES */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>

              <Dashboard />

            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>

              <Profile />

            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>

              <Notifications />

            </ProtectedRoute>
          }
        />

        <Route
          path="/matches"
          element={
            <ProtectedRoute>

              <Matches />

            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>

              <Chat />

            </ProtectedRoute>
          }
        />

        <Route
          path="/ai"
          element={
            <ProtectedRoute>

              <AI />

            </ProtectedRoute>
          }
        />

        <Route
          path="/trips"
          element={
            <ProtectedRoute>

              <Trips />

            </ProtectedRoute>
          }
        />

        <Route
          path="/create-trip"
          element={
            <ProtectedRoute>

              <CreateTrip />

            </ProtectedRoute>
          }
        />

        <Route
          path="/expenses/:tripId"
          element={
            <ProtectedRoute>

              <Expenses />

            </ProtectedRoute>
          }
        />

        <Route
          path="/itinerary"
          element={
            <ProtectedRoute>

              <Itinerary />

            </ProtectedRoute>
          }
        />

        <Route
          path="/trip/:tripId"
          element={
            <ProtectedRoute>

              <TripDetails />

            </ProtectedRoute>
          }
        />

      </Routes>

    </>

  );

}

export default App;