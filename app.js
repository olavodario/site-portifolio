/* ========================================
   OLAVO DARIO PORTFOLIO — SCRIPTS
   ======================================== */

(function () {
  'use strict';

  // ============================
  // 1. TYPING ANIMATION (Header)
  // ============================
  const roles = [
    'Desenvolvedor de Software',
    'Desenvolvedor de Automações',
    'Desenvolvedor Backend',
  ];

  const headerRole = document.getElementById('headerRole');
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingDelay = 80;

  function typeRole() {
    const current = roles[roleIndex];

    if (!isDeleting) {
      headerRole.textContent = current.substring(0, charIndex + 1);
      charIndex++;
      if (charIndex === current.length) {
        isDeleting = true;
        typingDelay = 2000; // pause at full text
      } else {
        typingDelay = 70 + Math.random() * 40;
      }
    } else {
      headerRole.textContent = current.substring(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typingDelay = 400;
      } else {
        typingDelay = 35;
      }
    }

    setTimeout(typeRole, typingDelay);
  }

  // Start typing after a short delay
  setTimeout(typeRole, 800);

  // ============================
  // 2. CIRCUIT / SNAKE CANVAS ANIMATION
  // ============================
  const canvas = document.getElementById('heroCanvas');
  const ctx = canvas.getContext('2d');

  let W, H;
  const CELL = 30;
  let cols, rows;

  function resizeCanvas() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    cols = Math.floor(W / CELL);
    rows = Math.floor(H / CELL);
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // --- Grid drawing ---
  function drawGrid() {
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.03)';
    ctx.lineWidth = 0.5;

    for (let x = 0; x <= cols; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL, 0);
      ctx.lineTo(x * CELL, H);
      ctx.stroke();
    }
    for (let y = 0; y <= rows; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL);
      ctx.lineTo(W, y * CELL);
      ctx.stroke();
    }
  }

  // --- Snake / Trace Agent ---
  class TraceAgent {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.floor(Math.random() * cols);
      this.y = Math.floor(Math.random() * rows);
      this.dir = this.randomDir();
      this.trail = [];
      this.maxTrail = 40 + Math.floor(Math.random() * 50);
      this.speed = 0.3 + Math.random() * 0.4;
      this.life = 0;
      this.maxLife = 200 + Math.floor(Math.random() * 300);
      this.turnChance = 0.06 + Math.random() * 0.06;
      this.hue = 155 + Math.random() * 20; // green range
    }

    randomDir() {
      const dirs = [
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 0, dy: -1 },
      ];
      return dirs[Math.floor(Math.random() * dirs.length)];
    }

    turnRight() {
      const { dx, dy } = this.dir;
      this.dir = { dx: -dy, dy: dx };
    }

    turnLeft() {
      const { dx, dy } = this.dir;
      this.dir = { dx: dy, dy: -dx };
    }

    update() {
      this.life++;

      // Random turns
      if (Math.random() < this.turnChance) {
        Math.random() > 0.5 ? this.turnRight() : this.turnLeft();
      }

      // Move
      this.x += this.dir.dx * this.speed;
      this.y += this.dir.dy * this.speed;

      // Record trail
      this.trail.push({ x: this.x * CELL, y: this.y * CELL });
      if (this.trail.length > this.maxTrail) {
        this.trail.shift();
      }

      // Bounce off walls
      if (this.x < 0 || this.x > cols) {
        this.dir.dx *= -1;
        this.x = Math.max(0, Math.min(cols, this.x));
      }
      if (this.y < 0 || this.y > rows) {
        this.dir.dy *= -1;
        this.y = Math.max(0, Math.min(rows, this.y));
      }

      // End of life → respawn
      if (this.life > this.maxLife) {
        this.reset();
      }
    }

    draw() {
      if (this.trail.length < 2) return;

      const len = this.trail.length;

      for (let i = 1; i < len; i++) {
        const alpha = (i / len) * 0.5;
        const prev = this.trail[i - 1];
        const curr = this.trail[i];

        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(curr.x, curr.y);
        ctx.strokeStyle = `hsla(${this.hue}, 70%, 65%, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Head glow
      const head = this.trail[len - 1];
      const grd = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 12);
      grd.addColorStop(0, `hsla(${this.hue}, 80%, 70%, 0.6)`);
      grd.addColorStop(1, `hsla(${this.hue}, 80%, 70%, 0)`);
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(head.x, head.y, 12, 0, Math.PI * 2);
      ctx.fill();

      // Node dots along trail
      for (let i = 0; i < len; i += 8) {
        const pt = this.trail[i];
        const a = (i / len) * 0.4;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 70%, 70%, ${a})`;
        ctx.fill();
      }
    }
  }

  // Create agents
  const AGENT_COUNT = 5;
  const agents = [];
  for (let i = 0; i < AGENT_COUNT; i++) {
    agents.push(new TraceAgent());
  }

  // --- Static circuit nodes ---
  const circuitNodes = [];
  const NODE_COUNT = 20;
  for (let i = 0; i < NODE_COUNT; i++) {
    circuitNodes.push({
      x: Math.random() * W,
      y: Math.random() * H,
      radius: 1.5 + Math.random() * 2,
      pulse: Math.random() * Math.PI * 2,
      speed: 0.01 + Math.random() * 0.02,
    });
  }

  function drawCircuitNodes(time) {
    circuitNodes.forEach((node) => {
      node.pulse += node.speed;
      const alpha = 0.08 + Math.sin(node.pulse) * 0.06;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`;
      ctx.fill();
    });
  }

  // --- Animation Loop ---
  let lastTime = 0;
  function animate(time) {
    const dt = time - lastTime;
    lastTime = time;

    ctx.clearRect(0, 0, W, H);

    // Background grid
    drawGrid();

    // Circuit nodes
    drawCircuitNodes(time);

    // Agents
    agents.forEach((agent) => {
      agent.update();
      agent.draw();
    });

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

  // ============================
  // 3. SCROLL REVEAL
  // ============================
  const revealElements = document.querySelectorAll('.reveal-up');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, Number(delay));
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // ============================
  // 4. HEADER SCROLL BEHAVIOR
  // ============================
  const header = document.getElementById('header');

  function onScroll() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Active nav link
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.scrollY + 100;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const link = document.querySelector(`.nav-link[href="#${id}"]`);

      if (link) {
        if (scrollY >= top && scrollY < top + height) {
          document.querySelectorAll('.nav-link').forEach((l) => l.classList.remove('active'));
          link.classList.add('active');
        }
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // initial

  // ============================
  // 5. MOBILE NAV TOGGLE
  // ============================
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    nav.classList.toggle('open');
  });

  // Close nav on link click
  nav.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      nav.classList.remove('open');
    });
  });

  // ============================
  // 6. SMOOTH SCROLL
  // ============================
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        const offset = 72; // header height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ============================
  // 7. CUSTOM CURSOR
  // ============================
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');

  if (window.matchMedia('(pointer: fine)').matches) {
    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
    });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;

      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';

      requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover effect on interactive elements
    const hoverTargets = document.querySelectorAll('a, button, .stack-item, .project-card, .contact-card, .stat-card, .diff-card');
    hoverTargets.forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  } else {
    // Remove cursor elements on touch devices
    cursorDot.style.display = 'none';
    cursorRing.style.display = 'none';
  }
})();