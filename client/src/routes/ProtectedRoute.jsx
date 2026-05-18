import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {

  const token =
    localStorage.getItem("token");

  // IF USER NOT LOGGED IN

  if (!token) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }

  // ALLOW ACCESS

  return children;

}

export default ProtectedRoute;