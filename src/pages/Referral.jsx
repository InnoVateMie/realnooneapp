// src/pages/Referral.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  claimReferralBonus,
  checkMilestone,
} from "../utils/referralUtils";

export default function Referral() {
  const [copied, setCopied] = useState(false);
  const [pause, setPause] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [referrals, setReferrals] = useState({
    direct: [],
    levels: { 1: [], 2: [], 3: [], 4: [], 5: [] },
  });
  const [referralCount, setReferralCount] = useState(0);

  const TEST_USER_ID = "TEST_USER_123";

  // ✅ level percentages for display
  const levelPercents = {
    1: 25,
    2: 10,
    3: 5,
    4: 3,
    5: 2,
  };

  // ✅ Copy link handler
  const handleCopy = async () => {
    try {
      const link = `t.me/realnoonebot=start/${TEST_USER_ID}`;
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = link;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  // ✅ Pause effect (same as dashboard)
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

  // ✅ Handle claim milestone bonus
  const handleClaim = async () => {
    if (!referralCount) return;

    const milestone = await checkMilestone(TEST_USER_ID, referralCount);
    if (!milestone.reached) {
      alert("⚠️ No milestone reached yet.");
      return;
    }

    const success = await claimReferralBonus(TEST_USER_ID, milestone.bonus);
    if (success) {
      setClaimed(true);
      alert(`✅ Claimed ${milestone.bonus} NON for milestone!`);
    } else {
      alert("⚠️ Already claimed or error occurred.");
    }
  };

  // ✅ Reusable referral list
  const ReferralList = ({ title, count, data }) => (
    <div className="mt-6">
      <h4 className="text-sm font-medium mb-3">
        {title} <span className="text-[#00f6e6]">({count})</span>
      </h4>
      <div className="border border-white/10 rounded-lg overflow-hidden">
        {data.length > 0 ? (
          data.map((l, idx) => (
            <div
              key={idx}
              className={`flex justify-between px-4 py-3 text-sm ${
                idx < data.length - 1 ? "border-b border-white/10" : ""
              }`}
            >
              <div>{l.user || "Anonymous"}</div>
              <div
                className={
                  l.status === "Joined" ? "text-white/60" : "text-yellow-400"
                }
              >
                {l.status}
              </div>
              <div className="text-[#00f6e6]">+{l.earned ?? 0} NON</div>
            </div>
          ))
        ) : (
          <div className="h-12 flex items-center justify-center text-white/40 text-sm">
            No referrals yet
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* ✅ Popup when copied */}
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

      <h2 className="text-l font-bold mt-4">Invite friends. Earn rewards.</h2>

      {/* ✅ Referral link (click to copy) */}
      <div
        onClick={handleCopy}
        className="cursor-pointer bg-[#00f6e6] text-black px-4 py-3 rounded-xl font-bold text-center font-cascadia"
      >
        t.me/realnoonebot=xxxxxx...
      </div>

      {/* Earn per referral info */}
      <div className="bg-[#161616] text-xs text-white px-4 py-3 rounded-xl mt-1">
        Earn <span className="text-[#00f6e6] font-bold">520 NON</span> per
        referral.
        <br />
        Extra bonus from Level 1–5 (25% → 2%) when they claim their signup bonus.
      </div>

      {/* Claim button */}
      <div className="mt-3 flex justify-end">
        <button
          onClick={handleClaim}
          disabled={claimed || referralCount === 0}
          className={`px-4 py-2 rounded-lg text-xs font-medium ${
            referralCount > 0 && !claimed
              ? "bg-[#00f6e6] text-black"
              : "bg-gray-600 text-white/40 cursor-not-allowed"
          }`}
        >
          {claimed ? "Claimed" : "Claim Referral Bonus"}
        </button>
      </div>

      {/* Direct Invite */}
      <ReferralList
        title="Direct Invite"
        count={referrals.direct.length}
        data={referrals.direct}
      />

      {/* Levels 1–5 */}
      {Object.entries(referrals.levels).map(([level, data]) => (
        <ReferralList
          key={level}
          title={`Level ${level}`}
          count={data.length}
          data={data}
        />
      ))}

      {/* ✅ Stats: Total Invites & TON Accumulated */}
      <div className="mt-8 grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-r from-[#00f6e6] to-[#00ff94] text-black px-4 py-3 rounded-xl font-bold text-sm text-center">
          <div className="text-xs font-medium text-black/70">Total Invites</div>
          <div className="text-lg font-bold">{referralCount}</div>
        </div>

        <div className="bg-gradient-to-r from-[#54afff] to-[#006db1] text-white px-4 py-3 rounded-xl font-bold text-sm text-center">
          <div className="text-xs font-medium text-white/70">TON Accumulated</div>
          <div className="text-lg font-bold">0.00</div>
        </div>
      </div>

      {/* ✅ How it works */}
      <div className="mt-6">
        <h4 className="text-sm text-green-400 font-medium mb-2">How it works</h4>
        <ul className="text-sm space-y-1">
          <li>• Copy your referral link.</li>
          <li>• Share with friends.</li>
          <li>• Earn 520 NON when they join & claim signup bonus.</li>
          <li>
            • Earn extra{" "}
            {Object.entries(levelPercents)
              .map(([lvl, pct]) => `${pct}%`)
              .join(" → ")}{" "}
            from their downlines (Level 1–5).
          </li>
        </ul>
      </div>

      <div className="h-24"></div>
    </div>
  );
}
