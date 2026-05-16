import { useEffect, useState }
from "react";

import API from "../services/api";

function Profile() {

  const [user, setUser] =
    useState(null);

  const [bio, setBio] =
    useState("");

  const [interests, setInterests] =
    useState("");

  const [image, setImage] =
    useState(null);

  useEffect(() => {

    fetchProfile();

  }, []);

  const fetchProfile =
    async () => {

      try {

        const token =
          localStorage.getItem("token");

        const res = await API.get(
          "/api/profile",
          {
            headers: {
              Authorization: token,
            },
          }
        );

        setUser(res.data);

        setBio(res.data.bio);

        setInterests(
          res.data.interests.join(", ")
        );

      } catch (err) {

        console.log(err);
      }
  };

  const updateProfile =
    async () => {

      try {

        const token =
          localStorage.getItem("token");

        const formData =
          new FormData();

        formData.append("bio", bio);

        formData.append(
          "interests",
          interests
            .split(",")
            .map((i) => i.trim())
        );

        if (image) {
          formData.append(
            "profileImage",
            image
          );
        }

        const res = await API.put(
          "/api/profile",
          formData,
          {
            headers: {
              Authorization: token,
            },
          }
        );

        setUser(res.data);

        alert(
          "Profile Updated 🚀"
        );

      } catch (err) {

        console.log(err);
      }
  };

  if (!user) {
    return <h1>Loading...</h1>;
  }

  return (

    <div className="min-h-screen bg-gray-100 p-10">

      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8">

        <div className="flex flex-col items-center">

          <img
            src={
              user.profileImage ||
              "https://via.placeholder.com/150"
            }
            alt="profile"
            className="w-40 h-40 rounded-full object-cover mb-4"
          />

          <h1 className="text-4xl font-bold">

            {user.name}

          </h1>

          <p className="text-gray-500">

            {user.email}

          </p>

        </div>

        {/* BIO */}

        <div className="mt-8">

          <label className="font-bold">
            Bio
          </label>

          <textarea
            className="w-full border p-4 rounded-xl mt-2"
            rows="4"
            value={bio}
            onChange={(e) =>
              setBio(e.target.value)
            }
          />

        </div>

        {/* INTERESTS */}

        <div className="mt-6">

          <label className="font-bold">
            Interests
          </label>

          <input
            type="text"
            className="w-full border p-4 rounded-xl mt-2"
            placeholder="trekking, beaches, food"
            value={interests}
            onChange={(e) =>
              setInterests(
                e.target.value
              )
            }
          />

        </div>

        {/* IMAGE */}

        <div className="mt-6">

          <input
            type="file"
            onChange={(e) =>
              setImage(
                e.target.files[0]
              )
            }
          />

        </div>

        <button
          onClick={updateProfile}
          className="mt-8 bg-black text-white px-8 py-3 rounded-xl"
        >

          Save Profile

        </button>

      </div>

    </div>
  );
}

export default Profile;