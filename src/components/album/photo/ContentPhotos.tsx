import "./contentPhotos.css";

export default function ContentPhotos() {
   return (
      <section className="album-section">

         <div className="album-container">

            {/* HEADER */}
            <div className="section-header">

               <div className="luxury-title">
                  <span>Fotos</span>
               </div>

            </div>

            {/* ===== 2021 ===== */}
            <div className="year-block">

               <h2 className="year-title">2021</h2>

               <div className="year-grid">

                  <div className="photo">
                     <img src="img/20211.jpeg" alt="2021 foto 1" />
                  </div>

                  <div className="photo">
                     <img src="img/20212.jpeg" alt="2021 foto 2" />
                  </div>

               </div>
            </div>

            {/* ===== 2022 ===== */}
            <div className="year-block">

               <h2 className="year-title">2022</h2>

               <div className="year-grid">

                  <div className="photo">
                     <img src="img/20221.jpeg" alt="2022 foto 1" />
                  </div>

                  <div className="photo">
                     <img src="img/20222.jpeg" alt="2022 foto 2" />
                  </div>

               </div>
            </div>

            {/* ===== 2023 ===== */}
            <div className="year-block">

               <h2 className="year-title">2023</h2>

               <div className="year-grid">

                  <div className="photo">
                     <img src="img/20231.jpeg" alt="2023 foto 1" />
                  </div>

                  <div className="photo">
                     <img src="img/20232.jpeg" alt="2023 foto 2" />
                  </div>

               </div>
            </div>

            {/* ===== 2024 ===== */}
            <div className="year-block">

               <h2 className="year-title">2024</h2>

               <div className="year-grid">

                  <div className="photo">
                     <img src="img/20241.jpeg" alt="2024 foto 1" />
                  </div>

                  <div className="photo">
                     <img src="img/20242.jpeg" alt="2024 foto 2" />
                  </div>

               </div>
            </div>

            {/* ===== 2025 ===== */}
            <div className="year-block">

               <h2 className="year-title">2025</h2>

               <div className="year-grid">

                  <div className="photo">
                     <img src="img/foto4.jpeg" alt="2025 foto 1" />
                  </div>

                  <div className="photo">
                     <img src="img/foto5.jpeg" alt="2025 foto 2" />
                  </div>

               </div>
            </div>

            {/* ===== 2026 ===== */}
            <div className="year-block">

               <h2 className="year-title">2026</h2>

               <div className="year-grid">

                  <div className="photo">
                     <img src="img/foto1.jpg" alt="2026 foto 1" />
                  </div>

                  <div className="photo">
                     <img src="img/foto2.jpeg" alt="2026 foto 2" />
                  </div>

               </div>
            </div>

         </div>

      </section>
   );
}