import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {

  
  const isAuthenticated = localStorage.getItem('isLogged') === 'true';

  return isAuthenticated ? children : <Navigate to="/aviso-login" />;
}

export default PrivateRoute;