import { Link } from "react-router-dom";

function EmptyState({ title = "No blogs found", description = "Be the first to share your travel journal with the community!", actionLink, actionText }) {
  return (
    <div
      className="glass-card text-center p-5 mx-auto my-5 border border-secondary border-opacity-25"
      style={{ maxWidth: "550px", borderRadius: "20px", background: "rgba(255,255,255,0.02)" }}
    >
      <div className="display-1 mb-4 text-warning" style={{ opacity: 0.7 }}>
        📝
      </div>
      <h3 className="fw-bold mb-2.5 text-light">{title}</h3>
      <p className="text-secondary mb-4 small" style={{ lineHeight: "1.5" }}>
        {description}
      </p>
      {actionLink && actionText && (
        <Link to={actionLink} className="btn btn-warning px-4 fw-bold shadow-sm" style={{ borderRadius: "8px" }}>
          {actionText}
        </Link>
      )}
    </div>
  );
}

export default EmptyState;
