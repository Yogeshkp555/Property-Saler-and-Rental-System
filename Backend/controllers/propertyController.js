const Property = require("../models/Property");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");


const createProperty = async (req, res) => {
    try {

        // Check image is uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                message: "At least one property image is required"
            });
        }

        const imagePaths = req.files.map(
            file => `/uploads/${file.filename}`
        );

        const property = await Property.create({
            ...req.body,
            ownerId: req.user.userId,
            images: imagePaths
        });

        res.status(201).json({
            message: "Property created successfully",
            property
        });

    } catch (error) {
        res.status(400).json({
            message: "Failed to create property",
            error: error.message
        });
    }
};

const getAllProperties = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        let sortOption = { createdAt: -1 };

        if (req.query.sort === "price_asc") {
            sortOption = { price: 1 };
        }

        if (req.query.sort === "price_desc") {
            sortOption = { price: -1 };
        }

        if (req.query.sort === "newest") {
            sortOption = { createdAt: -1 };
        }

        if (req.query.sort === "oldest") {
            sortOption = { createdAt: 1 };
        }

        if (req.query.sort === "views") {
            sortOption = { views: -1 };
        }

        const properties = await Property.find({
            status: "approved"
        })
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .populate("ownerId", "name email phone");

        const totalProperties = await Property.countDocuments({
            status: "approved"
        });

        res.status(200).json({
            currentPage: page,
            totalPages: Math.ceil(totalProperties / limit),
            totalProperties,
            properties
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to get properties",
            error: error.message
        });
    }
};

const getPropertyById = async (req, res) => {
    try {
        const property = await Property.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
                { returnDocument: "after" }

        ).populate("ownerId", "name email phone");

        if (!property) {
            return res.status(404).json({
                message: "Property not found"
            });
        }

        res.status(200).json({
            property
        });

    } catch (error) {
        res.status(400).json({
            message: "Failed to get property",
            error: error.message
        });
    }
};
const updateProperty = async (req, res) => {
    try {
        const updateData = {
            ...req.body,
            status: "pending"
        };

        // Replace only selected image
        if (req.files && req.files.length > 0) {

            const imageIndex = Number(req.body.imageIndex);

            const oldImages = req.property.images || [];

            // Check imageIndex
            if (
                !Number.isInteger(imageIndex) ||
                imageIndex < 0 ||
                imageIndex >= oldImages.length
            ) {
                return res.status(400).json({
                    message: "Invalid imageIndex"
                });
            }

            // Old image path
            const oldImagePath = oldImages[imageIndex];

            // Delete old physical image
            const relativeImagePath = oldImagePath.replace(/^\/+/, "");

            const filePath = path.join(
                __dirname,
                "..",
                relativeImagePath
            );

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            // Keep all old images
            const newImages = [...oldImages];

            // Replace only selected index
            newImages[imageIndex] =
                `/uploads/${req.files[0].filename}`;

            updateData.images = newImages;
        }

        const property = await Property.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        if (!property) {
            return res.status(404).json({
                message: "Property not found"
            });
        }

        res.status(200).json({
            message: "Property updated successfully",
            property
        });

    } catch (error) {
        res.status(400).json({
            message: "Failed to update property",
            error: error.message
        });
    }
};
const deleteProperty = async (req, res) => {
    try {
        const property = req.property;

        // Delete all property images from uploads folder
        const images = property.images || [];

        images.forEach((imagePath) => {
            const relativeImagePath = imagePath.replace(/^\/+/, "");

            const filePath = path.join(
                __dirname,
                "..",
                relativeImagePath
            );

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        await User.updateMany(
    { favorites: req.params.id },
    { $pull: { favorites: req.params.id } }
);

        // Delete property from database
        await Property.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Property deleted successfully"
        });

    } catch (error) {
        res.status(400).json({
            message: "Failed to delete property",
            error: error.message
        });
    }
};
const updatePropertyStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({
                message: "Status must be approved or rejected"
            });
        }

        const property = await Property.findByIdAndUpdate(
            req.params.id,
            { status },
            {
                new: true,
                runValidators: true
            }
        );

        if (!property) {
            return res.status(404).json({
                message: "Property not found"
            });
        }

        res.status(200).json({
            message: "Property status updated successfully",
            property
        });

    } catch (error) {
        res.status(400).json({
            message: "Failed to update property status",
            error: error.message
        });
    }
};
const getPropertiesByStatus = async (req, res) => {
    try {
        const { status } = req.params;

        const properties = await Property.find({ status });

        res.status(200).json({
            message: "Properties fetched successfully",
            count: properties.length,
            properties
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch properties",
            error: error.message
        });
    }
};

const getPendingProperties = async (req, res) => {
    try {
        const properties = await Property.find({
            status: "pending"
        });

        res.status(200).json({
            message: "Pending properties fetched successfully",
            count: properties.length,
            properties
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch pending properties",
            error: error.message
        });
    }
};
const getApprovedProperties = async (req, res) => {
    try {
        const properties = await Property.find({
            status: "approved"
        });

        res.status(200).json({
            message: "Approved properties fetched successfully",
            count: properties.length,
            properties
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch approved properties",
            error: error.message
        });
    }
};

const searchProperties = async (req, res) => {
    try {
        const {
            search,
            city,
            area,
            listingType,
            minPrice,
            maxPrice,
            bhk,
            propertyType,
            furnishing,
            minSquareFeet,
            maxSquareFeet
        } = req.query;


        // =========================
        // Validate price values
        // =========================

        if (minPrice && isNaN(Number(minPrice))) {
            return res.status(400).json({
                message: "minPrice must be a number"
            });
        }

        if (maxPrice && isNaN(Number(maxPrice))) {
            return res.status(400).json({
                message: "maxPrice must be a number"
            });
        }


        // =========================
        // Validate price range
        // =========================

        if (minPrice && maxPrice) {
            if (Number(minPrice) > Number(maxPrice)) {
                return res.status(400).json({
                    message: "minPrice cannot be greater than maxPrice"
                });
            }
        }


        // =========================
        // Validate BHK
        // =========================

        if (bhk !== undefined) {
            if (isNaN(Number(bhk))) {
                return res.status(400).json({
                    message: "bhk must be a number"
                });
            }

            if (Number(bhk) < 0) {
                return res.status(400).json({
                    message: "bhk cannot be negative"
                });
            }

            if (!Number.isInteger(Number(bhk))) {
                return res.status(400).json({
                    message: "bhk must be a whole number"
                });
            }
        }


        // =========================
        // Validate square feet
        // =========================

        if (minSquareFeet && isNaN(Number(minSquareFeet))) {
            return res.status(400).json({
                message: "minSquareFeet must be a number"
            });
        }

        if (maxSquareFeet && isNaN(Number(maxSquareFeet))) {
            return res.status(400).json({
                message: "maxSquareFeet must be a number"
            });
        }

        if (minSquareFeet && Number(minSquareFeet) < 0) {
            return res.status(400).json({
                message: "minSquareFeet cannot be negative"
            });
        }

        if (maxSquareFeet && Number(maxSquareFeet) < 0) {
            return res.status(400).json({
                message: "maxSquareFeet cannot be negative"
            });
        }

        if (minSquareFeet && maxSquareFeet) {
            if (Number(minSquareFeet) > Number(maxSquareFeet)) {
                return res.status(400).json({
                    message: "minSquareFeet cannot be greater than maxSquareFeet"
                });
            }
        }


        // =========================
        // Validate property type
        // =========================

        if (propertyType) {
            const allowedPropertyTypes = [
                "flat",
                "house",
                "villa",
                "plot",
                "commercial"
            ];

            if (!allowedPropertyTypes.includes(propertyType)) {
                return res.status(400).json({
                    message: "Invalid propertyType"
                });
            }
        }


        // =========================
        // Validate listing type
        // =========================

        if (listingType) {
            const allowedListingTypes = [
                "sale",
                "rent"
            ];

            if (!allowedListingTypes.includes(listingType)) {
                return res.status(400).json({
                    message: "Invalid listingType"
                });
            }
        }


        // =========================
        // Validate furnishing
        // =========================

        if (furnishing) {
            const allowedFurnishing = [
                "furnished",
                "semi-furnished",
                "unfurnished"
            ];

            if (!allowedFurnishing.includes(furnishing)) {
                return res.status(400).json({
                    message: "Invalid furnishing"
                });
            }
        }


        // =========================
        // Pagination
        // =========================

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        if (page < 1) {
            return res.status(400).json({
                message: "page must be greater than or equal to 1"
            });
        }

        if (limit < 1 || limit > 100) {
            return res.status(400).json({
                message: "limit must be between 1 and 100"
            });
        }

        const skip = (page - 1) * limit;


        // =========================
        // Search filter
        // =========================

        const filter = {
            status: "approved"
        };


        // =========================
        // Keyword search
        // =========================

        if (search) {
            filter.$or = [
                {
                    title: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    description: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];
        }


        // =========================
        // City filter
        // =========================

        if (city) {
            filter.city = {
                $regex: city,
                $options: "i"
            };
        }


        // =========================
        // Area filter
        // =========================

        if (area) {
            filter.area = {
                $regex: area,
                $options: "i"
            };
        }


        // =========================
        // Listing type filter
        // =========================

        if (listingType) {
            filter.listingType = listingType;
        }


        // =========================
        // Price filter
        // =========================

        if (minPrice || maxPrice) {
            filter.price = {};

            if (minPrice) {
                filter.price.$gte = Number(minPrice);
            }

            if (maxPrice) {
                filter.price.$lte = Number(maxPrice);
            }
        }


        // =========================
        // BHK filter
        // =========================

        if (bhk !== undefined) {
            filter.bhk = Number(bhk);
        }


        // =========================
        // Property type filter
        // =========================

        if (propertyType) {
            filter.propertyType = propertyType;
        }


        // =========================
        // Furnishing filter
        // =========================

        if (furnishing) {
            filter.furnishing = furnishing;
        }


        // =========================
        // Square feet filter
        // =========================

        if (minSquareFeet || maxSquareFeet) {
            filter.squareFeet = {};

            if (minSquareFeet) {
                filter.squareFeet.$gte = Number(minSquareFeet);
            }

            if (maxSquareFeet) {
                filter.squareFeet.$lte = Number(maxSquareFeet);
            }
        }


        // =========================
        // Sorting
        // =========================

        let sortOption = {
            createdAt: -1
        };

        if (req.query.sort === "price_asc") {
            sortOption = {
                price: 1
            };
        }

        if (req.query.sort === "price_desc") {
            sortOption = {
                price: -1
            };
        }

        if (req.query.sort === "newest") {
            sortOption = {
                createdAt: -1
            };
        }

        if (req.query.sort === "oldest") {
            sortOption = {
                createdAt: 1
            };
        }

        if (req.query.sort === "views") {
            sortOption = {
                views: -1
            };
        }


        // =========================
        // Get total count
        // =========================

        const totalProperties = await Property.countDocuments(filter);


        // =========================
        // Get properties
        // =========================

        const properties = await Property.find(filter)
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .populate("ownerId", "name email phone");


        // =========================
        // Response
        // =========================

        res.status(200).json({
            currentPage: page,
            totalPages: Math.ceil(totalProperties / limit),
            totalProperties,
            properties
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to search properties",
            error: error.message
        });
    }
};

const getMyProperties = async (req, res) => {
    try {
        const properties = await Property.find({
            ownerId: req.user.userId
        })
            .sort({ createdAt: -1 })
            .populate("ownerId", "name email phone");

        res.status(200).json({
            totalProperties: properties.length,
            properties
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to get your properties",
            error: error.message
        });
    }
};

const deletePropertyImage = async (req, res) => {
    try {
        const index = Number(req.params.index);

        const property = req.property;

        const images = property.images || [];

        // Check index
        if (
            !Number.isInteger(index) ||
            index < 0 ||
            index >= images.length
        ) {
            return res.status(400).json({
                message: "Invalid image index"
            });
        }

        // Get image path
        const imagePath = images[index];

        // Delete physical image
        const relativeImagePath = imagePath.replace(/^\/+/, "");

        const filePath = path.join(
            __dirname,
            "..",
            relativeImagePath
        );

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Remove image from array
        images.splice(index, 1);

        property.images = images;

        // Updating property requires admin approval again
        property.status = "pending";

        await property.save();

        res.status(200).json({
            message: "Property image deleted successfully",
            property
        });

    } catch (error) {
        res.status(400).json({
            message: "Failed to delete property image",
            error: error.message
        });
    }
};
const getAdminAllProperties = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        // Filter
const filter = {};

if (req.query.status) {
    const allowedStatuses = ["pending", "approved", "rejected"];

    if (!allowedStatuses.includes(req.query.status)) {
        return res.status(400).json({
            message: "Invalid status. Use pending, approved or rejected"
        });
    }

    filter.status = req.query.status;
}
        // Sorting
        let sortOption = { createdAt: -1 };

if (req.query.sort) {
    const allowedSorts = [
        "price_asc",
        "price_desc",
        "newest",
        "oldest",
        "views"
    ];

    if (!allowedSorts.includes(req.query.sort)) {
        return res.status(400).json({
            message: "Invalid sort option"
        });
    }

    if (req.query.sort === "price_asc") {
        sortOption = { price: 1 };
    }

    if (req.query.sort === "price_desc") {
        sortOption = { price: -1 };
    }

    if (req.query.sort === "newest") {
        sortOption = { createdAt: -1 };
    }

    if (req.query.sort === "oldest") {
        sortOption = { createdAt: 1 };
    }

    if (req.query.sort === "views") {
        sortOption = { views: -1 };
    }
}

        const totalProperties = await Property.countDocuments(filter);

        const properties = await Property.find(filter)
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .populate("ownerId", "name email phone");

        res.status(200).json({
            currentPage: page,
            totalPages: Math.ceil(totalProperties / limit),
            totalProperties,
            properties
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to get all properties",
            error: error.message
        });
    }
};
const getUserProperties = async (req, res) => {
    try {
        const properties = await Property.find({
            ownerId: req.params.id
        })
            .sort({ createdAt: -1 })
            .populate("ownerId", "name email phone");

        res.status(200).json({
            totalProperties: properties.length,
            properties
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to get user properties",
            error: error.message
        });
    }
};
const getPropertyStats = async (req, res) => {
    try {
        const total = await Property.countDocuments();

        const pending = await Property.countDocuments({
            status: "pending"
        });

        const approved = await Property.countDocuments({
            status: "approved"
        });

        const rejected = await Property.countDocuments({
            status: "rejected"
        });

        res.status(200).json({
            total,
            pending,
            approved,
            rejected
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to get property statistics",
            error: error.message
        });
    }
};
module.exports = {
    createProperty,
    getAllProperties,
    getPropertyById,
    updateProperty,
    deleteProperty,
    deletePropertyImage,
    updatePropertyStatus,
    getPropertiesByStatus,
    getPendingProperties,
    getApprovedProperties,
    searchProperties,
    getMyProperties,
    getAdminAllProperties,
    getUserProperties,
    getPropertyStats
};