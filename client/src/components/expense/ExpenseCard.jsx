function ExpenseCard({

  expense,

}) {

  return (

    <div className="glass-card p-4 h-100">

      {/* TOP */}

      <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">

        <div>

          <h5 className="fw-bold">

            {expense.title}

          </h5>

          <span className="badge bg-secondary">

            {

              expense.category ||

              "General"

            }

          </span>

        </div>

        <h4 className="text-warning">

          ₹{expense.amount}

        </h4>

      </div>

      <hr />

      {/* DETAILS */}

      <div className="d-flex flex-column gap-2">

        <p className="mb-0">

          👤 Paid By:

          {" "}

          <strong>

            {

              expense.paidBy?.name ||

              "Unknown"

            }

          </strong>

        </p>

        <p className="mb-0">

          💳 Payment:

          {" "}

          {

            expense.paymentMethod ||

            "Cash"

          }

        </p>

        {

          expense.note && (

            <p className="mb-0 text-secondary">

              📝 {expense.note}

            </p>

          )

        }

      </div>

    </div>

  );

}

export default ExpenseCard;