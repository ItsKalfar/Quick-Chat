import { Link } from "react-router-dom";

export const PageNotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404 - Not Found</h1>
        <p className="mt-4">The page you are looking for does not exist.</p>
        <p className="mt-4">
          <Link to="/" className="text-blue-500 hover:underline">
            Go back to the homepage
          </Link>
        </p>
      </div>
    </div>
  );
};
