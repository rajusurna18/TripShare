import {
  useState,
} from "react";

function AddExpenseModal({

  onSubmit,

}) {

  const [title, setTitle] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [category, setCategory] =
    useState("Food");

  const [paymentMethod,
    setPaymentMethod] =
    useState("Cash");

  const [note, setNote] =
    useState("");

  const handleSubmit =
    () => {

      onSubmit({

        title,

        amount,

        category,

        paymentMethod,

        note,

      });

    };

  return (

    <div
      className="glass-card p-4"
    >

      <h3 className="mb-4">

        Add Expense 💳

      </h3>

      <input

        type="text"

        placeholder="Title"

        className="form-control mb-3"

        value={title}

        onChange={(e) =>

          setTitle(
            e.target.value
          )

        }

      />

      <input

        type="number"

        placeholder="Amount"

        className="form-control mb-3"

        value={amount}

        onChange={(e) =>

          setAmount(
            e.target.value
          )

        }

      />

      <select

        className="form-select mb-3"

        value={category}

        onChange={(e) =>

          setCategory(
            e.target.value
          )

        }

      >

        <option>

          Food

        </option>

        <option>

          Hotel

        </option>

        <option>

          Fuel

        </option>

        <option>

          Flight

        </option>

        <option>

          Activities

        </option>

      </select>

      <select

        className="form-select mb-3"

        value={paymentMethod}

        onChange={(e) =>

          setPaymentMethod(
            e.target.value
          )

        }

      >

        <option>

          Cash

        </option>

        <option>

          UPI

        </option>

        <option>

          Card

        </option>

      </select>

      <textarea

        className="form-control mb-3"

        placeholder="Note"

        value={note}

        onChange={(e) =>

          setNote(
            e.target.value
          )

        }

      />

      <button

        className="btn btn-warning"

        onClick={
          handleSubmit
        }

      >

        Add Expense

      </button>

    </div>

  );

}

export default AddExpenseModal;