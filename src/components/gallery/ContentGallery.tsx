import "./contentGallery.css";

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaCheck, FaDownload, FaEye, FaPlay, FaTimes, FaTrash } from "react-icons/fa";
import {
    deleteGalleryPhoto,
    uploadGalleryPhoto,
    getGalleryPhotos,
    type GalleryAlbum,
    type GalleryPhoto
} from "../../services/galleryService";

type DownloadGroup = "all" | GalleryAlbum;
type GalleryFilter = "all" | GalleryAlbum;
type AlbumDownloadStatus = "ready" | "preparing" | "completed" | "error";

type AlbumDownloadModal = {
    group: DownloadGroup;
    status: AlbumDownloadStatus;
    progress: number;
    preparedPhotos: number;
    remainingPhotos: number;
};

const MOBILE_DOWNLOAD_BATCH_SIZE = 20;

export default function ContentGallery() {

    const [selectedAlbum, setSelectedAlbum] = useState<GalleryFilter>("all");
    const [showModal, setShowModal] = useState(false);
    const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
    const [loading, setLoading] = useState(false);
    const [downloadingGroup, setDownloadingGroup] = useState<DownloadGroup | null>(null);
    const [downloadingPhotoId, setDownloadingPhotoId] = useState<number | null>(null);
    const [mobileBatchOffsets, setMobileBatchOffsets] = useState<Record<DownloadGroup, number>>({
        all: 0,
        ceremony: 0,
        party: 0
    });
    const [albumDownloadModal, setAlbumDownloadModal] = useState<AlbumDownloadModal | null>(null);
    const [deletingPhotoId, setDeletingPhotoId] = useState<number | null>(null);
    const [viewingPhoto, setViewingPhoto] = useState<GalleryPhoto | null>(null);
    const [galleryMessage, setGalleryMessage] = useState<string>("");

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const selectedUploadAlbum = useRef<GalleryAlbum>("ceremony");
    const hasOpenDialog = showModal || viewingPhoto !== null || albumDownloadModal !== null;

    useEffect(() => {
        loadPhotos();
    }, []);

    useEffect(() => {
        if (!hasOpenDialog) return;

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
    }, [hasOpenDialog]);

    useEffect(() => {
        if (!viewingPhoto) return;

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") setViewingPhoto(null);
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [viewingPhoto]);

    useEffect(() => {
        if (!albumDownloadModal || albumDownloadModal.status === "preparing") return;

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") setAlbumDownloadModal(null);
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [albumDownloadModal]);

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

    function getPhotoFilename(photo: GalleryPhoto, index = 0) {
        const albumName = photo.album === "ceremony" ? "cerimonia" : "festa";
        const extension = photo.image_url.split(".").pop()?.split("?")[0] || "jpg";

        return `${albumName}-foto-${index + 1}-${photo.id}.${extension}`;
    }

    function isMobileDevice() {
        return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
            || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
            || (navigator.maxTouchPoints > 1 && window.matchMedia("(pointer: coarse)").matches);
    }

    async function createPhotoFile(photo: GalleryPhoto, index = 0) {
        const response = await fetch(photo.image_url, { cache: "force-cache" });

        if (!response.ok) {
            throw new Error(`Falha ao carregar a foto: ${response.status}`);
        }

        const blob = await response.blob();

        return new File(
            [blob],
            getPhotoFilename(photo, index),
            { type: blob.type || "image/jpeg" }
        );
    }

    async function shareFilesOnMobile(files: File[], title: string) {
        if (!isMobileDevice()) return false;
        if (typeof navigator.share !== "function") return false;
        if (typeof navigator.canShare !== "function") return false;
        if (!navigator.canShare({ files })) return false;

        try {
            await navigator.share({ files, title });
            return true;
        } catch (error) {
            if (isShareCancellation(error)) throw error;

            console.warn("Compartilhamento nativo indisponível:", error);
            return false;
        }
    }

    function startBrowserDownload(file: File) {
        const blobUrl = URL.createObjectURL(file);
        const link = document.createElement("a");

        link.href = blobUrl;
        link.download = file.name;
        link.style.display = "none";

        document.body.appendChild(link);
        link.click();
        link.remove();

        // Mobile browsers may start the download after the click handler ends.
        window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    }

    function isShareCancellation(error: unknown) {
        return error instanceof DOMException && error.name === "AbortError";
    }

    async function handleDownload(photo: GalleryPhoto) {
        try {
            setDownloadingPhotoId(photo.id);
            setGalleryMessage("");

            const file = await createPhotoFile(photo);
            const shared = await shareFilesOnMobile([file], "Foto do casamento");

            if (!shared) {
                startBrowserDownload(file);
            }
        } catch (error) {
            if (isShareCancellation(error)) return;

            console.error(error);
            setGalleryMessage("Não foi possível salvar a foto. Tente novamente.");
        } finally {
            setDownloadingPhotoId(null);
        }
    }

    function getPhotosForDownload(group: DownloadGroup) {
        return group === "all"
            ? photos
            : photos.filter(photo => photo.album === group);
    }

    function openAlbumDownload(group: DownloadGroup) {
        const photosToDownload = getPhotosForDownload(group);

        if (photosToDownload.length === 0) return;

        if (isMobileDevice()) {
            const savedOffset = mobileBatchOffsets[group] < photosToDownload.length
                ? mobileBatchOffsets[group]
                : 0;

            setAlbumDownloadModal({
                group,
                status: "ready",
                progress: 0,
                preparedPhotos: 0,
                remainingPhotos: photosToDownload.length - savedOffset
            });
            return;
        }

        void handleDesktopAlbumDownload(group, photosToDownload);
    }

    async function handleDesktopAlbumDownload(
        group: DownloadGroup,
        photosToDownload: GalleryPhoto[]
    ) {
        try {
            setDownloadingGroup(group);
            setGalleryMessage("");

            for (const [index, photo] of photosToDownload.entries()) {
                const file = await createPhotoFile(photo, index);
                startBrowserDownload(file);
                await new Promise(resolve => window.setTimeout(resolve, 250));
            }
        } catch (error) {
            console.error(error);
            setGalleryMessage("Não foi possível salvar o álbum. Tente baixar as fotos individualmente.");
        } finally {
            setDownloadingGroup(null);
        }
    }

    async function handleMobileBatchDownload() {
        if (!albumDownloadModal) return;

        const { group } = albumDownloadModal;
        const photosToDownload = getPhotosForDownload(group);
        const savedOffset = mobileBatchOffsets[group];
        const startIndex = savedOffset < photosToDownload.length ? savedOffset : 0;
        const selectedPhotos = photosToDownload.slice(
            startIndex,
            startIndex + MOBILE_DOWNLOAD_BATCH_SIZE
        );

        if (selectedPhotos.length === 0) return;

        try {
            setDownloadingGroup(group);
            setAlbumDownloadModal(current => current && ({
                ...current,
                status: "preparing",
                progress: 0,
                preparedPhotos: 0
            }));

            const files: File[] = [];

            for (const [index, photo] of selectedPhotos.entries()) {
                files.push(await createPhotoFile(photo, startIndex + index));

                setAlbumDownloadModal(current => current && ({
                    ...current,
                    progress: Math.round(((index + 1) / selectedPhotos.length) * 100),
                    preparedPhotos: index + 1
                }));
            }

            const albumTitle = group === "ceremony"
                ? "Álbum da cerimônia"
                : group === "party"
                    ? "Álbum da festa"
                    : "Álbuns do casamento";
            const shared = await shareFilesOnMobile(files, albumTitle);

            if (!shared) {
                for (const file of files) {
                    startBrowserDownload(file);
                    await new Promise(resolve => window.setTimeout(resolve, 250));
                }
            }

            const nextOffset = startIndex + selectedPhotos.length;
            const completedAlbum = nextOffset >= photosToDownload.length;

            setMobileBatchOffsets(current => ({
                ...current,
                [group]: completedAlbum ? 0 : nextOffset
            }));
            setAlbumDownloadModal(current => current && ({
                ...current,
                status: "completed",
                progress: 100,
                preparedPhotos: selectedPhotos.length,
                remainingPhotos: Math.max(photosToDownload.length - nextOffset, 0)
            }));
        } catch (error) {
            if (isShareCancellation(error)) {
                setAlbumDownloadModal(current => current && ({
                    ...current,
                    status: "ready",
                    progress: 0,
                    preparedPhotos: 0
                }));
                return;
            }

            console.error(error);
            setAlbumDownloadModal(current => current && ({
                ...current,
                status: "error"
            }));
        } finally {
            setDownloadingGroup(null);
        }
    }

    function closeAlbumDownloadModal() {
        if (albumDownloadModal?.status === "preparing") return;
        setAlbumDownloadModal(null);
    }

    function getAlbumDownloadLabel(
        group: DownloadGroup,
        totalPhotos: number,
        defaultLabel: string
    ) {
        const offset = mobileBatchOffsets[group];

        if (!isMobileDevice() || offset <= 0 || offset >= totalPhotos) {
            return defaultLabel;
        }

        return `Continuar download (${totalPhotos - offset} restantes)`;
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

    const modalBatchSize = albumDownloadModal
        ? Math.min(MOBILE_DOWNLOAD_BATCH_SIZE, albumDownloadModal.remainingPhotos)
        : 0;
    const modalAlbumName = albumDownloadModal?.group === "ceremony"
        ? "Cerimônia"
        : albumDownloadModal?.group === "party"
            ? "Festa"
            : "Cerimônia e Festa";

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
                                onClick={() => openAlbumDownload("all")}
                                disabled={downloadingGroup !== null}
                            >
                                {downloadingGroup === "all"
                                    ? "Preparando..."
                                    : getAlbumDownloadLabel(
                                        "all",
                                        photos.length,
                                        "Download álbuns Cerimônia e Festa"
                                    )}
                            </button>

                            {ceremonyPhotos.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => openAlbumDownload("ceremony")}
                                    disabled={downloadingGroup !== null}
                                >
                                    {downloadingGroup === "ceremony"
                                        ? "Preparando..."
                                        : getAlbumDownloadLabel(
                                            "ceremony",
                                            ceremonyPhotos.length,
                                            "Download álbum Cerimônia"
                                        )}
                                </button>
                            )}

                            {partyPhotos.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => openAlbumDownload("party")}
                                    disabled={downloadingGroup !== null}
                                >
                                    {downloadingGroup === "party"
                                        ? "Preparando..."
                                        : getAlbumDownloadLabel(
                                            "party",
                                            partyPhotos.length,
                                            "Download álbum Festa"
                                        )}
                                </button>
                            )}
                        </div>
                    )}

                    {albumDownloadModal && (
                        <div
                            className="gallery-modal-overlay"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="album-download-title"
                        >
                            <div className="gallery-modal gallery-download-modal">
                                {albumDownloadModal.status === "ready" && (
                                    <>
                                        <span className="gallery-download-modal-label">
                                            Álbum {modalAlbumName}
                                        </span>

                                        <h3 id="album-download-title">Salvar fotos no celular</h3>

                                        <p className="gallery-download-modal-text">
                                            O celular precisa confirmar onde as fotos serão salvas. Elas são preparadas em lotes de até 20 para evitar travamentos.
                                        </p>

                                        <p className="gallery-download-modal-text">
                                            Ao continuar, escolha Google Fotos, Fotos ou Salvar em Arquivos no menu do aparelho.
                                        </p>

                                        <div className="gallery-download-batch-summary">
                                            <strong>{modalBatchSize}</strong>
                                            <span>fotos no próximo lote</span>
                                        </div>

                                        <div className="gallery-modal-actions gallery-download-modal-actions">
                                            <button
                                                type="button"
                                                className="gallery-download-primary"
                                                onClick={handleMobileBatchDownload}
                                            >
                                                <FaDownload aria-hidden="true" />
                                                Baixar {modalBatchSize} fotos
                                            </button>

                                            <button type="button" onClick={closeAlbumDownloadModal}>
                                                Fechar
                                            </button>
                                        </div>
                                    </>
                                )}

                                {albumDownloadModal.status === "preparing" && (
                                    <div className="gallery-download-status" aria-live="polite">
                                        <span className="gallery-download-modal-label">
                                            Álbum {modalAlbumName}
                                        </span>

                                        <h3 id="album-download-title">Preparando fotos</h3>

                                        <p className="gallery-download-modal-text">
                                            {albumDownloadModal.preparedPhotos} de {modalBatchSize} fotos
                                        </p>

                                        <div
                                            className="gallery-download-progress"
                                            role="progressbar"
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                            aria-valuenow={albumDownloadModal.progress}
                                        >
                                            <span style={{ width: `${albumDownloadModal.progress}%` }} />
                                        </div>

                                        <strong className="gallery-download-progress-value">
                                            {albumDownloadModal.progress}%
                                        </strong>
                                    </div>
                                )}

                                {albumDownloadModal.status === "completed" && (
                                    <div className="gallery-download-status" aria-live="polite">
                                        <span className="gallery-download-complete-icon">
                                            <FaCheck aria-hidden="true" />
                                        </span>

                                        <h3 id="album-download-title">Download concluído</h3>

                                        <p className="gallery-download-modal-text">
                                            {albumDownloadModal.preparedPhotos} fotos foram preparadas neste lote.
                                        </p>

                                        {albumDownloadModal.remainingPhotos > 0 ? (
                                            <p className="gallery-download-remaining">
                                                Ainda restam <strong>{albumDownloadModal.remainingPhotos}</strong> fotos.
                                            </p>
                                        ) : (
                                            <p className="gallery-download-remaining">
                                                Todas as fotos deste álbum foram concluídas.
                                            </p>
                                        )}

                                        <div className="gallery-modal-actions gallery-download-modal-actions">
                                            {albumDownloadModal.remainingPhotos > 0 && (
                                                <button
                                                    type="button"
                                                    className="gallery-download-primary"
                                                    onClick={handleMobileBatchDownload}
                                                >
                                                    <FaDownload aria-hidden="true" />
                                                    Baixar mais {modalBatchSize} fotos
                                                </button>
                                            )}

                                            <button type="button" onClick={closeAlbumDownloadModal}>
                                                Fechar
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {albumDownloadModal.status === "error" && (
                                    <div className="gallery-download-status" aria-live="polite">
                                        <h3 id="album-download-title">Não foi possível baixar</h3>

                                        <p className="gallery-download-modal-text">
                                            Verifique a internet e tente preparar este lote novamente.
                                        </p>

                                        <div className="gallery-modal-actions gallery-download-modal-actions">
                                            <button
                                                type="button"
                                                className="gallery-download-primary"
                                                onClick={handleMobileBatchDownload}
                                            >
                                                Tentar novamente
                                            </button>

                                            <button type="button" onClick={closeAlbumDownloadModal}>
                                                Fechar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
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
                                        onClick={() => handleDownload(photo)}
                                        disabled={downloadingPhotoId === photo.id}
                                    >
                                        <FaDownload aria-hidden="true" />
                                        {downloadingPhotoId === photo.id ? "Preparando..." : "Download"}
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
