import API_BASE_URL from "./api";

const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem("token");

    const headers = {
        ...options.headers
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options,
            headers
        }
    );

    const data = await response.json();

    return {
        response,
        data
    };
};

export default apiRequest;