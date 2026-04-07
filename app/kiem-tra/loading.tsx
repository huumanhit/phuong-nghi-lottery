export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-16 bg-red-700 animate-pulse" />
      <div className="h-10 bg-red-800 animate-pulse" />
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
        <div className="h-12 bg-white rounded-xl shadow-sm animate-pulse" />
        <div className="h-64 bg-white rounded-xl shadow-sm animate-pulse" />
      </div>
    </div>
  );
}
