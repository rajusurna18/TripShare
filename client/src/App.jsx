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

import Friends
from "./pages/Friends";

import LiveTracking
from "./pages/LiveTracking";

import Reviews
from "./pages/Reviews";

import PublicProfile
from "./pages/PublicProfile";

import JoinRequests
from "./pages/JoinRequests";

import TripMemories
from "./pages/TripMemories";

import Recommendations
from "./pages/Recommendations";

import Discover
from "./pages/Discover";

import SavedTrips from "./pages/SavedTrips";

import Blogs from "./pages/Blogs";
import BlogDetails from "./pages/BlogDetails";
import CreateBlog from "./pages/CreateBlog";
import EditBlog from "./pages/EditBlog";

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

        {/* DASHBOARD */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>

              <Dashboard />

            </ProtectedRoute>
          }
        />

        {/* PROFILE */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>

              <Profile />

            </ProtectedRoute>
          }
        />

        {/* NOTIFICATIONS */}

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>

              <Notifications />

            </ProtectedRoute>
          }
        />

        {/* MATCHES */}

        <Route
          path="/matches"
          element={
            <ProtectedRoute>

              <Matches />

            </ProtectedRoute>
          }
        />

        {/* CHAT */}

        <Route
          path="/chat/:tripId"
          element={
            <ProtectedRoute>

              <Chat />

            </ProtectedRoute>
          }
        />

        {/* LIVE TRACKING */}

        <Route
         path="/live/:tripId"
         element={
          <ProtectedRoute>

            <LiveTracking />

          </ProtectedRoute>
         }
         />

        {/* FALLBACK CHAT */}

        <Route
          path="/chat"
          element={
            <ProtectedRoute>

              <Trips />

            </ProtectedRoute>
          }
        />

        {/* AI */}

        <Route
          path="/ai"
          element={
            <ProtectedRoute>

              <AI />

            </ProtectedRoute>
          }
        />

        <Route
        path="/friends"
        element={
          <ProtectedRoute>

              <Friends />

          </ProtectedRoute>
         }
        />

        {/* TRIPS */}

        <Route
          path="/trips"
          element={
            <ProtectedRoute>

              <Trips />

            </ProtectedRoute>
          }
        />

        {/* CREATE TRIP */}

        <Route
          path="/create-trip"
          element={
            <ProtectedRoute>

              <CreateTrip />

            </ProtectedRoute>
          }
        />

        {/* EXPENSES */}

        <Route
          path="/expenses/:tripId"
          element={
            <ProtectedRoute>

              <Expenses />

            </ProtectedRoute>
          }
        />
        <Route
         path="/expenses"
            element={
          <ProtectedRoute>

             <Trips />

            </ProtectedRoute>
           }
          />

        {/* ITINERARY */}

        <Route
          path="/itinerary"
          element={
            <ProtectedRoute>

              <Itinerary />

            </ProtectedRoute>
          }
        />

        {/* TRIP DETAILS */}

        <Route
          path="/trip/:tripId"
          element={
            <ProtectedRoute>

              <TripDetails />

            </ProtectedRoute>
          }
        />
         {/*review*/}
        <Route
        path="/reviews/:userId"
         element={
          <ProtectedRoute>

             <Reviews />

          </ProtectedRoute>
           }
         />

         <Route
           path="/profile/:userId"
           element={
            <ProtectedRoute>
            <PublicProfile />
           </ProtectedRoute>
            }
          />

      
         <Route
           path="/reviews/:userId"
           element={
             <ProtectedRoute>
               <Reviews />
              </ProtectedRoute>
            }
           />  

          <Route
            path="/join-requests/:tripId"
            element={
             <ProtectedRoute>

              <JoinRequests />

            </ProtectedRoute>
            }
          />  
          <Route
            path="/memories/:tripId"
            element={
              <ProtectedRoute>

                <TripMemories />

              </ProtectedRoute>
            }
          />

        <Route
          path="/discover"
          element={
            <ProtectedRoute>
              <Discover />
            </ProtectedRoute>
          }
        />

        <Route
          path="/saved-trips"
          element={
            <ProtectedRoute>
              <SavedTrips />
            </ProtectedRoute>
          }
        />

        <Route

          path="/recommendations"

          element={

          <ProtectedRoute>

              <Recommendations />

         </ProtectedRoute>

         }

        />

        {/* BLOG MODULE */}
        <Route
          path="/blogs"
          element={<Blogs />}
        />
        <Route
          path="/blog/:id"
          element={<BlogDetails />}
        />
        <Route
          path="/create-blog"
          element={
            <ProtectedRoute>
              <CreateBlog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-blog/:id"
          element={
            <ProtectedRoute>
              <EditBlog />
            </ProtectedRoute>
          }
        />
      </Routes>

    </>

  );

}

export default App;