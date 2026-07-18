import Avatar from "../shared/Avatar";

function BalanceCard({

  balance,

}) {

  const getStatusColor =
    () => {

      if (
        balance.status ===
        "gets back"
      )
        return "success";

      if (
        balance.status ===
        "owes"
      )
        return "danger";

      return "secondary";

  };

  return (

    <div className="glass-card p-4 text-center h-100">

      <Avatar
        src={balance.profileImage}
        alt="user"
        style={{
          border: "3px solid #ffc107",
        }}
        size={80}
      />

      <h5 className="mt-3 mb-1">

        {balance.user}

      </h5>

      <h3 className="text-warning">

        ₹

        {

          Math.abs(
            balance.balance
          )

        }

      </h3>

      <span

        className={`badge bg-${getStatusColor()} mt-2`}

      >

        {balance.status}

      </span>

    </div>

  );

}

export default BalanceCard;