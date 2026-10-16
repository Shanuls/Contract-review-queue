
import { useState, useEffect } from "react";
import "./ContractDetails.css";

function ContractDetails({
  contract,
  onAction,
  shortcutAction,
  onShortcutHandled,
}) {
  const [modalAction, setModalAction] = useState("");
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState("");
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const closeNoteModal = () => {
    setModalAction("");
    setNote("");
    setNoteError("");
  };

  const openNoteModal = (action) => {
    setModalAction(action);
    setNote("");
    setNoteError("");
  };

  const handleAction = (action) => {
    if (!contract) return;

    if (action === "Reject" || action === "Block") {
      openNoteModal(action);
      return;
    }

    if (action === "Approve" && contract.amount > 5000000) {
      setShowApprovalModal(true);
      return;
    }

    onAction(action);
  };

  useEffect(() => {
    if (!shortcutAction || !contract) return;

    if (shortcutAction === "Escape") {
      if (modalAction) closeNoteModal();
      else if (showApprovalModal) setShowApprovalModal(false);

      onShortcutHandled();
      return;
    }

    if (modalAction || showApprovalModal) {
      onShortcutHandled();
      return;
    }

    const actionMap = {
      A: "Approve",
      R: "Reject",
      B: "Block",
    };

    const action = actionMap[shortcutAction];

    if (action && contract.status === "In review") {
      handleAction(action);
    }

    onShortcutHandled();
  }, [shortcutAction]);

  if (!contract) {
    return (
      <section className="details-panel">
        <h2>Select a contract to review.</h2>
        <p>Tip: press J to start.</p>
      </section>
    );
  }

  const submitNote = () => {
    if (note.trim().length < 10) {
      setNoteError("Please enter a note with at least 10 characters.");
      return;
    }

    onAction(modalAction, note.trim());
    closeNoteModal();
  };

  const confirmApproval = () => {
    setShowApprovalModal(false);
    onAction("Approve");
  };

  const keyTerms = contract.keyTerms || {};
  const auditHistory = contract.auditHistory || [];

  return (
    <section className="details-panel">
      <p>CONTRACT DETAILS</p>
      <h2>{contract.title}</h2>
      <p>Contract ID: {contract.id}</p>
      <p>Supplier: {contract.supplier}</p>

      <hr />

      <h3>Contract Summary</h3>
      <p>Contract Value: ₹{contract.amount.toLocaleString("en-IN")}</p>
      <p>Priority: {contract.priority}</p>
      <p>Status: {contract.status}</p>
      <p>Due Date: {contract.dueDate}</p>

      <hr />

      <h3>Key Terms</h3>
      {Object.keys(keyTerms).length > 0 ? (
        <ul className="key-terms-list">
          {Object.entries(keyTerms).map(([key, value]) => (
            <li key={key}>
              <strong>
                {key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (letter) => letter.toUpperCase())}
                :
              </strong>{" "}
              {value}
            </li>
          ))}
        </ul>
      ) : (
        <p>No key terms available.</p>
      )}

    

      <hr />

      <h3>Audit History</h3>
      {auditHistory.length > 0 ? (
        <ul className="audit-history-list">
          {auditHistory
            .slice()
            .reverse()
            .map((entry, index) => (
              <li key={`${entry.timestamp}-${index}`}>
                <strong>{entry.action}</strong>
                <p>{entry.note}</p>
                <small>{entry.timestamp}</small>
              </li>
            ))}
        </ul>
      ) : (
        <p>No audit history available.</p>
      )}

      <hr />

      <h3>Actions</h3>
      <div className="contract-actions">
        {contract.status === "New" && (
          <button
            className="action-btn primary"
            onClick={() => handleAction("Start Review")}
          >
            Start Review
          </button>
        )}

        {contract.status === "In review" && (
          <>
            <button
              className="action-btn primary"
              onClick={() => handleAction("Approve")}
            >
              Approve
            </button>

            <button
              className="action-btn"
              onClick={() => handleAction("Reject")}
            >
              Reject
            </button>

            <button
              className="action-btn"
              onClick={() => handleAction("Block")}
            >
              Block
            </button>
          </>
        )}

        {contract.status === "Blocked" && (
          <button
            className="action-btn primary"
            onClick={() => handleAction("Resume Review")}
          >
            Resume Review
          </button>
        )}

        {["Approved", "Rejected"].includes(contract.status) && (
          <p>This contract is closed. No further actions available.</p>
        )}
      </div>

      {modalAction && (
        <div className="modal-overlay">
          <div className="note-modal" role="dialog" aria-modal="true">
            <h2>{modalAction} Contract</h2>
            <p>Contract ID: {contract.id}</p>

            <label htmlFor="action-note">
              Note (minimum 10 characters)
            </label>

            <textarea
              id="action-note"
              rows={4}
              value={note}
              onChange={(event) => {
                setNote(event.target.value);
                setNoteError("");
              }}
              placeholder="Enter your reason..."
              autoFocus
            />

            {noteError && (
              <p className="note-error" role="alert">{noteError}</p>
            )}

            <div className="modal-actions">
              <button className="action-btn" onClick={closeNoteModal}>
                Cancel
              </button>
              <button
                className="action-btn primary"
                onClick={submitNote}
              >
                Confirm {modalAction}
              </button>
            </div>
          </div>
        </div>
      )}

      {showApprovalModal && (
        <div className="modal-overlay">
          <div className="note-modal" role="dialog" aria-modal="true">
            <h2>Confirm High-Value Approval</h2>
            <p>This contract exceeds ₹50 lakh. Are you sure you want to approve it?</p>
            <p><strong>Contract ID:</strong> {contract.id}</p>
            <p>
              <strong>Contract Value:</strong>{" "}
              ₹{contract.amount.toLocaleString("en-IN")}
            </p>

            <div className="modal-actions">
              <button
                className="action-btn"
                onClick={() => setShowApprovalModal(false)}
              >
                Cancel
              </button>
              <button
                className="action-btn primary"
                onClick={confirmApproval}
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default ContractDetails;
