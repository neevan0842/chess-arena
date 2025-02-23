import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import useAuthStore from "@/store/useAuthStore";
import { Label } from "@radix-ui/react-label";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router";

const Login = () => {
  const [loginCredentials, setLoginCredentials] = useState({
    username: "",
    password: "",
  });
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      loginCredentials.username.trim() === "" ||
      loginCredentials.password.trim() === ""
    ) {
      toast.error("Please fill in all the fields");
      return;
    }
    try {
      await login(loginCredentials.username, loginCredentials.password);
      if (!useAuthStore.getState().isLoggedIn) {
        toast.error("Invalid username or password");
        return;
      }
      toast.success("Logged in successfully");
      navigate("/");
    } catch (error) {
      toast.error("Login failed");
    }
  };

  useEffect(() => {
    if (useAuthStore.getState().isLoggedIn) {
      navigate("/"); // Redirect to home page if already logged in
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sign in to Play</h1>
        </div>

        {/* Card */}
        <Card>
          <CardContent className="space-y-4 mt-4">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                onChange={(e) =>
                  setLoginCredentials({
                    ...loginCredentials,
                    username: e.target.value,
                  })
                }
                id="username"
                type="text"
                placeholder="username"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                onChange={(e) =>
                  setLoginCredentials({
                    ...loginCredentials,
                    password: e.target.value,
                  })
                }
                id="password"
                type="password"
                placeholder="********"
                required
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-center space-x-2">
              <a href="#" className="text-md underline">
                Forgot password?
              </a>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3">
            {/* Sign In Button */}
            <Button className="w-full" onClick={handleLogin}>
              Sign in
            </Button>

            {/* Divider text */}
            <div className="flex items-center justify-center text-md text-muted-foreground">
              Or continue with
            </div>

            {/* Social Auth Buttons */}
            <div className="flex space-x-2 w-full">
              <Button variant="outline" size="lg" className="flex-1">
                <>
                  <img
                    src="/google-icon.svg"
                    alt="Google Logo"
                    className="h-5 w-5 mr-1"
                  />
                  Google
                </>
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Footer Link */}
        <p className="text-center text-md ">
          Already have an account?
          <Link to="/register" className="underline ml-1">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
