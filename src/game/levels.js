// Everything worth rewording lives here.
// World is 560 units wide; x = block centre, yb = height of the block's bottom above the ground.

export const THROWABLES = {
  chappal: { emoji: '🩴', name: 'chappal' },
  pillow: { emoji: '🛏️', name: 'pillow' },
  teddy: { emoji: '🧸', name: 'teddy' },
  pan: { emoji: '🍳', name: 'frying pan' },
}

export const LEVELS = [
  {
    name: 'The Wall of Dumb',
    sub: 'Misses every single hint',
    toast: { icon: '🧠', title: "Srikant's brain", text: 'loading… 3% 🐌' },
    intro: '…hi? 😅',
    srikant: { x: 460, yb: 0 },
    bonksNeeded: 1,
    ammo: ['chappal', 'chappal', 'pillow', 'chappal', 'teddy'],
    blocks: [
      { x: 405, yb: 0, w: 30, h: 100, mat: 'wood', text: 'DUMB' },
      { x: 515, yb: 0, w: 30, h: 100, mat: 'wood', text: 'DUMB (AGAIN)' },
      { x: 460, yb: 100, w: 170, h: 26, mat: 'wood', text: 'MISSES EVERY HINT' },
      { x: 460, yb: 126, w: 110, h: 42, mat: 'glass', text: 'CLUELESS' },
    ],
    hitLines: ["Okay okay, I'm dumb 🥲", 'Deserved. Fully deserved.', 'Ow! …okay, I get it now!'],
    outro: "I'll catch every hint. Promise 🏳️",
  },
  {
    name: 'The Tower of Not Expressing',
    sub: 'Headphones on, feelings off',
    toast: { icon: '🎧', title: 'Now playing', text: 'Avoiding My Feelings · Srikant' },
    intro: "🎧 la la la… can't hear you",
    srikant: { x: 465, yb: 136, headphones: true },
    bonksNeeded: 2,
    ammo: ['pillow', 'chappal', 'teddy', 'chappal', 'pan', 'chappal'],
    blocks: [
      { x: 400, yb: 0, w: 30, h: 110, mat: 'stone', text: 'BOTTLED UP' },
      { x: 500, yb: 0, w: 30, h: 110, mat: 'stone', text: "DOESN'T EXPRESS" },
      { x: 450, yb: 110, w: 160, h: 26, mat: 'wood', text: 'FEELINGS.EXE NOT FOUND' },
      { x: 412, yb: 136, w: 24, h: 70, mat: 'glass', text: "I'M FINE" },
    ],
    hitLines: ["I should tell you what I feel…", "I'm bad at saying it, but I feel it", 'OKAY I HAVE FEELINGS 😭'],
    outro: "I'll say what I feel. Out loud. 🏳️",
  },
  {
    name: 'The Castle of Never Initiating',
    sub: 'Never kisses first. Never teases first.',
    toast: { icon: '🙈', title: 'Srikant', text: 'is too shy to hug first' },
    intro: '*waits for you to hug first*',
    srikant: { x: 445, yb: 126 },
    bonksNeeded: 3,
    ammo: ['chappal', 'pillow', 'pan', 'teddy', 'chappal', 'pillow', 'chappal'],
    blocks: [
      { x: 365, yb: 0, w: 30, h: 100, mat: 'stone', text: 'INITIATES LESS' },
      { x: 445, yb: 0, w: 30, h: 100, mat: 'wood', text: 'SHY 🙈' },
      { x: 525, yb: 0, w: 30, h: 100, mat: 'stone', text: 'AWKWARD' },
      { x: 445, yb: 100, w: 200, h: 26, mat: 'wood', text: 'NEVER KISSES FIRST' },
      { x: 395, yb: 126, w: 26, h: 80, mat: 'wood', text: 'NO HUGS' },
      { x: 495, yb: 126, w: 26, h: 80, mat: 'wood', text: 'NO CUDDLES' },
      { x: 445, yb: 206, w: 130, h: 24, mat: 'wood', text: 'NEVER TEASES FIRST' },
      { x: 445, yb: 230, w: 74, h: 34, mat: 'glass', text: 'HANDS OFF' },
    ],
    hitLines: ["I'll kiss you first. Every time. 😘", 'Hugs first. From me. Always!', "I'll tease you till you laugh 😭"],
    outro: "I'll make the first move. Always. 🏳️",
  },
]

export const ALIVA_LINES = ['hmph 😤', 'deserved 💅', 'again? 🙂', 'say sorry properly!', 'that one was for no kisses 😤', 'hehe 😌']

export const REFILL_LINE = 'here… take more. I deserve it 🥲'

export const FINALE = {
  sign: ["I'M SORRY,", 'ALIVA 🥺'],
  line: "I'm sorry, Guluru. For real this time.",
  prompt: 'One last throw… 💗',
  caughtLine: 'Come here. Kissing you first 😘',
  alivaLine: '…okay. come here 💗',
  toast: { icon: '😘', title: 'Srikant', text: 'sending a kiss… first, for once' },
}
