import { useEffect, useState } from "react";
import apiRequest from "../../services/apiRequest";

function Profile() {
    const [profile, setProfile] = useState(null);

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const fetchProfile = async () => {
        try {
            const { response, data } = await apiRequest(
                "/users/profile"
            );

            if (!response.ok) {
                setMessage(
                    data.message || "Failed to load profile"
                );
                return;
            }

            const user = data.user;

            setProfile(user);
            setName(user.name || "");
            setPhone(user.phone || "");

        } catch (error) {
            setMessage("Cannot connect to backend");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setUpdating(true);

        try {
            const { response, data } = await apiRequest(
                "/users/profile",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name,
                        phone
                    })
                }
            );

            if (!response.ok) {
                setMessage(
                    data.message || "Failed to update profile"
                );
                return;
            }

            const user = data.user;

            setProfile(user);
            setName(user.name || "");
            setPhone(user.phone || "");

            setMessage("Profile updated successfully!");

        } catch (error) {
            setMessage("Cannot connect to backend");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return <p>Loading profile...</p>;
    }

    if (!profile) {
        return <p>{message}</p>;
    }

    return (
        <div>
            <h2>My Profile</h2>

            <p>
                <strong>Name:</strong> {profile.name}
            </p>

            <p>
                <strong>Email:</strong> {profile.email}
            </p>

            <p>
                <strong>Phone:</strong> {profile.phone}
            </p>

            <p>
                <strong>Role:</strong> {profile.role}
            </p>

            <hr />

            <h3>Edit Profile</h3>

            <form onSubmit={handleSubmit}>

                <div>
                    <label>Name</label>
                    <br />

                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <br />

                <div>
                    <label>Phone</label>
                    <br />

                    <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                    />
                </div>

                <br />

                <button
                    type="submit"
                    disabled={updating}
                >
                    {updating
                        ? "Updating..."
                        : "Update Profile"}
                </button>

            </form>

            <p>{message}</p>
        </div>
    );
}

export default Profile;