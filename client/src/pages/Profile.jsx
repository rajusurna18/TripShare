import { useEffect, useState } from "react";
import API from "../services/api";

// COMPONENTS
import ProfileHero from "../components/profile/ProfileHero";
import InterestTags from "../components/profile/InterestTags";
import TravelerBadges from "../components/profile/TravelerBadges";
import ProfileForm from "../components/profile/ProfileForm";

function Profile() {
  const [user, setUser] = useState(null);
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState("");
  const [travelStyle, setTravelStyle] = useState("");
  const [personality, setPersonality] = useState("");
  const [location, setLocation] = useState("");
  const [instagram, setInstagram] = useState("");
  const [website, setWebsite] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [destinationPreference, setDestinationPreference] = useState("");
  const [languages, setLanguages] = useState("");
  const [visitedPlaces, setVisitedPlaces] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  // FETCH PROFILE
  const fetchProfile = async () => {
    try {
      const res = await API.get("/api/profile");
      const profile = res.data.user || res.data;

      setUser(profile);
      setBio(profile.bio || "");
      setInterests(profile.interests?.join(", ") || "");
      setTravelStyle(profile.travelStyle || "");
      setPersonality(profile.personality || "");
      setLocation(profile.location || "");
      setInstagram(profile.instagram || "");
      setWebsite(profile.website || "");
      setGithub(profile.github || "");
      setLinkedin(profile.linkedin || "");
      setDestinationPreference(profile.destinationPreference || "");
      setLanguages(profile.languages?.join(", ") || "");
      setVisitedPlaces(profile.visitedPlaces?.join(", ") || "");
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // UPDATE PROFILE
  const updateProfile = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("bio", bio);
      formData.append("travelStyle", travelStyle);
      formData.append("personality", personality);
      formData.append("location", location);
      formData.append("instagram", instagram);
      formData.append("website", website);
      formData.append("github", github);
      formData.append("linkedin", linkedin);
      formData.append("destinationPreference", destinationPreference);

      const interestArray = interests
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean);
      interestArray.forEach((interest) => {
        formData.append("interests", interest);
      });

      const languageArray = languages
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean);
      languageArray.forEach((lang) => {
        formData.append("languages", lang);
      });

      const visitedArray = visitedPlaces
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
      visitedArray.forEach((place) => {
        formData.append("visitedPlaces", place);
      });

      if (image) {
        formData.append("profileImage", image);
      }

      const res = await API.put("/api/profile", formData);
      const updatedUser = res.data.user || res.data;

      setUser(updatedUser);
      setBio(updatedUser.bio || "");
      setInterests(updatedUser.interests?.join(", ") || "");
      setTravelStyle(updatedUser.travelStyle || "");
      setPersonality(updatedUser.personality || "");
      setLocation(updatedUser.location || "");
      setInstagram(updatedUser.instagram || "");
      setWebsite(updatedUser.website || "");
      setGithub(updatedUser.github || "");
      setLinkedin(updatedUser.linkedin || "");
      setDestinationPreference(updatedUser.destinationPreference || "");
      setLanguages(updatedUser.languages?.join(", ") || "");
      setVisitedPlaces(updatedUser.visitedPlaces?.join(", ") || "");

      alert("Profile Updated 🚀");
    } catch (err) {
      console.log(err);
    } finally {
      setSaving(false);
    }
  };

  // PROFILE STATS
  const completion = user?.stats?.profileCompletion || 0;
  const missingFields = user?.stats?.missingFields || [];

  if (loading) {
    return (
      <div className="dashboard-page min-vh-100 text-light d-flex justify-content-center align-items-center">
        <h2>Loading Profile...</h2>
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
          missingFields={missingFields}
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
              .map((i) => i.trim())
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
          location={location}
          setLocation={setLocation}
          instagram={instagram}
          setInstagram={setInstagram}
          website={website}
          setWebsite={setWebsite}
          github={github}
          setGithub={setGithub}
          linkedin={linkedin}
          setLinkedin={setLinkedin}
          destinationPreference={destinationPreference}
          setDestinationPreference={setDestinationPreference}
          languages={languages}
          setLanguages={setLanguages}
          visitedPlaces={visitedPlaces}
          setVisitedPlaces={setVisitedPlaces}
          setImage={setImage}
          updateProfile={updateProfile}
          saving={saving}
        />
      </div>
    </div>
  );
}

export default Profile;
