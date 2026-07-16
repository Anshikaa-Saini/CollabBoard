/**
 * Full-page centered spinner. Replaces several copies of this same spinner
 * markup that used to be duplicated across App.jsx, ProtectedRoute.jsx, and
 * Room.jsx.
 */
const PageLoader = ({ label }) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-100 border-t-primary-600" />
      {label && <p className="text-sm text-gray-400">{label}</p>}
    </div>
  );
};

export default PageLoader;
