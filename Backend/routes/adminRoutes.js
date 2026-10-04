const express = require("express");

const {
    
    updatePropertyStatus,
    getPendingProperties,
    getAdminAllProperties,
    getUserProperties,
    getPropertyStats
} = require("../controllers/propertyController");

const {
    getAdminUserProfile,
    getAdminDashboardStats,
    updateUserBlockStatus,
    getAllUsers,
    deleteUser
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// Get pending properties
router.get(
    "/properties",
    authMiddleware,
    adminMiddleware,
    getAdminAllProperties
);
router.get(
    "/properties/pending",
    authMiddleware,
    adminMiddleware,
    getPendingProperties
);
router.get(
    "/users/:id/properties",
    authMiddleware,
    adminMiddleware,
    getUserProperties
);
router.get(
    "/users",
    authMiddleware,
    adminMiddleware,
    getAllUsers
);
router.get(
    "/users/:id",
    authMiddleware,
    adminMiddleware,
    getAdminUserProfile
);
router.get(
    "/dashboard",
    authMiddleware,
    adminMiddleware,
    getAdminDashboardStats
);
router.get(
    "/properties/stats",
    authMiddleware,
    adminMiddleware,
    getPropertyStats
);
router.patch(
    "/users/:id/block",
    authMiddleware,
    adminMiddleware,
    updateUserBlockStatus,
    
);


router.patch(
    "/properties/:id/approve",
    authMiddleware,
    adminMiddleware,
    (req, res) => {
        req.body = { status: "approved" };
        updatePropertyStatus(req, res);
    }
);

router.patch(
    "/properties/:id/reject",
    authMiddleware,
    adminMiddleware,
    (req, res) => {
        req.body = { status: "rejected" };
        updatePropertyStatus(req, res);
    }
);


router.delete(
    "/users/:id",
    authMiddleware,
    adminMiddleware,
    deleteUser
);

module.exports = router;