(() => {
  'use strict';
  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.querySelector('.site-nav');
  const navLinks = [...document.querySelectorAll('.site-nav a')];
  const sections = [...document.querySelectorAll('main section[id]')];
  const progressBar = document.getElementById('scrollProgress');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function closeMenu(restoreFocus = false) {
    const wasOpen = navToggle?.getAttribute('aria-expanded') === 'true';
    siteNav?.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
    navToggle?.setAttribute('aria-label', '展开导航');
    document.body.classList.remove('menu-open');
    if (restoreFocus && wasOpen) navToggle.focus();
  }
  navToggle?.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') !== 'true';
    siteNav.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? '收起导航' : '展开导航');
    document.body.classList.toggle('menu-open', isOpen);
  });
  navLinks.forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu(true);
  });
  for (const type of ['click', 'focusin']) {
    document.addEventListener(type, event => {
      if (!header?.contains(event.target)) closeMenu();
    });
  }

  const poses = [
    { id: 'wave', name: '挥手眨眼', message: '很高兴认识你', greeting: '嗨，很高兴认识你！' },
    { id: 'peace', name: '比耶歪头', message: '给生活比个耶', greeting: '给今天比个耶！' },
    { id: 'jump', name: '开心小跳', message: '灵感突然出现', greeting: '抓到一个新灵感！' },
    { id: 'tongue', name: '吐舌叉腰', message: '偶尔调皮一下', greeting: '偶尔也要调皮一下。' },
    { id: 'curious', name: '好奇探头', message: '让我看看新东西', greeting: '让我看看，有什么新东西？' },
    { id: 'proud', name: '得意抱臂', message: '这次做得还不错', greeting: '嗯，这次做得还不错！' },
  ];
  let currentPose = 0;
  const poseButtons = [...document.querySelectorAll('[data-select-pose]')];
  const poseTargets = [document.querySelector('.hero-character'), document.getElementById('posePreview')].filter(Boolean);
  function selectPose(id) {
    const index = poses.findIndex(pose => pose.id === id);
    if (index < 0) return;
    currentPose = index;
    const pose = poses[index];
    poseTargets.forEach(target => {
      target.dataset.characterPose = pose.id;
      target.querySelector('img').alt = `${pose.name}的大斌数字分身`;
      if (!reducedMotion.matches && typeof target.animate === 'function') {
        target.getAnimations().forEach(animation => animation.cancel());
        target.animate(
          [{ opacity: .6, transform: 'translateY(7px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 220, easing: 'ease-out' }
        );
      }
    });
    poseButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.selectPose === id)));
    document.querySelectorAll('.hero-pose-name').forEach(label => { label.textContent = pose.name; });
    const greeting = document.querySelector('.character-greeting');
    if (greeting) greeting.textContent = pose.greeting;
    const status = document.getElementById('poseStatus');
    if (status) status.textContent = `${pose.name} · ${pose.message}`;
  }
  poseButtons.forEach(button => button.addEventListener('click', () => selectPose(button.dataset.selectPose)));
  document.addEventListener('character:select-pose', event => selectPose(event.detail?.id));
  document.querySelectorAll('[data-next-pose]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', () => selectPose(poses[(currentPose + 1) % poses.length].id));
  });
  document.querySelectorAll('.pose-options').forEach(group => { group.hidden = false; });

  document.querySelectorAll('.project-toggle').forEach(button => {
    button.addEventListener('click', () => {
      const detail = document.getElementById(button.getAttribute('aria-controls'));
      if (!detail) return;
      const isOpen = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!isOpen));
      detail.hidden = isOpen;
      const label = button.querySelector('.project-toggle-label');
      if (label) label.textContent = isOpen ? '展开项目详情' : '收起项目详情';
      scheduleUpdate(true);
    });
  });

  let sectionPositions = [];
  let scrollable = 0;
  let markerOffset = 150;
  let frame = 0;
  let needsMeasure = true;
  function updateScroll() {
    frame = 0;
    if (needsMeasure) {
      sectionPositions = sections.map(section => ({ id: section.id, top: section.getBoundingClientRect().top + window.scrollY }));
      scrollable = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      markerOffset = (header?.getBoundingClientRect().height || 72) + 70;
      needsMeasure = false;
    }
    const scrollY = window.scrollY;
    if (progressBar) progressBar.style.transform = `scaleX(${scrollable ? Math.min(1, Math.max(0, scrollY / scrollable)) : 0})`;
    let activeId = 'home';
    sectionPositions.forEach(section => { if (section.top <= scrollY + markerOffset) activeId = section.id; });
    if (scrollable > 0 && scrollY >= scrollable - 4) activeId = sectionPositions.at(-1)?.id || activeId;
    navLinks.forEach(link => {
      const active = link.getAttribute('href') === `#${activeId}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function scheduleUpdate(measure = false) {
    needsMeasure ||= measure;
    if (!frame) frame = requestAnimationFrame(updateScroll);
  }
  window.addEventListener('scroll', () => scheduleUpdate(), { passive: true });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 820) closeMenu();
    scheduleUpdate(true);
  }, { passive: true });
  if ('ResizeObserver' in window) {
    const layoutObserver = new ResizeObserver(() => scheduleUpdate(true));
    layoutObserver.observe(document.querySelector('main'));
    if (header) layoutObserver.observe(header);
  }
  [...document.images].forEach(image => image.addEventListener('load', () => scheduleUpdate(true), { once: true }));
  document.querySelectorAll('details').forEach(detail => detail.addEventListener('toggle', () => scheduleUpdate(true)));

  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('reveal-pending');
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .08, rootMargin: '0px 0px -20px 0px' });
    document.querySelectorAll('.reveal').forEach(element => {
      element.classList.add('reveal-pending');
      revealObserver.observe(element);
    });
    reducedMotion.addEventListener('change', event => {
      if (event.matches) {
        revealObserver.disconnect();
        document.querySelectorAll('.reveal-pending').forEach(element => element.classList.remove('reveal-pending'));
      }
    });
  }
  scheduleUpdate(true);
})();
