import { Navigate } from "react-router-dom";
import { useAuhth, useAuth } from "../context/AuthContext";

const ProtectedRoute = ({children}) => {
    const {isAuthenticated, user} = useAuth();
    if(!isAuthenticated) return <Navigate to="/login" />;

    if(allowedRoles && !allowedRoles.includes(user.role)){
        return <Navigate to="/dashboard" />; 
    }
    return children;
}

export default ProtectedRoute;