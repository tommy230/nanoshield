import React, { useEffect, useState } from "react";
import { Shield, Droplets, Sun, ChevronRight, ArrowRight, Zap } from "lucide-react";
import { Link } from "wouter";
import SiteNav, { navCss } from "../components/SiteNav";
import { useAuth } from "@/contexts/AuthContext";

const BASE = import.meta.env.BASE_URL;
const HERO_BACKGROUND_URL = `${BASE}hero.png`;

const proofItems = [
  { icon: Shield, eyebrow: "Protection", label: "Self-Healing TPU" },
  { icon: Droplets, eyebrow: "Maintenance", label: "Hydrophobic Topcoat" },
  { icon: Sun, eyebrow: "Performance", label: "99% UV Rejection" },
  { icon: Zap, eyebrow: "Durability", label: "10-Year Warranty" },
] as const;

const productCards = [
  {
    title: "Color Change TPU",
    description: "Transform your vehicle's appearance completely while getting the full protection of a premium TPU paint protection film.",
    image: `${BASE}01-color-change-tpu.png`,
    href: "/color-tpu",
    internal: true,
    ctaText: "View Options",
    badge: "324 Colors",
    price: "",
  },
  {
    title: "Chameleon Tint",
    description: "Head turning color shifting window tint that blocks 99% of UV rays and cuts interior heat. Style meets serious solar performance.",
    image: `${BASE}02-chameleon-windshield-tint.png`,
    href: "/tint-configurator",
    internal: true,
    ctaText: "View Options",
    badge: "From $349.99",
    price: "$349.99",
  },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;900&display=swap');

  @keyframes nsu-expand {
    0% { width: 0; opacity: 0; }
    100% { width: 40px; opacity: 1; }
  }

  .nsu-root { background-color:var(--color-ns-dark); color:var(--color-ns-light); min-height:100vh; display:flex; flex-direction:column; }
  .nsu-root * { font-family:'Inter', sans-serif; box-sizing:border-box; margin:0; padding:0; }
  .nsu-root .ns-nav * { margin:revert; padding:revert; }
  .nsu-root .ns-nav-inner { padding:18px 48px; }
  .nsu-root a { text-decoration:none; color:inherit; }

  .nsu-hero {
    position:relative; min-height:min(85vh, 780px); overflow:hidden;
    background:var(--color-ns-darker);
    display:flex; align-items:flex-end;
    padding-bottom:96px;
  }
  .nsu-hero-img { position:absolute; inset:0; }
  .nsu-hero-img img { width:100%; height:100%; object-fit:cover; object-position:center center; }
  .nsu-hero-overlay {
    position:absolute; inset:0; width:100%; height:100%;
    background:radial-gradient(circle at 20% 80%, rgba(18,20,24,0.95) 0%, rgba(18,20,24,0.6) 50%, rgba(18,20,24,0.1) 100%);
  }
  .nsu-hero-content { position:relative; z-index:10; padding:0 48px; width:100%; }
  .nsu-hero-title {
    font-size:clamp(48px, 6.5vw, 88px); font-weight:200;
    letter-spacing:-0.04em; line-height:0.95; text-transform:uppercase;
    background:linear-gradient(180deg, #ffffff 0%, #a8a8a8 100%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    margin-bottom:32px;
  }
  .nsu-hero-separator { width:128px; height:2px; background:linear-gradient(to right, var(--color-ns-accent), transparent); border-radius:9999px; margin-bottom:32px; animation:nsu-pulse 3s ease-in-out infinite; }
  @keyframes nsu-pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
  .nsu-hero-desc { font-size:16px; font-weight:300; line-height:1.65; color:var(--color-ns-body); max-width:640px; margin-bottom:48px; }
  .nsu-hero-cta {
    display:inline-flex; align-items:center; gap:12px;
    padding:16px 32px;
    background:transparent; color:var(--color-ns-light); border:1px solid rgba(255,255,255,0.1); border-radius:9999px;
    font-size:14px; font-weight:600; text-transform:uppercase; letter-spacing:0.1em;
    cursor:pointer; transition:all 0.3s ease-out;
  }
  .nsu-hero-cta:hover { border-color:rgba(129,140,248,0.5); background:rgba(129,140,248,0.05); color:#fff; }
  .nsu-hero-cta svg { width:16px; height:16px; color:var(--color-ns-accent); transition:transform 0.3s; }
  .nsu-hero-cta:hover svg { transform:translateX(4px); }

  .nsu-proof { position:relative; z-index:20; margin:-48px auto 96px; padding:0 48px; }
  .nsu-proof-bar { display:flex; background:rgba(14,16,18,0.9); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.04); border-radius:16px; overflow:hidden; box-shadow:0 25px 50px rgba(0,0,0,0.5); }
  .nsu-proof-item { flex:1; display:flex; align-items:center; gap:16px; padding:20px 24px; transition:background 0.3s; }
  .nsu-proof-item:hover { background:rgba(255,255,255,0.03); }
  .nsu-proof-divider { width:1px; background:rgba(255,255,255,0.04); flex-shrink:0; }
  .nsu-proof-icon { width:48px; height:48px; border-radius:50%; background:rgba(129,140,248,0.1); border:1px solid rgba(129,140,248,0.2); display:flex; align-items:center; justify-content:center; color:rgba(129,140,248,0.6); flex-shrink:0; transition:background 0.3s, color 0.3s; }
  .nsu-proof-item:hover .nsu-proof-icon { background:rgba(129,140,248,0.2); color:var(--color-ns-accent); }
  .nsu-proof-eyebrow { font-size:9px; text-transform:uppercase; letter-spacing:0.35em; color:var(--color-ns-accent); font-weight:700; margin-bottom:4px; }
  .nsu-proof-label { font-size:18px; font-weight:500; color:var(--color-ns-light); }

  .nsu-products { padding:64px 48px 48px; background:var(--color-ns-dark); width:100%; }
  .nsu-products-header { text-align:center; margin-bottom:64px; }
  .nsu-products-eyebrow-wrap { position:relative; display:inline-block; margin-bottom:24px; }
  .nsu-products-eyebrow { font-size:9px; text-transform:uppercase; letter-spacing:0.35em; color:var(--color-ns-accent); font-weight:700; }
  .nsu-products-underline { position:absolute; bottom:-8px; left:50%; transform:translateX(-50%); height:1px; background:rgba(129,140,248,0.5); width:0; opacity:0; animation:nsu-expand 1s ease-out 0.2s forwards; }
  .nsu-products-title { font-size:clamp(28px, 4vw, 48px); font-weight:300; color:var(--color-ns-light); margin-bottom:16px; }
  .nsu-products-sub { font-size:18px; color:var(--color-ns-body); max-width:448px; margin:0 auto; }

  .nsu-card-grid { display:grid; grid-template-columns:1fr 1fr; gap:32px; }
  .nsu-card { border-radius:20px; border:1px solid rgba(255,255,255,0.04); background:var(--color-ns-darker); overflow:hidden; transition:all 0.4s ease-out; cursor:pointer; display:flex; flex-direction:column; }
  .nsu-card:hover { border-color:rgba(129,140,248,0.3); box-shadow:0 25px 50px rgba(0,0,0,0.3), 0 0 40px rgba(129,140,248,0.03); transform:translateY(-4px); }
  .nsu-card-img-wrap { position:relative; width:100%; aspect-ratio:16/10; overflow:hidden; background:var(--color-ns-panel); }
  .nsu-card-img-wrap img { width:100%; height:100%; object-fit:cover; transition:transform 0.7s ease-out; }
  .nsu-card:hover .nsu-card-img-wrap img { transform:scale(1.05); }
  .nsu-card-badge { position:absolute; top:16px; right:16px; background:rgba(14,16,18,0.8); backdrop-filter:blur(12px); font-family:monospace; font-size:11px; letter-spacing:0.05em; padding:6px 12px; border-radius:9999px; border:1px solid rgba(255,255,255,0.1); color:var(--color-ns-light); z-index:5; }
  .nsu-card-gradient { position:absolute; bottom:0; left:0; width:100%; height:50%; background:linear-gradient(to top, var(--color-ns-darker), transparent); pointer-events:none; }
  .nsu-card-body { position:relative; padding:32px 40px; display:flex; flex-direction:column; flex:1; }
  .nsu-card-header { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:16px; }
  .nsu-card-title { font-size:24px; font-weight:300; color:#fff; }
  .nsu-card-price { font-size:14px; font-weight:500; color:var(--color-ns-body); background:rgba(255,255,255,0.03); padding:4px 12px; border-radius:9999px; border:1px solid rgba(255,255,255,0.05); flex-shrink:0; }
  .nsu-card-desc { font-size:14px; font-weight:300; line-height:1.6; color:var(--color-ns-body); margin-bottom:32px; flex:1; }
  .nsu-card-cta { display:inline-flex; align-items:center; gap:8px; font-size:14px; font-weight:500; letter-spacing:0.03em; color:var(--color-ns-light); transition:color 0.3s; }
  .nsu-card:hover .nsu-card-cta { color:var(--color-ns-accent); }
  .nsu-card-cta svg { transition:transform 0.3s; }
  .nsu-card:hover .nsu-card-cta svg { transform:translateX(6px); }

  .nsu-footer { padding:64px 24px; border-top:1px solid rgba(255,255,255,0.04); opacity:0.6; transition:opacity 0.3s; text-align:center; display:flex; flex-direction:column; align-items:center; }
  .nsu-footer:hover { opacity:1; }
  .nsu-footer-brand { font-size:14px; font-weight:700; text-transform:uppercase; letter-spacing:0.2em; color:var(--color-ns-light); margin-bottom:32px; }
  .nsu-footer-links { display:flex; flex-wrap:wrap; justify-content:center; gap:24px 40px; margin-bottom:32px; }
  .nsu-footer-link { font-size:12px; font-weight:500; color:var(--color-ns-body); transition:color 0.3s; }
  .nsu-footer-link:hover { color:#fff; }
  .nsu-footer-copy { font-size:10px; text-transform:uppercase; letter-spacing:0.1em; color:var(--color-ns-subtle); }

  @media (max-width: 768px) {
    .nsu-hero { min-height:min(75vh, 560px); padding-bottom:64px; }
    .nsu-hero-content { padding:0 24px; }
    .nsu-hero-desc { font-size:15px; max-width:100%; margin-bottom:32px; }
    .nsu-hero-cta { padding:14px 24px; font-size:13px; }

    .nsu-proof { padding:0 16px; margin:-36px auto 64px; }
    .nsu-proof-bar { flex-direction:column; }
    .nsu-proof-divider { width:100%; height:1px; }
    .nsu-proof-item { padding:16px 20px; }

    .nsu-products { padding:48px 24px 32px; }
    .nsu-products-header { margin-bottom:40px; }
    .nsu-products-title { font-size:28px; }
    .nsu-products-sub { font-size:15px; }
    .nsu-card-grid { grid-template-columns:1fr; gap:24px; }
    .nsu-card-body { padding:24px; }
    .nsu-card-title { font-size:20px; }

    .nsu-footer { padding:48px 24px; }
    .nsu-footer-links { gap:16px 24px; }
  }
`;

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const { isApproved } = useAuth();
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="nsu-root">
      <style>{navCss}{css}</style>
      <SiteNav activePage="home" />
      <section className="nsu-hero">
        <div className="nsu-hero-img">
          <img src={HERO_BACKGROUND_URL} alt="McLaren with NanoShield protection" />
        </div>
        <div className="nsu-hero-overlay" />
        <div className="nsu-hero-content">
          <h1 className="nsu-hero-title">NANO-SHIELD</h1>
          <div className="nsu-hero-separator" />
          <p className="nsu-hero-desc">
            Advanced paint protection films and automotive window tints engineered for those who demand the highest tier of surface defense and aesthetic refinement.
          </p>
          <a href="#products" className="nsu-hero-cta">
            <span>SHOP NOW</span>
            <ChevronRight />
          </a>
        </div>
      </section>
      <section className="nsu-proof">
        <div className="nsu-proof-bar">
          {proofItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <React.Fragment key={item.label}>
                {i > 0 && <div className="nsu-proof-divider" />}
                <div className="nsu-proof-item">
                  <div className="nsu-proof-icon">
                    <Icon size={24} />
                  </div>
                  <div>
                    <div className="nsu-proof-eyebrow">{item.eyebrow}</div>
                    <div className="nsu-proof-label">{item.label}</div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </section>
      <section id="products" className="nsu-products">
        <div className="nsu-products-header">
          <div className="nsu-products-eyebrow-wrap">
            <div className="nsu-products-eyebrow">Shop the Lineup</div>
            {mounted && <div className="nsu-products-underline" />}
          </div>
          <h2 className="nsu-products-title">Find the Right Film</h2>

        </div>

        <div className="nsu-card-grid">
          {productCards.map((card) => {
            const inner = (
              <>
                <div className="nsu-card-img-wrap">
                  <img src={card.image} alt={card.title} />

                  <div className="nsu-card-gradient" />
                </div>
                <div className="nsu-card-body">
                  <div className="nsu-card-header">
                    <div className="nsu-card-title">{card.title}</div>
                    {card.price && isApproved && <div className="nsu-card-price">{card.price}</div>}
                  </div>
                  <p className="nsu-card-desc">{card.description}</p>
                  <div className="nsu-card-cta">
                    <span>{card.ctaText}</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              </>
            );
            return card.internal ? (
              <Link key={card.title} href={card.href} className="nsu-card">{inner}</Link>
            ) : (
              <a key={card.title} href={card.href} className="nsu-card">{inner}</a>
            );
          })}
        </div>
      </section>
      <div className="nsu-footer">
        <div className="nsu-footer-brand">NanoShield</div>
        <div className="nsu-footer-links">
          <a href="#" className="nsu-footer-link">Contact Us</a>
          <a href="#" className="nsu-footer-link">Privacy Policy</a>
          <a href="#" className="nsu-footer-link">Terms &amp; Conditions</a>
          <a href="#" className="nsu-footer-link">Affiliate Agreement</a>
          <a href="#" className="nsu-footer-link">SMS Consent</a>
          <a href="#" className="nsu-footer-link">Cookie Policy</a>
        </div>
        <div className="nsu-footer-copy">© {new Date().getFullYear()} NanoShield. All rights reserved.</div>
      </div>
    </div>
  );
}
