import "./SearchBar.css";

function SearchBar({searchTerm, onSearchChange}) {
    return(
        <div className="search-bar-floating">
            <input
                type="text"
                placeholder="Search Pokemon by name or ID..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
            />
        </div>
    );
}

export default SearchBar;