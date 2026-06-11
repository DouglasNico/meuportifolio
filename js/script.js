document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA DO MENU MOBILE ---
    const mobileBtn = document.querySelector('.mobile-btn');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu li a');

    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });

    // --- ROLAGEM SUAVE ---
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); 
            const targetId = this.getAttribute('href');
            if (targetId === '#') {
                window.scrollTo(0, 0);
            } else {
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView();
                }
            }
        });
    });

    // --- SCROLL REVEAL ---
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.15 });

        revealEls.forEach(el => observer.observe(el));
    }

    // --- CONTAGEM ANIMADA DOS STATS ---
    const counters = document.querySelectorAll('.s-count');
    if (counters.length) {
        const countObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.dataset.target);
                    let current = 0;
                    const step = Math.max(1, Math.floor(target / 40));
                    const timer = setInterval(() => {
                        current += step;
                        if (current >= target) {
                            el.textContent = target;
                            clearInterval(timer);
                        } else {
                            el.textContent = current;
                        }
                    }, 30);
                    countObserver.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(el => countObserver.observe(el));
    }

    // --- BACK TO TOP ---
    const backTop = document.querySelector('.back-top');
    if (backTop) {
        window.addEventListener('scroll', () => {
            backTop.classList.toggle('visible', window.scrollY > 300);
        });
        backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // --- TYPEWRITER ---
    const twEl = document.querySelector('.typewriter');
    if (twEl) {
        const text = twEl.dataset.text;
        let idx = 0;
        twEl.innerHTML = '';
        function typeNext() {
            if (idx < text.length) {
                const ch = text[idx];
                twEl.innerHTML += ch === '|' ? '<br>' : esc(ch);
                idx++;
                setTimeout(typeNext, 50 + Math.random() * 60);
            }
        }
        setTimeout(typeNext, 1200);
    }

    // --- MODAL DO PROJETO ---
    const projModal = document.getElementById('projModal');
    let currentProject = null;
    let currentImageIndex = 0;
    let lbImages = [];
    let lbIndex = 0;

    if (projModal) {
        const modalBackdrop = projModal.querySelector('.modal-backdrop');
        const modalClose = projModal.querySelector('.modal-close');
        const modalTitle = projModal.querySelector('.modal-title');
        const modalTags = projModal.querySelector('.modal-tags');
        const modalDesc = projModal.querySelector('.modal-desc');
        const modalStackWrap = projModal.querySelector('.modal-stack-wrap');
        const modalStack = projModal.querySelector('.modal-stack');
        const modalLink = projModal.querySelector('.modal-link');
        const galleryImg = projModal.querySelector('.gallery-img');
        const galleryPrev = projModal.querySelector('.gallery-prev');
        const galleryNext = projModal.querySelector('.gallery-next');
        const galleryDots = projModal.querySelector('.gallery-dots');

        function openProjModal(project) {
            currentProject = project;
            currentImageIndex = 0;

            modalTitle.textContent = project.title;
            modalDesc.textContent = project.description || '';

            modalTags.innerHTML = (project.tags || []).map(t => `<span class="ptag">${esc(t)}</span>`).join('');

            const stack = project.stack || [];
            if (stack.length) {
                modalStackWrap.style.display = '';
                modalStack.innerHTML = stack.map(s => `<span class="stag">${esc(s)}</span>`).join('');
            } else {
                modalStackWrap.style.display = 'none';
            }

            if (project.link) {
                modalLink.href = project.link;
                modalLink.style.display = '';
            } else {
                modalLink.style.display = 'none';
            }

            const images = (project.images && project.images.length) ? project.images :
                           (project.imageUrl ? [project.imageUrl] : []);

            updateGallery(images);

            projModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            setTimeout(() => modalClose.focus(), 100);
        }

        function closeProjModal() {
            projModal.classList.remove('active');
            document.body.style.overflow = '';
        }

        function preloadAdjacent(images, idx) {
            [idx - 1, idx + 1].forEach(i => {
                if (i >= 0 && i < images.length) { const img = new Image(); img.src = images[i]; }
            });
        }

        function updateGallery(images) {
            const hasMultiple = images.length > 1;

            if (images.length === 0) {
                galleryImg.src = '';
                galleryImg.alt = '';
                galleryPrev.classList.add('hidden');
                galleryNext.classList.add('hidden');
                galleryDots.innerHTML = '';
                return;
            }

            galleryImg.style.opacity = '0';
            setTimeout(() => {
                galleryImg.src = images[currentImageIndex];
                galleryImg.alt = `Imagem ${currentImageIndex + 1} de ${images.length}`;
                galleryImg.style.opacity = '1';
            }, 150);

            preloadAdjacent(images, currentImageIndex);

            galleryPrev.classList.toggle('hidden', !hasMultiple || currentImageIndex === 0);
            galleryNext.classList.toggle('hidden', !hasMultiple || currentImageIndex === images.length - 1);

            if (hasMultiple) {
                galleryDots.innerHTML = images.map((_, i) =>
                    `<button class="gallery-dot${i === currentImageIndex ? ' active' : ''}" data-index="${i}"></button>`
                ).join('');
            } else {
                galleryDots.innerHTML = '';
            }
        }

        function navigateGallery(dir) {
            const images = (currentProject.images && currentProject.images.length) ? currentProject.images :
                           (currentProject.imageUrl ? [currentProject.imageUrl] : []);
            const ni = currentImageIndex + dir;
            if (ni >= 0 && ni < images.length) {
                currentImageIndex = ni;
                updateGallery(images);
            }
        }

        modalClose.addEventListener('click', closeProjModal);
        modalBackdrop.addEventListener('click', closeProjModal);
        galleryPrev.addEventListener('click', () => navigateGallery(-1));
        galleryNext.addEventListener('click', () => navigateGallery(1));

        galleryDots.addEventListener('click', e => {
            const dot = e.target.closest('.gallery-dot');
            if (!dot) return;
            const images = (currentProject.images && currentProject.images.length) ? currentProject.images :
                           (currentProject.imageUrl ? [currentProject.imageUrl] : []);
            const idx = parseInt(dot.dataset.index);
            if (idx >= 0 && idx < images.length) {
                currentImageIndex = idx;
                updateGallery(images);
            }
        });

        // Lightbox - click on image to zoom
        galleryImg.addEventListener('click', () => {
            if (galleryImg.src) {
                const images = (currentProject.images && currentProject.images.length) ? currentProject.images :
                               (currentProject.imageUrl ? [currentProject.imageUrl] : []);
                lbImages = images;
                lbIndex = currentImageIndex;
                openLightbox();
            }
        });

        document.addEventListener('keydown', e => {
            if (!projModal.classList.contains('active')) return;
            if (e.key === 'Escape') { closeProjModal(); return; }
            if (e.key === 'ArrowLeft') { navigateGallery(-1); return; }
            if (e.key === 'ArrowRight') { navigateGallery(1); return; }
            if (e.key === 'Tab') {
                const focusable = projModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey) {
                    if (document.activeElement === first) { last.focus(); e.preventDefault(); }
                } else {
                    if (document.activeElement === last) { first.focus(); e.preventDefault(); }
                }
            }
        });
    }

    // --- LIGHTBOX ---
    const lightbox = document.getElementById('imgLightbox');
    if (lightbox) {
        const lb = lightbox;
        const lbImg = lb.querySelector('.lightbox-img');
        const lbPrev = lb.querySelector('.lightbox-prev');
        const lbNext = lb.querySelector('.lightbox-next');

        function updateLightbox() {
            if (!lbImages.length) return;
            lbImg.src = lbImages[lbIndex];
            lbImg.alt = `Imagem ${lbIndex + 1} de ${lbImages.length}`;
            lbPrev.classList.toggle('hidden', lbIndex === 0);
            lbNext.classList.toggle('hidden', lbIndex === lbImages.length - 1);
        }

        function openLightbox() {
            updateLightbox();
            lb.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            lb.classList.remove('active');
            document.body.style.overflow = '';
        }

        lb.querySelector('.lightbox-backdrop').addEventListener('click', closeLightbox);
        lb.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
        lbPrev.addEventListener('click', () => { if (lbIndex > 0) { lbIndex--; updateLightbox(); } });
        lbNext.addEventListener('click', () => { if (lbIndex < lbImages.length - 1) { lbIndex++; updateLightbox(); } });

        document.addEventListener('keydown', e => {
            if (!lb.classList.contains('active')) return;
            if (e.key === 'Escape') { closeLightbox(); return; }
            if (e.key === 'ArrowLeft' && lbIndex > 0) { lbIndex--; updateLightbox(); return; }
            if (e.key === 'ArrowRight' && lbIndex < lbImages.length - 1) { lbIndex++; updateLightbox(); return; }
        });
    }

    // --- PARTICLES ---
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let w, h, particles = [];
        const COUNT = 55;
        const CONNECT_DIST = 120;

        function resizeParticles() {
            const hero = canvas.closest('.hero');
            if (!hero) return;
            w = hero.offsetWidth;
            h = hero.offsetHeight;
            canvas.width = w;
            canvas.height = h;
        }

        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.r = Math.random() * 1.5 + 0.5;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > w) this.vx *= -1;
                if (this.y < 0 || this.y > h) this.vy *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(79,142,247,0.2)';
                ctx.fill();
            }
        }

        function initParticles() {
            resizeParticles();
            particles = Array.from({ length: COUNT }, () => new Particle());
        }

        function drawConnections() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < CONNECT_DIST) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(79,142,247,${0.05 * (1 - dist / CONNECT_DIST)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        function loop() {
            ctx.clearRect(0, 0, w, h);
            particles.forEach(p => { p.update(); p.draw(); });
            drawConnections();
            requestAnimationFrame(loop);
        }

        initParticles();
        loop();
        window.addEventListener('resize', initParticles);
    }

    // --- CARREGAR PROJETOS DO FIRESTORE ---
    const container = document.getElementById('projectsContainer');
    if (container && typeof firebase !== 'undefined') {
        const db = firebase.firestore();
        let projectsData = [];

        function renderProjects(snapshot) {
            projectsData = [];
            if (snapshot.empty) {
                container.innerHTML = '<p style="color:var(--muted);text-align:center;padding:40px 0">Nenhum projeto publicado ainda.</p>';
                return;
            }
            container.innerHTML = '';
            snapshot.forEach((doc, index) => {
                const p = doc.data();
                const id = doc.id;
                projectsData.push({ id, ...p });

                const card = document.createElement('div');
                card.className = 'proj-card';
                card.dataset.id = id;
                card.style.animationDelay = `${index * 0.08}s`;

                const thumb = (p.images && p.images.length) ? p.images[0] : (p.imageUrl || '');

                card.innerHTML = `
                    <div class="proj-thumb${thumb ? ' thumb-loading' : ''}" style="background:${thumb ? 'linear-gradient(135deg,#0D2B6E,#1A4DB5)' : 'linear-gradient(135deg,#0D2B6E,#1A4DB5)'}">
                        <div class="proj-overlay"></div>
                    </div>
                    <div class="proj-body">
                        <div class="proj-title">${esc(p.title)}</div>
                        <div class="proj-desc">${esc(p.description)}</div>
                        <div class="proj-tags">${(p.tags || []).map(t => `<span class="ptag">${esc(t)}</span>`).join('')}</div>
                        ${p.link ? `<a class="proj-btn" href="${esc(p.link)}" target="_blank">Ver Projeto →</a>` : ''}
                    </div>
                `;

                // Blur placeholder — preload image and swap
                if (thumb) {
                    const img = new Image();
                    img.onload = () => {
                        const el = card.querySelector('.proj-thumb');
                        if (el) { el.style.background = `url(${thumb}) center/cover`; el.classList.remove('thumb-loading'); }
                    };
                    img.src = thumb;
                }

                card.addEventListener('click', e => {
                    if (e.target.closest('a')) return;
                    const proj = projectsData.find(x => x.id === id);
                    if (proj) openProjModal(proj);
                });

                container.appendChild(card);
            });
        }

        db.collection('projects').where('published', '==', true).orderBy('order')
            .onSnapshot(renderProjects, error => {
                console.error('Firestore index error:', error);
                db.collection('projects').where('published', '==', true)
                    .onSnapshot(renderProjects, () => {
                        container.innerHTML = '<p style="color:var(--muted);text-align:center;padding:40px 0">Erro ao carregar projetos.</p>';
                    });
            });
    }
});

function esc(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}
