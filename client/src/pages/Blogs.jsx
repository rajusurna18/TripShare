import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import BlogCard from "../components/blog/BlogCard";
import BlogSkeleton from "../components/blog/BlogSkeleton";
import EmptyState from "../components/blog/EmptyState";
import toast from "react-hot-toast";

function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Quick Filter tags list
  const popularTags = ["backpacking", "budget", "solo", "adventure", "food", "luxury", "roadtrip"];

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
    fetchTrending();
  }, []);

  useEffect(() => {
    fetchBlogs(page);
  }, [page, selectedTag]);

  const fetchBlogs = async (pageNum = 1) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pageNum,
        limit: 6,
      });

      if (search.trim()) queryParams.append("search", search.trim());
      if (destination.trim()) queryParams.append("destination", destination.trim());
      if (selectedTag) queryParams.append("tag", selectedTag);

      const res = await API.get(`/blogs?${queryParams.toString()}`);
      if (res.data.success) {
        setBlogs(res.data.blogs || []);
        setPage(res.data.page);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load blogs feed");
    } finally {
      setLoading(false);
    }
  };

  const fetchTrending = async () => {
    try {
      setLoadingTrending(true);
      const res = await API.get("/blogs/trending?limit=4");
      if (res.data.success) {
        setTrending(res.data.blogs || []);
      }
    } catch (err) {
      console.error("Failed to load trending blogs", err);
    } finally {
      setLoadingTrending(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBlogs(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setDestination("");
    setSelectedTag("");
    setPage(1);
    // Explicit trigger since selectedTag dependency is reset
    setTimeout(() => {
      fetchBlogs(1);
    }, 50);
  };

  const handleBlogDeleted = (deletedId) => {
    setBlogs(blogs.filter((b) => b._id !== deletedId));
    fetchTrending();
  };

  const currentUserId = currentUser?._id || currentUser?.id;

  return (
    <div className="container py-5 mt-4">
      {/* Header Banner */}
      <div 
        className="glass-card p-5 mb-5 text-center text-md-start d-flex flex-column flex-md-row justify-content-between align-items-center gap-4 position-relative overflow-hidden"
        style={{ borderRadius: "24px", background: "linear-gradient(135deg, rgba(255, 193, 7, 0.05) 0%, rgba(255,255,255,0.02) 100%)" }}
      >
        <div className="position-absolute top-0 end-0 w-50 h-100 bg-warning opacity-5" style={{ transform: "skewX(-30deg) translateX(50px)" }} />
        <div>
          <h1 className="fw-extrabold display-5 mb-2 text-warning">Travel Blogs & Journals ✈️</h1>
          <p className="text-secondary mb-0" style={{ maxWidth: "600px" }}>
            Explore immersive stories, guides, and itineraries written by passionate travelers in the TripShare community.
          </p>
        </div>
        {currentUserId && (
          <Link to="/create-blog" className="btn btn-warning px-4 py-2.5 fw-bold shadow-sm" style={{ borderRadius: "10px" }}>
            ✍️ Write a Story
          </Link>
        )}
      </div>

      <div className="row g-4.5">
        
        {/* Left Side: Filter and Blogs Grid */}
        <div className="col-12 col-lg-8.5 order-2 order-lg-1">
          
          {/* Filters Form */}
          <form onSubmit={handleSearchSubmit} className="glass-card p-4 mb-4.5">
            <div className="row g-3">
              <div className="col-12 col-md-5">
                <input
                  type="text"
                  className="form-control bg-dark border-secondary text-light py-2"
                  placeholder="🔍 Search titles, tags, content..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="col-12 col-md-4">
                <input
                  type="text"
                  className="form-control bg-dark border-secondary text-light py-2"
                  placeholder="📍 Destination (e.g. Kyoto)"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
              <div className="col-12 col-md-3 d-flex gap-2">
                <button type="submit" className="btn btn-warning flex-grow-1 fw-bold">
                  Search
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={handleResetFilters}>
                  Clear
                </button>
              </div>
            </div>

            {/* Quick Tags Filter */}
            <div className="d-flex flex-wrap gap-2 align-items-center mt-3 pt-3 border-top border-secondary border-opacity-20">
              <span className="text-secondary small fw-semibold">Quick Tags:</span>
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
                  className={`btn btn-sm rounded-pill px-2.5 py-1 text-lowercase ${
                    selectedTag === tag ? "btn-warning" : "btn-outline-secondary"
                  }`}
                  style={{ fontSize: "0.75rem" }}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </form>

          {/* Blogs list */}
          {loading ? (
            <BlogSkeleton count={6} />
          ) : blogs.length === 0 ? (
            <EmptyState
              title="No travel stories match your filters"
              description="Try adjusting your keywords or destination filters to browse other articles."
              actionLink={currentUserId ? "/create-blog" : null}
              actionText={currentUserId ? "Write your first story" : null}
            />
          ) : (
            <>
              <div className="row g-4">
                {blogs.map((blog) => (
                  <div key={blog._id} className="col-12 col-md-6">
                    <BlogCard
                      blog={blog}
                      currentUserId={currentUserId}
                      onBlogDeleted={handleBlogDeleted}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center gap-2 mt-5">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    Prev
                  </button>
                  {[...Array(totalPages)].map((_, idx) => (
                    <button
                      key={idx}
                      className={`btn ${page === idx + 1 ? "btn-warning" : "btn-outline-secondary"}`}
                      onClick={() => setPage(idx + 1)}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

        </div>

        {/* Right Side: Sidebar */}
        <div className="col-12 col-lg-3.5 order-1 order-lg-2">
          {/* Trending Blogs list */}
          <div className="glass-card p-4 position-sticky" style={{ top: "90px" }}>
            <h5 className="fw-bold text-warning mb-4.5 d-flex align-items-center gap-2">
              <span>🔥 Trending Journals</span>
            </h5>
            
            {loadingTrending ? (
              <div className="text-center text-secondary py-4">
                <span className="spinner-border spinner-border-sm" role="status"></span>
              </div>
            ) : trending.length === 0 ? (
              <p className="text-secondary small italic text-center">No trending stories yet.</p>
            ) : (
              <div className="d-flex flex-column gap-4">
                {trending.map((blog, idx) => (
                  <div key={blog._id} className="d-flex gap-3 align-items-start pb-3 border-bottom border-secondary border-opacity-20 last-border-0">
                    <span className="fw-extrabold text-warning-50 h4 m-0" style={{ opacity: 0.5 }}>
                      0{idx + 1}
                    </span>
                    <div className="flex-grow-1 min-w-0">
                      <Link to={`/blog/${blog._id}`} className="text-decoration-none text-light hover-warning">
                        <h6 className="fw-bold mb-1 text-truncate" style={{ fontSize: "0.9rem" }}>{blog.title}</h6>
                      </Link>
                      <div className="d-flex justify-content-between align-items-center text-secondary" style={{ fontSize: "0.7rem" }}>
                        <span>👤 {blog.author?.name}</span>
                        <span>❤️ {blog.likesCount || 0} likes</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Blogs;
