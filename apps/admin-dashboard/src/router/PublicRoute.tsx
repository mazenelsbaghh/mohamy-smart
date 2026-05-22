import { Navigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import { useEffect, useRef } from "react";
import thunkAuthMe from "../redux/auth/thunk/thunkAuthMe";
import { thunkLogOut } from "../redux/auth/authSlice";
import { Spinner } from "@heroui/react";

const PublicRoute = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { status, user } = useSelector((state: RootState) => state.auth);
  const hasLoggedOut = useRef(false);

  useEffect(() => {
    if (status === "unknown") {
      dispatch(thunkAuthMe());
    }
  }, [dispatch, status]);

  useEffect(() => {
    if (status === "authenticated" && !user?.roles?.includes("Admin") && !hasLoggedOut.current) {
      hasLoggedOut.current = true;
      dispatch(thunkLogOut());
    }
  }, [status, user, dispatch]);

  if (status === "unknown") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (status === "authenticated" && user?.roles?.includes("Admin")) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
