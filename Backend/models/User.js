const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
},

password: {
    type: String,
    required: true,
    minlength: 6
},

phone: {
    type: String,
    required: true,
    trim: true,
    match: /^[0-9]{10}$/
},
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },
        
        isBlocked: {
    type: Boolean,
    default: false
},
        favorites: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Property"
            }
        ]
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;