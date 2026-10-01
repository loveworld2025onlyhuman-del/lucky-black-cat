/* =========================================================
   玄夜守護・幸運黑貓殿堂 - 核心互動邏輯 (script.js)
   ========================================================= */

// ---------- 音效合成器 (Web Audio API - 零外部檔案依賴) ----------
class CatAudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // 貓咪可愛叫聲 (喵～)
  playMeow(pitch = 520) {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1500, now);

    // 貓叫的音調滑動 (先微升再緩降)
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(pitch * 1.35, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.9, now + 0.38);

    // 音量包絡線
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.46);
  }

  // 貓咪舒服呼嚕聲 (Purr)
  playPurr() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;

    for (let i = 0; i < 4; i++) {
      const t = now + i * 0.18;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(55, t);
      osc.frequency.linearRampToValueAtTime(45, t + 0.15);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.08);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.17);
    }
  }

  // 幸運金鈴清脆鐘聲
  playBell() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const frequencies = [1180, 2360, 3540];

    frequencies.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);

      gain.gain.setValueAtTime(0.2 / (idx + 1), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2 - idx * 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 1.3);
    });
  }

  // 魔法靈氣星星音效
  playSparkle() {
    if (!this.enabled) return;
    this.init();
    const notes = [587.33, 739.99, 880.00, 1174.66, 1479.98];
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const t = now + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.36);
    });
  }

  // 吃小魚乾的滿足咀嚼音
  playMunch() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    [0, 0.12, 0.25].forEach((offset) => {
      const t = now + offset;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320 - offset * 100, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.08);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    });
  }

  // 厄運驅散音 (空靈神秘共鳴)
  playDispel() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const chords = [440, 554.37, 659.25, 880];
    chords.forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 1.9);
    });
  }
}

const audio = new CatAudioSynthesizer();

// ---------- 狀態管理 ----------
const state = {
  mode: 'pet', // 'pet', 'laser', 'feed'
  luckEnergy: 35,
  luckLevel: 1,
  selectedWishType: '事業學業',
  wishes: []
};

// 黑貓對話語錄庫
const catQuotes = [
  "黑貓過路不是倒楣，是把好運偷偷塞進你的口袋！🐾",
  "呼嚕嚕～你的溫柔撫摸，已經替你築起了好運結界！✨",
  "本喵在此，任何水逆與霉運通通退散！🌟",
  "喵～你知道嗎？英國水手出海都要帶黑貓祈求平安順風呢！⛵",
  "今天你的幸運值正在持續飆升中，勇敢大步前進吧！🍀",
  "多摸摸我的小腦袋，會激發意想不到的靈感與創造力喔！💡",
  "小魚乾是神聖的貢品～吃了我會更加倍保護你的！🐟"
];

// 今日指南籤庫
const dailyGuides = [
  { color: "曜黑與深紫", hex: "#9d4edd", num: "7 與 9", item: "黑曜石、鈴鐺御守", whisper: "「在西方傳說中黑貓是靈通的象徵；在東方，黑貓能鎮宅辟邪、驅走厄運！」" },
  { color: "璀璨金與墨黑", hex: "#ffd166", num: "3 與 8", item: "金屬飾品、幸運咖啡", whisper: "「金黃色的雙眸能洞察迷霧，今天適合做出重大的關鍵抉擇！」" },
  { color: "寶石翠綠與夜黑", hex: "#06d6a0", num: "2 與 6", item: "綠色植栽、貓掌吊飾", whisper: "「保持優雅從容的步調，好運會像貓咪一樣悄悄來到你身邊。」" },
  { color: "赤紅與午夜黑", hex: "#ef476f", num: "1 與 5", item: "紅色信物、熱可可", whisper: "「勇敢跨出第一步，黑貓的靈力會化作你的避風港與底氣！」" }
];

// 御神籤籤詩庫
const omikujiFortunes = [
  {
    rank: "超大吉",
    title: "「靈貓踏月・萬象更新」",
    poem: "夜色澄澈星河照，黑貓躍上好運梢。<br>逢凶化吉呈祥瑞，心有所願必得饒。",
    advice: "當前運勢如日中天！直覺非常精準，任何新計畫都可大膽啟動！",
    energyBonus: 25
  },
  {
    rank: "大吉",
    title: "「黑貓回眸・貴人迎門」",
    poem: "玄衣生輝靈氣滿，悠然信步過長廊。<br>莫愁前路無知己，自有明燈引暖光。",
    advice: "近期身邊將有強力貴人相助，多傾聽朋友與長輩的建議！",
    energyBonus: 20
  },
  {
    rank: "吉",
    title: "「踏雪無痕・平安順遂」",
    poem: "漫步庭階心自定，微風輕拂竹林青。<br>守中抱樸無煩惱，好景長隨日月盈。",
    advice: "步調穩定就是最大優勢，放鬆心情喝杯茶，好運自會水到渠成。",
    energyBonus: 15
  },
  {
    rank: "招財大吉",
    title: "「金爪納福・財源廣進」",
    poem: "右爪一招千客至，左爪輕揚萬兩金。<br>黑貓鎮守庫府滿，富貴平安樂稱心。",
    advice: "財運正在顯著回升，適合理財規劃，有望迎來意外驚喜小紅包！",
    energyBonus: 22
  },
  {
    rank: "水逆退散",
    title: "「靈氣辟邪・破曉迎晴」",
    poem: "利爪微張陰霾散，一聲長啼曙光穿。<br>舊事已過翻新頁，坦途千里在前川。",
    advice: "過去卡關或焦慮的煩惱即將煙消雲散，重振精神準備大顯身手！",
    energyBonus: 18
  }
];

// ---------- DOM 元素快取 ----------
const catHead = document.getElementById('catHead');
const eyeLeft = document.getElementById('eyeLeft');
const eyeRight = document.getElementById('eyeRight');
const pupilLeft = document.getElementById('pupilLeft');
const pupilRight = document.getElementById('pupilRight');
const catTongue = document.getElementById('catTongue');
const goldenBell = document.getElementById('goldenBell');
const catTail = document.getElementById('catTail');
const pawLeft = document.getElementById('pawLeft');
const pawRight = document.getElementById('pawRight');
const catCharacter = document.getElementById('catCharacter');
const catBubble = document.getElementById('catBubble');
const bubbleText = document.getElementById('bubbleText');
const laserDot = document.getElementById('laserDot');
const treatsContainer = document.getElementById('treatsContainer');
const catStage = document.getElementById('catStage');
const interactionEffects = document.getElementById('interactionEffects');

// 指標與計量條
const luckMeterBar = document.getElementById('luckMeterBar');
const luckPct = document.getElementById('luckPct');
const luckLevelTitle = document.getElementById('luckLevelTitle');

// 模式按鈕
const modeButtons = document.querySelectorAll('.mode-btn');

// 御神籤
const drawBtn = document.getElementById('drawBtn');
const cylinderWrapper = document.getElementById('cylinderWrapper');
const fortuneResult = document.getElementById('fortuneResult');
const fortuneRank = document.getElementById('fortuneRank');
const fortuneTitle = document.getElementById('fortuneTitle');
const fortunePoem = document.getElementById('fortunePoem');
const fortuneAdvice = document.getElementById('fortuneAdvice');
const closeFortuneBtn = document.getElementById('closeFortuneBtn');

// 祈願
const wishTypes = document.querySelectorAll('.wish-type-btn');
const wishInput = document.getElementById('wishInput');
const sendWishBtn = document.getElementById('sendWishBtn');
const wishesList = document.getElementById('wishesList');
const emptyWishTip = document.getElementById('emptyWishTip');

// 頂部控制項
const soundBtn = document.getElementById('soundBtn');
const themeBtn = document.getElementById('themeBtn');

// 每日指引
const refreshGuideBtn = document.getElementById('refreshGuideBtn');
const luckyColorTag = document.getElementById('luckyColorTag');
const luckyNum = document.getElementById('luckyNum');
const luckyItem = document.getElementById('luckyItem');
const catWhisper = document.getElementById('catWhisper');

// 快捷操作
const actionPurr = document.getElementById('actionPurr');
const actionMeow = document.getElementById('actionMeow');
const actionBell = document.getElementById('actionBell');
const actionDispel = document.getElementById('actionDispel');

// ---------- 星空背景 Canvas 渲染 ----------
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let stars = [];
let shootingStars = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initStars();
}

function initStars() {
  stars = [];
  const starCount = Math.floor((canvas.width * canvas.height) / 5000);
  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.6 + 0.3,
      alpha: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.02 + 0.005,
      hue: Math.random() > 0.7 ? 48 : 260
    });
  }
}

function renderBackground() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 繪製星光
  stars.forEach((star) => {
    star.alpha += star.speed;
    if (star.alpha > 1 || star.alpha < 0.2) star.speed = -star.speed;

    ctx.save();
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = star.hue === 48 ? `rgba(255, 225, 120, ${star.alpha})` : `rgba(210, 220, 255, ${star.alpha})`;
    ctx.shadowBlur = star.radius * 3;
    ctx.shadowColor = '#ffd166';
    ctx.fill();
    ctx.restore();
  });

  // 偶爾生成流星
  if (Math.random() < 0.015 && shootingStars.length < 2) {
    shootingStars.push({
      x: Math.random() * canvas.width * 0.8,
      y: Math.random() * (canvas.height * 0.4),
      length: Math.random() * 80 + 40,
      speed: Math.random() * 9 + 7,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
      opacity: 1
    });
  }

  // 繪製與更新流星
  for (let i = shootingStars.length - 1; i >= 0; i--) {
    const s = shootingStars[i];
    s.x += Math.cos(s.angle) * s.speed;
    s.y += Math.sin(s.angle) * s.speed;
    s.opacity -= 0.025;

    if (s.opacity <= 0) {
      shootingStars.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.strokeStyle = `rgba(255, 230, 160, ${s.opacity})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x - Math.cos(s.angle) * s.length, s.y - Math.sin(s.angle) * s.length);
    ctx.stroke();
    ctx.restore();
  }

  requestAnimationFrame(renderBackground);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
renderBackground();

// ---------- 眼睛追隨滑鼠運動 (靈動眼神) ----------
function updateCatEyeTracking(mouseX, mouseY) {
  [
    { eye: eyeLeft, pupil: pupilLeft },
    { eye: eyeRight, pupil: pupilRight }
  ].forEach(({ eye, pupil }) => {
    const rect = eye.getBoundingClientRect();
    const eyeCenterX = rect.left + rect.width / 2;
    const eyeCenterY = rect.top + rect.height / 2;

    const dx = mouseX - eyeCenterX;
    const dy = mouseY - eyeCenterY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = 11; // 瞳孔最大偏移半徑

    const moveRadius = Math.min(dist / 20, maxRadius);
    const angle = Math.atan2(dy, dx);

    const targetX = Math.cos(angle) * moveRadius;
    const targetY = Math.sin(angle) * moveRadius;

    pupil.style.transform = `translate(${targetX}px, ${targetY}px)`;
  });

  // 頭部微幅傾向滑鼠 (逼真互動)
  const headRect = catHead.getBoundingClientRect();
  const headCenterX = headRect.left + headRect.width / 2;
  const headDistX = (mouseX - headCenterX) / window.innerWidth;
  const tilt = headDistX * 12; // 傾斜角度
  catHead.style.transform = `rotate(${tilt}deg)`;
}

// ---------- 滑鼠游標拖尾星塵與全域光波點擊 ----------
let lastTrailTime = 0;
function createCursorTrailParticle(x, y) {
  const p = document.createElement('div');
  p.className = 'cursor-trail-particle';
  const size = Math.random() * 6 + 4;
  p.style.width = `${size}px`;
  p.style.height = `${size}px`;
  p.style.left = `${x}px`;
  p.style.top = `${y}px`;
  const colors = ['#ffd166', '#ffbe0b', '#c77dff', '#ffffff', '#ff9ebb'];
  p.style.background = colors[Math.floor(Math.random() * colors.length)];
  p.style.boxShadow = `0 0 6px ${p.style.background}`;
  document.body.appendChild(p);
  setTimeout(() => p.remove(), 600);
}

window.addEventListener('click', (e) => {
  const ripple = document.createElement('div');
  ripple.className = 'global-click-ripple';
  ripple.style.left = `${e.clientX}px`;
  ripple.style.top = `${e.clientY}px`;
  document.body.appendChild(ripple);
  setTimeout(() => ripple.remove(), 700);
});

// 監聽全局游標
window.addEventListener('mousemove', (e) => {
  updateCatEyeTracking(e.clientX, e.clientY);

  // 游標金粉拖尾
  const now = Date.now();
  if (now - lastTrailTime > 26) {
    lastTrailTime = now;
    createCursorTrailParticle(e.clientX, e.clientY);
  }

  // 若處於追逐紅點模式
  if (state.mode === 'laser') {
    const stageRect = catStage.getBoundingClientRect();
    const relX = e.clientX - stageRect.left;
    const relY = e.clientY - stageRect.top;

    if (relX >= 0 && relX <= stageRect.width && relY >= 0 && relY <= stageRect.height) {
      laserDot.style.opacity = '1';
      laserDot.style.left = `${relX}px`;
      laserDot.style.top = `${relY}px`;
    } else {
      laserDot.style.opacity = '0';
    }
  }
});

// ---------- 黑貓自然生命力 (眨眼、動耳朵、自言自語) ----------
function triggerBlink() {
  eyeLeft.classList.add('blinking');
  eyeRight.classList.add('blinking');
  setTimeout(() => {
    eyeLeft.classList.remove('blinking');
    eyeRight.classList.remove('blinking');
  }, 220);
}

function triggerEarTwitch() {
  const isLeft = Math.random() > 0.5;
  const earEl = document.querySelector(isLeft ? '.ear-left' : '.ear-right');
  if (!earEl) return;
  const cls = isLeft ? 'twitch-left' : 'twitch-right';
  earEl.classList.add(cls);
  setTimeout(() => earEl.classList.remove(cls), 400);
}

// 定時自然隨機小動作
setInterval(() => {
  if (Math.random() < 0.6) triggerBlink();
}, 4200);

setInterval(() => {
  if (Math.random() < 0.4) triggerEarTwitch();
}, 5800);

// 換台詞氣泡
function speakBubble(text) {
  bubbleText.innerText = text;
  catBubble.style.transform = 'scale(1.08) translateY(-6px)';
  setTimeout(() => {
    catBubble.style.transform = 'scale(1) translateY(0)';
  }, 300);
}

// ---------- 幸運能量增長與升級系統 ----------
function addLuckEnergy(amount, reason = "") {
  state.luckEnergy = Math.min(100, state.luckEnergy + amount);
  luckMeterBar.style.width = `${state.luckEnergy}%`;
  luckPct.innerText = `${state.luckEnergy}%`;

  if (state.luckEnergy >= 80) {
    state.luckLevel = 3;
    luckLevelTitle.innerText = "Lv.3 祥瑞玄貓神尊";
  } else if (state.luckEnergy >= 50) {
    state.luckLevel = 2;
    luckLevelTitle.innerText = "Lv.2 默契守護使";
  } else {
    state.luckLevel = 1;
    luckLevelTitle.innerText = "Lv.1 初識黑貓";
  }

  // 滿能量特效
  if (state.luckEnergy === 100) {
    spawnFireworks();
  }
}

// ---------- 互動效果粒子生成 ----------
function spawnParticle(x, y, icon = "💖") {
  const p = document.createElement('div');
  p.className = 'floating-particle';
  p.innerText = icon;
  p.style.left = `${x}px`;
  p.style.top = `${y}px`;

  const tx = (Math.random() - 0.5) * 120;
  const ty = -(Math.random() * 80 + 40);
  const tr = (Math.random() - 0.5) * 60;

  p.style.setProperty('--tx', `${tx}px`);
  p.style.setProperty('--ty', `${ty}px`);
  p.style.setProperty('--tr', `${tr}deg`);

  interactionEffects.appendChild(p);
  setTimeout(() => p.remove(), 1200);
}

function spawnFireworks() {
  audio.playDispel();
  speakBubble("✨ 喵嗚！幸運靈氣已達巔峰！你今天將會是全宇宙最幸運的人！✨");
  const icons = ['🌟', '✨', '🐾', '🍀', '💎', '🎉'];
  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      const rx = Math.random() * 300 + 30;
      const ry = Math.random() * 200 + 80;
      spawnParticle(rx, ry, icons[Math.floor(Math.random() * icons.length)]);
    }, i * 70);
  }
}

// ---------- 模式切換 ----------
modeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    modeButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    state.mode = btn.getAttribute('data-mode');

    if (state.mode === 'laser') {
      speakBubble("🔴 咦？！那是神奇紅點嗎？本喵要抓住它！");
      audio.playMeow(680);
    } else if (state.mode === 'feed') {
      speakBubble("🐟 好香的味道！點擊舞台把鮮美小魚乾投餵給我吧！");
      audio.playMeow(580);
    } else {
      laserDot.style.opacity = '0';
      speakBubble("🤲 呼嚕嚕～最喜歡被溫柔摸摸了！");
      audio.playPurr();
    }
  });
});

// ---------- 中央黑貓舞台點擊互動處理 ----------
catStage.addEventListener('click', (e) => {
  const rect = catStage.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  // 1. 溫柔撫摸模式 (Pet)
  if (state.mode === 'pet') {
    // 頭部 Q 彈動態
    catHead.classList.add('squash-bounce');
    setTimeout(() => catHead.classList.remove('squash-bounce'), 500);

    eyeLeft.classList.add('happy');
    eyeRight.classList.add('happy');
    setTimeout(() => {
      eyeLeft.classList.remove('happy');
      eyeRight.classList.remove('happy');
    }, 700);

    audio.playPurr();
    audio.playSparkle();

    // 噴出愛心與幸運草
    const icons = ['💖', '✨', '🐾', '🍀', '🌟'];
    for (let i = 0; i < 4; i++) {
      spawnParticle(clickX, clickY, icons[Math.floor(Math.random() * icons.length)]);
    }

    addLuckEnergy(6);
    speakBubble(catQuotes[Math.floor(Math.random() * catQuotes.length)]);
  }

  // 2. 追逐紅點模式 (Laser)
  else if (state.mode === 'laser') {
    const isLeft = Math.random() > 0.5;
    const paw = isLeft ? pawLeft : pawRight;
    paw.classList.add('swat');
    setTimeout(() => paw.classList.remove('swat'), 350);

    audio.playMeow(620);
    spawnParticle(clickX, clickY, '💥');
    addLuckEnergy(8);
    speakBubble("🐾 抓到你了！看本喵神準無比的開運飛爪！");
  }

  // 3. 餵食小魚乾模式 (Feed)
  else if (state.mode === 'feed') {
    const fish = document.createElement('div');
    fish.className = 'floating-fish';
    fish.innerText = '🐟';
    fish.style.left = `${clickX}px`;
    fish.style.top = `${clickY}px`;
    treatsContainer.appendChild(fish);

    catTongue.classList.add('lick');
    setTimeout(() => {
      fish.remove();
      catTongue.classList.remove('lick');
    }, 800);

    audio.playMunch();
    addLuckEnergy(10);
    spawnParticle(clickX, clickY, '😋');
    speakBubble("喵嗚～太美味了！黑貓守護神賜予你满满元氣！✨");
  }
});

// ---------- 耳朵特定點擊與懸停 ----------
document.querySelectorAll('.ear').forEach((ear) => {
  ear.addEventListener('click', (e) => {
    e.stopPropagation();
    ear.classList.add('flatten');
    setTimeout(() => ear.classList.remove('flatten'), 450);
    audio.playMeow(740);
    const rect = ear.getBoundingClientRect();
    const stageRect = catStage.getBoundingClientRect();
    spawnParticle(rect.left - stageRect.left + 20, rect.top - stageRect.top + 20, '⭐');
    speakBubble("喵嗚！被捏到貓耳朵啦～毛茸茸的舒服吧！");
    addLuckEnergy(4);
  });
});

// ---------- 鬍鬚特定點擊 ----------
document.querySelectorAll('.whiskers').forEach((whiskers) => {
  whiskers.addEventListener('click', (e) => {
    e.stopPropagation();
    catTongue.classList.add('lick');
    setTimeout(() => catTongue.classList.remove('lick'), 350);
    audio.playMeow(600);
    speakBubble("鬍鬚癢癢的～這可是黑貓感應好運的雷達喔！🐾");
    addLuckEnergy(3);
  });
});

// ---------- 尾巴特定點擊與懸停反饋 ----------
catTail.addEventListener('click', (e) => {
  e.stopPropagation();
  catTail.classList.add('tail-surprised');
  setTimeout(() => catTail.classList.remove('tail-surprised'), 600);
  audio.playMeow(650);
  speakBubble("喵呀！摸到了敏銳的幸運長尾巴～搖走所有煩惱！✨");
  const rect = catTail.getBoundingClientRect();
  const stageRect = catStage.getBoundingClientRect();
  spawnParticle(rect.left - stageRect.left + 25, rect.top - stageRect.top, '💫');
  addLuckEnergy(5);
});

// ---------- 搖響鈴鐺特寫與衝擊波光環 ----------
goldenBell.addEventListener('click', (e) => {
  e.stopPropagation();
  goldenBell.classList.add('ringing');
  audio.playBell();
  triggerEarTwitch();

  // 生成衝擊波光環
  const shockwave = document.createElement('div');
  shockwave.className = 'bell-shockwave-ring';
  goldenBell.appendChild(shockwave);
  setTimeout(() => shockwave.remove(), 800);

  const bellRect = goldenBell.getBoundingClientRect();
  const stageRect = catStage.getBoundingClientRect();
  spawnParticle(bellRect.left - stageRect.left + 10, bellRect.top - stageRect.top, '🔔');
  spawnParticle(bellRect.left - stageRect.left + 15, bellRect.top - stageRect.top, '✨');

  addLuckEnergy(5);
  speakBubble("叮鈴鈴～黃金鈴響，驅散千般惱，引來萬般福！");
  setTimeout(() => goldenBell.classList.remove('ringing'), 900);
});

// ---------- 貓爪擊掌與金爪水印印章 ----------
[pawLeft, pawRight].forEach((paw) => {
  paw.addEventListener('click', (e) => {
    e.stopPropagation();
    paw.classList.add('swat');
    setTimeout(() => paw.classList.remove('swat'), 350);
    audio.playMeow(500);
    audio.playSparkle();

    // 在貓爪位置蓋下金色貓爪大印章
    const pawRect = paw.getBoundingClientRect();
    const stageRect = catStage.getBoundingClientRect();
    const stamp = document.createElement('div');
    stamp.className = 'golden-paw-stamp';
    stamp.innerText = '🐾';
    stamp.style.left = `${pawRect.left - stageRect.left + 20}px`;
    stamp.style.top = `${pawRect.top - stageRect.top - 10}px`;
    catStage.appendChild(stamp);
    setTimeout(() => stamp.remove(), 900);

    speakBubble("🐾 跟你擊掌！黑貓神聖金爪印，保佑你大吉大利！");
    addLuckEnergy(6);
  });
});

// ---------- 卡片 3D 懸停微視差 (Tilt) 與按鈕水波紋 ----------
document.querySelectorAll('.glass-card').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotX = -(y / rect.height) * 8;
    const rotY = (x / rect.width) * 8;
    card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.015, 1.015, 1.015)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  });
});

document.querySelectorAll('button').forEach((btn) => {
  btn.addEventListener('click', function(e) {
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'btn-ripple';
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// ---------- 快捷操作指令列 ----------
actionPurr.addEventListener('click', () => {
  audio.playPurr();
  speakBubble("呼嚕嚕嚕～聽見黑貓的頻率了嗎？這能撫平內心所有焦慮與疲倦。");
  addLuckEnergy(3);
});

actionMeow.addEventListener('click', () => {
  audio.playMeow(560);
  speakBubble("喵嗚～（黑貓語翻譯：祝你今天順心如意，喜事連連！）");
  addLuckEnergy(3);
});

actionBell.addEventListener('click', () => {
  goldenBell.classList.add('ringing');
  audio.playBell();
  speakBubble("🔔 開運金鈴迴盪，清靈心境，福氣盈門！");
  setTimeout(() => goldenBell.classList.remove('ringing'), 900);
  addLuckEnergy(5);
});

actionDispel.addEventListener('click', () => {
  audio.playDispel();
  // 畫面震波光暈動態
  document.body.style.filter = 'brightness(1.2)';
  setTimeout(() => { document.body.style.filter = 'none'; }, 300);
  speakBubble("🔮【玄夜辟邪大陣】：霉運退散、小人遠離、好運護體！");
  addLuckEnergy(15);
  spawnFireworks();
});

// ---------- 御神籤 (Omikuji) 抽籤功能 ----------
drawBtn.addEventListener('click', () => {
  cylinderWrapper.classList.add('shaking');
  cylinderWrapper.classList.remove('stick-out');
  drawBtn.disabled = true;
  fortuneResult.style.display = 'none';

  audio.playBell();

  setTimeout(() => {
    cylinderWrapper.classList.remove('shaking');
    cylinderWrapper.classList.add('stick-out');
    audio.playSparkle();

    const randomFortune = omikujiFortunes[Math.floor(Math.random() * omikujiFortunes.length)];
    fortuneRank.innerText = randomFortune.rank;
    fortuneTitle.innerText = randomFortune.title;
    fortunePoem.innerHTML = randomFortune.poem;
    fortuneAdvice.innerText = randomFortune.advice;

    fortuneResult.style.display = 'block';
    drawBtn.disabled = false;

    addLuckEnergy(randomFortune.energyBonus);
    speakBubble(`🌟 御神籤出爐啦！抽得【${randomFortune.rank}】，黑貓靈力加持！`);
  }, 1200);
});

closeFortuneBtn.addEventListener('click', () => {
  fortuneResult.style.display = 'none';
  cylinderWrapper.classList.remove('stick-out');
  audio.playSparkle();
  speakBubble("好運已妥善封存！今天請帶著黑貓的祝福昂首闊步吧！🐾");
});

// ---------- 祈願御守金爪蓋章 ----------
wishTypes.forEach((btn) => {
  btn.addEventListener('click', () => {
    wishTypes.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    state.selectedWishType = btn.getAttribute('data-type');
  });
});

function handleSendWish() {
  const text = wishInput.value.trim();
  if (!text) {
    wishInput.focus();
    return;
  }

  // 貓咪揮爪動作
  pawRight.classList.add('swat');
  setTimeout(() => pawRight.classList.remove('swat'), 350);

  audio.playSparkle();
  audio.playBell();

  // 加入許願清單
  if (emptyWishTip) emptyWishTip.style.display = 'none';

  const wishItem = document.createElement('div');
  wishItem.className = 'wish-item';
  wishItem.innerHTML = `
    <span class="wish-item-text">[${state.selectedWishType}] ${escapeHTML(text)}</span>
    <span class="wish-item-badge">🐾 金爪加持</span>
  `;
  wishesList.prepend(wishItem);

  wishInput.value = '';
  addLuckEnergy(12);
  speakBubble(`✨ 願望「${text}」已被黑貓金爪封印守護！必有回響！`);
}

sendWishBtn.addEventListener('click', handleSendWish);
wishInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSendWish();
});

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// ---------- 今日黑貓指引切換 ----------
refreshGuideBtn.addEventListener('click', () => {
  audio.playSparkle();
  const randomGuide = dailyGuides[Math.floor(Math.random() * dailyGuides.length)];
  luckyColorTag.innerHTML = `<span class="color-dot" style="background: ${randomGuide.hex};"></span> ${randomGuide.color}`;
  luckyNum.innerText = randomGuide.num;
  luckyItem.innerText = randomGuide.item;
  catWhisper.innerText = randomGuide.whisper;
  speakBubble("🔮 感應星象中...已為你更新今日黑貓開運秘訣！");
});

// ---------- 頂部控制項 (音效開關 / 神社日夜) ----------
soundBtn.addEventListener('click', () => {
  audio.enabled = !audio.enabled;
  const label = soundBtn.querySelector('.label');
  const icon = soundBtn.querySelector('.icon');
  if (audio.enabled) {
    label.innerText = '音效：開';
    icon.innerText = '🔔';
    audio.playSparkle();
  } else {
    label.innerText = '音效：關';
    icon.innerText = '🔕';
  }
});

themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('theme-day');
  const isDay = document.body.classList.contains('theme-day');
  const label = themeBtn.querySelector('.label');
  const icon = themeBtn.querySelector('.icon');

  if (isDay) {
    label.innerText = '神社晨曦';
    icon.innerText = '☀️';
    speakBubble("☀️ 晨光灑落神社，黑貓伸了個大懶腰！迎接充滿希望的一天！");
  } else {
    label.innerText = '星夜模式';
    icon.innerText = '🌙';
    speakBubble("🌙 漫天繁星璀璨，黑貓的金色眼睛在夜色中格外閃耀！");
  }
  audio.playSparkle();
});
