
import { useEffect, useState }
from "react";

import API
from "../services/api";

function Notifications() {

  const [

    notifications,

    setNotifications

  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  // FETCH NOTIFICATIONS

  useEffect(() => {

    const fetchNotifications =
      async () => {

        try {

          const res =
            await API.get(
              "/notifications"
            );

          setNotifications(

            res.data.notifications ||

            res.data

          );

        } catch (err) {

          console.log(err);

        } finally {

          setLoading(false);

        }

    };

    fetchNotifications();

  }, []);

  // NOTIFICATION ICONS

  const getNotificationIcon =
    (message) => {

      const text =
        message.toLowerCase();

      if (
        text.includes("expense")
      ) return "💸";

      if (
        text.includes("message")
      ) return "💬";

      if (
        text.includes("trip")
      ) return "✈️";

      if (
        text.includes("joined")
      ) return "👥";

      if (
        text.includes("profile")
      ) return "🧑";

      return "🔔";

  };

  return (

    <div className="dashboard-page min-vh-100 text-light">

      <div className="container py-5">

        {/* HEADER */}

        <div className="mb-5">

          <h1 className="fw-bold display-6">

            Notifications 🔔

          </h1>

          <p className="dashboard-subtitle">

            Stay updated with
            your latest travel
            activities and alerts.

          </p>

        </div>

        {/* LOADING */}

        {

          loading ? (

            <div className="glass-card p-5 text-center">

              <div
                className="spinner-border text-warning mb-3"
              />

              <h4>

                Loading Notifications...

              </h4>

            </div>

          ) : notifications.length === 0 ? (

            // EMPTY STATE

            <div className="glass-card p-5 text-center">

              <h2 className="text-warning mb-3">

                No Notifications Yet 🔕

              </h2>

              <p className="dashboard-text">

                Your latest travel updates,
                expenses,
                chats,
                and activities
                will appear here.

              </p>

            </div>

          ) : (

            // NOTIFICATIONS LIST

            <div className="d-flex flex-column gap-4">

              {

                notifications.map(

                  (item) => (

                    <div

                      key={item._id}

                      className={`glass-card p-4 notification-card ${
                        !item.read
                          ? "border border-warning"
                          : ""
                      }`}

                    >

                      <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">

                        {/* LEFT */}

                        <div className="d-flex gap-3 align-items-start">

                          <div className="notification-icon">

                            {

                              getNotificationIcon(
                                item.message
                              )

                            }

                          </div>

                          <div>

                            <h5 className="mb-2">

                              {

                                item.message

                              }

                            </h5>

                            <small className="text-secondary">

                              {

                                new Date(

                                  item.createdAt

                                ).toLocaleDateString(

                                  [],

                                  {

                                    day: "numeric",

                                    month: "short",

                                    hour: "2-digit",

                                    minute: "2-digit",

                                  }

                                )

                              }

                            </small>

                          </div>

                        </div>

                        {/* STATUS */}

                        <span
                          className={`badge rounded-pill ${
                            item.read

                              ? "bg-secondary"

                              : "bg-warning text-dark"
                          }`}
                        >

                          {

                            item.read

                              ? "Read"

                              : "New"

                          }

                        </span>

                      </div>

                    </div>

                  )

                )

              }

            </div>

          )

        }

      </div>

    </div>

  );

}

export default Notifications;