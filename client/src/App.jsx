import { Routes, Route, useLocation, Outlet } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "./components/shared/PageTransition";

import Home from "./pages/Home";
import Navbar from "./components/shared/Navbar";
import ProtectedRoute from "./routes/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";

// Statically loaded routes (frequently used/layout/auth)
import Matches from "./pages/Matches";
import Chat from "./pages/Chat";
import Trips from "./pages/Trips";
import CreateTrip from "./pages/CreateTrip";
import Notifications from "./pages/Notifications";
import Itinerary from "./pages/Itinerary";
import Profile from "./pages/Profile";
import TripDetails from "./pages/TripDetails";
import Friends from "./pages/Friends";
import LiveTracking from "./pages/LiveTracking";
import Reviews from "./pages/Reviews";
import PublicProfile from "./pages/PublicProfile";
import JoinRequests from "./pages/JoinRequests";
import Recommendations from "./pages/Recommendations";
import Discover from "./pages/Discover";

// Lazy loaded heavy routes
const About = lazy(() => import("./pages/About"));
const Features = lazy(() => import("./pages/Features"));
const Contact = lazy(() => import("./pages/Contact"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AI = lazy(() => import("./pages/AI"));
const Blogs = lazy(() => import("./pages/Blogs"));
const BlogDetails = lazy(() => import("./pages/BlogDetails"));
const CreateBlog = lazy(() => import("./pages/CreateBlog"));
const EditBlog = lazy(() => import("./pages/EditBlog"));
const TripMemories = lazy(() => import("./pages/TripMemories"));
const Expenses = lazy(() => import("./pages/Expenses"));
const AIPackingList = lazy(() => import("./pages/AIPackingList"));
const AIExpenses = lazy(() => import("./pages/AIExpenses"));
const SavedTrips = lazy(() => import("./pages/SavedTrips"));
const Timeline = lazy(() => import("./pages/Timeline"));

// Fallback Skeleton Loader
const PageSkeleton = () => (
  <div className="container py-5 mt-5 text-light text-center" style={{ minHeight: "80vh" }}>
    <div className="glass-card p-5 mx-auto" style={{ maxWidth: "800px", borderRadius: "24px", background: "rgba(25, 25, 25, 0.45)", backdropFilter: "blur(12px)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
      <div className="spinner-border text-warning mb-4" style={{ width: "3.5rem", height: "3.5rem" }} />
      <h3 className="fw-bold text-white mb-2">Loading trip details...</h3>
      <p className="text-secondary small mb-4">Please wait while we prepare your space</p>
      
      <div className="d-flex flex-column gap-3 align-items-center mt-5">
        <div className="bg-secondary bg-opacity-20 rounded skeleton-shimmer" style={{ width: "90%", height: "24px" }} />
        <div className="bg-secondary bg-opacity-20 rounded skeleton-shimmer" style={{ width: "70%", height: "16px" }} />
        <div className="bg-secondary bg-opacity-20 rounded skeleton-shimmer" style={{ width: "80%", height: "16px" }} />
        <div className="bg-secondary bg-opacity-20 rounded skeleton-shimmer" style={{ width: "50%", height: "16px" }} />
      </div>
    </div>
  </div>
);

const AnimatedLayout = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <PageTransition key={location.pathname}>
        <Outlet />
      </PageTransition>
    </AnimatePresence>
  );
};

function App() {

  return (

    <>

      <Navbar />

      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route element={<AnimatedLayout />}>

        {/* HOME */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/features"
          element={<Features />}
        />

        <Route
          path="/contact"
          element={<Contact />}
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
          path="/packing-list/:tripId"
          element={
            <ProtectedRoute>
              <AIPackingList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expense-ai/:tripId"
          element={
            <ProtectedRoute>
              <AIExpenses />
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

        <Route
          path="/timeline/:tripId"
          element={
            <ProtectedRoute>

              <Timeline />

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
          </Route>
        </Routes>
      </Suspense>

    </>

  );

}

export default App;