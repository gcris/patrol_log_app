import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setMessage(error.message);
        } else {
            setMessage("✅ Login successful!");
            console.log("User:", data.user);
            // TODO: navigate to patrol page
            navigate("/patrol");
        }
    };

    return (
        <div className="page-container">
            <h2>Login</h2>

            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <div className="password-wrapper">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="password-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="toggle-password"
                    >
                        {showPassword ? "Hide" : "Show"}
                    </button>
                </div>

                {message && <p style={{ color: "red" }}>{message}</p>}

                <div className="remember-me">
                    <label className="checkbox-label">
                        <input type="checkbox" />
                        <span>Remember me</span>
                    </label>
                </div>

                <button type="submit">Login</button>
            </form>

            <p style={{ marginTop: 15 }}>
                Don’t have an account? <a href="/register">Register</a>
            </p>
        </div>
    );
}

export default LoginPage;
