import { Link, useNavigate } from "react-router-dom";
import Avatar from "../shared/Avatar";
import API from "../../services/api";
import toast from "react-hot-toast";

function BlogCard({ blog, currentUserId, onBlogDeleted }) {
  const navigate = useNavigate();
  const isOwner = currentUserId && (blog.author?._id || blog.author) === currentUserId;

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this travel blog post?")) return;

    try {
      const res = await API.delete(`/blogs/${blog._id}`);
      if (res.data.success) {
        toast.success("Blog deleted successfully!");
        if (onBlogDeleted) onBlogDeleted(blog._id);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete blog post");
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/edit-blog/${blog._id}`);
  };

  // Convert rich text content JSON to plain text snippet
  const getExcerpt = (contentStr) => {
    try {
      const blocks = JSON.parse(contentStr);
      let blocksArray = [];
      if (Array.isArray(blocks)) {
        blocksArray = blocks;
      } else if (blocks && typeof blocks === "object" && Array.isArray(blocks.blocks)) {
        blocksArray = blocks.blocks;
      }
      const paragraph = blocksArray.find((b) => b.type === "paragraph");
      if (paragraph && paragraph.data && paragraph.data.text) {
        const clean = paragraph.data.text.replace(/<[^>]*>/g, "");
        return clean.substring(0, 100) + (clean.length > 100 ? "..." : "");
      }
    } catch (e) {
      // ignore
    }
    const clean = contentStr ? contentStr.replace(/<[^>]*>/g, "") : "";
    return clean.substring(0, 100) + (clean.length > 100 ? "..." : "");
  };

  const defaultCover = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=600";
  const coverUrl = blog.coverImage || defaultCover;

  return (
    <div
      className="glass-card h-100 d-flex flex-column overflow-hidden position-relative"
      style={{
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        borderRadius: "16px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Cover Image & Destination */}
      <div className="position-relative overflow-hidden" style={{ height: "180px", background: "#111" }}>
        <img
          src={coverUrl}
          alt={blog.title}
          className="w-100 h-100 object-fit-cover"
          style={{ transition: "transform 0.5s ease" }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />
        <span
          className="position-absolute top-0 end-0 m-3 badge bg-warning text-dark fw-bold px-2.5 py-1.5"
          style={{ borderRadius: "20px", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}
        >
          📍 {blog.destination}
        </span>

        {/* Ownership Controls */}
        {isOwner && (
          <div className="position-absolute top-0 start-0 m-3 d-flex gap-2">
            <button
              onClick={handleEdit}
              className="btn btn-dark btn-sm rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "32px", height: "32px", opacity: 0.9, border: "1px solid rgba(255,255,255,0.1)" }}
              title="Edit Blog"
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-danger btn-sm rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "32px", height: "32px", opacity: 0.9, border: "1px solid rgba(255,255,255,0.1)" }}
              title="Delete Blog"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-3.5 d-flex flex-column flex-grow-1">
        {/* Author details */}
        <div className="d-flex align-items-center gap-2 mb-2.5">
          <Avatar src={blog.author?.profileImage} size={28} className="border border-secondary shadow-sm" />
          <div className="d-flex flex-column">
            <span className="text-white-50 fw-semibold" style={{ fontSize: "0.75rem" }}>
              {blog.author?.name || "Traveler"}
            </span>
          </div>
          <span className="text-secondary ms-auto" style={{ fontSize: "0.7rem" }}>
            ⏱️ {blog.readTime || 1} min read
          </span>
        </div>

        {/* Blog Details */}
        <Link to={`/blog/${blog._id}`} className="text-decoration-none text-light mb-2">
          <h5 className="fw-bold mb-1 hover-warning" style={{ fontSize: "1.1rem", lineHeight: "1.35", transition: "color 0.2s" }}>
            {blog.title}
          </h5>
        </Link>

        <p className="text-secondary small mb-3 flex-grow-1" style={{ fontSize: "0.825rem", lineHeight: "1.4" }}>
          {getExcerpt(blog.content)}
        </p>

        {/* Tags */}
        <div className="d-flex flex-wrap gap-1 mb-3">
          {blog.tags?.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="badge bg-info bg-opacity-10 text-info py-1 px-2 text-lowercase"
              style={{ borderRadius: "6px", fontSize: "0.7rem" }}
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Footer Metrics */}
        <div className="d-flex justify-content-between align-items-center pt-2.5 border-top border-secondary border-opacity-30 text-secondary" style={{ fontSize: "0.75rem" }}>
          <div className="d-flex align-items-center gap-2.5">
            <span title="Views">👁️ {blog.viewsCount || 0}</span>
            <span title="Likes">❤️ {blog.likesCount || 0}</span>
            <span title="Comments">💬 {blog.commentsCount || 0}</span>
          </div>
          <span title="Shares">🔗 {blog.shareCount || 0} shares</span>
        </div>
      </div>
    </div>
  );
}

export default BlogCard;
