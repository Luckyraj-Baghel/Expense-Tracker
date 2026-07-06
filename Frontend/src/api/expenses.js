import axios from 'axios';

const API_URL = 'https://expense-tracker-backend-4bp6.onrender.com/api/expenses';

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return { headers: { Authorization: `Bearer ${user.token}` } };
};

export const getExpenses = async () => {
  const response = await axios.get(API_URL, getAuthHeader());
  return response.data;
};

export const createExpense = async (expenseData) => {
  const response = await axios.post(API_URL, expenseData, getAuthHeader());
  return response.data;
};

export const updateExpense = async (id, expenseData) => {
  const response = await axios.put(`${API_URL}/${id}`, expenseData, getAuthHeader());
  return response.data;
};

export const deleteExpense = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};