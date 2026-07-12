const AlertBanner = ({ message, type = "error" }) => {
  if (!message) return null;

  const styles =
    type === "error"
      ? "bg-red-50 text-red-600 border-red-100"
      : "bg-green-50 text-green-600 border-green-100";

  return (
    <div className={`rounded-lg border px-4 py-3 text-sm font-medium ${styles}`}>
      {message}
    </div>
  );
};

export default AlertBanner;
