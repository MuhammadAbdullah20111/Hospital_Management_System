import axios from "axios";
import { getFromLocalStorage, removeFromLocalStorage, setToLocalStorage } from "../helpers/localStorageFile";

class ApiService {
    static BASE_URL = import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';
    token = null;

    constructor() {
        this.token = getFromLocalStorage("token");
        this.axiosInstance = axios.create({
            baseURL: ApiService.BASE_URL,
        });

        this.setAuthHeader();

        this.axiosInstance.interceptors.request.use(
            (config) => {
                const token = getFromLocalStorage("token");
                if (token) {
                    config.headers["Authorization"] = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );
    }

    setAuthHeader(config = null) {
        const token = getFromLocalStorage("token");
        if (token) {
            if (config) {
                config.headers["Authorization"] = `Bearer ${token}`;
            } else {
                this.axiosInstance.defaults.headers["Authorization"] = `Bearer ${token}`;
            }
        } else {
            if (config) {
                delete config.headers["Authorization"];
            }
        }
    }

    getToken() {
        this.token = getFromLocalStorage("token");
        this.setAuthHeader();
        return this.token;
    }

    saveToken(token) {
        setToLocalStorage("token", token);
        this.token = token;
        this.setAuthHeader();
    }

    removeToken() {
        removeFromLocalStorage("token");
        this.token = null;
        this.setAuthHeader();
    }

    handleApiError(error) {
        console.log("API Error:", error);

        if (error.response) {
            const errorStatus = error.response.status;
            const currentPath = window.location.pathname;

            // Extract the backend error message if available
            if (error.response.data && error.response.data.message) {
                error.message = error.response.data.message;
            }

            if (errorStatus === 401) {
                // Prevent infinite redirect loops if the 401 comes from a login attempt
                const isLoginPage = currentPath.includes("/login");

                if (!isLoginPage) {
                    this.removeToken();
                    
                    // Redirect to the appropriate login page based on the current section
                    if (currentPath.startsWith("/admin")) {
                        window.location.href = "/auth/admin/login";
                    } else {
                        // Default to staff login or the redirecting /login path
                        window.location.href = "/auth/staff/login";
                    }
                }
            }
        }
        return Promise.reject(error);
    }

    async get(endpoint) {
        try {
            const response = await this.axiosInstance.get(endpoint);
            return response.data;
        } catch (error) {
            return this.handleApiError(error);
        }
    }

    async getWithParams(endpoint, params) {
        try {
            const parameter = params || {};
            const response = await this.axiosInstance.get(
                endpoint, { params: parameter }
            );
            return response.data;
        } catch (error) {
            return this.handleApiError(error);
        }
    }

    async post(endpoint, data) {
        try {
            const response = await this.axiosInstance.post(endpoint, data);
            return response.data;
        } catch (error) {
            return this.handleApiError(error);
        }
    }

    async postForm(endpoint, formData) {
        try {
            const response = await this.axiosInstance.post(endpoint, formData, {
                headers: {
                    ...this.axiosInstance.defaults.headers.common,
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error) {
            return this.handleApiError(error);
        }
    }

    async put(endpoint, data) {
        try {
            const response = await this.axiosInstance.put(endpoint, data);
            return response.data;
        } catch (error) {
            return this.handleApiError(error);
        }
    }

    async putForm(endpoint, formData) {
        try {
            const response = await this.axiosInstance.put(endpoint, formData, {
                headers: {
                    ...this.axiosInstance.defaults.headers.common,
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error) {
            return this.handleApiError(error);
        }
    }

    async delete(endpoint, data = null) {
        try {
            const config = data ? { data } : undefined;
            const response = await this.axiosInstance.delete(endpoint, config);
            return response.data;
        } catch (error) {
            return this.handleApiError(error);
        }
    }

    async patch(endpoint, data) {
        try {
            const response = await this.axiosInstance.patch(endpoint, data);
            return response.data;
        } catch (error) {
            return this.handleApiError(error);
        }
    }
}

export default new ApiService();
