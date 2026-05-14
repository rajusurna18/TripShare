import { useEffect, useState }
from "react";

import API from "../services/api";

function Notifications() {

  const [notifications, setNotifications] =
    useState([]);

  useEffect(() => {

    const fetchNotifications =
      async () => {

        try {

          const token =
            localStorage.getItem("token");

          const res = await API.get(
            "/api/notifications",
            {
              headers: {
                Authorization: token,
              },
            }
          );

          setNotifications(res.data);

        } catch (err) {

          console.log(err);
        }
    };

    fetchNotifications();

  }, []);

  return (

    <div className="p-10">

      <h1 className="text-4xl font-bold mb-8">

        Notifications 🔔

      </h1>

      <div className="flex flex-col gap-4">

        {
          notifications.map((item) => (

            <div
              key={item._id}
              className="bg-white shadow-lg p-4 rounded-xl"
            >

              <p>{item.message}</p>

            </div>
          ))
        }

      </div>

    </div>
  );
}

export default Notifications;