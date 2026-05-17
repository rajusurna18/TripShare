import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { Toaster } from "react-hot-toast";

import App from "./App";

import "./App.css";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import "@fortawesome/fontawesome-free/css/all.min.css";

ReactDOM.createRoot(
  document.getElementById("root")
).render(

  <React.StrictMode>

    <BrowserRouter>

      <Toaster
        position="top-right"

        toastOptions={{

          style: {

            background: "#111827",

            color: "#ffffff",

            border:
              "1px solid rgba(255,193,7,0.25)",

            padding: "14px 18px",

            borderRadius: "14px",
          },

          success: {

            iconTheme: {

              primary: "#ffc107",

              secondary: "#111827",
            },
          },

          error: {

            iconTheme: {

              primary: "#ef4444",

              secondary: "#111827",
            },
          },

        }}
      />

      <App />

    </BrowserRouter>

  </React.StrictMode>

);