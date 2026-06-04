function ExpenseCard({

  expense,

}) {

  return (

    <div className="glass-card p-4 mb-3">

      <div className="d-flex justify-content-between">

        <div>

          <h5>

            {expense.title}

          </h5>

          <small>

            Category:
            {" "}
            {expense.category}

          </small>

        </div>

        <h4 className="text-warning">

          ₹{expense.amount}

        </h4>

      </div>

      <hr />

      <p>

        Paid by:
        {" "}
        <strong>

          {
            expense.paidBy?.name
          }

        </strong>

      </p>

      <p>

        Method:
        {" "}
        {
          expense.paymentMethod
        }

      </p>

      <p>

        {
          expense.note
        }

      </p>

    </div>

  );

}

export default ExpenseCard;