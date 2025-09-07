// src/pages/Leaderboard.jsx
import React, { useState, useEffect } from "react";
import avatar from "../assets/avatar.jpg";
import { Star } from "lucide-react";
import { getLeaderboardData } from "../utils/leaderboardUtils";

export default function Leaderboard() {
  const [stats, setStats] = useState({
    rank: 0,
    balance: 0,
    totalMined: 0,
    totalUsers: 0,
  });
  const [ranks, setRanks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getLeaderboardData("TEST_USER_123"); // ✅ replace later with real userId
      setStats({
        rank: data.userRank,
        balance: data.userBalance || 0, // ✅ we’ll make sure leaderboardUtils returns this
        totalMined: data.totalMined,
        totalUsers: data.totalUsers,
      });
      setRanks(data.leaderboard);
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Page title */}
      <h2 className="text-lg font-bold text-center mt-4 mb-2">Leaderboard</h2>

      {/* Global stats */}
      <div className="flex justify-around bg-gradient-to-r from-gray-900 to-gray-800 text-white p-3 rounded-lg text-sm">
        <div>
          Total Mined:{" "}
          <span className="text-[#00f6e6] font-bold">{stats.totalMined}</span>{" "}
          NON
        </div>
        <div>
          Total No-One:{" "}
          <span className="text-[#00f6e6] font-bold">{stats.totalUsers}</span>
        </div>
      </div>

      {/* Personal stats */}
      <div className="bg-gradient-to-r from-[#00f6e6] to-[#00e38f] text-black p-4 rounded-xl flex justify-around items-center gap-4 mb-2 divide-x divide-black/20">
        <div className="text-center w-28 px-2">
          <div className="text-xs text-black/60">Your Rank</div>
          <div className="font-bold text-lg">{stats.rank}</div>
        </div>
        <div className="text-center w-28 px-2">
          <div className="text-xs text-black/60">Your Balance</div>
          <div className="font-bold text-lg">{stats.balance} NON</div>
        </div>
      </div>

      {/* Leaderboard list */}
      <div className="flex flex-col gap-2 mt-2">
        {ranks.map((r) => (
          <div
            key={r.rank}
            className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-white/10 w-full min-h-[52px]"
          >
            {/* Rank number */}
            <div className="w-6 text-sm font-bold text-gray-400">{r.rank}</div>

            {/* Avatar + Username */}
            <div className="flex items-center gap-3 w-32 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden">
                <img
                  src={r.avatar || avatar}
                  alt={r.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              </div>
              <div className="font-medium text-sm truncate">{r.name}</div>
            </div>

            {/* NON value */}
            <div className="font-bold text-sm w-32 text-right">
              {r.value} <span className="text-white/60">NON</span>
            </div>

            {/* Star for top 3 */}
            {r.rank <= 3 ? (
              <Star size={18} color="#ffd86b" />
            ) : (
              <div className="w-4" />
            )}
          </div>
        ))}
      </div>

      <div className="h-36"></div>
    </div>
  );
}
