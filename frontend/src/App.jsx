import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";

import Profile from "./pages/user/Profile";

import Home from "./pages/properties/Home";
import PropertyDetails from "./pages/properties/PropertyDetails";

import Favorites from "./pages/user/Favorites";
import AddProperty from "./pages/properties/AddProperty";
import MyProperties from "./pages/properties/MyProperties";
import EditProperty from "./pages/properties/EditProperty";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProperties from "./pages/admin/AdminProperties";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUserDetails from "./pages/admin/AdminUserDetails";

function App() {
    return (
        <BrowserRouter>

            <Navbar />

            <Routes>

                {/* Home */}

                <Route
                    path="/"
                    element={<Home />}
                />


                {/* Authentication */}

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />


                {/* User */}

                <Route
                    path="/profile"
                    element={<Profile />}
                />


                {/* Property Details */}

                <Route
                    path="/properties/:id"
                    element={<PropertyDetails />}
                />

                <Route
                 path="/favorites"
                 element={<Favorites />}
                />


                <Route
                 path="/add-property"
                 element={<AddProperty />}
                />

                  <Route
                    path="/my-properties"
                    element={<MyProperties />}
                  />
                
                  <Route
                     path="/edit-property/:id"
                     element={<EditProperty />}
                  />
                  
<Route
    path="/admin"
    element={<AdminDashboard />}
/>
<Route
    path="/admin/properties"
    element={<AdminProperties />}
/>
<Route
    path="/admin/users"
    element={<AdminUsers />}
/>

<Route
    path="/admin/users/:id"
    element={<AdminUserDetails />}
/>
            </Routes>

        </BrowserRouter>
    );
}

export default App;