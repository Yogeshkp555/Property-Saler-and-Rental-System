const mongoose = require("mongoose");
const User = require("../models/User");
const Property = require("../models/Property");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || name.trim() === "") {
            return res.status(400).json({
                message: "Name is required"
            });
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                message: "Please enter a valid email"
            });
        }

        if (!phone || !/^[0-9]{10}$/.test(phone)) {
            return res.status(400).json({
                message: "Phone number must contain exactly 10 digits"
            });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Email is already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase(),
            password: hashedPassword,
            phone: phone
        });

        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({
            message: "User registered successfully",
            user: userResponse
        });

    } catch (error) {
        res.status(400).json({
            message: "Failed to register user",
            error: error.message
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }
        if (user.isBlocked) {
    return res.status(403).json({
        message: "Your account is blocked by admin"
    });
}

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.status(200).json({
            message: "Login successful",
            token
        });

    } catch (error) {
        res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
};

const addFavorite = async (req, res) => {
    try {
        const userId = req.user.userId;
        const propertyId = req.params.propertyId;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const propertyExists = await require("../models/Property").findById(
            propertyId
        );

        if (!propertyExists) {
            return res.status(404).json({
                message: "Property not found"
            });
        }

        // Prevent duplicate favorites
        const alreadyFavorite = user.favorites.some(
            (favoriteId) => favoriteId.toString() === propertyId
        );

        if (alreadyFavorite) {
            return res.status(400).json({
                message: "Property already added to favorites"
            });
        }

        user.favorites.push(propertyId);

        await user.save();

        res.status(200).json({
            message: "Property added to favorites",
            favorites: user.favorites
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to add favorite",
            error: error.message
        });
    }
};

const getFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .populate("favorites");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "Favorites fetched successfully",
            count: user.favorites.length,
            favorites: user.favorites
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch favorites",
            error: error.message
        });
    }
};
const removeFavorite = async (req, res) => {
    try {
        const userId = req.user.userId;
        const propertyId = req.params.propertyId;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const favoriteExists = user.favorites.some(
            (id) => id.toString() === propertyId
        );

        if (!favoriteExists) {
            return res.status(404).json({
                message: "Property is not in favorites"
            });
        }

        user.favorites = user.favorites.filter(
            (id) => id.toString() !== propertyId
        );

        await user.save();

        res.status(200).json({
            message: "Property removed from favorites",
            favorites: user.favorites
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to remove favorite",
            error: error.message
        });
    }
};
const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            user
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to get profile",
            error: error.message
        });
    }
};
const updateMyProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;

        const updateData = {};

        if (name !== undefined) {
            updateData.name = name;
        }

        if (phone !== undefined) {
            updateData.phone = phone;
        }

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            user
        });

    } catch (error) {
        res.status(400).json({
            message: "Failed to update profile",
            error: error.message
        });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select("name email phone");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            user
        });

    } catch (error) {
        res.status(400).json({
            message: "Failed to get user profile",
            error: error.message
        });
    }
};
const getAdminUserProfile = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        const user = await User.findById(req.params.id)
            .select("name email phone role isBlocked");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            user
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to get user profile",
            error: error.message
        });
    }
};
const getAdminDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();

        const totalProperties = await Property.countDocuments();

        const pendingProperties = await Property.countDocuments({
            status: "pending"
        });

        const approvedProperties = await Property.countDocuments({
            status: "approved"
        });

        const rejectedProperties = await Property.countDocuments({
            status: "rejected"
        });

        res.status(200).json({
            totalUsers,
            totalProperties,
            pendingProperties,
            approvedProperties,
            rejectedProperties
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to get dashboard statistics",
            error: error.message
        });
    }
};
const updateUserBlockStatus = async (req, res) => {
    try {
const { isBlocked } = req.body;

if (typeof isBlocked !== "boolean") {
    return res.status(400).json({
        message: "isBlocked must be true or false"
    });
}
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isBlocked },
            {
                returnDocument: "after",
                runValidators: true
            }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: isBlocked
                ? "User blocked successfully"
                : "User unblocked successfully",
            user
        });

    } catch (error) {
        res.status(400).json({
            message: "Failed to update user block status",
            error: error.message
        });
    }
};
const getAllUsers = async (req, res) => {
    try {
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
        const filter = {};

        // Search by name or email
        if (req.query.search) {
            filter.$or = [
                {
                    name: {
                        $regex: req.query.search,
                        $options: "i"
                    }
                },
                {
                    email: {
                        $regex: req.query.search,
                        $options: "i"
                    }
                }
            ];
        }

        if (req.query.status === "blocked") {
    filter.isBlocked = true;
}

if (req.query.status === "active") {
    filter.isBlocked = false;
}
let sortOption = { createdAt: -1 };

if (req.query.sort === "newest") {
    sortOption = { createdAt: -1 };
}

if (req.query.sort === "oldest") {
    sortOption = { createdAt: 1 };
}

if (req.query.sort === "name_asc") {
    sortOption = { name: 1 };
}

if (req.query.sort === "name_desc") {
    sortOption = { name: -1 };
}

        const totalUsers = await User.countDocuments(filter);

        const users = await User.find(filter)
            .select("-password")
            .sort(sortOption)
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit),
            totalUsers,
            users
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to get users",
            error: error.message
        });
    }
};

const deleteUser = async (req, res) => {
    try {


        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Admin account delete prevent karo
        if (user.role === "admin") {
            return res.status(403).json({
                message: "Admin user cannot be deleted"
            });
        }

        // User ni properties find karo
        const properties = await Property.find({
            ownerId: user._id
        });

        // Properties ni physical images delete karo
        properties.forEach((property) => {
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
        });

        // User ni badhi properties delete karo
        await Property.deleteMany({
            ownerId: user._id
        });

        // User delete karo
        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "User, properties and property images deleted successfully"
        });

    } catch (error) {
        res.status(400).json({
            message: "Failed to delete user",
            error: error.message
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    addFavorite,
    getFavorites,
    removeFavorite,
     getMyProfile,
    updateMyProfile,
    getUserProfile,
     getAdminUserProfile,
     getAdminDashboardStats,
     updateUserBlockStatus,
     getAllUsers,
     deleteUser
     
};