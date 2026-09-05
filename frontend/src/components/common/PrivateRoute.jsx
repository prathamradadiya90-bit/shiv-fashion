import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * PrivateRoute — wraps any route that requires authentication.
 * If the user is not logged in, redirects to /login and saves
 * the intended destination as ?redirect= so Login can send
 * them back after a successful sign-in.
 */
const PrivateRoute = ({ children }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!userInfo) {
    // Encode current path so Login.jsx can redirect back after login
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  return children;
};

export default PrivateRoute;
