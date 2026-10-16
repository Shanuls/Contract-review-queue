
import { useState } from "react";
import Header from "./components/Header";
import StatusTabs from "./components/StatusTabs";
import ContractQueue from "./components/ContractQueue";
import ContractDetails from "./components/ContractDetails";
import { contracts } from "./data/contracts";
import "./App.css";

function App() {
  const [selectedId, setSelectedId] = useState(contracts[0].id);
  const [activeTab, setActiveTab] = useState("Open");
  const [searchTerm, setSearchTerm] = useState("");

  const selectedContract = contracts.find(
    (contract) => contract.id === selectedId
  );

  return (
    <div className="app">
      <Header />

      <StatusTabs
        contracts={contracts}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="workspace">
        <ContractQueue
          contracts={contracts}
          selectedId={selectedId}
          onSelect={setSelectedId}
          activeTab={activeTab}
          searchTerm={searchTerm}
        />

        <div className="details-column">
          <input
            type="search"
            placeholder="Search contracts..."
            className="search-input details-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <ContractDetails contract={selectedContract} />
        </div>
      </div>
    </div>
  );
}

export default App;
