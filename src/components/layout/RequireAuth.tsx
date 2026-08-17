import { Navigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../app/store';
import { useGetMeQuery } from '../../features/api/authApi';
import { setCredentials } from '../../features/auth/authSlice';
import { useEffect } from 'react';

export function RequireAuth() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  // Always run the query. We skip it if we already have a user.
  const { data, isLoading, isError } = useGetMeQuery(undefined, { skip: isAuthenticated && !!user });

  useEffect(() => {
    if (data && data.id) {
      dispatch(setCredentials({ user: data }));
    }
  }, [data, dispatch]);

  // While checking initial auth
  if (!isAuthenticated && isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--color-bg-main)]">
        <div className="animate-pulse flex flex-col items-center">
          <img src="/favicon.svg" alt="Loading..." className="w-16 h-16 object-contain animate-pulse mb-4" />
          <p className="text-gray-500 font-medium">Loading session...</p>
        </div>
      </div>
    );
  }

  // If check failed or finished without auth
  if (!isAuthenticated && isError) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAuthenticated) {
    // wait for query to finish or fail
    if (!isLoading && !data) {
       return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
}
