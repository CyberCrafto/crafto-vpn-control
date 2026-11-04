import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AppProvider } from "./state/AppStore";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { Dashboard } from "./components/dashboard/Dashboard";
import { Terminal } from "./components/terminal/Terminal";
import type { Page } from "./lib/types";

const PAGE_HASH: Record<Page, string> = {
  dashboard: "#/dashboard",
  terminal: "#/terminal",
};

/** Hash routing works on any static host (GitHub Pages) without rewrites. */
function pageFromHash(): Page {
  if (typeof window === "undefined") return "dashboard";
  const value = window.location.hash.replace(/^#\/?/, "").toLowerCase();
  return value.startsWith("terminal") ? "terminal" : "dashboard";
}

function Shell() {
  const [page, setPage] = useState<Page>(pageFromHash);
  const [mobileNav, setMobileNav] = useState(false);
  const [highlightSettings, setHighlightSettings] = useState(false);

  const navigate = useCallback((next: Page) => {
    setPage(next);
    setMobileNav(false);
    if (window.location.hash !== PAGE_HASH[next]) {
      window.history.pushState(null, "", PAGE_HASH[next]);
    }
  }, []);

  // keep the initial URL addressable and react to back/forward navigation
  useEffect(() => {
    if (!window.location.hash) {
      window.history.replaceState(null, "", PAGE_HASH[pageFromHash()]);
    }
    const sync = () => setPage(pageFromHash());
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  const openSettings = useCallback(() => {
    setPage("dashboard");
    setMobileNav(false);
    setHighlightSettings(false);
    window.setTimeout(() => setHighlightSettings(true), 40);
    window.setTimeout(() => setHighlightSettings(false), 2800);
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.key === "1") {
        event.preventDefault();
        navigate("dashboard");
      }
      if (event.key === "2") {
        event.preventDefault();
        navigate("terminal");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate]);

  useEffect(() => {
    document.body.style.overflow = mobileNav ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNav]);

  return (
    <div className="app-bg flex h-[100dvh] w-full overflow-hidden">
      <div className="hidden h-full lg:block">
        <Sidebar page={page} onNavigate={navigate} onSettings={openSettings} />
      </div>

      <AnimatePresence>
        {mobileNav && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setMobileNav(false)}
              className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "tween", duration: 0.22, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-50 h-full lg:hidden"
            >
              <Sidebar
                page={page}
                onNavigate={navigate}
                onSettings={openSettings}
                onClose={() => setMobileNav(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          page={page}
          onOpenSidebar={() => setMobileNav(true)}
          onNavigate={navigate}
          onSettings={openSettings}
        />

        <main className="relative min-h-0 flex-1">
          <AnimatePresence mode="wait" initial={false}>
            {page === "dashboard" ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="h-full overflow-y-auto"
              >
                <Dashboard onNavigate={navigate} highlightSettings={highlightSettings} />
              </motion.div>
            ) : (
              <motion.div
                key="terminal"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="h-full min-h-0"
              >
                <Terminal onNavigate={navigate} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
