
import "./ContractDetails.css";

function ContractDetails({ contract }) {
  if (!contract) {
    return (
      <section className="details-panel">
        <h2>Select a contract to review.</h2>
        <p>Tip: press J to start.</p>
      </section>
    );
  }

  return (
    <section className="details-panel">
      <p>CONTRACT DETAILS</p>

      <h2>{contract.title}</h2>
      <p>Contract ID: {contract.id}</p>
      <p>Supplier: {contract.supplier}</p>

      <hr />

      <h3>Contract Summary</h3>
      <p>
        Contract Value: ₹{contract.amount.toLocaleString("en-IN")}
      </p>
      <p>Priority: {contract.priority}</p>
      <p>Status: {contract.status}</p>
      <p>Due Date: {contract.dueDate}</p>

      <hr />

      <h3>Key Terms</h3>
      <p>
        Review the supplier agreement and verify its terms before approval.
      </p>

      <hr />

      <h3>Audit History</h3>
      <p>Contract submitted for review.</p>

      <hr />

      <h3>Actions</h3>

      <div className="contract-actions">
        {contract.status === "New" && (
          <button className="action-btn primary">
            Start Review
          </button>
        )}

        {contract.status === "In review" && (
          <>
            <button className="action-btn primary">
              Approve
            </button>

            <button className="action-btn">
              Reject
            </button>

            <button className="action-btn">
              Block
            </button>
          </>
        )}

        {contract.status === "Blocked" && (
          <button className="action-btn primary">
            Resume Review
          </button>
        )}

        {["Approved", "Rejected"].includes(contract.status) && (
          <p>This contract is closed. No further actions available.</p>
        )}
      </div>
    </section>
  );
}

export default ContractDetails;
