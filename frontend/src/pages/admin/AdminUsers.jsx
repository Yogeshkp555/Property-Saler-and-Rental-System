import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import apiRequest from "../../services/apiRequest";

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const [searchParams, setSearchParams] = useSearchParams();

    // Search box value
    const [search, setSearch] = useState(
        searchParams.get("search") || ""
    );

    // Search value that has actually been submitted
    const [appliedSearch, setAppliedSearch] = useState(
        searchParams.get("search") || ""
    );

    const [status, setStatus] = useState(
        searchParams.get("status") || "all"
    );

    const [page, setPage] = useState(
        Number(searchParams.get("page")) || 1
    );

    const [totalPages, setTotalPages] = useState(1);

    const limit = 10;

    const fetchUsers = async () => {
        setLoading(true);
        setMessage("");

        try {
            const params = new URLSearchParams();

            params.append("page", page);
            params.append("limit", limit);

            // Use only the submitted search value
            if (appliedSearch.trim()) {
                params.append(
                    "search",
                    appliedSearch.trim()
                );
            }

            if (status !== "all") {
                params.append("status", status);
            }

            const { response, data } = await apiRequest(
                `/admin/users?${params.toString()}`
            );

            if (!response.ok) {
                setMessage(
                    data.message ||
                    "Failed to load users"
                );

                setUsers([]);
                return;
            }

            console.log(
                "ADMIN USERS RESPONSE:",
                data
            );

            const userList =
                data.users ||
                data.data?.users ||
                data.results ||
                data.data ||
                [];

            setUsers(
                Array.isArray(userList)
                    ? userList
                    : []
            );

            setTotalPages(
                data.totalPages ||
                data.data?.totalPages ||
                1
            );

        } catch (error) {
            console.error(error);
            setMessage(
                "Cannot connect to backend"
            );
        } finally {
            setLoading(false);
        }
    };

    // Fetch whenever page, status or submitted search changes
    useEffect(() => {
        fetchUsers();
    }, [page, status, appliedSearch]);

    // Search button
    const handleSearch = (e) => {
        e.preventDefault();

        const newSearch = search.trim();

        // Save the new submitted search
        setAppliedSearch(newSearch);

        // Always start from page 1
        setPage(1);

        setSearchParams({
            ...(newSearch
                ? {
                    search: newSearch
                }
                : {}),
            ...(status !== "all"
                ? {
                    status
                }
                : {}),
            page: "1"
        });
    };

    // Status filter
    const handleStatusChange = (e) => {
        const newStatus = e.target.value;

        setStatus(newStatus);
        setPage(1);

        // Keep the last submitted search
        setSearchParams({
            ...(appliedSearch
                ? {
                    search: appliedSearch
                }
                : {}),
            ...(newStatus !== "all"
                ? {
                    status: newStatus
                }
                : {}),
            page: "1"
        });
    };

    const handleBlockToggle = async (user) => {
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
            console.log("BEFORE:", user);

            const { response, data } = await apiRequest(
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

            console.log(
                "BLOCK RESPONSE STATUS:",
                response.status
            );

            console.log(
                "BLOCK RESPONSE DATA:",
                JSON.stringify(data, null, 2)
            );

            if (!response.ok) {
                alert(
                    data.message ||
                    `Failed to ${action} user`
                );

                return;
            }

            setMessage(
                data.message ||
                `User ${action}ed successfully`
            );

            await fetchUsers();

        } catch (error) {
            console.error(
                "BLOCK ERROR:",
                error
            );

            alert(
                "Cannot connect to backend"
            );
        }
    };

    const handleDelete = async (user) => {
        const confirmed = window.confirm(
            `Are you sure you want to permanently delete ${user.name}?\n\nThis will also delete the user's properties.`
        );

        if (!confirmed) {
            return;
        }

        try {
            const { response, data } = await apiRequest(
                `/admin/users/${user._id}`,
                {
                    method: "DELETE"
                }
            );

            if (!response.ok) {
                alert(
                    data.message ||
                    "Failed to delete user"
                );

                return;
            }

            setMessage(
                data.message ||
                "User deleted successfully"
            );

            fetchUsers();

        } catch (error) {
            console.error(error);

            alert(
                "Cannot connect to backend"
            );
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-container">

                {/* Header */}

                <div className="admin-users-header">

                    <div>
                        <span className="admin-eyebrow">
                            ADMINISTRATION
                        </span>

                        <h1>
                            User Management
                        </h1>

                        <p>
                            Manage registered users,
                            account status and their
                            properties.
                        </p>
                    </div>

                    <Link
                        to="/admin"
                        className="admin-secondary-button"
                    >
                        ← Dashboard
                    </Link>

                </div>

                {/* Search / Filter */}

                <div className="admin-user-toolbar">

                    <form
                        onSubmit={handleSearch}
                        className="admin-user-search"
                    >

                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

                        <button type="submit">
                            Search
                        </button>

                    </form>

                    <select
                        value={status}
                        onChange={handleStatusChange}
                        className="admin-status-filter"
                    >

                        <option value="all">
                            All Users
                        </option>

                        <option value="active">
                            Active Users
                        </option>

                        <option value="blocked">
                            Blocked Users
                        </option>

                    </select>

                </div>

                {/* Message */}

                {message && (
                    <div className="admin-success-message">
                        {message}
                    </div>
                )}

                {/* Users */}

                {loading ? (

                    <div className="admin-loading">

                        <div className="admin-spinner"></div>

                        <p>
                            Loading users...
                        </p>

                    </div>

                ) : users.length === 0 ? (

                    <div className="admin-empty-state">

                        <div className="admin-empty-icon">
                            👥
                        </div>

                        <h2>
                            No users found
                        </h2>

                        <p>
                            No users match your
                            current search or filter.
                        </p>

                    </div>

                ) : (

                    <div className="admin-users-table-wrapper">

                        <table className="admin-users-table">

                            <thead>

                                <tr>

                                    <th>
                                        User
                                    </th>

                                    <th>
                                        Contact
                                    </th>

                                    <th>
                                        Role
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Joined
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {users.map((user) => (

                                    <tr key={user._id}>

                                        <td>

                                            <div className="admin-user-info">

                                                <div className="admin-user-avatar">
                                                    {user.name
                                                        ?.charAt(0)
                                                        ?.toUpperCase() || "U"}
                                                </div>

                                                <div>

                                                    <strong>
                                                        {user.name}
                                                    </strong>

                                                    <span>
                                                        {user.email}
                                                    </span>

                                                </div>

                                            </div>

                                        </td>

                                        <td>

                                            <span className="admin-phone">
                                                {user.phone || "—"}
                                            </span>

                                        </td>

                                        <td>

                                            <span
                                                className={
                                                    user.role === "admin"
                                                        ? "admin-role-badge"
                                                        : "admin-user-role-badge"
                                                }
                                            >

                                                {user.role === "admin"
                                                    ? "Admin"
                                                    : "User"}

                                            </span>

                                        </td>

                                        <td>

                                            <span
                                                className={
                                                    user.isBlocked
                                                        ? "admin-status-badge blocked"
                                                        : "admin-status-badge active"
                                                }
                                            >

                                                <span></span>

                                                {user.isBlocked
                                                    ? "Blocked"
                                                    : "Active"}

                                            </span>

                                        </td>

                                        <td>

                                            {user.createdAt
                                                ? new Date(
                                                    user.createdAt
                                                ).toLocaleDateString()
                                                : "—"}

                                        </td>

                                        <td>

                                            <div className="admin-user-actions">

                                                <Link
                                                    to={`/admin/users/${user._id}`}
                                                    className="admin-action-button view"
                                                >
                                                    View
                                                </Link>

                                                <button
                                                    type="button"
                                                    className={
                                                        user.isBlocked
                                                            ? "admin-action-button unblock"
                                                            : "admin-action-button block"
                                                    }
                                                    onClick={() =>
                                                        handleBlockToggle(user)
                                                    }
                                                >

                                                    {user.isBlocked
                                                        ? "Unblock"
                                                        : "Block"}

                                                </button>

                                                {user.role !== "admin" && (

                                                    <button
                                                        type="button"
                                                        className="admin-action-button delete"
                                                        onClick={() =>
                                                            handleDelete(user)
                                                        }
                                                    >
                                                        Delete
                                                    </button>

                                                )}

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

                {/* Pagination */}

                {!loading && users.length > 0 && (

                    <div className="admin-pagination">

                        <button
                            disabled={page <= 1}
                            onClick={() => {

                                const newPage = page - 1;

                                setPage(newPage);

                                setSearchParams({
                                    ...(appliedSearch
                                        ? {
                                            search:
                                                appliedSearch
                                        }
                                        : {}),
                                    ...(status !== "all"
                                        ? {
                                            status
                                        }
                                        : {}),
                                    page: String(newPage)
                                });

                            }}
                        >
                            ← Previous
                        </button>

                        <span>
                            Page {page} of {totalPages}
                        </span>

                        <button
                            disabled={page >= totalPages}
                            onClick={() => {

                                const newPage = page + 1;

                                setPage(newPage);

                                setSearchParams({
                                    ...(appliedSearch
                                        ? {
                                            search:
                                                appliedSearch
                                        }
                                        : {}),
                                    ...(status !== "all"
                                        ? {
                                            status
                                        }
                                        : {}),
                                    page: String(newPage)
                                });

                            }}
                        >
                            Next →
                        </button>

                    </div>

                )}

            </div>
        </div>
    );
}

export default AdminUsers;