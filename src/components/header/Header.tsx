import "./header.css";

export default function Header() {
   return (
      <header className="header">
         <div className="header-inner">
            <nav className="nav">

               <a href="./">Home</a>

               <div className="nav-dropdown">
                  <button className="nav-button">
                     Pages
                  </button>

                  <div className="dropdown-menu">
                     <a href="locations">Locations</a>
                     <a href="rsvp">RSVP</a>
                     <a href="questions">Questions</a>
                     <a href="gallery">Gallery</a>
                  </div>
               </div>

               <a href="gift-registry">Gift Registry</a>

            </nav>

         </div>
      </header>
   );
}