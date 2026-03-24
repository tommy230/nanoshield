import React from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, Menu, LogIn, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const SITE_URL = "https://nanoshield.com";
const BASE = import.meta.env.BASE_URL;

export const navCss = `
  .ns-nav { position:sticky; top:0; z-index:50; display:flex; flex-direction:column; background:var(--color-ns-dark); }
  .ns-nav * { font-family:'Inter', sans-serif; box-sizing:border-box; }
  .ns-nav a { text-decoration:none; color:inherit; }
  .ns-nav-inner { display:flex; justify-content:space-between; align-items:center; padding:18px 48px; border-bottom:1px solid rgba(255,255,255,0.04); }
  .ns-nav-accent { height:2px; background:linear-gradient(90deg, #e53e3e 0%, #dd6b20 15%, #d69e2e 30%, #38a169 45%, #3182ce 60%, #805ad5 75%, #d53f8c 90%, #e53e3e 100%); }
  .ns-brand { display:flex; align-items:center; }
  .ns-brand-logo { height:44px; width:auto; display:block; }
  .ns-nav-links { display:flex; gap:36px; align-items:center; }
  .ns-nav-link { font-size:13px; letter-spacing:0.12em; text-transform:uppercase; font-weight:500; color:var(--color-ns-body); padding-bottom:4px; border-bottom:1px solid transparent; transition:color 0.2s, border-color 0.2s; cursor:pointer; background:none; border-top:none; border-left:none; border-right:none; }
  .ns-nav-link:hover { color:var(--color-ns-light); border-bottom-color:var(--color-ns-body); }
  .ns-nav-link.active { color:var(--color-ns-light); border-bottom-color:var(--color-ns-accent); }
  .ns-nav-actions { display:flex; align-items:center; gap:24px; color:var(--color-ns-body); }
  .ns-cart { position:relative; cursor:pointer; transition:color 0.2s; }
  .ns-cart:hover { color:var(--color-ns-light); }
  .ns-cart-badge { position:absolute; top:-7px; right:-7px; background:var(--color-ns-accent); color:#ffffff; font-size:9px; font-weight:900; width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; }
  .ns-menu-wrap { position:relative; }
  .ns-menu-btn { display:flex; align-items:center; cursor:pointer; color:var(--color-ns-body); background:none; border:none; padding:0; transition:color 0.2s; }
  .ns-menu-btn:hover { color:var(--color-ns-light); }
  .ns-menu-dropdown {
    position:absolute; top:calc(100% + 12px); right:0;
    min-width:220px; padding:8px 0;
    background:var(--color-ns-panel); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
    border:1px solid rgba(255,255,255,0.06); border-radius:10px;
    opacity:0; visibility:hidden; transition:opacity 0.2s, visibility 0.2s;
    box-shadow:0 12px 32px rgba(0,0,0,0.4);
  }
  .ns-menu-wrap:hover .ns-menu-dropdown { opacity:1; visibility:visible; }
  .ns-menu-divider { height:1px; background:rgba(255,255,255,0.06); margin:6px 0; }
  .ns-menu-label {
    padding:8px 20px;
    font-size:10px; letter-spacing:0.15em; text-transform:uppercase;
    color:var(--color-ns-subtle);
  }
  .ns-menu-item {
    display:flex; align-items:center; gap:10px; width:100%; padding:10px 20px;
    font-size:13px; letter-spacing:0.08em; font-weight:500;
    color:var(--color-ns-body); background:none; border:none; cursor:pointer;
    transition:color 0.15s, background 0.15s; text-decoration:none; text-transform:none;
  }
  .ns-menu-item:hover { color:var(--color-ns-light); background:rgba(255,255,255,0.03); }

  @media (max-width: 768px) {
    .ns-nav-inner { padding:14px 16px; }
    .ns-brand-logo { height:32px; }
    .ns-nav-links { display:none; }
    .ns-nav-actions { gap:16px; }
  }
`;

interface SiteNavProps {
  activePage?: "home" | "ppf" | "tint";
}

export default function SiteNav({ activePage }: SiteNavProps) {
  const { dealer, logout, loading } = useAuth();
  const [location] = useLocation();
  const loginHref = location && location !== "/" ? `/dealer-login?returnTo=${encodeURIComponent(location)}` : "/dealer-login";

  return (
    <nav className="ns-nav">
      <div className="ns-nav-inner">
        <div className="ns-brand">
          <Link href="/">
            <img src={`${BASE}ns-logo.png`} alt="Nano-Shield Luxury Film" className="ns-brand-logo" />
          </Link>
        </div>
        <div className="ns-nav-links">
          <Link href="/color-tpu" className="ns-nav-link">Color TPU PPF</Link>
          <Link href="/tint-configurator" className="ns-nav-link">Chameleon Tint</Link>
          {!loading && !dealer && (
            <Link href="/dealer-signup" className="ns-nav-link">dealer application</Link>
          )}
        </div>
        <div className="ns-nav-actions">
          <div className="ns-menu-wrap">
            <button className="ns-menu-btn" aria-label="Menu">
              <Menu size={24} />
            </button>
            <div className="ns-menu-dropdown">
              {!loading && dealer ? (
                <>
                  <div className="ns-menu-label">
                    {dealer.status === "approved" ? "Approved Dealer" : dealer.status === "pending" ? "Pending Approval" : "Account"}
                  </div>
                  <div className="ns-menu-item" style={{ pointerEvents: "none", fontWeight: 600, color: "var(--color-ns-light)" }}>
                    <User size={15} />
                    {dealer.businessName}
                  </div>
                  <div className="ns-menu-divider" />
                  <button className="ns-menu-item" onClick={logout}>
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </>
              ) : !loading ? (
                <>
                  <Link href={loginHref} className="ns-menu-item">
                    <LogIn size={15} />
                    Sign In
                  </Link>

                </>
              ) : null}
            </div>
          </div>
          <div className="ns-cart">
            <ShoppingCart size={24} />
            <span className="ns-cart-badge">0</span>
          </div>
        </div>
      </div>
      <div className="ns-nav-accent" />
    </nav>
  );
}
