import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiRequest from "../../services/apiRequest";

function Favorites() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState(null);
    const [message, setMessage] = useState("");

    const fetchFavorites = async () => {
        try {
            const { response, data } = await apiRequest("/users/favorites");

            if (!response.ok) {
                setMessage(data.message || "Failed to load favorites.");
                return;
            }

            setFavorites(data.favorites || []);
        } catch (error) {
            setMessage("Cannot connect to backend.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    const removeFavorite = async (propertyId) => {
        setRemovingId(propertyId);
        setMessage("");

        try {
            const { response, data } = await apiRequest(
                `/users/favorites/${propertyId}`,
                {
                    method: "DELETE"
                }
            );

            if (!response.ok) {
                setMessage(data.message || "Failed to remove favorite.");
                return;
            }

            setFavorites((previousFavorites) =>
                previousFavorites.filter(
                    (property) => property._id !== propertyId
                )
            );
        } catch (error) {
            setMessage("Cannot connect to backend.");
        } finally {
            setRemovingId(null);
        }
    };

    const getImageUrl = (image) => {
        return `http://localhost:5000${image}`;
    };

    if (loading) {
        return (
            <div className="favorites-page">
                <div className="favorites-container">
                    <div className="favorites-loading">
                        <div className="favorites-spinner"></div>
                        <p>Loading your favorites...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="favorites-page">
            <div className="favorites-container">

                {/* Header */}
                <div className="favorites-header">
                    <div>
                        <p className="favorites-label">
                            SAVED PROPERTIES
                        </p>

                        <h1>My Favorites</h1>

                        <p className="favorites-subtitle">
                            Properties you've saved for later.
                        </p>
                    </div>

                    {favorites.length > 0 && (
                        <div className="favorites-count">
                            <span>{favorites.length}</span>
                            <small>
                                {favorites.length === 1
                                    ? "Saved Property"
                                    : "Saved Properties"}
                            </small>
                        </div>
                    )}
                </div>

                {message && (
                    <div className="favorites-message">
                        {message}
                    </div>
                )}

                {/* Empty State */}
                {!message && favorites.length === 0 && (
                    <div className="favorites-empty">
                        <div className="favorites-empty-icon">
                            ♡
                        </div>

                        <h2>No Favorites Yet</h2>

                        <p>
                            You haven't saved any properties yet.
                            Browse properties and save the ones you love.
                        </p>

                        <Link
                            to="/"
                            className="browse-properties-btn"
                        >
                            Browse Properties
                            <span>→</span>
                        </Link>
                    </div>
                )}

                {/* Favorites Grid */}
                {favorites.length > 0 && (
                    <div className="favorites-grid">
                        {favorites.map((property) => (
                            <article
                                className="favorite-card"
                                key={property._id}
                            >
                                {/* Image */}
                                <div className="favorite-image-wrapper">

                                    {property.images &&
                                    property.images.length > 0 ? (
                                        <img
                                            src={getImageUrl(
                                                property.images[0]
                                            )}
                                            alt={property.title}
                                            className="favorite-image"
                                        />
                                    ) : (
                                        <div className="favorite-no-image">
                                            No Image
                                        </div>
                                    )}

                                    {/* Listing Type */}
                                    <span className="favorite-listing-badge">
                                        {property.listingType === "rent"
                                            ? "FOR RENT"
                                            : "FOR SALE"}
                                    </span>

                                    {/* Heart */}
                                    <button
                                        className="favorite-heart-btn"
                                        onClick={() =>
                                            removeFavorite(property._id)
                                        }
                                        disabled={
                                            removingId === property._id
                                        }
                                        title="Remove from favorites"
                                    >
                                        {removingId === property._id
                                            ? "..."
                                            : "♥"}
                                    </button>

                                    {/* Image count */}
                                    {property.images &&
                                        property.images.length > 1 && (
                                            <span className="favorite-image-count">
                                                📷 {property.images.length}
                                            </span>
                                        )}
                                </div>

                                {/* Content */}
                                <div className="favorite-content">

                                    <div className="favorite-property-type">
                                        {property.propertyType}
                                    </div>

                                    <h2 className="favorite-title">
                                        {property.title}
                                    </h2>

                                    <p className="favorite-location">
                                        <span>📍</span>
                                        {property.area}, {property.city}
                                    </p>

                                    <div className="favorite-price">
                                        ₹
                                        {property.price?.toLocaleString(
                                            "en-IN"
                                        )}

                                        {property.listingType === "rent" && (
                                            <span> / month</span>
                                        )}
                                    </div>

                                    <div className="favorite-details">

                                        {property.bhk !== undefined &&
                                            property.bhk !== null && (
                                                <div>
                                                    <strong>
                                                        {property.bhk}
                                                    </strong>
                                                    <span>BHK</span>
                                                </div>
                                            )}

                                        {property.squareFeet !==
                                            undefined &&
                                            property.squareFeet !==
                                                null && (
                                                <div>
                                                    <strong>
                                                        {property.squareFeet}
                                                    </strong>
                                                    <span>sq.ft</span>
                                                </div>
                                            )}

                                        {property.furnishing && (
                                            <div>
                                                <strong>
                                                    {property.furnishing ===
                                                    "semi-furnished"
                                                        ? "Semi"
                                                        : property.furnishing
                                                              .charAt(0)
                                                              .toUpperCase() +
                                                          property.furnishing.slice(
                                                              1
                                                          )}
                                                </strong>
                                                <span>Furnished</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="favorite-card-footer">
                                        <Link
                                            to={`/properties/${property._id}`}
                                            className="favorite-view-btn"
                                        >
                                            View Property
                                            <span>→</span>
                                        </Link>

                                        <button
                                            className="favorite-remove-btn"
                                            onClick={() =>
                                                removeFavorite(property._id)
                                            }
                                            disabled={
                                                removingId === property._id
                                            }
                                        >
                                            {removingId === property._id
                                                ? "Removing..."
                                                : "Remove"}
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Favorites;