import { useState } from "react";
import API_BASE_URL from "../../services/api";

function Register() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: ""
    });

    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(
                `${API_BASE_URL}/users/register`,
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
                setMessage(data.message || "Registration failed");
                return;
            }

            setMessage("Registration successful!");

            setFormData({
                name: "",
                email: "",
                password: "",
                phone: ""
            });

        } catch (error) {
            setMessage("Cannot connect to backend");
        }
    };

    return (
        <div>
            <h2>Register</h2>

            <form onSubmit={handleSubmit}>

                <div>
                    <label>Name</label>
                    <br />
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <br />

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

                <div>
                    <label>Phone</label>
                    <br />
                    <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                    />
                </div>

                <br />

                <button type="submit">
                    Register
                </button>

            </form>

            <p>{message}</p>
        </div>
    );
}

export default Register;