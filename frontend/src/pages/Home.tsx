import { Avatar, AvatarImage } from "@/components/ui/avatar";
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
    <div className="relative flex flex-col min-h-screen">
      {/* Background Section */}
      <div
        className="flex flex-col items-center justify-center flex-grow bg-cover bg-center relative"
        style={{ backgroundImage: "url('/chessLanding.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/60"></div>

        {/* Navbar */}
        <nav className="absolute top-5 left-0 right-0 flex items-center justify-between px-6 md:px-16">
          <h1 className="text-xl md:text-3xl font-bold text-white">
            Chess Arena
          </h1>
          <div className="flex space-x-2 md:space-x-4">
            {authorised ? (
              <>
                <Avatar
                  onClick={() =>
                    navigate(
                      `/profile/${useAuthStore.getState().user?.username}`
                    )
                  }
                  className="w-10 h-10 rounded-full border-2 border-gray-300 shadow-sm overflow-hidden bg-white cursor-pointer"
                >
                  <AvatarImage
                    src="/profile.png"
                    alt="User Avatar"
                    className="object-cover w-full h-full"
                  />
                </Avatar>

                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="text-sm md:text-base px-4 py-2"
                >
                  Logout
                </Button>
              </>
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
            <Button variant="customWhite" onClick={() => navigate("/lobbyai")}>
              Play with Bot
            </Button>
            <Button variant="customWhite" onClick={() => navigate("/lobby")}>
              Play with Others
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-5 left-1/2 transform -translate-x-1/2  text-white text-center text-xs md:text-sm px-4 py-2 rounded-md">
        <p>
          <a
            href="https://github.com/neevan0842/chess-arena"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-gray-300 hover:text-gray-100"
          >
            Contribute on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
};

export default Home;
