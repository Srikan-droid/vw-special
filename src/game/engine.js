import Matter from 'matter-js'
import { LEVELS, ALIVA_LINES, REFILL_LINE, KO } from './levels'
import { sfx } from './audio'
import { render } from './render'

const { Engine, Bodies, Body, Composite, Events } = Matter

const WORLD_W = 560
const STEP = 1000 / 60
const GRAVITY_PER_STEP = 0.001 * STEP * STEP
const VMAX = 15.5
const MAX_PULL = 120 // screen px
const HP = { wood: 10, stone: 18, glass: 4 }
const DENSITY = { wood: 0.0012, stone: 0.0026, glass: 0.0008 }
const SHARD = { wood: '#c98b52', stone: '#8d8aa0', glass: '#cdeeff' }
const POPS = ['BONK!', 'THWACK!', 'POW!', 'BOINK!', 'WHAM!']
const REFILL = ['chappal', 'pillow', 'chappal', 'pan']

const THROW_BODY = {
  chappal: (x, y) => Bodies.circle(x, y, 12, { density: 0.004, restitution: 0.3, friction: 0.6 }),
  pillow: (x, y) => Bodies.rectangle(x, y, 44, 28, { chamfer: { radius: 11 }, density: 0.0035, restitution: 0.2, friction: 0.8 }),
  teddy: (x, y) => Bodies.circle(x, y, 15, { density: 0.003, restitution: 0.65, friction: 0.5 }),
  pan: (x, y) => Bodies.circle(x, y, 14, { density: 0.008, restitution: 0.15, friction: 0.4 }),
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const buzz = (pattern) => navigator.vibrate?.(pattern)
const lerp = (a, b, t) => a + (b - a) * t

export function createGame(canvas, emit, { autoplay = false } = {}) {
  const ctx = canvas.getContext('2d')
  const engine = Engine.create()
  engine.gravity.y = 1
  const world = engine.world

  const g = {
    t: 0,
    acc: 0,
    phase: 'title',
    sky: 0,
    skyTarget: 0,
    level: 0,
    bonks: 0,
    totalBumps: 0,
    blocks: [],
    projectiles: [],
    particles: [],
    bubbles: [],
    timers: [],
    queue: [],
    nextType: null,
    ready: false,
    aim: null,
    drag: null,
    active: null,
    shake: 0,
    slowmo: 0,
    settle: 0,
    stats: { thrown: 0, bonks: 0, smashed: 0 },
    aliva: { x: 70, y: 0, mood: 'angry', armA: -0.35, throwT: 0, smugT: 0 },
    gravityPerStep: GRAVITY_PER_STEP,
    stars: Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.6 + 0.5, tw: Math.random() * 6 })),
    clouds: Array.from({ length: 5 }, () => ({ x: Math.random(), y: 0.12 + Math.random() * 0.4, s: 0.7 + Math.random() * 0.7, v: 6 + Math.random() * 8 })),
    birds: Array.from({ length: 4 }, () => ({ x: Math.random(), y: 0.2 + Math.random() * 0.25 })),
    fireflies: Array.from({ length: 14 }, () => ({ x: Math.random(), y: Math.random(), s: 0.5 + Math.random(), p: Math.random() * 6 })),
  }
  let ground = null

  // ---------- layout ----------

  function layout() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const W = canvas.clientWidth
    const H = canvas.clientHeight
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    const scale = Math.min(W / WORLD_W, H / 560)
    const WH = H / scale
    // tall phones get the ground lower so the scene sits near the thumb
    const groundY = Math.round(WH * (H / W > 1.4 ? 0.8 : 0.74))
    const dy = g.groundY === undefined ? 0 : groundY - g.groundY
    Object.assign(g, { W, H, dpr, scale, WH, groundY, offX: (W / scale - WORLD_W) / 2 })
    g.x0 = -g.offX
    g.x1 = W / scale - g.offX
    g.aliva.y = groundY - 30
    if (dy) for (const b of Composite.allBodies(world)) Body.translate(b, { x: 0, y: dy })
  }

  // ---------- helpers ----------

  function later(sec, fn) {
    g.timers.push({ at: g.t + sec, fn })
  }

  function say(text, dur = 2.4, who = 'srikant') {
    g.bubbles = g.bubbles.filter((b) => b.who !== who)
    g.bubbles.push({ who, text, t: 0, dur })
  }

  function burst(x, y, color, n, speed = 220, kind = 'dot') {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const s = (0.35 + Math.random() * 0.65) * speed
      g.particles.push({
        kind,
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 60,
        life: 0.8,
        max: 0.8,
        size: kind === 'shard' ? 5 + Math.random() * 5 : 2 + Math.random() * 2.5,
        color,
        grav: 600,
        rot: Math.random() * 6,
        vr: (Math.random() - 0.5) * 12,
      })
    }
  }

  function popText(text, x, y, color = '#ffd166', size = 34) {
    g.particles.push({ kind: 'pop', text, x, y, vx: 0, vy: -40, life: 1, max: 1, size, color, grav: 0, rot: (Math.random() - 0.5) * 0.4 })
  }

  function emitState() {
    const L = LEVELS[g.level]
    emit('state', {
      level: g.level,
      levelName: L.name,
      bonks: g.bonks,
      need: L.bonksNeeded,
      queue: [...g.queue],
      stats: { ...g.stats },
    })
  }

  // ---------- level setup ----------

  function clearWorld() {
    Composite.clear(world, false)
    ground = Bodies.rectangle(WORLD_W / 2, g.groundY + 100, 6000, 200, { isStatic: true, friction: 1, label: 'ground' })
    Composite.add(world, ground)
    g.blocks = []
    g.projectiles = []
    g.active = null
  }

  function buildLevel(i) {
    const L = LEVELS[i]
    const gy = g.groundY
    clearWorld()
    for (const b of L.blocks) {
      const body = Bodies.rectangle(b.x, gy - b.yb - b.h / 2, b.w, b.h, {
        density: DENSITY[b.mat],
        friction: 0.9,
        frictionStatic: 1.2,
        restitution: 0.05,
        chamfer: { radius: 2 },
        label: 'block',
      })
      const blk = { ...b, body, hp: HP[b.mat], maxHp: HP[b.mat], flash: 0, counted: false, dead: false }
      body.plugin.block = blk
      g.blocks.push(blk)
      Composite.add(world, body)
    }
    const s = L.srikant
    const body = Bodies.rectangle(s.x, gy - s.yb - 27, 30, 54, { density: 0.0018, friction: 0.9, chamfer: { radius: 10 }, label: 'srikant' })
    Composite.add(world, body)
    g.srikant = { body, x0: s.x, mood: 'peek', headphones: !!s.headphones, bumps: g.totalBumps, dizzyT: 0, hitT: 0, cool: 0, fly: null, ko: false }
    g.queue = [...L.ammo]
    g.nextType = g.queue[0]
    g.bonks = 0
    g.settle = 0.9
    g.aliva.mood = 'angry'
  }

  function startLevel(i) {
    g.level = i
    g.skyTarget = i
    buildLevel(i)
    g.phase = 'play'
    g.ready = true
    const L = LEVELS[i]
    if (L.intro) later(0.6, () => say(L.intro, 2.2))
    emit('toast', L.toast)
    emit('phase', 'play')
    emitState()
  }

  // ---------- hits ----------

  function smashed(blk) {
    if (blk.counted) return
    blk.counted = true
    g.stats.smashed++
    emitState()
  }

  function shatter(blk) {
    blk.dead = true
    Composite.remove(world, blk.body)
    g.blocks = g.blocks.filter((b) => b !== blk)
    const { x, y } = blk.body.position
    burst(x, y, SHARD[blk.mat], 14, 260, 'shard')
    g.particles.push({ kind: 'text', text: `✗ ${blk.text}`, x, y, vx: 0, vy: -50, life: 1.3, max: 1.3, size: 15, color: '#ffffff', grav: 0 })
    if (blk.mat === 'glass') sfx.glass()
    else sfx.crash()
    g.shake = Math.max(g.shake, 0.2)
    smashed(blk)
  }

  function blockHit(blockBody, other, rel) {
    const blk = blockBody.plugin.block
    if (!blk || blk.dead || g.settle > 0 || rel < 2.2) return
    const otherMass = other.isStatic ? blockBody.mass : other.mass
    const massF = Math.min(3, Math.max(0.6, otherMass / 3))
    blk.hp -= (rel - 1.5) * massF * (other.label === 'proj' ? 1.6 : 1)
    blk.flash = 0.2
    if (blk.hp <= 0) shatter(blk)
    else if (other.label === 'proj') sfx.thud()
  }

  function bonk() {
    const L = LEVELS[g.level]
    const sk = g.srikant
    const { x, y } = sk.body.position
    sk.cool = 0.7
    g.bonks++
    g.stats.bonks++
    g.totalBumps++
    sk.bumps = g.totalBumps
    sk.mood = 'hit'
    sk.hitT = 0.55
    sk.dizzyT = 1.8
    g.slowmo = 0.35
    g.shake = 0.45
    sfx.bonk()
    buzz([30, 40, 70])
    popText(pick(POPS), x, y - 58)
    burst(x, y - 20, '#ffd166', 10, 200, 'star')
    if (sk.headphones) {
      sk.headphones = false
      burst(x, y - 20, '#ff5a8a', 6, 240, 'shard')
      say("my headphones!! 😭 ok I'm listening!", 2.4)
    } else {
      say(L.hitLines[(g.bonks - 1) % L.hitLines.length], 2.4)
    }
    later(0.8, () => {
      say(pick(ALIVA_LINES), 1.8, 'aliva')
      g.aliva.mood = 'smug'
      g.aliva.smugT = 2
    })
    emitState()
    if (g.bonks >= L.bonksNeeded) levelCleared()
  }

  function srikantHit(other, rel) {
    const sk = g.srikant
    if (g.phase !== 'play' || g.settle > 0 || sk.cool > 0) return
    const threshold = other.label === 'proj' ? 2 : other.isStatic ? 4 : 2.4
    if (rel >= threshold) bonk()
  }

  Events.on(engine, 'collisionStart', (ev) => {
    for (const pair of ev.pairs) {
      const a = pair.bodyA.parent
      const b = pair.bodyB.parent
      const rel = Math.hypot(a.velocity.x - b.velocity.x, a.velocity.y - b.velocity.y)
      if (a.label === 'block') blockHit(a, b, rel)
      if (b.label === 'block') blockHit(b, a, rel)
      if (a.label === 'srikant') srikantHit(b, rel)
      else if (b.label === 'srikant') srikantHit(a, rel)
    }
  })

  // Freeze Srikant upright in front of the fort for the between-level outro
  function standSrikant(mood) {
    const sk = g.srikant
    Body.setStatic(sk.body, true)
    sk.body.isSensor = true
    Body.setAngle(sk.body, 0)
    Body.setPosition(sk.body, { x: Math.min(g.x1 - 40, 505), y: g.groundY - 27 })
    sk.mood = mood
    sk.dizzyT = 0
    burst(sk.body.position.x, g.groundY - 10, '#ffffff', 8, 120)
  }

  function levelCleared() {
    const L = LEVELS[g.level]
    g.phase = 'cleared'
    g.ready = false
    g.aim = null
    g.drag = null
    sfx.cheer()
    if (g.level === LEVELS.length - 1) {
      later(0.5, knockout)
      return
    }
    later(1.1, () => {
      standSrikant('flag')
      say(L.outro, 2.6)
    })
    later(3.9, () => {
      const next = LEVELS[g.level + 1]
      emit('banner', { level: g.level + 2, name: next.name, sub: next.sub })
      later(2.2, () => startLevel(g.level + 1))
    })
  }

  // ---------- throwing ----------

  function nextReady() {
    if (g.phase !== 'play') return
    if (g.queue.length === 0) {
      say(REFILL_LINE, 2.2)
      later(1.2, () => {
        if (g.phase !== 'play') return
        g.queue = [...REFILL]
        g.nextType = g.queue[0]
        g.ready = true
        sfx.refill()
        burst(g.aliva.x + 10, g.aliva.y - 60, '#ffd166', 10, 160, 'star')
        emitState()
      })
      return
    }
    g.nextType = g.queue[0]
    g.ready = true
    emitState()
  }

  function throwIt(vx, vy) {
    const h = g.handPos || { x: g.aliva.x + 20, y: g.aliva.y - 60 }
    const type = g.queue.shift()
    g.ready = false
    g.aim = null
    g.aliva.throwT = 0.22
    g.stats.thrown++
    sfx.whoosh()
    emit('thrown')
    const body = THROW_BODY[type](h.x, h.y)
    body.label = 'proj'
    body.frictionAir = 0
    Body.setVelocity(body, { x: vx, y: vy })
    Body.setAngularVelocity(body, 0.2)
    Composite.add(world, body)
    const proj = { body, type, t: 0 }
    g.projectiles.push(proj)
    if (g.projectiles.length > 7) Composite.remove(world, g.projectiles.shift().body)
    g.active = proj
    emitState()
  }

  function aimFromDrag(x, y) {
    const dx = g.drag.sx - x
    const dy = g.drag.sy - y
    const len = Math.hypot(dx, dy)
    if (len < 4) {
      g.aim = null
      return
    }
    const f = Math.min(1, len / MAX_PULL)
    g.aim = { vx: (dx / len) * f * VMAX, vy: (dy / len) * f * VMAX, f }
  }

  // Test hook: aim straight at Srikant
  function autoShot() {
    const h = g.handPos
    const target = g.srikant.body.position
    const theta = 0.75
    const dx = target.x - h.x
    const dy = target.y - h.y
    const denom = 2 * Math.cos(theta) ** 2 * (dy + dx * Math.tan(theta))
    let v = denom > 0 ? Math.sqrt((GRAVITY_PER_STEP * dx * dx) / denom) : VMAX
    v = Math.min(VMAX, v * (0.97 + Math.random() * 0.06))
    throwIt(v * Math.cos(theta), -v * Math.sin(theta))
  }

  const onDown = (e) => {
    if (!g.ready || g.phase !== 'play') return
    e.preventDefault()
    canvas.setPointerCapture?.(e.pointerId)
    g.drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY }
    g.aliva.mood = 'aim'
    sfx.stretch()
  }
  const onMove = (e) => {
    if (!g.drag || e.pointerId !== g.drag.id) return
    aimFromDrag(e.clientX, e.clientY)
  }
  const onUp = (e) => {
    if (!g.drag || e.pointerId !== g.drag.id) return
    aimFromDrag(e.clientX, e.clientY)
    const aim = g.aim
    g.drag = null
    if (aim && aim.f > 0.12) throwIt(aim.vx, aim.vy)
    else {
      g.aim = null
      g.aliva.mood = 'angry'
    }
  }
  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointermove', onMove)
  canvas.addEventListener('pointerup', onUp)
  canvas.addEventListener('pointercancel', onUp)

  // ---------- knockout ending ----------

  function knockout() {
    g.phase = 'ko'
    g.skyTarget = 3
    const sk = g.srikant
    sk.headphones = false
    for (const p of g.projectiles) {
      burst(p.body.position.x, p.body.position.y, '#ffffff', 6, 120)
      Composite.remove(world, p.body)
    }
    g.projectiles = []
    g.active = null
    Body.setStatic(sk.body, true)
    sk.body.isSensor = true
    const { x, y } = sk.body.position
    sk.fly = { t: 0, x0: x, y0: y, a0: sk.body.angle, landed: false }
    sk.mood = 'hit'
    sk.hitT = 0
    sk.dizzyT = 0
    say(KO.flyLine, 1.1)
    sfx.whoosh()
    // what's left of the fort crumbles while he's airborne
    g.blocks.forEach((b, i) => later(0.3 + i * 0.1, () => !b.dead && shatter(b)))
    emit('phase', 'ko')
  }

  // He sails up, spins and plants head-first into the ground
  function updateFly(dt) {
    const sk = g.srikant
    const f = sk.fly
    f.t += dt
    const u = Math.min(1, f.t / 1.1)
    const x = lerp(f.x0, 430, u)
    const y = lerp(f.y0, g.groundY - 22, u) - Math.sin(u * Math.PI) * 220
    Body.setPosition(sk.body, { x, y })
    Body.setAngle(sk.body, lerp(f.a0, Math.PI * 3, u))
    if (u < 1 || f.landed) return
    f.landed = true
    sk.ko = true
    sk.mood = 'dizzy'
    sk.dizzyT = Infinity
    g.shake = 0.7
    g.slowmo = 0.3
    sfx.bonk()
    sfx.crash()
    buzz([60, 40, 120])
    burst(430, g.groundY - 4, '#b07a52', 20, 260, 'shard')
    burst(430, g.groundY - 10, '#ffd166', 10, 220, 'star')
    g.particles.push({ kind: 'pop', text: KO.pop, x: 280, y: g.groundY - 250, vx: 0, vy: -10, life: 2.6, max: 2.6, size: 72, color: '#ffd166', grav: 0, rot: -0.12 })
    emit('toast', KO.toast)
    later(0.9, () => say(KO.srikantLine, 3.2))
    later(1.6, () => {
      g.aliva.mood = 'smug'
      say(KO.alivaLine, 2.8, 'aliva')
    })
    later(3.4, () => {
      g.aliva.mood = 'soft'
    })
    later(4.2, () => emit('done', { ...g.stats }))
  }

  // ---------- update ----------

  function update(dt) {
    g.t += dt
    const slow = g.slowmo > 0 ? 0.25 : 1
    g.slowmo = Math.max(0, g.slowmo - dt)
    g.acc += dt * 1000 * slow
    let steps = 0
    while (g.acc >= STEP && steps < 4) {
      Engine.update(engine, STEP)
      g.acc -= STEP
      steps++
    }
    if (steps === 4) g.acc = 0
    g.settle = Math.max(0, g.settle - dt)
    g.shake = Math.max(0, g.shake - dt)
    g.sky += (g.skyTarget - g.sky) * Math.min(1, dt * 0.8)

    const due = g.timers.filter((tm) => tm.at <= g.t)
    g.timers = g.timers.filter((tm) => tm.at > g.t)
    due.forEach((tm) => tm.fn())

    for (const b of g.blocks) {
      b.flash = Math.max(0, b.flash - dt)
      if (!b.counted && g.settle <= 0 && (Math.abs(b.body.angle) > 1 || b.body.position.y > g.groundY + 40)) smashed(b)
    }

    const sk = g.srikant
    sk.cool = Math.max(0, sk.cool - dt)
    sk.dizzyT = Math.max(0, sk.dizzyT - dt)
    if (sk.hitT > 0) {
      sk.hitT -= dt
      if (sk.hitT <= 0 && sk.mood === 'hit') sk.mood = g.phase === 'play' ? (sk.dizzyT > 0 ? 'dizzy' : 'peek') : sk.mood
    }
    if (sk.mood === 'dizzy' && sk.dizzyT <= 0 && g.phase === 'play') sk.mood = 'peek'
    const sp = sk.body.position
    if (g.phase === 'play' && (sp.y > g.groundY + 150 || sp.x > g.x1 + 80 || sp.x < g.x0 - 80)) {
      popText('WHEEE!', Math.min(sp.x, g.x1 - 60), Math.min(sp.y, g.groundY - 60))
      g.bonks = LEVELS[g.level].bonksNeeded - 1
      bonk()
    }

    // Aliva's throwing arm
    const al = g.aliva
    if (g.aim) al.armA = lerp(-0.6, -2.75, g.aim.f)
    else if (al.throwT > 0) {
      al.throwT -= dt
      al.armA = 0.35
    } else al.armA += (-0.35 - al.armA) * Math.min(1, dt * 8)
    if (al.smugT > 0) {
      al.smugT -= dt
      if (al.smugT <= 0 && g.phase === 'play') al.mood = 'angry'
    }

    // projectile in flight → wait for it to settle before the next throw
    for (const p of g.projectiles) p.t += dt
    if (g.active) {
      const b = g.active.body
      const out = b.position.y > g.groundY + 300 || b.position.x > g.x1 + 200 || b.position.x < g.x0 - 200
      if ((g.active.t > 0.6 && b.speed < 0.3) || g.active.t > 3 || out) {
        g.active = null
        nextReady()
      }
    }
    for (const p of [...g.projectiles]) {
      if (p.body.position.x > g.x1 + 250 || p.body.position.y > g.groundY + 400) {
        Composite.remove(world, p.body)
        g.projectiles = g.projectiles.filter((q) => q !== p)
      }
    }

    if (g.srikant.fly) updateFly(dt)

    if (autoplay && g.ready && !g.drag && g.phase === 'play' && g.handPos) {
      g.autoT = (g.autoT || 0) + dt
      if (g.autoT > 0.7) {
        g.autoT = 0
        autoShot()
      }
    }

    if (g.phase === 'title') {
      g.chatT = (g.chatT || 1.5) - dt
      if (g.chatT <= 0) {
        g.chatT = 5
        say(pick(['…hi? 😅', 'please be gentle 🥺', '*hides behind excuses*']), 2.2)
      }
    }

    const pdt = dt * slow
    for (const q of g.particles) {
      q.life -= dt
      if (q.drag) {
        q.vx *= q.drag
        q.vy *= q.drag
      }
      q.vy += (q.grav || 0) * pdt
      q.x += q.vx * pdt
      q.y += q.vy * pdt
      if (q.vr) q.rot += q.vr * pdt
    }
    g.particles = g.particles.filter((q) => q.life > 0)
    for (const b of g.bubbles) b.t += dt
    g.bubbles = g.bubbles.filter((b) => b.t < b.dur)
  }

  // ---------- loop ----------

  layout()
  buildLevel(0)
  g.srikant.mood = 'peek'
  window.addEventListener('resize', layout)

  let raf
  let last = performance.now()
  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    update(dt)
    render(ctx, g)
    raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)

  return {
    start() {
      g.timers = []
      g.bubbles = []
      g.particles = []
      g.totalBumps = 0
      g.stats = { thrown: 0, bonks: 0, smashed: 0 }
      g.sky = 0
      startLevel(0)
    },
    destroy() {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', layout)
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointercancel', onUp)
      Engine.clear(engine)
    },
  }
}
