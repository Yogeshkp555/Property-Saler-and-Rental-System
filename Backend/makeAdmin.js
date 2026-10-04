const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const makeAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const user = await User.findOneAndUpdate(
            { email: "admin@example.com" },
            { role: "admin" },
            { new: true }
        );

        if (!user) {
            console.log("Admin user not found");
            process.exit(0);
        }

        console.log("User is now admin:", user.email);
        console.log("Role:", user.role);

        process.exit(0);
    } catch (error) {
        console.error("Failed:", error.message);
        process.exit(1);
    }
};

makeAdmin();