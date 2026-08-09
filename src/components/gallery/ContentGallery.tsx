import "./contentGallery.css";

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaDownload, FaEye, FaPlay, FaTimes, FaTrash } from "react-icons/fa";
import {
    deleteGalleryPhoto,
    uploadGalleryPhoto,
    getGalleryPhotos,
    type GalleryAlbum,
    type GalleryPhoto
} from "../../services/galleryService";

type DownloadGroup = "all" | GalleryAlbum;
type GalleryFilter = "all" | GalleryAlbum;

export default function ContentGallery() {

    const [selectedAlbum, setSelectedAlbum] = useState<GalleryFilter>("all");
    const [showModal, setShowModal] = useState(false);
    const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
    const [loading, setLoading] = useState(false);
    const [downloadingGroup, setDownloadingGroup] = useState<DownloadGroup | null>(null);
    const [deletingPhotoId, setDeletingPhotoId] = useState<number | null>(null);
    const [viewingPhoto, setViewingPhoto] = useState<GalleryPhoto | null>(null);
    const [galleryMessage, setGalleryMessage] = useState<string>("");

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const selectedUploadAlbum = useRef<GalleryAlbum>("ceremony");

    useEffect(() => {
        loadPhotos();
    }, []);

    useEffect(() => {
        if (!showModal && !viewingPhoto) return;

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
    }, [showModal, viewingPhoto]);

    useEffect(() => {
        if (!viewingPhoto) return;

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") setViewingPhoto(null);
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [viewingPhoto]);

    async function loadPhotos() {
        try {
            const data = await getGalleryPhotos();
            setPhotos(data || []);
        } catch (err) {
            console.error(err);
        }
    }

    const currentPhotos =
        selectedAlbum === "all"
            ? photos
            : photos.filter(p => p.album === selectedAlbum);
    const ceremonyPhotos = photos.filter(p => p.album === "ceremony");
    const partyPhotos = photos.filter(p => p.album === "party");
    const hasPhotos = photos.length > 0;

    function openUploadModal() {
        setShowModal(true);
    }

    function chooseAlbum(album: GalleryAlbum) {
        selectedUploadAlbum.current = album;
        setShowModal(false);
        fileInputRef.current?.click();
    }

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files?.length) return;

        try {
            setLoading(true);
            setGalleryMessage("");

            await Promise.all(
                Array.from(files).map(file =>
                    uploadGalleryPhoto(file, selectedUploadAlbum.current)
                )
            );

            await loadPhotos();

            setGalleryMessage(
                files.length === 1
                    ? "Foto enviada com sucesso!"
                    : "Fotos enviadas com sucesso!"
            );

            setTimeout(() => {
                setGalleryMessage("");
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

    async function handleDelete(photo: GalleryPhoto) {
        const confirmed = window.confirm(
            "Tem certeza que deseja apagar esta foto? Esta ação não pode ser desfeita."
        );

        if (!confirmed) return;

        try {
            setDeletingPhotoId(photo.id);
            setGalleryMessage("");
            await deleteGalleryPhoto(photo);
            setPhotos(current => current.filter(item => item.id !== photo.id));
            setViewingPhoto(current => current?.id === photo.id ? null : current);
            setGalleryMessage("Foto apagada com sucesso.");
            setTimeout(() => setGalleryMessage(""), 3000);
        } catch (err) {
            console.error(err);
            setGalleryMessage("Não foi possível apagar a foto.");
        } finally {
            setDeletingPhotoId(null);
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

                            <div className="gallery-upload-actions">
                                <button
                                    className="upload-main-button"
                                    onClick={openUploadModal}
                                    disabled={loading}
                                >
                                    {loading ? "A enviar..." : "Anexar fotos"}
                                </button>

                                {hasPhotos && (
                                    <Link className="gallery-slides-button" to="/slides">
                                        <FaPlay aria-hidden="true" />
                                        Ver em slides
                                    </Link>
                                )}
                            </div>

                        </div>
                    </div>

                    {galleryMessage && (
                        <div className="gallery-success-message">
                            {galleryMessage}
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
                                    : "Download álbuns Cerimônia e Festa"}
                            </button>

                            {ceremonyPhotos.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => handleDownloadMany("ceremony")}
                                    disabled={downloadingGroup !== null}
                                >
                                    {downloadingGroup === "ceremony"
                                        ? "A baixar..."
                                        : "Download álbum Cerimônia"}
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
                                        : "Download álbum Festa"}
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
                                        Cerimônia
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
                            className={selectedAlbum === "all" ? "active" : ""}
                            onClick={() => setSelectedAlbum("all")}
                        >
                            Todas
                        </button>

                        <button
                            className={selectedAlbum === "ceremony" ? "active" : ""}
                            onClick={() => setSelectedAlbum("ceremony")}
                        >
                            Cerimônia
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

                                <div className="gallery-item-actions">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDownload(photo.image_url, getPhotoFilename(photo))
                                        }
                                    >
                                        <FaDownload aria-hidden="true" />
                                        Download
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setViewingPhoto(photo)}
                                    >
                                        <FaEye aria-hidden="true" />
                                        Ver foto
                                    </button>

                                    <button
                                        type="button"
                                        className="gallery-delete-button"
                                        onClick={() => handleDelete(photo)}
                                        disabled={deletingPhotoId === photo.id}
                                    >
                                        <FaTrash aria-hidden="true" />
                                        {deletingPhotoId === photo.id ? "Apagando..." : "Apagar foto"}
                                    </button>
                                </div>

                            </div>
                        ))}
                    </div>

                    {viewingPhoto && (
                        <div
                            className="gallery-lightbox"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Visualização da foto"
                            onClick={() => setViewingPhoto(null)}
                        >
                            <button
                                type="button"
                                className="gallery-lightbox-close"
                                aria-label="Fechar foto"
                                onClick={() => setViewingPhoto(null)}
                            >
                                <FaTimes aria-hidden="true" />
                            </button>

                            <img
                                src={viewingPhoto.image_url}
                                alt="Foto ampliada da galeria"
                                onClick={event => event.stopPropagation()}
                            />
                        </div>
                    )}

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
