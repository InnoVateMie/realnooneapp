import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import Card from "../components/Card";
import ProgressBar from "../components/ProgressBar";
import avatar from "../assets/avatar.jpg";
import tonLogo from "../assets/ton-logo.svg";
import miningAnimation from "../assets/mining.json";
import { GiHorseHead } from "react-icons/gi";
import { Clipboard } from "lucide-react";
import starAnimation from "../assets/star.json";
import useDashboardFunc from "../hooks/useDashboardFunc";
import ShadowIcon from "../assets/shadow.png";

export default function Dashboard() {
  const {
    user,
    loading,
    progress,
    mineCounter,
    sessionTime,
    startMining,
    claimDailyBonus,
    bonusCountdown,
    transactions,
    NON_TO_TON,
  } = useDashboardFunc();

  const [copied, setCopied] = useState(false);
  const [pause, setPause] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [bonusClaimed, setBonusClaimed] = useState(false);

  // format countdown
  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        "t.me/realnoonebot=start/29fj984ty06h0k90999.noone"
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const handleClaimBonus = async () => {
  const success = await claimDailyBonus();
  if (success) {
    setBonusClaimed(true);
    setTimeout(() => {
      setBonusClaimed(false);
      setShowBonusModal(false);
    }, 2000);
  }
};


  useEffect(() => {
    let count = 0;
    const interval = setInterval(() => {
      count++;
      if (count % 2 === 0) {
        setPause(true);
        setTimeout(() => setPause(false), 3000);
      }
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <>
      {/* Top Center Popup */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-lg z-50"
          >
            Copied!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Bonus Modal */}
<AnimatePresence>
  {showBonusModal && (
    <motion.div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="bg-gradient-to-t from-[#1c1c1c] to-[#0d0d0d] p-6 rounded-2xl shadow-xl w-80 text-center text-white"
      >
        <h2 className="text-lg font-bold mb-2">🎁 Daily Bonus</h2>
        <p className="text-sm text-white/70 mb-4">
          Claim your reward for today and boost your $NON balance!
        </p>

        {bonusClaimed ? (
          <div className="flex flex-col items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-green-400 font-semibold"
            >
              ✅ Bonus Claimed!
            </motion.div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowBonusModal(false)}
                className="bg-red-600 text-white font-semibold px-4 py-2 rounded-full shadow-md hover:scale-105 transition-transform"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleClaimBonus}
              disabled={bonusCountdown > 0}
              className={`px-4 py-2 rounded-full shadow-md font-semibold transition-transform ${
                bonusCountdown > 0
                  ? "bg-gray-600 text-white/60 cursor-not-allowed"
                  : "bg-[#00f6e6] text-black hover:scale-105"
              }`}
            >
              {bonusCountdown > 0 ? `Wait ${formatTime(bonusCountdown)}` : "Claim Now"}
            </button>

            <button
              onClick={() => setShowBonusModal(false)}
              className="bg-red-600 text-white font-semibold px-4 py-2 rounded-full shadow-md hover:scale-105 transition-transform"
            >
              Close
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>


      <div className="flex flex-col gap-4">
        {/* Subtitle with marquee */}
        <div className="overflow-hidden whitespace-nowrap relative">
          <motion.div
            animate={pause ? {} : { x: ["100%", "-100%"] }}
            transition={
              pause ? {} : { duration: 10, ease: "linear", repeat: Infinity }
            }
            className={`text-xs font-mono font-semibold ${
              pause ? "animate-flash" : "text-white/70"
            }`}
          >
            From NOTHING to NO-ONE = builders of NOTCOIN | From NOTHING to
            NO-ONE = builders of NOTCOIN
          </motion.div>
        </div>

        {/* Wallet Card */}
        <Card className="flex flex-col gap-4 p-4 sm:p-6 border border-white/14 bg-gradient-to-t from-[#2a2a2aa4] to-[#0d0d0d]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-lg font-bold">
                <span>
                  {user?.balance ?? 0} <span className="text-xs">NON</span>
                </span>
                <span className="flex items-center gap-1 text-sm font-medium">
                  ≈
                  <motion.img
                    src={tonLogo}
                    alt="TON"
                    className="w-4 h-4"
                    animate={{ rotate: [0, 360] }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: "linear",
                    }}
                  />
                  {(user?.balance * NON_TO_TON).toFixed(6)} TON
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
  <span>(1 NON = {NON_TO_TON} TON)</span>
  <span className="flex items-center gap-1">
    <img 
      src={ShadowIcon} 
      alt="Shadow" 
      className="w-5 h-5 object-contain"
    />
    Shadow
  </span>
</div>
            </div>

            {/* Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-800 flex items-center justify-center border-2 border-white/20 overflow-hidden">
              <img
                src={avatar}
                alt="avatar"
                className="w-14 h-14 sm:w-18 sm:h-18 rounded-full object-cover"
              />
            </div>
          </div>

          {/* Mining + Progress */}
          <div className="flex items-center gap-3 mt-2 min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 flex-shrink-0">
                <Lottie animationData={miningAnimation} loop={true} />
              </div>
              <div className="text-[#00f6e6] font-bold text-sm">
              +{mineCounter}
              </div>
            </div>
            <div className="flex-1 min-w-0 -mt-3">
              <ProgressBar percent={progress} />
            </div>
          </div>
        </Card>

        {/* Mine $NON Button */}
        <div className="flex justify-end">
          {sessionTime > 0 ? (
            <button className="relative bg-[#00f6e6] text-black text-xs font-bold px-4 py-2 rounded-full shadow-md animate-pulse transition-transform duration-150 active:scale-90 overflow-hidden">
              ⏳ {formatTime(sessionTime)}
            </button>
          ) : (
            <button
              onClick={startMining}
              className="relative bg-[#00f6e6] text-black text-xs font-medium px-4 py-2 rounded-full shadow-md animate-breathing transition-transform duration-150 active:scale-90 overflow-hidden"
            >
              <strong className="relative z-10">Mine $NON</strong>
            </button>
          )}
        </div>

        {/* Referral Section */}
        <div className="flex flex-col gap-1">
          <span className="text-xs text-white/70 font-medium">
            Your Referral Link
          </span>
          <div className="flex items-center bg-[#1A1A1A] border border-white/10 text-white font-mono px-3 py-2 rounded-lg gap-3">
            <button
              onClick={handleCopy}
              className="p-1 rounded-md text-[#00f6e6] transition-transform transform hover:scale-110 active:scale-90 animate-pulse"
            >
              <Clipboard size={18} />
            </button>
            <div className="truncate text-sm">
              t.me/realnoonebot=start/29fj984ty06h0k90999.noone
            </div>
          </div>
        </div>

        {/* Daily Bonus */}
<div className="mt-1 flex flex-col gap-2">
  <h3 className="text-xs text-white/70 font-medium">Daily Bonus</h3>
  <Card className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4">
    <div className="flex flex-col gap-2 w-full sm:w-auto">
      <div className="text-xs text-white/60">
        Next bonus available in:{" "}
        <span className="text-[#00f6e6] font-bold">
          {formatTime(bonusCountdown)}
        </span>
      </div>
      <div className="flex flex-wrap gap-2 mt-1 items-center">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => {
          const isActive = i === ((user?.bonusDay || 0) % 7) + 1;
          return (
            <div
              key={i}
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                isActive
                  ? "bg-yellow-200/20 border border-yellow-400"
                  : "bg-white/10 border border-gray-500/40"
              }`}
            >
              {isActive ? (
                <Lottie
                  animationData={starAnimation}
                  loop={true}
                  className="w-6 h-6 cursor-pointer"
                  onClick={() => setShowBonusModal(true)}
                />
              ) : (
                <div className="w-4 h-4 bg-gray-400 rounded-full opacity-40"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  </Card>
</div>


        {/* Transaction History */}
        <div className="mt-2 flex flex-col gap-2">
          <h3 className="text-xs text-white/70 font-medium">
            Transaction History
          </h3>
          <Card className="overflow-x-auto border border-white/30 bg-gradient-to-t from-[#151515] to-[#0d0d0d]">
            <table className="w-full text-xs text-left text-white/80">
              <thead className="text-xs uppercase text-white/50 border-b border-white/10">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, idx) => (
                  <tr key={idx} className="border-b border-white/10">
                    <td className="px-4 py-2">
                      {tx.createdAt
                        ? new Date(
                            tx.createdAt.seconds
                              ? tx.createdAt.seconds * 1000
                              : tx.createdAt
                          ).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-2">{tx.type}</td>
                    <td className="px-4 py-2">{tx.amount} NON</td>
                    <td className="px-4 py-2 text-green-400">{tx.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </>
  );
}
