import { mix, lerp, clamp01, easeOutBack, rrect, circle, poly, stroke, glow, heartPath, star, pill, FONT, TAU } from './draw-utils'
import { drawSrikant, drawAliva } from './characters'

// Sky palettes: sunset → dusk → night → knockout night
const SKIES = [
  ['#5b6fd6', '#f49ac1', '#ffd29e'],
  ['#3a3f8f', '#c86fa8', '#ffad8a'],
  ['#151a45', '#3d2f74', '#8a5a9c'],
  ['#0f1238', '#2c2463', '#6e4b8e'],
]

const MATERIALS = {
  wood: { fill: '#e0a668', edge: '#a8693a', ink: '#5a3215' },
  stone: { fill: '#a9a6bd', edge: '#6f6c84', ink: '#2a283a' },
  glass: { fill: 'rgba(190,230,255,0.6)', edge: '#eaf8ff', ink: '#1d4a66' },
}

function skyColors(v) {
  const i = Math.min(SKIES.length - 2, Math.floor(v))
  const f = clamp01(v - i)
  return SKIES[i].map((c, j) => mix(c, SKIES[i + 1][j], f))
}

function drawBackdrop(ctx, g) {
  const { x0, x1, groundY: gy } = g
  const night = clamp01(g.sky - 1.3)
  const [top, mid, bot] = skyColors(g.sky)
  const gr = ctx.createLinearGradient(0, 0, 0, gy)
  gr.addColorStop(0, top)
  gr.addColorStop(0.6, mid)
  gr.addColorStop(1, bot)
  ctx.fillStyle = gr
  ctx.fillRect(x0, 0, x1 - x0, g.WH)

  // stars
  if (night > 0) {
    ctx.fillStyle = '#fff'
    for (const s of g.stars) {
      const a = night * (0.4 + 0.6 * Math.sin(g.t * 2 + s.tw))
      if (a <= 0.02) continue
      ctx.globalAlpha = a
      ctx.fillRect(x0 + s.x * (x1 - x0), s.y * gy * 0.75, s.r, s.r)
    }
    ctx.globalAlpha = 1
  }

  // sun sets, moon rises
  const sunY = lerp(gy * 0.38, gy + 40, clamp01(g.sky / 1.6))
  if (g.sky < 1.6) {
    glow(ctx, 150, sunY, 160, '255,214,140', 0.6)
    circle(ctx, 150, sunY, 38, '#ffe2a0')
  }
  if (night > 0) {
    const my = lerp(gy * 0.5, gy * 0.18, night)
    ctx.globalAlpha = night
    glow(ctx, 470, my, 90, '255,245,210', 0.35)
    circle(ctx, 470, my, 24, '#fff4d1')
    circle(ctx, 462, my - 5, 5, '#efe2b8')
    circle(ctx, 476, my + 7, 3.5, '#efe2b8')
    ctx.globalAlpha = 1
  }

  // clouds
  const cloud = mix('#ffffff', '#4b4580', clamp01(g.sky / 2.2))
  ctx.fillStyle = cloud
  ctx.globalAlpha = 0.7
  for (const c of g.clouds) {
    const span = x1 - x0 + 200
    const x = x0 - 100 + ((((c.x * span + g.t * c.v) % span) + span) % span)
    const y = c.y * gy
    // one path so overlapping puffs don't show seams through the transparency
    ctx.beginPath()
    ctx.moveTo(x + 18 * c.s, y)
    ctx.arc(x, y, 18 * c.s, 0, TAU)
    ctx.moveTo(x + 46 * c.s, y - 9 * c.s)
    ctx.arc(x + 22 * c.s, y - 9 * c.s, 24 * c.s, 0, TAU)
    ctx.moveTo(x + 64 * c.s, y)
    ctx.arc(x + 46 * c.s, y, 18 * c.s, 0, TAU)
    ctx.rect(x, y, 46 * c.s, 18 * c.s)
    ctx.fill('nonzero')
  }
  ctx.globalAlpha = 1

  // birds in daylight
  if (g.sky < 1.4) {
    for (const b of g.birds) {
      const span = x1 - x0 + 120
      const x = x0 - 60 + ((b.x * span + g.t * 22) % span)
      const y = b.y * gy + Math.sin(g.t * 2 + b.x * 10) * 6
      const f = Math.sin(g.t * 9 + b.x * 20) * 3
      stroke(ctx, [x - 6, y - f, x, y, x + 6, y - f], 'rgba(60,40,70,0.6)', 1.4)
    }
  }

  // rolling hills
  const far = mix('#c47aa8', '#2a2556', clamp01(g.sky / 2.5))
  const near = mix('#8fcf8a', '#1f3a40', clamp01(g.sky / 2.5))
  for (const [color, h, amp, freq, ph] of [
    [far, 90, 26, 0.012, 1],
    [near, 46, 18, 0.02, 3],
  ]) {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(x0, gy)
    for (let x = x0; x <= x1 + 10; x += 10) ctx.lineTo(x, gy - h - Math.sin(x * freq + ph) * amp)
    ctx.lineTo(x1, gy)
    ctx.closePath()
    ctx.fill()
  }

  // fireflies at night
  if (night > 0.3) {
    for (const f of g.fireflies) {
      const x = f.x * 560 + Math.sin(g.t * f.s + f.p) * 20
      const y = gy - 20 - f.y * 160 + Math.cos(g.t * f.s * 0.8 + f.p) * 12
      glow(ctx, x, y, 10, '255,240,140', night * (0.5 + 0.5 * Math.sin(g.t * 3 + f.p)))
    }
  }
}

function drawGround(ctx, g) {
  const { x0, x1, groundY: gy } = g
  const d = clamp01(g.sky / 2.5)
  ctx.fillStyle = mix('#7bc47f', '#2c5a4a', d)
  ctx.fillRect(x0, gy, x1 - x0, 10)
  ctx.fillStyle = mix('#b07a52', '#4a3442', d)
  ctx.fillRect(x0, gy + 10, x1 - x0, g.WH - gy)
  ctx.fillStyle = mix('#9a6a46', '#3e2c38', d)
  for (let x = x0 + 8; x < x1; x += 34) ctx.fillRect(x, gy + 24 + ((x * 7) % 13), 10, 4)
  // deeper soil layers + pebbles
  ctx.fillStyle = mix('#98653f', '#3a2734', d)
  ctx.fillRect(x0, gy + 70, x1 - x0, g.WH - gy)
  ctx.fillStyle = mix('#7f5233', '#2f1f2b', d)
  ctx.fillRect(x0, gy + 150, x1 - x0, g.WH - gy)
  for (let i = 0; i < 26; i++) {
    const px = x0 + ((i * 97) % Math.max(1, x1 - x0))
    const py = gy + 40 + ((i * 53) % 220)
    ctx.fillStyle = mix('#c99a73', '#5a4252', d)
    ctx.beginPath()
    ctx.ellipse(px, py, 5 + (i % 3) * 2, 3 + (i % 2) * 1.5, 0, 0, TAU)
    ctx.fill()
  }

  // Aliva's little hill
  ctx.fillStyle = mix('#7bc47f', '#2c5a4a', d)
  ctx.beginPath()
  ctx.ellipse(70, gy + 4, 70, 34, 0, Math.PI, TAU)
  ctx.fill()
  for (const [fx, c] of [[30, '#ff7aa2'], [52, '#ffd166'], [100, '#ffffff'], [118, '#c084fc']]) {
    stroke(ctx, [fx, gy - 14 + Math.abs(fx - 70) * 0.35, fx, gy - 22 + Math.abs(fx - 70) * 0.35], '#3f8f4f', 1.5)
    circle(ctx, fx, gy - 23 + Math.abs(fx - 70) * 0.35, 3.2, c)
  }
}

function labelLayout(ctx, b) {
  const vertical = b.h > b.w * 1.2
  const long = vertical ? b.h : b.w
  const short = vertical ? b.w : b.h
  ctx.font = `800 10px ${FONT}`
  const one = ctx.measureText(b.text).width / 10
  let size = Math.min(15, short * 0.62, (long - 8) / one)
  let lines = [b.text]
  const words = b.text.split(' ')
  if (size < 11 && words.length > 1 && short >= 26) {
    let best = null
    for (let i = 1; i < words.length; i++) {
      const l = [words.slice(0, i).join(' '), words.slice(i).join(' ')]
      const wmax = Math.max(...l.map((s) => ctx.measureText(s).width / 10))
      const s2 = Math.min(13, (short - 4) / 2.3, (long - 8) / wmax)
      if (!best || s2 > best.size) best = { size: s2, lines: l }
    }
    if (best.size > size) {
      size = best.size
      lines = best.lines
    }
  }
  return { vertical, size, lines }
}

function drawBlock(ctx, b) {
  const { x, y } = b.body.position
  const M = MATERIALS[b.mat]
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(b.body.angle)
  if (b.flash > 0) ctx.globalAlpha = 0.6 + 0.4 * Math.sin(b.flash * 60)
  ctx.fillStyle = M.fill
  rrect(ctx, -b.w / 2, -b.h / 2, b.w, b.h, 4)
  ctx.fill()
  ctx.strokeStyle = M.edge
  ctx.lineWidth = 2
  ctx.stroke()
  if (b.mat === 'wood') {
    ctx.strokeStyle = 'rgba(140,80,40,0.25)'
    ctx.lineWidth = 1
    const vertical = b.h > b.w
    for (let i = 1; i < 3; i++) {
      ctx.beginPath()
      if (vertical) {
        ctx.moveTo(-b.w / 2 + (b.w * i) / 3, -b.h / 2 + 4)
        ctx.lineTo(-b.w / 2 + (b.w * i) / 3, b.h / 2 - 4)
      } else {
        ctx.moveTo(-b.w / 2 + 4, -b.h / 2 + (b.h * i) / 3)
        ctx.lineTo(b.w / 2 - 4, -b.h / 2 + (b.h * i) / 3)
      }
      ctx.stroke()
    }
  } else if (b.mat === 'glass') {
    stroke(ctx, [-b.w / 2 + 5, -b.h / 2 + 10, -b.w / 2 + 10, -b.h / 2 + 4], 'rgba(255,255,255,0.9)', 2)
  }
  // cracks as it takes damage
  if (b.hp < b.maxHp * 0.7) {
    const c = 'rgba(40,20,30,0.55)'
    stroke(ctx, [-b.w * 0.3, -b.h * 0.4, -b.w * 0.05, -b.h * 0.05, -b.w * 0.15, b.h * 0.2], c, 1.4)
    if (b.hp < b.maxHp * 0.4) stroke(ctx, [b.w * 0.35, b.h * 0.4, b.w * 0.1, b.h * 0.05, b.w * 0.25, -b.h * 0.25], c, 1.4)
  }
  if (!b.layout) b.layout = labelLayout(ctx, b)
  const L = b.layout
  if (L.vertical) ctx.rotate(-Math.PI / 2)
  ctx.font = `800 ${L.size}px ${FONT}`
  ctx.fillStyle = M.ink
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const lh = L.size * 1.1
  L.lines.forEach((line, i) => ctx.fillText(line, 0, (i - (L.lines.length - 1) / 2) * lh + 0.5))
  ctx.restore()
}

export function drawThrowable(ctx, type, x, y, angle) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  if (type === 'chappal') {
    ctx.fillStyle = '#3aa0ff'
    ctx.beginPath()
    ctx.ellipse(0, 0, 15, 7, 0, 0, TAU)
    ctx.fill()
    ctx.fillStyle = '#1f6fc2'
    ctx.beginPath()
    ctx.ellipse(0, 1.5, 15, 5.5, 0, 0, Math.PI)
    ctx.fill()
    stroke(ctx, [-6, -6, 2, 0, -6, 6], '#ff4d7d', 2.6)
  } else if (type === 'pillow') {
    ctx.fillStyle = '#fff4f8'
    rrect(ctx, -22, -14, 44, 28, 11)
    ctx.fill()
    ctx.strokeStyle = '#f3a6be'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = '#ff9ab3'
    heartPath(ctx, 0, 1, 11)
    ctx.fill()
  } else if (type === 'teddy') {
    ctx.font = '30px serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('🧸', 0, 2)
  } else if (type === 'pan') {
    ctx.fillStyle = '#2f2f3a'
    ctx.fillRect(10, -2.5, 20, 5)
    circle(ctx, 0, 0, 14, '#2f2f3a')
    circle(ctx, 0, 0, 11, '#4a4a5c')
    circle(ctx, -2, -1, 6, '#ffffff')
    circle(ctx, -1, 0, 3, '#ffc93c')
  }
  ctx.restore()
}

function drawAim(ctx, g, hand) {
  if (!g.aim) return
  const { vx, vy } = g.aim
  const a = g.gravityPerStep
  for (let n = 3; n <= 54; n += 3) {
    const x = hand.x + vx * n
    const y = hand.y + vy * n + 0.5 * a * n * n
    if (y > g.groundY) break
    ctx.globalAlpha = 0.9 - n / 70
    circle(ctx, x, y, 3.4 - n / 22, '#ffffff')
  }
  ctx.globalAlpha = 1
}

function drawParticles(ctx, g) {
  for (const q of g.particles) {
    const a = clamp01(q.life / q.max)
    ctx.globalAlpha = q.kind === 'pop' ? Math.min(1, a * 2) : a
    if (q.kind === 'dot') circle(ctx, q.x, q.y, q.size, q.color)
    else if (q.kind === 'shard') {
      ctx.save()
      ctx.translate(q.x, q.y)
      ctx.rotate(q.rot)
      ctx.fillStyle = q.color
      ctx.fillRect(-q.size / 2, -q.size / 3, q.size, q.size * 0.66)
      ctx.restore()
    } else if (q.kind === 'star') star(ctx, q.x, q.y, q.size, q.color)
    else if (q.kind === 'pop' || q.kind === 'text') {
      const age = q.max - q.life
      const s = q.kind === 'pop' ? easeOutBack(clamp01(age / 0.25)) : 1
      ctx.save()
      ctx.translate(q.x, q.y)
      ctx.rotate(q.rot || 0)
      ctx.scale(s, s)
      ctx.font = `900 ${q.size}px ${FONT}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.lineWidth = q.size * 0.22
      ctx.lineJoin = 'round'
      ctx.strokeStyle = q.outline || '#4a1030'
      ctx.strokeText(q.text, 0, 0)
      ctx.fillStyle = q.color
      ctx.fillText(q.text, 0, 0)
      ctx.restore()
    }
  }
  ctx.globalAlpha = 1
}

// Speech bubbles + name tag are drawn in screen pixels so they stay readable
function drawScreenText(ctx, g) {
  const toScreen = (x, y) => [(x + g.offX) * g.scale, y * g.scale]
  const sk = g.srikant
  const skPos = sk.body.position
  const hasSkBubble = g.bubbles.some((b) => b.who === 'srikant')
  if (!hasSkBubble && g.phase !== 'title') {
    const [nx, ny] = toScreen(skPos.x, skPos.y - 48)
    pill(ctx, 'SRIKANT', nx, ny, 10, 'rgba(30,15,40,0.55)', '#fff')
  }
  // his bubble floats above the fort so it never covers the flaw labels
  let fortTop = skPos.y - 40
  for (const b of g.blocks) fortTop = Math.min(fortTop, b.body.bounds.min.y - 6)
  for (const b of g.bubbles) {
    const [ax, ay] =
      b.who === 'srikant' ? toScreen(skPos.x, fortTop) : toScreen(g.aliva.x + 4, g.aliva.y - 96)
    const pop = easeOutBack(clamp01(b.t / 0.25))
    const fade = clamp01((b.dur - b.t) / 0.3)
    ctx.font = `700 14px ${FONT}`
    const maxW = Math.min(g.W - 24, 300)
    const tw = Math.min(ctx.measureText(b.text).width, maxW - 24)
    const bw = tw + 24
    const bh = 32
    const bx = Math.max(12, Math.min(g.W - 12 - bw, ax - bw / 2))
    const by = ay - bh - 10
    ctx.save()
    ctx.globalAlpha = fade
    ctx.translate(ax, ay)
    ctx.scale(pop, pop)
    ctx.translate(-ax, -ay)
    const fill = b.who === 'aliva' ? '#ffe3ec' : '#ffffff'
    ctx.shadowColor = 'rgba(40,10,30,0.3)'
    ctx.shadowBlur = 10
    ctx.fillStyle = fill
    rrect(ctx, bx, by, bw, bh, 15)
    ctx.fill()
    ctx.shadowBlur = 0
    poly(ctx, [ax - 7, by + bh - 1, ax + 7, by + bh - 1, ax, by + bh + 9], fill)
    ctx.fillStyle = '#4a2f36'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(b.text, bx + bw / 2, by + bh / 2 + 1, maxW - 24)
    ctx.restore()
  }
}

export function render(ctx, g) {
  const { dpr, scale: s } = g
  let sx = 0
  let sy = 0
  if (g.shake > 0) {
    sx = (Math.random() - 0.5) * 16 * g.shake
    sy = (Math.random() - 0.5) * 16 * g.shake
  }
  ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * (s * g.offX + sx), dpr * sy)
  drawBackdrop(ctx, g)
  drawGround(ctx, g)
  for (const b of g.blocks) drawBlock(ctx, b)
  for (const p of g.projectiles) drawThrowable(ctx, p.type, p.body.position.x, p.body.position.y, p.body.angle)

  const sk = g.srikant
  drawSrikant(
    ctx,
    {
      x: sk.body.position.x,
      y: sk.body.position.y,
      angle: sk.body.angle + (sk.ko ? Math.sin(g.t * 3) * 0.06 : 0),
      mood: sk.mood,
      headphones: sk.headphones,
      bumps: sk.bumps,
      dizzyT: sk.dizzyT,
      ko: sk.ko,
    },
    g.t,
  )

  const hand = drawAliva(ctx, g.aliva, g.t)
  g.handPos = hand
  if (g.ready && g.nextType) drawThrowable(ctx, g.nextType, hand.x, hand.y - 4, -0.4)
  drawAim(ctx, g, hand)
  drawParticles(ctx, g)

  ctx.setTransform(dpr, 0, 0, dpr, dpr * sx, dpr * sy)
  drawScreenText(ctx, g)
}
