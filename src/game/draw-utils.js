export const TAU = Math.PI * 2
export const FONT = 'Quicksand, system-ui, sans-serif'

const parsed = new Map()
function rgb(h) {
  let v = parsed.get(h)
  if (!v) {
    v = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
    parsed.set(h, v)
  }
  return v
}

export function mix(a, b, t) {
  const A = rgb(a)
  const B = rgb(b)
  return `rgb(${Math.round(A[0] + (B[0] - A[0]) * t)},${Math.round(A[1] + (B[1] - A[1]) * t)},${Math.round(A[2] + (B[2] - A[2]) * t)})`
}

export const clamp01 = (t) => Math.max(0, Math.min(1, t))
export const lerp = (a, b, t) => a + (b - a) * t
export const easeOutBack = (t) => 1 + 2.4 * (t - 1) ** 3 + 1.4 * (t - 1) ** 2

export function rrect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.arc(x, y, r, 0, TAU)
  ctx.fill()
}

export function poly(ctx, pts, fill) {
  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.moveTo(pts[0], pts[1])
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1])
  ctx.closePath()
  ctx.fill()
}

export function stroke(ctx, pts, color, width) {
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(pts[0], pts[1])
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1])
  ctx.stroke()
}

export function arc(ctx, x, y, r, a0, a1, color, width) {
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(x, y, r, a0, a1)
  ctx.stroke()
}

// color as "r,g,b"
export function glow(ctx, x, y, r, color, alpha) {
  if (alpha <= 0) return
  const gr = ctx.createRadialGradient(x, y, 0, x, y, r)
  gr.addColorStop(0, `rgba(${color},${alpha})`)
  gr.addColorStop(1, `rgba(${color},0)`)
  ctx.fillStyle = gr
  ctx.fillRect(x - r, y - r, r * 2, r * 2)
}

export function heartPath(ctx, x, y, s) {
  ctx.beginPath()
  ctx.moveTo(x, y + s * 0.35)
  ctx.bezierCurveTo(x - s * 0.6, y - s * 0.05, x - s * 0.35, y - s * 0.55, x, y - s * 0.2)
  ctx.bezierCurveTo(x + s * 0.35, y - s * 0.55, x + s * 0.6, y - s * 0.05, x, y + s * 0.35)
  ctx.closePath()
}

export function star(ctx, x, y, r, fill) {
  ctx.fillStyle = fill
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU - Math.PI / 2
    const rr = i % 2 ? r * 0.45 : r
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr)
  }
  ctx.closePath()
  ctx.fill()
}

export function pill(ctx, text, x, y, size, bg, fg) {
  ctx.font = `700 ${size}px ${FONT}`
  const w = ctx.measureText(text).width + size * 1.1
  ctx.fillStyle = bg
  rrect(ctx, x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8)
  ctx.fill()
  ctx.fillStyle = fg
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x, y + size * 0.05)
}
