import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
      <p className="text-sm font-semibold text-primary-600">404</p>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">Page not found</h1>
      <p className="mt-2 text-sm text-gray-500">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link to="/" className="btn-primary mt-6">
        Go back home
      </Link>
    </div>
  );
};

export default NotFound;
