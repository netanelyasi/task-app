import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { sendMessageToWebhook } from "../services/api";

interface Message {
  id?: number;
  user_id: string;
  content: string;
  role: "user" | "ai";
  created_at?: string;
}

interface ChatProps {
  onOpenSettings: () => void;
}

export default function Chat({ onOpenSettings }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [chatbotApi, setChatbotApi] = useState<string>("");
  const user = supabase.auth.user();

  // שליפת הודעות מהמסד
  useEffect(() => {
    async function loadMessages() {
      const { data, error } = await supabase
        .from<Message>("messages")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) {
        console.error("Error loading messages", error);
      } else {
        setMessages(data || []);
      }
    }
    loadMessages();
  }, []);

  // טעינת הגדרות משתמש – כתובת ה־API
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

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const userMessage: Message = {
      user_id: user.id,
      content: input.trim(),
      role: "user",
    };

    // שמירת הודעת המשתמש במסד
    const { data: insertedUserMsg, error: userError } = await supabase
      .from("messages")
      .insert(userMessage)
      .single();
    if (userError) {
      console.error("Error inserting user message", userError);
    } else {
      setMessages((prev) => [...prev, insertedUserMsg]);
    }
    
    setInput("");

    if (!chatbotApi) {
      alert("נא להגדיר את API של השירות בהגדרות המשתמש");
      return;
    }

    try {
      // שימוש בכתובת API שהוזנה על ידי המשתמש
      const aiResponse = await sendMessageToWebhook(userMessage.content, user.id, chatbotApi);
      const aiMessage: Message = {
        user_id: user.id,
        content: aiResponse,
        role: "ai",
      };
      // שמירת הודעת הסוכן במסד
      const { data: insertedAiMsg, error: aiError } = await supabase
        .from("messages")
        .insert(aiMessage)
        .single();
      if (aiError) {
        console.error("Error inserting AI message", aiError);
      } else {
        setMessages((prev) => [...prev, insertedAiMsg]);
      }
    } catch (error) {
      console.error("Error sending message to webhook", error);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="flex justify-end mb-2">
        <button onClick={onOpenSettings} className="text-sm text-blue-600 underline">
          הגדרות משתמש
        </button>
      </div>
      <div className="bg-white shadow-md rounded p-4 h-96 overflow-y-auto mb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 p-2 rounded ${msg.role === "user" ? "bg-blue-100 text-right" : "bg-green-100 text-left"}`}
          >
            {msg.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="flex">
        <input
          type="text"
          placeholder="כתוב הודעה..."
          className="flex-grow border border-gray-300 rounded p-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="ml-2 bg-blue-500 text-white p-2 rounded">
          שלח
        </button>
      </form>
    </div>
  );
}
