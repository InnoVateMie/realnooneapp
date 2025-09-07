import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Task from "./pages/Task";
import Referral from "./pages/Referral";
import Leaderboard from "./pages/Leaderboard";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { AnimatePresence } from "framer-motion";


// 🔹 Firestore imports
import { db } from "./firebase";
import { collection, addDoc, onSnapshot, orderBy, query } from "firebase/firestore";

export default function App() {
  const location = useLocation();

  // Posts state
  const [content, setContent] = useState("");
  const [posts, setPosts] = useState([]);

  // Real-time fetch posts from Firestore
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("created_at", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postList);
    });

    return () => unsubscribe(); // Clean up listener on unmount
  }, []);

  // Add new post to Firestore
  async function addPost(e) {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await addDoc(collection(db, "posts"), {
        content,
        created_at: new Date().toISOString(),
      });
      setContent(""); // Clear textarea
    } catch (err) {
      console.error("Error adding post:", err);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <Header />

      {/* Page content */}
      <main className="flex-1 w-full max-w-md sm:max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-[96px] py-6">
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/task" element={<Task />} />
            <Route path="/referral" element={<Referral />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </AnimatePresence>

       
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
