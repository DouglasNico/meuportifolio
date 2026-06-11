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
  loginError.textContent = '';
  auth.signInWithEmailAndPassword(emailInput.value, passwordInput.value)
    .catch(() => { loginError.textContent = 'Email ou senha inválidos.'; });
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

function updateOrder() {
  const items = projectList.querySelectorAll('.project-item');
  const batch = db.batch();
  items.forEach((item, i) => {
    batch.update(db.collection('projects').doc(item.dataset.id), { order: i + 1 });
  });
  batch.commit();
}

// --- MULTI-IMAGE UPLOAD ---

function createImageRow(url = '') {
  const row = document.createElement('div');
  row.className = 'image-row';
  row.innerHTML = `
    <div class="image-row-inputs">
      <input type="file" accept="image/*">
      <input type="url" class="image-url" placeholder="Upload automático ou URL" value="${escAttr(url)}">
    </div>
    <div class="image-row-actions">
      <span class="upload-status"></span>
      <button type="button" class="btn-remove" title="Remover imagem">×</button>
    </div>
    <img class="image-preview" style="${url ? '' : 'display:none'}" src="${url ? escAttr(url) : ''}" alt="Preview">
  `;
  return row;
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
    imgs.forEach(url => imagesContainer.appendChild(createImageRow(url)));
  } else {
    projectForm.reset();
    publishedInput.checked = true;
    imagesContainer.innerHTML = '';
    imagesContainer.appendChild(createImageRow(''));
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
});

// Cloudinary upload via delegation
imagesContainer.addEventListener('change', async e => {
  const fileInput = e.target.closest('input[type="file"]');
  if (!fileInput) return;
  const file = fileInput.files[0];
  if (!file) return;

  const row = fileInput.closest('.image-row');
  const status = row.querySelector('.upload-status');
  const urlInput = row.querySelector('.image-url');
  const preview = row.querySelector('.image-preview');

  status.textContent = 'Enviando...';
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
      status.textContent = 'Upload concluído';
      status.style.color = '#22D3A0';
    } else {
      status.textContent = 'Erro ao enviar';
      status.style.color = '#EF4444';
    }
  } catch {
    status.textContent = 'Erro de conexão';
    status.style.color = '#EF4444';
  }
});

// Remove image row via delegation
imagesContainer.addEventListener('click', e => {
  const btn = e.target.closest('.btn-remove');
  if (!btn) return;
  const row = btn.closest('.image-row');
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

  if (currentProjectId) {
    await db.collection('projects').doc(currentProjectId).update(data);
  } else {
    data.order = projects.length + 1;
    data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    await db.collection('projects').add(data);
  }
  closeModal();
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
    if (p) db.collection('projects').doc(id).update({ published: !p.published });
  } else if (btn.classList.contains('delete-btn')) {
    if (confirm('Excluir este projeto?')) {
      db.collection('projects').doc(id).delete();
    }
  }
});
