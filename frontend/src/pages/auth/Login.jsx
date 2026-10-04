import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../services/api";

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const getRoleFromToken = (token) => {
        try {
            const payload = JSON.parse(
                atob(token.split(".")[1])
            );

            return payload.role || null;

        } catch (error) {
            console.error("Could not read role from token");
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(
                `${API_BASE_URL}/users/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(formData)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message || "Login failed"
                );
                return;
            }

            // Save JWT token
            localStorage.setItem(
                "token",
                data.token
            );

            // Get role from user object first
            let role = data.user?.role;

            // If role is not available in user object,
            // get it from JWT token
            if (!role) {
                role = getRoleFromToken(data.token);
            }

            // Create user object
            const user = {
                ...(data.user || {}),
                role: role
            };

            // Save user information
            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );

            console.log("Login response:", data);
            console.log("Logged in user:", user);
            console.log("User role:", role);

            // Tell Navbar that login happened
            window.dispatchEvent(
                new Event("login")
            );

            setMessage("Login successful!");

            // Redirect according to role
            if (role === "admin") {
                navigate("/admin");
            } else {
                navigate("/");
            }

        } catch (error) {
            console.error(error);

            setMessage(
                "Cannot connect to backend"
            );
        }
    };

    return (
        <div>
            <h2>Login</h2>

            <form onSubmit={handleSubmit}>

                <div>
                    <label>Email</label>
                    <br />

                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <br />

                <div>
                    <label>Password</label>
                    <br />

                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <br />

                <button type="submit">
                    Login
                </button>

            </form>

            <p>{message}</p>
        </div>
    );
}

export default Login;