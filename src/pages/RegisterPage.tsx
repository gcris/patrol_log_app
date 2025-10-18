import { useState } from "react";
import { supabase } from "../supabaseClient";

function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setMessage(error.message);
        } else {
            setMessage("✅ Registration successful! Check your email to verify.");
            console.log("User:", data.user);
        }
    };

    return (
        <div className="page-wrapper">
            <div className="page-container">
                <h2>Register</h2>

                <form onSubmit={handleRegister}>
                    <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {message && <p style={{ color: "red" }}>{message}</p>}

                    <button type="submit">Register</button>
                </form>

                <p style={{ marginTop: 15 }}>
                    Already have an account? <a href="/login">Login</a>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;
