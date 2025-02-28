import { Route, Routes } from "react-router";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import GoogleCallback from "./components/GoogleCallback";
import Lobby from "./pages/Lobby";
import MultiplayerGame from "./pages/MultiplayerGame";
import AIGame from "./pages/AIGame";
import LobbyAI from "./pages/LobbyAI";
import ProfilePage from "./pages/Profile";

const App = () => {
  return (
    <>
      <Toaster position="top-center" reverseOrder={true} />
      <Routes>
        <Route index element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/multiplayer" element={<MultiplayerGame />} />
          <Route path="/lobbyai" element={<LobbyAI />} />
          <Route path="/ai" element={<AIGame />} />
        </Route>

        {/* Google OAuth callback route */}
        <Route path="/auth/google/callback" element={<GoogleCallback />} />

        {/* Fallback route */}
        <Route path="/not-found" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
