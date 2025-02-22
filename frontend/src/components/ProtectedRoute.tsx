import { Navigate, Outlet } from "react-router";
import useAuthStore from "../store/useAuthStore";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";

interface JwtPayload {
  exp: number;
  id: string;
}

function ProtectedRoute() {
  const { accessToken, refreshAccessToken } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const auth = async () => {
      if (!accessToken) {
        setIsAuthorized(false);
        return;
      }
      try {
        const decoded = jwtDecode<JwtPayload>(accessToken);
        const tokenExpiration = decoded.exp;
        const now = Date.now() / 1000;
        if (tokenExpiration < now) {
          // Token expired; try to refresh using the backend endpoint.
          await refreshAccessToken();
          const newToken = useAuthStore.getState().accessToken;
          if (newToken) {
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
          }
        } else {
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error("Authorization error:", error);
        setIsAuthorized(false);
      }
    };

    auth();
  }, [accessToken, refreshAccessToken]);

  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  return isAuthorized ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoute;
