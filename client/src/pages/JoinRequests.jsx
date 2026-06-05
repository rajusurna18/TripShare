import {

  useEffect,

  useState,

} from "react";

import {

  useParams,

} from "react-router-dom";

import API
from "../services/api";

import JoinRequestCard
from "../components/trip/JoinRequestCard";

function JoinRequests() {

  const { tripId } =
    useParams();

  const [requests, setRequests] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  // FETCH REQUESTS

  const fetchRequests =
    async () => {

      try {

        const res =
          await API.get(

            `/join-requests/${tripId}`

          );

        setRequests(

          res.data.requests || []

        );

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);

      }

  };

  useEffect(() => {

    fetchRequests();

  }, [tripId]);

  // ACCEPT

  const acceptRequest =
    async (id) => {

      try {

        await API.put(

          `/join-requests/accept/${id}`

        );

        fetchRequests();

      } catch (err) {

        console.log(err);

      }

  };

  // REJECT

  const rejectRequest =
    async (id) => {

      try {

        await API.put(

          `/join-requests/reject/${id}`

        );

        fetchRequests();

      } catch (err) {

        console.log(err);

      }

  };

  if (loading) {

    return (

      <div className="dashboard-page min-vh-100 text-light d-flex justify-content-center align-items-center">

        <h2>

          Loading Requests...

        </h2>

      </div>

    );

  }

  return (

    <div className="dashboard-page min-vh-100 text-light">

      <div className="container py-5">

        <div className="mb-5">

          <h1 className="fw-bold">

            Trip Join Requests ✈️

          </h1>

          <p className="dashboard-subtitle">

            Approve or reject
            travelers requesting
            to join your trip.

          </p>

        </div>

        {

          requests.length === 0 ? (

            <div className="glass-card p-5 text-center">

              <h3>

                No Pending Requests

              </h3>

            </div>

          ) : (

            requests.map(
              (request) => (

                <JoinRequestCard

                  key={request._id}

                  request={request}

                  onAccept={
                    acceptRequest
                  }

                  onReject={
                    rejectRequest
                  }

                />

              )
            )

          )

        }

      </div>

    </div>

  );

}

export default JoinRequests;