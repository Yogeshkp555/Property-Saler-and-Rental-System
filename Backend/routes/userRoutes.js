const express = require("express");

const {
    registerUser,
    loginUser,
    getMyProfile,
    addFavorite,
    updateMyProfile,
    getUserProfile,
    getFavorites,
    removeFavorite
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);


router.get(
    "/favorites",
    authMiddleware,
    getFavorites
);
// Logged-in user's own profile
router.get("/profile", authMiddleware, getMyProfile);


router.post(
    "/favorites/:propertyId",
    authMiddleware,
    addFavorite
);
router.put("/profile", authMiddleware, updateMyProfile);

// Public user/owner profile
router.get("/:id", getUserProfile);
router.delete(
    "/favorites/:propertyId",
    authMiddleware,
    removeFavorite
);

module.exports = router;