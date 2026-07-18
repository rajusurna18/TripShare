function ProfileStats({ user }) {

  return (

    <div className="row g-4 mb-5">

      <div className="col-md-3">

        <div className="glass-card p-4 text-center h-100">

          <h2 className="text-warning fw-bold">

            {user?.friends?.length || 0}

          </h2>

          <p className="text-secondary m-0">

            Friends

          </p>

        </div>

      </div>

      <div className="col-md-3">

        <div className="glass-card p-4 text-center h-100">

          <h2 className="text-warning fw-bold">

            {user?.followers?.length || 0}

          </h2>

          <p className="text-secondary m-0">

            Followers

          </p>

        </div>

      </div>

      <div className="col-md-3">

        <div className="glass-card p-4 text-center h-100">

          <h2 className="text-warning fw-bold">

            {user?.following?.length || 0}

          </h2>

          <p className="text-secondary m-0">

            Following

          </p>

        </div>

      </div>

      <div className="col-md-3">

        <div className="glass-card p-4 text-center h-100">

          <h2 className="text-warning fw-bold">

            {user?.totalTrips || 0}

          </h2>

          <p className="text-secondary m-0">

            Trips

          </p>

        </div>

      </div>

    </div>

  );

}

export default ProfileStats;

