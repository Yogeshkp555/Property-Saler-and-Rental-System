import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiRequest from "../../services/apiRequest";

function AddProperty() {

    const navigate = useNavigate();

    const fileInputRef = useRef(null);

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

    const [images, setImages] = useState([]);

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const [loading, setLoading] = useState(false);


    // ==========================================
    // HANDLE NORMAL INPUTS
    // ==========================================

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };


    // ==========================================
    // OPEN FILE SELECTOR
    // ==========================================

    const openFileSelector = () => {

        fileInputRef.current?.click();

    };


    // ==========================================
    // HANDLE IMAGE SELECTION
    // ==========================================

    const handleImages = (e) => {

        const selectedFiles =
            Array.from(e.target.files || []);

        if (selectedFiles.length === 0) {
            return;
        }


        setMessage("");
        setMessageType("");


        // --------------------------------------
        // CHECK TOTAL IMAGE COUNT
        // --------------------------------------

        if (
            images.length + selectedFiles.length > 5
        ) {

            setMessage(
                `You can upload maximum 5 images. You already selected ${images.length}.`
            );

            setMessageType("error");

            e.target.value = "";

            return;
        }


        // --------------------------------------
        // CHECK EACH IMAGE
        // --------------------------------------

        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png"
        ];

        const invalidImage =
            selectedFiles.find((file) => {

                const validType =
                    allowedTypes.includes(file.type);

                const validSize =
                    file.size <= 5 * 1024 * 1024;

                return !validType || !validSize;

            });


        if (invalidImage) {

            setMessage(
                `"${invalidImage.name}" is not valid. Use JPG, JPEG or PNG and maximum 5 MB per image.`
            );

            setMessageType("error");

            e.target.value = "";

            return;
        }


        // --------------------------------------
        // ADD NEW IMAGES
        // --------------------------------------

        setImages((previousImages) => [

            ...previousImages,

            ...selectedFiles.map((file) => ({

                file: file,

                preview:
                    URL.createObjectURL(file)

            }))

        ]);


        // Clear input so same file can be selected again

        e.target.value = "";

    };


    // ==========================================
    // REMOVE IMAGE
    // ==========================================

    const removeImage = (indexToRemove) => {

        setImages((previousImages) => {

            const imageToRemove =
                previousImages[indexToRemove];

            if (imageToRemove?.preview) {

                URL.revokeObjectURL(
                    imageToRemove.preview
                );

            }

            return previousImages.filter(
                (_, index) =>
                    index !== indexToRemove
            );

        });

    };


    // ==========================================
    // SUBMIT PROPERTY
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setMessage("");
        setMessageType("");


        // --------------------------------------
        // IMAGE VALIDATION
        // --------------------------------------

        if (images.length === 0) {

            setMessage(
                "Please upload at least one property image."
            );

            setMessageType("error");

            return;
        }


        if (images.length > 5) {

            setMessage(
                "Maximum 5 images are allowed."
            );

            setMessageType("error");

            return;
        }


        setLoading(true);


        try {

            const formDataToSend =
                new FormData();


            // --------------------------------------
            // REQUIRED FIELDS
            // --------------------------------------

            formDataToSend.append(
                "title",
                formData.title.trim()
            );

            formDataToSend.append(
                "description",
                formData.description.trim()
            );

            formDataToSend.append(
                "propertyType",
                formData.propertyType
            );

            formDataToSend.append(
                "listingType",
                formData.listingType
            );

            formDataToSend.append(
                "city",
                formData.city.trim()
            );

            formDataToSend.append(
                "area",
                formData.area.trim()
            );

            formDataToSend.append(
                "price",
                formData.price
            );


            // --------------------------------------
            // OPTIONAL FIELDS
            // --------------------------------------

            if (formData.bhk !== "") {

                formDataToSend.append(
                    "bhk",
                    formData.bhk
                );

            }

            if (formData.squareFeet !== "") {

                formDataToSend.append(
                    "squareFeet",
                    formData.squareFeet
                );

            }

            if (formData.furnishing !== "") {

                formDataToSend.append(
                    "furnishing",
                    formData.furnishing
                );

            }


            // --------------------------------------
            // ALL IMAGES
            // --------------------------------------

            images.forEach((imageObject) => {

                formDataToSend.append(
                    "images",
                    imageObject.file
                );

            });


            // --------------------------------------
            // SEND REQUEST
            // --------------------------------------

            const {
                response,
                data
            } = await apiRequest(
                "/properties",
                {
                    method: "POST",
                    body: formDataToSend
                }
            );


            if (!response.ok) {

                setMessage(
                    data.message ||
                    "Failed to add property."
                );

                setMessageType("error");

                return;
            }


            // --------------------------------------
            // SUCCESS
            // --------------------------------------

            setMessage(
                "Property added successfully! It is now waiting for admin approval."
            );

            setMessageType("success");


            // Remove preview URLs

            images.forEach((imageObject) => {

                URL.revokeObjectURL(
                    imageObject.preview
                );

            });


            // Reset form

            setFormData({
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

            setImages([]);


        } catch (error) {

            setMessage(
                "Cannot connect to backend."
            );

            setMessageType("error");

        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="add-property-page">

            <div className="add-property-container">


                {/* =================================
                    PAGE HEADER
                ================================== */}

                <div className="add-property-header">

                    <p className="add-property-label">
                        LIST YOUR PROPERTY
                    </p>

                    <h1>
                        Add Property
                    </h1>

                    <p>
                        Add your property details and
                        showcase it with beautiful images.
                    </p>

                </div>


                {/* =================================
                    FORM
                ================================== */}

                <form
                    className="add-property-form"
                    onSubmit={handleSubmit}
                >


                    {/* =================================
                        BASIC INFORMATION
                    ================================== */}

                    <div className="form-section">

                        <div className="form-section-header">

                            <div className="form-section-number">
                                01
                            </div>

                            <div>

                                <h2>
                                    Basic Information
                                </h2>

                                <p>
                                    Tell us about your property.
                                </p>

                            </div>

                        </div>


                        <div className="form-grid">


                            {/* TITLE */}

                            <div className="form-group full-width">

                                <label>
                                    Property Title
                                    <span>*</span>
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Spacious 2 BHK Apartment"
                                    required
                                />

                            </div>


                            {/* DESCRIPTION */}

                            <div className="form-group full-width">

                                <label>
                                    Description
                                    <span>*</span>
                                </label>

                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe the property, nearby facilities, parking, amenities, etc."
                                    rows="5"
                                    required
                                />

                            </div>


                            {/* PROPERTY TYPE */}

                            <div className="form-group">

                                <label>
                                    Property Type
                                    <span>*</span>
                                </label>

                                <select
                                    name="propertyType"
                                    value={formData.propertyType}
                                    onChange={handleChange}
                                    required
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


                            {/* LISTING TYPE */}

                            <div className="form-group">

                                <label>
                                    Listing Type
                                    <span>*</span>
                                </label>

                                <select
                                    name="listingType"
                                    value={formData.listingType}
                                    onChange={handleChange}
                                    required
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


                    {/* =================================
                        LOCATION
                    ================================== */}

                    <div className="form-section">

                        <div className="form-section-header">

                            <div className="form-section-number">
                                02
                            </div>

                            <div>

                                <h2>
                                    Location
                                </h2>

                                <p>
                                    Where is your property located?
                                </p>

                            </div>

                        </div>


                        <div className="form-grid">


                            <div className="form-group">

                                <label>
                                    City
                                    <span>*</span>
                                </label>

                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="e.g. Ahmedabad"
                                    required
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Area
                                    <span>*</span>
                                </label>

                                <input
                                    type="text"
                                    name="area"
                                    value={formData.area}
                                    onChange={handleChange}
                                    placeholder="e.g. Satellite"
                                    required
                                />

                            </div>

                        </div>

                    </div>


                    {/* =================================
                        PROPERTY DETAILS
                    ================================== */}

                    <div className="form-section">

                        <div className="form-section-header">

                            <div className="form-section-number">
                                03
                            </div>

                            <div>

                                <h2>
                                    Property Details
                                </h2>

                                <p>
                                    Add specifications and pricing.
                                </p>

                            </div>

                        </div>


                        <div className="form-grid">


                            {/* PRICE */}

                            <div className="form-group">

                                <label>
                                    Price
                                    <span>*</span>
                                </label>

                                <div className="input-with-prefix">

                                    <span>
                                        ₹
                                    </span>

                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="25000"
                                        min="0"
                                        required
                                    />

                                </div>

                            </div>


                            {/* BHK */}

                            <div className="form-group">

                                <label>
                                    BHK
                                </label>

                                <input
                                    type="number"
                                    name="bhk"
                                    value={formData.bhk}
                                    onChange={handleChange}
                                    placeholder="e.g. 2"
                                    min="0"
                                    step="1"
                                />

                            </div>


                            {/* SQUARE FEET */}

                            <div className="form-group">

                                <label>
                                    Square Feet
                                </label>

                                <input
                                    type="number"
                                    name="squareFeet"
                                    value={formData.squareFeet}
                                    onChange={handleChange}
                                    placeholder="e.g. 1200"
                                    min="0"
                                />

                            </div>


                            {/* FURNISHING */}

                            <div className="form-group">

                                <label>
                                    Furnishing
                                </label>

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


                    {/* =================================
                        IMAGES
                    ================================== */}

                    <div className="form-section image-upload-section">

                        <div className="form-section-header">

                            <div className="form-section-number">
                                04
                            </div>

                            <div>

                                <h2>
                                    Property Images
                                </h2>

                                <p>
                                    Add up to 5 images to showcase
                                    your property.
                                </p>

                            </div>

                        </div>


                        {/* HIDDEN FILE INPUT */}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png"
                            multiple
                            onChange={handleImages}
                            className="hidden-file-input"
                        />


                        {/* UPLOAD AREA */}

                        {images.length < 5 && (

                            <button
                                type="button"
                                className="image-upload-box"
                                onClick={openFileSelector}
                            >

                                <div className="upload-icon">
                                    +
                                </div>

                                <strong>
                                    Add Property Images
                                </strong>

                                <span>
                                    Click to select images
                                </span>

                                <small>
                                    JPG, JPEG or PNG · Max 5 MB each
                                </small>

                            </button>

                        )}


                        {/* IMAGE COUNT */}

                        <div className="image-upload-info">

                            <div>

                                <strong>
                                    {images.length} / 5
                                </strong>

                                <span>
                                    {" "}images selected
                                </span>

                            </div>

                            {images.length === 0 && (

                                <span className="required-image-text">
                                    At least 1 image required
                                </span>

                            )}

                            {images.length > 0 &&
                                images.length < 5 && (

                                    <button
                                        type="button"
                                        className="add-more-images-btn"
                                        onClick={openFileSelector}
                                    >
                                        + Add More
                                    </button>

                                )}

                        </div>


                        {/* IMAGE PREVIEWS */}

                        {images.length > 0 && (

                            <div className="selected-images-grid">

                                {images.map(
                                    (imageObject, index) => (

                                        <div
                                            className="selected-image-card"
                                            key={`${imageObject.file.name}-${index}`}
                                        >

                                            <img
                                                src={imageObject.preview}
                                                alt={`Property ${index + 1}`}
                                            />


                                            {/* IMAGE NUMBER */}

                                            <span className="image-number">
                                                {index + 1}
                                            </span>


                                            {/* REMOVE */}

                                            <button
                                                type="button"
                                                className="remove-image-btn"
                                                onClick={() =>
                                                    removeImage(index)
                                                }
                                                aria-label={`Remove image ${index + 1}`}
                                            >
                                                ×
                                            </button>


                                            {/* FILE NAME */}

                                            <div className="selected-image-name">

                                                {imageObject.file.name}

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                    </div>


                    {/* =================================
                        MESSAGE
                    ================================== */}

                    {message && (

                        <div
                            className={
                                messageType === "success"
                                    ? "add-property-message success"
                                    : "add-property-message error"
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


                    {/* =================================
                        SUBMIT
                    ================================== */}

                    <div className="form-submit">

                        <button
                            type="submit"
                            disabled={loading}
                        >

                            {loading ? (
                                <>
                                    <span className="button-spinner">
                                        ⟳
                                    </span>

                                    Adding Property...
                                </>
                            ) : (
                                <>
                                    Add Property
                                    <span>
                                        →
                                    </span>
                                </>
                            )}

                        </button>

                    </div>


                    <p className="approval-note">

                        Your property will be reviewed by an
                        administrator before appearing publicly.

                    </p>

                </form>

            </div>

        </div>
    );
}

export default AddProperty;