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

function PublicProfile() {

  const { userId } =
    useParams();

  const navigate =
    useNavigate();

  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    fetchProfile();

  }, [userId]);

  const fetchProfile =
    async () => {

      try {

        const res =
          await API.get(

            `/api/profile/${userId}`

          );

        setUser(res.data);

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);

      }

  };

  const sendFriendRequest =
    async () => {

      try {

        await API.post(

          "/api/friends/request",

          {
            receiverId: userId,
          }

        );

        alert(
          "Friend Request Sent 🤝"
        );

      } catch (err) {

        console.log(err);

        alert(

          err?.response?.data
            ?.message ||

          "Request Failed"

        );

      }

  };

  if (loading) {

    return (

      <div className="min-vh-100 d-flex justify-content-center align-items-center text-light">

        <h2>

          Loading Traveler...

        </h2>

      </div>

    );

  }

  return (

    <div className="dashboard-page min-vh-100 text-light">

      <div className="container py-5">

       <div className="glass-card p-4 p-md-5">

          <div className="text-center">

            <img

              src={

                user?.profileImage ||

                "https://i.pravatar.cc/250"

              }

              alt="profile"

              style={{

                width: "180px",

                height: "180px",

                borderRadius: "50%",

                objectFit: "cover",

                border: "4px solid #ffc107",


              }}

            />

            <h1 className="mt-4">

              {user?.name}

            </h1>

            <p className="text-secondary">

              {user?.email}

            </p>

          </div>

          <div
           className="d-flex justify-content-center flex-wrap gap-4 mt-4 text-center"
          >

            <div>

              <h3 className="text-warning">

                {

                  user?.friends
                    ?.length || 0

                }

              </h3>

              <small>

                Friends

              </small>

            </div>

            <div>

              <h3 className="text-warning">

                {

                  user?.followers
                    ?.length || 0

                }

              </h3>

              <small>

                Followers

              </small>

            </div>

            <div>

              <h3 className="text-warning">

                {

                  user?.following
                    ?.length || 0

                }

              </h3>

              <small>

                Following

              </small>

            </div>

          </div>

          <hr className="my-5" />

          <h3>

            About Traveler

          </h3>

          <p>

            {

              user?.bio ||

              "No bio added"

            }

          </p>

          <h3 className="mt-4">

            Interests

          </h3>

          <div className="d-flex flex-wrap gap-2">

            {

              user?.interests?.map(

                (interest,index) => (

                  <span

                    key={index}

                    className="badge bg-warning text-dark"

                  >

                    {interest}

                  </span>

                )

              )

            }

          </div>

          <h3 className="mt-4">

            Travel Style

          </h3>

          <p>

            ✈️ {

              user?.travelStyle ||

              "Not Added"

            }

          </p>

          <h3 className="mt-4">

            Personality

          </h3>

          <p>

            🧠 {

              user?.personality ||

              "Not Added"

            }

          </p>

          <h3 className="mt-4">

            Location

          </h3>

          <p>

            📍 {

              user?.location ||

              "Unknown"

            }

          </p>

          <h3 className="mt-4">

            Languages

          </h3>

          <div className="d-flex flex-wrap gap-2">

            {

              user?.languages?.map(

                (lang,index) => (

                  <span

                    key={index}

                    className="badge bg-info"

                  >

                    {lang}

                  </span>

                )

              )

            }

          </div>

          <h3 className="mt-4">

            Visited Places

          </h3>

          <div className="d-flex flex-wrap gap-2">

            {

              user?.visitedPlaces?.map(

                (place,index) => (

                  <span

                    key={index}

                    className="badge bg-success"

                  >

                    📍 {place}

                  </span>

                )

              )

            }

          </div>

          <div
  className="d-flex flex-wrap gap-3 mt-4"
        >
          

            {

              user?.instagram && (

                <a

                  href={`https://instagram.com/${user.instagram}`}

                  target="_blank"

                  rel="noreferrer"

                  className="btn btn-outline-danger"

                >

                  Instagram

                </a>

              )

            }

            {

              user?.website && (

                <a

                  href={user.website}

                  target="_blank"

                  rel="noreferrer"

                  className="btn btn-outline-primary"

                >

                  Website

                </a>

              )

            }

          </div>

          <div className="mt-5 d-flex flex-column flex-md-row gap-3">

            <button

              className="btn btn-warning"

              onClick={
                sendFriendRequest
              }

            >

              🤝 Send Friend Request

            </button>

            <button

              className="btn btn-outline-light"

              onClick={() =>

                navigate(
                  `/reviews/${userId}`
                )

              }

            >

              ⭐ View Reviews

            </button>

          </div>

        </div>

      </div>

    </div>

  );

}

export default PublicProfile;