import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";

interface UserSettingsProps {
  onBack: () => void;
}

export default function UserSettings({ onBack }: UserSettingsProps) {
  const [chatbotApi, setChatbotApi] = useState("");
  const [loading, setLoading] = useState(false);
  const user = supabase.auth.user();

  useEffect(() => {
    async function loadSettings() {
      if (user) {
        const { data, error } = await supabase
          .from("user_settings")
          .select("chatbot_api")
          .eq("user_id", user.id)
          .single();
        if (error && error.code !== "PGRST116") {
          console.error("Error loading user settings", error);
        } else if (data) {
          setChatbotApi(data.chatbot_api);
        }
      }
    }
    loadSettings();
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("user_settings")
      .upsert({ user_id: user.id, chatbot_api: chatbotApi });
    setLoading(false);
    if (error) {
      alert("Error saving settings: " + error.message);
    } else {
      alert("ההגדרות נשמרו");
      onBack();
    }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl mb-4">הגדרות משתמש</h2>
      <form onSubmit={handleSave}>
        <div>
          <label htmlFor="chatbotApi" className="block text-sm font-medium">
            API של השירות
          </label>
          <input
            id="chatbotApi"
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded p-2"
            value={chatbotApi}
            onChange={(e) => setChatbotApi(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full bg-blue-500 text-white p-2 rounded"
        >
          {loading ? "שומר..." : "שמור הגדרות"}
        </button>
      </form>
      <button onClick={onBack} className="mt-2 text-sm text-blue-600 underline">
        חזרה לצ'אט
      </button>
    </div>
  );
}
