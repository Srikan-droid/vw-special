import { useState } from 'react'
import './LovePage.css'

// Public folder: Vite serves it at root. Use base so it works on GitHub Pages too.
const BASE = import.meta.env.BASE_URL
const getImgSrc = (n, ext = 'jpg') => {
  const name = `media(${n}).${ext}`
  const path = `resources/${encodeURIComponent(name)}`
  const base = BASE.endsWith('/') ? BASE : BASE + '/'
  return `${base}${path}`
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

function LovePage() {
  const [loaded, setLoaded] = useState({})
  const [triedPng, setTriedPng] = useState({})

  const handleLoad = (i) => setLoaded((p) => ({ ...p, [i]: true }))
  const handleError = (i) => {
    setTriedPng((p) => ({ ...p, [i]: true }))
  }

  return (
    <div className="love-page">
      <header className="love-header">
        <h1>Us 💕</h1>
        <p className="love-sub">Some of our favourite moments</p>
      </header>

      <div className="love-gallery">
        {DISPLAY_ORDER.map((photoIndex, i) => {
          const photo = PHOTOS[photoIndex]
          const isCenter = photoIndex === 0
          const usePng = triedPng[photoIndex]
          const src = getImgSrc(photo.n, usePng ? 'png' : 'jpg')
          return (
            <div
              key={`${photoIndex}-${usePng ? 'png' : 'jpg'}`}
              className={`love-polaroid ${isCenter ? 'love-polaroid--center' : ''} ${loaded[photoIndex] ? 'love-polaroid--visible' : ''}`}
              style={{ '--rotate': isCenter ? '0deg' : `${[-2, 3, -1, 2, 1, -3, 2][i]}deg`, '--delay': `${i * 0.08}s` }}
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

      <footer className="love-footer">
        <p>Happy Valentine’s Week, Guluru. 💕</p>
      </footer>
    </div>
  )
}

export default LovePage
