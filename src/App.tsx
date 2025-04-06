import { useState, useEffect } from "react";
import Chat from "./components/Chat";
import Login from "./components/Login";
import Registration from "./components/Registration";
import UserSettings from "./components/UserSettings";
import { supabase } from "./services/supabaseClient";

type View = "login" | "register" | "chat" | "settings";

function App() {
  const [session, setSession] = useState(supabase.auth.session());
  const [view, setView] = useState<View>("login");

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setView("chat");
      } else {
        setView("login");
      }
    });
    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  if (!session) {
    if (view === "register") {
      return <Registration onSwitchToLogin={() => setView("login")} />;
    }
    return <Login onLogin={() => setView("chat")} onSwitchToRegister={() => setView("register")} />;
  }

  if (view === "chat") {
    return <Chat onOpenSettings={() => setView("settings")} />;
  }

  if (view === "settings") {
    return <UserSettings onBack={() => setView("chat")} />;
  }

  return null;
}

export default App;
