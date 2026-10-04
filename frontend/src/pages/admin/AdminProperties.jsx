import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import apiRequest from "../../services/apiRequest";

function AdminProperties() {

    // --------------------------------------------------
    // STATE
    // --------------------------------------------------

    const [properties, setProperties] = useState([]);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [page, setPage] = useState(1);

    const limit = 10;

    const [searchParams] = useSearchParams();

    const statusFilter =
        searchParams.get("status") || "all";


    // --------------------------------------------------
    // IMAGE URL
    // --------------------------------------------------

    const getImageUrl = (image) => {

        if (!image) {
            return "";
        }

        if (image.startsWith("http")) {
            return image;
        }

        return `http://localhost:5000${image}`;
    };


    // --------------------------------------------------
    // OWNER
    // --------------------------------------------------

    const getOwner = (property) => {

        if (
            property.ownerId &&
            typeof property.ownerId === "object"
        ) {
            return property.ownerId;
        }

        if (
            property.owner &&
            typeof property.owner === "object"
        ) {
            return property.owner;
        }

        if (
            property.user &&
            typeof property.user === "object"
        ) {
            return property.user;
        }

        return null;
    };


    const getOwnerName = (property) => {

        const owner = getOwner(property);

        return (
            owner?.name ||
            property.ownerName ||
            property.userName ||
            "Owner information unavailable"
        );
    };


    const getOwnerEmail = (property) => {

        const owner = getOwner(property);

        return (
            owner?.email ||
            property.ownerEmail ||
            property.userEmail ||
            ""
        );
    };


    // --------------------------------------------------
    // EXTRACT PROPERTY ARRAY
    // --------------------------------------------------

    const extractProperties = (data) => {

        const list =
            data?.properties ||
            data?.data?.properties ||
            data?.results ||
            data?.data ||
            [];

        return Array.isArray(list)
            ? list
            : [];
    };


    // --------------------------------------------------
    // GET TOTAL PAGES FROM BACKEND
    // --------------------------------------------------

    const getBackendTotalPages = (data) => {

        const value =
            data?.totalPages ??
            data?.pagination?.totalPages ??
            data?.data?.totalPages ??
            data?.data?.pagination?.totalPages ??
            1;

        const number = Number(value);

        if (
            Number.isFinite(number) &&
            number > 0
        ) {
            return Math.ceil(number);
        }

        return 1;
    };


    // --------------------------------------------------
    // FETCH ALL ADMIN PROPERTIES
    // --------------------------------------------------

    const fetchProperties = async () => {

        setLoading(true);
        setError("");

        try {

            /*
             * IMPORTANT
             *
             * We load backend pages until ALL properties
             * have been collected.
             *
             * This prevents the frontend from accidentally
             * seeing only the first 10 properties.
             */

            const backendLimit = 100;

            let allProperties = [];

            let currentBackendPage = 1;

            let totalBackendPages = 1;


            do {

                const endpoint =
                    `/admin/properties?page=${currentBackendPage}&limit=${backendLimit}`;


                const {
                    response,
                    data
                } = await apiRequest(endpoint);


                console.log(
                    "ADMIN PROPERTY RESPONSE PAGE:",
                    currentBackendPage,
                    data
                );


                if (!response.ok) {

                    throw new Error(
                        data?.message ||
                        "Failed to load properties"
                    );
                }


                const pageProperties =
                    extractProperties(data);


                allProperties = [
                    ...allProperties,
                    ...pageProperties
                ];


                totalBackendPages =
                    getBackendTotalPages(data);


                /*
                 * Safety:
                 *
                 * If backend does not provide totalPages,
                 * stop when fewer than backendLimit are returned.
                 */

                if (
                    totalBackendPages === 1 &&
                    pageProperties.length < backendLimit
                ) {
                    break;
                }


                currentBackendPage++;


                /*
                 * Safety protection against a broken backend
                 * returning an endless number of pages.
                 */

                if (currentBackendPage > 1000) {
                    break;
                }

            } while (
                currentBackendPage <= totalBackendPages
            );


            // --------------------------------------------------
            // REMOVE DUPLICATES
            // --------------------------------------------------

            const uniqueProperties = [];

            const propertyIds = new Set();


            for (const property of allProperties) {

                if (!property?._id) {
                    continue;
                }

                if (
                    propertyIds.has(
                        String(property._id)
                    )
                ) {
                    continue;
                }

                propertyIds.add(
                    String(property._id)
                );

                uniqueProperties.push(property);
            }


            console.log(
                "ALL ADMIN PROPERTIES:",
                uniqueProperties
            );

            console.log(
                "TOTAL ADMIN PROPERTIES:",
                uniqueProperties.length
            );


            setProperties(
                uniqueProperties
            );


        } catch (error) {

            console.error(
                "ADMIN PROPERTY ERROR:",
                error
            );

            setError(
                error.message ||
                "Cannot connect to backend"
            );

            setProperties([]);

        } finally {

            setLoading(false);
        }
    };


    // --------------------------------------------------
    // INITIAL LOAD
    // --------------------------------------------------

    useEffect(() => {

        fetchProperties();

    }, []);


    // --------------------------------------------------
    // RESET PAGE WHEN STATUS CHANGES
    // --------------------------------------------------

    useEffect(() => {

        setPage(1);

    }, [statusFilter]);


    // --------------------------------------------------
    // FILTER PROPERTIES
    // --------------------------------------------------

    const filteredProperties = useMemo(() => {

        if (statusFilter === "all") {

            return properties;
        }


        return properties.filter(
            (property) =>
                property.status === statusFilter
        );

    }, [
        properties,
        statusFilter
    ]);


    // --------------------------------------------------
    // CORRECT COUNT
    // --------------------------------------------------

    const totalProperties =
        filteredProperties.length;


    // --------------------------------------------------
    // TOTAL FRONTEND PAGES
    // --------------------------------------------------

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                totalProperties / limit
            )
        );


    // --------------------------------------------------
    // SAFETY IF PAGE BECOMES INVALID
    // --------------------------------------------------

    useEffect(() => {

        if (
            page > totalPages
        ) {
            setPage(totalPages);
        }

    }, [
        page,
        totalPages
    ]);


    // --------------------------------------------------
    // CURRENT PAGE PROPERTIES
    // --------------------------------------------------

    const currentProperties =
        useMemo(() => {

            const startIndex =
                (page - 1) * limit;

            const endIndex =
                startIndex + limit;

            return filteredProperties.slice(
                startIndex,
                endIndex
            );

        }, [
            filteredProperties,
            page
        ]);


    // --------------------------------------------------
    // STATUS UPDATE
    // --------------------------------------------------

    const updateStatus = async (
        propertyId,
        action
    ) => {

        const actionText =
            action === "approve"
                ? "approve"
                : "reject";


        const confirmed =
            window.confirm(
                `Are you sure you want to ${actionText} this property?`
            );


        if (!confirmed) {
            return;
        }


        setActionLoading(propertyId);
        setMessage("");
        setError("");


        try {

            const endpoint =
                action === "approve"
                    ? `/admin/properties/${propertyId}/approve`
                    : `/admin/properties/${propertyId}/reject`;


            const {
                response,
                data
            } = await apiRequest(
                endpoint,
                {
                    method: "PATCH"
                }
            );


            if (!response.ok) {

                setError(
                    data?.message ||
                    `Failed to ${actionText} property`
                );

                return;
            }


            setMessage(
                action === "approve"
                    ? "Property approved successfully."
                    : "Property rejected successfully."
            );


            /*
             * Reload all properties.
             *
             * Counts automatically become correct.
             */

            await fetchProperties();


        } catch (error) {

            console.error(error);

            setError(
                `Failed to ${actionText} property`
            );

        } finally {

            setActionLoading(null);
        }
    };


    // --------------------------------------------------
    // STATUS CLASS
    // --------------------------------------------------

    const getStatusClass = (status) => {

        if (status === "approved") {
            return "admin-status approved";
        }

        if (status === "rejected") {
            return "admin-status rejected";
        }

        return "admin-status pending";
    };


    // --------------------------------------------------
    // STATUS TEXT
    // --------------------------------------------------

    const getStatusText = (status) => {

        if (status === "approved") {
            return "Approved";
        }

        if (status === "rejected") {
            return "Rejected";
        }

        return "Pending";
    };


    // --------------------------------------------------
    // PRICE
    // --------------------------------------------------

    const formatPrice = (price) => {

        if (
            price === undefined ||
            price === null
        ) {
            return "Price unavailable";
        }

        return `₹${Number(
            price
        ).toLocaleString("en-IN")}`;
    };


    // --------------------------------------------------
    // LOADING
    // --------------------------------------------------

    if (loading) {

        return (
            <div className="admin-page">

                <div className="admin-loading">

                    <div className="admin-spinner"></div>

                    <p>
                        Loading properties...
                    </p>

                </div>

            </div>
        );
    }


    // --------------------------------------------------
    // UI
    // --------------------------------------------------

    return (

        <div className="admin-page">

            <div className="admin-container">


                {/* HEADER */}

                <div className="admin-properties-header">

                    <div>

                        <span className="admin-eyebrow">
                            PROPERTY MANAGEMENT
                        </span>

                        <h1>
                            Properties
                        </h1>

                        <p>
                            Review, approve and manage
                            property listings submitted
                            by users.
                        </p>

                    </div>


                    <Link
                        to="/admin"
                        className="admin-secondary-button"
                    >
                        ← Dashboard
                    </Link>

                </div>


                {/* FILTER TABS */}

                <div className="admin-property-tabs">

                    <Link
                        to="/admin/properties"
                        className={
                            statusFilter === "all"
                                ? "admin-tab active"
                                : "admin-tab"
                        }
                    >
                        All Properties
                    </Link>


                    <Link
                        to="/admin/properties?status=pending"
                        className={
                            statusFilter === "pending"
                                ? "admin-tab active"
                                : "admin-tab"
                        }
                    >
                        Pending
                    </Link>


                    <Link
                        to="/admin/properties?status=approved"
                        className={
                            statusFilter === "approved"
                                ? "admin-tab active"
                                : "admin-tab"
                        }
                    >
                        Approved
                    </Link>


                    <Link
                        to="/admin/properties?status=rejected"
                        className={
                            statusFilter === "rejected"
                                ? "admin-tab active"
                                : "admin-tab"
                        }
                    >
                        Rejected
                    </Link>

                </div>


                {/* MESSAGE */}

                {message && (

                    <div className="admin-success">
                        {message}
                    </div>

                )}


                {error && (

                    <div className="admin-error">
                        {error}
                    </div>

                )}


                {/* SUMMARY */}

                <div className="admin-list-summary">

                    <div>

                        <span>
                            LISTINGS
                        </span>

                        <strong>
                            {totalProperties}
                        </strong>

                    </div>


                    <p>

                        {statusFilter === "all"
                            ? "All property listings"
                            : `${statusFilter.charAt(0).toUpperCase()}${statusFilter.slice(1)} property listings`
                        }

                    </p>

                </div>


                {/* EMPTY */}

                {totalProperties === 0 && (

                    <div className="admin-empty">

                        <div className="admin-empty-icon">
                            🏠
                        </div>

                        <h2>
                            No Properties Found
                        </h2>

                        <p>
                            There are no properties in
                            this section right now.
                        </p>

                    </div>

                )}


                {/* PROPERTY LIST */}

                {currentProperties.length > 0 && (

                    <div className="admin-property-list">

                        {currentProperties.map(
                            (property) => {

                                const firstImage =
                                    property.images &&
                                    property.images.length > 0
                                        ? property.images[0]
                                        : null;


                                return (

                                    <article
                                        className="admin-property-card"
                                        key={property._id}
                                    >


                                        {/* IMAGE */}

                                        <div className="admin-property-image">

                                            {firstImage ? (

                                                <img
                                                    src={getImageUrl(
                                                        firstImage
                                                    )}
                                                    alt={
                                                        property.title ||
                                                        "Property"
                                                    }
                                                />

                                            ) : (

                                                <div className="admin-no-image">
                                                    No Image
                                                </div>

                                            )}


                                            <span
                                                className={
                                                    getStatusClass(
                                                        property.status
                                                    )
                                                }
                                            >
                                                {getStatusText(
                                                    property.status
                                                )}
                                            </span>

                                        </div>


                                        {/* CONTENT */}

                                        <div className="admin-property-content">


                                            {/* TOP */}

                                            <div className="admin-property-top">

                                                <div>

                                                    <span className="admin-property-type">

                                                        {property.propertyType ||
                                                            "Property"}

                                                        {" · "}

                                                        {property.listingType ===
                                                        "rent"
                                                            ? "For Rent"
                                                            : "For Sale"}

                                                    </span>


                                                    <h2>

                                                        {property.title ||
                                                            "Untitled Property"}

                                                    </h2>

                                                </div>


                                                <strong className="admin-property-price">

                                                    {formatPrice(
                                                        property.price
                                                    )}


                                                    {property.listingType ===
                                                        "rent" && (

                                                        <small>
                                                            / month
                                                        </small>

                                                    )}

                                                </strong>

                                            </div>


                                            {/* LOCATION */}

                                            <div className="admin-property-location">

                                                <span>
                                                    📍
                                                </span>

                                                <span>

                                                    {property.area ||
                                                        "Area unavailable"}

                                                    {property.city
                                                        ? `, ${property.city}`
                                                        : ""}

                                                </span>

                                            </div>


                                            {/* DETAILS */}

                                            <div className="admin-property-details">

                                                {property.bhk !==
                                                    undefined &&
                                                    property.bhk !==
                                                        null && (

                                                        <span>

                                                            🛏{" "}
                                                            {property.bhk}{" "}
                                                            BHK

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
                                                        {
                                                            property.furnishing
                                                        }

                                                    </span>

                                                )}


                                                {property.views !==
                                                    undefined && (

                                                    <span>

                                                        👁{" "}
                                                        {
                                                            property.views
                                                        }{" "}
                                                        views

                                                    </span>

                                                )}

                                            </div>


                                            {/* OWNER */}

                                            <div className="admin-owner">

                                                <div className="admin-owner-avatar">

                                                    {getOwnerName(
                                                        property
                                                    )
                                                        .charAt(0)
                                                        .toUpperCase()}

                                                </div>


                                                <div>

                                                    <span>
                                                        LISTED BY
                                                    </span>


                                                    <strong>

                                                        {getOwnerName(
                                                            property
                                                        )}

                                                    </strong>


                                                    {getOwnerEmail(
                                                        property
                                                    ) && (

                                                        <small>

                                                            {
                                                                getOwnerEmail(
                                                                    property
                                                                )
                                                            }

                                                        </small>

                                                    )}

                                                </div>

                                            </div>


                                            {/* ACTIONS */}

                                            <div className="admin-property-actions">


                                                <Link
                                                    to={`/properties/${property._id}`}
                                                    className="admin-view-button"
                                                >
                                                    View Details
                                                </Link>


                                                {property.status !==
                                                    "approved" && (

                                                    <button
                                                        className="admin-approve-button"
                                                        disabled={
                                                            actionLoading ===
                                                            property._id
                                                        }
                                                        onClick={() =>
                                                            updateStatus(
                                                                property._id,
                                                                "approve"
                                                            )
                                                        }
                                                    >

                                                        {actionLoading ===
                                                        property._id
                                                            ? "Updating..."
                                                            : "Approve"}

                                                    </button>

                                                )}


                                                {property.status !==
                                                    "rejected" && (

                                                    <button
                                                        className="admin-reject-button"
                                                        disabled={
                                                            actionLoading ===
                                                            property._id
                                                        }
                                                        onClick={() =>
                                                            updateStatus(
                                                                property._id,
                                                                "reject"
                                                            )
                                                        }
                                                    >

                                                        {actionLoading ===
                                                        property._id
                                                            ? "Updating..."
                                                            : "Reject"}

                                                    </button>

                                                )}

                                            </div>

                                        </div>

                                    </article>

                                );
                            }
                        )}

                    </div>

                )}


                {/* PAGINATION */}

                {totalPages > 1 && (

                    <div className="pagination">

                        <button
                            onClick={() =>
                                setPage(
                                    (currentPage) =>
                                        currentPage - 1
                                )
                            }
                            disabled={
                                page === 1
                            }
                        >
                            ← Previous
                        </button>


                        <span>
                            Page {page} of {totalPages}
                        </span>


                        <button
                            onClick={() =>
                                setPage(
                                    (currentPage) =>
                                        currentPage + 1
                                )
                            }
                            disabled={
                                page === totalPages
                            }
                        >
                            Next →
                        </button>

                    </div>

                )}

            </div>

        </div>
    );
}

export default AdminProperties;
