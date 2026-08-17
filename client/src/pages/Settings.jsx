import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaShieldAlt,
  FaBell,
  FaCog,
  FaRobot,
  FaQuestionCircle,
  FaExclamationTriangle,
  FaCheckCircle,
  FaChevronDown,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";
import API from "../services/api";
import toast from "react-hot-toast";

const ToggleSwitch = ({ checked, onChange, id, label }) => (
  <div className="d-flex align-items-center justify-content-between w-100 mb-3 py-2">
    <label className="form-check-label text-light" htmlFor={id} style={{ cursor: "pointer", userSelect: "none" }}>{label}</label>
    <div 
      className={`position-relative rounded-pill transition-all ${checked ? 'bg-warning' : 'bg-secondary bg-opacity-25'}`}
      style={{ width: "48px", height: "24px", cursor: "pointer", flexShrink: 0 }}
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      id={id}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange(!checked); } }}
    >
      <div 
        className={`position-absolute bg-white rounded-circle transition-all`}
        style={{
          width: "20px", 
          height: "20px", 
          top: "2px",
          left: checked ? "26px" : "2px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
        }}
      />
    </div>
  </div>
);

const CustomSelect = ({ value, onChange, options, label }) => (
  <div className="mb-4 max-w-sm">
    <label className="form-label text-secondary small mb-2">{label}</label>
    <div className="position-relative">
      <select 
        className="form-select w-100 bg-dark text-light border border-secondary border-opacity-25 rounded-3 px-3 py-2 custom-select-focus"
        style={{ cursor: "pointer", appearance: "none", WebkitAppearance: "none", outline: "none", boxShadow: "none" }}
        value={value} 
        onChange={e => onChange(e.target.value)}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-dark text-light">{opt.label}</option>
        ))}
      </select>
      <FaChevronDown className="position-absolute text-secondary" style={{ right: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: "12px" }} />
    </div>
  </div>
);

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("account");
  const [loading, setLoading] = useState(false);

  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailData, setEmailData] = useState({ currentPassword: "", newEmail: "", otp: "" });
  const [emailStage, setEmailStage] = useState(0); // 0: input, 1: verify
  const [blockData, setBlockData] = useState({ targetId: "" });
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [isOAuthUser, setIsOAuthUser] = useState(false);
  const [isAccountDeleted, setIsAccountDeleted] = useState(false);

  // Preferences State
  const [notificationPreferences, setNotificationPreferences] = useState({
    friendRequests: true, messages: true, tripUpdates: true, reviews: true, importantAccountAlerts: true, pushNotifications: false, emailAlerts: true
  });
  const [privacyPreferences, setPrivacyPreferences] = useState({ privateProfile: false });
  const [aiPreferences, setAiPreferences] = useState({ useTravelPreferences: true });

  // App Preferences
  const [appTheme, setAppTheme] = useState(localStorage.getItem("appTheme") || "dark");
  const [distanceUnit, setDistanceUnit] = useState(localStorage.getItem("distanceUnit") || "km");
  const [currency, setCurrency] = useState(localStorage.getItem("currency") || "usd");

  useEffect(() => {
    fetchProfilePreferences();
  }, []);

  const fetchProfilePreferences = async () => {
    try {
      const res = await API.get("/profile");
      const user = res.data.user || res.data;
      if (user.notificationPreferences) setNotificationPreferences(user.notificationPreferences);
      if (user.privacyPreferences) setPrivacyPreferences(user.privacyPreferences);
      if (user.aiPreferences) setAiPreferences(user.aiPreferences);
      
      if (user.profileImage && user.profileImage.includes("googleusercontent")) {
        setIsOAuthUser(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile data");
    }
  };

  const savePreferences = async (updates) => {
    try {
      await API.put("/settings/preferences", updates);
      toast.success("Preferences saved successfully");
    } catch (err) {
      toast.error("Failed to save preferences");
    }
  };

  useEffect(() => {
    if (activeTab === "safety") {
      fetchBlockedUsers();
    }
  }, [activeTab]);

  const fetchBlockedUsers = async () => {
    try {
      const res = await API.get("/settings/blocked-users");
      if (res.data.success) {
        setBlockedUsers(res.data.blockedUsers);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9]).{6,}$/;
    if (!passwordRegex.test(passwordData.newPassword)) {
      toast.error("Password must be at least 6 characters and contain at least one uppercase letter and one number");
      return;
    }
    setLoading(true);
    try {
      const res = await API.post("/settings/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (res.data.success) {
        toast.success("Password updated successfully");
        setPasswordData({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/settings/change-email/request", {
        currentPassword: emailData.currentPassword,
        newEmail: emailData.newEmail
      });
      if (res.data.success) {
        toast.success("OTP sent to your new email. Please verify.");
        setEmailStage(1);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to request email change");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/settings/change-email/verify", {
        otp: emailData.otp
      });
      if (res.data.success) {
        toast.success("Email updated successfully");
        setEmailStage(0);
        setEmailData({ currentPassword: "", newEmail: "", otp: "" });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post(`/settings/block/${blockData.targetId}`);
      if (res.data.success) {
        toast.success("User blocked successfully");
        setBlockData({ targetId: "" });
        fetchBlockedUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to block user");
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockUser = async (id) => {
    if (!window.confirm("Are you sure you want to unblock this user?")) return;
    try {
      const res = await API.delete(`/settings/block/${id}`);
      if (res.data.success) {
        toast.success("User unblocked");
        fetchBlockedUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to unblock user");
    }
  };

  const handleClearAIHistory = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await API.delete("/settings/ai/history");
      setSuccessMsg(res.data.message || "AI history cleared successfully");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to clear AI history");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAllDevices = async (e) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to log out from all devices? You will be logged out of this device immediately.")) {
      return;
    }
    
    try {
      setLoading(true);
      await API.post("/settings/logout-all-devices");
      
      // On success, clear local token and redirect
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } catch (err) {
      setError(err.response?.data?.error || "Failed to logout from all devices");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateAccount = async (e) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to deactivate your account? Your profile will be hidden and you will be logged out. You can reactivate at any time by logging back in.")) {
      return;
    }
    
    try {
      setLoading(true);
      await API.post("/settings/deactivate");
      
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } catch (err) {
      setError(err.response?.data?.error || "Failed to deactivate account");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!window.confirm("Delete my account? This action is permanent and cannot be undone.")) {
      return;
    }
    
    try {
      setLoading(true);
      await API.delete("/settings/account");
      
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsAccountDeleted(true);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  const handleAppPrefChange = (key, value) => {
    localStorage.setItem(key, value);
    if (key === "appTheme") setAppTheme(value);
    if (key === "distanceUnit") setDistanceUnit(value);
    if (key === "currency") setCurrency(value);
    toast.success("App preference saved locally");
  };

  const tabs = [
    { id: "account", label: "Account", icon: <FaUser /> },
    { id: "privacy", label: "Privacy & Security", icon: <FaShieldAlt /> },
    { id: "safety", label: "Safety", icon: <FaShieldAlt /> },
    { id: "notifications", label: "Notifications", icon: <FaBell /> },
    { id: "ai", label: "TripShare AI", icon: <FaRobot /> },
    { id: "preferences", label: "App Preferences", icon: <FaCog /> },
    { id: "legal", label: "Support & Legal", icon: <FaQuestionCircle /> },
    { id: "danger", label: "Danger Zone", icon: <FaExclamationTriangle className="text-danger" /> },
  ];

  if (isAccountDeleted) {
    return (
      <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
        <div className="card bg-dark border border-secondary border-opacity-25 rounded-4 p-5 max-w-md w-100 text-center animation-fade-in shadow-lg">
          <div className="mb-4">
            <div className="d-inline-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-danger rounded-circle" style={{ width: "80px", height: "80px" }}>
              <FaCheckCircle size={40} />
            </div>
          </div>
          <h3 className="fw-bold text-light mb-3">Account Deleted Successfully</h3>
          <p className="text-secondary mb-4">Your TripShare account has been permanently deleted.</p>
          
          <div className="text-start bg-black bg-opacity-25 rounded-3 p-4 mb-4 border border-secondary border-opacity-10">
            <ul className="text-secondary small mb-0 d-flex flex-column gap-2" style={{ listStyleType: "none", paddingLeft: 0 }}>
              <li><FaCheckCircle className="text-danger me-2" />Your personal account and profile data were deleted.</li>
              <li><FaCheckCircle className="text-danger me-2" />Your AI conversations and personal data were deleted.</li>
              <li><FaCheckCircle className="text-danger me-2" />Your personal content and social activity were deleted.</li>
              <li><FaCheckCircle className="text-danger me-2" />Your active sessions were invalidated.</li>
              <li><FaShieldAlt className="text-success me-2" />Shared/group data was protected.</li>
              <li><FaShieldAlt className="text-success me-2" />Group messages were preserved with your identity anonymized where applicable.</li>
            </ul>
          </div>
          
          <div className="d-flex justify-content-between align-items-center mb-4 px-3">
            <span className="text-secondary small">Status:</span>
            <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-2 rounded-pill">Account permanently deleted</span>
          </div>
          
          <Link to="/login" className="btn btn-outline-light rounded-pill px-5 py-2 w-100 fw-medium hover-bg-light hover-text-dark transition-all">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#0c0c0e", minHeight: "100vh", color: "white", paddingTop: "80px", paddingBottom: "40px" }}>
      <div className="container container-responsive" style={{ maxWidth: "1200px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-warning mb-0">Settings</h2>
          <button className="btn btn-outline-secondary btn-sm btn-responsive rounded-3 px-3 d-lg-none" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>
        
        <div className="row g-4">
          <div className="col-12 col-lg-3">
            <div className="glass-card p-3 rounded-4 border border-secondary border-opacity-20 sticky-top" style={{ background: "rgba(25, 25, 25, 0.45)", backdropFilter: "blur(12px)", top: "100px", zIndex: 1 }}>
              <div className="d-flex flex-row flex-lg-column gap-2 overflow-auto hide-scrollbar pb-2 pb-lg-0">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`btn text-start d-flex align-items-center gap-3 p-3 rounded-3 border-0 transition-all text-nowrap flex-shrink-0 flex-lg-shrink-1 ${activeTab === tab.id ? 'bg-warning text-dark fw-bold shadow-sm' : 'text-light hover-bg-dark'}`}
                    onClick={() => setActiveTab(tab.id)}
                    style={{ background: activeTab === tab.id ? "" : "transparent" }}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-9">
            <div className="glass-card p-4 p-md-5 rounded-4 border border-secondary border-opacity-20 min-vh-50" style={{ background: "rgba(25, 25, 25, 0.45)", backdropFilter: "blur(12px)" }}>

              {activeTab === "account" && (
                <div className="animation-fade-in">
                  <h4 className="fw-bold text-warning mb-4 border-bottom border-secondary border-opacity-20 pb-3">Account Settings</h4>
                  
                  <div className="mb-5">
                    <h6 className="fw-bold mb-3">Profile Information</h6>
                    <p className="text-secondary small mb-4">To update your bio, interests, and profile image, visit your profile page.</p>
                    <Link to="/profile" className="btn btn-outline-warning rounded-pill px-4 py-2 fw-semibold transition-all hover-scale btn-responsive">Go to Profile</Link>
                  </div>

                  <div className="mb-4">
                    <h6 className="fw-bold mb-3">Change Email</h6>
                    {emailStage === 0 ? (
                      <form onSubmit={handleRequestEmail}>
                        <div className="mb-3 max-w-sm">
                          <input type="password" placeholder="Current Password" required className="form-control bg-dark text-light border-secondary border-opacity-25 rounded-3 py-2 px-3 focus-ring-warning" name="emailCurrentPassword" id="emailCurrentPassword" autoComplete="current-password" value={emailData.currentPassword} onChange={e => setEmailData(prev => ({...prev, currentPassword: e.target.value}))} />
                        </div>
                        <div className="mb-4 max-w-sm">
                          <input type="email" placeholder="New Email Address" required className="form-control bg-dark text-light border-secondary border-opacity-25 rounded-3 py-2 px-3 focus-ring-warning" value={emailData.newEmail} onChange={e => setEmailData(prev => ({...prev, newEmail: e.target.value}))} />
                        </div>
                        <button type="submit" className="btn btn-warning rounded-pill px-4 py-2 fw-semibold shadow-sm transition-all hover-scale btn-responsive" disabled={loading}>Request Change</button>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifyEmail} className="animation-fade-in">
                        <div className="p-4 bg-dark bg-opacity-50 border border-warning border-opacity-25 rounded-4 max-w-sm mb-4">
                          <p className="text-warning small mb-3"><FaShieldAlt className="me-2"/>We've sent a secure OTP to <strong>{emailData.newEmail}</strong>. It expires in 10 minutes.</p>
                          <div className="mb-3">
                            <input type="text" placeholder="Enter 6-digit OTP" required className="form-control bg-dark text-light border-warning border-opacity-50 rounded-3 py-2 px-3 focus-ring-warning text-center fw-bold letter-spacing-2" value={emailData.otp} onChange={e => setEmailData({...emailData, otp: e.target.value})} maxLength="6" />
                          </div>
                          <div className="d-flex gap-2">
                            <button type="submit" className="btn btn-warning rounded-pill px-4 flex-grow-1 fw-semibold shadow-sm btn-responsive" disabled={loading}>Verify</button>
                            <button type="button" className="btn btn-outline-secondary rounded-pill px-4 btn-responsive" onClick={() => setEmailStage(0)}>Cancel</button>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "privacy" && (
                <div className="animation-fade-in">
                  <h4 className="fw-bold text-warning mb-4 border-bottom border-secondary border-opacity-20 pb-3">Privacy & Security</h4>
                  <p className="text-secondary small mb-4">Manage who can see your profile and activities.</p>
                  
                  {isOAuthUser ? (
                    <div className="p-4 bg-dark bg-opacity-50 border border-secondary border-opacity-10 rounded-4 mb-4 max-w-md">
                      <h6 className="fw-bold mb-3 d-flex align-items-center gap-2"><FaShieldAlt className="text-warning"/>Password & Security</h6>
                      <p className="text-secondary small mb-0">Your account uses Google Sign-In. Manage your authentication through Google.</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-dark bg-opacity-50 border border-secondary border-opacity-10 rounded-4 mb-4 max-w-md">
                      <h6 className="fw-bold mb-3 d-flex align-items-center gap-2"><FaShieldAlt className="text-warning"/>Password & Security</h6>
                      <form onSubmit={handleChangePassword}>
                        <div className="mb-3 position-relative">
                          <input type={showCurrentPassword ? "text" : "password"} placeholder="Current Password" required className="form-control bg-dark text-light border-secondary border-opacity-25 rounded-3 py-2 px-3 focus-ring-warning" name="currentPassword" id="currentPassword" autoComplete="current-password" value={passwordData.currentPassword} onChange={e => setPasswordData(prev => ({...prev, currentPassword: e.target.value}))} style={{ paddingRight: "40px" }} />
                          <button type="button" className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-secondary text-decoration-none border-0 px-3" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                            {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                        <div className="mb-3 position-relative">
                          <input type={showNewPassword ? "text" : "password"} placeholder="New Password" required className="form-control bg-dark text-light border-secondary border-opacity-25 rounded-3 py-2 px-3 focus-ring-warning" name="newPassword" id="newPassword" autoComplete="new-password" value={passwordData.newPassword} onChange={e => setPasswordData(prev => ({...prev, newPassword: e.target.value}))} style={{ paddingRight: "40px" }} />
                          <button type="button" className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-secondary text-decoration-none border-0 px-3" onClick={() => setShowNewPassword(!showNewPassword)}>
                            {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                        <div className="mb-4 position-relative">
                          <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm New Password" required className="form-control bg-dark text-light border-secondary border-opacity-25 rounded-3 py-2 px-3 focus-ring-warning" name="confirmNewPassword" id="confirmNewPassword" autoComplete="new-password" value={passwordData.confirmNewPassword} onChange={e => setPasswordData(prev => ({...prev, confirmNewPassword: e.target.value}))} style={{ paddingRight: "40px" }} />
                          <button type="button" className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-secondary text-decoration-none border-0 px-3" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                        <button type="submit" className="btn btn-warning rounded-pill px-4 py-2 fw-semibold shadow-sm transition-all hover-scale btn-responsive" disabled={loading}>Update Password</button>
                      </form>
                    </div>
                  )}

                  <div className="p-4 bg-dark bg-opacity-50 border border-secondary border-opacity-10 rounded-4 mb-4 max-w-md">
                    <ToggleSwitch 
                      id="privateProfile"
                      label="Private Profile Visibility"
                      checked={privacyPreferences.privateProfile || false}
                      onChange={(val) => {
                        setPrivacyPreferences({ ...privacyPreferences, privateProfile: val });
                        savePreferences({ privacyPreferences: { ...privacyPreferences, privateProfile: val } });
                      }}
                    />
                    <p className="text-secondary small mb-0 mt-2"><FaExclamationTriangle className="me-2 text-warning opacity-75"/>This feature will be fully activated in a future platform update.</p>
                  </div>
                  
                  <div className="p-4 bg-dark bg-opacity-50 border border-secondary border-opacity-10 rounded-4 mt-4 max-w-md">
                    <h6 className="fw-bold mb-3">Session Management</h6>
                    <button onClick={handleLogoutAllDevices} disabled={loading} className="btn btn-outline-danger rounded-pill px-4 d-flex align-items-center gap-2 btn-responsive">
                      Logout from all devices
                    </button>
                    <p className="text-secondary small mt-3 mb-0">This will instantly sign you out of all active sessions, including this one.</p>
                  </div>
                </div>
              )}

              {activeTab === "safety" && (
                <div className="animation-fade-in">
                  <h4 className="fw-bold text-warning mb-4 border-bottom border-secondary border-opacity-20 pb-3">Safety</h4>
                  
                  <div className="mb-5">
                    <h6 className="fw-bold mb-3">Block User</h6>
                    <p className="text-secondary small mb-3">Blocked users cannot view your profile or message you.</p>
                    <form onSubmit={handleBlockUser} className="d-flex flex-column flex-sm-row gap-2 max-w-sm">
                      <input type="text" placeholder="Paste User ID here" required className="form-control bg-dark text-light border-secondary border-opacity-25 rounded-3 py-2 px-3 focus-ring-danger" value={blockData.targetId} onChange={e => setBlockData({ targetId: e.target.value})} />
                      <button type="submit" className="btn btn-danger rounded-3 px-4 fw-semibold transition-all hover-scale btn-responsive" disabled={loading}>Block</button>
                    </form>
                  </div>

                  <div>
                    <h6 className="fw-bold mb-4">Blocked Users</h6>
                    {blockedUsers.length === 0 ? (
                      <div className="p-4 bg-dark bg-opacity-25 border border-secondary border-opacity-10 rounded-4 text-center max-w-md">
                        <p className="text-secondary small mb-0">You haven't blocked anyone.</p>
                      </div>
                    ) : (
                      <div className="d-flex flex-column gap-3 max-w-md">
                        {blockedUsers.map(user => (
                          <div key={user._id} className="d-flex justify-content-between align-items-center p-3 bg-dark bg-opacity-50 rounded-4 border border-secondary border-opacity-10 transition-all hover-border-warning">
                            <div className="d-flex align-items-center gap-3">
                              {user.profileImage ? (
                                <img src={user.profileImage} alt={user.name} className="rounded-circle object-fit-cover" style={{ width: "40px", height: "40px" }} />
                              ) : (
                                <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}><FaUser className="text-light"/></div>
                              )}
                              <span className="fw-semibold">{user.name}</span>
                            </div>
                            <button className="btn btn-sm btn-outline-warning rounded-pill px-3 transition-all hover-scale btn-responsive" onClick={() => handleUnblockUser(user._id)}>Unblock</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="animation-fade-in">
                  <h4 className="fw-bold text-warning mb-4 border-bottom border-secondary border-opacity-20 pb-3">Notification Preferences</h4>
                  <p className="text-secondary small mb-4">Toggle the alerts you wish to receive. Preferences apply immediately.</p>
                  
                  <div className="p-4 bg-dark bg-opacity-50 border border-secondary border-opacity-10 rounded-4 max-w-md">
                    {[
                      { key: "friendRequests", label: "Friend Requests" },
                      { key: "messages", label: "Messages" },
                      { key: "tripUpdates", label: "Trip Updates" },
                      { key: "reviews", label: "Reviews" },
                      { key: "importantAccountAlerts", label: "Important Account Alerts" },
                      { key: "pushNotifications", label: "Push Notifications" },
                      { key: "emailAlerts", label: "Email Notifications" }
                    ].map((pref, idx, arr) => (
                      <div key={idx} className={`${idx !== arr.length - 1 ? 'border-bottom border-secondary border-opacity-10 mb-3' : ''}`}>
                        <ToggleSwitch 
                          id={pref.key}
                          label={pref.label}
                          checked={notificationPreferences[pref.key] || false}
                          onChange={(val) => {
                            const updated = { ...notificationPreferences, [pref.key]: val };
                            setNotificationPreferences(updated);
                            savePreferences({ notificationPreferences: updated });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "ai" && (
                <div className="animation-fade-in">
                  <h4 className="fw-bold text-warning mb-4 border-bottom border-secondary border-opacity-20 pb-3">TripShare AI</h4>
                  <p className="text-secondary small mb-4">Manage your interactions with the AI travel buddy.</p>
                  
                  <div className="p-4 bg-dark bg-opacity-50 border border-secondary border-opacity-10 rounded-4 max-w-md mb-5">
                    <ToggleSwitch 
                      id="aiContext"
                      label="Use Travel Preferences for AI Context"
                      checked={aiPreferences.useTravelPreferences || false}
                      onChange={(val) => {
                        setAiPreferences({ ...aiPreferences, useTravelPreferences: val });
                        savePreferences({ aiPreferences: { ...aiPreferences, useTravelPreferences: val } });
                      }}
                    />
                    <p className="text-secondary small mb-0 mt-2">Allows the AI to provide personalized recommendations based on your profile.</p>
                  </div>

                  <div className="p-4 bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded-4 max-w-md">
                    <h6 className="fw-bold text-danger mb-3">Clear AI History</h6>
                    <p className="text-danger text-opacity-75 small mb-4">Permanently deletes all your AI chat history. This action cannot be undone.</p>
                    <button className="btn btn-outline-danger rounded-pill px-4 fw-semibold transition-all hover-scale btn-responsive" onClick={handleClearAIHistory} disabled={loading}>
                      Delete Conversation History
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "preferences" && (
                <div className="animation-fade-in">
                  <h4 className="fw-bold text-warning mb-4 border-bottom border-secondary border-opacity-20 pb-3">App Preferences</h4>
                  
                  <div className="p-4 bg-dark bg-opacity-50 border border-secondary border-opacity-10 rounded-4 max-w-md">
                    <CustomSelect 
                      label="Theme (Local Storage)"
                      value={appTheme}
                      onChange={val => handleAppPrefChange("appTheme", val)}
                      options={[
                        { value: "dark", label: "Dark (Premium)" },
                        { value: "light", label: "Light" }
                      ]}
                    />

                    <CustomSelect 
                      label="Distance Units"
                      value={distanceUnit}
                      onChange={val => handleAppPrefChange("distanceUnit", val)}
                      options={[
                        { value: "km", label: "Kilometers (km)" },
                        { value: "mi", label: "Miles (mi)" }
                      ]}
                    />

                    <CustomSelect 
                      label="Currency"
                      value={currency}
                      onChange={val => handleAppPrefChange("currency", val)}
                      options={[
                        { value: "usd", label: "USD ($)" },
                        { value: "eur", label: "EUR (€)" },
                        { value: "inr", label: "INR (₹)" }
                      ]}
                    />
                  </div>
                </div>
              )}

              {activeTab === "legal" && (
                <div className="animation-fade-in">
                  <h4 className="fw-bold text-warning mb-4 border-bottom border-secondary border-opacity-20 pb-3">Support & Legal</h4>
                  
                  <div className="d-flex flex-column gap-3 max-w-md">
                    <Link to="/contact" className="text-light text-decoration-none p-3 bg-dark bg-opacity-50 rounded-4 border border-secondary border-opacity-10 hover-bg-dark transition-all d-flex justify-content-between align-items-center">
                      <span>Contact Support</span>
                      <FaChevronDown style={{ transform: "rotate(-90deg)" }} className="text-secondary small"/>
                    </Link>
                    <Link to="/terms" className="text-light text-decoration-none p-3 bg-dark bg-opacity-50 rounded-4 border border-secondary border-opacity-10 hover-bg-dark transition-all d-flex justify-content-between align-items-center">
                      <span>Terms & Conditions</span>
                      <FaChevronDown style={{ transform: "rotate(-90deg)" }} className="text-secondary small"/>
                    </Link>
                    <Link to="/privacy" className="text-light text-decoration-none p-3 bg-dark bg-opacity-50 rounded-4 border border-secondary border-opacity-10 hover-bg-dark transition-all d-flex justify-content-between align-items-center">
                      <span>Privacy Policy</span>
                      <FaChevronDown style={{ transform: "rotate(-90deg)" }} className="text-secondary small"/>
                    </Link>
                    <Link to="/community-guidelines" className="text-light text-decoration-none p-3 bg-dark bg-opacity-50 rounded-4 border border-secondary border-opacity-10 hover-bg-dark transition-all d-flex justify-content-between align-items-center">
                      <span>Community Guidelines</span>
                      <FaChevronDown style={{ transform: "rotate(-90deg)" }} className="text-secondary small"/>
                    </Link>
                    <Link to="/traveler-safety" className="text-light text-decoration-none p-3 bg-dark bg-opacity-50 rounded-4 border border-secondary border-opacity-10 hover-bg-dark transition-all d-flex justify-content-between align-items-center">
                      <span>Traveler Safety Guidelines</span>
                      <FaChevronDown style={{ transform: "rotate(-90deg)" }} className="text-secondary small"/>
                    </Link>
                    <Link to="/ai-policy" className="text-light text-decoration-none p-3 bg-dark bg-opacity-50 rounded-4 border border-secondary border-opacity-10 hover-bg-dark transition-all d-flex justify-content-between align-items-center">
                      <span>AI Usage Policy</span>
                      <FaChevronDown style={{ transform: "rotate(-90deg)" }} className="text-secondary small"/>
                    </Link>
                  </div>
                </div>
              )}

              {activeTab === "danger" && (
                <div className="animation-fade-in">
                  <h4 className="fw-bold text-danger mb-4 border-bottom border-danger border-opacity-20 pb-3">Danger Zone</h4>
                  <p className="text-secondary small mb-4">Proceed with caution. These actions impact your account access and data.</p>
                  
                  <div className="p-4 bg-dark bg-opacity-50 border border-secondary border-opacity-25 rounded-4 mb-4 max-w-md position-relative overflow-hidden">
                    <div className="d-flex flex-column gap-2">
                      <h6 className="fw-bold text-light mb-1">Deactivate Account</h6>
                      <p className="text-secondary small mb-3">Temporarily hide your profile and pause notifications. You can reactivate at any time by logging back in.</p>
                      <button onClick={handleDeactivateAccount} disabled={loading} className="btn btn-outline-warning rounded-pill px-4 align-self-start btn-responsive">
                        Deactivate
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded-4 max-w-md">
                    <div className="d-flex flex-column gap-2">
                      <h6 className="fw-bold text-danger mb-1">Delete Account</h6>
                      <p className="text-danger text-opacity-75 small mb-3">Permanently delete your account and all associated data including trips, reviews, and messages. This cannot be undone.</p>
                      <button onClick={handleDeleteAccount} disabled={loading} className="btn btn-danger rounded-pill px-4 align-self-start opacity-75 btn-responsive">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .hover-bg-dark:hover { background: rgba(255, 255, 255, 0.05) !important; }
        .hover-border-warning:hover { border-color: rgba(255, 193, 7, 0.5) !important; }
        .hover-scale:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
        .transition-all { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .max-w-sm { max-width: 400px; }
        .max-w-md { max-width: 600px; }
        .focus-ring-warning:focus { border-color: #ffc107 !important; box-shadow: 0 0 0 0.25rem rgba(255, 193, 7, 0.25) !important; outline: none; }
        .focus-ring-danger:focus { border-color: #dc3545 !important; box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25) !important; outline: none; }
        .custom-select-focus:focus { border-color: #ffc107 !important; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .letter-spacing-2 { letter-spacing: 2px; }
        .animation-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Settings;
