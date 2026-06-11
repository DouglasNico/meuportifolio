const CLOUD_NAME = 'dycwp4ds9';
const UPLOAD_PRESET = 'portifolio';

const auth = firebase.auth();
const db = firebase.firestore();

const loginScreen = document.getElementById('loginScreen');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const logoutBtn = document.getElementById('logoutBtn');
const addProjectBtn = document.getElementById('addProjectBtn');
const projectList = document.getElementById('projectList');
const emptyState = document.getElementById('emptyState');
const modal = document.getElementById('projectModal');
const modalTitle = document.getElementById('modalTitle');
const projectForm = document.getElementById('projectForm');
const projectIdInput = document.getElementById('projectId');
const titleInput = document.getElementById('titleInput');
const descInput = document.getElementById('descInput');
const tagsInput = document.getElementById('tagsInput');
const imagesContainer = document.getElementById('imagesContainer');
const addImageBtn = document.getElementById('addImageBtn');
const stackInput = document.getElementById('stackInput');
const linkInput = document.getElementById('linkInput');
const publishedInput = document.getElementById('publishedInput');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');

let projects = [];
let sortable = null;
let imageSortable = null;
let currentProjectId = null;

auth.onAuthStateChanged(user => {
  if (user) {
    loginScreen.style.display = 'none';
    dashboard.style.display = '';
    loadProjects();
  } else {
    loginScreen.style.display = '';
    dashboard.style.display = 'none';
  }
});

loginForm.addEventListener('submit', e => {
  e.preventDefault();
  const btn = document.getElementById('loginBtn');
  loginError.textContent = '';
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Entrando...';
  auth.signInWithEmailAndPassword(emailInput.value, passwordInput.value)
    .catch(() => {
      loginError.textContent = 'Email ou senha inválidos.';
      showToast('Email ou senha inválidos.', 'error');
      btn.disabled = false;
      btn.textContent = 'Entrar';
    });
});

logoutBtn.addEventListener('click', () => auth.signOut());

function loadProjects() {
  db.collection('projects').orderBy('order').onSnapshot(snapshot => {
    projects = [];
    snapshot.forEach(doc => projects.push({ id: doc.id, ...doc.data() }));
    renderProjects();
  });
}

function renderProjects() {
  if (!projects.length) {
    projectList.innerHTML = '';
    emptyState.style.display = '';
    return;
  }
  emptyState.style.display = 'none';
  projectList.innerHTML = projects.map(p => `
    <div class="project-item" data-id="${escAttr(p.id)}">
      <div class="drag-handle">☰</div>
      <div class="project-thumb" style="background-image:${thumbUrl(p) ? `url(${escAttr(thumbUrl(p))})` : 'linear-gradient(135deg,#2563EB,#1A4DB5)'}"></div>
      <div class="project-info">
        <div class="project-title">${escHtml(p.title)}</div>
        <div class="project-tags">${(p.tags || []).join(', ')}</div>
      </div>
      <span class="project-status ${p.published ? 'published' : 'draft'}">${p.published ? 'Publicado' : 'Rascunho'}</span>
      <div class="project-actions">
        <button class="action-btn edit-btn" data-id="${escAttr(p.id)}" title="Editar">✏️</button>
        <button class="action-btn toggle-btn" data-id="${escAttr(p.id)}" title="${p.published ? 'Arquivar' : 'Publicar'}">${p.published ? '📦' : '📰'}</button>
        <button class="action-btn delete-btn" data-id="${escAttr(p.id)}" title="Excluir">🗑️</button>
      </div>
    </div>
  `).join('');

  if (sortable) sortable.destroy();
  sortable = new Sortable(projectList, {
    handle: '.drag-handle',
    animation: 150,
    onEnd: updateOrder
  });
}

function thumbUrl(p) {
  if (p.images && p.images.length) return p.images[0];
  return p.imageUrl || '';
}

function escAttr(str) {
  return String(str).replace(/'/g, '&apos;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showToast(message, type = 'success') {
  const icons = { success: '✓', error: '✗', info: 'ℹ' };
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ'}</span> ${escHtml(message)}`;
  container.appendChild(toast);
  setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3600);
}

function updateOrder() {
  const items = projectList.querySelectorAll('.project-item');
  const batch = db.batch();
  items.forEach((item, i) => {
    batch.update(db.collection('projects').doc(item.dataset.id), { order: i + 1 });
  });
  batch.commit().then(() => showToast('Ordem atualizada!', 'info'));
}

// --- MULTI-IMAGE UPLOAD ---

function createImageRow(url = '', isCover = false) {
  const row = document.createElement('div');
  row.className = 'image-row';
  row.innerHTML = `
    <div class="image-row-header">
      <span class="drag-handle-img">☰</span>
      <div class="image-row-inputs">
        <input type="file" accept="image/*" multiple>
        <input type="url" class="image-url" placeholder="Upload automático ou URL" value="${escAttr(url)}">
      </div>
    </div>
    <div class="image-row-actions">
      <span class="upload-status"></span>
      <button type="button" class="btn-cover ${isCover ? 'active' : ''}" title="Definir como capa">${isCover ? '★' : '☆'}</button>
      <button type="button" class="btn-remove" title="Remover imagem">×</button>
    </div>
    <img class="image-preview" style="${url ? '' : 'display:none'}" src="${url ? escAttr(url) : ''}" alt="Preview">
  `;
  return row;
}

function initImageSortable() {
  if (imageSortable) imageSortable.destroy();
  imageSortable = new Sortable(imagesContainer, {
    handle: '.drag-handle-img',
    animation: 150,
  });
}

function getImageUrls() {
  const urls = [];
  imagesContainer.querySelectorAll('.image-url').forEach(input => {
    const val = input.value.trim();
    if (val) urls.push(val);
  });
  return urls;
}

function openModal(id) {
  currentProjectId = id || null;
  modalTitle.textContent = id ? 'Editar Projeto' : 'Novo Projeto';
  saveBtn.textContent = id ? 'Atualizar' : 'Salvar';
  modal.style.display = '';

  if (id) {
    const p = projects.find(x => x.id === id);
    if (!p) return;
    projectIdInput.value = p.id;
    titleInput.value = p.title || '';
    descInput.value = p.description || '';
    tagsInput.value = (p.tags || []).join(', ');
    stackInput.value = (p.stack || []).join(', ');
    linkInput.value = p.link || '';
    publishedInput.checked = p.published !== false;

    imagesContainer.innerHTML = '';
    const imgs = p.images && p.images.length ? p.images : (p.imageUrl ? [p.imageUrl] : ['']);
    imgs.forEach((url, i) => imagesContainer.appendChild(createImageRow(url, i === 0)));
    initImageSortable();
  } else {
    projectForm.reset();
    publishedInput.checked = true;
    imagesContainer.innerHTML = '';
    imagesContainer.appendChild(createImageRow('', true));
    initImageSortable();
  }
}

function closeModal() {
  modal.style.display = 'none';
  projectForm.reset();
  currentProjectId = null;
}

addProjectBtn.addEventListener('click', () => openModal());
cancelBtn.addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

addImageBtn.addEventListener('click', () => {
  imagesContainer.appendChild(createImageRow(''));
  initImageSortable();
});

// Cloudinary upload via delegation (multi-file)
imagesContainer.addEventListener('change', async e => {
  const fileInput = e.target.closest('input[type="file"]');
  if (!fileInput) return;
  const files = fileInput.files;
  if (!files.length) return;

  const row = fileInput.closest('.image-row');
  const total = files.length;

  for (let i = 0; i < total; i++) {
    const file = files[i];
    const targetRow = i === 0
      ? row
      : (() => {
          const nr = createImageRow('');
          imagesContainer.insertBefore(nr, row.nextSibling);
          return nr;
        })();

    const status = targetRow.querySelector('.upload-status');
    const urlInput = targetRow.querySelector('.image-url');
    const preview = targetRow.querySelector('.image-preview');

    status.textContent = total > 1 ? `Enviando (${i + 1}/${total})...` : 'Enviando...';
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'portifolio');

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST', body: formData
      });
      const data = await res.json();
      if (data.secure_url) {
        urlInput.value = data.secure_url;
        preview.src = data.secure_url;
        preview.style.display = '';
        status.textContent = 'OK';
        status.style.color = '#22D3A0';
        if (total === 1) showToast('Imagem enviada com sucesso!');
      } else {
        status.textContent = 'Erro';
        status.style.color = '#EF4444';
        showToast('Erro ao enviar imagem.', 'error');
      }
    } catch {
      status.textContent = 'Erro';
      status.style.color = '#EF4444';
      showToast('Erro ao enviar imagem.', 'error');
    }
  }

  fileInput.value = '';
});

// Image row actions via delegation
imagesContainer.addEventListener('click', e => {
  const coverBtn = e.target.closest('.btn-cover');
  if (coverBtn) {
    imagesContainer.querySelectorAll('.btn-cover').forEach(b => { b.textContent = '☆'; b.classList.remove('active'); });
    coverBtn.textContent = '★'; coverBtn.classList.add('active');
    const row = coverBtn.closest('.image-row');
    imagesContainer.insertBefore(row, imagesContainer.firstChild);
    return;
  }

  const removeBtn = e.target.closest('.btn-remove');
  if (!removeBtn) return;
  const row = removeBtn.closest('.image-row');
  if (imagesContainer.querySelectorAll('.image-row').length > 1) {
    row.remove();
  }
});

// URL input => preview
imagesContainer.addEventListener('input', e => {
  const urlInput = e.target.closest('.image-url');
  if (!urlInput) return;
  const row = urlInput.closest('.image-row');
  const preview = row.querySelector('.image-preview');
  if (urlInput.value.trim()) {
    preview.src = urlInput.value.trim();
    preview.style.display = '';
  } else {
    preview.style.display = 'none';
  }
});

projectForm.addEventListener('submit', async e => {
  e.preventDefault();
  const images = getImageUrls();
  const stack = stackInput.value.split(',').map(t => t.trim()).filter(Boolean);
  const data = {
    title: titleInput.value.trim(),
    description: descInput.value.trim(),
    tags: tagsInput.value.split(',').map(t => t.trim()).filter(Boolean),
    images,
    imageUrl: images[0] || '',
    stack,
    link: linkInput.value.trim(),
    published: publishedInput.checked,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    if (currentProjectId) {
      await db.collection('projects').doc(currentProjectId).update(data);
      showToast('Projeto atualizado com sucesso!');
    } else {
      data.order = projects.length + 1;
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('projects').add(data);
      showToast('Projeto criado com sucesso!');
    }
    closeModal();
  } catch {
    showToast('Erro ao salvar projeto.', 'error');
  }
});

projectList.addEventListener('click', e => {
  const btn = e.target.closest('.action-btn');
  if (!btn) return;
  const id = btn.dataset.id;
  if (!id) return;

  if (btn.classList.contains('edit-btn')) {
    openModal(id);
  } else if (btn.classList.contains('toggle-btn')) {
    const p = projects.find(x => x.id === id);
    if (p) {
      db.collection('projects').doc(id).update({ published: !p.published });
      showToast(p.published ? 'Projeto arquivado.' : 'Projeto publicado!');
    }
  } else if (btn.classList.contains('delete-btn')) {
    if (confirm('Excluir este projeto?')) {
      db.collection('projects').doc(id).delete();
      showToast('Projeto excluído.');
    }
  }
});
