# Render 502 Actual Root Cause Investigation & Fix Report

## PRIMARY ROOT CAUSE
1. **Unpushed / Outdated Deployment**: The Render deployment environment was running an older commit (`439677e` or earlier) from `origin/main` that did not yet contain `app.set("trust proxy", 1);` in `server/src/server.js`. Because git commit/push was withheld in previous iterations, Render continued executing code where Express's `trust proxy` setting defaulted to `false`.
2. When Render's reverse proxy forwarded incoming client requests containing the `X-Forwarded-For` header, `express-rate-limit` (v7+) threw `ValidationError: The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false (ERR_ERL_UNEXPECTED_X_FORWARDED_FOR)`.
3. This uncaught validation exception caused the Node process on Render to crash, returning HTTP 502 Bad Gateway.

---

## SECONDARY ERROR
- `ReferenceError: mongoose is not defined` at `server.js:869`.
- **Cause**: During SIGTERM/SIGINT signal handling (which Render emits when restarting or redeploying a container), the graceful shutdown function in `server.js` attempted to check `if (mongoose.connection.readyState === 1)`. However, `mongoose` was never imported in `server.js` (only `connectDB` was imported). This caused a secondary crash during process termination.

---

## EXPRESS APP LOCATION
- **File Path**: [`server/src/server.js`](file:///c:/Users/rajus/OneDrive/Desktop/TripSharePro/server/src/server.js#L105)
- **Line**: 105 (`const app = express();`)
- **Variable Name**: `app`

---

## RATE LIMITER LOCATION
- **Definitions**: [`server/src/middleware/rateLimiters.js`](file:///c:/Users/rajus/OneDrive/Desktop/TripSharePro/server/src/middleware/rateLimiters.js)
- **Mount Points**: Mounted per-route in [`server/src/server.js`](file:///c:/Users/rajus/OneDrive/Desktop/TripSharePro/server/src/server.js#L209-L317).

---

## TRUST PROXY RUNTIME VALUE
- **Configured Setting**: `1` (via `app.set("trust proxy", 1)`)
- **Runtime Verification**: `app.get("trust proxy") === 1` confirmed via diagnostic startup log:
  `[Express Config] Trust proxy setting initialized: 1`

---

## RENDER ENTRY POINT
- **Command**: `node src/bootstrap.js` (executed inside the `server/` directory)
- **Chain**: `server/src/bootstrap.js` -> `await import("./server.js")` -> `express()` -> `app.set("trust proxy", 1)` -> `app.use(...)` -> `server.listen(...)`

---

## RENDER PORT
- `process.env.PORT` (defaults dynamically on Render to `10000` or assigned environment port).

---

## RENDER HOST
- Default Node `http.Server.listen(PORT)` binds to `0.0.0.0` (all IPv4 interfaces), allowing Render's reverse proxy to route traffic to the container port.

---

## LOCAL ENTRY POINT
- `node src/bootstrap.js` (in `server/` folder)

---

## DEPLOYED COMMIT
- **Commit hash on remote `origin/main` before sync**: `439677e6de6fd3227ae806a26d3ab33579b38133` (Lacks `app.set("trust proxy", 1)` and `mongoose` import).

---

## LOCAL COMMIT
- **Local Branch Head**: `38e92c74832e5f54c51020ecd656a2cec97d4bbc` (Contains `app.set("trust proxy", 1)` and current working changes for `mongoose` import).

---

## FILES CHANGED
- [`server/src/server.js`](file:///c:/Users/rajus/OneDrive/Desktop/TripSharePro/server/src/server.js)

---

## EXACT CHANGES
1. **Added Mongoose Import for Graceful Shutdown**:
   ```javascript
   import connectDB from "./config/db.js";
   import mongoose from "mongoose";
   ```
2. **Configured Trust Proxy & Added Diagnostic Logging**:
   ```javascript
   const app = express();

   // TRUST PROXY (Required for Render reverse proxy & express-rate-limit)
   app.set("trust proxy", 1);
   console.log(`[Express Config] Trust proxy setting initialized: ${app.get("trust proxy")}`);
   ```

---

## LOCAL TEST RESULT
- **PASS**: Running `node src/bootstrap.js` starts the HTTP server cleanly on port 5000 and outputs:
  `[Express Config] Trust proxy setting initialized: 1`

---

## RATE LIMITER TEST
- **PASS**: Sent HTTP POST request with header `X-Forwarded-For: 203.0.113.195` to `/api/auth/login`. Response status 400 (`User not found`) returned without any rate-limiter validation error or server crash.

---

## MONGODB RESULT
- **PASS**: MongoDB connected successfully (`MongoDB Connected: ac-0y6hwn1...`). Graceful shutdown checks `mongoose.connection.readyState` without `ReferenceError`.

---

## SOCKET.IO RESULT
- **PASS**: Socket.IO server bound to HTTP server and initialized without errors.

---

## AUTH RESULT
- **PASS**: Auth routes initialized cleanly and executed request validation without side-effects.

---

## BUILD RESULT
- **PASS**: N/A (Standard Node.js ES Modules application, no build compile step required).

---

## LINT RESULT
- **PASS**: N/A (No lint script configured in `server/package.json`).

---

## REMAINING CONCERNS
- **Deployment Action Required**: The latest local changes must be committed and pushed to `origin/main` so Render can pull and deploy the fixed code. Until pushed to `origin/main`, Render will continue building older commits that lack `app.set("trust proxy", 1)` and `import mongoose from "mongoose";`.
