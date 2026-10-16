
import { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import StatusTabs from "./components/StatusTabs";
import ContractQueue from "./components/ContractQueue";
import ContractDetails from "./components/ContractDetails";
import { contracts } from "./data/contracts";
import "./App.css";

// Read the contract ID from the URL when the app starts.
const getInitialSelectedId = () => {
  const params = new URLSearchParams(window.location.search);
  const contractId = params.get("contract");

  const exists = contracts.some(
    (contract) => contract.id === contractId
  );

  return exists ? contractId : contracts[0].id;
};

function App() {
  const [contractList, setContractList] = useState(contracts);
  const [selectedId, setSelectedId] = useState(getInitialSelectedId);
  const [activeTab, setActiveTab] = useState("Open");
  const [searchTerm, setSearchTerm] = useState("");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [shortcutAction, setShortcutAction] = useState("");
  const [toast, setToast] = useState("");
  const [undoData, setUndoData] = useState(null);

  const searchRef = useRef(null);
  const undoTimerRef = useRef(null);

  const selectedContract = contractList.find(
    (contract) => contract.id === selectedId
  );

  // Keep the selected contract ID in the URL.
  useEffect(() => {
    const url = new URL(window.location.href);

    if (selectedId) {
      url.searchParams.set("contract", selectedId);
    } else {
      url.searchParams.delete("contract");
    }

    window.history.replaceState({}, "", url);
  }, [selectedId]);

  // Filter and sort contracts.
  const visibleContracts = contractList
    .filter((contract) => {
      const matchesTab =
        activeTab === "Open"
          ? ["New", "In review", "Blocked"].includes(contract.status)
          : activeTab === "Closed"
          ? ["Approved", "Rejected"].includes(contract.status)
          : contract.status === activeTab;

      const search = searchTerm.trim().toLowerCase();

      const matchesSearch =
        contract.id.toLowerCase().includes(search) ||
        contract.title.toLowerCase().includes(search) ||
        contract.supplier.toLowerCase().includes(search);

      return matchesTab && matchesSearch;
    })
    .slice()
    .sort((a, b) => {
      const today = new Date().toISOString().slice(0, 10);

      const aOverdue =
        !["Approved", "Rejected"].includes(a.status) &&
        a.dueDate < today;

      const bOverdue =
        !["Approved", "Rejected"].includes(b.status) &&
        b.dueDate < today;

      // Overdue contracts first.
      if (aOverdue !== bOverdue) {
        return aOverdue ? -1 : 1;
      }

      // High priority before Medium and Low.
      const priorityOrder = { High: 0, Medium: 1, Low: 2 };

      const priorityDifference =
        priorityOrder[a.priority] - priorityOrder[b.priority];

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      // Earlier due dates first.
      return a.dueDate.localeCompare(b.dueDate);
    });

  // Clear timers when the app unmounts.
  useEffect(() => {
    return () => {
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }
    };
  }, []);

  // Handle contract actions.
  const handleAction = (action, note = "") => {
    if (!selectedContract) return;

    const statusMap = {
      "Start Review": "In review",
      Approve: "Approved",
      Reject: "Rejected",
      Block: "Blocked",
      "Resume Review": "In review",
    };

    const nextStatus = statusMap[action];

    if (!nextStatus) return;

    // Save the previous state for Undo.
    const previousState = {
      contracts: contractList,
      selectedId,
    };

    const contractId = selectedContract.id;
    const timestamp = new Date().toLocaleString();

    const updatedContracts = contractList.map((contract) => {
      if (contract.id !== contractId) return contract;

      return {
        ...contract,
        status: nextStatus,
        auditHistory: [
          ...(contract.auditHistory || []),
          {
            action,
            note: note || `Status changed to ${nextStatus}.`,
            timestamp,
          },
        ],
      };
    });

    setContractList(updatedContracts);

    // Select the next contract in the current queue.
    const currentIndex = visibleContracts.findIndex(
      (contract) => contract.id === contractId
    );

    const nextContract =
      visibleContracts[currentIndex + 1] ||
      visibleContracts.find((contract) => contract.id !== contractId);

    if (nextContract) {
      setSelectedId(nextContract.id);
    } else {
      const fallback = updatedContracts.find(
        (contract) => contract.id !== contractId
      );

      if (fallback) {
        setSelectedId(fallback.id);
      }
    }

    // Start a new 6-second Undo window.
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
    }

    setUndoData(previousState);
    setToast(`${contractId}: ${action} successful.`);

    undoTimerRef.current = setTimeout(() => {
      setUndoData(null);
      setToast("");
      undoTimerRef.current = null;
    }, 6000);
  };

  // Restore the previous state.
  const handleUndo = () => {
    if (!undoData) return;

    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }

    setContractList(undoData.contracts);
    setSelectedId(undoData.selectedId);
    setUndoData(null);
    setToast("Action undone successfully.");

    undoTimerRef.current = setTimeout(() => {
      setToast("");
      undoTimerRef.current = null;
    }, 2000);
  };

  // Keyboard shortcuts.
  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;

      const isTyping =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

      if (isTyping) return;
      if (event.ctrlKey || event.altKey || event.metaKey) return;

      if (event.key === "Escape") {
        setShowShortcuts(false);
        setShortcutAction("Escape");
        return;
      }

      if (event.key === "?") {
        event.preventDefault();
        setShowShortcuts((previous) => !previous);
        return;
      }

      if (event.key === "/") {
        event.preventDefault();
        searchRef.current?.focus();
        return;
      }

      const key = event.key.toLowerCase();

      if (["a", "r", "b"].includes(key)) {
        setShortcutAction(key.toUpperCase());
        return;
      }

      if (visibleContracts.length === 0) return;

      const currentIndex = visibleContracts.findIndex(
        (contract) => contract.id === selectedId
      );

      if (key === "j" || event.key === "ArrowDown") {
        event.preventDefault();

        const nextIndex =
          currentIndex < 0
            ? 0
            : (currentIndex + 1) % visibleContracts.length;

        setSelectedId(visibleContracts[nextIndex].id);
      }

      if (key === "k" || event.key === "ArrowUp") {
        event.preventDefault();

        const previousIndex =
          currentIndex < 0
            ? visibleContracts.length - 1
            : (currentIndex - 1 + visibleContracts.length) %
              visibleContracts.length;

        setSelectedId(visibleContracts[previousIndex].id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [visibleContracts, selectedId]);

  return (
    <div className="app">
      <Header />

      <StatusTabs
        contracts={contractList}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="workspace">
        <ContractQueue
          contracts={contractList}
          selectedId={selectedId}
          onSelect={setSelectedId}
          activeTab={activeTab}
          searchTerm={searchTerm}
        />

        <div className="details-column">
          <input
            ref={searchRef}
            type="search"
            placeholder="Search contracts..."
            className="search-input details-search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          <ContractDetails
            contract={selectedContract}
            onAction={handleAction}
            shortcutAction={shortcutAction}
            onShortcutHandled={() => setShortcutAction("")}
          />
        </div>
      </div>

      {/* Success toast and Undo button */}
      {toast && (
        <div className="toast-message" role="status">
          <span>{toast}</span>

          {undoData && (
            <button
              className="undo-btn"
              onClick={handleUndo}
            >
              Undo
            </button>
          )}
        </div>
      )}

      {/* Keyboard shortcuts dialog */}
      {showShortcuts && (
        <div className="modal-overlay">
          <div
            className="note-modal shortcuts-modal"
            role="dialog"
            aria-modal="true"
          >
            <h2>Keyboard Shortcuts</h2>
            <p><strong>J / ↓</strong> — Next contract</p>
            <p><strong>K / ↑</strong> — Previous contract</p>
            <p><strong>A</strong> — Approve</p>
            <p><strong>R</strong> — Reject</p>
            <p><strong>B</strong> — Block</p>
            <p><strong>/</strong> — Focus search</p>
            <p><strong>Esc</strong> — Close modal</p>
            <p><strong>?</strong> — Toggle shortcuts help</p>

            <div className="modal-actions">
              <button
                className="action-btn primary"
                onClick={() => setShowShortcuts(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
