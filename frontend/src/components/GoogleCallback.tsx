import useAuthStore from "@/store/useAuthStore";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router";

const GoogleCallback = () => {
  const { googleCallback } = useAuthStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const processOauth = async () => {
      const code = searchParams.get("code");

      try {
        if (code) {
          await googleCallback(code);
          if (useAuthStore.getState().isLoggedIn) {
            toast.success("Logged in successfully");
            navigate("/");
          } else {
            navigate("/login");
          }
        } else {
          toast.error("Google login failed");
          navigate("/login");
        }
      } catch (error) {
        toast.error("Google login failed");
      }
    };
    processOauth();
  }, [navigate, googleCallback, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center space-y-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-dashed border-primary" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    </div>
  );
};

export default GoogleCallback;
