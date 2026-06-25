import Avatar from "../shared/Avatar";

function BlogHero({ blog }) {
  const defaultCover = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200";
  const coverUrl = blog.coverImage || defaultCover;
  
  const formattedDate = new Date(blog.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div 
      className="position-relative overflow-hidden mb-5 text-white" 
      style={{ 
        minHeight: "450px", 
        maxHeight: "600px", 
        background: `linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%), url(${coverUrl}) center/cover no-repeat`,
        borderRadius: "24px",
        display: "flex",
        alignItems: "flex-end"
      }}
    >
      {/* Accent Top Border styling */}
      <div 
        className="position-absolute top-0 start-0 w-100 h-100" 
        style={{ 
          background: "radial-gradient(circle at top left, rgba(255, 193, 7, 0.15) 0%, transparent 60%)" 
        }} 
      />

      <div className="p-4 p-md-5 w-100 position-relative z-1">
        <div className="container-fluid p-0">
          
          {/* Destination & Visibility */}
          <div className="d-flex align-items-center gap-2 mb-3">
            <span className="badge bg-warning text-dark fw-bold px-3 py-2" style={{ borderRadius: "20px", fontSize: "0.8rem", letterSpacing: "0.5px" }}>
              📍 {blog.destination}
            </span>
            {blog.visibility !== "public" && (
              <span className="badge bg-dark border border-secondary text-secondary px-2.5 py-1.5" style={{ borderRadius: "20px", fontSize: "0.75rem" }}>
                🔒 {blog.visibility === "followers_only" ? "Followers Only" : "Private"}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="display-4 fw-extrabold mb-3 text-light" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)", lineHeight: "1.2" }}>
            {blog.title}
          </h1>

          {/* Author info and reading time */}
          <div className="d-flex align-items-center flex-wrap gap-3 pb-3 border-bottom border-secondary border-opacity-30">
            <div className="d-flex align-items-center gap-2">
              <Avatar src={blog.author?.profileImage} size={40} className="border border-warning" />
              <div>
                <span className="d-block fw-bold" style={{ fontSize: "0.95rem" }}>
                  {blog.author?.name || "Traveler"}
                </span>
                {blog.author?.travelStyle && (
                  <small className="text-warning" style={{ fontSize: "0.75rem" }}>
                    🎒 {blog.author.travelStyle}
                  </small>
                )}
              </div>
            </div>

            <div className="vr bg-secondary border-opacity-30 d-none d-sm-block" style={{ height: "30px" }} />

            <div className="text-secondary small d-flex align-items-center gap-2">
              <span>📅 {formattedDate}</span>
              <span>•</span>
              <span>⏱️ {blog.readTime || 1} min read</span>
            </div>

            <div className="ms-md-auto d-flex gap-3 text-secondary small flex-wrap">
              <span>👁️ {blog.viewsCount || 0} views</span>
              <span>❤️ {blog.likesCount || 0} likes</span>
              <span>💬 {blog.commentsCount || 0} comments</span>
            </div>
          </div>

          {/* Tags */}
          <div className="d-flex flex-wrap gap-2 mt-3">
            {blog.tags?.map((tag, idx) => (
              <span 
                key={idx} 
                className="badge bg-light bg-opacity-10 text-light border border-secondary border-opacity-30 py-1.5 px-3 text-lowercase"
                style={{ borderRadius: "20px", fontSize: "0.75rem" }}
              >
                #{tag}
              </span>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

export default BlogHero;
