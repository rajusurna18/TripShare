function BlogSkeleton({ count = 3 }) {
  return (
    <div className="row g-4">
      {[...Array(count)].map((_, idx) => (
        <div key={idx} className="col-12 col-md-6 col-lg-4">
          <div
            className="glass-card h-100 d-flex flex-column overflow-hidden"
            style={{ borderRadius: "16px", minHeight: "380px" }}
          >
            {/* Cover Image Shimmer */}
            <div
              className="bg-secondary bg-opacity-20 skeleton-shimmer"
              style={{ height: "180px", width: "100%" }}
            />

            {/* Content Shimmer */}
            <div className="p-3.5 d-flex flex-column flex-grow-1 gap-2.5">
              {/* Author Row */}
              <div className="d-flex align-items-center gap-2">
                <div
                  className="bg-secondary bg-opacity-20 rounded-circle skeleton-shimmer"
                  style={{ width: "28px", height: "28px" }}
                />
                <div
                  className="bg-secondary bg-opacity-20 rounded skeleton-shimmer"
                  style={{ width: "80px", height: "12px" }}
                />
                <div
                  className="bg-secondary bg-opacity-20 rounded ms-auto skeleton-shimmer"
                  style={{ width: "60px", height: "12px" }}
                />
              </div>

              {/* Title Shimmer */}
              <div
                className="bg-secondary bg-opacity-20 rounded skeleton-shimmer"
                style={{ width: "90%", height: "20px" }}
              />
              <div
                className="bg-secondary bg-opacity-20 rounded skeleton-shimmer"
                style={{ width: "50%", height: "20px" }}
              />

              {/* Text Excerpt Shimmer */}
              <div
                className="bg-secondary bg-opacity-20 rounded skeleton-shimmer mt-2"
                style={{ width: "100%", height: "12px" }}
              />
              <div
                className="bg-secondary bg-opacity-20 rounded skeleton-shimmer"
                style={{ width: "95%", height: "12px" }}
              />

              {/* Footer Shimmer */}
              <div
                className="bg-secondary bg-opacity-20 rounded skeleton-shimmer mt-auto"
                style={{ width: "100%", height: "14px" }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default BlogSkeleton;
