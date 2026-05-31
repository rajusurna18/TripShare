import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import API
from "../services/api";

function Expenses() {

  const { tripId } =
    useParams();

  const [balances, setBalances] =
    useState(null);

  const [expenses, setExpenses] =
    useState([]);

  const [title, setTitle] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const currentUser =
    JSON.parse(

      localStorage.getItem(
        "user"
      ) || "{}"

    );

  useEffect(() => {

    fetchBalances();

    fetchExpenses();

  }, []);

  // FETCH BALANCES

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

        setBalances(res.data);

      } catch (err) {

        console.log(err);

      }

  };

  // FETCH EXPENSES

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

      }

  };

  // ADD EXPENSE

  const addExpense =
    async () => {

      if (
        !title ||
        !amount
      ) return;

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        await API.post(

          `/expenses/${tripId}`,

          {

            title,

            amount,

            paidBy:
              currentUser._id,

          },

          {

            headers: {

              Authorization:
                `Bearer ${token}`,

            },

          }

        );

        setTitle("");

        setAmount("");

        fetchBalances();

        fetchExpenses();

      } catch (err) {

        console.log(err);

      }

  };

  return (

    <div
      style={{
        background: "#111",
        minHeight: "100vh",
        color: "white",
        padding: "40px",
      }}
    >

      <h1 className="mb-4">

        💳 Trip Expenses

      </h1>

      {/* ADD EXPENSE */}

      <div
        style={{
          background: "#1e1e1e",
          padding: "20px",
          borderRadius: "20px",
          marginBottom: "30px",
        }}
      >

        <h3>

          Add Expense

        </h3>

        <input

          type="text"

          placeholder="Expense title"

          className="form-control mb-3"

          value={title}

          onChange={(e) =>

            setTitle(
              e.target.value
            )

          }

        />

        <input

          type="number"

          placeholder="Amount"

          className="form-control mb-3"

          value={amount}

          onChange={(e) =>

            setAmount(
              e.target.value
            )

          }

        />

        <button

          className="btn btn-warning"

          onClick={addExpense}

        >

          Add Expense

        </button>

      </div>

      {/* SUMMARY */}

      {

        balances && (

          <div
            style={{
              background: "#1e1e1e",
              padding: "20px",
              borderRadius: "20px",
              marginBottom: "30px",
            }}
          >

            <h2>

              Expense Summary 📊

            </h2>

            <p>
              Total:
              ₹{balances.total}
            </p>

            <p>
              Per Person:
              ₹{balances.perPerson}
            </p>

            <p>
              Travelers:
              {
                balances.totalTravelers
              }
            </p>

          </div>

        )

      }

      {/* BALANCES */}

      {

        balances?.balances?.map(

          (item, index) => (

            <div

              key={index}

              style={{
                background: "#1e1e1e",
                padding: "20px",
                borderRadius: "20px",
                marginBottom: "15px",
              }}

            >

              <h4>

                {item.user}

              </h4>

              <p>
                Paid:
                ₹{item.paid}
              </p>

              <p>
                Balance:
                ₹{item.balance}
              </p>

              <p>

                Status:

                <span
                  className={

                    item.status ===
                    "gets back"

                      ? "text-success"

                      : item.status ===
                        "owes"

                      ? "text-danger"

                      : "text-warning"

                  }
                >

                  {" "}
                  {item.status}

                </span>

              </p>

            </div>

          )

        )

      }

      {/* EXPENSE HISTORY */}

      <div className="mt-5">

        <h2>

          Recent Expenses 🧾

        </h2>

        {

          expenses.map(
            (exp) => (

              <div

                key={exp._id}

                style={{
                  background: "#1e1e1e",
                  padding: "15px",
                  borderRadius: "15px",
                  marginBottom: "10px",
                }}

              >

                <h5>

                  {exp.title}

                </h5>

                <p>
                  ₹{exp.amount}
                </p>

                <p>
                  Paid By:
                  {
                    exp.paidBy
                      ?.name
                  }
                </p>

              </div>

            )
          )

        }

      </div>

    </div>

  );

}

export default Expenses;