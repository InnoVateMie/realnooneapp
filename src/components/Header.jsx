import React from "react";
import { Globe } from "lucide-react";
import avatar from "../assets/avatar.jpg";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between gap-3 sm:gap-4 px-5 sm:px-0 pt-7 sm:pt-6 pb-4 bg-black/90 backdrop-blur-md border-b border-white/10">
      
      {/* User info */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-white/10">
          <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
        </div>
        <div>
          <h3 className="text-xs sm:text-sm font-medium text-white/80">Hi, NO-ONE</h3>
        </div>
      </div>

      {/* Wallet + Globe */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button className="bg-[#00f6e6] text-black text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-md flex items-center gap-1 sm:gap-2">
          Connect Wallet
        </button>
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 flex items-center justify-center border border-[#00f6e6]">
          <Globe size={16} color="#00f6e6" />
        </div>
      </div>
    </header>
  );
}
