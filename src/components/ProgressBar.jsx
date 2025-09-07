export default function ProgressBar({ percent = 65 }) {
  return (
    <div className="w-full mt-3">
      <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
        <span
          className="block h-full rounded-full bg-gradient-to-r from-[#00f6e6] to-[#00e38f] transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
