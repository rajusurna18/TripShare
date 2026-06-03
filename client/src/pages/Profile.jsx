
import { useEffect, useState }
from "react";

import API
from "../services/api";

// COMPONENTS

import ProfileHero
from "../components/profile/ProfileHero";

import InterestTags
from "../components/profile/InterestTags";

import TravelerBadges
from "../components/profile/TravelerBadges";

import ProfileForm
from "../components/profile/ProfileForm";

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

        {/* HERO */}

        <ProfileHero

          user={user}

          completion={completion}

        />

        {/* BADGES */}

        <TravelerBadges

          travelStyle={travelStyle}

          personality={personality}

        />

        {/* INTEREST TAGS */}

        <InterestTags

          interests={

            interests
              .split(",")

              .map((i) =>
                i.trim()
              )

              .filter(Boolean)

          }

        />

        {/* PROFILE FORM */}

        <ProfileForm

          bio={bio}

          setBio={setBio}

          interests={interests}

          setInterests={setInterests}

          travelStyle={travelStyle}

          setTravelStyle={setTravelStyle}

          personality={personality}

          setPersonality={setPersonality}

          setImage={setImage}

          updateProfile={updateProfile}

          saving={saving}

        />

      </div>

    </div>

  );

}

export default Profile;
