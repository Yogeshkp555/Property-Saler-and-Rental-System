import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiRequest from "../../services/apiRequest";

function AdminDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setMessage("");

            const [
                dashboardResult,
                statsResult,
                usersResult
            ] = await Promise.all([
                apiRequest("/admin/dashboard"),
                apiRequest("/admin/properties/stats"),
                apiRequest("/admin/users?page=1&limit=100")
            ]);

            /* =========================
               DASHBOARD DATA
            ========================= */

            if (dashboardResult.response.ok) {
                setDashboard(dashboardResult.data);
            }

            /* =========================
               PROPERTY STATS
            ========================= */

            if (statsResult.response.ok) {
                setStats(statsResult.data);
            }

            /* =========================
               USERS
            ========================= */

            if (usersResult.response.ok) {
                const userData = usersResult.data;

                console.log(
                    "ADMIN USERS RESPONSE:",
                    userData
                );

                const userList =
                    userData.users ||
                    userData.data?.users ||
                    userData.results ||
                    userData.data ||
                    [];

                setUsers(
                    Array.isArray(userList)
                        ? userList
                        : []
                );
            }

        } catch (error) {
            console.error(
                "Dashboard Error:",
                error
            );

            setMessage(
                "Unable to load dashboard data"
            );
        } finally {
            setLoading(false);
        }
    };

    /* =========================
       USER STATISTICS
    ========================= */

    const total = users.length;

    const blocked = users.filter(
        (user) => user.isBlocked === true
    ).length;

    const active = users.filter(
        (user) => user.isBlocked === false
    ).length;

    /* =========================
       PROPERTY STATISTICS
    ========================= */

    const getPropertyStats = () => {
        if (!stats) {
            return {
                total: 0,
                pending: 0,
                approved: 0,
                rejected: 0
            };
        }

        return {
            total:
                stats.totalProperties ??
                stats.total ??
                0,

            pending:
                stats.pendingProperties ??
                stats.pending ??
                0,

            approved:
                stats.approvedProperties ??
                stats.approved ??
                0,

            rejected:
                stats.rejectedProperties ??
                stats.rejected ??
                0
        };
    };

    const propertyStats = getPropertyStats();

    /* =========================
       LOADING
    ========================= */

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-loading">
                    Loading dashboard...
                </div>
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
                        Dashboard
                    </h1>

                    <p>
                        Manage users, properties,
                        approvals and platform activity.
                    </p>
                </div>

            </div>


            {message && (
                <div className="admin-message">
                    {message}
                </div>
            )}


            {/* =========================
                USER STATISTICS
            ========================= */}

            <div className="admin-stats-grid">

                <div className="admin-stat-card">

                    <div className="admin-stat-icon">
                        👥
                    </div>

                    <div>
                        <span>
                            Total Users
                        </span>

                        <strong>
                            {total}
                        </strong>
                    </div>

                </div>


                <div className="admin-stat-card">

                    <div className="admin-stat-icon">
                        ✓
                    </div>

                    <div>
                        <span>
                            Active Users
                        </span>

                        <strong>
                            {active}
                        </strong>
                    </div>

                </div>


                <div className="admin-stat-card">

                    <div className="admin-stat-icon">
                        !
                    </div>

                    <div>
                        <span>
                            Blocked Users
                        </span>

                        <strong>
                            {blocked}
                        </strong>
                    </div>

                </div>

            </div>


            {/* =========================
                PROPERTY STATISTICS
            ========================= */}

            <div className="admin-section">

                <div className="admin-section-header">

                    <div>
                        <span className="admin-eyebrow">
                            PROPERTY OVERVIEW
                        </span>

                        <h2>
                            Property Statistics
                        </h2>
                    </div>

                    <Link
                        to="/admin/properties"
                        className="admin-outline-button"
                    >
                        Manage Properties
                    </Link>

                </div>


                <div className="admin-stats-grid">

                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">
                            🏠
                        </div>

                        <div>
                            <span>
                                Total Properties
                            </span>

                            <strong>
                                {propertyStats.total}
                            </strong>
                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">
                            ⏳
                        </div>

                        <div>
                            <span>
                                Pending
                            </span>

                            <strong>
                                {propertyStats.pending}
                            </strong>
                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">
                            ✓
                        </div>

                        <div>
                            <span>
                                Approved
                            </span>

                            <strong>
                                {propertyStats.approved}
                            </strong>
                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">
                            ✕
                        </div>

                        <div>
                            <span>
                                Rejected
                            </span>

                            <strong>
                                {propertyStats.rejected}
                            </strong>
                        </div>

                    </div>

                </div>

            </div>


            {/* =========================
                QUICK ACTIONS
            ========================= */}

            <div className="admin-section">

                <div className="admin-section-header">

                    <div>
                        <span className="admin-eyebrow">
                            MANAGEMENT
                        </span>

                        <h2>
                            Quick Actions
                        </h2>
                    </div>

                </div>


                <div className="admin-quick-actions">

                    <Link
                        to="/admin/properties"
                        className="admin-action-card"
                    >
                        <div className="admin-action-icon">
                            🏠
                        </div>

                        <div>
                            <h3>
                                Manage Properties
                            </h3>

                            <p>
                                Review, approve and reject
                                property listings.
                            </p>
                        </div>
                    </Link>


                    <Link
                        to="/admin/users"
                        className="admin-action-card"
                    >
                        <div className="admin-action-icon">
                            👥
                        </div>

                        <div>
                            <h3>
                                Manage Users
                            </h3>

                            <p>
                                View, block and manage
                                registered users.
                            </p>
                        </div>
                    </Link>

                </div>

            </div>


            {/* =========================
                DASHBOARD INFORMATION
            ========================= */}

            {dashboard && (
                <div className="admin-section">

                    <div className="admin-section-header">

                        <div>
                            <span className="admin-eyebrow">
                                SYSTEM
                            </span>

                            <h2>
                                Platform Overview
                            </h2>
                        </div>

                    </div>


                    <div className="admin-overview-card">

                        <p>
                            The admin dashboard provides
                            centralized management of users
                            and property listings.
                        </p>

                        <p>
                            Use the management sections above
                            to review property submissions and
                            control user accounts.
                        </p>

                    </div>

                </div>
            )}

        </div>
    );
}

export default AdminDashboard;