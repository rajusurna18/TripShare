function BalanceCard({

  balance,

}) {

  return (

    <div className="glass-card p-4 text-center">

      <img

        src={
          balance.profileImage
        }

        alt="user"

        style={{

          width: "70px",

          height: "70px",

          borderRadius: "50%",

          objectFit: "cover",

        }}

      />

      <h5 className="mt-3">

        {balance.user}

      </h5>

      <h4>

        ₹

        {

          Math.abs(
            balance.balance
          )

        }

      </h4>

      <p
        className={
          balance.status ===
          "gets back"

            ? "text-success"

            : balance.status ===
              "owes"

            ? "text-danger"

            : "text-secondary"
        }
      >

        {
          balance.status
        }

      </p>

    </div>

  );

}

export default BalanceCard;