import { useState } from "react";

function CreateTrip() {

  const [tripData, setTripData] = useState({

    title: "",
    destination: "",
    budget: "",
    date: "",
    travelers: "",
    description: "",

  });

  const handleChange = (e) => {

    setTripData({

      ...tripData,

      [e.target.name]: e.target.value,

    });

  };

  const handleSubmit = (e) => {

    e.preventDefault();

    console.log(tripData);

    alert("Trip Created Successfully ✈️");

  };

  return (

    <div className="dashboard-page">

      <div className="container py-5">

        <div className="create-trip-box">

          <h1 className="section-title">
            Create Your Dream Trip ✈️
          </h1>

          <form onSubmit={handleSubmit}>

            <div className="row g-4">

              <div className="col-md-6">

                <label className="form-label">
                  Trip Title
                </label>

                <input
                  type="text"
                  name="title"
                  className="form-control trip-input"
                  placeholder="Goa Beach Adventure"
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="col-md-6">

                <label className="form-label">
                  Destination
                </label>

                <input
                  type="text"
                  name="destination"
                  className="form-control trip-input"
                  placeholder="Goa"
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="col-md-6">

                <label className="form-label">
                  Budget
                </label>

                <input
                  type="number"
                  name="budget"
                  className="form-control trip-input"
                  placeholder="5000"
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="col-md-6">

                <label className="form-label">
                  Travel Date
                </label>

                <input
                  type="date"
                  name="date"
                  className="form-control trip-input"
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="col-md-12">

                <label className="form-label">
                  Number of Travelers
                </label>

                <input
                  type="number"
                  name="travelers"
                  className="form-control trip-input"
                  placeholder="4"
                  onChange={handleChange}
                />

              </div>

              <div className="col-md-12">

                <label className="form-label">
                  Trip Description
                </label>

                <textarea
                  rows="5"
                  name="description"
                  className="form-control trip-input"
                  placeholder="Describe your trip..."
                  onChange={handleChange}
                />

              </div>

              <div className="col-md-12">

                <button
                  type="submit"
                  className="btn btn-custom w-100"
                >
                  Create Trip 🚀
                </button>

              </div>

            </div>

          </form>

        </div>

      </div>

    </div>

  );
}

export default CreateTrip;