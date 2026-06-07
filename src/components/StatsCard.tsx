interface StatsCardProps {
  value: number | string;
  label: string;
  icon: React.ReactNode;
  highlight?: boolean;
}

export default function StatsCard({ value, label, icon, highlight }: StatsCardProps) {
  return (
    <div
      className={`bg-white rounded-xl p-4 shadow-sm border ${
        highlight ? "border-[#4338ca]/20" : "border-gray-100"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-bold text-[#111827]">{value}</p>
          <p className="text-xs text-[#6b7280] mt-1">{label}</p>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  );
}
