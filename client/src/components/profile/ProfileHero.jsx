import { useState, useRef, useEffect } from "react";
import { Camera } from "lucide-react";
import toast from "react-hot-toast";
import Avatar from "../shared/Avatar";

function ProfileHero({
  user,
  completion,
  missingFields = [],
  onFollowersClick,
  onFollowingClick,
  onUploadImage,
}) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Clean up object URL when component unmounts or previewUrl changes
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleAvatarClick = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Accepted format check (JPG/JPEG, PNG, WEBP)
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      toast.error("Please select a valid image file (JPG, PNG, or WEBP)");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Instant local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setUploading(true);

    try {
      if (onUploadImage) {
        await onUploadImage(file);
        toast.success("Profile picture updated");
      }
    } catch (err) {
      console.error("Profile picture upload error:", err);
      setPreviewUrl(null);
      toast.error("Unable to update profile picture. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const currentAvatarSrc = previewUrl || user?.profileImage;

  return (
    <div className="glass-card p-5 mb-5 text-center position-relative overflow-hidden">
      {/* COVER */}
      <div
        style={{
          height: "220px",
          borderRadius: "25px",
          background: "linear-gradient(135deg, #ffb703, #fb8500)",
          marginBottom: "-90px",
        }}
      />

      {/* PROFILE IMAGE AVATAR WRAPPER */}
      <div
        className="profile-avatar-wrapper mx-auto"
        onClick={handleAvatarClick}
        title="Click to update profile picture"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleAvatarClick();
          }
        }}
      >
        <Avatar
          src={currentAvatarSrc}
          alt={user?.name || "profile"}
          className="profile-page-image shadow-lg border border-5 border-dark"
          size={180}
        />

        {/* LOADING OVERLAY */}
        {uploading && (
          <div
            className="position-absolute top-0 start-0 w-100 h-100 rounded-circle d-flex align-items-center justify-content-center"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.65)",
              backdropFilter: "blur(2px)",
              zIndex: 10,
            }}
          >
            <div
              className="spinner-border text-warning"
              role="status"
              style={{ width: "2.2rem", height: "2.2rem", borderWidth: "3px" }}
            >
              <span className="visually-hidden">Uploading...</span>
            </div>
          </div>
        )}

        {/* CAMERA BADGE INDICATOR */}
        {!uploading && (
          <div className="profile-camera-badge" title="Update profile picture">
            <Camera size={18} strokeWidth={2.3} />
          </div>
        )}

        {/* HIDDEN FILE INPUT */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/jpeg,image/jpg,image/png,image/webp"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>


      {/* NAME */}
      <h1 className="fw-bold mt-3">{user?.name}</h1>

      {/* EMAIL */}
      <p className="text-secondary mb-2">{user?.email}</p>

      {/* STATS COUNT */}
      <div className="d-flex flex-wrap justify-content-center gap-4 mt-2 mb-4 text-center">
        <div style={{ cursor: "pointer" }} onClick={onFollowersClick}>
          <span className="text-warning fw-bold d-block" style={{ fontSize: "20px" }}>
            {user?.stats?.followersCount || 0}
          </span>
          <small className="text-secondary text-decoration-underline">Followers</small>
        </div>
        <div style={{ cursor: "pointer" }} onClick={onFollowingClick}>
          <span className="text-warning fw-bold d-block" style={{ fontSize: "20px" }}>
            {user?.stats?.followingCount || 0}
          </span>
          <small className="text-secondary text-decoration-underline">Following</small>
        </div>
        <div>
          <span className="text-warning fw-bold d-block" style={{ fontSize: "20px" }}>
            {user?.stats?.friendsCount || 0}
          </span>
          <small className="text-secondary">Friends</small>
        </div>
      </div>

      {/* BADGES */}
      <div className="d-flex justify-content-center gap-3 flex-wrap mt-4">
        <span className="badge bg-warning text-dark px-4 py-2">
          🌍 {user?.travelStyle || "Explorer"}
        </span>
        {user?.isVerified && (
          <span className="badge bg-success px-4 py-2">
            ⭐ Verified Member
          </span>
        )}
        {completion >= 80 && (
          <span className="badge bg-primary px-4 py-2">
            ✈ AI Match Ready
          </span>
        )}
      </div>

      {/* PROFILE COMPLETION */}
      <div className="mt-5">
        <div className="d-flex justify-content-between mb-2">
          <span>Profile Strength</span>
          <span className="text-warning fw-bold">{completion}%</span>
        </div>
        <div className="progress profile-progress-bar">
          <div
            className="progress-bar bg-warning"
            style={{
              width: `${completion}%`,
            }}
          />
        </div>

        {missingFields && missingFields.length > 0 && (
          <div
            className="mt-3 text-start bg-black p-3 rounded"
            style={{
              border: "1px solid rgba(255, 255, 255, 0.05)",
              background: "#080808",
            }}
          >
            <small className="text-secondary d-block mb-2">
              Missing fields to reach 100% completion:
            </small>
            <div className="d-flex flex-wrap gap-2">
              {missingFields.map((field, idx) => (
                <span
                  key={idx}
                  className="badge bg-secondary"
                  style={{ fontSize: "11px", fontWeight: "normal" }}
                >
                  + {field}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileHero;
