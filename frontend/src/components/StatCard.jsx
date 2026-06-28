function StatCard({ value, label }) {
  return (
    <div className="bg-white rounded-3xl border border-yellow-300 shadow p-4 text-center">
      <p className="text-3xl font-bold text-yellow-700">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

export default StatCard;