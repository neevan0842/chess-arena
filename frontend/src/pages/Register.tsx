import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import useAuthStore from "@/store/useAuthStore";

const Register = () => {
  const [registerCredentials, setRegisterCredentials] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const { register, login } = useAuthStore();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    // Call your register API
    if (
      registerCredentials.username.trim() === "" ||
      registerCredentials.email.trim() === "" ||
      registerCredentials.password.trim() === ""
    ) {
      setError(() => "Please fill in all the fields");
      return;
    }

    try {
      await register(
        registerCredentials.username,
        registerCredentials.email,
        registerCredentials.password
      );
      if (!useAuthStore.getState().isLoggedIn) {
        setError(() => "Registration failed");
        return;
      }
      await login(registerCredentials.username, registerCredentials.password);
      if (!useAuthStore.getState().isLoggedIn) {
        setError(() => "Registration failed");
      } else {
        navigate("/");
        setError(() => "");
      }
    } catch (error) {
      setError(() => `Registration failed: ${error}`);
    }
  };

  useEffect(() => {
    if (useAuthStore.getState().isLoggedIn) {
      navigate("/"); // Redirect to home page if already logged in
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create your account</h1>
        </div>

        <Card>
          <CardContent className="space-y-4 mt-4">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                onChange={(e) =>
                  setRegisterCredentials({
                    ...registerCredentials,
                    username: e.target.value,
                  })
                }
                id="username"
                type="text"
                placeholder="johndoe"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                onChange={(e) =>
                  setRegisterCredentials({
                    ...registerCredentials,
                    email: e.target.value,
                  })
                }
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                onChange={(e) =>
                  setRegisterCredentials({
                    ...registerCredentials,
                    password: e.target.value,
                  })
                }
                minLength={8}
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3">
            {/* Sign Up Button */}
            <Button onClick={handleRegister} className="w-full">
              Sign Up
            </Button>

            {/* Divider text */}
            <div className="flex items-center justify-center text-md text-muted-foreground">
              Or continue with
            </div>

            {/* Google Button */}
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
            {error && <p className="text-red-500">{error}</p>}
          </CardFooter>
        </Card>

        {/* Footer Link */}
        <p className="text-center text-md">
          Already have an account?
          <Link className="ml-1 underline" to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
