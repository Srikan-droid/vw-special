import { circle, poly, stroke, arc, rrect, heartPath, star, FONT, TAU } from './draw-utils'

const INK = '#2b1d1a'
const SKIN = '#f5cba7'

// Srikant: drawn around his physics body's centre (30 x 54 box), facing left towards Aliva
export function drawSrikant(ctx, s, t) {
  ctx.save()
  ctx.translate(s.x, s.y)
  ctx.rotate(s.angle)
  const m = s.mood

  // legs + shoes
  ctx.fillStyle = '#2f3a5a'
  ctx.fillRect(-8, 12, 6, 13)
  ctx.fillRect(2, 12, 6, 13)
  circle(ctx, -7, 26, 4, '#ff5a5f')
  circle(ctx, 3, 26, 4, '#ff5a5f')

  // hoodie
  ctx.fillStyle = '#5b7cfa'
  rrect(ctx, -12, -6, 24, 22, 7)
  ctx.fill()
  ctx.fillStyle = '#4a69e0'
  ctx.fillRect(-2, -4, 3, 16)

  // white flag held up (between levels)
  if (m === 'flag') {
    stroke(ctx, [9, 0, 12, -44], '#8b5a3c', 2.2)
    const w = Math.sin(t * 10) * 3
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.moveTo(12, -44)
    ctx.quadraticCurveTo(22, -46 + w, 32, -42)
    ctx.lineTo(31, -30 + w)
    ctx.quadraticCurveTo(22, -33 - w, 12, -31)
    ctx.closePath()
    ctx.fill()
    stroke(ctx, [7, -2, 11, -16], SKIN, 4.5)
  }

  // head
  const hx = 0
  const hy = -16
  circle(ctx, hx, hy, 13, SKIN)
  circle(ctx, hx + 9, hy + 1, 3, '#efb994')
  // hair (swept back to the right since he faces left)
  ctx.fillStyle = INK
  ctx.beginPath()
  ctx.arc(hx, hy, 14, Math.PI * 0.95, Math.PI * 2.1)
  ctx.lineTo(hx + 4, hy - 4)
  ctx.lineTo(hx - 3, hy - 7)
  ctx.lineTo(hx - 10, hy - 5)
  ctx.closePath()
  ctx.fill()
  poly(ctx, [hx + 10, hy - 9, hx + 19, hy - 13, hx + 13, hy - 2], INK)

  if (s.bandaged) {
    ctx.save()
    ctx.translate(hx - 2, hy - 8)
    ctx.rotate(-0.35)
    ctx.fillStyle = '#fff6ea'
    ctx.fillRect(-9, -2.5, 18, 5)
    ctx.restore()
    ctx.save()
    ctx.translate(hx - 2, hy - 8)
    ctx.rotate(0.35)
    ctx.fillStyle = '#fff6ea'
    ctx.fillRect(-9, -2.5, 18, 5)
    ctx.restore()
  }

  // bumps from bonks
  const bumps = Math.min(3, s.bumps || 0)
  const spots = [[-3, hy - 13], [5, hy - 14], [1, hy - 17]]
  for (let i = 0; i < bumps; i++) {
    circle(ctx, spots[i][0], spots[i][1], 4.2, '#ff8fa3')
    circle(ctx, spots[i][0] - 1.2, spots[i][1] - 1.4, 1.3, '#ffd0da')
  }

  // face (eyes towards the left)
  const e1 = [hx - 9, hy - 1]
  const e2 = [hx - 2, hy - 1]
  if (m === 'hit') {
    for (const [x, y] of [e1, e2]) {
      stroke(ctx, [x - 2.2, y - 2.2, x + 2.2, y + 2.2], INK, 1.6)
      stroke(ctx, [x + 2.2, y - 2.2, x - 2.2, y + 2.2], INK, 1.6)
    }
    circle(ctx, hx - 6, hy + 7, 2.6, '#7a2e2e')
  } else if (m === 'dizzy') {
    for (const [x, y] of [e1, e2]) arc(ctx, x, y, 2.2, t * 12, t * 12 + Math.PI * 1.5, INK, 1.3)
    arc(ctx, hx - 6, hy + 6, 2.4, Math.PI * 1.1, Math.PI * 1.9, '#7a2e2e', 1.4)
  } else if (m === 'caught' || m === 'flag') {
    for (const [x, y] of [e1, e2]) arc(ctx, x, y + 1, 2.4, Math.PI * 1.1, Math.PI * 1.9, INK, 1.6)
    arc(ctx, hx - 6, hy + 4, m === 'caught' ? 4 : 3, Math.PI * 0.15, Math.PI * 0.85, '#7a2e2e', 1.5)
  } else {
    // peek / sign: big puppy eyes
    const big = m === 'sign' ? 3 : 2.2
    for (const [x, y] of [e1, e2]) {
      circle(ctx, x, y, big, INK)
      circle(ctx, x - 0.7, y - 0.9, big * 0.38, '#fff')
    }
    stroke(ctx, [e1[0] - 2.5, e1[1] - 4, e1[0] + 2, e1[1] - 5.5], INK, 1.2)
    stroke(ctx, [e2[0] + 2.5, e2[1] - 4, e2[0] - 2, e2[1] - 5.5], INK, 1.2)
    if (m === 'sign') arc(ctx, hx - 6, hy + 8, 2.6, Math.PI * 1.15, Math.PI * 1.85, '#7a2e2e', 1.4)
    else {
      stroke(ctx, [hx - 9, hy + 6, hx - 7, hy + 5, hx - 5, hy + 6, hx - 3, hy + 5], '#7a2e2e', 1.2)
      // nervous sweat drop
      const d = (t * 0.8) % 1
      ctx.globalAlpha = 1 - d
      ctx.fillStyle = '#8ecae6'
      ctx.beginPath()
      ctx.moveTo(hx + 7, hy - 9 + d * 8)
      ctx.quadraticCurveTo(hx + 4, hy - 4 + d * 8, hx + 7, hy - 3 + d * 8)
      ctx.quadraticCurveTo(hx + 10, hy - 4 + d * 8, hx + 7, hy - 9 + d * 8)
      ctx.fill()
      ctx.globalAlpha = 1
    }
  }
  ctx.globalAlpha = 0.55
  circle(ctx, hx - 11, hy + 4, 2.6, '#ff8fa3')
  ctx.globalAlpha = 1

  if (s.headphones) {
    arc(ctx, hx, hy, 15.5, Math.PI * 1.08, Math.PI * 1.92, '#33334d', 3)
    ctx.fillStyle = '#ff5a8a'
    rrect(ctx, hx - 17, hy - 6, 6, 12, 3)
    ctx.fill()
    rrect(ctx, hx + 11, hy - 6, 6, 12, 3)
    ctx.fill()
  }

  // hands / props
  if (m === 'sign') {
    ctx.fillStyle = '#fffaf0'
    rrect(ctx, -34, -2, 68, 30, 6)
    ctx.fill()
    ctx.strokeStyle = '#c2566a'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = '#c2566a'
    ctx.font = `800 10px ${FONT}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(s.sign[0], 0, 7)
    ctx.fillText(s.sign[1], 0, 19)
    circle(ctx, -30, 2, 4, SKIN)
    circle(ctx, 30, 2, 4, SKIN)
  } else if (m === 'caught') {
    ctx.fillStyle = '#ff4d7d'
    heartPath(ctx, -4, 4, 20)
    ctx.fill()
    circle(ctx, -12, 6, 3.6, SKIN)
    circle(ctx, 4, 6, 3.6, SKIN)
  } else if (m !== 'flag') {
    circle(ctx, -11, -1, 3.6, SKIN)
    circle(ctx, -4, 1, 3.6, SKIN)
  }

  ctx.restore()

  // dizzy stars orbit (screen-upright)
  if (s.dizzyT > 0) {
    for (let i = 0; i < 3; i++) {
      const a = t * 5 + (i / 3) * TAU
      star(ctx, s.x + Math.cos(a) * 16, s.y - 34 + Math.sin(a) * 5, 4, '#ffd166')
    }
  }
}

// Aliva: feet at (x, y), facing right. Returns her throwing hand position.
export function drawAliva(ctx, a, t) {
  ctx.save()
  ctx.translate(a.x, a.y)
  const S = 1.15
  ctx.scale(S, S)
  const m = a.mood

  // hair (back)
  ctx.fillStyle = INK
  rrect(ctx, -15, -74, 28, 50, 13)
  ctx.fill()
  // legs
  ctx.fillStyle = SKIN
  ctx.fillRect(-6, -10, 4, 10)
  ctx.fillRect(2, -10, 4, 10)
  circle(ctx, -4, 0, 3.5, '#c2566a')
  circle(ctx, 5, 0, 3.5, '#c2566a')
  // dress
  poly(ctx, [-9, -46, 9, -46, 16, -8, -16, -8], '#ff6f9c')
  ctx.fillStyle = '#ffd1dc'
  ctx.fillRect(-9, -46, 18, 4)

  // other arm: hand on hip while annoyed, waving when soft
  if (m === 'soft') {
    const ang = -2.4 + Math.sin(t * 8) * 0.4
    stroke(ctx, [-7, -42, -7 + Math.cos(ang) * 18, -42 + Math.sin(ang) * 18], SKIN, 4.6)
  } else {
    stroke(ctx, [-7, -42, -15, -32, -8, -26], SKIN, 4.6)
  }

  // head
  const hx = 1
  const hy = -59
  circle(ctx, hx, hy, 13.5, SKIN)
  ctx.fillStyle = INK
  ctx.beginPath()
  ctx.arc(hx, hy, 14.5, Math.PI * 0.98, Math.PI * 2.02)
  ctx.lineTo(hx + 6, hy - 6)
  ctx.lineTo(hx - 10, hy - 3)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#ff4d7d'
  heartPath(ctx, hx - 9, hy - 12, 8)
  ctx.fill()

  const ex = hx + 6
  const ey = hy + 1
  if (m === 'soft') {
    arc(ctx, ex, ey + 1, 2.6, Math.PI * 1.1, Math.PI * 1.9, INK, 1.6)
    arc(ctx, ex + 6, ey + 1, 2.4, Math.PI * 1.1, Math.PI * 1.9, INK, 1.6)
    arc(ctx, ex + 2, ey + 6, 3.6, Math.PI * 0.15, Math.PI * 0.85, '#a3324a', 1.6)
  } else if (m === 'smug') {
    stroke(ctx, [ex - 2.5, ey, ex + 2.5, ey - 0.5], INK, 1.8)
    stroke(ctx, [ex + 4, ey, ex + 8, ey - 0.5], INK, 1.8)
    stroke(ctx, [ex - 1, ey + 7, ex + 3, ey + 7.5, ex + 6, ey + 5.5], '#a3324a', 1.6)
  } else {
    // angry / aiming
    circle(ctx, ex, ey, 2.1, INK)
    circle(ctx, ex + 6, ey, 2, INK)
    stroke(ctx, [ex - 3, ey - 5, ex + 2, ey - 3.5], INK, 1.6)
    stroke(ctx, [ex + 9, ey - 5, ex + 4, ey - 3.5], INK, 1.6)
    stroke(ctx, [ex, ey + 7.5, ex + 5, ey + 7], '#a3324a', 1.6)
  }
  ctx.globalAlpha = m === 'soft' ? 0.75 : 0.4
  circle(ctx, ex + 1, ey + 5, 3, '#ff8fa3')
  ctx.globalAlpha = 1

  // throwing arm
  const sx = 6
  const sy = -42
  const hand = [sx + Math.cos(a.armA) * 18, sy + Math.sin(a.armA) * 18]
  stroke(ctx, [sx, sy, hand[0], hand[1]], SKIN, 4.8)
  circle(ctx, hand[0], hand[1], 3.4, SKIN)
  ctx.restore()

  if (m === 'angry' || m === 'aim') {
    // little anger mark
    const px = a.x + 22
    const py = a.y - 82 + Math.sin(t * 6) * 1.5
    stroke(ctx, [px - 4, py - 1, px - 1, py - 1, px - 1, py - 4], '#ff3b5c', 1.8)
    stroke(ctx, [px + 4, py - 1, px + 1, py - 1, px + 1, py - 4], '#ff3b5c', 1.8)
    stroke(ctx, [px - 4, py + 2, px - 1, py + 2, px - 1, py + 5], '#ff3b5c', 1.8)
    stroke(ctx, [px + 4, py + 2, px + 1, py + 2, px + 1, py + 5], '#ff3b5c', 1.8)
  }
  return { x: a.x + hand[0] * S, y: a.y + hand[1] * S }
}
