import { Navigate, Outlet } from"react-router-dom";
import { useSelector, useDispatch } from"react-redux";
import type { RootState, AppDispatch } from"../redux/store";
import { showErrorToast } from"../utils/toastHelpers";
import { thunkLogOut } from"../redux/auth/authSlice";
import { useEffect, useRef } from"react";
import thunkAuthMe from"../redux/auth/thunk/thunkAuthMe";
import { Spinner } from"@heroui/react";

// T025: AdminRoute now checks cookie-based session via /auth/me on mount.
// Renders null while status is'unknown' to avoid premature redirect flash.
const AdminRoute = () => {
 const dispatch = useDispatch<AppDispatch>();
 const { status, user } = useSelector((state: RootState) => state.auth);
 const hasDenied = useRef(false);

 useEffect(() => {
 if (status ==="unknown") {
 dispatch(thunkAuthMe());
 }
 }, [dispatch, status]);

 useEffect(() => {
 if (status ==="authenticated" && !user?.roles?.includes("Admin") && !hasDenied.current) {
 hasDenied.current = true;
 showErrorToast("غير مصرح لك بالدخول لهذه الصفحة");
 dispatch(thunkLogOut());
 }
 }, [status, user, dispatch]);

 // Wait for /auth/me to resolve
 if (status ==="unknown") {
 return (
 <div className="flex items-center justify-center min-h-screen">
 <Spinner size="lg" color="primary" />
 </div>
 );
 }

 // Not authenticated → redirect to login
 if (status ==="unauthenticated") {
 return <Navigate to="/auth/login" replace />;
 }

 // Authenticated but not Admin → redirect
 if (!user?.roles?.includes("Admin")) {
 return <Navigate to="/auth/login" replace />;
 }

 return <Outlet />;
};

export default AdminRoute;
