
import "./Header.css";

function Header({ searchTerm, onSearchChange }) {
  return (
    <header className="topbar">
      <div className="brand">
        <h1>Contract Review</h1>
        <p>Contract Management workspace</p>
      </div>

      {/* <input
        type="search"
        placeholder="Search contracts..."
        className="search-input"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      /> */}

      <button className="shortcuts-btn">
        ? Shortcuts
      </button>
    </header>
  );
}

export default Header;
