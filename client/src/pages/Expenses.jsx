import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import API
from "../services/api";

import AddExpenseModal
from "../components/expense/AddExpenseModal";

import ExpenseCard
from "../components/expense/ExpenseCard";

import BalanceCard
from "../components/expense/BalanceCard";

function Expenses() {

  const { tripId } =
    useParams();

  const navigate = useNavigate();

  const [balances, setBalances] =
    useState(null);

  const [expenses, setExpenses] =
    useState([]);

  const [trip, setTrip] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  // Edit Expense States
  const [editingExpense, setEditingExpense] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("Food");
  const [editPaymentMethod, setEditPaymentMethod] = useState("Cash");
  const [editNote, setEditNote] = useState("");
  const [editSplitAmong, setEditSplitAmong] = useState([]);

  useEffect(() => {

    fetchTrip();

    fetchBalances();

    fetchExpenses();

  }, []);

  const fetchTrip =
    async () => {

      try {

        const res =
          await API.get(
            `/trips/${tripId}`
          );

        setTrip(
          res.data.trip
        );

      } catch (err) {

        console.log(err);

      }

  };

  // =====================
  // FETCH BALANCES
  // =====================

  const fetchBalances =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await API.get(

            `/expenses/balance/${tripId}`,

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,

              },

            }

          );

        setBalances(
          res.data
        );

      } catch (err) {

        console.log(err);

      }

  };

  // =====================
  // FETCH EXPENSES
  // =====================

  const fetchExpenses =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await API.get(

            `/expenses/${tripId}`,

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,

              },

            }

          );

        setExpenses(

          res.data.expenses || []

        );

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);

      }

  };

  // =====================
  // ADD EXPENSE
  // =====================

  const addExpense =
    async (data) => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        await API.post(

          `/expenses/${tripId}`,

          data,

          {

            headers: {

              Authorization:
                `Bearer ${token}`,

            },

          }

        );

        fetchBalances();

        fetchExpenses();

      } catch (err) {

        console.log(err);

      }

  };

  const handleEditClick = (expense) => {
    setEditingExpense(expense);
    setEditTitle(expense.title || "");
    setEditAmount(expense.amount || "");
    setEditCategory(expense.category || "Food");
    setEditPaymentMethod(expense.paymentMethod || "Cash");
    setEditNote(expense.note || "");
    setEditSplitAmong((expense.splitAmong || []).map((m) => m._id || m));
  };

  const submitEditExpense = async () => {
    if (!editTitle.trim() || !editAmount) {
      alert("Please enter a title and amount.");
      return;
    }
    if (editSplitAmong.length === 0) {
      alert("Please select at least one member to split the expense with.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await API.put(`/expenses/${editingExpense._id}`, {
        title: editTitle,
        amount: Number(editAmount),
        category: editCategory,
        paymentMethod: editPaymentMethod,
        note: editNote,
        splitAmong: editSplitAmong
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingExpense(null);
      fetchBalances();
      fetchExpenses();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update expense");
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/expenses/${expenseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBalances();
      fetchExpenses();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete expense");
    }
  };

  // =====================
  // LOADING
  // =====================

  if (loading) {

    return (

      <div
        className="dashboard-page min-vh-100 text-light d-flex justify-content-center align-items-center"
      >

        <h2>

          Loading Expenses...

        </h2>

      </div>

    );

  }

  return (

    <div
      className="dashboard-page min-vh-100 text-light"
    >

      <div className="container py-5">

        {/* PAGE TITLE */}

        <div className="mb-5 d-flex justify-content-between align-items-center flex-wrap gap-3">

          <div>

            <h1 className="fw-bold">

              💳 Trip Expenses

            </h1>

            <p className="dashboard-subtitle">

              Track spending,
              balances,
              and settlements.

            </p>

          </div>

          <button
            className="btn btn-outline-warning rounded-4 px-4 py-2 fw-bold shadow-sm"
            onClick={() => navigate(`/expense-ai/${tripId}`)}
          >
            🤖 Run AI Settlement Insights
          </button>

        </div>

        {/* ADD EXPENSE */}

        <div className="mb-5">

          <AddExpenseModal
            members={trip?.members || []}
            onSubmit={
              addExpense
            }
          />

        </div>

        {/* SUMMARY */}

        {

          balances && (

            <div
              className="glass-card p-4 mb-5"
            >

              <h2 className="mb-4">

                Expense Summary 📊

              </h2>

              <div className="row text-center g-4">

                <div className="col-12 col-md-4">

                  <h2 className="text-warning">

                    ₹

                    {

                      balances.total

                    }

                  </h2>

                  <p>

                    Total Spent

                  </p>

                </div>

                <div className="col-12 col-md-4">

                  <h2 className="text-success">

                    ₹

                    {

                      balances.perPerson

                    }

                  </h2>

                  <p>

                    Per Person

                  </p>

                </div>

                <div className="col-12 col-md-4">

                  <h2 className="text-info">

                    {

                      balances.totalTravelers

                    }

                  </h2>

                  <p>

                    Travelers

                  </p>

                </div>

              </div>

            </div>

          )

        }

        {/* BALANCES */}

        <div className="mb-5">

          <h2 className="mb-4">

            Traveler Balances 💰

          </h2>

          <div className="row g-4">

            {

              balances?.balances?.map(

                (

                  item,

                  index

                ) => (

                  <div

                    className="col-lg-4 col-md-6"

                    key={index}

                  >

                    <BalanceCard

                      balance={item}

                    />

                  </div>

                )

              )

            }

          </div>

        </div>

        {/* EXPENSE HISTORY */}

        <div>

          <h2 className="mb-4">

            Recent Expenses 🧾

          </h2>

          {

            expenses.length === 0 ? (

              <div
                className="glass-card p-5 text-center"
              >

                <h4>

                  No expenses added yet

                </h4>

              </div>

            ) : (

              <div className="row g-4">

                {

                  expenses.map(

                    (

                      expense

                    ) => (

                      <div

                        className="col-lg-6"

                        key={
                          expense._id
                        }

                      >

                        <ExpenseCard

                          expense={
                            expense
                          }
                          onEdit={handleEditClick}
                          onDelete={handleDeleteExpense}

                        />

                      </div>

                    )

                  )

                }

              </div>

            )

          }

        </div>

      </div>

      {editingExpense && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1100,
          padding: "20px"
        }}>
          <div className="glass-card p-4" style={{ width: "100%", maxWidth: "500px", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="m-0 text-warning">Edit Expense ✏️</h3>
              <button className="btn-close btn-close-white" onClick={() => setEditingExpense(null)}></button>
            </div>
            
            <label className="form-label text-light">Title</label>
            <input
              type="text"
              className="form-control mb-3 bg-dark text-light border-secondary"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            
            <label className="form-label text-light">Amount</label>
            <input
              type="number"
              className="form-control mb-3 bg-dark text-light border-secondary"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
            />
            
            <label className="form-label text-light">Category</label>
            <select
              className="form-select mb-3 bg-dark text-light border-secondary"
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
            >
              <option>Food</option>
              <option>Hotel</option>
              <option>Fuel</option>
              <option>Flight</option>
              <option>Activities</option>
            </select>
            
            <label className="form-label text-light">Payment Method</label>
            <select
              className="form-select mb-3 bg-dark text-light border-secondary"
              value={editPaymentMethod}
              onChange={(e) => setEditPaymentMethod(e.target.value)}
            >
              <option>Cash</option>
              <option>UPI</option>
              <option>Card</option>
            </select>
            
            <label className="form-label text-light">Note</label>
            <textarea
              className="form-control mb-3 bg-dark text-light border-secondary"
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
            />
            
            {trip?.members && trip.members.length > 0 && (
              <div className="mb-4">
                <label className="form-label text-light d-block fw-bold">Split Among:</label>
                <div className="d-flex flex-wrap gap-3">
                  {trip.members.map((member) => (
                    <div key={member._id} className="form-check form-check-inline">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={`edit-split-${member._id}`}
                        checked={editSplitAmong.includes(member._id)}
                        onChange={() => {
                          if (editSplitAmong.includes(member._id)) {
                            setEditSplitAmong(editSplitAmong.filter(id => id !== member._id));
                          } else {
                            setEditSplitAmong([...editSplitAmong, member._id]);
                          }
                        }}
                      />
                      <label className="form-check-label text-light" htmlFor={`edit-split-${member._id}`}>
                        {member.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={() => setEditingExpense(null)}>Cancel</button>
              <button className="btn btn-warning text-dark fw-bold" onClick={submitEditExpense}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

    </div>

  );

}

export default Expenses;