import { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import apiRequest from "../../services/apiRequest";

function PropertyDetails() {

    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [property, setProperty] = useState(null);
    const [currentImage, setCurrentImage] = useState(0);

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const [favoriteLoading, setFavoriteLoading] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);


    // --------------------------------
    // IMAGE URL
    // --------------------------------

    const getImageUrl = (image) => {
        if (!image) {
            return "";
        }

        if (image.startsWith("http")) {
            return image;
        }

        return `http://localhost:5000${image}`;
    };


    // --------------------------------
    // FETCH PROPERTY
    // --------------------------------

    const fetchProperty = async () => {

        setLoading(true);
        setMessage("");

        try {

            const { response, data } =
                await apiRequest(`/properties/${id}`);

            if (!response.ok) {

                setMessage(
                    data.message ||
                    "Failed to load property"
                );

                return;
            }

            setProperty(data.property);
            setCurrentImage(0);

        } catch (error) {

            setMessage(
                "Cannot connect to backend"
            );

        } finally {

            setLoading(false);

        }
    };


    // --------------------------------
    // CHECK WHETHER PROPERTY IS FAVORITE
    // --------------------------------

    const checkFavoriteStatus = async () => {

        const token = localStorage.getItem("token");

        // User is not logged in
        if (!token) {

            setIsFavorite(false);

            return;
        }

        try {

            const { response, data } =
                await apiRequest("/users/favorites");

            if (!response.ok) {

                setIsFavorite(false);

                return;
            }

            const favorites = data.favorites || [];

            const alreadyFavorite =
                favorites.some(
                    (favoriteProperty) =>
                        favoriteProperty._id === id
                );

            setIsFavorite(alreadyFavorite);

        } catch (error) {

            setIsFavorite(false);

        }
    };


    // --------------------------------
    // LOAD PROPERTY + FAVORITE STATUS
    // --------------------------------

    useEffect(() => {

        fetchProperty();

        checkFavoriteStatus();

    }, [id]);


    // --------------------------------
    // NEXT IMAGE
    // --------------------------------

    const nextImage = () => {

        if (!property?.images?.length) {
            return;
        }

        setCurrentImage((prev) =>
            prev === property.images.length - 1
                ? 0
                : prev + 1
        );
    };


    // --------------------------------
    // PREVIOUS IMAGE
    // --------------------------------

    const previousImage = () => {

        if (!property?.images?.length) {
            return;
        }

        setCurrentImage((prev) =>
            prev === 0
                ? property.images.length - 1
                : prev - 1
        );
    };


    // --------------------------------
    // ADD / REMOVE FAVORITE
    // --------------------------------

    const handleFavorite = async () => {

        const token = localStorage.getItem("token");

        if (!token) {

            setMessage(
                "Please login to manage favorites."
            );

            return;
        }

        setFavoriteLoading(true);
        setMessage("");

        try {

            // -------------------------
            // REMOVE FAVORITE
            // -------------------------

            if (isFavorite) {

                const { response, data } =
                    await apiRequest(
                        `/users/favorites/${id}`,
                        {
                            method: "DELETE"
                        }
                    );

                if (!response.ok) {

                    setMessage(
                        data.message ||
                        "Failed to remove favorite"
                    );

                    return;
                }

                setIsFavorite(false);

                setMessage(
                    "Property removed from favorites."
                );

            }

            // -------------------------
            // ADD FAVORITE
            // -------------------------

            else {

                const { response, data } =
                    await apiRequest(
                        `/users/favorites/${id}`,
                        {
                            method: "POST"
                        }
                    );

                if (!response.ok) {

                    setMessage(
                        data.message ||
                        "Failed to add favorite"
                    );

                    return;
                }

                setIsFavorite(true);

                setMessage(
                    "Property added to favorites!"
                );
            }

        } catch (error) {

            setMessage(
                "Cannot connect to backend"
            );

        } finally {

            setFavoriteLoading(false);
        }
    };


    // --------------------------------
    // LOADING
    // --------------------------------

    if (loading) {

        return (
            <div className="details-message">

                Loading property...

            </div>
        );
    }


    // --------------------------------
    // PROPERTY NOT FOUND
    // --------------------------------

    if (!property) {

        return (
            <div className="details-message error-message">

                {message || "Property not found"}

            </div>
        );
    }


    const images = property.images || [];


    // --------------------------------
    // UI
    // --------------------------------

    return (

        <div className="property-details-page">

            <div className="details-container">


                {/* BACK BUTTON */}

<button
    type="button"
    className="back-button"
    onClick={() => {
        navigate(location.state?.from || "/");
    }}
>
    ← Back to Properties
</button>

                <div className="property-details-layout">


                    {/* =====================================
                        LEFT SIDE - IMAGE GALLERY
                    ====================================== */}

                    <div className="details-gallery">

                        <div className="details-main-image">


                            {/* MAIN IMAGE */}

                            {images.length > 0 ? (

                                <img
                                    src={getImageUrl(
                                        images[currentImage]
                                    )}
                                    alt={property.title || "Property"}
                                />

                            ) : (

                                <div className="details-no-image">

                                    No Image Available

                                </div>

                            )}


                            {/* LISTING BADGE */}

                            <span className="details-listing-badge">

                                {property.listingType === "rent"
                                    ? "FOR RENT"
                                    : "FOR SALE"}

                            </span>


                            {/* IMAGE COUNTER */}

                            {images.length > 1 && (

                                <div className="details-image-counter">

                                    {currentImage + 1} / {images.length}

                                </div>

                            )}


                            {/* PREVIOUS */}

                            {images.length > 1 && (

                                <button
                                    className="details-image-arrow details-arrow-left"
                                    onClick={previousImage}
                                >
                                    ‹
                                </button>

                            )}


                            {/* NEXT */}

                            {images.length > 1 && (

                                <button
                                    className="details-image-arrow details-arrow-right"
                                    onClick={nextImage}
                                >
                                    ›
                                </button>

                            )}

                        </div>


                        {/* IMAGE DOTS */}

                        {images.length > 1 && (

                            <div className="details-image-dots">

                                {images.map((_, index) => (

                                    <button
                                        key={index}
                                        className={
                                            index === currentImage
                                                ? "details-dot active"
                                                : "details-dot"
                                        }
                                        onClick={() =>
                                            setCurrentImage(index)
                                        }
                                    />

                                ))}

                            </div>

                        )}


                        {/* THUMBNAILS */}

                        {images.length > 1 && (

                            <div className="details-thumbnails">

                                {images.map((image, index) => (

                                    <button
                                        key={index}
                                        className={
                                            index === currentImage
                                                ? "details-thumbnail active"
                                                : "details-thumbnail"
                                        }
                                        onClick={() =>
                                            setCurrentImage(index)
                                        }
                                    >

                                        <img
                                            src={getImageUrl(image)}
                                            alt={`Property ${index + 1}`}
                                        />

                                    </button>

                                ))}

                            </div>

                        )}

                    </div>


                    {/* =====================================
                        RIGHT SIDE - PROPERTY INFORMATION
                    ====================================== */}

                    <div className="details-information">


                        {/* PROPERTY TYPE */}

                        <div className="details-property-type">

                            {property.propertyType || "Property"}

                        </div>


                        {/* TITLE */}

                        <h1>

                            {property.title || "Untitled Property"}

                        </h1>


                        {/* LOCATION */}

                        <p className="details-location">

                            📍 {property.area || "Area unavailable"}
                            {property.city ? `, ${property.city}` : ""}

                        </p>


                        {/* PRICE */}

                        <div className="details-price">

                            {property.price !== undefined &&
                            property.price !== null
                                ? `₹${Number(property.price).toLocaleString("en-IN")}`
                                : "Price unavailable"}

                            {property.listingType === "rent" && (

                                <span>
                                    {" "} / month
                                </span>

                            )}

                        </div>


                        {/* =================================
                            PROPERTY FEATURES
                        ================================== */}

                        <div className="details-features">


                            {/* BHK */}

                            {property.bhk !== undefined &&
                                property.bhk !== null && (

                                <div className="detail-feature">

                                    <span className="feature-icon">
                                        🛏️
                                    </span>

                                    <div>

                                        <strong>
                                            {property.bhk} BHK
                                        </strong>

                                        <small>
                                            Bedrooms
                                        </small>

                                    </div>

                                </div>

                            )}


                            {/* AREA */}

                            {property.squareFeet !== undefined &&
                                property.squareFeet !== null && (

                                <div className="detail-feature">

                                    <span className="feature-icon">
                                        📐
                                    </span>

                                    <div>

                                        <strong>
                                            {property.squareFeet} sq.ft
                                        </strong>

                                        <small>
                                            Area
                                        </small>

                                    </div>

                                </div>

                            )}


                            {/* FURNISHING */}

                            {property.furnishing && (

                                <div className="detail-feature">

                                    <span className="feature-icon">
                                        🛋️
                                    </span>

                                    <div>

                                        <strong>
                                            {property.furnishing}
                                        </strong>

                                        <small>
                                            Furnishing
                                        </small>

                                    </div>

                                </div>

                            )}

                        </div>


                        {/* =================================
                            DESCRIPTION
                        ================================== */}

                        <div className="details-description">

                            <h2>
                                Description
                            </h2>

                            <p>
                                {property.description || "No description provided for this property."}
                            </p>

                        </div>


                        {/* =================================
                            OWNER
                        ================================== */}

                        {property.ownerId && (

                            <div className="owner-card">

                                <div className="owner-avatar">

                                    {property.ownerId.name
                                        ?.charAt(0)
                                        .toUpperCase() || "U"}

                                </div>

                                <div className="owner-information">

                                    <p>
                                        Listed by
                                    </p>

                                    <h3>
                                        {property.ownerId.name || "Owner"}
                                    </h3>

                                    {property.ownerId.email && (

                                        <span>
                                            ✉️{" "}
                                            {property.ownerId.email}
                                        </span>

                                    )}

                                    {property.ownerId.phone && (

                                        <span>
                                            📞{" "}
                                            {property.ownerId.phone}
                                        </span>

                                    )}

                                </div>

                            </div>

                        )}


                        {/* VIEWS */}

                        <div className="property-views">

                            👁️️ {property.views || 0} views

                        </div>


                        {/* =================================
                            FAVORITE BUTTON
                        ================================== */}

                        <button
                            className={
                                isFavorite
                                    ? "favorite-button favorite-active"
                                    : "favorite-button"
                            }
                            type="button"
                            onClick={handleFavorite}
                            disabled={favoriteLoading}
                        >

                            {favoriteLoading

                                ? "Please wait..."

                                : isFavorite

                                    ? "♥ Remove from Favorites"

                                    : "♡ Add to Favorites"

                            }

                        </button>


                        {/* MESSAGE */}

                        {message && (

                            <p className="favorite-message">

                                {message}

                            </p>

                        )}

                    </div>

                </div>

            </div>

        </div>
    );
}

export default PropertyDetails;