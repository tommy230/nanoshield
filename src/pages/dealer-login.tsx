import React, { useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import SiteNav, { navCss } from "../components/SiteNav";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, LogIn } from "lucide-react";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;900&display=swap');

  :root {
    --color-ns-dark: #121418;
    --color-ns-darker: #0e1012;
    --color-ns-panel: rgba(26,29,34,0.85);
    --color-ns-light: #e0e0e0;
    --color-ns-body: #808388;
    --color-ns-subtle: #555;
    --color-ns-accent: #818cf8;
  }

  .dl-root { background:var(--color-ns-dark); min-height:100vh; display:flex; flex-direction:column; }
  .dl-root * { font-family:'Inter', sans-serif; box-sizing:border-box; }

  .dl-container {
    flex:1; display:flex; align-items:center; justify-content:center; padding:48px 24px;
  }
  .dl-card {
    width:100%; max-width:420px; background:var(--color-ns-panel); border:1px solid rgba(255,255,255,0.06);
    border-radius:20px; padding:48px 40px; backdrop-filter:blur(20px);
  }
  .dl-title { font-size:28px; font-weight:200; color:var(--color-ns-light); margin-bottom:8px; }
  .dl-subtitle { font-size:13px; color:var(--color-ns-body); margin-bottom:36px; }
  .dl-label { display:block; font-size:10px; text-transform:uppercase; letter-spacing:0.2em; font-weight:600; color:var(--color-ns-body); margin-bottom:8px; }
  .dl-input {
    width:100%; padding:14px 16px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
    border-radius:12px; color:var(--color-ns-light); font-size:14px; outline:none; transition:border-color 0.2s;
  }
  .dl-input:focus { border-color:var(--color-ns-accent); }
  .dl-input::placeholder { color:rgba(255,255,255,0.2); }
  .dl-field { margin-bottom:20px; }
  .dl-btn {
    width:100%; padding:16px; background:var(--color-ns-accent); color:#fff; border:none;
    border-radius:12px; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.15em;
    cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:8px;
  }
  .dl-btn:hover { background:#6366f1; }
  .dl-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .dl-error { background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2); color:#f87171; font-size:12px; padding:12px 16px; border-radius:10px; margin-bottom:20px; }
  .dl-footer { text-align:center; margin-top:24px; font-size:12px; color:var(--color-ns-body); }
  .dl-footer a { color:var(--color-ns-accent); text-decoration:none; }
  .dl-footer a:hover { text-decoration:underline; }
  .dl-pw-wrap { position:relative; }
  .dl-pw-toggle { position:absolute; right:14px; top:50%; transform:translateY(-50%); background:none; border:none; color:var(--color-ns-body); cursor:pointer; padding:0; }
`;

export default function DealerLoginPage() {
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const returnTo = new URLSearchParams(searchString).get("returnTo") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      navigate(returnTo);
    }
  };

  return (
    <div className="dl-root">
      <style>{navCss}{css}</style>
      <SiteNav />

      <div className="dl-container">
        <div className="dl-card">
          <h1 className="dl-title">Sign In</h1>
          <p className="dl-subtitle">Access your account: dealers, sales, and admin</p>

          {error && <div className="dl-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="dl-field">
              <label className="dl-label">Email Address</label>
              <input
                type="email"
                className="dl-input"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="dl-field">
              <label className="dl-label">Password</label>
              <div className="dl-pw-wrap">
                <input
                  type={showPw ? "text" : "password"}
                  className="dl-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" className="dl-pw-toggle" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="dl-btn" disabled={submitting}>
              <LogIn size={16} />
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="dl-footer">
            Don't have an account? <Link href="/dealer-signup">Apply for a dealer account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
