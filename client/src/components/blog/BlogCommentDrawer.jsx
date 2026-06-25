import { useState, useEffect } from "react";
import API from "../../services/api";
import Avatar from "../shared/Avatar";
import toast from "react-hot-toast";

function BlogCommentDrawer({ blogId, onClose, onCommentUpdated, blogOwnerId }) {
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null); // { commentId, userName }
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
    fetchComments(1, true);
  }, [blogId]);

  const fetchComments = async (pageNum = 1, replace = false) => {
    try {
      setLoading(true);
      const res = await API.get(`/blogs/${blogId}/comments?page=${pageNum}&limit=10`);
      if (res.data.success) {
        if (replace) {
          setComments(res.data.comments || []);
        } else {
          setComments((prev) => [...prev, ...(res.data.comments || [])]);
        }
        setPage(res.data.page);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      fetchComments(page + 1, false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      setSubmitting(true);
      let res;
      if (replyTo) {
        // Reply to existing comment
        res = await API.post(`/blogs/${blogId}/comments/${replyTo.commentId}/reply`, { text });
      } else {
        // Create root comment
        res = await API.post(`/blogs/${blogId}/comments`, { text });
      }

      if (res.data.success) {
        toast.success(replyTo ? "Reply posted!" : "Comment posted!");
        setText("");
        setReplyTo(null);
        await fetchComments(1, true);
        if (onCommentUpdated) {
          onCommentUpdated();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      const res = await API.delete(`/blogs/comments/${commentId}`);
      if (res.data.success) {
        toast.success("Comment deleted");
        await fetchComments(1, true);
        if (onCommentUpdated) {
          onCommentUpdated();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete comment");
    }
  };

  const canDelete = (comment) => {
    if (!currentUser) return false;
    const currentUserId = currentUser._id || currentUser.id;
    const commentAuthorId = comment.user?._id || comment.user?.id || comment.user;
    return (
      currentUserId?.toString() === commentAuthorId?.toString() ||
      currentUserId?.toString() === blogOwnerId?.toString()
    );
  };

  return (
    <div className="comments-drawer-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="comments-drawer glass-card" onClick={(e) => e.stopPropagation()} style={{ background: "rgba(15,15,15,0.95)" }}>
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary border-opacity-30">
          <h4 className="m-0 text-warning">Comments 💬</h4>
          <button className="btn-close btn-close-white" onClick={onClose}></button>
        </div>

        {/* COMMENTS CONTAINER */}
        <div className="comments-list overflow-auto flex-grow-1 mb-3 pr-2" style={{ maxHeight: "60vh" }}>
          {comments.length === 0 && !loading && (
            <div className="text-center text-secondary py-5">
              <p>No comments yet. Share your thoughts!</p>
            </div>
          )}

          {comments.map((comment) => (
            <div key={comment._id} className="comment-item mb-3 p-3 rounded bg-dark bg-opacity-40 border border-secondary border-opacity-10">
              <div className="d-flex justify-content-between align-items-start">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Avatar src={comment.user?.profileImage} alt="user" className="rounded-circle" size={32} />
                  <div>
                    <span className="fw-bold text-light d-block small" style={{ fontSize: "0.825rem" }}>
                      {comment.user?.name}
                    </span>
                    <span className="text-secondary" style={{ fontSize: "0.7rem" }}>
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-link text-warning p-0 text-decoration-none"
                    style={{ fontSize: "0.75rem" }}
                    onClick={() => setReplyTo({ commentId: comment._id, userName: comment.user?.name })}
                  >
                    Reply
                  </button>
                  {canDelete(comment) && (
                    <button
                      className="btn btn-sm btn-link text-danger p-0 text-decoration-none"
                      style={{ fontSize: "0.75rem" }}
                      onClick={() => handleDelete(comment._id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <p className="mb-2 text-white-50 small ps-4" style={{ fontSize: "0.85rem", whiteSpace: "pre-line" }}>
                {comment.text}
              </p>

              {/* NESTED REPLIES */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="replies-list ms-4 mt-2 border-start border-secondary border-opacity-30 ps-3">
                  {comment.replies.map((reply) => (
                    <div key={reply._id} className="reply-item mb-2 p-2 rounded bg-black bg-opacity-20">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <Avatar src={reply.user?.profileImage} alt="user" className="rounded-circle" size={24} />
                          <div>
                            <span className="fw-bold text-light d-block" style={{ fontSize: "0.75rem" }}>
                              {reply.user?.name}
                            </span>
                            <span className="text-secondary" style={{ fontSize: "0.65rem" }}>
                              {new Date(reply.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {canDelete(reply) && (
                          <button
                            className="btn btn-sm btn-link text-danger p-0 text-decoration-none"
                            style={{ fontSize: "0.7rem" }}
                            onClick={() => handleDelete(reply._id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <p className="mb-0 text-white-50 ps-4" style={{ fontSize: "0.8rem", whiteSpace: "pre-line" }}>
                        {reply.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="text-center text-warning py-3">
              <span className="spinner-border spinner-border-sm" role="status"></span> Loading comments...
            </div>
          )}

          {page < totalPages && !loading && (
            <div className="text-center mt-3">
              <button className="btn btn-sm btn-outline-secondary text-warning px-3" onClick={handleLoadMore}>
                Load More Comments
              </button>
            </div>
          )}
        </div>

        {/* INPUT FORM */}
        <form onSubmit={handleSubmit} className="border-top border-secondary border-opacity-30 pt-3">
          {replyTo && (
            <div className="d-flex justify-content-between align-items-center mb-2 px-2.5 py-1.5 rounded bg-warning bg-opacity-10 text-warning small">
              <span>
                Replying to <strong>{replyTo.userName}</strong>
              </span>
              <button
                type="button"
                className="btn-close btn-close-white"
                style={{ fontSize: "0.7rem" }}
                onClick={() => setReplyTo(null)}
              ></button>
            </div>
          )}
          <div className="input-group">
            <input
              type="text"
              className="form-control bg-dark border-secondary border-opacity-50 text-light"
              style={{ borderRadius: "8px 0 0 8px" }}
              placeholder={replyTo ? `Reply to ${replyTo.userName}...` : "Share your travel thoughts..."}
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={submitting}
              required
            />
            <button className="btn btn-warning px-3 fw-bold" type="submit" disabled={submitting || !text.trim()}>
              {submitting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BlogCommentDrawer;
