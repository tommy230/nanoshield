import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Car, ShoppingCart, Check, Sparkles,
  Shield, Palette, ChevronRight, Lock,
  AlertTriangle, CheckCircle2, Flame, Scale
} from "lucide-react";
import SiteNav, { navCss } from "../components/SiteNav";
import { useAuth } from "@/contexts/AuthContext";

type ColorStop = { position: number; color: string; opacity: number };
type VltColorMap = Record<number, ColorStop[]>;
type TintPreset = {
  id: string; name: string; price: number; description: string;
  reflectionLabel: string; reflectionOpacity: number;
  gradientDirection: string;
  colorStops: ColorStop[];
  vltColorMap?: VltColorMap;
  blendMode: "color" | "multiply" | "overlay" | "soft-light" | "normal";
  desaturationOpacity: number;
  specularOpacity: number;
  vltOptions: number[];
};

const TINT_PRESETS: TintPreset[] = [
  {
    id: "twilight", name: "Twilight Amethyst", price: 65,
    description: "Lavender to plum transition optimized for heat rejection and premium aesthetics.",
    reflectionLabel: "0%", reflectionOpacity: 0,
    gradientDirection: "90deg",
    colorStops: [
      { position: 0, color: "#c9b3e3", opacity: 0.4 },
      { position: 100, color: "#8b6bb3", opacity: 0.4 },
    ],
    vltColorMap: {
      82: [
        { position: 0, color: "#c9b3e3", opacity: 0.4 },
        { position: 100, color: "#8b6bb3", opacity: 0.4 },
      ],
      74: [
        { position: 0, color: "#b399d9", opacity: 0.4 },
        { position: 100, color: "#7a5a99", opacity: 0.4 },
      ],
      60: [
        { position: 0, color: "#9d7fca", opacity: 0.4 },
        { position: 100, color: "#654d85", opacity: 0.4 },
      ],
    },
    blendMode: "color", desaturationOpacity: 0.45, specularOpacity: 0.05,
    vltOptions: [82, 74, 60],
  },
  {
    id: "crimson", name: "Crimson Shift", price: 70,
    description: "Bold red shifting to burnt orange. Engineered for a striking, high impact profile.",
    reflectionLabel: "0%", reflectionOpacity: 0,
    gradientDirection: "90deg",
    colorStops: [
      { position: 0, color: "#e74c3c", opacity: 0.4 },
      { position: 100, color: "#922b21", opacity: 0.4 },
    ],
    blendMode: "color", desaturationOpacity: 0.45, specularOpacity: 0.05,
    vltOptions: [74],
  },
  {
    id: "imperial", name: "Imperial Purple", price: 65,
    description: "Vivid royal purple with violet depths. Exceptional clarity and a regal finish.",
    reflectionLabel: "0%", reflectionOpacity: 0,
    gradientDirection: "90deg",
    colorStops: [
      { position: 0, color: "#8b00ff", opacity: 0.4 },
      { position: 100, color: "#0033cc", opacity: 0.4 },
    ],
    blendMode: "color", desaturationOpacity: 0.45, specularOpacity: 0.05,
    vltOptions: [71],
  },
  {
    id: "enchantress", name: "Blue Enchantress", price: 75,
    description: "Deep cyan shifting to midnight teal for a sophisticated, oceanic look.",
    reflectionLabel: "0%", reflectionOpacity: 0,
    gradientDirection: "90deg",
    colorStops: [
      { position: 0, color: "#2e86c1", opacity: 0.4 },
      { position: 100, color: "#1a5276", opacity: 0.4 },
    ],
    blendMode: "color", desaturationOpacity: 0.45, specularOpacity: 0.05,
    vltOptions: [70],
  },
  {
    id: "phantom", name: "Phantom Green Gold", price: 85,
    description: "Purple to emerald transition with golden highlights. The ultimate chameleon effect.",
    reflectionLabel: "0%", reflectionOpacity: 0,
    gradientDirection: "90deg",
    colorStops: [
      { position: 0, color: "#a44185", opacity: 0.4 },
      { position: 100, color: "#1e8449", opacity: 0.4 },
    ],
    blendMode: "color", desaturationOpacity: 0.45, specularOpacity: 0.05,
    vltOptions: [73],
  },
];

const AnimationStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;900&display=swap');
    @keyframes pearl-shimmer { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
    @keyframes light-sweep { 0% { transform: translateX(-200%) skewX(-30deg); } 100% { transform: translateX(200%) skewX(-30deg); } }
    .text-gradient { background: linear-gradient(to right, #ffffff, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .glass-card { background: rgba(18, 20, 24, 0.6); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.04); }
    .glass-panel { background: linear-gradient(145deg, rgba(18,20,24,0.9) 0%, rgba(14,16,18,0.95) 100%); box-shadow: 0 0 40px rgba(0,0,0,0.4); border: 1px solid rgba(255, 255, 255, 0.04); }
    .grid-lines { background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 40px 40px; }
    .smooth-stop { transition: stop-color 0.8s ease-in-out; }

  `}</style>
);

const SectionHeader = ({ title, subtitle, centered = false }: { title: string; subtitle: string; centered?: boolean }) => (
  <div className={`mb-16 ${centered ? "text-center" : "text-center lg:text-left"}`}>
    <h2 className="text-3xl font-extralight tracking-tight text-white mb-4 uppercase" style={{ letterSpacing:'0.1em' }}>{title}</h2>
    <p className={`text-sm tracking-wide leading-relaxed max-w-2xl mx-auto ${centered ? "" : "lg:mx-0"}`} style={{ color:'var(--color-ns-body)', fontWeight:300 }}>
      {subtitle}
    </p>
  </div>
);

const WINDSHIELD_PATH = "M917 1214C897 1245 850.6 1317 825 1357L818.5 1371.5L815 1383.5V1396.5L818.5 1406L825 1412L836 1418L851 1424.5L908.5 1441.5L956.5 1452.5L1048.5 1475L1129 1495.5L1230.5 1518L1297.5 1531.5L1391 1548.5L1497 1564.5L1579 1573L1658.5 1579.5L1802 1585L1830.5 1580.5L1844 1570C1846.4 1567.6 1864.33 1529 1873 1510L1932.5 1347L1956 1286L1978.5 1226L2006 1155V1148L2005 1137L2001 1121.5L1994.5 1108.5L1987 1098.5L1979.5 1092.5L1969 1085.5L1953 1078.5L1936.5 1075.5L1870.5 1067L1746 1051L1670 1040L1604.5 1031.5L1598.5 1032.5L1591.5 1057L1575 1102L1568.5 1117L1563 1123.5L1553 1122L1523.5 1118.5L1476 1112L1442.5 1106L1419.5 1100L1416.5 1095.5L1419.5 1087L1494.5 1014L1411.5 995L1318 976L1236.5 964L1218 961.5H1197L1165 964L1149 969L1135 976L1084 1014L1035 1064L974 1136L917 1214Z";

function CarVisualizer({ tint, vlt }: { tint: TintPreset; vlt: number }) {
  const gradientId = `tint-${tint.id}-${vlt}`;
  const vltScale = vlt / 100;
  const darkenOpacity = Math.max(0, (1 - vltScale) * 0.35);
  const activeColorStops = tint.vltColorMap?.[vlt] || tint.colorStops;

  const isHorizontal = tint.gradientDirection.includes("90");
  const gradX2 = isHorizontal ? "100%" : "0%";
  const gradY2 = isHorizontal ? "0%" : "100%";

  return (
    <div className="relative group overflow-hidden rounded-2xl bg-[#0a0a0a] border border-white/5 shadow-2xl aspect-[16/11]">
      <img
        src={`${import.meta.env.BASE_URL}car-visualizer.jpeg`}
        alt="Vehicle Preview"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.02]"
      />
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 3000 3000"
        preserveAspectRatio="xMidYMid slice"
        style={{ pointerEvents: "none" }}
      >
        <defs>
          <mask id="windshield-mask">
            <path d={WINDSHIELD_PATH} fill="white" />
          </mask>

          <filter id="desaturate">
            <feColorMatrix type="saturate" values="0" />
          </filter>

          <linearGradient id={gradientId} x1="0%" y1="0%" x2={gradX2} y2={gradY2}>
            {activeColorStops.map((stop, idx) => (
              <stop
                key={idx}
                offset={`${stop.position}%`}
                stopColor={stop.color}
                stopOpacity={stop.opacity}
                className="smooth-stop"
              />
            ))}
          </linearGradient>

          <linearGradient id="reflection-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="40%" stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
          </linearGradient>

          <linearGradient id="specular-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="65%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect
          width="100%"
          height="100%"
          fill="#5D8AA8"
          mask="url(#windshield-mask)"
          opacity={tint.desaturationOpacity}
          style={{ mixBlendMode: "color" }}
        />

        <rect
          width="100%"
          height="100%"
          fill="#a8c4d8"
          mask="url(#windshield-mask)"
          opacity={tint.desaturationOpacity * 0.25}
          style={{ mixBlendMode: "luminosity" }}
        />

        <rect
          width="100%"
          height="100%"
          fill={`url(#${gradientId})`}
          mask="url(#windshield-mask)"
          style={{ transition: "opacity 300ms ease-out", mixBlendMode: tint.blendMode }}
        />

        {darkenOpacity > 0 && (
          <rect
            width="100%"
            height="100%"
            fill="black"
            mask="url(#windshield-mask)"
            opacity={darkenOpacity}
            className="transition-opacity duration-700"
          />
        )}

        {tint.reflectionOpacity > 0 && (
          <rect
            width="100%"
            height="100%"
            fill="url(#reflection-gradient)"
            mask="url(#windshield-mask)"
            opacity={tint.reflectionOpacity}
          />
        )}

        {tint.specularOpacity > 0 && (
          <rect
            width="100%"
            height="100%"
            fill="url(#specular-gradient)"
            mask="url(#windshield-mask)"
            opacity={tint.specularOpacity}
            style={{ mixBlendMode: "overlay" }}
          />
        )}
      </svg>
      <div className="absolute bottom-4 left-4 flex items-center gap-2 px-4 py-2 glass-card rounded-full border border-white/10">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
        <span className="text-[10px] text-white font-medium uppercase tracking-wider">Live Visualization</span>
      </div>
    </div>
  );
}

export default function TintConfiguratorPage() {
  const [activeTint, setActiveTint] = useState(TINT_PRESETS[0]);
  const [activeVlt, setActiveVlt] = useState(TINT_PRESETS[0].vltOptions[0]);
  const [isAdded, setIsAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("sample");
  const { dealer, isApproved, isPending } = useAuth();

  const handleTintChange = (t: TintPreset) => {
    setActiveTint(t);
    setActiveVlt(t.vltOptions[0]);
    setSelectedSize("sample");
  };

  useEffect(() => {
    setIsAdded(false);
  }, [activeTint, activeVlt]);

  return (
    <div className="min-h-screen bg-ns-dark text-ns-body font-sans selection:bg-indigo-500/30 selection:text-white" style={{ fontFamily:"'Inter', sans-serif" }}>
      <AnimationStyles />
      <style>{navCss}</style>

      <SiteNav activePage="tint" />

      <main className="pt-16 sm:pt-24 lg:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">

          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white tracking-tighter leading-[1.1]">
                Refine Your <span className="text-gradient font-normal">Perspective</span>
              </h1>
            </div>
            <div className="space-y-6">
              <CarVisualizer tint={activeTint} vlt={activeVlt} />
            </div>
          </div>

          <div className="lg:col-span-5 h-full">
            <div className="glass-panel rounded-3xl p-8 lg:p-10 flex flex-col h-full">

              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-3xl text-white font-light tracking-tight">{activeTint.name}</h3>
                  <p className="text-sm text-slate-400 mt-1.5 leading-relaxed max-w-[300px]">{activeTint.description}</p>
                </div>
                <div className="text-right flex-shrink-0 pl-4">
                  {isApproved ? (
                    <p className="text-3xl text-white font-light tracking-tighter">
                      ${selectedSize === "full" ? activeTint.price * 3 : activeTint.price}.00
                    </p>
                  ) : isPending ? (
                    <p className="text-sm text-amber-400/80 italic mt-1">Pending approval</p>
                  ) : (
                    <Link href="/dealer-login?returnTo=/tint-configurator" className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors mt-1">
                      <Lock size={14} />
                      <span>Log in for pricing</span>
                    </Link>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-ns-accent mb-3">Color Profile</p>
                  <div className="grid grid-cols-5 gap-3">
                    {TINT_PRESETS.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => handleTintChange(t)}
                        className={`group relative flex justify-center p-1 rounded-xl transition-all ${
                          activeTint.id === t.id
                            ? "ring-2 ring-white/50 bg-white/10"
                            : "ring-1 ring-white/5 hover:ring-white/20 hover:bg-white/5"
                        }`}
                        title={t.name}
                      >
                        <div className="w-full aspect-square rounded-lg shadow-inner overflow-hidden relative">
                          <div
                            className="absolute inset-0 animate-[pearl-shimmer_12s_linear_infinite]"
                            style={{
                              background: `linear-gradient(135deg, ${t.colorStops.map(s => s.color).join(', ')})`,
                              backgroundSize: '200% 200%'
                            }}
                          />
                          {activeTint.id === t.id && (
                             <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-[2px]">
                               <Check className="w-4 h-4 text-white drop-shadow-md" />
                             </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-ns-accent">Light Transmission (VLT)</p>
                    <span className="text-xs text-slate-500 uppercase tracking-wider">{activeVlt}% Visible</span>
                  </div>
                  <div className={`flex gap-2 p-1 bg-black/50 rounded-xl border border-white/5 ${activeTint.vltOptions.length === 1 ? "max-w-[120px]" : ""}`}>
                    {activeTint.vltOptions.map((v) => (
                      <button
                        key={v}
                        onClick={() => setActiveVlt(v)}
                        className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                          activeVlt === v
                            ? "bg-white text-black shadow-lg"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {v}%
                      </button>
                    ))}
                  </div>
                </div>

                {isApproved && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-ns-accent">Roll Size</p>
                    <span className="text-xs text-slate-500 uppercase tracking-wider">
                      {selectedSize === "full" ? '60" x 100ft' : '20" x 60"'}
                    </span>
                  </div>
                  <div className="flex gap-2 p-1 bg-black/50 rounded-xl border border-white/5">
                    {[
                      { id: "sample", label: "Sample Roll" },
                      { id: "full", label: "Full Roll" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedSize(opt.id)}
                        className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                          selectedSize === opt.id
                            ? "bg-white text-black shadow-lg"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                )}
              </div>

              <div className="mt-6 space-y-2">
                {isApproved ? (
                <button
                  onClick={() => { setIsAdded(true); setTimeout(() => setIsAdded(false), 2500); }}
                  disabled={isAdded || !selectedSize}
                  className={`w-full py-4 rounded-xl text-sm font-bold uppercase tracking-[0.15em] transition-all duration-500 flex items-center justify-center gap-3 overflow-hidden relative group ${
                    isAdded
                    ? "bg-emerald-500 text-white border border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    : !selectedSize
                    ? "bg-white/10 text-slate-500 cursor-default"
                    : "bg-white text-black hover:bg-gray-200 active:scale-[0.98]"
                  }`}
                >
                  {isAdded ? (
                    <span className="flex items-center gap-2">
                      <Check className="w-4 h-4" /> Added to Cart
                    </span>
                  ) : !selectedSize ? (
                    <>Select a roll size</>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                      Add to Cart
                    </>
                  )}
                </button>
                ) : isPending ? (
                  <div className="w-full py-4 rounded-xl text-sm font-bold uppercase tracking-[0.15em] bg-white/10 text-amber-400/80 flex items-center justify-center gap-3">
                    Account pending approval
                  </div>
                ) : (
                  <>
                    <Link
                      href="/dealer-login?returnTo=/tint-configurator"
                      className="w-full py-4 rounded-xl text-sm font-bold uppercase tracking-[0.15em] bg-white text-black hover:bg-gray-200 active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-3"
                    >
                      <Lock size={16} /> Log In to See Pricing
                    </Link>
                    <Link
                      href="/dealer-signup"
                      className="w-full py-3 rounded-xl text-xs font-semibold uppercase tracking-[0.15em] border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      Create a New Account
                    </Link>
                  </>
                )}
              </div>

            </div>
          </div>
        </div>
      </main>

      <section id="performance" className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-12 border-t border-white/5 bg-ns-darker overflow-hidden">
        <div className="absolute inset-0 grid-lines opacity-30 pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 blur-[150px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <SectionHeader
            centered
            title="Engineered Performance"
            subtitle="Beyond aesthetics. Our proprietary film architecture provides uncompromised protection, thermal rejection, and optical clarity for the modern driver."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Sparkles, title: "UV Protection", label: "Solar Defense", id: "RAD-02", desc: "Rejects 99%+ of harmful UV rays. Protects occupants and prevents premature fading of delicate leather.", shimmer: "rgba(99,102,241,0.08)" },
              { icon: Shield, title: "Privacy & Security", label: "Confidentiality", id: "SEC-05", desc: "Enhanced exterior reflectivity reduces inward visibility while maintaining a high clarity view from within.", shimmer: "rgba(5,150,105,0.08)" },
              { icon: Car, title: "Interior Guard", label: "Longevity", id: "PRT-06", desc: "Acts as a thermal barrier for electronics and dashboards, preventing structural cracking over time.", shimmer: "rgba(34,197,94,0.08)" }
            ].map((benefit, i) => (
              <div
                key={i}
                className="glass-card p-10 rounded-3xl group hover:border-white/30 transition-all duration-500 relative overflow-hidden flex flex-col border border-white/5 hover:shadow-2xl hover:-translate-y-1"
              >
                <div className="absolute top-8 right-8 text-[9px] font-bold text-slate-700 group-hover:text-slate-400 transition-colors duration-300 uppercase tracking-[0.3em]">
                  {benefit.id}
                </div>
                <div
                   className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                   style={{ background: `radial-gradient(circle at 100% 0%, ${benefit.shimmer} 0%, transparent 80%)` }}
                />
                <div className="relative z-10 flex-grow">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-white/10 group-hover:scale-110 transition-all duration-500 mb-8">
                    <benefit.icon className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <div className="mb-5">
                    <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-ns-accent mb-2">{benefit.label}</p>
                    <h4 className="text-2xl font-light text-white tracking-tight">{benefit.title}</h4>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed font-light group-hover:text-slate-300 transition-colors duration-300">
                    {benefit.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-12 border-t border-white/5 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <SectionHeader
            centered
            title="Why Our Chameleon Tint?"
            subtitle="Not all chameleon films are created equal. Here's what separates NanoShield from inferior alternatives on the market."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Flame,
                title: "High Performance Heat Rejection",
                id: "HT-01",
                risk: "Offer almost no IR rejection. They are merely colored plastic films that provide a visual effect but fail to reduce interior heat or improve comfort.",
                advantage: "Infused with a high concentration nano ceramic layer that blocks up to 90% of infrared heat, ensuring a cool and comfortable cabin without a dark tint.",
                shimmer: "rgba(167,139,250,0.08)",
              },
              {
                icon: Palette,
                title: "Vibrant, Stable Aesthetics",
                id: "HT-02",
                risk: "Use cheap dyes that fade quickly or create an inconsistent, cheap looking rainbow effect. Their color degrades rapidly under sun exposure.",
                advantage: "Utilizes automotive grade pigments and a multi layer sputtering process, ensuring a dynamic and stable color shift effect that resists fading for years.",
                shimmer: "rgba(52,211,153,0.08)",
              },
              {
                icon: Scale,
                title: "Legal Compliance & Optical Clarity",
                id: "HT-03",
                risk: "Often have a VLT that is too low to be legal for windshields. They can also cause haze and distortion, posing a significant safety risk to drivers.",
                advantage: "Engineered with a high VLT (70%+) and built on an optical grade PET substrate, guaranteeing it meets legal standards and provides a distortion free view.",
                shimmer: "rgba(56,189,248,0.08)",
              },
            ].map((tech, i) => (
              <div
                key={i}
                className="glass-card p-8 sm:p-10 rounded-3xl border border-white/5 hover:border-white/20 transition-all duration-500 relative overflow-hidden group"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ background: `radial-gradient(circle at 100% 0%, ${tech.shimmer} 0%, transparent 80%)` }}
                />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-white/10 transition-all duration-500">
                      <tech.icon className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                    <span className="text-[9px] font-bold text-slate-700 group-hover:text-slate-400 transition-colors duration-300 uppercase tracking-[0.3em]">{tech.id}</span>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-light text-white tracking-tight mb-8">{tech.title}</h4>
                  <div className="space-y-6">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <AlertTriangle className="w-4 h-4 text-amber-500" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-500/80 mb-1.5">Risk of Inferior Films</p>
                        <p className="text-sm text-slate-500 leading-relaxed font-light">{tech.risk}</p>
                      </div>
                    </div>
                    <div className="h-px bg-white/5" />
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-500/80 mb-1.5">Our Advantage</p>
                        <p className="text-sm text-slate-500 leading-relaxed font-light group-hover:text-slate-300 transition-colors duration-300">{tech.advantage}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ padding:'64px 24px', borderTop:'1px solid rgba(255,255,255,0.04)', opacity:0.6, transition:'opacity 0.3s', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center' }} onMouseEnter={e => (e.currentTarget.style.opacity = '1')} onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}>
        <div style={{ fontSize:14, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.2em', color:'var(--color-ns-light)', marginBottom:32 }}>NanoShield</div>
        <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'24px 40px', marginBottom:32 }}>
          <a href="#" style={{ fontSize:12, fontWeight:500, color:'var(--color-ns-body)', textDecoration:'none' }}>Contact Us</a>
          <a href="#" style={{ fontSize:12, fontWeight:500, color:'var(--color-ns-body)', textDecoration:'none' }}>Privacy Policy</a>
          <a href="#" style={{ fontSize:12, fontWeight:500, color:'var(--color-ns-body)', textDecoration:'none' }}>Terms &amp; Conditions</a>
          <a href="#" style={{ fontSize:12, fontWeight:500, color:'var(--color-ns-body)', textDecoration:'none' }}>Affiliate Agreement</a>
          <a href="#" style={{ fontSize:12, fontWeight:500, color:'var(--color-ns-body)', textDecoration:'none' }}>SMS Consent</a>
          <a href="#" style={{ fontSize:12, fontWeight:500, color:'var(--color-ns-body)', textDecoration:'none' }}>Cookie Policy</a>
        </div>
        <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--color-ns-subtle)' }}>© {new Date().getFullYear()} NanoShield. All rights reserved.</div>
      </footer>
    </div>
  );
}
