import { Route, Routes } from "react-router";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Chess from "./pages/Chess";
import GoogleCallback from "./components/GoogleCallback";

const App = () => {
  return (
    <>
      <Toaster position="top-center" reverseOrder={true} />
      <Routes>
        <Route index element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/chess" element={<Chess />} />
        </Route>

        {/* Google OAuth callback route */}
        <Route path="/auth/google/callback" element={<GoogleCallback />} />

        {/* Fallback route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
