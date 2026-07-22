import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import AuctionWarRoom from "./AuctionWarRoom.jsx";
import Auth from "./Auth.jsx";
import { supabase } from "./supabase.js";
import { storage, setStorageUser } from "./storage.js";

function ResetPassword({ onDone }) {
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (pw.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (pw !== confirm) { setError("Passwords don't match."); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) throw error;
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#0A0A0F", color: "#EDEDF2", fontFamily: "'Space Grotesk', sans-serif", padding: 24,
    }}>
      <div style={{
        background: "#13131C", border: "1px solid rgba(237,237,242,0.09)", borderRadius: 20,
        padding: "48px 40px", width: "100%", maxWidth: 380, textAlign: "center",
      }}>
        <h1 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 22, margin: "0 0 8px", textTransform: "uppercase" }}>
          Set New Password
        </h1>
        <p style={{ fontSize: 13, color: "rgba(237,237,242,0.55)", margin: "0 0 24px" }}>
          Enter your new password below.
        </p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input
            type="password" placeholder="New password" value={pw}
            onChange={(e) => setPw(e.target.value)} required minLength={6}
            autoComplete="new-password"
            style={{
              background: "#191926", border: "1px solid rgba(237,237,242,0.09)", borderRadius: 10,
              color: "#EDEDF2", fontSize: 15, padding: "13px 16px", fontFamily: "inherit", width: "100%", boxSizing: "border-box",
            }}
          />
          <input
            type="password" placeholder="Confirm password" value={confirm}
            onChange={(e) => setConfirm(e.target.value)} required minLength={6}
            autoComplete="new-password"
            style={{
              background: "#191926", border: "1px solid rgba(237,237,242,0.09)", borderRadius: 10,
              color: "#EDEDF2", fontSize: 15, padding: "13px 16px", fontFamily: "inherit", width: "100%", boxSizing: "border-box",
            }}
          />
          <button type="submit" disabled={loading} style={{
            background: "linear-gradient(90deg, #FF3D8A, #9B6BFF)", border: "none", borderRadius: 10,
            color: "white", fontSize: 15, fontWeight: 600, padding: 14, cursor: "pointer",
            fontFamily: "inherit", opacity: loading ? 0.5 : 1,
          }}>
            {loading ? "..." : "Update Password"}
          </button>
        </form>
        {error && <p style={{ color: "#FF5C39", fontSize: 13, marginTop: 14 }}>{error}</p>}
      </div>
    </div>
  );
}

function App() {
  const [session, setSession] = useState(undefined); // undefined = loading
  const [passwordReset, setPasswordReset] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setStorageUser(session?.user?.id ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setStorageUser(session?.user?.id ?? null);
      if (event === "PASSWORD_RECOVERY") {
        setPasswordReset(true);
      }
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

  if (passwordReset) {
    return <ResetPassword onDone={() => setPasswordReset(false)} />;
  }

  return <AuctionWarRoom key={session.user.id} onLogout={() => supabase.auth.signOut()} userEmail={session.user.email} />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
