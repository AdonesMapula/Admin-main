import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../Firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import loginBackground from "../assets/Pictures/background.png";
import rapolloLogo from "../assets/Pictures/translogo.png";

export default function Login({ loginHandler }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in:", userCredential.user);
      loginHandler();
      navigate("/admin/Dashboard");
    } catch (error) {
      setError("Invalid email or password");
      console.error("Login error:", error);
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen">
      {/* Left side - Background Image with Logo */}
      <div className="w-3/4 bg-cover bg-center relative" style={{ backgroundImage: `url(${loginBackground})` }}>
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <img src={rapolloLogo} alt="Rapollo Logo" className="w-3/4" />
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-1/2 flex items-center justify-center bg-gray-900 text-white">
        <form className="w-2/3  p-8 rounded-lg shadow-lg" onSubmit={handleLogin}>
          <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>

          {/* Display Error Message */}
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

          {/* Email Field */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-400 mb-2">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="Enter your Email"
              required
            />
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-400 mb-2">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="Enter your Password"
              required
            />
          </div>

          {/* Forgot Password & Login Button */}
          <div className=" text-right justify-between mb-6">
            <a href="#" className="text-gray-400 text-sm hover:text-white">Forgot password?</a>
          </div>

          <button
            type="submit"
            className="w-full bg-gray-700 text-white py-2 rounded-md hover:bg-gray-600 transition"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
