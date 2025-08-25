import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const nav = useNavigate();
  const { push } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      nav("/");
    } catch (err: any) {
      push(err?.response?.data?.message || "Login failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="container mx-auto px-4 py-10">
        <div className="flex justify-center">
          <div className="w-full max-w-5xl bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col md:flex-row">
            {/* LEFT SIDE - FORM */}
            <div className="w-full md:w-1/2 p-8 md:p-12">
              <div className="text-center mb-8">
                <img
                  src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/lotus.webp"
                  alt="logo"
                  className="mx-auto w-44"
                />
                <h4 className="mt-4 text-xl font-semibold text-gray-700">
                  Vendi i villes suaj!
                </h4>
              </div>

              <form onSubmit={submit}>
                <p className="mb-6 text-gray-600">Please login to your account</p>

                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-600 mb-1"
                  >
                    Username
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Phone number or email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-600 mb-1"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div className="text-center mb-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 rounded-lg text-white font-medium transition bg-gradient-to-r from-orange-500 via-pink-600 to-purple-700 hover:opacity-90 disabled:opacity-70"
                  >
                    {loading ? "Signing in..." : "Log in"}
                  </button>
                  <a
                    href="#!"
                    className="block mt-3 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Forgot password?
                  </a>
                </div>

                <div className="flex justify-center items-center">
                  <p className="text-gray-600 mr-2">Don't have an account?</p>
                  <button
                    type="button"
                    onClick={() => nav("/register")}
                    className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition"
                  >
                    Create new
                  </button>
                </div>
              </form>
            </div>

            {/* RIGHT SIDE - INFO */}
            <div className="hidden md:flex w-full md:w-1/2 items-center justify-center bg-gradient-to-r from-orange-500 via-pink-600 to-purple-700 p-10 text-white">
              <div className="max-w-md">
                <h4 className="text-2xl font-bold mb-4">
                  We are more than just a company
                </h4>
                <p className="text-sm leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
