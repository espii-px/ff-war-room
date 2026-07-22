import { useState } from "react";
import { supabase } from "./supabase.js";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login"); // "login" | "signup" | "reset"
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setMessage("Check your email for a password reset link.");
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("Check your email for a confirmation link, then log in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <style>{authCss}</style>
      <div className="auth-card">
        <h1 className="auth-title">
          Draft <span className="auth-grad">Lab</span>
        </h1>
        <p className="auth-sub">FF 2026 · The League · Auction</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          {mode !== "reset" && (
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
          )}
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "..." : mode === "reset" ? "Send reset link" : mode === "login" ? "Log in" : "Sign up"}
          </button>
        </form>

        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-msg">{message}</p>}

        {mode === "login" && (
          <button
            className="auth-forgot"
            onClick={() => { setMode("reset"); setError(null); setMessage(null); }}
          >
            Forgot password?
          </button>
        )}

        <button
          className="auth-toggle"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError(null);
            setMessage(null);
          }}
        >
          {mode === "login"
            ? "Don't have an account? Sign up"
            : "Already have an account? Log in"}
        </button>
      </div>
    </div>
  );
}

const authCss = `
@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@500;700&family=Space+Grotesk:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap');

.auth-root {
  --void: #0A0A0F;
  --panel: #13131C;
  --panel2: #191926;
  --line: rgba(237,237,242,0.09);
  --ink: #EDEDF2;
  --dim: rgba(237,237,242,0.55);
  --pink: #FF3D8A;
  --cyan: #2BE4FF;
  --violet: #9B6BFF;
  --hot: #FF5C39;
  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  background:
    radial-gradient(900px 500px at 12% -10%, rgba(255,61,138,0.13), transparent 60%),
    radial-gradient(900px 600px at 95% 10%, rgba(43,228,255,0.10), transparent 55%),
    radial-gradient(700px 500px at 50% 110%, rgba(155,107,255,0.10), transparent 60%),
    var(--void);
  color: var(--ink);
  font-family: 'Space Grotesk', -apple-system, sans-serif;
  padding: 24px;
}
.auth-card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 48px 40px;
  width: 100%;
  max-width: 380px;
  text-align: center;
}
.auth-title {
  font-family: 'Unbounded', sans-serif;
  font-weight: 700; text-transform: uppercase;
  font-size: 28px; margin: 0 0 6px;
}
.auth-grad {
  background: linear-gradient(90deg, var(--pink), var(--violet) 55%, var(--cyan));
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.auth-sub {
  font-family: 'Space Mono', monospace;
  font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--dim); margin: 0 0 32px;
}
.auth-form {
  display: flex; flex-direction: column; gap: 14px;
}
.auth-form input {
  background: var(--panel2);
  border: 1px solid var(--line);
  border-radius: 10px;
  color: var(--ink);
  font-size: 15px;
  padding: 13px 16px;
  font-family: 'Space Grotesk', sans-serif;
  width: 100%;
  box-sizing: border-box;
}
.auth-form input:focus {
  outline: none;
  border-color: var(--cyan);
  box-shadow: 0 0 0 2px rgba(43,228,255,0.15);
}
.auth-form input::placeholder { color: var(--dim); }
.auth-btn {
  background: linear-gradient(90deg, var(--pink), var(--violet));
  border: none;
  border-radius: 10px;
  color: white;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 15px; font-weight: 600;
  padding: 14px;
  cursor: pointer;
  letter-spacing: 0.04em;
  transition: opacity 0.15s;
}
.auth-btn:hover { opacity: 0.9; }
.auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.auth-error {
  color: var(--hot); font-size: 13px; margin: 14px 0 0;
}
.auth-msg {
  color: var(--cyan); font-size: 13px; margin: 14px 0 0;
}
.auth-forgot {
  background: none; border: none; color: var(--dim);
  font-size: 12px; margin-top: 14px; cursor: pointer;
  font-family: inherit;
}
.auth-forgot:hover { color: var(--violet); }
.auth-toggle {
  background: none; border: none; color: var(--dim);
  font-size: 13px; margin-top: 12px; cursor: pointer;
  font-family: inherit;
}
.auth-toggle:hover { color: var(--cyan); }
`;
