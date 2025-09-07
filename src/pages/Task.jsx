// src/pages/Task.jsx
import React, { useState, useEffect } from "react";
import Card from "../components/Card";
import { Crown, CheckCircle2 } from "lucide-react";
import Lottie from "lottie-react";
import ShadowIcon from "../assets/shadow.png";

// ✅ Firestore + hook
import { db } from "../firebase";
import { doc, updateDoc, increment } from "firebase/firestore";
import useDashboardFunc from "../hooks/useDashboardFunc";

// Lottie JSON icons
import telegramAnim from "../assets/telegram.json";
import xAnim from "../assets/x.json";
import discordAnim from "../assets/discord.json";
import youtubeAnim from "../assets/youtube.json";

export default function Task() {
  const [popup, setPopup] = useState({ open: false, reward: 0, task: "" });
  const [claimedTasks, setClaimedTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("claimedTasks") || "[]");
    } catch {
      return [];
    }
  });

  // ✅ hook gives us user, setUser, and local transactions
  const { user, setUser, addLocalTransaction } = useDashboardFunc();

  // Persist claimed tasks
  useEffect(() => {
    try {
      localStorage.setItem("claimedTasks", JSON.stringify(claimedTasks));
    } catch (e) {
      console.error("Failed to save claimedTasks:", e);
    }
  }, [claimedTasks]);

  // 🔹 Handle claim button click
  const handleClaimClick = (reward, task) => {
    setPopup({ open: true, reward, task });
  };

  // 🔹 Confirm claim: update Firestore + local balance + transaction
  const handleConfirm = async () => {
    if (!popup.reward || !popup.task || !user) return;

    try {
      const userRef = doc(db, "users", user.id || "TEST_USER_123");

      // ✅ Update Firestore balance
      await updateDoc(userRef, {
        balance: increment(popup.reward),
      });

      // ✅ Update local state instantly
      setUser((prev) => ({
        ...prev,
        balance: (prev?.balance ?? 0) + popup.reward,
      }));

      // ✅ Add transaction to local + UI
      addLocalTransaction({
        type: "Task Reward",
        amount: popup.reward,
        status: "Completed",
        content: `Completed ${popup.task}`,
      });

      // ✅ Mark as claimed
      setClaimedTasks((prev) =>
        prev.includes(popup.task) ? prev : [...prev, popup.task]
      );

      // ✅ Close popup
      setPopup({ open: false, reward: 0, task: "" });
    } catch (err) {
      console.error("handleConfirm error:", err);
    }
  };

  // Tasks list
  const tasks = [
    { name: "Telegram", reward: 500, anim: telegramAnim, color: "#229ED9" },
    { name: "X (Twitter)", reward: 500, anim: xAnim, color: "#000000" },
    { name: "Discord", reward: 500, anim: discordAnim, color: "#5865F2" },
    { name: "YouTube", reward: 500, anim: youtubeAnim, color: "#FF0000" },
  ];

  // Shadow upgrade list
  const shadows = [
    { title: "x1 Shadow", price: "0.5 TON", perks: ["🚀 Mining speed ×2", "🎁 Daily bonus chest"] },
    { title: "x2 Shadow", price: "5 TON", perks: ["🚀 Mining speed ×3", "🎁 Daily bonus chest", "👥 +5% referral bonus"] },
    { title: "x3 Shadow", price: "25 TON", perks: ["🚀 Mining speed ×5", "🎁 Daily bonus chest", "👥 +10% referral bonus", "💎 Leaderboard priority"] },
    { title: "x4 Shadow", price: "75 TON", perks: ["🚀 Mining speed ×7", "🎁 Daily bonus chest", "👥 +15% referral bonus", "💎 Premium task access"] },
    { title: "x5 Shadow", price: "250 TON", perks: ["🚀 Mining speed ×10", "🎁 Mega daily chest", "👥 +20% referral bonus", "💎 Top-tier leaderboard", "🔥 Exclusive NFT skin"] },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Crown size={22} className="text-white" />
        <h2 className="text-xl font-bold text-white">Tasks & Rewards</h2>
      </div>
      <p className="text-sm text-white/60 mb-4">
        Complete simple tasks, grow the $NON community, and earn rewards.  
        No promises, No noise, just No-One.
      </p>

      <div className="border-t border-white/20 my-1"></div>

      {/* Social Tasks */}
      <h3 className="text-base font-semibold text-white">Socials Tasks</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
        {tasks.map((task, i) => {
          const isClaimed = claimedTasks.includes(task.name);
          return (
            <div
              key={i}
              className="rounded-xl p-3 flex flex-col items-center text-white font-medium"
              style={{ backgroundColor: task.color }}
            >
              <div className="flex items-center gap-1 text-xs">
                <Lottie animationData={task.anim} loop style={{ width: 40, height: 40 }} />
                {task.reward} NON
              </div>

              {isClaimed ? (
                <button
                  disabled
                  className="mt-2 flex items-center justify-center gap-1 bg-blue-600 text-white rounded-lg w-full py-1 text-xs font-normal"
                >
                  <CheckCircle2 size={14} /> Claimed
                </button>
              ) : (
                <button
                  onClick={() => handleClaimClick(task.reward, task.name)}
                  className="mt-2 bg-white text-black rounded-lg w-full py-1 text-xs font-normal"
                >
                  Claim
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="border-t border-white/20 my-6"></div>

      {/* Shadow Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">Get Shadow</h3>
          <p className="text-sm text-white/60">Unlock multipliers and access exclusive rewards.</p>
        </div>
        <div className="mt-2 sm:mt-0">
          <div className="px-3 py-2 rounded-xl border border-white/20 bg-gradient-to-t from-[#1a1a1a] to-[#0d0d0d] text-sm text-white/70">
            Wallet Connected{" "}
            <span className="ml-1 text-cyan-400">0xdfsdd4b4d44een…3r89h</span>
            <span className="ml-2 w-2 h-2 bg-cyan-400 rounded-full inline-block"></span>
          </div>
        </div>
      </div>

      {/* Shadow Cards */}
      <div className="grid grid-cols-2 gap-3">
        {shadows.map((shadow, i) => (
          <Card
            key={i}
            className="relative w-auto bg-gradient-to-t from-gray-900 to-black text-white border border-white/20 rounded-xl p-3"
          >
            <div className="flex flex-col h-full">
              <img src={ShadowIcon} alt="Shadow" className="w-6 h-6 object-contain" />
              <span className="text-sm mt-2">{shadow.title}</span>
              <span className="text-cyan-400 text-xs mb-1">{shadow.price}</span>
              <ul className="text-xs text-gray-300 space-y-1">
                {shadow.perks.map((perk, j) => (
                  <li key={j}>{perk}</li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>

      {/* Confirm Popup */}
      {popup.open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#1e1e1e] p-5 rounded-2xl w-80 text-center border border-white/20">
            <h3 className="text-lg font-bold text-white mb-2">Confirm Reward</h3>
            <p className="text-white/70 mb-4">
              You are about to claim{" "}
              <span className="text-cyan-400">{popup.reward} NON</span> for completing{" "}
              <b>{popup.task}</b>.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPopup({ open: false, reward: 0, task: "" })}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 bg-green-500 text-white py-2 rounded-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="h-36"></div> {/* Spacer */}
    </div>
  );
}
