import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import Avatar from "../components/shared/Avatar";
import FollowModal from "../components/profile/FollowModal";

function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalUsers, setModalUsers] = useState([]);

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );
  const isSelf = userId === currentUser._id;

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const res = await API.get(`/api/profile/public/${userId}`);
      setUser(res.data);
      setIsFollowing(res.data.isFollowing || false);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async () => {
    try {
      const token = localStorage.getItem("token");
      await API.post(
        "/api/friends/request",
        { receiver: userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Friend Request Sent 🤝");
    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.message || "Request Failed");
    }
  };

  const toggleFollow = async () => {
    try {
      const endpoint = isFollowing
        ? `/api/profile/unfollow/${userId}`
        : `/api/profile/follow/${userId}`;
      await API.post(endpoint);
      setIsFollowing(!isFollowing);
      // Refresh to update followers count
      fetchProfile();
    } catch (err) {
      console.log(err);
    }
  };

  // FOLLOWERS MODAL OPEN
  const openFollowers = async () => {
    try {
      const res = await API.get(`/api/profile/followers/${userId}`);
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
      const res = await API.get(`/api/profile/following/${userId}`);
      setModalUsers(res.data);
      setModalTitle("Following");
      setModalOpen(true);
    } catch (err) {
      console.log(err);
    }
  };

  const getTrustScoreColor = (score) => {
    if (score >= 80) return "success";
    if (score >= 50) return "warning";
    return "danger";
  };

  const getTrustScoreLabel = (score) => {
    if (score >= 80) return "Highly Trustworthy 🏆";
    if (score >= 50) return "Good Trust 👍";
    return "New Traveler";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center text-light bg-black">
        <div className="text-center">
          <div className="spinner-border text-warning mb-3" />
          <h4>Loading Traveler Profile...</h4>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center text-light bg-black">
        <div className="text-center">
          <h2>Traveler Not Found</h2>
          <button className="btn btn-warning mt-3" onClick={() => navigate("/")}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const stats = user.stats || {};

  return (
    <div className="dashboard-page min-vh-100 text-light py-5" style={{ background: "#111" }}>
      <div className="container">
        {/* PROFILE HEADER HERO CARD */}
        <div className="glass-card p-4 p-md-5 mb-4 text-center position-relative overflow-hidden">
          {/* COVER DECORATION */}
          <div
            style={{
              height: "150px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #fb8500, #ffb703)",
              marginBottom: "-75px",
            }}
          />

          <Avatar
            src={user.profileImage}
            alt="profile"
            className="shadow-lg border border-5 border-dark position-relative"
            size={150}
            style={{ zIndex: 2 }}
          />

          <h1 className="mt-4 fw-bold mb-1">
            {user.name}
            {user.isVerified && (
              <span className="ms-2 badge bg-success fs-6 align-middle">
                ✓ Verified
              </span>
            )}
          </h1>
          <p className="text-secondary">{user.email}</p>

          {/* SOCIAL ACTIONS BUTTONS */}
          <div className="d-flex justify-content-center gap-3 mt-4 flex-wrap">
            {isSelf ? (
              <Link to="/profile" className="btn btn-warning px-4 py-2 fw-semibold">
                👤 Edit Profile
              </Link>
            ) : (
              <>
                <button
                  className={`btn ${isFollowing ? "btn-outline-warning" : "btn-warning"} px-4 py-2 fw-semibold`}
                  onClick={toggleFollow}
                >
                  {isFollowing ? "👤 Unfollow" : "👤 Follow"}
                </button>
                <button
                  className="btn px-4 py-2 fw-semibold text-white border"
                  style={{ background: "rgba(255, 183, 3, 0.15)", borderColor: "rgba(255,183,3,0.3)" }}
                  onClick={sendFriendRequest}
                >
                  🤝 Send Friend Request
                </button>
              </>
            )}
            <button
              className="btn btn-outline-light px-4 py-2"
              onClick={() => navigate(`/reviews/${userId}`)}
            >
              ⭐ View All Reviews
            </button>
          </div>
        </div>

        {/* STATS AND TRUST GRID */}
        <div className="row g-4 mb-4">
          {/* STATS ENGINE SECTION */}
          <div className="col-lg-8">
            <div className="glass-card p-4 h-100">
              <h4 className="fw-bold mb-4 text-warning">📊 Traveler Statistics</h4>
              <div className="row g-3 text-center">
                <div className="col-4 col-md-3">
                  <div className="p-3 bg-dark rounded border border-secondary" style={{ background: "#1a1a1a" }}>
                    <h3 className="m-0 text-white fw-bold">{stats.friendsCount || 0}</h3>
                    <small className="text-secondary">Friends</small>
                  </div>
                </div>
                <div className="col-4 col-md-3" style={{ cursor: "pointer" }} onClick={openFollowers}>
                  <div className="p-3 bg-dark rounded border border-secondary" style={{ background: "#1a1a1a" }}>
                    <h3 className="m-0 text-white fw-bold">{stats.followersCount || 0}</h3>
                    <small className="text-secondary text-decoration-underline">Followers</small>
                  </div>
                </div>
                <div className="col-4 col-md-3" style={{ cursor: "pointer" }} onClick={openFollowing}>
                  <div className="p-3 bg-dark rounded border border-secondary" style={{ background: "#1a1a1a" }}>
                    <h3 className="m-0 text-white fw-bold">{stats.followingCount || 0}</h3>
                    <small className="text-secondary text-decoration-underline">Following</small>
                  </div>
                </div>
                <div className="col-4 col-md-3">
                  <div className="p-3 bg-dark rounded border border-secondary" style={{ background: "#1a1a1a" }}>
                    <h3 className="m-0 text-white fw-bold">{stats.tripsCreated || 0}</h3>
                    <small className="text-secondary">Trips Created</small>
                  </div>
                </div>
                <div className="col-4 col-md-3">
                  <div className="p-3 bg-dark rounded border border-secondary" style={{ background: "#1a1a1a" }}>
                    <h3 className="m-0 text-white fw-bold">{stats.tripsJoined || 0}</h3>
                    <small className="text-secondary">Trips Joined</small>
                  </div>
                </div>
                <div className="col-4 col-md-3">
                  <div className="p-3 bg-dark rounded border border-secondary" style={{ background: "#1a1a1a" }}>
                    <h3 className="m-0 text-white fw-bold">{stats.reviewsCount || 0}</h3>
                    <small className="text-secondary">Reviews</small>
                  </div>
                </div>
                <div className="col-4 col-md-3">
                  <div className="p-3 bg-dark rounded border border-secondary" style={{ background: "#1a1a1a" }}>
                    <h3 className="m-0 text-warning fw-bold">{user.travelStyle || "Explorer"}</h3>
                    <small className="text-secondary">Travel Style</small>
                  </div>
                </div>
                <div className="col-4 col-md-3">
                  <div className="p-3 bg-dark rounded border border-secondary" style={{ background: "#1a1a1a" }}>
                    <h3 className="m-0 text-info fw-bold">{user.personality || "Flexible"}</h3>
                    <small className="text-secondary">Personality</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TRUST SCORE & PROFILE COMPLETION SECTION */}
          <div className="col-lg-4">
            <div className="glass-card p-4 h-100 d-flex flex-column justify-content-between">
              <div>
                <h4 className="fw-bold mb-3 text-warning">🏆 Community Standing</h4>

                {/* Trust Score */}
                <div className="mb-4 bg-black p-3 rounded" style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-semibold">Trust Score</span>
                    <span className={`fw-bold text-${getTrustScoreColor(stats.trustScore || 10)}`} style={{ fontSize: "20px" }}>
                      {stats.trustScore || 10}/100
                    </span>
                  </div>
                  <span className="text-secondary" style={{ fontSize: "12px" }}>
                    Status: {getTrustScoreLabel(stats.trustScore || 10)}
                  </span>
                </div>

                {/* Completion Percentage */}
                <div className="bg-black p-3 rounded" style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-semibold">Profile Completion</span>
                    <span className="fw-bold text-warning">{stats.profileCompletion || 0}%</span>
                  </div>
                  <div className="progress" style={{ height: "8px", background: "#333" }}>
                    <div
                      className="progress-bar bg-warning"
                      style={{ width: `${stats.profileCompletion || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN INFO SECTION */}
        <div className="row g-4">
          {/* PROFILE DETAILS (BIO, STYLE, DETAILS) */}
          <div className="col-lg-8">
            <div className="glass-card p-4 mb-4">
              <h4 className="fw-bold mb-3 text-warning">👤 About Traveler</h4>
              <p style={{ lineHeight: "1.6", whiteSpace: "pre-line" }}>
                {user.bio || "This traveler has not written a bio yet."}
              </p>

              <hr className="my-4" />

              <h4 className="fw-bold mb-3 text-warning">📍 Details</h4>
              <div className="row g-3">
                <div className="col-md-6">
                  <strong>Location: </strong> {user.location || "Not Provided"}
                </div>
                <div className="col-md-6">
                  <strong>Preferred Destination: </strong> {user.destinationPreference || "Not Provided"}
                </div>
              </div>

              <h5 className="fw-bold mt-4 mb-2">Languages</h5>
              <div className="d-flex flex-wrap gap-2">
                {user.languages && user.languages.length > 0 ? (
                  user.languages.map((lang, idx) => (
                    <span key={idx} className="badge bg-info text-dark">
                      {lang}
                    </span>
                  ))
                ) : (
                  <span className="text-secondary">No languages added.</span>
                )}
              </div>

              <h5 className="fw-bold mt-4 mb-2">Interests</h5>
              <div className="d-flex flex-wrap gap-2">
                {user.interests && user.interests.length > 0 ? (
                  user.interests.map((interest, idx) => (
                    <span key={idx} className="badge bg-warning text-dark">
                      {interest}
                    </span>
                  ))
                ) : (
                  <span className="text-secondary">No interests added.</span>
                )}
              </div>

              <h5 className="fw-bold mt-4 mb-2">Visited Places</h5>
              <div className="d-flex flex-wrap gap-2">
                {user.visitedPlaces && user.visitedPlaces.length > 0 ? (
                  user.visitedPlaces.map((place, idx) => (
                    <span key={idx} className="badge bg-success">
                      📍 {place}
                    </span>
                  ))
                ) : (
                  <span className="text-secondary">No visited places listed yet.</span>
                )}
              </div>

              {/* SOCIAL LINKS */}
              {(user.instagram || user.website || user.github || user.linkedin) && (
                <>
                  <hr className="my-4" />
                  <h4 className="fw-bold mb-3 text-warning">🔗 Social Networks</h4>
                  <div className="d-flex flex-wrap gap-3">
                    {user.instagram && (
                      <a
                        href={`https://instagram.com/${user.instagram}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline-danger btn-sm px-3"
                      >
                        Instagram
                      </a>
                    )}
                    {user.website && (
                      <a
                        href={user.website}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline-primary btn-sm px-3"
                      >
                        Website
                      </a>
                    )}
                    {user.github && (
                      <a
                        href={`https://github.com/${user.github}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline-light btn-sm px-3"
                      >
                        GitHub
                      </a>
                    )}
                    {user.linkedin && (
                      <a
                        href={`https://linkedin.com/in/${user.linkedin}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline-info btn-sm px-3 text-white"
                      >
                        LinkedIn
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* RECENT TRIPS */}
            <div className="glass-card p-4">
              <h4 className="fw-bold mb-4 text-warning">✈️ Recent Trips</h4>
              {user.recentTrips && user.recentTrips.length > 0 ? (
                <div className="row g-3">
                  {user.recentTrips.map((trip) => (
                    <div className="col-md-6" key={trip._id}>
                      <div
                        className="p-3 rounded border border-secondary h-100 d-flex flex-column justify-content-between"
                        style={{ background: "#181818", border: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        <div>
                          <h5 className="fw-bold mb-1 text-white">{trip.title}</h5>
                          <p className="text-warning mb-2" style={{ fontSize: "14px" }}>
                            📍 {trip.destination}
                          </p>
                          <small className="text-secondary d-block mb-3">
                            📅 {formatDate(trip.startDate)} {trip.endDate ? ` - ${formatDate(trip.endDate)}` : ""}
                          </small>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="badge bg-secondary text-capitalize">{trip.status}</span>
                          <span className="fw-bold text-success">${trip.budget}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-secondary">No recent trips discovered.</p>
              )}
            </div>
          </div>

          {/* RECENT REVIEWS */}
          <div className="col-lg-4">
            <div className="glass-card p-4">
              <h4 className="fw-bold mb-4 text-warning">⭐ Recent Reviews</h4>
              {user.recentReviews && user.recentReviews.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {user.recentReviews.map((review) => (
                    <div
                      key={review._id}
                      className="p-3 rounded border border-secondary"
                      style={{ background: "#181818", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <div className="d-flex align-items-center gap-3 mb-2">
                        <Avatar src={review.reviewer?.profileImage} size={36} />
                        <div>
                          <h6 className="m-0 text-white fw-bold">{review.reviewer?.name || "Traveler"}</h6>
                          <small className="text-secondary" style={{ fontSize: "11px" }}>
                            {formatDate(review.createdAt)}
                          </small>
                        </div>
                      </div>
                      <div className="text-warning mb-2" style={{ fontSize: "14px" }}>
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </div>
                      <p className="m-0 text-secondary" style={{ fontSize: "13px", lineHeight: "1.4" }}>
                        {review.comment || "No comment left."}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-secondary">No reviews submitted yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* MODAL WINDOW */}
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

export default PublicProfile;