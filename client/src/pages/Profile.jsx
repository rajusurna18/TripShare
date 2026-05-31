
import { useEffect, useState }
from "react";

import API
from "../services/api";

function Profile() {

  const [user, setUser] =
    useState(null);

  const [bio, setBio] =
    useState("");

  const [interests, setInterests] =
    useState("");

  const [travelStyle, setTravelStyle] =
    useState("");

  const [personality, setPersonality] =
    useState("");

  const [image, setImage] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {

    fetchProfile();

  }, []);

  // FETCH PROFILE

  const fetchProfile =
    async () => {

      try {

        const res =
          await API.get(
            "/api/profile"
          );

        const profile =

          res.data.user ||

          res.data;

        setUser(profile);

        setBio(
          profile.bio || ""
        );

        setInterests(

          profile.interests
            ?.join(", ") || ""

        );

        setTravelStyle(

          profile.travelStyle || ""

        );

        setPersonality(

          profile.personality || ""

        );

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);

      }

  };

  // UPDATE PROFILE

  const updateProfile =
    async () => {

      try {

        setSaving(true);

        const formData =
          new FormData();

        formData.append(
          "bio",
          bio
        );

        const interestArray =

          interests
            .split(",")

            .map((i) =>
              i.trim()
            )

            .filter(Boolean);

        interestArray.forEach(
          (interest) => {

            formData.append(
              "interests",
              interest
            );

          }
        );

        formData.append(
          "travelStyle",
          travelStyle
        );

        formData.append(
          "personality",
          personality
        );

        if (image) {

          formData.append(

            "profileImage",

            image

          );

        }

        const res =
          await API.put(

            "/api/profile",

            formData

          );

        const updatedUser =

          res.data.user ||

          res.data;

        setUser(updatedUser);

        setBio(
          updatedUser.bio || ""
        );

        setInterests(

          updatedUser.interests
            ?.join(", ") || ""

        );

        setTravelStyle(

          updatedUser.travelStyle || ""

        );

        setPersonality(

          updatedUser.personality || ""

        );

        alert(
          "Profile Updated 🚀"
        );

      } catch (err) {

        console.log(err);

      } finally {

        setSaving(false);

      }

  };

  // PROFILE COMPLETION

  let completed = 0;

  if (user?.profileImage)
    completed++;

  if (bio.trim())
    completed++;

  if (interests.trim())
    completed++;

  if (travelStyle.trim())
    completed++;

  if (personality.trim())
    completed++;

  const completion =
    Math.floor(
      (completed / 5) * 100
    );

  // LOADING

  if (loading) {

    return (

      <div className="dashboard-page min-vh-100 text-light d-flex justify-content-center align-items-center">

        <h2>

          Loading Profile...

        </h2>

      </div>

    );

  }

  return (

    <div className="dashboard-page min-vh-100 text-light">

      <div className="container py-5">

        <div className="glass-card p-5">

          {/* PROFILE HEADER */}

          <div className="text-center mb-5">

            <img

              src={

                user?.profileImage ||

                "https://i.pravatar.cc/200"

              }

              alt="profile"

              className="profile-page-image"

            />

            <h1 className="mt-4 fw-bold">

              {user?.name}

            </h1>

            <p className="text-secondary">

              {user?.email}

            </p>

          </div>

          {/* PROFILE COMPLETION */}

          <div className="mb-5">

            <div className="d-flex justify-content-between align-items-center mb-2">

              <h4>

                Profile Completion

              </h4>

              <span className="text-warning fw-bold">

                {completion}%

              </span>

            </div>

            <div className="progress profile-progress-bar">

              <div

                className="progress-bar bg-warning"

                style={{

                  width:
                    `${completion}%`

                }}

              />

            </div>

            <div className="mt-4">

              <small className="text-secondary">

                Complete your profile
                to unlock better travel
                matches and personalized
                recommendations.

              </small>

            </div>

          </div>

          {/* BIO */}

          <div className="mb-4">

            <label className="form-label fw-bold">

              Bio

            </label>

            <textarea

              className="form-control profile-input"

              rows="4"

              value={bio}

              onChange={(e) =>

                setBio(
                  e.target.value
                )

              }

            />

          </div>

          {/* INTERESTS */}

          <div className="mb-4">

            <label className="form-label fw-bold">

              Interests

            </label>

            <input

              type="text"

              className="form-control profile-input"

              placeholder="trekking, beaches, food"

              value={interests}

              onChange={(e) =>

                setInterests(
                  e.target.value
                )

              }

            />

          </div>

          {/* TRAVEL STYLE */}

          <div className="mb-4">

            <label className="form-label fw-bold">

              Travel Style

            </label>

            <select

              className="form-select profile-input"

              value={travelStyle}

              onChange={(e) =>

                setTravelStyle(
                  e.target.value
                )

              }

            >

              <option value="">

                Select Travel Style

              </option>

              <option value="Budget">

                Budget

              </option>

              <option value="Luxury">

                Luxury

              </option>

              <option value="Adventure">

                Adventure

              </option>

              <option value="Backpacking">

                Backpacking

              </option>

            </select>

          </div>

          {/* PERSONALITY */}

          <div className="mb-4">

            <label className="form-label fw-bold">

              Personality

            </label>

            <select

              className="form-select profile-input"

              value={personality}

              onChange={(e) =>

                setPersonality(
                  e.target.value
                )

              }

            >

              <option value="">

                Select Personality

              </option>

              <option value="Introvert">

                Introvert

              </option>

              <option value="Extrovert">

                Extrovert

              </option>

            </select>

          </div>

          {/* IMAGE */}

          <div className="mb-4">

            <label className="form-label fw-bold">

              Upload Profile Image

            </label>

            <input

              type="file"

              className="form-control profile-input"

              onChange={(e) =>

                setImage(
                  e.target.files[0]
                )

              }

            />

          </div>

          {/* BUTTON */}

          <button

            onClick={updateProfile}

            className="btn btn-custom px-5 py-3"

            disabled={saving}

          >

            {

              saving

                ? "Saving..."

                : "Save Profile 🚀"

            }

          </button>

        </div>

      </div>

    </div>

  );

}

export default Profile;

