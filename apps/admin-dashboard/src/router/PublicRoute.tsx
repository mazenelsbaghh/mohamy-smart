import { Navigate, Outlet } from"react-router-dom";
import { useSelector, useDispatch } from"react-redux";
import type { RootState, AppDispatch } from"../redux/store";
import { useEffect } from"react";
import thunkAuthMe from"../redux/auth/thunk/thunkAuthMe";
import { Spinner } from"@heroui/react";

const PublicRoute = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { status } = useSelector((state: RootState) => state.auth);

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

  if (status ==="authenticated") {
  return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
