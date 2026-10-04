import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem("token")
    );

    const [user, setUser] = useState(null);

    useEffect(() => {
        const loadUser = () => {
            const token = localStorage.getItem("token");
            const storedUser = localStorage.getItem("user");

            setIsLoggedIn(!!token);

            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (error) {
                    console.error("Invalid user data in localStorage");

                    localStorage.removeItem("user");
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        };

        loadUser();

        const handleLoginEvent = () => {
            loadUser();
        };

        window.addEventListener("login", handleLoginEvent);

        return () => {
            window.removeEventListener("login", handleLoginEvent);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setIsLoggedIn(false);
        setUser(null);

        navigate("/login");
    };

    const handleLogin = () => {
        navigate("/login");
    };

    return (
        <nav>
            <Link to="/">
                Home
            </Link>

            {" | "}

            {!isLoggedIn && (
                <>
                    <Link to="/register">
                        Register
                    </Link>

                    {" | "}

                    <button onClick={handleLogin}>
                        Login
                    </button>
                </>
            )}

            {isLoggedIn && (
                <>
                    {user?.role === "admin" ? (
                        <>
                            <Link to="/admin">
                                Admin Dashboard
                            </Link>

                            {" | "}
                        </>
                    ) : (
                        <>
                            <Link to="/my-properties">
                                My Properties
                            </Link>

                            {" | "}

                            <Link to="/favorites">
                                Favorites
                            </Link>

                            {" | "}
                        </>
                    )}

                    <Link to="/profile">
                        Profile
                    </Link>

                    {" | "}

                    <button onClick={handleLogout}>
                        Logout
                    </button>
                </>
            )}
        </nav>
    );
}

export default Navbar;