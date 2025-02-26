import { Button } from "@/components/ui/button";
import useAuthStore from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

const Home = () => {
  const navigate = useNavigate();
  const [authorised, setAuthorised] = useState(false);
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    if (!useAuthStore.getState().isLoggedIn) {
      setAuthorised(() => false);
      toast.success("Logged out successfully");
    } else {
      setAuthorised(() => true);
      toast.error("Logout failed");
    }
  };

  useEffect(() => {
    setAuthorised(() => useAuthStore.getState().isLoggedIn);
  }, []);

  return (
    <div>
      <div
        className="relative flex min-h-screen flex-col items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('/chessLanding.jpg')" }}
      >
        {/* Overlay for better text visibility */}
        <div className="absolute inset-0 bg-black/60"></div>

        {/* Navbar */}
        <nav className="absolute top-5 left-0 right-0 flex items-center justify-between px-6 md:px-16">
          <h1 className="text-xl md:text-3xl font-bold text-white">
            Chess Arena
          </h1>
          <div className="flex space-x-2 md:space-x-4">
            {authorised ? (
              <Button
                variant="outline"
                onClick={handleLogout}
                className="text-sm md:text-base px-4 py-2"
              >
                Logout
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="text-sm md:text-base px-4 py-2"
                >
                  Login
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/register")}
                  className="text-sm md:text-base px-4 py-2"
                >
                  Register
                </Button>
              </>
            )}
          </div>
        </nav>

        {/* Main Content */}
        <div className="relative z-10 text-center text-white space-y-6">
          <h2 className="text-4xl md:text-6xl font-bold">
            Welcome to Chess Arena
          </h2>
          <p className="text-lg md:text-xl text-gray-300">
            Play chess online with friends or challenge our AI.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Button variant="customWhite" onClick={() => navigate("/ai")}>
              Play with Bot
            </Button>
            <Button variant="customWhite" onClick={() => navigate("/lobby")}>
              Play with Others
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
