import { useState } from "react";
import Avatar from "../shared/Avatar";
import API from "../../services/api";
import MemoryCommentsDrawer from "./MemoryCommentsDrawer";
import { AnimatePresence } from "framer-motion";

function MemoryCard({
  memory,
  fetchMemories,
}) {
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editCaption, setEditCaption] = useState(memory.caption || "");
  const [saving, setSaving] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isUploader = memory.user && (memory.user._id === currentUser._id || memory.user === currentUser._id);

  const likeMemory =
    async () => {

      try {

        await API.put(
          `/memories/like/${memory._id}`
        );

        fetchMemories();

      } catch (err) {

        console.log(err);

      }
  };

  const handleEditSave = async () => {
    if (!editCaption.trim() || saving) return;
    try {
      setSaving(true);
      await API.put(`/memories/${memory._id}`, { caption: editCaption });
      setIsEditing(false);
      fetchMemories();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this memory? This will also delete all comments.")) return;
    try {
      await API.delete(`/memories/${memory._id}`);
      fetchMemories();
    } catch (err) {
      console.error(err);
    }
  };

  return (

    <div className="glass-card p-4 h-100 d-flex flex-column justify-content-between">

      <div>
        <div className="d-flex align-items-center gap-3 mb-3">

          <Avatar
            src={memory?.user?.profileImage}
            alt="user"
            className="rounded-circle"
            size={60}
          />

          <div>

            <h5 className="m-0">
              {memory?.user?.name}
            </h5>

            <small className="text-secondary">
              {new Date(
                memory.createdAt
              ).toLocaleString()}
            </small>

          </div>

        </div>

        <img
          src={memory.image}
          alt="memory"
          className="img-fluid rounded mb-3"
          style={{
            width: "100%",
            maxHeight: "450px",
            objectFit: "cover",
          }}
        />

        {isEditing ? (
          <div className="mb-3">
            <textarea
              className="form-control bg-dark text-light border-secondary mb-2"
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
              rows={2}
            />
            <div className="d-flex gap-2">
              <button className="btn btn-warning btn-sm" onClick={handleEditSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="mb-3">
            {memory.caption}
          </p>
        )}
      </div>

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-2 border-top border-secondary border-opacity-10 mt-auto">
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-warning"
            onClick={likeMemory}
          >
            ❤️ {memory.likesCount !== undefined ? memory.likesCount : (memory.likes?.length || 0)}
          </button>

          <button
            className="btn btn-outline-info"
            onClick={() => setShowComments(true)}
          >
            💬 {memory.commentsCount || 0}
          </button>
        </div>

        {isUploader && (
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-secondary text-light"
              onClick={() => setIsEditing(!isEditing)}
            >
              ✏️ Edit
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={handleDelete}
            >
              🗑️ Delete
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showComments && (
          <MemoryCommentsDrawer
            memoryId={memory._id}
            memoryOwnerId={memory.user?._id || memory.user?.id || memory.user}
            onClose={() => setShowComments(false)}
            onCommentUpdated={fetchMemories}
          />
        )}
      </AnimatePresence>

    </div>
  );
}

export default MemoryCard;