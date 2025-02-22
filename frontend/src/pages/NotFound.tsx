import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router";

const NotFound = () => {
  return (
    <div>
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">404</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Oops! The page you are looking for does not exist.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link to="/">
              <Button>Go back home</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
