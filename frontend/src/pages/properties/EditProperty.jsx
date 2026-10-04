import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import apiRequest from "../../services/apiRequest";

function EditProperty() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        propertyType: "flat",
        listingType: "rent",
        city: "",
        area: "",
        price: "",
        bhk: "",
        squareFeet: "",
        furnishing: "unfurnished"
    });

    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const fetchProperty = async () => {
        try {
            const { response, data } = await apiRequest(
                `/properties/${id}`
            );

            if (!response.ok) {
                setMessage(
                    data.message || "Failed to load property."
                );
                setMessageType("error");
                return;
            }

            const propertyData = data.property;

            setProperty(propertyData);

            setFormData({
                title: propertyData.title || "",
                description: propertyData.description || "",
                propertyType: propertyData.propertyType || "flat",
                listingType: propertyData.listingType || "rent",
                city: propertyData.city || "",
                area: propertyData.area || "",
                price: propertyData.price ?? "",
                bhk: propertyData.bhk ?? "",
                squareFeet: propertyData.squareFeet ?? "",
                furnishing: propertyData.furnishing || "unfurnished"
            });
        } catch (error) {
            setMessage("Cannot connect to backend.");
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperty();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setMessageType("");

        if (formData.title.trim() === "") {
            setMessage("Property title is required.");
            setMessageType("error");
            return;
        }

        if (formData.description.trim() === "") {
            setMessage("Description is required.");
            setMessageType("error");
            return;
        }

        if (formData.city.trim() === "") {
            setMessage("City is required.");
            setMessageType("error");
            return;
        }

        if (formData.area.trim() === "") {
            setMessage("Area is required.");
            setMessageType("error");
            return;
        }

        if (formData.price === "" || Number(formData.price) < 0) {
            setMessage("Please enter a valid price.");
            setMessageType("error");
            return;
        }

        setUpdating(true);

        try {
            const updateData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                propertyType: formData.propertyType,
                listingType: formData.listingType,
                city: formData.city.trim(),
                area: formData.area.trim(),
                price: Number(formData.price),
                furnishing: formData.furnishing
            };

            if (formData.bhk !== "") {
                updateData.bhk = Number(formData.bhk);
            }

            if (formData.squareFeet !== "") {
                updateData.squareFeet = Number(formData.squareFeet);
            }

            const { response, data } = await apiRequest(
                `/properties/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(updateData)
                }
            );

            if (!response.ok) {
                setMessage(
                    data.message || "Failed to update property."
                );
                setMessageType("error");
                return;
            }

            setMessage(
                "Property updated successfully! It is now waiting for admin approval."
            );
            setMessageType("success");

            if (data.property) {
                setProperty(data.property);

                setFormData({
                    title: data.property.title || "",
                    description: data.property.description || "",
                    propertyType:
                        data.property.propertyType || "flat",
                    listingType:
                        data.property.listingType || "rent",
                    city: data.property.city || "",
                    area: data.property.area || "",
                    price: data.property.price ?? "",
                    bhk: data.property.bhk ?? "",
                    squareFeet: data.property.squareFeet ?? "",
                    furnishing:
                        data.property.furnishing || "unfurnished"
                });
            }
        } catch (error) {
            setMessage("Cannot connect to backend.");
            setMessageType("error");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="edit-property-page">
                <div className="edit-property-loading">
                    Loading property...
                </div>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="edit-property-page">
                <div className="edit-property-error">
                    <h2>Property Not Found</h2>

                    <p>
                        {message || "Unable to find this property."}
                    </p>

                    <Link
                        to="/my-properties"
                        className="back-to-properties-btn"
                    >
                        ← Back to My Properties
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="edit-property-page">
            <div className="edit-property-container">

                {/* Header */}

                <div className="edit-property-header">
                    <div>
                        <p className="edit-property-label">
                            MANAGE LISTING
                        </p>

                        <h1>Edit Property</h1>

                        <p>
                            Update your property information below.
                        </p>
                    </div>

                    <Link
                        to="/my-properties"
                        className="back-to-properties-btn"
                    >
                        ← My Properties
                    </Link>
                </div>

                <form
                    className="edit-property-form"
                    onSubmit={handleSubmit}
                >

                    {/* Basic Information */}

                    <div className="edit-property-section">
                        <div className="edit-section-number">
                            01
                        </div>

                        <div className="edit-section-content">
                            <h2>Basic Information</h2>

                            <div className="edit-form-grid">

                                <div className="edit-form-group full-width">
                                    <label>
                                        Property Title
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="edit-form-group full-width">
                                    <label>
                                        Description
                                        <span>*</span>
                                    </label>

                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="5"
                                        required
                                    />
                                </div>

                                <div className="edit-form-group">
                                    <label>
                                        Property Type
                                        <span>*</span>
                                    </label>

                                    <select
                                        name="propertyType"
                                        value={formData.propertyType}
                                        onChange={handleChange}
                                    >
                                        <option value="flat">
                                            Flat
                                        </option>

                                        <option value="house">
                                            House
                                        </option>

                                        <option value="villa">
                                            Villa
                                        </option>

                                        <option value="plot">
                                            Plot
                                        </option>

                                        <option value="commercial">
                                            Commercial
                                        </option>
                                    </select>
                                </div>

                                <div className="edit-form-group">
                                    <label>
                                        Listing Type
                                        <span>*</span>
                                    </label>

                                    <select
                                        name="listingType"
                                        value={formData.listingType}
                                        onChange={handleChange}
                                    >
                                        <option value="rent">
                                            Rent
                                        </option>

                                        <option value="sale">
                                            Sale
                                        </option>
                                    </select>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Location */}

                    <div className="edit-property-section">
                        <div className="edit-section-number">
                            02
                        </div>

                        <div className="edit-section-content">
                            <h2>Location</h2>

                            <div className="edit-form-grid">

                                <div className="edit-form-group">
                                    <label>
                                        City
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="edit-form-group">
                                    <label>
                                        Area
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="area"
                                        value={formData.area}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Property Details */}

                    <div className="edit-property-section">
                        <div className="edit-section-number">
                            03
                        </div>

                        <div className="edit-section-content">
                            <h2>Property Details</h2>

                            <div className="edit-form-grid">

                                <div className="edit-form-group">
                                    <label>
                                        Price
                                        <span>*</span>
                                    </label>

                                    <div className="edit-price-input">
                                        <span>₹</span>

                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            min="0"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="edit-form-group">
                                    <label>BHK</label>

                                    <input
                                        type="number"
                                        name="bhk"
                                        value={formData.bhk}
                                        onChange={handleChange}
                                        min="0"
                                        step="1"
                                    />
                                </div>

                                <div className="edit-form-group">
                                    <label>Square Feet</label>

                                    <input
                                        type="number"
                                        name="squareFeet"
                                        value={formData.squareFeet}
                                        onChange={handleChange}
                                        min="0"
                                    />
                                </div>

                                <div className="edit-form-group">
                                    <label>Furnishing</label>

                                    <select
                                        name="furnishing"
                                        value={formData.furnishing}
                                        onChange={handleChange}
                                    >
                                        <option value="unfurnished">
                                            Unfurnished
                                        </option>

                                        <option value="semi-furnished">
                                            Semi Furnished
                                        </option>

                                        <option value="furnished">
                                            Furnished
                                        </option>
                                    </select>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Existing Images */}

                    <div className="edit-property-section">
                        <div className="edit-section-number">
                            04
                        </div>

                        <div className="edit-section-content">
                            <h2>Current Images</h2>

                            <p className="edit-image-note">
                                Image management will be available
                                separately. Your current images will
                                remain unchanged when you update the
                                property details.
                            </p>

                            <div className="edit-existing-images">

                                {property.images &&
                                property.images.length > 0 ? (
                                    property.images.map(
                                        (image, index) => (
                                            <div
                                                className="edit-existing-image"
                                                key={`${image}-${index}`}
                                            >
                                                <img
                                                    src={`http://localhost:5000${image}`}
                                                    alt={`Property ${
                                                        index + 1
                                                    }`}
                                                />

                                                <span>
                                                    Image {index + 1}
                                                </span>
                                            </div>
                                        )
                                    )
                                ) : (
                                    <p>
                                        No images available.
                                    </p>
                                )}

                            </div>
                        </div>
                    </div>

                    {/* Message */}

                    {message && (
                        <div
                            className={
                                messageType === "success"
                                    ? "edit-property-message success"
                                    : "edit-property-message error"
                            }
                        >
                            <span>
                                {messageType === "success"
                                    ? "✓"
                                    : "!"}
                            </span>

                            {message}
                        </div>
                    )}

                    {/* Submit */}

                    <div className="edit-property-submit">

                        <Link
                            to="/my-properties"
                            className="cancel-edit-btn"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            className="save-property-btn"
                            disabled={updating}
                        >
                            {updating
                                ? "Saving Changes..."
                                : "Save Changes →"}
                        </button>

                    </div>

                </form>
            </div>
        </div>
    );
}

export default EditProperty;