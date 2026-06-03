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

    const [selectedAlbum, setSelectedAlbum] =
        useState<AlbumType>("ceremony");

    const [showModal, setShowModal] =
        useState(false);

    const [photos, setPhotos] =
        useState<GalleryPhoto[]>([]);

    const [loading, setLoading] =
        useState(false);

    const fileInputRef =
        useRef<HTMLInputElement | null>(null);

    const selectedUploadAlbum =
        useRef<AlbumType>("ceremony");

    // =========================
    // CARREGAR FOTOS
    // =========================
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

    // =========================
    // FILTRO
    // =========================
    const currentPhotos =
        photos.filter(p => p.album === selectedAlbum);

    // =========================
    // ABRIR MODAL
    // =========================
    function openUploadModal() {
        setShowModal(true);
    }

    function chooseAlbum(album: AlbumType) {
        selectedUploadAlbum.current = album;
        setShowModal(false);
        fileInputRef.current?.click();
    }

    // =========================
    // UPLOAD MÚLTIPLO
    // =========================
    async function handleFileChange(
        e: React.ChangeEvent<HTMLInputElement>
    ) {
        const files = e.target.files;

        if (!files || files.length === 0) return;

        try {
            setLoading(true);

            const uploads = Array.from(files).map(file =>
                uploadGalleryPhoto(
                    file,
                    selectedUploadAlbum.current
                )
            );

            await Promise.all(uploads);

            await loadPhotos();

            alert(`${files.length} fotos enviadas com sucesso!`);

        } catch (err) {
            console.error(err);
            alert("Falha no upload.");
        } finally {
            setLoading(false);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    }

    // =========================
    // DOWNLOAD (CORRETO E ROBUSTO)
    // =========================
    async function handleDownload(url: string, filename: string) {
        try {
            const response = await fetch(url, {
                mode: "cors",
                cache: "no-cache"
            });

            if (!response.ok) {
                throw new Error("Falha ao obter imagem");
            }

            const blob = await response.blob();

            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = filename || "memoria-casamento.jpg";

            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);

            window.URL.revokeObjectURL(blobUrl);

        } catch (err) {
            console.error("Erro no download:", err);
            alert("Não foi possível baixar a imagem.");
        }
    }

    return (
        <section className="gallery-section">

            <div className="gallery-container">

                {/* HEADER */}
                <div className="section-header">

                    <div className="luxury-title">
                        <span>Galeria</span>
                    </div>

                    <h2 className="section-title">
                        Momentos do nosso casamento
                    </h2>

                    <p className="section-subtitle">
                        Queremos viver esta festa com muita intensidade, mas sabemos que será impossível acompanhar tudo ao mesmo tempo.
                        Por isso criámos este espaço para construirmos o nosso álbum juntos.
                        Partilhem aqui as fotos e vídeos do casamento — sorrisos, abraços e momentos especiais.
                        Vamos adorar reviver este dia através dos vossos olhos.
                    </p>

                </div>

                {/* UPLOAD CARD */}
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
                            {loading ? "A enviar..." : "Enviar fotos"}
                        </button>

                    </div>
                </div>

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

                {/* FILE INPUT */}
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

                        <div className="gallery-item" key={photo.id}>

                            <img src={photo.image_url} alt="memória do casamento" />

                            <div className="gallery-overlay">

                                <button
                                    className="download-btn"
                                    onClick={() =>
                                        handleDownload(
                                            photo.image_url,
                                            `foto-${photo.id}.jpg`
                                        )
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
                        <div className="gallery-empty-inner">
                            <h3>Sem fotos ainda</h3>
                            <p>Seja o primeiro a partilhar memórias.</p>
                        </div>
                    </div>
                )}

            </div>

        </section>
    );
}