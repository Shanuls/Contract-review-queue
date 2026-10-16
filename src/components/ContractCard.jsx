
import "./ContractCard.css";

function ContractCard({ contract }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(contract.dueDate);
  dueDate.setHours(0, 0, 0, 0);

  const difference = Math.round(
    (dueDate - today) / (1000 * 60 * 60 * 24)
  );

  const isClosed = ["Approved", "Rejected"].includes(contract.status);
  const isOverdue = difference < 0 && !isClosed;

  let dueLabel;

  if (isClosed) {
    dueLabel = `Due Date: ${contract.dueDate}`;
  } else if (difference < 0) {
    const overdueDays = Math.abs(difference);

    dueLabel = `⚠ Overdue by ${overdueDays} ${
      overdueDays === 1 ? "day" : "days"
    }`;
  } else if (difference === 0) {
    dueLabel = "Due today";
  } else {
    dueLabel = `Due in ${difference} ${
      difference === 1 ? "day" : "days"
    }`;
  }

  const amountInLakh = contract.amount / 100000;

  const formattedAmount = `₹${amountInLakh.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })} Lakh`;

  return (
    <div className="contract-item">
      <div className="contract-card-top">
        <h3>{contract.title}</h3>

        <span className="contract-amount">
          {formattedAmount}
        </span>
      </div>

      <p>Contract ID: {contract.id}</p>
      <p>Supplier: {contract.supplier}</p>
      <p>Priority: {contract.priority}</p>
      <p>Status: {contract.status}</p>

      <p
  className={`due-date ${isOverdue ? "overdue" : ""}`}
  style={{ textAlign: "right" }}
>
  {dueLabel}
</p>
    </div>
  );
}

export default ContractCard;
