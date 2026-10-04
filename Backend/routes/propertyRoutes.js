const express = require("express");

const {
    createProperty,
    getAllProperties,
    getPropertyById,
    updateProperty,
    deleteProperty,
    deletePropertyImage,
    updatePropertyStatus,
    getPropertiesByStatus,
    getApprovedProperties,
    searchProperties,
    getMyProperties
} = require("../controllers/propertyController");
const authMiddleware = require("../middleware/authMiddleware");
const ownerMiddleware = require("../middleware/ownerMiddleware");
const upload = require("../middleware/uploadMiddleware");
const router = express.Router();


router.post(
    "/",
    authMiddleware,
    upload.array("images", 5),
    createProperty
);
router.get("/", getAllProperties);

router.get("/status/:status", getPropertiesByStatus);
router.get("/approved", getApprovedProperties);
router.get("/search", searchProperties);
router.get(
    "/my-properties",
    authMiddleware,
    getMyProperties
);
router.delete(
    "/:id/images/:index",
    authMiddleware,
    ownerMiddleware,
    deletePropertyImage
);
router.get("/:id", getPropertyById);
router.put(
    "/:id",
    authMiddleware,
    ownerMiddleware,
    upload.array("images", 5),
    updateProperty
);
router.delete(
    "/:id",
    authMiddleware,
    ownerMiddleware,
    deleteProperty
);

module.exports = router;