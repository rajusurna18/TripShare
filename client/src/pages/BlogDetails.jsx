import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import BlogHero from "../components/blog/BlogHero";
import BlogToolbar from "../components/blog/BlogToolbar";
import BlogCommentDrawer from "../components/blog/BlogCommentDrawer";
import ShareModal from "../components/blog/ShareModal";
import ReadingProgress from "../components/blog/ReadingProgress";
import toast from "react-hot-toast";

function BlogDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/blogs/${id}`);
      if (res.data.success) {
        setBlog(res.data.blog);
        setHasLiked(res.data.hasLiked);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load travel blog");
      navigate("/blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = (liked, likesCount) => {
    setHasLiked(liked);
    setBlog((prev) => ({ ...prev, likesCount }));
  };

  const handleShareIncrement = (shareCount) => {
    setBlog((prev) => ({ ...prev, shareCount }));
  };

  const handleCommentUpdated = () => {
    // Re-fetch blog to update commentsCount cached metric
    API.get(`/blogs/${id}`)
      .then((res) => {
        if (res.data.success) {
          setBlog((prev) => ({
            ...prev,
            commentsCount: res.data.blog.commentsCount
          }));
        }
      })
      .catch(console.error);
  };

  // Block rendering loop
  const renderBlock = (block) => {
    const API_ASSET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

    switch (block.type) {
      case "paragraph":
        return (
          <p key={block.id} className="mb-4 text-white-50 leading-relaxed" style={{ fontSize: "1.05rem" }}>
            {block.data.text}
          </p>
        );

      case "header":
        const HeadingTag = block.data.level === 3 ? "h3" : block.data.level === 4 ? "h4" : "h2";
        return (
          <HeadingTag key={block.id} className="fw-bold text-warning mt-5 mb-3" style={{ letterSpacing: "-0.3px" }}>
            {block.data.text}
          </HeadingTag>
        );

      case "quote":
        return (
          <blockquote 
            key={block.id} 
            className="blockquote border-start border-warning border-4 ps-3 py-1 my-4 bg-dark bg-opacity-20 rounded-end"
            style={{ fontStyle: "italic" }}
          >
            <p className="mb-1 text-light">"{block.data.text}"</p>
            {block.data.caption && (
              <cite className="blockquote-footer text-warning small mt-1">{block.data.caption}</cite>
            )}
          </blockquote>
        );

      case "code":
        return (
          <div key={block.id} className="mb-4">
            {block.data.language && (
              <span className="badge bg-secondary bg-opacity-30 text-white-50 rounded-bottom-0 font-monospace" style={{ fontSize: "0.7rem", borderBottom: "0" }}>
                {block.data.language}
              </span>
            )}
            <pre 
              className={`bg-dark bg-opacity-80 p-3 text-warning border border-secondary border-opacity-30 font-monospace ${block.data.language ? "rounded-end rounded-bottom" : "rounded"}`}
              style={{ fontSize: "0.85rem", overflowX: "auto" }}
            >
              <code>{block.data.text}</code>
            </pre>
          </div>
        );

      case "list":
        const ListTag = block.data.style === "ordered" ? "ol" : "ul";
        return (
          <ListTag key={block.id} className="mb-4 text-white-50 ps-4">
            {block.data.items?.map((item, idx) => (
              <li key={idx} className="mb-1.5" style={{ fontSize: "1.05rem" }}>
                {item}
              </li>
            ))}
          </ListTag>
        );

      case "image":
        const src = block.data.url || (block.data.imageUrl ? (block.data.imageUrl.startsWith("http") ? block.data.imageUrl : `${API_ASSET_URL}/${block.data.imageUrl}`) : "");
        if (!src) return null;
        return (
          <div key={block.id} className="text-center my-5">
            <div className="d-inline-block rounded border border-secondary border-opacity-20 overflow-hidden shadow">
              <img 
                src={src} 
                alt={block.data.caption || "Travel Layout Image"} 
                className="img-fluid" 
                style={{ maxHeight: "500px", objectFit: "cover", display: "block" }} 
              />
            </div>
            {block.data.caption && (
              <p className="text-secondary small mt-2">{block.data.caption}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="container py-5 mt-5 text-center text-warning">
        <span className="spinner-border spinner-border-lg" role="status"></span>
        <p className="mt-3">Loading travel story...</p>
      </div>
    );
  }

  if (!blog) return null;

  // Parse blocks
  let contentBlocks = [];
  try {
    const parsed = JSON.parse(blog.content);
    if (Array.isArray(parsed)) {
      contentBlocks = parsed;
    } else if (parsed && typeof parsed === "object" && Array.isArray(parsed.blocks)) {
      contentBlocks = parsed.blocks;
    } else {
      contentBlocks = [{ id: "b1", type: "paragraph", data: { text: parsed } }];
    }
  } catch (e) {
    contentBlocks = [{ id: "b1", type: "paragraph", data: { text: blog.content } }];
  }

  const blogOwnerId = blog.author?._id || blog.author;

  return (
    <div className="container py-5 mt-4 position-relative" style={{ maxWidth: "860px" }}>
      {/* Sticky Progress Bar */}
      <ReadingProgress />

      {/* Hero Header component */}
      <BlogHero blog={blog} />

      {/* Main Rich text Content */}
      <div className="px-1 px-md-4 mb-5">
        <article className="blog-body text-light">
          {contentBlocks.map((block) => renderBlock(block))}
        </article>
      </div>

      {/* Floating Toolbar component */}
      <BlogToolbar
        blogId={blog._id}
        likesCount={blog.likesCount || 0}
        commentsCount={blog.commentsCount || 0}
        hasLiked={hasLiked}
        onLikeToggle={handleLikeToggle}
        onOpenComments={() => setShowComments(true)}
        onOpenShare={() => setShowShare(true)}
        onBack={() => navigate("/blogs")}
      />

      {/* Comments Drawer component */}
      {showComments && (
        <BlogCommentDrawer
          blogId={blog._id}
          blogOwnerId={blogOwnerId}
          onClose={() => setShowComments(false)}
          onCommentUpdated={handleCommentUpdated}
        />
      )}

      {/* Share Modal component */}
      {showShare && (
        <ShareModal
          blogId={blog._id}
          blogTitle={blog.title}
          onClose={() => setShowShare(false)}
          onShareIncrement={handleShareIncrement}
        />
      )}
    </div>
  );
}

export default BlogDetails;
