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

type DownloadGroup = "all" | AlbumType;

export default function ContentGallery() {

    const [selectedAlbum, setSelectedAlbum] = useState<AlbumType>("ceremony");
    const [showModal, setShowModal] = useState(false);
    const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
    const [loading, setLoading] = useState(false);
    const [downloadingGroup, setDownloadingGroup] = useState<DownloadGroup | null>(null);

    // 👇 NOVO
    const [uploadMessage, setUploadMessage] = useState<string>("");

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const selectedUploadAlbum = useRef<AlbumType>("ceremony");

    useEffect(() => {
        loadPhotos();
    }, []);

    useEffect(() => {
        if (!showModal) return;

        const scrollY = window.scrollY;
        const previousOverflow = document.body.style.overflow;
        const previousPosition = document.body.style.position;
        const previousTop = document.body.style.top;
        const previousWidth = document.body.style.width;
        const previousHtmlOverflow = document.documentElement.style.overflow;

        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = "100%";

        return () => {
            document.documentElement.style.overflow = previousHtmlOverflow;
            document.body.style.overflow = previousOverflow;
            document.body.style.position = previousPosition;
            document.body.style.top = previousTop;
            document.body.style.width = previousWidth;
            window.scrollTo(0, scrollY);
        };
    }, [showModal]);

    async function loadPhotos() {
        try {
            const data = await getGalleryPhotos();
            setPhotos(data || []);
        } catch (err) {
            console.error(err);
        }
    }

    const currentPhotos = photos.filter(p => p.album === selectedAlbum);
    const ceremonyPhotos = photos.filter(p => p.album === "ceremony");
    const partyPhotos = photos.filter(p => p.album === "party");
    const hasPhotos = photos.length > 0;

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

    async function downloadFile(url: string, filename: string) {
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

    function getPhotoFilename(photo: GalleryPhoto, index = 0) {
        const albumName = photo.album === "ceremony" ? "cerimonia" : "festa";
        const extension = photo.image_url.split(".").pop()?.split("?")[0] || "jpg";

        return `${albumName}-foto-${index + 1}-${photo.id}.${extension}`;
    }

    async function handleDownload(url: string, filename: string) {
        await downloadFile(url, filename);
    }

    async function handleDownloadMany(group: DownloadGroup) {
        const photosToDownload =
            group === "all"
                ? photos
                : photos.filter(photo => photo.album === group);

        if (photosToDownload.length === 0) return;

        try {
            setDownloadingGroup(group);

            for (const [index, photo] of photosToDownload.entries()) {
                await downloadFile(photo.image_url, getPhotoFilename(photo, index));
            }
        } finally {
            setDownloadingGroup(null);
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

                    {/* DOWNLOADS */}
                    {hasPhotos && (
                        <div className="gallery-downloads">
                            <button
                                type="button"
                                onClick={() => handleDownloadMany("all")}
                                disabled={downloadingGroup !== null}
                            >
                                {downloadingGroup === "all"
                                    ? "A baixar..."
                                    : "Descarregar todas as fotos"}
                            </button>

                            {ceremonyPhotos.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => handleDownloadMany("ceremony")}
                                    disabled={downloadingGroup !== null}
                                >
                                    {downloadingGroup === "ceremony"
                                        ? "A baixar..."
                                        : "Descarregar cerimônia"}
                                </button>
                            )}

                            {partyPhotos.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => handleDownloadMany("party")}
                                    disabled={downloadingGroup !== null}
                                >
                                    {downloadingGroup === "party"
                                        ? "A baixar..."
                                        : "Descarregar festa"}
                                </button>
                            )}
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
