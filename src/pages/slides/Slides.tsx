import "./slides.css";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaCompress, FaExpand } from "react-icons/fa";
import {
   getGalleryPhotos,
   type GalleryPhoto
} from "../../services/galleryService";
import { supabase } from "../../lib/supabase";

const SLIDE_DURATION_MS = 5000;
const SYNC_INTERVAL_MS = 5000;
const ROTATION_LIMIT = 10;

type LiveStatus = "connecting" | "live" | "polling";

function sortByNewest(photos: GalleryPhoto[]) {
   return [...photos].sort(
      (first, second) =>
         new Date(second.created_at).getTime() - new Date(first.created_at).getTime()
   );
}

export default function Slides() {
   const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
   const [currentPhotoId, setCurrentPhotoId] = useState<number | null>(null);
   const [loading, setLoading] = useState(true);
   const [liveStatus, setLiveStatus] = useState<LiveStatus>("connecting");
   const [controlsVisible, setControlsVisible] = useState(true);
   const [isFullscreen, setIsFullscreen] = useState(false);

   const photosRef = useRef<GalleryPhoto[]>([]);
   const currentPhotoIdRef = useRef<number | null>(null);
   const pendingPhotoIdsRef = useRef<number[]>([]);
   const hasLoadedRef = useRef(false);
   const syncInProgressRef = useRef(false);
   const controlsTimerRef = useRef<number | null>(null);

   const showPhoto = useCallback((photoId: number | null) => {
      currentPhotoIdRef.current = photoId;
      setCurrentPhotoId(photoId);
   }, []);

   const queueNewPhotos = useCallback((newPhotos: GalleryPhoto[]) => {
      const queuedIds = new Set(pendingPhotoIdsRef.current);

      for (const photo of [...newPhotos].reverse()) {
         if (photo.id === currentPhotoIdRef.current || queuedIds.has(photo.id)) continue;
         pendingPhotoIdsRef.current.push(photo.id);
         queuedIds.add(photo.id);

         const image = new Image();
         image.src = photo.image_url;
      }
   }, []);

   const replacePhotos = useCallback((nextPhotos: GalleryPhoto[], queueChanges: boolean) => {
      const sortedPhotos = sortByNewest(nextPhotos);
      const knownIds = new Set(photosRef.current.map(photo => photo.id));

      if (queueChanges && knownIds.size > 0) {
         queueNewPhotos(sortedPhotos.filter(photo => !knownIds.has(photo.id)));
      }

      photosRef.current = sortedPhotos;
      setPhotos(sortedPhotos);

      const currentId = currentPhotoIdRef.current;
      const currentStillExists = sortedPhotos.some(photo => photo.id === currentId);

      if (!currentStillExists) {
         showPhoto(sortedPhotos[0]?.id ?? null);
      }
   }, [queueNewPhotos, showPhoto]);

   const syncPhotos = useCallback(async () => {
      if (syncInProgressRef.current) return;

      try {
         syncInProgressRef.current = true;
         const latestPhotos = await getGalleryPhotos();
         replacePhotos(latestPhotos, hasLoadedRef.current);
         hasLoadedRef.current = true;
      } catch (error) {
         console.error(error);
         setLiveStatus("polling");
      } finally {
         syncInProgressRef.current = false;
         setLoading(false);
      }
   }, [replacePhotos]);

   const addIncomingPhoto = useCallback((photo: GalleryPhoto) => {
      if (!photo?.id || photosRef.current.some(item => item.id === photo.id)) return;

      const nextPhotos = sortByNewest([photo, ...photosRef.current]);
      photosRef.current = nextPhotos;
      setPhotos(nextPhotos);

      if (currentPhotoIdRef.current === null) {
         showPhoto(photo.id);
      } else {
         queueNewPhotos([photo]);
      }
   }, [queueNewPhotos, showPhoto]);

   const removePhoto = useCallback((photoId: number) => {
      const nextPhotos = photosRef.current.filter(photo => photo.id !== photoId);
      photosRef.current = nextPhotos;
      pendingPhotoIdsRef.current = pendingPhotoIdsRef.current.filter(id => id !== photoId);
      setPhotos(nextPhotos);

      if (currentPhotoIdRef.current === photoId) {
         showPhoto(nextPhotos[0]?.id ?? null);
      }
   }, [showPhoto]);

   const advanceSlide = useCallback(() => {
      const availablePhotos = photosRef.current;

      if (availablePhotos.length === 0) {
         showPhoto(null);
         return;
      }

      while (pendingPhotoIdsRef.current.length > 0) {
         const nextQueuedId = pendingPhotoIdsRef.current.shift();
         const queuedPhotoExists = availablePhotos.some(photo => photo.id === nextQueuedId);

         if (nextQueuedId !== undefined && queuedPhotoExists) {
            showPhoto(nextQueuedId);
            return;
         }
      }

      const rotationPhotos = availablePhotos.slice(0, ROTATION_LIMIT);

      if (rotationPhotos.length === 1) {
         showPhoto(rotationPhotos[0].id);
         return;
      }

      const currentIndex = rotationPhotos.findIndex(
         photo => photo.id === currentPhotoIdRef.current
      );
      const nextIndex = currentIndex >= 0
         ? (currentIndex + 1) % rotationPhotos.length
         : 0;

      showPhoto(rotationPhotos[nextIndex].id);
   }, [showPhoto]);

   const revealControls = useCallback(() => {
      setControlsVisible(true);

      if (controlsTimerRef.current !== null) {
         window.clearTimeout(controlsTimerRef.current);
      }

      controlsTimerRef.current = window.setTimeout(() => {
         setControlsVisible(false);
      }, 3500);
   }, []);

   const toggleFullscreen = useCallback(async () => {
      try {
         if (document.fullscreenElement) {
            await document.exitFullscreen();
         } else {
            await document.documentElement.requestFullscreen();
         }
      } catch (error) {
         console.error(error);
      }
   }, []);

   useEffect(() => {
      const previousTitle = document.title;
      const previousBodyOverflow = document.body.style.overflow;
      document.title = "Slides da galeria";
      document.body.style.overflow = "hidden";

      syncPhotos();
      const syncTimer = window.setInterval(syncPhotos, SYNC_INTERVAL_MS);

      return () => {
         document.title = previousTitle;
         document.body.style.overflow = previousBodyOverflow;
         window.clearInterval(syncTimer);
      };
   }, [syncPhotos]);

   useEffect(() => {
      const channel = supabase
         .channel("gallery-slides-live")
         .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "gallery_photos" },
            payload => addIncomingPhoto(payload.new as GalleryPhoto)
         )
         .on(
            "postgres_changes",
            { event: "DELETE", schema: "public", table: "gallery_photos" },
            payload => {
               const deletedPhoto = payload.old as Partial<GalleryPhoto>;
               if (typeof deletedPhoto.id === "number") removePhoto(deletedPhoto.id);
            }
         )
         .subscribe(status => {
            setLiveStatus(status === "SUBSCRIBED" ? "live" : "polling");
         });

      return () => {
         supabase.removeChannel(channel);
      };
   }, [addIncomingPhoto, removePhoto]);

   useEffect(() => {
      if (currentPhotoId === null) return;

      const slideTimer = window.setInterval(advanceSlide, SLIDE_DURATION_MS);
      return () => window.clearInterval(slideTimer);
   }, [advanceSlide, currentPhotoId]);

   useEffect(() => {
      const nextPhotos = photos.slice(0, ROTATION_LIMIT);

      for (const photo of nextPhotos) {
         if (photo.id === currentPhotoId) continue;
         const image = new Image();
         image.src = photo.image_url;
      }
   }, [currentPhotoId, photos]);

   useEffect(() => {
      function updateFullscreenState() {
         setIsFullscreen(Boolean(document.fullscreenElement));
      }

      document.addEventListener("fullscreenchange", updateFullscreenState);
      controlsTimerRef.current = window.setTimeout(() => {
         setControlsVisible(false);
      }, 3500);

      return () => {
         document.removeEventListener("fullscreenchange", updateFullscreenState);
         if (controlsTimerRef.current !== null) {
            window.clearTimeout(controlsTimerRef.current);
         }
      };
   }, [revealControls]);

   const currentPhoto = useMemo(
      () => photos.find(photo => photo.id === currentPhotoId) ?? null,
      [currentPhotoId, photos]
   );
   const currentRotation = photos.slice(0, ROTATION_LIMIT);
   const currentPosition = currentPhoto
      ? currentRotation.findIndex(photo => photo.id === currentPhoto.id) + 1
      : 0;

   return (
      <main
         className="slideshow-page"
         onMouseMove={revealControls}
         onTouchStart={revealControls}
      >
         <div className={`slideshow-controls ${controlsVisible ? "visible" : ""}`}>
            <Link to="/gallery" className="slideshow-back-button">
               <FaArrowLeft aria-hidden="true" />
               Voltar à galeria
            </Link>

            <div className="slideshow-controls-right">
               <span className={`slideshow-live-status ${liveStatus}`}>
                  <span aria-hidden="true" />
                  {liveStatus === "live" ? "Ao vivo" : "Atualização automática"}
               </span>

               <button
                  type="button"
                  className="slideshow-icon-button"
                  onClick={toggleFullscreen}
                  aria-label={isFullscreen ? "Sair da tela cheia" : "Abrir em tela cheia"}
                  title={isFullscreen ? "Sair da tela cheia" : "Abrir em tela cheia"}
               >
                  {isFullscreen
                     ? <FaCompress aria-hidden="true" />
                     : <FaExpand aria-hidden="true" />}
               </button>
            </div>
         </div>

         {currentPhoto ? (
            <>
               <div className="slideshow-stage" aria-live="polite">
                  <img
                     key={currentPhoto.id}
                     src={currentPhoto.image_url}
                     alt="Foto compartilhada por um convidado"
                     className="slideshow-photo"
                     onError={advanceSlide}
                  />
               </div>

               <div className="slideshow-meta">
                  <span>{currentPhoto.album === "ceremony" ? "Cerimônia" : "Festa"}</span>
                  {currentPosition > 0 && (
                     <span>{currentPosition} de {currentRotation.length}</span>
                  )}
               </div>

               <div key={`progress-${currentPhoto.id}`} className="slideshow-progress" />
            </>
         ) : (
            <div className="slideshow-empty">
               <p>{loading ? "Carregando fotos..." : "Aguardando a primeira foto"}</p>
               {!loading && <span>Assim que alguém enviar, ela aparecerá aqui.</span>}
            </div>
         )}
      </main>
   );
}
