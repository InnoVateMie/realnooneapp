// useDashboardFunc.jsx
import { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";

export default function useDashboardFunc(userId = "TEST_USER_123") {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isMining, setIsMining] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionTime, setSessionTime] = useState(0);
  const [mineCounter, setMineCounter] = useState(0);
  const [bonusCountdown, setBonusCountdown] = useState(0);

  const sessionInterval = useRef(null);
  const counterInterval = useRef(null);
  const bonusInterval = useRef(null);
  const secondsInCycleRef = useRef(0);
  const addingRef = useRef(false);
  const counterRunning = useRef(false);

  const NON_TO_TON = 0.000112;
  const DAILY_BONUSES = [100, 200, 400, 600, 850, 1000, 1500];
  const MINING_CYCLE = 30; // seconds for 1 NON

  // LocalStorage keys
  const BONUS_KEY = `dailyBonusClaim_${userId}`;
  const TX_KEY = `transactions_${userId}`;

  // --- LocalStorage Helpers
  const getLocalBonusRemaining = () => {
    try {
      const raw = localStorage.getItem(BONUS_KEY);
      if (!raw) return 0;
      const parsed = JSON.parse(raw);
      const last = parsed.lastClaim || 0;
      const elapsed = Math.floor((Date.now() - last) / 1000);
      return Math.max(0, 24 * 60 * 60 - elapsed);
    } catch {
      return 0;
    }
  };

  const setLocalBonusClaim = (timestamp = Date.now(), bonusDay = 0) => {
    try {
      localStorage.setItem(
        BONUS_KEY,
        JSON.stringify({ lastClaim: timestamp, bonusDay })
      );
    } catch (e) {
      console.error("setLocalBonusClaim error:", e);
    }
  };

  const loadLocalTransactions = () => {
    try {
      const raw = localStorage.getItem(TX_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const saveLocalTransactions = (txs) => {
    try {
      localStorage.setItem(TX_KEY, JSON.stringify(txs));
    } catch (e) {
      console.error("saveLocalTransactions error:", e);
    }
  };

  const addLocalTransaction = ({ type, amount, status, content }) => {
    const tx = {
      id: Date.now(),
      type,
      amount,
      status,
      content,
      createdAt: new Date().toISOString(),
    };
    const newTxs = [tx, ...loadLocalTransactions()].slice(0, 50);
    saveLocalTransactions(newTxs);
    setTransactions(newTxs);
  };

  // --- Load user + transactions
  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      try {
        const userRef = doc(db, "users", userId);
        const snap = await getDoc(userRef);

        if (!mounted) return;

        if (snap.exists()) {
          const data = snap.data();
          const safeBalance =
            typeof data.balance === "number" ? data.balance : 0;

          setUser({ ...data, balance: safeBalance });

          if (data.miningEndTime) {
            const end = new Date(data.miningEndTime).getTime();
            if (end > Date.now()) {
              setIsMining(true);
              setSessionTime(Math.floor((end - Date.now()) / 1000));

              if (data.lastCycleTick) {
                const lastTick =
                  typeof data.lastCycleTick === "number"
                    ? data.lastCycleTick
                    : new Date(data.lastCycleTick).getTime();

                const elapsed = Math.max(
                  0,
                  Math.floor((Date.now() - lastTick) / 1000)
                );
                const fullCycles = Math.floor(elapsed / MINING_CYCLE);
                const leftover = elapsed % MINING_CYCLE;

                if (fullCycles > 0) {
                  await updateDoc(userRef, {
                    balance: increment(fullCycles),
                    lastCycleTick: Date.now() - leftover * 1000,
                  });

                  setUser((prev) => ({
                    ...prev,
                    balance: (prev?.balance ?? 0) + fullCycles,
                    lastCycleTick: Date.now() - leftover * 1000,
                  }));
                }

                secondsInCycleRef.current = leftover;
                setMineCounter(
                  Math.floor((leftover / MINING_CYCLE) * 100)
                );
              }

              if (!counterRunning.current) startCounter(end);
            } else {
              setIsMining(false);
              setSessionTime(0);
            }
          }
        } else {
          setUser({ balance: 0 });
        }
      } catch (err) {
        console.error("fetchUser error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUser();
    setTransactions(loadLocalTransactions());

    setBonusCountdown(getLocalBonusRemaining());
    startBonusTimer();

    return () => {
      mounted = false;
      clearInterval(sessionInterval.current);
      clearInterval(counterInterval.current);
      clearInterval(bonusInterval.current);
      counterRunning.current = false;
    };
  }, [userId]);

  // --- Mining
  const startMining = async () => {
    if (!user || isMining) return;
    const miningEnd = Date.now() + 24 * 60 * 60 * 1000;
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        miningEndTime: new Date(miningEnd).toISOString(),
        lastMine: new Date().toISOString(),
        lastCycleTick: Date.now(),
      });
      setIsMining(true);
      setSessionTime(24 * 60 * 60);
      startCounter(miningEnd);
    } catch (err) {
      console.error("startMining error:", err);
    }
  };

  const startCounter = (endTime) => {
    if (counterRunning.current) return;
    counterRunning.current = true;

    // ✅ smooth updates but whole numbers only
    counterInterval.current = setInterval(() => {
      secondsInCycleRef.current += 0.1;

      if (secondsInCycleRef.current >= MINING_CYCLE) {
        secondsInCycleRef.current = 0;
        addMiningNon();
      }

      setMineCounter(
        Math.floor((secondsInCycleRef.current / MINING_CYCLE) * 100)
      );
    }, 100);

    // Session countdown + progress
    sessionInterval.current = setInterval(() => {
      const remain = Math.floor((endTime - Date.now()) / 1000);
      const clamped = remain > 0 ? remain : 0;
      setSessionTime(clamped);
      setProgress(((24 * 60 * 60 - clamped) / (24 * 60 * 60)) * 100);
      if (clamped <= 0) finishMining();
    }, 1000);
  };

  const addMiningNon = async () => {
    if (addingRef.current) return;
    addingRef.current = true;
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        balance: increment(1),
        lastCycleTick: Date.now(),
      });
      setUser((prev) => ({
        ...prev,
        balance: (prev?.balance ?? 0) + 1,
        lastCycleTick: Date.now(),
      }));
    } catch (err) {
      console.error("addMiningNon error:", err);
    } finally {
      addingRef.current = false;
    }
  };

  const finishMining = async () => {
    clearInterval(sessionInterval.current);
    clearInterval(counterInterval.current);
    counterRunning.current = false;
    setIsMining(false);
    setProgress(100);
    setMineCounter(0);
    secondsInCycleRef.current = 0;
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { miningEndTime: null });
    } catch (err) {
      console.error("finishMining error:", err);
    }
  };

  // --- Bonus
  const startBonusTimer = () => {
    clearInterval(bonusInterval.current);
    bonusInterval.current = setInterval(() => {
      setBonusCountdown(getLocalBonusRemaining());
    }, 1000);
  };

  const claimDailyBonus = async () => {
    const remain = getLocalBonusRemaining();
    if (remain > 0 || !user) return false;

    try {
      const raw = localStorage.getItem(BONUS_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      const nextDay = (parsed.bonusDay || 0) + 1;
      const bonusAmount =
        DAILY_BONUSES[(parsed.bonusDay || 0) % DAILY_BONUSES.length];

      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { balance: increment(bonusAmount) });

      setUser((prev) => ({
        ...prev,
        balance: (prev?.balance ?? 0) + bonusAmount,
      }));

      setLocalBonusClaim(Date.now(), nextDay);
      setBonusCountdown(getLocalBonusRemaining());

      addLocalTransaction({
        type: "Daily Bonus",
        amount: bonusAmount,
        status: "Claimed",
        content: "Daily bonus claimed",
      });

      return true;
    } catch (err) {
      console.error("claimDailyBonus error:", err);
      return false;
    }
  };

  return {
    user,
    setUser,
    loading,
    progress,
    mineCounter,
    isMining,
    sessionTime,
    startMining,
    finishMining,
    claimDailyBonus,
    bonusCountdown,
    transactions,
    NON_TO_TON,
    addLocalTransaction,
  };
}
