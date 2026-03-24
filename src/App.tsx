import { Switch, Route, Router as WouterRouter } from "wouter";
import { lazy, Suspense } from "react";
import { AuthProvider } from "@/contexts/AuthContext";

const HomePage = lazy(() => import("@/pages/home"));
const ColorTPUPage = lazy(() => import("@/pages/color-tpu"));
const TintConfiguratorPage = lazy(() => import("@/pages/tint-configurator"));
const DealerLoginPage = lazy(() => import("@/pages/dealer-login"));
const DealerSignupPage = lazy(() => import("@/pages/dealer-signup"));

function Loading() {
  return (
    <div style={{ minHeight:"100vh", background:"#121418", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:32, height:32, border:"1px solid rgba(255,255,255,0.15)", transform:"rotate(45deg)", display:"flex", alignItems:"center", justifyContent:"center", background:"#1a1d22", animation:"pulse 2s infinite" }}>
        <span style={{ transform:"rotate(-45deg)", fontSize:9, fontWeight:900, letterSpacing:"-0.05em", color:"#c8c8c8" }}>NS</span>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<Loading />}>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/color-tpu" component={ColorTPUPage} />
        <Route path="/tint-configurator" component={TintConfiguratorPage} />
        <Route path="/dealer-login" component={DealerLoginPage} />
        <Route path="/dealer-signup" component={DealerSignupPage} />
        <Route>
          <div style={{ minHeight:"100vh", background:"#121418", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
            <h1 style={{ color:"#e0e0e0", fontSize:48, fontWeight:200, fontFamily:"Inter, sans-serif" }}>404</h1>
            <p style={{ color:"#808388", fontSize:12, letterSpacing:"0.2em", textTransform:"uppercase" }}>Page not found</p>
            <a href={import.meta.env.BASE_URL} style={{ color:"#c8c8c8", fontSize:10, letterSpacing:"0.15em", textTransform:"uppercase", marginTop:16 }}>Return Home</a>
          </div>
        </Route>
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </WouterRouter>
  );
}

export default App;
