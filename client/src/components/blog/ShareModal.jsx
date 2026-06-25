import { useState } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";

function ShareModal({ blogId, blogTitle, onClose, onShareIncrement }) {
  const [loading, setLoading] = useState(false);
  const shareUrl = `${window.location.origin}/blog/${blogId}`;

  const trackShare = async (platform) => {
    try {
      setLoading(true);
      const res = await API.post(`/blogs/${blogId}/share`, { platform });
      if (res.data.success && onShareIncrement) {
        onShareIncrement(res.data.shareCount);
      }
    } catch (err) {
      console.error("Failed to track share statistics", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Article link copied to clipboard!");
      await trackShare("copy_link");
      onClose();
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleWhatsApp = async () => {
    const text = encodeURIComponent(`Check out this travel blog: "${blogTitle}" ✈️\n${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    await trackShare("whatsapp");
    onClose();
  };

  const handleTelegram = async () => {
    const url = encodeURIComponent(shareUrl);
    const text = encodeURIComponent(`Check out this travel blog: "${blogTitle}" ✈️`);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, "_blank");
    await trackShare("telegram");
    onClose();
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ background: "rgba(0,0,0,0.7)", zIndex: 1200 }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "400px" }}
      >
        <div className="modal-content glass-card text-light border border-secondary border-opacity-30" style={{ background: "rgba(20,20,20,0.95)", borderRadius: "16px" }}>
          
          <div className="modal-header border-bottom border-secondary border-opacity-20 pb-2">
            <h5 className="modal-title text-warning fw-bold">Share Travel Story 🔗</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body py-4 text-center">
            <p className="small text-secondary mb-4">Share this journey with other travelers and friends</p>
            
            <div className="d-flex justify-content-center gap-4 mb-4">
              
              {/* WhatsApp */}
              <button
                onClick={handleWhatsApp}
                disabled={loading}
                className="btn btn-outline-success rounded-circle d-flex flex-column align-items-center justify-content-center gap-1.5"
                style={{ width: "70px", height: "70px", border: "1px solid rgba(40, 167, 69, 0.3)" }}
              >
                <span style={{ fontSize: "1.6rem" }}>💬</span>
                <span className="text-light" style={{ fontSize: "0.65rem" }}>WhatsApp</span>
              </button>

              {/* Telegram */}
              <button
                onClick={handleTelegram}
                disabled={loading}
                className="btn btn-outline-info rounded-circle d-flex flex-column align-items-center justify-content-center gap-1.5"
                style={{ width: "70px", height: "70px", border: "1px solid rgba(23, 162, 184, 0.3)" }}
              >
                <span style={{ fontSize: "1.6rem" }}>✈️</span>
                <span className="text-light" style={{ fontSize: "0.65rem" }}>Telegram</span>
              </button>

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                disabled={loading}
                className="btn btn-outline-warning rounded-circle d-flex flex-column align-items-center justify-content-center gap-1.5"
                style={{ width: "70px", height: "70px", border: "1px solid rgba(255, 193, 7, 0.3)" }}
              >
                <span style={{ fontSize: "1.6rem" }}>📋</span>
                <span className="text-light" style={{ fontSize: "0.65rem" }}>Copy Link</span>
              </button>

            </div>

            {/* Direct Input Copy URL */}
            <div className="input-group">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="form-control bg-dark border-secondary border-opacity-50 text-white-50 text-center small py-2"
                style={{ fontSize: "0.8rem", borderRadius: "8px" }}
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;
