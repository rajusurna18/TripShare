import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
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

  const [balances, setBalances] =
    useState(null);

  const [expenses, setExpenses] =
    useState([]);

  const [trip, setTrip] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

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

        <div className="mb-5">

          <h1 className="fw-bold">

            💳 Trip Expenses

          </h1>

          <p className="dashboard-subtitle">

            Track spending,
            balances,
            and settlements.

          </p>

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

    </div>

  );

}

export default Expenses;