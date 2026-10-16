import "./StatusTabs.css";

const tabs = ["Open", "New", "In review", "Blocked", "Closed"];

function StatusTabs({ contracts, activeTab, onTabChange }) {
  function getCount(tab) {
    if (tab === "Open") {
      return contracts.filter((contract) =>
        ["New", "In review", "Blocked"].includes(contract.status)
      ).length;
    }

    if (tab === "Closed") {
      return contracts.filter((contract) =>
        ["Approved", "Rejected"].includes(contract.status)
      ).length;
    }

    return contracts.filter(
      (contract) => contract.status === tab
    ).length;
  }

  return (
    <nav className="tabs">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={activeTab === tab ? "tab active" : "tab"}
          onClick={() => onTabChange(tab)}
        >
          {tab}
          <span>{getCount(tab)}</span>
        </button>
      ))}
    </nav>
  );
}

export default StatusTabs;