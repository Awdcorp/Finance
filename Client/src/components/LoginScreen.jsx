import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login as googleLogin } from "../firebase";
import useAuth from "../auth/useAuth";
import useAuthStore from "../state/auth"; // Zustand store

export default function LoginScreen() {
  const { login, register } = useAuth(); // Enhanced auth with email/password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false); // toggle Login/Register

  const { currentUser } = useAuthStore();
  const navigate = useNavigate();

  // ✅ Auto-redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate("/"); // or /home
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await register(email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      alert(err.message); // 🔁 Replace with toast if needed
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-2xl mb-4 font-bold">Welcome to Finance Tracker</h1>

      {/* Email/Password Form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 w-full max-w-xs"
      >
        <input
          type="email"
          placeholder="Email"
          className="px-4 py-2 rounded bg-neutral-800 text-white border border-neutral-600"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="px-4 py-2 rounded bg-neutral-800 text-white border border-neutral-600"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="bg-yellow-400 text-black font-semibold px-4 py-2 rounded hover:bg-yellow-300"
        >
          {isRegister ? "Register" : "Login"}
        </button>

        <p
          onClick={() => setIsRegister(!isRegister)}
          className="text-sm text-gray-400 hover:underline cursor-pointer mt-1 text-center"
        >
          {isRegister
            ? "Already have an account? Login"
            : "Don't have an account? Register"}
        </p>
      </form>

      {/* OR Divider */}
      <div className="my-4 text-gray-500">OR</div>

      {/* Google Sign In */}
      <button
        onClick={googleLogin}
        className="bg-white text-black font-semibold px-6 py-3 rounded-lg hover:bg-gray-200"
      >
        Sign in with Google
      </button>
    </div>
  );
}
