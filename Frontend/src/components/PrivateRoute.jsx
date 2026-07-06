import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) {
    return <Navigate to="/" />;
  }

  return children;
}

export default PrivateRoute;