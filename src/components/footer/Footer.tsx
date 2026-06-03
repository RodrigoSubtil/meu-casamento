import "./footer.css";

export default function Footer() {
   return (
      <footer className="footer">

         <div className="footer-container">

            {/* LEFT */}
            <div className="footer-left">
               <span>15 · 08 · 2026</span>
            </div>

            {/* CENTER */}
            <div className="footer-center">
               <span className="footer-names">
                  Maria Eduarda & Rodrigo
               </span>
            </div>

            {/* RIGHT */}
            <div className="footer-right">
               <span>Created with love</span>
            </div>

         </div>

      </footer>
   );
}