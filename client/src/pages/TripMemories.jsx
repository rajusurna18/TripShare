import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import API from "../services/api";

import AddMemoryModal from "../components/memory/AddMemoryModal";
import MemoryCard from "../components/memory/MemoryCard";

function TripMemories() {
  const { tripId } = useParams();

  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMemories = async () => {
    try {
      const res = await API.get(`/memories/${tripId}`);

      setMemories(res.data.memories || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, [tripId]);

  if (loading) {
    return (
      <div className="dashboard-page min-vh-100 text-light d-flex justify-content-center align-items-center">
        <h2>Loading Memories 📸</h2>
      </div>
    );
  }

  return (
    <div className="dashboard-page min-vh-100 text-light">
      <div className="container py-5">

        <div className="glass-card p-4 mb-5">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

            <div>
              <h1 className="fw-bold mb-2">
                Trip Memories 📸
              </h1>

              <p className="text-secondary mb-0">
                Capture and share your best travel moments.
              </p>
            </div>

            <span className="badge bg-warning text-dark fs-6">
              {memories.length} Memories
            </span>

          </div>
        </div>

        <AddMemoryModal
          tripId={tripId}
          fetchMemories={fetchMemories}
        />

        {memories.length === 0 ? (
          <div className="glass-card p-5 text-center">
            <h3>No Memories Yet 📷</h3>

            <p className="text-secondary">
              Upload photos and create your travel story.
            </p>
          </div>
        ) : (
          <div className="row g-4">
            {memories.map((memory) => (
              <div
                className="col-lg-6"
                key={memory._id}
              >
                <MemoryCard
                  memory={memory}
                  fetchMemories={fetchMemories}
                />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default TripMemories;