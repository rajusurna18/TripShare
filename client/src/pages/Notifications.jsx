import {
  useEffect,
  useState,
} from "react";

import API
from "../services/api";

import NotificationCard
from "../components/notification/NotificationCard";

function Notifications() {

  const [

    notifications,

    setNotifications

  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  // FETCH NOTIFICATIONS

  const fetchNotifications =
    async () => {

      try {

        const res =
          await API.get(
            "/notifications"
          );

        setNotifications(

          res.data.notifications ||

          res.data ||

          []

        );

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);

      }

  };

  useEffect(() => {

    fetchNotifications();

  }, []);

  // MARK READ

  const markAsRead =
    async (id) => {

      try {

        await API.put(

          `/notifications/${id}/read`

        );

        setNotifications(

          notifications.map(

            (item) =>

              item._id === id

                ? {

                    ...item,

                    read: true,

                  }

                : item

          )

        );

      } catch (err) {

        console.log(err);

      }

  };

  // UNREAD COUNT

  const unreadCount =

    notifications.filter(

      (n) => !n.read

    ).length;

  // LOADING

  if (loading) {

    return (

      <div className="dashboard-page min-vh-100 text-light d-flex justify-content-center align-items-center">

        <div className="text-center">

          <div className="spinner-border text-warning mb-3" />

          <h4>

            Loading Notifications...

          </h4>

        </div>

      </div>

    );

  }

  return (

    <div className="dashboard-page min-vh-100 text-light">

      <div className="container py-5">

        <div className="glass-card p-4 p-md-5 mb-5">

    <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">

            <div>

              <h1 className="fw-bold">

                Notifications 🔔

              </h1>

              <p className="text-secondary mb-0">

                Stay updated with your latest travel activity.

              </p>

            </div>

            <span className="badge bg-warning text-dark fs-6">

              {unreadCount} Unread

            </span>

          </div>

        </div>

        {

          notifications.length === 0 ? (

            <div className="glass-card p-5 text-center">

              <h2 className="text-warning mb-3">

                No Notifications Yet 🔕

              </h2>

              <p className="text-secondary">

                Friend requests, reviews, expenses,

                chats and trip updates will appear here.

              </p>

            </div>

          ) : (

            <div className="d-flex flex-column gap-4">

              {

                notifications.map(

                  (notification) => (

                    <NotificationCard

                      key={
                        notification._id
                      }

                      notification={
                        notification
                      }

                      onRead={
                        markAsRead
                      }

                    />

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