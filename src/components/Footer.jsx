import React from "react";
import { Home, List, Users, BarChart2 } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: "/", label: "Home", icon: <Home size={22} /> },
    { id: "/task", label: "Task", icon: <List size={22} /> },
    { id: "/referral", label: "Referral", icon: <Users size={22} /> },
    { id: "/leaderboard", label: "Leaderboard", icon: <BarChart2 size={22} /> },
  ];

  return (
    <div className="fixed left-0 right-0 bottom-0 h-20 bg-gradient-to-b from-black/70 to-black/90 border-t border-white/5 flex items-center justify-center z-50">
      <div className="max-w-md w-full flex justify-between px-4">
        {tabs.map((t) => {
          const active = location.pathname === t.id;
          return (
            <motion.div
              key={t.id}
              className={`flex flex-col items-center gap-1 cursor-pointer text-xs ${active ? "text-[#00f6e6]" : "text-white/60"}`}
              onClick={() => navigate(t.id)}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={active ? { y: -4, scale: 1.05 } : { y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                {t.icon}
              </motion.div>
              <div>{t.label}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
