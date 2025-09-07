// src/utils/storageUtils.js
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";



// 🔑 Helper: get logged-in userId (store it after login)
const getUserId = () => localStorage.getItem("userId");

// ---- BALANCE ----
export const getBalance = () => {
  const balance = localStorage.getItem("nonBalance");
  return balance && !isNaN(balance) ? parseInt(balance, 10) : 0;
};

export const setBalance = async (newBalance) => {
  const parsed = parseInt(newBalance, 10);
  localStorage.setItem("nonBalance", isNaN(parsed) ? "0" : parsed.toString());

  // 🔔 Notify app that balance changed
  window.dispatchEvent(new Event("balanceUpdated"));

  // 🔥 Sync to Firestore
  const userId = getUserId();
  if (userId) {
    try {
      await updateDoc(doc(db, "users", userId), { balance: parsed });
    } catch (e) {
      console.error("Failed to update Firestore balance:", e);
    }
  }
};

export const increaseBalance = async (amount) => {
  const current = getBalance();
  const parsed = parseInt(amount, 10) || 0;
  const updated = current + parsed;
  await setBalance(updated);
  return updated;
};

export const decreaseBalance = async (amount) => {
  const current = getBalance();
  const parsed = parseInt(amount, 10) || 0;
  const updated = Math.max(0, current - parsed);
  await setBalance(updated);
  return updated;
};

// ---- TRANSACTIONS ----
export const addTransaction = async (type, amount, description = "") => {
  const tx = {
    id: Date.now(),
    type,
    amount: parseInt(amount, 10) || 0,
    description,
    date: new Date().toISOString(),
  };

  // ✅ Save locally
  const history = getTransactions();
  history.unshift(tx);
  localStorage.setItem("transactions", JSON.stringify(history));

  // 🔔 Notify app
  window.dispatchEvent(new Event("transactionsUpdated"));

  // 🔥 Sync with Firestore
  const userId = getUserId();
  if (userId) {
    try {
      await updateDoc(doc(db, "users", userId), {
        transactions: arrayUnion(tx), // push transaction into array field
      });
    } catch (e) {
      console.error("Failed to update Firestore transactions:", e);
    }
  }

  return tx;
};

export const getTransactions = () => {
  try {
    const history = localStorage.getItem("transactions");
    return history ? JSON.parse(history) : [];
  } catch (e) {
    console.error("Error parsing transactions:", e);
    return [];
  }
};

export const clearTransactions = async () => {
  localStorage.removeItem("transactions");
  window.dispatchEvent(new Event("transactionsUpdated"));

  // 🔥 Optional: clear from Firestore too
  const userId = getUserId();
  if (userId) {
    try {
      await updateDoc(doc(db, "users", userId), { transactions: [] });
    } catch (e) {
      console.error("Failed to clear Firestore transactions:", e);
    }
  }
};
