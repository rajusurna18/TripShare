import { useState } from "react";
import Avatar from "../shared/Avatar";
import API from "../../services/api";
import MemoryCommentsDrawer from "./MemoryCommentsDrawer";

function MemoryCard({
  memory,
  fetchMemories,
}) {
  const [showComments, setShowComments] = useState(false);

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

  return (

    <div className="glass-card p-4 h-100">

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

      <p className="mb-3">
        {memory.caption}
      </p>

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

      {showComments && (
        <MemoryCommentsDrawer
          memoryId={memory._id}
          memoryOwnerId={memory.user?._id || memory.user?.id || memory.user}
          onClose={() => setShowComments(false)}
          onCommentUpdated={fetchMemories}
        />
      )}

    </div>
  );
}

export default MemoryCard;