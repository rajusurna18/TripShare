import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

function Expenses() {

  const { tripId } = useParams();

  const [balances, setBalances] =
    useState(null);

  useEffect(() => {

    fetchBalances();

  }, []);

  const fetchBalances = async () => {

    try {

      const token =
        localStorage.getItem("token");

      const res = await API.get(
        `/api/expenses/balance/${tripId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBalances(res.data);

    } catch (err) {

      console.log(err);
    }
  };

  return (

    <div className="p-10 text-white">

      <h1 className="text-3xl font-bold mb-6">

        Expense Balances 💰

      </h1>

      {
        balances && (

          <div className="mt-10">

            <h2 className="text-2xl font-bold mb-4">

              Expense Summary 📊

            </h2>

            <div className="bg-black/30 p-6 rounded-xl border border-yellow-500">

              <p className="mb-2">
                Total:
                ₹{balances.total}
              </p>

              <p className="mb-6">
                Per Person:
                ₹{balances.perPerson}
              </p>

              {
                balances.balances.map(
                  (item, index) => (

                    <div
                      key={index}
                      className="border border-gray-700 p-4 rounded mt-4"
                    >

                      <p>
                        User:
                        {item.user}
                      </p>

                      <p>
                        Paid:
                        ₹{item.paid}
                      </p>

                      <p>
                        Balance:
                        ₹{item.balance}
                      </p>

                    </div>
                  )
                )
              }

            </div>

          </div>
        )
      }

    </div>
  );
}

export default Expenses;