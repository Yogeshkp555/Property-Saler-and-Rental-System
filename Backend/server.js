const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const propertyRoutes = require("./routes/propertyRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");

dotenv.config();

const app = express();

app.use(express.json());
app.use("/uploads", express.static("uploads"));

connectDB();

app.get("/", (req, res) => {
    res.json({
        message: "Property Rental System Backend is running"
    });
});

app.use("/api/properties", propertyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});