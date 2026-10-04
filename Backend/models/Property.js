const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        propertyType: {
            type: String,
            required: true,
            enum: ["flat", "house", "villa", "plot", "commercial"]
        },

        listingType: {
            type: String,
            required: true,
            enum: ["sale", "rent"]
        },

        city: {
            type: String,
            required: true,
            trim: true
        },

        area: {
            type: String,
            required: true,
            trim: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

bhk: {
    type: Number,
    min: 0,
    validate: {
        validator: Number.isInteger,
        message: "BHK must be a whole number"
    }
},

squareFeet: {
    type: Number,
    min: 0
},

        furnishing: {
            type: String,
            enum: ["furnished", "semi-furnished", "unfurnished"]
        },

        images: {
    type: [String],
    validate: {
        validator: function (value) {
            return value.length > 0;
        },
        message: "At least one property image is required"
    }
},

        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        },

        views: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

const Property = mongoose.model("Property", propertySchema);

module.exports = Property;