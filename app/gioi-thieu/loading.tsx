export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-16 bg-red-700 animate-pulse" />
      <div className="h-10 bg-red-800 animate-pulse" />
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div className="h-48 bg-red-700 rounded-2xl animate-pulse" />
        <div className="h-32 bg-white rounded-2xl shadow-sm animate-pulse" />
        <div className="h-40 bg-white rounded-2xl shadow-sm animate-pulse" />
      </div>
    </div>
  );
}
