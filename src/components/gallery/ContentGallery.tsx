import "./contentGallery.css";

import { useEffect, useRef, useState } from "react";
import {
    uploadGalleryPhoto,
    getGalleryPhotos
} from "../../services/galleryService";

type AlbumType = "ceremony" | "party";

type GalleryPhoto = {
    id: number;
    image_url: string;
    album: AlbumType;
    created_at: string;
};

export default function ContentGallery() {

    const [selectedAlbum, setSelectedAlbum] = useState<AlbumType>("ceremony");
    const [showModal, setShowModal] = useState(false);
    const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
    const [loading, setLoading] = useState(false);

    // 👇 NOVO
    const [uploadMessage, setUploadMessage] = useState<string>("");

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const selectedUploadAlbum = useRef<AlbumType>("ceremony");

    useEffect(() => {
        loadPhotos();
    }, []);

    async function loadPhotos() {
        try {
            const data = await getGalleryPhotos();
            setPhotos(data || []);
        } catch (err) {
            console.error(err);
        }
    }

    const currentPhotos = photos.filter(p => p.album === selectedAlbum);

    function openUploadModal() {
        setShowModal(true);
    }

    function chooseAlbum(album: AlbumType) {
        selectedUploadAlbum.current = album;
        setShowModal(false);
        fileInputRef.current?.click();
    }

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files?.length) return;

        try {
            setLoading(true);
            setUploadMessage("");

            await Promise.all(
                Array.from(files).map(file =>
                    uploadGalleryPhoto(file, selectedUploadAlbum.current)
                )
            );

            await loadPhotos();

            // 👇 SUCESSO
            setUploadMessage(
                files.length === 1
                    ? "Foto enviada com sucesso!"
                    : "Fotos enviadas com sucesso!"
            );

            setTimeout(() => {
                setUploadMessage("");
            }, 3000);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    }

    async function handleDownload(url: string, filename: string) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();

            const blobUrl = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = filename;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(blobUrl);

        } catch (err) {
            console.error(err);
        }
    }

    return (
        <section className="gallery-section">

            <div className="container">

                <div className="gallery-container">

                    <div className="section-header">
                        <div className="luxury-title-main">
                            <span>Galeria</span>
                        </div>

                        <p className="section-subtitle">
                            Queremos viver essa festa com muita intensidade, mas sabemos que será impossível acompanhar tudo o que vai acontecer ao mesmo tempo. Pensando nisso, preparamos este espaço para construirmos o nosso álbum juntos.
                            Compartilhem aqui as fotos e os vídeos que tirarem durante o casamento. Um sorriso espontâneo, um abraço... Vamos amar reviver o nosso grande dia através dos olhos de vocês.
                        </p>
                    </div>

                    {/* UPLOAD */}
                    <div className="gallery-upload-card">
                        <div className="gallery-upload-content">

                            <div>
                                <h3>Partilhar fotos</h3>
                                <p>Envie várias fotos de uma vez.</p>
                            </div>

                            <button
                                className="upload-main-button"
                                onClick={openUploadModal}
                                disabled={loading}
                            >
                                {loading ? "A enviar..." : "Anexar fotos"}
                            </button>

                        </div>
                    </div>

                    {/* 👇 MENSAGEM DE SUCESSO */}
                    {uploadMessage && (
                        <div className="gallery-success-message">
                            {uploadMessage}
                        </div>
                    )}

                    {/* MODAL */}
                    {showModal && (
                        <div className="gallery-modal-overlay">
                            <div className="gallery-modal">

                                <h3>Escolher álbum</h3>

                                <div className="gallery-modal-actions">
                                    <button onClick={() => chooseAlbum("ceremony")}>
                                        Cerimónia
                                    </button>

                                    <button onClick={() => chooseAlbum("party")}>
                                        Festa
                                    </button>
                                </div>

                                <button
                                    className="gallery-close"
                                    onClick={() => setShowModal(false)}
                                >
                                    Fechar
                                </button>

                            </div>
                        </div>
                    )}

                    {/* INPUT (SÓ IMAGENS) */}
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />

                    {/* TABS */}
                    <div className="gallery-tabs">
                        <button
                            className={selectedAlbum === "ceremony" ? "active" : ""}
                            onClick={() => setSelectedAlbum("ceremony")}
                        >
                            Cerimónia
                        </button>

                        <button
                            className={selectedAlbum === "party" ? "active" : ""}
                            onClick={() => setSelectedAlbum("party")}
                        >
                            Festa
                        </button>
                    </div>

                    {/* GRID */}
                    <div className="gallery-grid">
                        {currentPhotos.map(photo => (
                            <div key={photo.id} className="gallery-item">

                                <img src={photo.image_url} alt="" />

                                <div className="gallery-overlay">
                                    <button
                                        className="download-btn"
                                        onClick={() =>
                                            handleDownload(photo.image_url, `foto-${photo.id}.jpg`)
                                        }
                                    >
                                        Descarregar
                                    </button>
                                </div>

                            </div>
                        ))}
                    </div>

                    {/* EMPTY */}
                    {currentPhotos.length === 0 && (
                        <div className="gallery-empty">
                            <h3>Sem fotos ainda</h3>
                            <p>Seja o primeiro a partilhar memórias.</p>
                        </div>
                    )}

                </div>

            </div>

        </section>
    );
}