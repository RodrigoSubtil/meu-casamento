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
    // LOAD PHOTOS
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
    // FILTER
    // =========================
    const currentPhotos =
        photos.filter(p => p.album === selectedAlbum);

    // =========================
    // OPEN MODAL
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
    // MULTI UPLOAD
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

            alert(`${files.length} photos uploaded successfully!`);

        } catch (err) {
            console.error(err);
            alert("Upload failed.");
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
                throw new Error("Failed to fetch image");
            }

            const blob = await response.blob();

            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = filename || "wedding-memory.jpg";

            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);

            window.URL.revokeObjectURL(blobUrl);

        } catch (err) {
            console.error("Download error:", err);
            alert("Não foi possível baixar a imagem.");
        }
    }

    return (
        <section className="gallery-section">

            <div className="gallery-container">

                {/* HEADER */}
                <div className="gallery-header">

                    <div className="luxury-title">
                        <span>Gallery</span>
                    </div>

                    <h2 className="gallery-title">
                        Shared Wedding Moments
                    </h2>

                    <p className="gallery-subtitle">
                        Queremos viver essa festa com muita intensidade, mas sabemos que será impossível acompanhar tudo o que vai acontecer ao mesmo tempo. Pensando nisso, preparamos este espaço para construirmos o nosso álbum juntos.
                        Compartilhem aqui as fotos e os vídeos que tirarem durante o casamento. Um sorriso espontâneo, um abraço... Vamos amar reviver o nosso grande dia através dos olhos de vocês.
                    </p>

                </div>

                {/* UPLOAD CARD */}
                <div className="gallery-upload-card">

                    <div className="gallery-upload-content">

                        <div>
                            <h3>Share Your Photos</h3>
                            <p>Upload multiple photos at once.</p>
                        </div>

                        <button
                            className="upload-main-button"
                            onClick={openUploadModal}
                            disabled={loading}
                        >
                            {loading ? "Uploading..." : "Upload Photos"}
                        </button>

                    </div>
                </div>

                {/* MODAL */}
                {showModal && (
                    <div className="gallery-modal-overlay">
                        <div className="gallery-modal">

                            <h3>Choose album</h3>

                            <div className="gallery-modal-actions">

                                <button onClick={() => chooseAlbum("ceremony")}>
                                    Ceremony
                                </button>

                                <button onClick={() => chooseAlbum("party")}>
                                    Party
                                </button>

                            </div>

                            <button
                                className="gallery-close"
                                onClick={() => setShowModal(false)}
                            >
                                Close
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
                        Ceremony
                    </button>

                    <button
                        className={selectedAlbum === "party" ? "active" : ""}
                        onClick={() => setSelectedAlbum("party")}
                    >
                        Party
                    </button>

                </div>

                {/* GRID */}
                <div className="gallery-grid">

                    {currentPhotos.map(photo => (

                        <div className="gallery-item" key={photo.id}>

                            <img src={photo.image_url} alt="memory" />

                            <div className="gallery-overlay">

                                <button
                                    className="download-btn"
                                    onClick={() =>
                                        handleDownload(
                                            photo.image_url,
                                            `photo-${photo.id}.jpg`
                                        )
                                    }
                                >
                                    Download
                                </button>

                            </div>

                        </div>

                    ))}

                </div>

                {/* EMPTY */}
                {currentPhotos.length === 0 && (
                    <div className="gallery-empty">
                        <div className="gallery-empty-inner">
                            <h3>No photos yet</h3>
                            <p>Be the first to share memories.</p>
                        </div>
                    </div>
                )}

            </div>

        </section>
    );
}