import { useEffect } from"react";
import { Navigate, Outlet } from"react-router-dom";
import { useAppDispatch, useAppSelector } from"../hooks/reduxHooks";
import thunkAuthMe from"../redux/auth/thunk/thunkAuthMe";
import { Spinner } from"@heroui/react";

const PublicOnlyRoute = () => {
  const dispatch = useAppDispatch();
  const { status, user } = useAppSelector((state) => state.auth);

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

  if (status ==="authenticated" && Boolean(user)) return <Navigate to='/' replace />;

  return <Outlet />;
};

export default PublicOnlyRoute;
