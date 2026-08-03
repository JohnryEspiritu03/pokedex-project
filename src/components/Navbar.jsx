import "./Navbar.css";

function Navbar() {
    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
    return(
        <nav className="navbar">
            <div className="logo" onClick={scrollToTop} style={{ cursor: "pointer" }}>
                Pokédex
            </div>
        </nav>
    );
}

export default Navbar;