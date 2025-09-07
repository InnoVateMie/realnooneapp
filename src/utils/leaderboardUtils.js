// src/utils/leaderboardUtils.js
import { db } from "../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import avatar from "../assets/avatar.jpg";

/**
 * Fetch leaderboard + stats for a given user
 */
export async function getLeaderboardData(userId) {
  try {
    // ✅ Fetch all users
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);

    let users = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      users.push({
        id: docSnap.id,
        name: data.telegramUsername || data.displayName || "No-One",
        balance: data.balance || 0,
        invites: data.referralCount || 0,
        ton: data.tonAccumulated || 0,
        avatar: data.avatar || avatar,
      });
    });

    // ✅ Sort by balance (high → low)
    users.sort((a, b) => b.balance - a.balance);

    // ✅ Assign rank numbers (include id for lookup)
    const leaderboard = users.map((u, index) => ({
      id: u.id,
      rank: index + 1,
      name: u.name,
      value: u.balance,
      avatar: u.avatar,
    }));

    // ✅ Total stats
    const totalMined = users.reduce((sum, u) => sum + u.balance, 0);
    const totalUsers = users.length;

    // ✅ Get current user stats
    const userDoc = await getDoc(doc(db, "users", userId));
    let userRank = 0;
    let totalInvites = 0;
    let tonAccumulated = 0;

    if (userDoc.exists()) {
      const userData = userDoc.data();
      totalInvites = userData.referralCount || 0;
      tonAccumulated = userData.tonAccumulated || 0;

      // ✅ Find user in leaderboard by ID
      const found = leaderboard.find((l) => l.id === userId);
      if (found) {
        userRank = found.rank;
      }
    }

    return {
      userRank,
      totalInvites,
      tonAccumulated,
      totalMined,
      totalUsers,
      leaderboard,
    };
  } catch (err) {
    console.error("getLeaderboardData error:", err);
    return {
      userRank: 0,
      totalInvites: 0,
      tonAccumulated: 0,
      totalMined: 0,
      totalUsers: 0,
      leaderboard: [],
    };
  }
}
