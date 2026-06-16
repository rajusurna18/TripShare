import {
  useState,
} from "react";

function AddExpenseModal({

  members = [],

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

  const [splitAmong, setSplitAmong] =
    useState([]);

  const handleCheckboxChange = (memberId) => {
    if (splitAmong.includes(memberId)) {
      setSplitAmong(splitAmong.filter(id => id !== memberId));
    } else {
      setSplitAmong([...splitAmong, memberId]);
    }
  };

  const handleSubmit =
    () => {

      if (!title.trim() || !amount) {
        alert("Please enter a title and amount.");
        return;
      }

      if (splitAmong.length === 0) {
        alert("Please select at least one member to split the expense with.");
        return;
      }

      onSubmit({

        title,

        amount: Number(amount),

        category,

        paymentMethod,

        note,

        splitAmong,

      });

      setTitle("");
      setAmount("");
      setNote("");
      setSplitAmong([]);

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

      {members && members.length > 0 && (
        <div className="mb-3">
          <label className="form-label text-light d-block fw-bold">Split Among:</label>
          <div className="d-flex flex-wrap gap-3">
            {members.map((member) => (
              <div key={member._id} className="form-check form-check-inline">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={`split-${member._id}`}
                  checked={splitAmong.includes(member._id)}
                  onChange={() => handleCheckboxChange(member._id)}
                />
                <label className="form-check-label text-light" htmlFor={`split-${member._id}`}>
                  {member.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

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