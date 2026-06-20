function ProfileForm({
  bio,
  setBio,
  interests,
  setInterests,
  travelStyle,
  setTravelStyle,
  personality,
  setPersonality,
  location,
  setLocation,
  instagram,
  setInstagram,
  website,
  setWebsite,
  github,
  setGithub,
  linkedin,
  setLinkedin,
  destinationPreference,
  setDestinationPreference,
  languages,
  setLanguages,
  visitedPlaces,
  setVisitedPlaces,
  setImage,
  updateProfile,
  saving,
}) {
  return (
    <div className="glass-card p-5">
      {/* BIO */}
      <div className="mb-4">
        <label className="form-label fw-bold">Bio</label>
        <textarea
          className="form-control profile-input"
          rows="4"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>

      {/* INTERESTS */}
      <div className="mb-4">
        <label className="form-label fw-bold">Interests</label>
        <input
          type="text"
          className="form-control profile-input"
          placeholder="trekking, beaches, food"
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
        />
      </div>

      <div className="row">
        {/* TRAVEL STYLE */}
        <div className="col-md-6 mb-4">
          <label className="form-label fw-bold">Travel Style</label>
          <select
            className="form-select profile-input"
            value={travelStyle}
            onChange={(e) => setTravelStyle(e.target.value)}
          >
            <option value="">Select Travel Style</option>
            <option value="Budget">Budget</option>
            <option value="Luxury">Luxury</option>
            <option value="Adventure">Adventure</option>
            <option value="Backpacking">Backpacking</option>
          </select>
        </div>

        {/* PERSONALITY */}
        <div className="col-md-6 mb-4">
          <label className="form-label fw-bold">Personality</label>
          <select
            className="form-select profile-input"
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
          >
            <option value="">Select Personality</option>
            <option value="Introvert">Introvert</option>
            <option value="Extrovert">Extrovert</option>
          </select>
        </div>
      </div>

      <div className="row">
        {/* LOCATION */}
        <div className="col-md-6 mb-4">
          <label className="form-label fw-bold">Location</label>
          <input
            type="text"
            className="form-control profile-input"
            placeholder="e.g. Mumbai, India"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* DESTINATION PREFERENCE */}
        <div className="col-md-6 mb-4">
          <label className="form-label fw-bold">Destination Preference</label>
          <input
            type="text"
            className="form-control profile-input"
            placeholder="e.g. Europe, Mountains"
            value={destinationPreference}
            onChange={(e) => setDestinationPreference(e.target.value)}
          />
        </div>
      </div>

      <div className="row">
        {/* LANGUAGES */}
        <div className="col-md-6 mb-4">
          <label className="form-label fw-bold">Languages (comma-separated)</label>
          <input
            type="text"
            className="form-control profile-input"
            placeholder="e.g. English, Spanish, Hindi"
            value={languages}
            onChange={(e) => setLanguages(e.target.value)}
          />
        </div>

        {/* VISITED PLACES */}
        <div className="col-md-6 mb-4">
          <label className="form-label fw-bold">Visited Places (comma-separated)</label>
          <input
            type="text"
            className="form-control profile-input"
            placeholder="e.g. Paris, Tokyo, Goa"
            value={visitedPlaces}
            onChange={(e) => setVisitedPlaces(e.target.value)}
          />
        </div>
      </div>

      <h5 className="mt-4 mb-3 text-warning fw-bold">Social Media Handles & Links</h5>
      <div className="row">
        {/* INSTAGRAM */}
        <div className="col-md-6 mb-4">
          <label className="form-label fw-bold">Instagram Username</label>
          <input
            type="text"
            className="form-control profile-input"
            placeholder="username"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
          />
        </div>

        {/* WEBSITE */}
        <div className="col-md-6 mb-4">
          <label className="form-label fw-bold">Website URL</label>
          <input
            type="url"
            className="form-control profile-input"
            placeholder="https://yourwebsite.com"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>
      </div>

      <div className="row">
        {/* GITHUB */}
        <div className="col-md-6 mb-4">
          <label className="form-label fw-bold">GitHub Username</label>
          <input
            type="text"
            className="form-control profile-input"
            placeholder="username"
            value={github}
            onChange={(e) => setGithub(e.target.value)}
          />
        </div>

        {/* LINKEDIN */}
        <div className="col-md-6 mb-4">
          <label className="form-label fw-bold">LinkedIn Username</label>
          <input
            type="text"
            className="form-control profile-input"
            placeholder="username"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
          />
        </div>
      </div>

      {/* IMAGE */}
      <div className="mb-4">
        <label className="form-label fw-bold">Upload Profile Image</label>
        <input
          type="file"
          className="form-control profile-input"
          onChange={(e) => setImage(e.target.files[0])}
        />
      </div>

      {/* BUTTON */}
      <button
        onClick={updateProfile}
        className="btn btn-warning px-5 py-3 mt-3 w-100"
        style={{ fontWeight: "700" }}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Profile 🚀"}
      </button>
    </div>
  );
}

export default ProfileForm;
