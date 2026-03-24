import React, { useState } from "react";
import { Link } from "wouter";
import SiteNav, { navCss } from "../components/SiteNav";
import { Eye, EyeOff, UserPlus, Upload, CheckCircle } from "lucide-react";

const API_BASE = "/api";

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

  .ds-root { background:var(--color-ns-dark); min-height:100vh; display:flex; flex-direction:column; }
  .ds-root * { font-family:'Inter', sans-serif; box-sizing:border-box; }
  .ds-container { flex:1; display:flex; align-items:center; justify-content:center; padding:48px 24px; }
  .ds-card {
    width:100%; max-width:560px; background:var(--color-ns-panel); border:1px solid rgba(255,255,255,0.06);
    border-radius:20px; padding:48px 40px; backdrop-filter:blur(20px);
  }
  .ds-title { font-size:28px; font-weight:200; color:var(--color-ns-light); margin-bottom:8px; }
  .ds-subtitle { font-size:13px; color:var(--color-ns-body); margin-bottom:36px; }
  .ds-label { display:block; font-size:10px; text-transform:uppercase; letter-spacing:0.2em; font-weight:600; color:var(--color-ns-body); margin-bottom:8px; }
  .ds-input {
    width:100%; padding:14px 16px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
    border-radius:12px; color:var(--color-ns-light); font-size:14px; outline:none; transition:border-color 0.2s;
  }
  .ds-input:focus { border-color:var(--color-ns-accent); }
  .ds-input::placeholder { color:rgba(255,255,255,0.2); }
  .ds-field { margin-bottom:20px; }
  .ds-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .ds-row-3 { display:grid; grid-template-columns:2fr 1fr 1fr; gap:16px; }
  .ds-btn {
    width:100%; padding:16px; background:var(--color-ns-accent); color:#fff; border:none;
    border-radius:12px; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.15em;
    cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:8px;
    margin-top:8px;
  }
  .ds-btn:hover { background:#6366f1; }
  .ds-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .ds-error { background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2); color:#f87171; font-size:12px; padding:12px 16px; border-radius:10px; margin-bottom:20px; }
  .ds-success {
    text-align:center; padding:32px 0;
  }
  .ds-success-icon { color:#34d399; margin-bottom:16px; }
  .ds-success h2 { font-size:22px; font-weight:300; color:var(--color-ns-light); margin-bottom:12px; }
  .ds-success p { font-size:13px; color:var(--color-ns-body); line-height:1.6; margin-bottom:24px; }
  .ds-success a { color:var(--color-ns-accent); text-decoration:none; font-size:13px; }
  .ds-success a:hover { text-decoration:underline; }
  .ds-footer { text-align:center; margin-top:24px; font-size:12px; color:var(--color-ns-body); }
  .ds-footer a { color:var(--color-ns-accent); text-decoration:none; }
  .ds-footer a:hover { text-decoration:underline; }
  .ds-section { font-size:9px; text-transform:uppercase; letter-spacing:0.35em; color:var(--color-ns-accent); font-weight:700; margin-bottom:16px; margin-top:8px; }
  .ds-file-zone {
    display:flex; align-items:center; gap:12px; padding:14px 16px;
    background:rgba(255,255,255,0.04); border:1px dashed rgba(255,255,255,0.12);
    border-radius:12px; cursor:pointer; transition:border-color 0.2s;
  }
  .ds-file-zone:hover { border-color:var(--color-ns-accent); }
  .ds-file-zone input { display:none; }
  .ds-file-zone span { font-size:12px; color:var(--color-ns-body); }
  .ds-file-name { font-size:11px; color:var(--color-ns-accent); margin-top:6px; }
  .ds-pw-wrap { position:relative; }
  .ds-pw-toggle { position:absolute; right:14px; top:50%; transform:translateY(-50%); background:none; border:none; color:var(--color-ns-body); cursor:pointer; padding:0; }

  @media (max-width: 640px) {
    .ds-card { padding:32px 24px; }
    .ds-row, .ds-row-3 { grid-template-columns:1fr; }
  }
`;

export default function DealerSignupPage() {
  const [form, setForm] = useState({
    businessName: "", contactName: "", email: "", phone: "",
    street: "", city: "", state: "", zip: "", password: "", confirmPassword: "",
  });
  const [taxCert, setTaxCert] = useState<File | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k !== "confirmPassword") formData.append(k, v);
      });
      if (taxCert) formData.append("taxExemptCert", taxCert);

      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Signup failed");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ds-root">
      <style>{navCss}{css}</style>
      <SiteNav />

      <div className="ds-container">
        <div className="ds-card">
          {success ? (
            <div className="ds-success">
              <CheckCircle size={48} className="ds-success-icon" />
              <h2>Application Submitted</h2>
              <p>
                Thank you for applying for a dealer account. Your application is
                currently under review. You'll be able to access wholesale pricing
                once your account has been approved.
              </p>
              <Link href="/dealer-login">Go to Login</Link>
            </div>
          ) : (
            <>
              <h1 className="ds-title">Dealer Application</h1>
              <p className="ds-subtitle">Apply for a wholesale dealer account to access pricing</p>

              {error && <div className="ds-error">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="ds-section">Business Information</div>

                <div className="ds-field">
                  <label className="ds-label">Business Name</label>
                  <input className="ds-input" placeholder="Your Shop Name" value={form.businessName} onChange={update("businessName")} required />
                </div>

                <div className="ds-row">
                  <div className="ds-field">
                    <label className="ds-label">Contact Name</label>
                    <input className="ds-input" placeholder="Full Name" value={form.contactName} onChange={update("contactName")} required />
                  </div>
                  <div className="ds-field">
                    <label className="ds-label">Phone</label>
                    <input className="ds-input" type="tel" placeholder="(555) 123-4567" value={form.phone} onChange={update("phone")} required />
                  </div>
                </div>

                <div className="ds-field">
                  <label className="ds-label">Street Address</label>
                  <input className="ds-input" placeholder="123 Main Street" value={form.street} onChange={update("street")} required />
                </div>

                <div className="ds-row-3">
                  <div className="ds-field">
                    <label className="ds-label">City</label>
                    <input className="ds-input" placeholder="City" value={form.city} onChange={update("city")} required />
                  </div>
                  <div className="ds-field">
                    <label className="ds-label">State</label>
                    <input className="ds-input" placeholder="CA" value={form.state} onChange={update("state")} required />
                  </div>
                  <div className="ds-field">
                    <label className="ds-label">ZIP</label>
                    <input className="ds-input" placeholder="90210" value={form.zip} onChange={update("zip")} required />
                  </div>
                </div>

                <div className="ds-section">Tax Exempt Certificate (Optional)</div>
                <div className="ds-field">
                  <label className="ds-file-zone" htmlFor="tax-cert">
                    <Upload size={18} style={{ color: "var(--color-ns-body)" }} />
                    <span>{taxCert ? taxCert.name : "Upload tax exempt certificate (PDF, JPG, PNG)"}</span>
                    <input
                      id="tax-cert"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setTaxCert(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>

                <div className="ds-section">Account Credentials</div>

                <div className="ds-field">
                  <label className="ds-label">Email Address</label>
                  <input className="ds-input" type="email" placeholder="dealer@shop.com" value={form.email} onChange={update("email")} required />
                </div>

                <div className="ds-row">
                  <div className="ds-field">
                    <label className="ds-label">Password</label>
                    <div className="ds-pw-wrap">
                      <input
                        type={showPw ? "text" : "password"}
                        className="ds-input"
                        placeholder="Min 8 characters"
                        value={form.password}
                        onChange={update("password")}
                        required
                      />
                      <button type="button" className="ds-pw-toggle" onClick={() => setShowPw(!showPw)}>
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="ds-field">
                    <label className="ds-label">Confirm Password</label>
                    <input type="password" className="ds-input" placeholder="Re-enter password" value={form.confirmPassword} onChange={update("confirmPassword")} required />
                  </div>
                </div>

                <button type="submit" className="ds-btn" disabled={submitting}>
                  <UserPlus size={16} />
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </form>

              <div className="ds-footer">
                Already have an account? <Link href="/dealer-login">Sign in</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
