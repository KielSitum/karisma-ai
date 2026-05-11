// Register redirects to Login page (tab=register)
import { Navigate } from 'react-router-dom';
export default function Register() { return <Navigate to="/login?tab=register" replace />; }