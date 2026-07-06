import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExpenses, deleteExpense, updateExpense } from '../api/expenses';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseChart from '../components/ExpenseChart';
import LogoutModal from '../components/LogoutModal';
import { updateBudget } from '../api/auth';

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editDate, setEditDate] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));

  const [monthlyBudget, setMonthlyBudget] = useState(user?.monthlyBudget || 0);
  const [budgetInput, setBudgetInput] = useState('');

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleBudgetUpdate = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateBudget(budgetInput);
      setMonthlyBudget(updated.monthlyBudget);
      const currentUser = JSON.parse(localStorage.getItem('user'));
      currentUser.monthlyBudget = updated.monthlyBudget;
      localStorage.setItem('user', JSON.stringify(currentUser));
      setBudgetInput('');
    } catch (err) {
      setError('Failed to update budget');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      setExpenses(expenses.filter((expense) => expense._id !== id));
    } catch (err) {
      setError('Failed to delete expense');
    }
  };

  const startEditing = (expense) => {
    setEditingId(expense._id);
    setEditAmount(expense.amount);
    setEditCategory(expense.category);
    setEditNotes(expense.notes || '');
    setEditDate(expense.date.split('T')[0]);
  };

  const cancelEditing = () => setEditingId(null);

  const handleUpdate = async (id) => {
    try {
      const updated = await updateExpense(id, {
        amount: editAmount,
        category: editCategory,
        notes: editNotes,
        date: editDate,
      });
      setExpenses(expenses.map((exp) => (exp._id === id ? updated : exp)));
      setEditingId(null);
    } catch (err) {
      setError('Failed to update expense');
    }
  };

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const data = await getExpenses();
        setExpenses(data);
      } catch (err) {
        setError('Failed to load expenses');
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, []);

  const totalSpent = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const budgetPercentage = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;

  let budgetStatus = null;
  if (monthlyBudget > 0) {
    if (budgetPercentage >= 100) {
      budgetStatus = {
        message: `Budget exceeded! Spent ₹${totalSpent} of ₹${monthlyBudget}`,
        color: 'text-red-400',
        bar: 'bg-red-500',
        bg: 'bg-red-500/10 border-red-500/30',
      };
    } else if (budgetPercentage >= 80) {
      budgetStatus = {
        message: `Warning: ${budgetPercentage.toFixed(0)}% of budget used`,
        color: 'text-orange-400',
        bar: 'bg-orange-500',
        bg: 'bg-orange-500/10 border-orange-500/30',
      };
    } else {
      budgetStatus = {
        message: `${budgetPercentage.toFixed(0)}% of budget used — looking good!`,
        color: 'text-emerald-400',
        bar: 'bg-emerald-500',
        bg: 'bg-emerald-500/10 border-emerald-500/30',
      };
    }
  }

  const categoryColors = {
    Food: 'bg-orange-500/20 text-orange-300',
    Transport: 'bg-blue-500/20 text-blue-300',
    Shopping: 'bg-pink-500/20 text-pink-300',
    Bills: 'bg-red-500/20 text-red-300',
    Entertainment: 'bg-purple-500/20 text-purple-300',
    Health: 'bg-emerald-500/20 text-emerald-300',
    Other: 'bg-slate-500/20 text-slate-300',
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400">Loading your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950">

      {/* Navbar */}
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <h1 className="text-lg font-bold text-white">Expense Tracker</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-slate-800 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/50 text-slate-300 hover:text-red-400 text-sm px-4 py-2 rounded-xl transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <p className="text-slate-400 text-sm mb-1">Total Spent</p>
            <p className="text-2xl font-bold text-white">₹{totalSpent}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <p className="text-slate-400 text-sm mb-1">Monthly Budget</p>
            <p className="text-2xl font-bold text-white">
              {monthlyBudget > 0 ? `₹${monthlyBudget}` : 'Not set'}
            </p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <p className="text-slate-400 text-sm mb-1">Remaining</p>
            <p className={`text-2xl font-bold ${monthlyBudget > 0 && totalSpent > monthlyBudget ? 'text-red-400' : 'text-emerald-400'}`}>
              {monthlyBudget > 0 ? `₹${monthlyBudget - totalSpent}` : '—'}
            </p>
          </div>
        </div>

        {/* Budget Section */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">Budget Manager</h2>
          <form onSubmit={handleBudgetUpdate} className="flex gap-3 mb-4">
            <input
              type="number"
              placeholder="Set monthly budget (₹)"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              required
              className="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-4 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-5 py-2 rounded-xl transition duration-200 font-medium"
            >
              Update
            </button>
          </form>

          {monthlyBudget > 0 && budgetStatus && (
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>₹{totalSpent} spent</span>
                <span>₹{monthlyBudget} limit</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 mb-3">
                <div
                  className={`h-2 rounded-full transition-all duration-700 ${budgetStatus.bar}`}
                  style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                />
              </div>
              <div className={`border rounded-xl px-4 py-2 ${budgetStatus.bg}`}>
                <p className={`text-sm font-medium ${budgetStatus.color}`}>
                  {budgetStatus.message}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Chart + Add Expense */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-4">Spending Breakdown</h2>
            <ExpenseChart expenses={expenses} />
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <ExpenseForm onExpenseAdded={(newExpense) => setExpenses([newExpense, ...expenses])} />
          </div>
        </div>

        {/* Expense List */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-base font-semibold text-white">Recent Expenses</h2>
            <span className="text-xs text-slate-400 bg-slate-700 px-3 py-1 rounded-full">
              {expenses.length} {expenses.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {expenses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-slate-400">No expenses yet. Add one to get started!</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {expenses.map((expense) => (
                <li
                  key={expense._id}
                  className="bg-slate-900 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition duration-200"
                >
                  {editingId === expense._id ? (
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Food">Food</option>
                        <option value="Transport">Transport</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Bills">Bills</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Health">Health</option>
                        <option value="Other">Other</option>
                      </select>
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Notes"
                        className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={() => handleUpdate(expense._id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-4 py-2 rounded-lg transition duration-200 font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm px-4 py-2 rounded-lg transition duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColors[expense.category] || 'bg-slate-500/20 text-slate-300'}`}>
                              {expense.category}
                            </span>
                            <span className="font-bold text-white">₹{expense.amount}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">
                              {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            {expense.notes && (
                              <span className="text-xs text-slate-400">• {expense.notes}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditing(expense)}
                          className="bg-slate-700 hover:bg-indigo-600 text-slate-300 hover:text-white text-xs px-3 py-1.5 rounded-lg transition duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(expense._id)}
                          className="bg-slate-700 hover:bg-red-500/30 border border-transparent hover:border-red-500/30 text-slate-300 hover:text-red-400 text-xs px-3 py-1.5 rounded-lg transition duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {showLogoutModal && (
        <LogoutModal
          onConfirm={confirmLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </div>
  );
}

export default Dashboard;