function ExpenseCard({

  expense,
  onEdit,
  onDelete,

}) {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isPayer = expense.paidBy && (expense.paidBy._id === currentUser._id || expense.paidBy === currentUser._id);

  return (

    <div className="glass-card p-4 h-100 d-flex flex-column justify-content-between">

      <div>
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

          {

            expense.splitAmong && expense.splitAmong.length > 0 && (

              <p className="mb-0 text-secondary">

                👥 Split among:{" "}

                {expense.splitAmong.map((m) => m.name || "Unknown").join(", ")}

              </p>

            )

          }

        </div>
      </div>

      {(onEdit || onDelete) && isPayer && (
        <div className="d-flex justify-content-end gap-2 mt-3 pt-2 border-top border-secondary border-opacity-10">
          <button className="btn btn-sm btn-outline-secondary text-light" onClick={() => onEdit(expense)}>
            ✏️ Edit
          </button>
          <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(expense._id)}>
            🗑️ Delete
          </button>
        </div>
      )}

    </div>

  );

}

export default ExpenseCard;