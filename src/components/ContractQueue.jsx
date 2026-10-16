
import ContractCard from "./ContractCard";
import "./ContractQueue.css";

function ContractQueue({
  contracts,
  selectedId,
  onSelect,
  activeTab,
  searchTerm,
}) {
  const priorityOrder = { High: 1, Medium: 2, Low: 3 };

  const filteredContracts = contracts.filter((contract) => {
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
  });

  const sortedContracts = [...filteredContracts].sort((a, b) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const aDueDate = new Date(a.dueDate);
    const bDueDate = new Date(b.dueDate);

    const aOverdue =
      aDueDate < today &&
      !["Approved", "Rejected"].includes(a.status);

    const bOverdue =
      bDueDate < today &&
      !["Approved", "Rejected"].includes(b.status);

    if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;

    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }

    return aDueDate - bDueDate;
  });

  return (
    <section className="queue-panel">
      <div className="queue-heading">
        <h2>Contract Queue</h2>
        <span>{sortedContracts.length} contracts</span>
      </div>

      {sortedContracts.length === 0 ? (
        <p>
          {searchTerm.trim()
            ? `No contracts match "${searchTerm}".`
            : "No contracts are waiting for review."}
        </p>
      ) : (
        sortedContracts.map((contract) => (
          <button
            key={contract.id}
            className={
              selectedId === contract.id
                ? "contract-select selected"
                : "contract-select"
            }
            onClick={() => onSelect(contract.id)}
          >
            <ContractCard contract={contract} />
          </button>
        ))
      )}
    </section>
  );
}

export default ContractQueue;
