import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Auth: React.FC = () => {
    const { signUp, signIn, signInWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            if (isSignUp) {
                await signUp(email, password);
            } else {
                await signIn(email, password);
                navigate("/");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        }
    };

    const handleGoogleSignIn = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            await signInWithGoogle();
            navigate("/");
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="flex justify-center">
                    <img
                        src="/logo_goalist.png"
                        alt="Goalist"
                        className="h-14 w-auto"
                    />
                </div>
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {isSignUp
                            ? "Create your account"
                            : "Sign in to your account"}
                    </h2>
                </div>

                {error && (
                    <div
                        className="bg-red-100 border border-red-400 text-sm text-red-700 px-3 py-2 rounded relative"
                        role="alert"
                    >
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                type="email"
                                required
                                className="appearance-none bg-surface-light rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-text-light rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                className="appearance-none bg-surface-light rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-text-light rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {isSignUp ? "Sign Up" : "Sign In"}
                        </button>
                    </div>

                    {/* <div className="mt-4">
            <button
              onClick={handleGoogleSignIn}
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <img
                className="h-5 w-5 mr-2"
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google logo"
              />
              Sign in with Google
            </button>
          </div> */}
                </form>

                <div className="text-center">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-sm text-indigo-600 hover:text-indigo-500"
                    >
                        {isSignUp
                            ? "Already have an account? Sign in"
                            : "Don't have an account? Sign up"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;
