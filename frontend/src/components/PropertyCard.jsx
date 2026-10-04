import { useState } from "react";
import { Link } from "react-router-dom";

function PropertyCard({ property, currentPage }) {
    const images = property.images || [];

    const [currentImage, setCurrentImage] = useState(0);

    const getImageUrl = (image) => {
        if (!image) {
            return "";
        }

        if (image.startsWith("http")) {
            return image;
        }

        return `http://localhost:5000${image}`;
    };

    const nextImage = () => {
        if (images.length === 0) return;

        setCurrentImage((prev) =>
            prev === images.length - 1 ? 0 : prev + 1
        );
    };

    const previousImage = () => {
        if (images.length === 0) return;

        setCurrentImage((prev) =>
            prev === 0 ? images.length - 1 : prev - 1
        );
    };

    return (
        <div className="property-card">

            {/* Image Carousel */}

            <div className="property-image-carousel">

                {images.length > 0 ? (
                    <img
                        src={getImageUrl(images[currentImage])}
                        alt={property.title || "Property"}
                        className="property-carousel-image"
                    />
                ) : (
                    <div className="property-no-image">
                        No Image Available
                    </div>
                )}

                {/* Listing badge */}

                <span className="listing-badge">
                    {property.listingType === "rent"
                        ? "FOR RENT"
                        : "FOR SALE"}
                </span>


                {/* Previous button */}

                {images.length > 1 && (
                    <button
                        className="image-arrow image-arrow-left"
                        onClick={previousImage}
                        aria-label="Previous image"
                    >
                        ‹
                    </button>
                )}


                {/* Next button */}

                {images.length > 1 && (
                    <button
                        className="image-arrow image-arrow-right"
                        onClick={nextImage}
                        aria-label="Next image"
                    >
                        ›
                    </button>
                )}


                {/* Image counter */}

                {images.length > 1 && (
                    <div className="image-counter">
                        {currentImage + 1} / {images.length}
                    </div>
                )}


                {/* Image dots */}

                {images.length > 1 && (
                    <div className="image-dots">

                        {images.map((_, index) => (
                            <button
                                key={index}
                                className={
                                    index === currentImage
                                        ? "image-dot active"
                                        : "image-dot"
                                }
                                onClick={() =>
                                    setCurrentImage(index)
                                }
                                aria-label={`View image ${index + 1}`}
                            />
                        ))}

                    </div>
                )}

            </div>


            {/* Property information */}

            <div className="property-content">

                <div className="property-type">
                    {property.propertyType || "Property"}
                </div>

                <h3>
                    {property.title || "Untitled Property"}
                </h3>

                <p className="property-location">
                    📍 {property.area || "Area unavailable"}
                    {property.city ? `, ${property.city}` : ""}
                </p>

                <div className="property-price">

                    {property.price !== undefined &&
                    property.price !== null
                        ? `₹${Number(property.price).toLocaleString("en-IN")}`
                        : "Price unavailable"}

                    {property.listingType === "rent" && (
                        <span> / month</span>
                    )}

                </div>


                {/* Property information */}

                <div className="property-info">

                    {property.bhk !== undefined &&
                        property.bhk !== null && (
                            <span>
                                🛏 {property.bhk} BHK
                            </span>
                        )}

                    {property.squareFeet !== undefined &&
                        property.squareFeet !== null && (
                            <span>
                                📐 {property.squareFeet} sq.ft
                            </span>
                        )}

                </div>


                {/* View details */}

<Link
    to={`/properties/${property._id}`}
    state={{
        from: `/?page=${currentPage}`
    }}
    className="view-property-btn"
>
    View Details
</Link>
            </div>

        </div>
    );
}

export default PropertyCard;