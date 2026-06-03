import "./header.css";

export default function Header() {
   return (
      <header className="header">
         <div className="header-inner">
            <nav className="nav">

               <a href="./">Home</a>

               <div className="nav-dropdown">
                  <button className="nav-button">
                     Páginas
                  </button>

                  <div className="dropdown-menu">
                     <a href="locations">Localizações</a>
                     <a href="rsvp">RSVP</a>
                     <a href="gallery">Galeria</a>
                     <a href="questions">Perguntas</a>
                  </div>
               </div>

               <a href="gift-registry">Presentes</a>

            </nav>

         </div>
      </header>
   );
}