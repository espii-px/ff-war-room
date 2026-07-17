import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import AuctionWarRoom from "./AuctionWarRoom.jsx";
import Auth from "./Auth.jsx";
import { supabase } from "./supabase.js";
import { storage, setStorageUser } from "./storage.js";

function App() {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setStorageUser(session?.user?.id ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setStorageUser(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Provide window.storage for the app's autosave
  if (typeof window !== "undefined" && !window.storage) {
    window.storage = storage;
  }

  if (session === undefined) {
    // Loading spinner while checking auth
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0A0A0F",
        color: "#EDEDF2",
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: "14px",
      }}>
        Loading...
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return <AuctionWarRoom key={session.user.id} onLogout={() => supabase.auth.signOut()} userEmail={session.user.email} />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
