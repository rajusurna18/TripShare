function TripCard({ trip }) {

  return (
    <div className="bg-white shadow-lg rounded-xl p-5 border hover:scale-105 transition duration-300">

      <h2 className="text-2xl font-bold mb-2">
        {trip.title}
      </h2>

      <p className="text-gray-600">
        📍 {trip.destination}
      </p>

      <p className="text-gray-600">
        💰 ₹{trip.budget}
      </p>

      <p className="text-gray-600">
        📅 {new Date(trip.date).toDateString()}
      </p>

      <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">

        Join Trip

      </button>

    </div>
  );
}

export default TripCard;