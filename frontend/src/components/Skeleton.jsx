/**
 * Generic pulsing placeholder block for skeleton loading states.
 * Usage: <Skeleton className="h-4 w-32" />
 */
const Skeleton = ({ className = "" }) => <div className={`animate-pulse rounded-md bg-gray-100 ${className}`} />;

export default Skeleton;
