import { useState, useEffect } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";

function BlogToolbar({ blogId, likesCount, commentsCount, hasLiked: initialHasLiked, onLikeToggle, onOpenComments, onOpenShare, onBack }) {
  const [liked, setLiked] = useState(initialHasLiked);
  const [count, setCount] = useState(likesCount);
  const [loading, setLoading] = useState(false);

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const checkSaved = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await API.get("/blogs/saved", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const savedBlogs = res.data.blogs || [];
        setSaved(savedBlogs.some(b => b._id === blogId));
      } catch (err) {
        console.error("Failed to check saved blogs:", err);
      }
    };
    checkSaved();
  }, [blogId]);

  const handleLike = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const res = await API.post(`/blogs/${blogId}/like`);
      if (res.data.success) {
        setLiked(res.data.liked);
        setCount(res.data.likesCount);
        if (onLikeToggle) {
          onLikeToggle(res.data.liked, res.data.likesCount);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to register like");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToggle = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to bookmark blogs");
      return;
    }
    if (saving) return;
    try {
      setSaving(true);
      if (saved) {
        await API.delete(`/blogs/${blogId}/save`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSaved(false);
        toast.success("Removed from bookmarks");
      } else {
        await API.post(`/blogs/${blogId}/save`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSaved(true);
        toast.success("Saved to bookmarks");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update bookmark");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="position-fixed bottom-0 start-50 translate-middle-x mb-4 px-4 py-3 glass-card d-flex gap-4 align-items-center shadow-lg border border-secondary border-opacity-25"
      style={{
        borderRadius: "50px",
        zIndex: 1000,
        backdropFilter: "blur(20px)",
        background: "rgba(10, 10, 10, 0.8)",
      }}
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="btn btn-link text-white-50 p-0 d-flex align-items-center justify-content-center text-decoration-none border-0"
        title="Back to blogs"
        style={{ fontSize: "1.2rem" }}
      >
        ⬅️
      </button>

      <div className="vr bg-secondary border-opacity-30" style={{ height: "20px" }} />

      {/* Like Button */}
      <button
        onClick={handleLike}
        disabled={loading}
        className={`btn btn-link p-0 d-flex align-items-center gap-2 text-decoration-none border-0 transition-all ${
          liked ? "text-warning fw-bold scale-up" : "text-white-50"
        }`}
        style={{ fontSize: "1rem" }}
      >
        <span>{liked ? "❤️" : "🤍"}</span>
        <span>{count}</span>
      </button>

      {/* Comment Button */}
      <button
        onClick={onOpenComments}
        className="btn btn-link text-white-50 p-0 d-flex align-items-center gap-2 text-decoration-none border-0"
        style={{ fontSize: "1rem" }}
      >
        <span>💬</span>
        <span>{commentsCount}</span>
      </button>

      <div className="vr bg-secondary border-opacity-30" style={{ height: "20px" }} />

      {/* Bookmark Button */}
      <button
        onClick={handleSaveToggle}
        disabled={saving}
        className={`btn btn-link p-0 d-flex align-items-center gap-1 text-decoration-none border-0 hover-warning transition-all ${
          saved ? "text-warning fw-bold" : "text-white-50"
        }`}
        title={saved ? "Bookmarked" : "Bookmark"}
        style={{ fontSize: "1rem" }}
      >
        <span>🔖</span>
        <span className="d-none d-sm-inline">{saved ? "Saved" : "Save"}</span>
      </button>

      {/* Share Button */}
      <button
        onClick={onOpenShare}
        className="btn btn-link text-white-50 p-0 d-flex align-items-center gap-1 text-decoration-none border-0 hover-warning"
        title="Share Post"
        style={{ fontSize: "1rem" }}
      >
        <span>🔗</span>
        <span className="d-none d-sm-inline">Share</span>
      </button>
    </div>
  );
}

export default BlogToolbar;
