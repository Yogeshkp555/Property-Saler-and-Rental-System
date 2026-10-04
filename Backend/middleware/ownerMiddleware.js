const Property = require("../models/Property");

const ownerMiddleware = async (req, res, next) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({
                message: "Property not found"
            });
        }

        if (property.ownerId.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You are not the owner of this property"
            });
        }

        req.property = property;

        next();
    } catch (error) {
        return res.status(500).json({
            message: "Failed to verify property ownership",
            error: error.message
        });
    }
};

module.exports = ownerMiddleware;