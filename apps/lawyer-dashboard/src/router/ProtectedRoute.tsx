import { useEffect } from"react";
import { Navigate, Outlet } from"react-router-dom";
import { useAppDispatch, useAppSelector } from"../hooks/reduxHooks";
import thunkAuthMe from"../redux/auth/thunk/thunkAuthMe";
import { Spinner } from"@heroui/react";

const ProtectedRoute = () => {
 const dispatch = useAppDispatch();
 const { status } = useAppSelector((state) => state.auth);

 useEffect(() => {
 if (status ==="unknown") {
 dispatch(thunkAuthMe());
 }
 }, [dispatch, status]);

 if (status ==="unknown") {
 return (
 <div className="flex items-center justify-center min-h-screen">
 <Spinner size="lg" color="primary" />
 </div>
 );
 }

 if (status ==="unauthenticated") {
 return <Navigate to="/auth/login" replace />;
 }

 return <Outlet />;
};

export default ProtectedRoute;