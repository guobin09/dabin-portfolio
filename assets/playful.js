(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const studio = document.querySelector('.studio-card');
  const itemButtons = [...document.querySelectorAll('[data-studio-item]')];
  const studioMessage = document.getElementById('studioMessage');
  const studioCount = document.getElementById('studioCount');
  const studioReset = document.querySelector('.studio-reset');
  const found = new Set();
  const messages = {
    tablet: { text: '画板亮起来了！先画一颗星星，给今天的灵感开个头。', pose: 'proud' },
    sketch: { text: '翻到涂鸦本：有些好点子，就是从随手画的小表情开始的。', pose: 'curious' },
    monster: { text: '小怪兽探出头：城市里的摇摇车和电箱，也可以有自己的性格。', pose: 'peace' },
  };
  function respond(pose) {
    document.dispatchEvent(new CustomEvent('character:select-pose', { detail: { id: pose } }));
  }
  function celebrate() {
    if (reducedMotion.matches) return;
    const sparkles = document.createElement('div');
    sparkles.className = 'studio-sparkles';
    sparkles.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 8; i++) {
      const star = document.createElement('span');
      const angle = (i / 8) * Math.PI * 2;
      star.textContent = '✦';
      star.style.setProperty('--spark-x', `${Math.cos(angle) * 120}px`);
      star.style.setProperty('--spark-y', `${Math.sin(angle) * 90}px`);
      star.style.setProperty('--spark-color', ['#e4573d', '#b38324', '#5e8050', '#4c5eff'][i % 4]);
      sparkles.append(star);
    }
    studio.querySelector('.studio-scene').append(sparkles);
    setTimeout(() => sparkles.remove(), 800);
  }
  if (studio && itemButtons.length) {
    document.querySelector('.studio-hotspots').hidden = false;
    studioCount.hidden = false;
    studioMessage.textContent = '点点画板、涂鸦本和小怪兽，收集三个小灵感。';
    itemButtons.forEach(button => button.addEventListener('click', () => {
      const id = button.dataset.studioItem;
      const alreadyComplete = found.size === itemButtons.length;
      found.add(id);
      itemButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      button.classList.add('is-found');
      studioCount.textContent = `发现 ${found.size} / ${itemButtons.length}`;
      studioMessage.textContent = messages[id].text;
      respond(messages[id].pose);
      if (found.size === itemButtons.length) {
        studio.classList.add('is-complete');
        studioReset.hidden = false;
        if (!alreadyComplete) {
          studioMessage.textContent = '三个小灵感都找到了！大斌开心地跳了一下，把好奇心继续带去下一个作品吧。';
          respond('jump');
          celebrate();
        }
      }
    }));
    studioReset.addEventListener('click', () => {
      found.clear();
      studio.classList.remove('is-complete');
      studio.querySelectorAll('.studio-sparkles').forEach(element => element.remove());
      itemButtons.forEach(button => { button.classList.remove('is-found'); button.setAttribute('aria-pressed', 'false'); });
      studioCount.textContent = `发现 0 / ${itemButtons.length}`;
      studioMessage.textContent = '小灵感们又躲好了，再来逛一遍工作台。';
      studioReset.hidden = true;
      respond('curious');
      itemButtons[0].focus();
    });
  }

  const dialog = document.getElementById('artworkDialog');
  const image = document.getElementById('artworkImage');
  const title = document.getElementById('artworkTitle');
  const caption = document.getElementById('artworkCaption');
  const artworkLinks = [...document.querySelectorAll('[data-artwork-open]')];
  let artworkIndex = 0;
  let opener;
  function showArtwork(index) {
    artworkIndex = (index + artworkLinks.length) % artworkLinks.length;
    const link = artworkLinks[artworkIndex];
    const projectTitle = link.closest('.project-card').querySelector('h3').textContent;
    image.src = link.href;
    image.alt = link.querySelector('img').alt;
    title.textContent = projectTitle;
    caption.textContent = `${artworkIndex + 1} / ${artworkLinks.length} · ${['云海里的星星', '雨窗外的小世界', '把心事寄到云上', '街角也有小伙伴'][artworkIndex]}`;
  }
  if (!dialog || typeof dialog.showModal !== 'function') return;
  artworkLinks.forEach((link, index) => link.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    opener = link;
    showArtwork(index);
    dialog.showModal();
    document.body.classList.add('artwork-open');
  }));
  document.querySelector('[data-artwork-prev]').addEventListener('click', () => showArtwork(artworkIndex - 1));
  document.querySelector('[data-artwork-next]').addEventListener('click', () => showArtwork(artworkIndex + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showArtwork(artworkIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('artwork-open');
    opener?.focus({ preventScroll: true });
  });
})();
