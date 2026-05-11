import { useEffect, useState } from "react";
import API from "../services/api";

function Expenses() {

  const [balances, setBalances] =
    useState({});

  const tripId = "YOUR_TRIP_ID";

  useEffect(() => {

    const fetchBalances = async () => {

      const res = await API.get(
        `/api/expenses/${tripId}/balances`
      );

      setBalances(res.data);
    };

    fetchBalances();

  }, []);

  return (
    <div className="p-10">

      <h1 className="text-3xl font-bold mb-6">

        Expense Balances 💰

      </h1>

      {
        Object.entries(balances).map(
          ([user, amount]) => (

            <div
              key={user}
              className="bg-white p-4 shadow rounded mb-4"
            >

              <p>User: {user}</p>

              <p>
                Balance:
                ₹{amount}
              </p>

            </div>
          )
        )
      }

    </div>
  );
}

export default Expenses; 