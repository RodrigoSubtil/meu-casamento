import { IoIosArrowDown } from "react-icons/io";

import "./header.css";

export default function Header() {
   return (
      <header className="header">
         <div className="header-inner">
            <nav className="nav">

               <a href="./">Home</a>

               <div className="nav-dropdown">
                  <button className="nav-button" type="button">
                     Páginas
                     <span className="nav-arrow" aria-hidden="true">
                        <IoIosArrowDown />
                     </span>
                  </button>

                  <div className="dropdown-menu">
                     <a href="locations">Localizações</a>
                     <a href="rsvp">Convidados</a>
                     <a href="we">Nós</a>
                     <a href="gallery">Galeria</a>
                     <a href="about">Sobre</a>
                  </div>
               </div>

               <a href="gift-registry">Presentes</a>

            </nav>

         </div>
      </header>
   );
}
