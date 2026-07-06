import axios from 'axios';

const API_URL = 'https://expense-tracker-backend-4bp6.onrender.com/api/auth';

export const signup = async (name, email, password) => {
  const response = await axios.post(`${API_URL}/signup`, {
    name,
    email,
    password,
  });
  return response.data;
};

export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, {
    email,
    password,
  });
  return response.data;
};

export const updateBudget = async (monthlyBudget) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const response = await axios.put(
    `${API_URL}/budget`,
    { monthlyBudget },
    { headers: { Authorization: `Bearer ${user.token}` } }
  );
  return response.data;
};