export default function Card({ children, className = "" }) {
  return (
    <div
      className={`w-full max-w-full bg-gradient-to-b from-white/5 to-transparent rounded-lg p-4 sm:p-6 shadow-md border border-white/5 ${className}`}
    >
      {children}
    </div>
  );
}
