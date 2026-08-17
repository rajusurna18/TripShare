import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

// COMPONENTS
import ProfileHero from "../components/profile/ProfileHero";
import InterestTags from "../components/profile/InterestTags";
import TravelerBadges from "../components/profile/TravelerBadges";
import ProfileForm from "../components/profile/ProfileForm";
import FollowModal from "../components/profile/FollowModal";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState("");
  const [travelStyle, setTravelStyle] = useState("");
  const [personality, setPersonality] = useState("");
  const [mbti, setMbti] = useState("");
  const [budgetMin, setBudgetMin] = useState(0);
  const [budgetMax, setBudgetMax] = useState(0);
  const [travelFrequency, setTravelFrequency] = useState("medium");
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

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalUsers, setModalUsers] = useState([]);

  useEffect(() => {
    fetchProfile();
  }, []);

  // FETCH PROFILE
  async function fetchProfile() {
    try {
      const res = await API.get("/profile");
      const profile = res.data.user || res.data;

      setUser(profile);
      setBio(profile.bio || "");
      setInterests(profile.interests?.join(", ") || "");
      setTravelStyle(profile.travelStyle || "");
      setPersonality(profile.personality || "");
      setMbti(profile.mbti || "");
      setBudgetMin(profile.budgetRange?.min || 0);
      setBudgetMax(profile.budgetRange?.max || 0);
      setTravelFrequency(profile.travelFrequency || "medium");
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
      formData.append("mbti", mbti);
      formData.append("budgetMin", budgetMin);
      formData.append("budgetMax", budgetMax);
      formData.append("travelFrequency", travelFrequency);
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

      const res = await API.put("/profile", formData);
      const updatedUser = res.data.user || res.data;

      setUser(updatedUser);
      setBio(updatedUser.bio || "");
      setInterests(updatedUser.interests?.join(", ") || "");
      setTravelStyle(updatedUser.travelStyle || "");
      setPersonality(updatedUser.personality || "");
      setMbti(updatedUser.mbti || "");
      setBudgetMin(updatedUser.budgetRange?.min || 0);
      setBudgetMax(updatedUser.budgetRange?.max || 0);
      setTravelFrequency(updatedUser.travelFrequency || "medium");
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

  // FOLLOWERS MODAL OPEN
  const openFollowers = async () => {
    try {
      const res = await API.get(`/profile/followers/${user._id}`);
      setModalUsers(res.data);
      setModalTitle("Followers");
      setModalOpen(true);
    } catch (err) {
      console.log(err);
    }
  };

  // FOLLOWING MODAL OPEN
  const openFollowing = async () => {
    try {
      const res = await API.get(`/profile/following/${user._id}`);
      setModalUsers(res.data);
      setModalTitle("Following");
      setModalOpen(true);
    } catch (err) {
      console.log(err);
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
      <div className="container container-responsive py-5">
        <div style={{ marginBottom: "20px" }}>
          <button className="btn btn-outline-light btn-sm btn-responsive" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>
        {/* HERO */}
        <ProfileHero
          user={user}
          completion={completion}
          missingFields={missingFields}
          onFollowersClick={openFollowers}
          onFollowingClick={openFollowing}
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
          mbti={mbti}
          setMbti={setMbti}
          budgetMin={budgetMin}
          setBudgetMin={setBudgetMin}
          budgetMax={budgetMax}
          setBudgetMax={setBudgetMax}
          travelFrequency={travelFrequency}
          setTravelFrequency={setTravelFrequency}
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

        {/* REUSABLE FOLLOWERS/FOLLOWING MODAL */}
        <FollowModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={modalTitle}
          users={modalUsers}
        />
      </div>
    </div>
  );
}

export default Profile;
