import api from "../../services/api";

export const login = async (data) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

export const signupUser = async (data) => {
  const res = await api.post("/auth/signup", data);
  return res.data;
};

export const forgotPassword = async (email) => {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
};

export const googleLogin = async (token) => {
  const res = await api.post("/auth/google", { token });
  return res.data;
};