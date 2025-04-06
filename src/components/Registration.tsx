import { useState } from "react";
import { supabase } from "../services/supabaseClient";

interface RegistrationProps {
  onSwitchToLogin: () => void;
}

export default function Registration({ onSwitchToLogin }: RegistrationProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert(error.message);
    } else {
      alert("הרשמה מוצלחת, נא לבדוק את האימייל לאימות.");
      onSwitchToLogin();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <form onSubmit={handleRegister} className="bg-white p-6 rounded shadow-md w-80">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="mt-1 block w-full border border-gray-300 rounded p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mt-4">
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="mt-1 block w-full border border-gray-300 rounded p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="mt-4 w-full bg-green-500 text-white p-2 rounded">
          Register
        </button>
        <div className="mt-2 text-center">
          <button type="button" className="text-sm text-blue-600" onClick={onSwitchToLogin}>
            כבר יש לי חשבון, היכנס
          </button>
        </div>
      </form>
    </div>
  );
}
