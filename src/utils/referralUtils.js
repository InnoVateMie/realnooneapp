// src/utils/referralUtils.js
import { db } from "../firebase";
import {
  doc,
  updateDoc,
  increment,
  arrayUnion,
  getDoc,
} from "firebase/firestore";

// ✅ Referral percentages for levels 1–5
const LEVEL_PERCENTS = {
  1: 25, // %
  2: 15,
  3: 10,
  4: 5,
  5: 2,
};

// ✅ Default fallback ID for dev/test
const TEMP_USER_ID = "TEST_USER_123";

/**
 * Reward inviter & uplines when a referred user signs up.
 */
export async function rewardReferral(inviterId, referredId, signupBonus) {
  try {
    inviterId = inviterId || TEMP_USER_ID;
    referredId = referredId || `TEMP_REF_${Date.now()}`;

    const inviterRef = doc(db, "users", inviterId);
    const inviterSnap = await getDoc(inviterRef);

    if (!inviterSnap.exists()) return false;
    const inviterData = inviterSnap.data();

    // ✅ Prevent duplicate rewards for same referral
    if (inviterData.referralRewards?.includes(referredId)) {
      return false;
    }

    // ✅ Direct reward: always 520 NON
    const directBonus = 520;
    await updateDoc(inviterRef, {
      balance: increment(directBonus),
      referralRewards: arrayUnion(referredId),
      "referrals.direct": arrayUnion(referredId),
      referralCount: increment(1),
    });

    // ✅ Cascade rewards to uplines (Level 1–5)
    let currentUplineId = inviterData.upline; // who invited this inviter
    for (let level = 1; level <= 5 && currentUplineId; level++) {
      const uplineRef = doc(db, "users", currentUplineId);
      const uplineSnap = await getDoc(uplineRef);
      if (!uplineSnap.exists()) break;

      const uplineData = uplineSnap.data();

      // Prevent duplicate
      if (uplineData.referralRewards?.includes(referredId)) {
        currentUplineId = uplineData.upline;
        continue;
      }

      const percent = LEVEL_PERCENTS[level];
      const bonus = Math.floor((signupBonus * percent) / 100);

      if (bonus > 0) {
        await updateDoc(uplineRef, {
          balance: increment(bonus),
          referralRewards: arrayUnion(referredId),
          [`referrals.${level}`]: arrayUnion(referredId),
        });
      }

      // Move up to next upline
      currentUplineId = uplineData.upline || null;
    }

    return true;
  } catch (err) {
    console.error("rewardReferral error:", err);
    return false;
  }
}

/**
 * Check referral milestones dynamically
 */
export async function checkMilestone(userId, referralCount) {
  userId = userId || TEMP_USER_ID;

  if (referralCount >= 100) return { reached: true, milestone: 100, bonus: 40000 };
  if (referralCount >= 50) return { reached: true, milestone: 50, bonus: 15000 };
  if (referralCount >= 30) return { reached: true, milestone: 30, bonus: 7000 };
  if (referralCount >= 15) return { reached: true, milestone: 15, bonus: 3000 };
  if (referralCount >= 5) return { reached: true, milestone: 5, bonus: 1000 };
  return { reached: false, milestone: null, bonus: 0 };
}

/**
 * Claim milestone reward (one-time only)
 */
export async function claimReferralBonus(userId, milestone) {
  try {
    userId = userId || TEMP_USER_ID;

    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return false;
    const userData = userSnap.data();

    // Prevent double-claim
    if (userData.referralBonuses?.includes(milestone)) {
      return false;
    }

    const milestoneData = await checkMilestone(userId, userData.referralCount || 0);
    if (milestoneData.reached && milestoneData.milestone === milestone) {
      await updateDoc(userRef, {
        balance: increment(milestoneData.bonus),
        referralBonuses: arrayUnion(milestone),
      });
      return true;
    }

    return false;
  } catch (err) {
    console.error("claimReferralBonus error:", err);
    return false;
  }
}

/**
 * ✅ Legacy wrapper for backwards compatibility
 * Calls rewardReferral under the hood
 */
export async function addReferral(inviterId, referredId, type = "direct") {
  // Default signupBonus = 2000 (you can tweak)
  return await rewardReferral(inviterId, referredId, 2000);
}

/**
 * ✅ Get referral stats (total invites + TON accumulated from dashboard)
 */
export async function getReferralStats(userId) {
  try {
    userId = userId || TEMP_USER_ID;
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { referralCount: 0, tonAccumulated: 0 };
    }

    const data = userSnap.data();
    return {
      referralCount: data.referralCount || 0,
      tonAccumulated: data.tonAccumulated || 0, // ✅ directly from dashboard field
    };
  } catch (err) {
    console.error("getReferralStats error:", err);
    return { referralCount: 0, tonAccumulated: 0 };
  }
}
