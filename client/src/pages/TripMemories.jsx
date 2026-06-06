import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import API
from "../services/api";

import AddMemoryModal
from "../components/memory/AddMemoryModal";

import MemoryCard
from "../components/memory/MemoryCard";

function TripMemories() {

  const { tripId } =
    useParams();

  const [memories, setMemories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const fetchMemories =
    async () => {

      try {

        const res =
          await API.get(

            `/memories/${tripId}`

          );

        setMemories(

          res.data.memories || []

        );

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

      <div className="text-light p-5">

        Loading Memories...

      </div>

    );

  }

  return (

    <div className="dashboard-page min-vh-100 text-light">

      <div className="container py-5">

        <h1 className="mb-5">

          Trip Memories 📸

        </h1>

        <AddMemoryModal

          tripId={tripId}

          fetchMemories={
            fetchMemories
          }

        />

        {

          memories.length === 0 ? (

            <div className="glass-card p-5 text-center">

              <h3>

                No Memories Yet

              </h3>

            </div>

          ) : (

            memories.map(
              (memory) => (

                <MemoryCard

                  key={memory._id}

                  memory={memory}

                  fetchMemories={
                    fetchMemories
                  }

                />

              )
            )

          )

        }

      </div>

    </div>

  );

}

export default TripMemories;