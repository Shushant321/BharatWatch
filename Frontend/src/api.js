const BASE_URL = "http://localhost:4000";

const ACCESS_TOKEN_KEY = "accessToken";
const USER_KEY = "bw_user";

const request = async (path, options = {}) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
};

// ---------- helpers ----------
const saveAccessToken = (token) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

const getAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

const saveUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const getSavedUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

// ---------- API object ----------
export const api = {
  // NORMAL LOGIN
  login: async (email, password) => {
    const data = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (data.accessToken) {
      saveAccessToken(data.accessToken);
      saveUser(data.user);
      return { success: true, user: data.user };
    }
    return { success: false, message: data.message || "Login failed" };
  },

  // SIGNUP
  register: async ({ fullName, email, password, confirmpassword }) => {
    const data = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        fullName,
        email,
        password,
        confirmPassword: confirmpassword,
      }),
    });

    if (data.accessToken) {
      saveAccessToken(data.accessToken);
      saveUser(data.user);
      return { success: true, user: data.user };
    }
    return { success: false, message: data.message || "Signup failed" };
  },

  // GOOGLE LOGIN
  googleLogin: async ({ email, fullName, avatar, googleId }) => {
    const data = await request("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ email, fullName, avatar, googleId }),
    });

    if (data.accessToken) {
      saveAccessToken(data.accessToken);
      saveUser(data.user);
      return { success: true, user: data.user };
    }
    return { success: false, message: data.message || "Google login failed" };
  },

  // PROFILE (protected)
  getProfile: async () => {
    const token = getAccessToken();
    const data = await request("/api/v1/users/profile", {
      method: "GET",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    return data;
  },

  // LOGOUT
  logout: async () => {
    const token = getAccessToken();
    await request("/api/auth/logout", {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // NAVBAR HELPERS
  isAuthenticated: () => {
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getUser: () => {
    return getSavedUser();
  },

  getAllVideos: async (limit = 100) => {
    const data = await request(`/api/v1/videos?limit=${limit}`, { method: "GET" });
    return data;
  },

  // ZOHO LOGIN
  zohoLogin: async (code) => {
    const data = await request("/api/auth/zoho/callback", {
      method: "POST",
      body: JSON.stringify({ code }),
    });

    if (data.accessToken) {
      saveAccessToken(data.accessToken);
      saveUser(data.user);
      return { success: true, user: data.user };
    }
    return { success: false, message: data.message || "Zoho login failed" };
  },
};
