import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiRequest from "../../services/apiRequest";

function MyProperties() {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [deletingId, setDeletingId] = useState(null);



    const handleDeleteProperty = async (propertyId) => {
    const confirmed = window.confirm(
        "Are you sure you want to delete this property? All property images will also be deleted."
    );

    if (!confirmed) {
        return;
    }

    setDeletingId(propertyId);
    setMessage("");

    try {
        const { response, data } = await apiRequest(
            `/properties/${propertyId}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            setMessage(
                data.message || "Failed to delete property."
            );
            return;
        }

        // Remove deleted property immediately from UI
        setProperties((previousProperties) =>
            previousProperties.filter(
                (property) => property._id !== propertyId
            )
        );

        setMessage(
            "Property deleted successfully."
        );

    } catch (error) {
        setMessage("Cannot connect to backend.");
    } finally {
        setDeletingId(null);
    }
};

    const fetchMyProperties = async () => {
        try {
            const { response, data } = await apiRequest(
                "/properties/my-properties"
            );

            if (!response.ok) {
                setMessage(data.message || "Failed to load your properties.");
                return;
            }

            setProperties(data.properties || []);
        } catch (error) {
            setMessage("Cannot connect to backend.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyProperties();
    }, []);

    const getImageUrl = (image) => {
        return `http://localhost:5000${image}`;
    };

    const getStatusClass = (status) => {
        if (status === "approved") return "status-approved";
        if (status === "rejected") return "status-rejected";
        return "status-pending";
    };

    const getStatusText = (status) => {
        if (status === "approved") return "Approved";
        if (status === "rejected") return "Rejected";
        return "Pending";
    };

    if (loading) {
        return (
            <div className="my-properties-page">
                <div className="my-properties-container">
                    <div className="page-loading">
                        Loading your properties...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="my-properties-page">
            <div className="my-properties-container">

                <div className="my-properties-header">
                    <div>
                        <p className="page-label">MY LISTINGS</p>

                        <h1>My Properties</h1>

                        <p>
                            Manage and track all the properties you have listed.
                        </p>
                    </div>

                    <Link
                        to="/add-property"
                        className="add-property-link"
                    >
                        + Add Property
                    </Link>
                </div>

                {message && (
                    <div className="my-properties-message">
                        {message}
                    </div>
                )}

                {!message && properties.length === 0 && (
                    <div className="empty-properties">
                        <div className="empty-properties-icon">
                            🏠
                        </div>

                        <h2>No Properties Yet</h2>

                        <p>
                            You haven't listed any properties yet.
                            Start by adding your first property.
                        </p>

                        <Link
                            to="/add-property"
                            className="empty-add-property-btn"
                        >
                            Add Your First Property →
                        </Link>
                    </div>
                )}

                {properties.length > 0 && (
                    <>
                        <div className="properties-summary">
                            <strong>{properties.length}</strong>
                            <span>
                                {properties.length === 1
                                    ? " Property"
                                    : " Properties"}
                            </span>
                        </div>

                        <div className="my-properties-list">
                            {properties.map((property) => (
                                <div
                                    className="my-property-card"
                                    key={property._id}
                                >
                                    <div className="my-property-image">
                                        {property.images &&
                                        property.images.length > 0 ? (
                                            <img
                                                src={getImageUrl(
                                                    property.images[0]
                                                )}
                                                alt={property.title}
                                            />
                                        ) : (
                                            <div className="no-property-image">
                                                No Image
                                            </div>
                                        )}

                                        <span
                                            className={`my-property-listing-badge ${
                                                property.listingType === "rent"
                                                    ? "rent-badge"
                                                    : "sale-badge"
                                            }`}
                                        >
                                            {property.listingType === "rent"
                                                ? "FOR RENT"
                                                : "FOR SALE"}
                                        </span>
                                    </div>

                                    <div className="my-property-content">

                                        <div className="my-property-top">
                                            <div>
                                                <p className="my-property-type">
                                                    {property.propertyType}
                                                </p>

                                                <h2>
                                                    {property.title}
                                                </h2>
                                            </div>

                                            <span
                                                className={`property-status ${getStatusClass(
                                                    property.status
                                                )}`}
                                            >
                                                {getStatusText(
                                                    property.status
                                                )}
                                            </span>
                                        </div>

                                        <p className="my-property-location">
                                            📍 {property.area},{" "}
                                            {property.city}
                                        </p>

                                        <div className="my-property-price">
                                            ₹
                                            {property.price?.toLocaleString(
                                                "en-IN"
                                            )}

                                            {property.listingType === "rent" && (
                                                <span> / month</span>
                                            )}
                                        </div>

                                        <div className="my-property-info">
                                            {property.bhk !== undefined &&
                                                property.bhk !== null && (
                                                    <span>
                                                        🛏 {property.bhk} BHK
                                                    </span>
                                                )}

                                            {property.squareFeet !==
                                                undefined &&
                                                property.squareFeet !==
                                                    null && (
                                                    <span>
                                                        📐{" "}
                                                        {
                                                            property.squareFeet
                                                        }{" "}
                                                        sq.ft
                                                    </span>
                                                )}

                                            {property.furnishing && (
                                                <span>
                                                    🛋{" "}
                                                    {property.furnishing}
                                                </span>
                                            )}
                                        </div>

                                        <div className="my-property-actions">

    <Link
        to={`/properties/${property._id}`}
        className="my-property-view-btn"
    >
        View Details
    </Link>

    <Link
        to={`/edit-property/${property._id}`}
        className="my-property-edit-btn"
    >
        Edit Property
    </Link>

    <button
        type="button"
        className="my-property-delete-btn"
        onClick={() =>
            handleDeleteProperty(property._id)
        }
        disabled={deletingId === property._id}
    >
        {deletingId === property._id
            ? "Deleting..."
            : "Delete"}
    </button>

</div>

                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default MyProperties;