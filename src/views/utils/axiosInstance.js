//axiosInstance.js
import axios from "axios";

// --- Configuration ---
const API_BASE_URL = "https://righttouch-backend-fn9z.onrender.com";
const BASE_URL = "https://righttouch-backend-fn9z.onrender.com/api";
const TIMEOUT_MS = 10000;

// =========================================================
// 1. GENERAL USER AXIOS INSTANCE
// =========================================================
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT_MS,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// =========================================================
// 2️⃣ ADMIN / SUPER ADMIN AXIOS INSTANCE
// =========================================================
const adminAxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT_MS,
  headers: { "Content-Type": "application/json" },
});

adminAxiosInstance.interceptors.request.use(
  (config) => {
    const adminToken =
      localStorage.getItem("adminToken") ||
      sessionStorage.getItem("adminToken");
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// =========================================================
// 3️⃣ COMMON RESPONSE INTERCEPTOR (401 Unauthorized handler)
// =========================================================
const unauthorizedResponseHandler = (error) => {
  if (error.response && error.response.status === 401) {
    console.warn("⚠️ Unauthorized (401). Clearing auth data...");

    // Clear both localStorage & sessionStorage tokens
    localStorage.clear();
    sessionStorage.clear();

    // Optional redirect
    // window.location.href = "/#/auth/signin";
  }
  return Promise.reject(error);
};

axiosInstance.interceptors.response.use(
  (res) => res,
  unauthorizedResponseHandler
);

adminAxiosInstance.interceptors.response.use(
  (response) => response,
  unauthorizedResponseHandler
);

// =========================================================
// 4. EXPORTS
// =========================================================
export default axiosInstance;
export { adminAxiosInstance };

// =========================================================
// 5. Helper function to get token (checks both storages)
// =========================================================
const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

// =========================================================
// 6. API CALL FUNCTIONS
// =========================================================

// ----- Admin APIs -----
export const getAllTechnicians = async () => {
  try {
    const token = getToken();

    const response = await fetch(`${BASE_URL}/technician/technicianAll`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    console.log("Fetch technicians response status:", response.status);

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetch technicians response data:", data);

    return data;
  } catch (error) {
    console.error("Error fetching technicians:", error);
    throw error;
  }
};


export const getAllBookings = async () => {
  try {
    const token = getToken();

    const response = await fetch(`${BASE_URL}/user/service/booking`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    console.log("Fetch bookings response status:", response.status);

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetch bookings response data:", data);

    return data;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    throw error;
  }
};


export const getAllProductBookings = async () => {
  try {
    const token = getToken();

    const response = await fetch(`${BASE_URL}/user/getAllProductBooking`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    console.log("Fetch product bookings response status:", response.status);

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetch product bookings response data:", data);

    return data;
  } catch (error) {
    console.error("Error fetching product bookings:", error);
    throw error;
  }
};

export const inActiveAdmin = async (adminId) => {
  try {
    const token = getToken();

    const response = await fetch(`${BASE_URL}/admins/delete/${adminId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        token,
      },
    });

    if (!response.ok) throw new Error(`Error: ${response.status}`);

    return await response.json();

  } catch (error) {
    console.error("Error deleting admin:", error);
    throw error;
  }
};

export const getAllProduct = async () => {
  try {
    const token = getToken();

    const response = await fetch(`${BASE_URL}/user/getProduct`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    console.log("Fetch products response status:", response.status);

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetch products response data:", data);

    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};


// =========================================================
// 7. API CALL FUNCTIONS
// =========================================================
// -----Service Category APIs -----
export const getAllCategories = async () => {
  try {
    const token = getToken();

    const response = await fetch(`${BASE_URL}/user/getAllcategory`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    console.log("Fetch categories response status:", response.status);

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetch categories response data:", data);

    return data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};


export const createCategories = async (categoryData) => {
  try {
    const token = getToken();
    const response = await fetch(`${BASE_URL}/user/category`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(categoryData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

export const uploadCategoryImage = async (categoryId, file) => {
  try {
    const token = getToken();

    const formData = new FormData();
    formData.append("categoryId", categoryId);
    formData.append("image", file);

    const response = await fetch(
      `${BASE_URL}/user/category/upload-image`,
      {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error uploading category image:", error);
    throw error;
  }
};

export const updateService = async (serviceId, updateData) => {
  try {
    const token = getToken();
    console.log("Updating service with ID:", serviceId);
    console.log("Update data:", updateData);
    console.log("Token exists:", !!token);
    console.log("Base URL:", BASE_URL);

    if (!token) {
      throw new Error("Authentication token is missing. Please log in again.");
    }

    const response = await fetch(
      `${BASE_URL}/user/updateService/${serviceId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) {
      let errorMessage = `Update failed: ${response.status}`;
      try {
        const errorData = await response.json();

        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (parseError) {
        console.log("Could not parse error response:", parseError);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("Update successful:", result);
    return result;
  } catch (error) {
    throw error;
  }
};



export const updateCategories = async (categoryId, updatedData) => {
  try {
    const token = getToken();
    const response = await fetch(`${BASE_URL}/user/updatecategory/${categoryId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};


export const deleteCategory = async (categoryId) => {
  try {
    const token = getToken();
    const response = await fetch(`${BASE_URL}/user/deletecategory/${categoryId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    });

    if (!response.ok) throw new Error(`Error: ${response.status}`);

    return await response.json();
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};
// =========================================================
// 8. API CALL FUNCTIONS
// =========================================================
//------Create Services APIs -------
export const createService = async (serviceData) => {
  try {
    const token = getToken();

    console.log("Creating new service with data:", serviceData);
    console.log("Token exists:", !!token);

    const response = await fetch(`${BASE_URL}/user/service`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(serviceData),
    });

    console.log("Create service response status:", response.status);
    console.log("Create service response OK:", response.ok);

    if (!response.ok) {
      let errorMessage = `Error: ${response.status}`;
      try {
        const errorData = await response.json();
        console.log("Create service error response:", errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (parseError) {
        console.log("Could not parse create service error response:", parseError);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("Create service successful:", result);
    return result;
  } catch (error) {
    console.error("Error creating service:", error);
    console.error("Error stack:", error.stack);
    throw error;
  }
};

export const uploadServiceImages = async (serviceId, files = []) => {
  try {
    const token = getToken();



    if (files && files.constructor && files.constructor.name === 'FileList') {
      const filesArray = Array.from(files);
      filesArray.forEach((file, i) => {
        console.log(`File ${i}:`, file.name, file.type, file.size);
      });
    }

    else if (files instanceof File) {
      console.log("Single File object detected:", files.name);
    }

    else if (Array.isArray(files)) {
      console.log("Array of files, length:", files.length);
      files.forEach((file, i) => {
        if (file) {
          console.log(`File ${i}:`, file.name, file.type, file.size);
        } else {
          console.log(`File ${i}: null or undefined`);
        }
      });
    }


  


    const formData = new FormData();
    formData.append("serviceId", serviceId);

    let hasFiles = false;


    if (files && files.constructor && files.constructor.name === 'FileList') {
      const filesArray = Array.from(files);
      filesArray.forEach((file) => {
        if (file) {
          formData.append("serviceImages", file);
          hasFiles = true;
        }
      });
    }

    else if (Array.isArray(files)) {
      files.forEach((file) => {
        if (file && file instanceof File) {
          formData.append("serviceImages", file);
          hasFiles = true;
        }
      });
    }

    else if (files instanceof File) {
      formData.append("serviceImages", files);
      hasFiles = true;
    }

    else if (files && files.files) {

      const filesArray = Array.isArray(files.files) ? files.files : [files.files];
      filesArray.forEach((file) => {
        if (file && file instanceof File) {
          formData.append("serviceImages", file);
          hasFiles = true;
        }
      });
    }

   
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value instanceof File ?
        `File: ${value.name} (${value.type}, ${value.size} bytes)` :
        value);
    }
    console.log("Has files:", hasFiles);

    if (!hasFiles) {
      console.warn("No valid files found to upload");
      throw new Error("Please select at least one image to upload");
    }

    const response = await fetch(
      `${BASE_URL}/user/services/upload-images`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,

        },
        body: formData,
      }
    );

    console.log("Upload response status:", response.status);

    if (!response.ok) {
      let errorMessage = `Upload failed: ${response.status}`;
      try {
        const errorData = await response.json();
        console.log("Upload error response:", errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (parseError) {
        console.log("Could not parse upload error response:", parseError);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("Upload successful:", result);
    return result;
  } catch (error) {
    console.error("Error uploading service images:", error);
    throw error;
  }
};
export const getAllServices = async () => {
  try {
    const token = localStorage.getItem('token');
    const BASE_URL = "https://righttouch-backend-fn9z.onrender.com/api";
    const response = await fetch(`${BASE_URL}/user/getAllServices`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        token
      },
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
};
export const deleteService = async (serviceId) => {
  try {
    const token = getToken();

    if (!token) {
      throw new Error("Authentication token is missing. Please log in again.");
    }

    const response = await fetch(
      `${BASE_URL}/user/services/${serviceId}`,
      {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Delete failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting service:", error);
    throw error;
  }
};


// ----- Product APIs -----
export const getAllProducts = async () => {
  try {
    const token = getToken();
    const response = await fetch(`${BASE_URL}/products/all`, {
      method: "GET",
      headers: { "Content-Type": "application/json", token },
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const createProducts = async (productData) => {
  try {
    const token = getToken();
    const response = await fetch(`${BASE_URL}/products/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "token": token
      },
      body: JSON.stringify(productData),
    });

    console.log("Response status:", response.status);

    if (!response.ok) {

      let errorMessage = `Error: ${response.status}`;

      try {
        const errorData = await response.json();

        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {

        const text = await response.text();

        errorMessage = text || errorMessage;
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    throw error;
  }
};

export const uploadImage = async (file) => {
  try {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${BASE_URL}/products/upload`, {
      method: "POST",
      headers: { token },
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Error uploading image, backend response:", text);
      throw new Error("Image upload failed");
    }

    const data = await res.json();
    return data.url;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

export const updateProducts = async (productId, updatedData) => {
  try {
    const token = getToken();
    const response = await fetch(`${BASE_URL}/products/update/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", token },
      body: JSON.stringify(updatedData),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const deleteProducts = async (productId) => {
  try {
    const token = getToken();
    const response = await fetch(`${BASE_URL}/products/delete/${productId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", token },
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

// ----- User APIs -----
export const getAllUsers = async () => {
  try {
    const token = getToken();
    const response = await fetch(`${BASE_URL}/users/all`, {
      method: "GET",
      headers: { "Content-Type": "application/json", token },
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const token = getToken();
    const response = await fetch(`${BASE_URL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", token },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const updateUser = async (userId, updatedData) => {
  try {
    const token = getToken();
    const response = await fetch(`${BASE_URL}/users/update/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", token },
      body: JSON.stringify(updatedData),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const token = getToken();
    const response = await fetch(`${BASE_URL}/users/delete/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        token,
      },
    });

    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};


export const getAllOrders = async () => {
  try {
    const token = getToken();
    const response = await fetch(`${BASE_URL}/orders/all`, {
      method: "GET",
      headers: { "Content-Type": "application/json", token },
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching Orders:", error);
    throw error;
  }
};

export const createOrders = async (categoryData) => {
  try {
    const token = getToken();
    const response = await fetch(`${BASE_URL}/Orders/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", token },
      body: JSON.stringify(categoryData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

export const updateOrders = async (orderId, updatedData) => {
  try {
    const token = getToken();

    const response = await fetch(`${BASE_URL}/orders/update/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        token,
      },
      body: JSON.stringify(updatedData), // use passed data dynamically
    });

    if (!response.ok) {
      throw new Error(`Error updating order: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
};


// Upload Product image

// Add this function to your existing axiosInstance.js file, after the existing uploadImage function

// Upload Product Image with productId
export const uploadProductImage = async (productId, file) => {
  try {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("productId", productId);

    const res = await fetch(`${BASE_URL}/products/upload`, {
      method: "POST",
      headers: {
        token: `${token}`,
        // Don't set Content-Type for FormData, let browser set it
      },
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Upload failed response:", errorText);
      throw new Error(`Image upload failed: ${res.status} ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

// Delete Product Image
export const deleteProductImage = async (productId, public_id) => {
  try {
    const token = getToken();
    const response = await fetch(`${BASE_URL}/products/delete-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: `${token}`,
      },
      body: JSON.stringify({ productId, public_id }),
    });

    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};
