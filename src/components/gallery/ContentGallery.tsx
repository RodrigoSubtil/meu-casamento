import "./contentGallery.css";

import { FaArrowRight, FaImages } from "react-icons/fa";
import PortfolioNotice from "../portfolioNotice/PortfolioNotice";

export default function ContentGallery() {
    return (
        <section className="gallery-section">
            <div className="gallery-heading">
                <div className="container">
                    <div className="gallery-container">
                        <div className="section-header">
                            <div className="luxury-title-main">
                                <span>Galeria</span>
                            </div>

                            <p className="section-subtitle">
                                Obrigado por nos permitirem enxergar nosso casamento pelos olhos de
                                vocês. Agradecemos por cada registro compartilhado e, acima de tudo,
                                pela presença de cada um, que tornou esse dia inesquecível.
                            </p>
                        </div>

                        <PortfolioNotice id="gallery-closed-notice">
                            Já não é possível acessar o álbum compartilhado por este site.
                            Esta ação está encerrada.
                        </PortfolioNotice>
                    </div>
                </div>
            </div>

            <div className="gallery-album-section">
                <div className="container gallery-album-inner">
                    <button
                        className="gallery-album-card"
                        type="button"
                        disabled
                        aria-describedby="gallery-closed-notice"
                    >
                        <span className="gallery-album-icon" aria-hidden="true">
                            <FaImages />
                        </span>

                        <span className="gallery-album-copy">
                            <strong>Álbum compartilhado</strong>
                            <span>Ver, adicionar e baixar fotos no Google Fotos</span>
                        </span>

                        <FaArrowRight className="gallery-album-arrow" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </section>
    );
}
