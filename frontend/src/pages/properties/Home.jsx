import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import apiRequest from "../../services/apiRequest";
import PropertyCard from "../../components/PropertyCard";

function Home() {

    const [properties, setProperties] = useState([]);

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
const [searchParams, setSearchParams] = useSearchParams();

const [page, setPage] = useState(
    Number(searchParams.get("page")) || 1
);
    const [totalPages, setTotalPages] = useState(1);

    // Search & filter states
    const [search, setSearch] = useState("");
    const [city, setCity] = useState("");
    const [area, setArea] = useState("");
    const [listingType, setListingType] = useState("");
    const [propertyType, setPropertyType] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [minSquareFeet, setMinSquareFeet] = useState("");
    const [maxSquareFeet, setMaxSquareFeet] = useState("");
    const [bhk, setBhk] = useState("");
    const [furnishing, setFurnishing] = useState("");
    const [sort, setSort] = useState("newest");
    const [isSearching, setIsSearching] = useState(false);
    const [searchTrigger, setSearchTrigger] = useState(0);

    const limit = 6;


    // =========================================
    // FETCH PROPERTIES
    // =========================================

    const fetchProperties = async () => {
        setLoading(true);
        setMessage("");

        try {
            let endpoint;

            // If search/filter is active
            if (isSearching) {
                const params = new URLSearchParams();

                if (search.trim()) {
                    params.append("search", search.trim());
                }

                if (city.trim()) {
                    params.append("city", city.trim());
                }

                if (area.trim()) {
                    params.append("area", area.trim());
                }

                if (listingType) {
                    params.append("listingType", listingType);
                }

                if (propertyType) {
                    params.append("propertyType", propertyType);
                }

                if (minPrice) {
                    params.append("minPrice", minPrice);
                }

                if (maxPrice) {
                    params.append("maxPrice", maxPrice);
                }

                if (minSquareFeet) {
                    params.append("minSquareFeet", minSquareFeet);
                }

                if (maxSquareFeet) {
                    params.append("maxSquareFeet", maxSquareFeet);
                }

                if (bhk) {
                    params.append("bhk", bhk);
                }

                if (furnishing) {
                    params.append("furnishing", furnishing);
                }

                params.append("sort", sort);

                params.append("page", page);
                params.append("limit", limit);

                endpoint =
                    `/properties/search?${params.toString()}`;

            } else {

                // Normal property listing
                endpoint =
                    `/properties?page=${page}&limit=${limit}&sort=${sort}`;
            }


            const { response, data } =
                await apiRequest(endpoint);


            if (!response.ok) {
                setMessage(
                    data.message ||
                    "Failed to load properties"
                );

                setProperties([]);

                return;
            }


            setProperties(
                data.properties || []
            );

            setTotalPages(
                data.totalPages || 1
            );


        } catch (error) {

            setMessage(
                "Cannot connect to backend"
            );

            setProperties([]);

        } finally {

            setLoading(false);

        }
    };


    // =========================================
    // SEARCH
    // =========================================

    const searchProperties = () => {

        setPage(1);

        setIsSearching(true);

        setSearchTrigger(
            (previous) => previous + 1
        );

    };


    // =========================================
    // FETCH WHEN PAGE CHANGES
    // =========================================

    useEffect(() => {
        fetchProperties();
    }, [page, isSearching, searchTrigger]);

useEffect(() => {
    setSearchParams(
        {
            page: String(page)
        },
        { replace: true }
    );
}, [page]);
    // =========================================
    // CLEAR FILTERS
    // =========================================

    const clearFilters = () => {

        setSearch("");
        setCity("");
        setArea("");
        setListingType("");
        setPropertyType("");
        setMinPrice("");
        setMaxPrice("");
        setMinSquareFeet("");
        setMaxSquareFeet("");
        setBhk("");
        setFurnishing("");
        setSort("newest");
        setIsSearching(false);

        setPage(1);

    };


    return (
        <div className="home-page">


            {/* ================================= */}
            {/* HERO SECTION */}
            {/* ================================= */}

            <section className="hero-section">

                <div>

                    <p className="hero-small-title">
                        FIND YOUR PERFECT PROPERTY
                    </p>

                    <h1>
                        Find a place you’ll
                        <span> love to live</span>
                    </h1>

                    <p className="hero-description">
                        Explore verified properties for rent
                        and sale in your preferred location.
                    </p>

                </div>

            </section>


            {/* ================================= */}
            {/* SEARCH & FILTER SECTION */}
            {/* ================================= */}

            <section className="property-search-section">

                <div className="property-search-header">

                    <div>

                        <p className="property-search-label">
                            FIND YOUR PROPERTY
                        </p>

                        <h2>
                            Search & Filter Properties
                        </h2>

                        <p>
                            Find the right property using your
                            preferred location, budget and
                            property details.
                        </p>

                    </div>

                </div>


                <div className="property-search-box">


                    {/* Search */}

                    <div className="search-field search-field-wide">

                        <label>
                            Search
                        </label>

                        <input
                            type="text"
                            placeholder="Search property..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

                    </div>


                    {/* City */}

                    <div className="search-field">

                        <label>
                            City
                        </label>

                        <input
                            type="text"
                            placeholder="e.g. Ahmedabad"
                            value={city}
                            onChange={(e) =>
                                setCity(e.target.value)
                            }
                        />

                    </div>


                    {/* Area */}

                    <div className="search-field">

                        <label>
                            Area
                        </label>

                        <input
                            type="text"
                            placeholder="e.g. Satellite"
                            value={area}
                            onChange={(e) =>
                                setArea(e.target.value)
                            }
                        />

                    </div>


                    {/* Listing Type */}

                    <div className="search-field">

                        <label>
                            Listing Type
                        </label>

                        <select
                            value={listingType}
                            onChange={(e) =>
                                setListingType(e.target.value)
                            }
                        >

                            <option value="">
                                All
                            </option>

                            <option value="sale">
                                For Sale
                            </option>

                            <option value="rent">
                                For Rent
                            </option>

                        </select>

                    </div>


                    {/* Property Type */}

                    <div className="search-field">

                        <label>
                            Property Type
                        </label>

                        <select
                            value={propertyType}
                            onChange={(e) =>
                                setPropertyType(e.target.value)
                            }
                        >

                            <option value="">
                                All
                            </option>

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


                    {/* Min Price */}

                    <div className="search-field">

                        <label>
                            Min Price
                        </label>

                        <input
                            type="number"
                            placeholder="₹ Minimum"
                            min="0"
                            value={minPrice}
                            onChange={(e) =>
                                setMinPrice(e.target.value)
                            }
                        />

                    </div>


                    {/* Max Price */}

                    <div className="search-field">

                        <label>
                            Max Price
                        </label>

                        <input
                            type="number"
                            placeholder="₹ Maximum"
                            min="0"
                            value={maxPrice}
                            onChange={(e) =>
                                setMaxPrice(e.target.value)
                            }
                        />

                    </div>


                    {/* Sq Feet */}

                    <div className="search-field">

                        <label>
                            Min Sq. Ft.
                        </label>

                        <input
                            type="number"
                            min="0"
                            placeholder="e.g. 500"
                            value={minSquareFeet}
                            onChange={(e) =>
                                setMinSquareFeet(e.target.value)
                            }
                        />

                    </div>


                    <div className="search-field">

                        <label>
                            Max Sq. Ft.
                        </label>

                        <input
                            type="number"
                            min="0"
                            placeholder="e.g. 2000"
                            value={maxSquareFeet}
                            onChange={(e) =>
                                setMaxSquareFeet(e.target.value)
                            }
                        />

                    </div>


                    {/* Sort */}

                    <div className="search-field">

                        <label>
                            Sort By
                        </label>

                        <select
                            value={sort}
                            onChange={(e) =>
                                setSort(e.target.value)
                            }
                        >

                            <option value="newest">
                                Newest First
                            </option>

                            <option value="oldest">
                                Oldest First
                            </option>

                            <option value="price_asc">
                                Price: Low to High
                            </option>

                            <option value="price_desc">
                                Price: High to Low
                            </option>

                        </select>

                    </div>


                    {/* BHK */}

                    <div className="search-field">

                        <label>
                            BHK
                        </label>

                        <select
                            value={bhk}
                            onChange={(e) =>
                                setBhk(e.target.value)
                            }
                        >

                            <option value="">
                                Any
                            </option>

                            <option value="1">
                                1 BHK
                            </option>

                            <option value="2">
                                2 BHK
                            </option>

                            <option value="3">
                                3 BHK
                            </option>

                            <option value="4">
                                4 BHK
                            </option>

                            <option value="5">
                                5+ BHK
                            </option>

                        </select>

                    </div>


                    {/* Furnishing */}

                    <div className="search-field">

                        <label>
                            Furnishing
                        </label>

                        <select
                            value={furnishing}
                            onChange={(e) =>
                                setFurnishing(e.target.value)
                            }
                        >

                            <option value="">
                                Any
                            </option>

                            <option value="furnished">
                                Furnished
                            </option>

                            <option value="semi-furnished">
                                Semi Furnished
                            </option>

                            <option value="unfurnished">
                                Unfurnished
                            </option>

                        </select>

                    </div>


                    {/* Search Buttons */}

                    <div className="search-actions">

                        <button
                            type="button"
                            className="property-search-btn"
                            onClick={searchProperties}
                        >
                            Search Properties
                        </button>


                        <button
                            type="button"
                            className="property-clear-btn"
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </button>

                    </div>

                </div>

            </section>


            {/* ================================= */}
            {/* PROPERTY SECTION */}
            {/* ================================= */}

            <section className="properties-section">


                <div className="section-header">

                    <div>

                        <p className="section-label">
                            EXPLORE PROPERTIES
                        </p>

                        <h2>
                            {isSearching
                                ? "Search Results"
                                : "Latest Properties"}

                        </h2>

                    </div>


                    <span className="property-count">
                        {properties.length} properties
                    </span>


                </div>


                {/* Loading */}

                {loading && (

                    <div className="loading">
                        Loading properties...
                    </div>

                )}


                {/* Error */}

                {!loading && message && (

                    <div className="error-message">
                        {message}
                    </div>

                )}


                {/* Empty */}

                {!loading &&
                    !message &&
                    properties.length === 0 && (

                        <div className="empty-message">

                            {isSearching
                                ? "No properties found matching your search."
                                : "No approved properties available."}

                        </div>

                    )}


                {/* Property Cards */}

                {!loading &&
                    properties.length > 0 && (

                        <div className="property-grid">

                            {properties.map((property) => (

                                <PropertyCard
                                    key={property._id}
                                    property={property}
                                    currentPage={page}
                                />

                            ))}

                        </div>

                    )}


                {/* ================================= */}
                {/* PAGINATION */}
                {/* ================================= */}

                {!loading &&
                    properties.length > 0 && (

                        <div className="pagination">


                            <button
                                onClick={() =>
                                    setPage(page - 1)
                                }
                                disabled={page === 1}
                            >
                                ← Previous
                            </button>


                            <span>
                                Page {page} of {totalPages}
                            </span>


                            <button
                                onClick={() =>
                                    setPage(page + 1)
                                }
                                disabled={
                                    page >= totalPages
                                }
                            >
                                Next →
                            </button>


                        </div>

                    )}

            </section>

        </div>
    );
}

export default Home;