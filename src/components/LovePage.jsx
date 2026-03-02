import { useState, useRef, useEffect } from 'react'
import './LovePage.css'

// Public folder helpers for images + songs (works with base on GitHub Pages)
const BASE = import.meta.env.BASE_URL
const withBase = (path) => {
  const base = BASE.endsWith('/') ? BASE : `${BASE}/`
  return `${base}${path}`
}

const getImgSrc = (n, ext = 'jpg') => {
  const name = `media(${n}).${ext}`
  return withBase(`resources/${encodeURIComponent(name)}`)
}

const getSongSrc = (n, ext = 'mp3') => {
  const name = `song(${n}).${ext}`
  return withBase(`resources/${encodeURIComponent(name)}`)
}

const PHOTOS = [
  { alt: 'Memory 1', n: 1 },
  { alt: 'Memory 2', n: 2 },
  { alt: 'Memory 3', n: 3 },
  { alt: 'Memory 4', n: 4 },
  { alt: 'Memory 5', n: 5 },
  { alt: 'Memory 6', n: 6 },
  { alt: 'Memory 7', n: 7 },
]

// Display order: media(1) in center → [2,3,4, 5,1,6, 7]
const DISPLAY_ORDER = [1, 2, 3, 4, 0, 5, 6]

const getNoteImgSrc = () => withBase('resources/Note.png')

function LovePage() {
  const [loaded, setLoaded] = useState({})
  const [triedPng, setTriedPng] = useState({})
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const audioRef = useRef(null)
  const [showNote, setShowNote] = useState(false)

  const handleLoad = (i) => setLoaded((p) => ({ ...p, [i]: true }))
  const handleError = (i) => {
    setTriedPng((p) => ({ ...p, [i]: true }))
  }

  const openLightbox = (photoIndex) => {
    setLightboxIndex(photoIndex)
    setShowNote(false)
  }

  const closeLightbox = () => {
    setLightboxIndex(null)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setShowNote(false)
  }

  useEffect(() => {
    if (lightboxIndex == null) return
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = 0
    audio.play().catch(() => {
      // autoplay might be blocked; user can tap play in controls if needed
    })
  }, [lightboxIndex])

  const handleSongEnd = () => {
    if (lightboxIndex !== 0) return
    setShowNote(true)
  }

  const renderLightbox = () => {
    if (lightboxIndex == null) return null
    const photo = PHOTOS[lightboxIndex]
    const usePng = triedPng[lightboxIndex]
    const imgSrc = getImgSrc(photo.n, usePng ? 'png' : 'jpg')
    const songSrc = getSongSrc(photo.n)
    const showNoteOnly = photo.n === 1 && showNote

    return (
      <div className="love-lightbox-overlay" onClick={closeLightbox}>
        <div className="love-lightbox" onClick={(e) => e.stopPropagation()}>
          {showNoteOnly ? (
            <div className="love-note-wrap">
              <img src={getNoteImgSrc()} alt="Note" className="love-note-img" />
            </div>
          ) : (
            <>
              <div className="love-lightbox-frame">
                <div className="love-lightbox-vignette" aria-hidden="true" />
                <img src={imgSrc} alt="" className="love-lightbox-img" />
                <div className="love-lightbox-scan" aria-hidden="true" />
              </div>
              <audio
                ref={audioRef}
                src={songSrc}
                controls
                className="love-lightbox-audio"
                onEnded={photo.n === 1 ? handleSongEnd : undefined}
              />
            </>
          )}
          <button type="button" className="love-lightbox-close" onClick={closeLightbox}>
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="love-page">
      <header className="love-header">
        <h1>You and I 💕</h1>
        
      </header>

      <div className="love-gallery">
        {DISPLAY_ORDER.map((photoIndex, i) => {
          const photo = PHOTOS[photoIndex]
          const isCenter = photoIndex === 0
          const usePng = triedPng[photoIndex]
          const src = getImgSrc(photo.n, usePng ? 'png' : 'jpg')
          const rotate = isCenter ? '0deg' : `${[-2, 3, -1, 2, 1, -3, 2][i]}deg`

          return (
            <div
              key={`${photoIndex}-${usePng ? 'png' : 'jpg'}`}
              className={`love-polaroid ${isCenter ? 'love-polaroid--center' : ''} ${loaded[photoIndex] ? 'love-polaroid--visible' : ''}`}
              style={{ '--rotate': rotate, '--delay': `${i * 0.08}s` }}
              onClick={() => openLightbox(photoIndex)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') openLightbox(photoIndex)
              }}
            >
              <div className="love-polaroid-inner">
                <img
                  src={src}
                  alt={photo.alt}
                  loading="lazy"
                  onLoad={() => handleLoad(photoIndex)}
                  onError={(e) => {
                    if (!usePng) {
                      handleError(photoIndex)
                      return
                    }
                    e.target.style.display = 'none'
                    e.target.nextSibling?.classList.add('love-placeholder--show')
                  }}
                />
                <div className="love-placeholder">Photo {photoIndex + 1}</div>
              </div>
            </div>
          )
        })}
      </div>

      {renderLightbox()}
    </div>
  )
}

export default LovePage
