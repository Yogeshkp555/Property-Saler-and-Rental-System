import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import apiRequest from "../../services/apiRequest";

function AdminUserDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchUserDetails();
    }, [id]);

    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            setMessage("");

            const [
                userResult,
                propertiesResult
            ] = await Promise.all([
                apiRequest(`/admin/users/${id}`),
                apiRequest(`/admin/users/${id}/properties`)
            ]);

            /* =========================
               USER
            ========================= */

            if (userResult.response.ok) {
                const userData = userResult.data;

                const userInfo =
                    userData.user ||
                    userData.data?.user ||
                    userData.data ||
                    userData;

                setUser(userInfo);
            } else {
                setMessage(
                    userResult.data?.message ||
                    "Failed to load user"
                );
            }

            /* =========================
               USER PROPERTIES
            ========================= */

            if (propertiesResult.response.ok) {
                const propertyData =
                    propertiesResult.data;

                const propertyList =
                    propertyData.properties ||
                    propertyData.data?.properties ||
                    propertyData.results ||
                    propertyData.data ||
                    [];

                setProperties(
                    Array.isArray(propertyList)
                        ? propertyList
                        : []
                );
            }

        } catch (error) {
            console.error(
                "Admin User Details Error:",
                error
            );

            setMessage(
                "Cannot connect to backend"
            );
        } finally {
            setLoading(false);
        }
    };


    /* =========================
       BLOCK / UNBLOCK USER
    ========================= */

    const handleBlockToggle = async () => {
        if (!user) {
            return;
        }

        const action = user.isBlocked
            ? "unblock"
            : "block";

        const confirmed = window.confirm(
            `Are you sure you want to ${action} ${user.name}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(true);
            setMessage("");

            const {
                response,
                data
            } = await apiRequest(
                `/admin/users/${user._id}/block`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        isBlocked: !user.isBlocked
                    })
                }
            );

            if (!response.ok) {
                setMessage(
                    data.message ||
                    `Failed to ${action} user`
                );

                return;
            }

            setUser(
                data.user || {
                    ...user,
                    isBlocked: !user.isBlocked
                }
            );

            setMessage(
                data.message ||
                `User ${action}ed successfully`
            );

        } catch (error) {
            console.error(
                "Block/Unblock Error:",
                error
            );

            setMessage(
                "Cannot connect to backend"
            );
        } finally {
            setActionLoading(false);
        }
    };


    /* =========================
       DATE FORMAT
    ========================= */

    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };


    /* =========================
       PROPERTY IMAGE
    ========================= */

    const getPropertyImage = (property) => {
        if (
            property.images &&
            property.images.length > 0
        ) {
            return `http://localhost:5000${property.images[0]}`;
        }

        return null;
    };


    /* =========================
       LOADING
    ========================= */

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-loading">
                    Loading user details...
                </div>
            </div>
        );
    }


    /* =========================
       USER NOT FOUND
    ========================= */

    if (!user) {
        return (
            <div className="admin-page">

                <div className="admin-page-header">

                    <div>
                        <span className="admin-eyebrow">
                            ADMIN PANEL
                        </span>

                        <h1>
                            User Details
                        </h1>
                    </div>

                </div>

                <div className="admin-message">
                    {message || "User not found"}
                </div>

                <Link
                    to="/admin/users"
                    className="admin-outline-button"
                >
                    ← Back to Users
                </Link>

            </div>
        );
    }


    return (
        <div className="admin-page">

            {/* =========================
                HEADER
            ========================= */}

            <div className="admin-page-header">

                <div>

                    <span className="admin-eyebrow">
                        ADMIN PANEL
                    </span>

                    <h1>
                        User Details
                    </h1>

                    <p>
                        View account information and
                        properties posted by this user.
                    </p>

                </div>


                <Link
                    to="/admin/users"
                    className="admin-outline-button"
                >
                    ← Back to Users
                </Link>

            </div>


            {/* =========================
                MESSAGE
            ========================= */}

            {message && (
                <div className="admin-message">
                    {message}
                </div>
            )}


            {/* =========================
                USER PROFILE
            ========================= */}

            <div className="admin-section">

                <div className="admin-section-header">

                    <div>

                        <span className="admin-eyebrow">
                            ACCOUNT
                        </span>

                        <h2>
                            Profile Information
                        </h2>

                    </div>

                </div>


                <div className="admin-user-detail-card">

                    <div className="admin-user-avatar">
                        {user.name
                            ? user.name
                                .charAt(0)
                                .toUpperCase()
                            : "U"}
                    </div>


                    <div className="admin-user-detail-info">

                        <div className="admin-user-detail-main">

                            <h2>
                                {user.name}
                            </h2>

                            <span
                                className={
                                    user.role === "admin"
                                        ? "admin-role-badge admin-role-admin"
                                        : "admin-role-badge admin-role-user"
                                }
                            >
                                {user.role}
                            </span>

                        </div>


                        <div className="admin-user-detail-grid">

                            <div>
                                <span>
                                    Email
                                </span>

                                <strong>
                                    {user.email || "N/A"}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Phone
                                </span>

                                <strong>
                                    {user.phone || "N/A"}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Account Status
                                </span>

                                <strong
                                    className={
                                        user.isBlocked
                                            ? "admin-status-blocked"
                                            : "admin-status-active"
                                    }
                                >
                                    {user.isBlocked
                                        ? "Blocked"
                                        : "Active"}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Registered
                                </span>

                                <strong>
                                    {formatDate(
                                        user.createdAt
                                    )}
                                </strong>
                            </div>

                        </div>


                        <div className="admin-user-detail-actions">

                            {user.role !== "admin" && (
                                <button
                                    type="button"
                                    className={
                                        user.isBlocked
                                            ? "admin-success-button"
                                            : "admin-danger-button"
                                    }
                                    onClick={
                                        handleBlockToggle
                                    }
                                    disabled={actionLoading}
                                >
                                    {actionLoading
                                        ? "Please wait..."
                                        : user.isBlocked
                                            ? "Unblock User"
                                            : "Block User"}
                                </button>
                            )}

                        </div>

                    </div>

                </div>

            </div>


            {/* =========================
                USER PROPERTIES
            ========================= */}

            <div className="admin-section">

                <div className="admin-section-header">

                    <div>

                        <span className="admin-eyebrow">
                            PROPERTY ACTIVITY
                        </span>

                        <h2>
                            Properties Posted
                        </h2>

                    </div>


                    <div className="admin-property-count">
                        {properties.length}
                        {" "}
                        {properties.length === 1
                            ? "Property"
                            : "Properties"}
                    </div>

                </div>


                {properties.length === 0 ? (

                    <div className="admin-empty-state">

                        <div className="admin-empty-icon">
                            🏠
                        </div>

                        <h3>
                            No Properties
                        </h3>

                        <p>
                            This user has not posted
                            any properties yet.
                        </p>

                    </div>

                ) : (

                    <div className="admin-user-properties-grid">

                        {properties.map(
                            (property) => {

                                const image =
                                    getPropertyImage(
                                        property
                                    );

                                return (
                                    <div
                                        className="admin-user-property-card"
                                        key={property._id}
                                    >

                                        <div className="admin-user-property-image">

                                            {image ? (

                                                <img
                                                    src={
                                                        image
                                                    }
                                                    alt={
                                                        property.title
                                                    }
                                                />

                                            ) : (

                                                <div className="admin-no-image">
                                                    No Image
                                                </div>

                                            )}

                                        </div>


                                        <div className="admin-user-property-content">

                                            <div className="admin-user-property-top">

                                                <span
                                                    className={
                                                        property.status ===
                                                        "approved"
                                                            ? "admin-property-status approved"
                                                            : property.status ===
                                                              "rejected"
                                                                ? "admin-property-status rejected"
                                                                : "admin-property-status pending"
                                                    }
                                                >
                                                    {
                                                        property.status
                                                    }
                                                </span>

                                                <span>
                                                    {
                                                        property.listingType
                                                    }
                                                </span>

                                            </div>


                                            <h3>
                                                {
                                                    property.title
                                                }
                                            </h3>


                                            <p>
                                                {
                                                    property.city
                                                }

                                                {property.area
                                                    ? ` • ${property.area}`
                                                    : ""}
                                            </p>


                                            <strong className="admin-property-price">

                                                ₹
                                                {Number(
                                                    property.price || 0
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}

                                            </strong>


                                            <div className="admin-user-property-details">

                                                {property.bhk !==
                                                    undefined &&
                                                    property.bhk !==
                                                    null && (
                                                        <span>
                                                            {
                                                                property.bhk
                                                            }{" "}
                                                            BHK
                                                        </span>
                                                    )}

                                                {property.squareFeet !==
                                                    undefined &&
                                                    property.squareFeet !==
                                                    null && (
                                                        <span>
                                                            {
                                                                property.squareFeet
                                                            }{" "}
                                                            sq.ft
                                                        </span>
                                                    )}

                                                {property.propertyType && (
                                                    <span>
                                                        {
                                                            property.propertyType
                                                        }
                                                    </span>
                                                )}

                                            </div>


                                            <Link
                                                to={`/properties/${property._id}`}
                                                className="admin-view-property-button"
                                            >
                                                View Property
                                            </Link>

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>

                )}

            </div>

        </div>
    );
}

export default AdminUserDetails;