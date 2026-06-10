import { useState } from "react";

import API from "../services/api";

import toast from "react-hot-toast";

function CreateTrip() {

  const [loading, setLoading] =
    useState(false);

  const [tripData, setTripData] =
    useState({

      title: "",
      destination: "",
      budget: "",
      date: "",

      travelStyle: "",
      tags: "",
      maxMembers: 10,

      travelers: "",
      category: "",
      transport: "",
      visibility: "",

      description: "",

    });

  const [image, setImage] =
    useState(null);

  const handleChange = (e) => {

    setTripData({

      ...tripData,

      [e.target.name]:
        e.target.value,

    });

  };

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      try {

        setLoading(true);

        const formData =
          new FormData();

        Object.keys(tripData)
          .forEach((key) => {

            formData.append(
              key,
              tripData[key]
            );

          });

        if (image) {

          formData.append(
            "image",
            image
          );

        }

        const token =
          localStorage.getItem(
            "token"
          );

        await API.post(

          "/trips",

          formData,

          {
            headers: {

              Authorization:
                token,

              "Content-Type":
                "multipart/form-data",

            },
          }

        );

        toast.success(
          "Trip Created Successfully ✈️"
        );

        setTripData({

          title: "",
          destination: "",
          budget: "",
          date: "",

          travelStyle: "",
          tags: "",
          maxMembers: 10,

          travelers: "",
          category: "",
          transport: "",
          visibility: "",

          description: "",

        });

        setImage(null);

      } catch (err) {

        toast.error(

          err.response?.data?.message ||

          "Trip Creation Failed"

        );

      } finally {

        setLoading(false);

      }

    };

  return (

    <div className="dashboard-page">

      <div className="container py-5">

        <div className="create-trip-box">

          <div className="text-center mb-5">

            <h1 className="section-title">

              Create Your Dream Trip ✈️

            </h1>

            <p>

              Plan adventures,
              invite travelers,
              and explore the
              world smarter.

            </p>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="row g-4">

              {/* TITLE */}

              <div className="col-md-6">

                <label className="form-label">

                  Trip Title

                </label>

                <input
                  type="text"
                  name="title"
                  value={tripData.title}
                  className="form-control trip-input"
                  placeholder="Please enter trip title"
                  onChange={handleChange}
                  minLength="3"
                  required
                />

              </div>

              {/* DESTINATION */}

              <div className="col-md-6">

                <label className="form-label">

                  Destination

                </label>

                <input
                  type="text"
                  name="destination"
                  value={tripData.destination}
                  className="form-control trip-input"
                  placeholder="Please enter destination"
                  onChange={handleChange}
                  required
                />

              </div>

              {/* BUDGET */}

              <div className="col-md-6">

                <label className="form-label">

                  Budget

                </label>

                <input
                  type="number"
                  name="budget"
                  value={tripData.budget}
                  className="form-control trip-input"
                  placeholder="Please enter budget"
                  onChange={handleChange}
                  min="100"
                  required
                />

              </div>

              {
                 tripData.budget &&
                 tripData.maxMembers && (

                 <small
                 className="text-warning"
                 >

                  Approx ₹

                 {Math.floor(
    
                   tripData.budget /

                 tripData.maxMembers

                )}

                {" "}per traveler

              </small>

             )
             }

              {/* DATE */}

              <div className="col-md-6">

                <label className="form-label">

                  Travel Date

                </label>

                <input
                  type="date"
                  name="date"
                  value={tripData.date}
                  className="form-control trip-input"
                  onChange={handleChange}
                  required
                />

              </div>

              {/* TRAVEL STYLE */}

              <div className="col-md-6">

                <label className="form-label">

                  Travel Style

                </label>

                <select
                  name="travelStyle"
                  value={tripData.travelStyle}
                  className="form-control trip-input"
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select Travel Style
                  </option>

                  <option value="Budget">
                    Budget
                  </option>

                  <option value="Luxury">
                    Luxury
                  </option>

                  <option value="Adventure">
                    Adventure
                  </option>

                  <option value="Backpacking">
                    Backpacking
                  </option>

                </select>

              </div>

              {/* MAX MEMBERS */}

              <div className="col-md-6">

                <label className="form-label">

                  Max Travelers

                </label>

                <input
                  type="number"
                  name="maxMembers"
                  value={tripData.maxMembers}
                  className="form-control trip-input"
                  placeholder="Maximum travelers"
                  onChange={handleChange}
                  min="1"
                  max="50"
                />

              </div>

              {/* CATEGORY */}

              <div className="col-md-6">

                <label className="form-label">

                  Trip Category

                </label>

                <select
                  name="category"
                  value={tripData.category}
                  className="form-control trip-input"
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select Category
                  </option>

                  <option>
                    Adventure
                  </option>

                  <option>
                    Family
                  </option>

                  <option>
                    Solo
                  </option>

                  <option>
                    Friends
                  </option>

                  <option>
                    Nature
                  </option>

                </select>

              </div>

              {/* TRANSPORT */}

              <div className="col-md-6">

                <label className="form-label">

                  Transport Mode

                </label>

                <select
                  name="transport"
                  value={tripData.transport}
                  className="form-control trip-input"
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select Transport
                  </option>

                  <option>
                    Flight
                  </option>

                  <option>
                    Train
                  </option>

                  <option>
                    Bus
                  </option>

                  <option>
                    Bike
                  </option>

                  <option>
                    Car
                  </option>

                </select>

              </div>

              {/* VISIBILITY */}

              <div className="col-md-6">

                <label className="form-label">

                  Visibility

                </label>

                <select
                  name="visibility"
                  value={tripData.visibility}
                  className="form-control trip-input"
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select Visibility
                  </option>

                  <option>
                    Public
                  </option>

                  <option>
                    Private
                  </option>

                </select>

              </div>

              {/* TAGS */}

              <div className="col-md-12">

                <label className="form-label">

                  Tags

                </label>

                <input
                  type="text"
                  name="tags"
                  value={tripData.tags}
                  className="form-control trip-input"
                  placeholder="Beach, Trekking, Nature"
                  onChange={handleChange}
                />

                <small className="text-secondary">

                  Separate tags with commas

                  <div className="mt-2">

             {
                  tripData.tags

                ?.split(",")

                .map((tag,index)=>(

                <span

                key={index}

                  className="badge bg-warning text-dark me-2"

                     >

                   {tag.trim()}

                </span>

                ))
               }

                </div>

                </small>

              </div>

              {/* IMAGE */}

               <div className="col-md-12">

               <label className="form-label">

               Upload Trip Image

              </label>

               <input
               type="file"
               className="form-control trip-input"
               accept="image/*"
               onChange={(e) =>
               setImage(
               e.target.files[0]
                )
              }
              />

               {/* IMAGE PREVIEW */}

               {
             image && (

           <img
               src={URL.createObjectURL(image)}
               alt="preview"
                className="img-fluid mt-3 rounded"
             style={{
              maxHeight: "250px",
            }}
            />

             )
            }

            <small className="text-secondary">

                 Upload travel destination image

                 </small>

                 </div>

              {/* DESCRIPTION */}

              <div className="col-md-12">

                <label className="form-label">

                  Trip Description

                </label>

                <textarea
                  rows="5"
                  name="description"
                  value={tripData.description}
                  className="form-control trip-input"
                  placeholder="Describe your dream trip..."
                  onChange={handleChange}
                  minLength="20"
                  required
                />

              </div>

              {/* BUTTON */}

              <div className="col-md-12">

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-custom w-100"
                >

                  {

                    loading

                      ? "Creating Trip..."

                      : "Create Trip 🚀"

                  }

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