// App State Management
const State = {
  user: null,
  sites: [],
  credentials: {
    githubToken: '',
    vercelToken: '',
    vercelTeamId: ''
  }
};

// UI Elements Map
const el = {
  navLogo: document.getElementById('nav-logo-btn'),
  navLinksPrivate: document.querySelectorAll('.private-only'),
  navLinksPublic: document.querySelectorAll('.public-only'),
  loginNavBtn: document.getElementById('login-nav-btn'),
  registerNavBtn: document.getElementById('register-nav-btn'),
  heroCtaBtn: document.getElementById('hero-cta-btn'),
  logoutBtn: document.getElementById('logout-btn'),
  userDisplayEmail: document.getElementById('user-display-email'),
  toastContainer: document.getElementById('toast-container'),
  
  // Views
  views: {
    landing: document.getElementById('view-landing'),
    auth: document.getElementById('view-auth'),
    dashboard: document.getElementById('view-dashboard'),
    newSite: document.getElementById('view-new-site'),
    niche: document.getElementById('view-niche'),
    multiGenerator: document.getElementById('view-multi-generator'),
    sitePosition: document.getElementById('view-site-position'),
    backlinkTracker: document.getElementById('view-backlink-tracker'),
    siloStructure: document.getElementById('view-silo-structure'),
    settings: document.getElementById('view-settings'),
    domainConfig: document.getElementById('view-domain-config'),
    netoSalva: document.getElementById('view-neto-salva')
  },

  // Auth
  tabLoginBtn: document.getElementById('tab-login-btn'),
  tabRegisterBtn: document.getElementById('tab-register-btn'),
  loginForm: document.getElementById('login-form'),
  registerForm: document.getElementById('register-form'),
  loginEmail: document.getElementById('login-email'),
  loginPass: document.getElementById('login-password'),
  registerName: document.getElementById('register-name'),
  registerEmail: document.getElementById('register-email'),
  registerPass: document.getElementById('register-password'),
  authTriggerBtns: document.querySelectorAll('.auth-trigger-btn'),

  // Dashboard
  dashUserName: document.getElementById('dashboard-user-name'),
  dashNewBlogBtn: document.getElementById('dash-new-blog-btn'),
  emptyStateCreateBtn: document.getElementById('empty-state-create-btn'),
  statTotalBlogs: document.getElementById('stat-total-blogs'),
  statArticlesCount: document.getElementById('stat-articles-count'),
  blogListTbody: document.getElementById('blog-list-tbody'),
  siteListCount: document.getElementById('site-list-count'),

  // Wizard
  siteTheme: document.getElementById('site-theme'),
  customThemeGroup: document.getElementById('custom-theme-group'),
  siteCustomTheme: document.getElementById('site-custom-theme'),
  siteDescription: document.getElementById('site-description'),
  siteRepoName: document.getElementById('site-repo-name'),
  wizardForm: document.getElementById('wizard-form'),
  wizardCancelBtn: document.getElementById('wizard-cancel-btn'),
  wizardSubmitBtn: document.getElementById('wizard-submit-btn'),

  // Progress Overlay
  genOverlay: document.getElementById('generation-overlay'),
  progressStatus: document.getElementById('progress-status-text'),
  progressBarFill: document.getElementById('progress-bar-fill'),
  steps: {
    github: document.getElementById('step-github'),
    template: document.getElementById('step-template'),
    git: document.getElementById('step-git'),
    vercel: document.getElementById('step-vercel')
  },

  // Settings
  settingsForm: document.getElementById('settings-form'),
  setGithubToken: document.getElementById('settings-github-token'),
  setVercelToken: document.getElementById('settings-vercel-token'),
  setVercelTeam: document.getElementById('settings-vercel-team'),
  setGeminiKey: document.getElementById('settings-gemini-key'),

  // Domain Config
  domainSiteName: document.getElementById('domain-site-name'),
  domainSiteRepo: document.getElementById('domain-site-repo'),
  customDomainInput: document.getElementById('custom-domain-input'),
  domainConfigForm: document.getElementById('domain-config-form'),
  domainCancelBtn: document.getElementById('domain-cancel-btn'),

  // Two Factor Authentication
  twoFactorLoginForm: document.getElementById('two-factor-login-form'),
  login2faCode: document.getElementById('login-2fa-code'),
  btnCancel2faLogin: document.getElementById('btn-cancel-2fa-login'),
  
  twoFactorStatus: document.getElementById('two-factor-status'),
  btnEnable2fa: document.getElementById('btn-enable-2fa'),
  twoFactorSetupSteps: document.getElementById('two-factor-setup-steps'),
  qrImage: document.getElementById('qr-image'),
  twoFactorSecretKey: document.getElementById('two-factor-secret-key'),
  twoFactorVerifyForm: document.getElementById('two-factor-verify-form'),
  twoFactorVerificationCode: document.getElementById('two-factor-verification-code'),
  btnCancel2faSetup: document.getElementById('btn-cancel-2fa-setup'),
  
  twoFactorDisableSteps: document.getElementById('two-factor-disable-steps'),
  twoFactorDisableForm: document.getElementById('two-factor-disable-form'),
  twoFactorDisableCode: document.getElementById('two-factor-disable-code')
};

// Router Helper
function showView(viewName) {
  Object.keys(el.views).forEach(name => {
    if (name === viewName) {
      el.views[name].classList.add('active');
    } else {
      el.views[name].classList.remove('active');
    }
  });

  if (viewName === 'settings') {
    updateTwoFactorUI();
  }

  if (viewName === 'dashboard') {
    checkGeminiKeyWarning();
  }

  if (viewName === 'multiGenerator') {
    populateMultiGeneratorSites();
  }

  if (viewName === 'sitePosition') {
    populatePositionSites();
  }

  if (viewName === 'backlinkTracker') {
    populateBacklinkSites();
    renderSavedBacklinks();
  }

  if (viewName === 'siloStructure') {
    populateSiloSites();
  }

  if (viewName === 'netoSalva') {
    populateBackupSites();
  }

  if (viewName === 'niche') {
    initNicheSelector();
  }

  // Smooth scroll to top on change
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function checkGeminiKeyWarning() {
  const banner = document.getElementById('gemini-warning-banner');
  const tutorial = document.getElementById('gemini-tutorial-content');
  const showTutorialBtn = document.getElementById('btn-show-tutorial');
  
  if (!banner) return;
  
  // Show banner only if logged in and geminiApiKey is missing
  if (State.user && (!State.user.geminiApiKey || State.user.geminiApiKey.trim() === '')) {
    banner.style.display = 'block';
  } else {
    banner.style.display = 'none';
  }
  
  // Wire up show tutorial button once if not already wired
  if (showTutorialBtn && !showTutorialBtn.dataset.wired) {
    showTutorialBtn.dataset.wired = 'true';
    showTutorialBtn.addEventListener('click', () => {
      if (tutorial.style.display === 'none') {
        tutorial.style.display = 'block';
        showTutorialBtn.textContent = 'Ocultar Tutorial';
      } else {
        tutorial.style.display = 'none';
        showTutorialBtn.textContent = 'Como Obter a Chave';
      }
    });
    
    // Wire up links to go to settings
    const goSettingsLinks = ['link-go-to-settings', 'link-go-to-settings-tutorial'];
    goSettingsLinks.forEach(id => {
      const link = document.getElementById(id);
      if (link) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          showView('settings');
        });
      }
    });
  }
}


// Toast Notifications
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerText = message;
  el.toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// Sluggify repository name dynamically
function sluggify(text) {
  return text.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Migrate old local sites storage to new cloud database
async function migrateLocalSitesToServer(localSites) {
  try {
    console.log(`Syncing ${localSites.length} local sites to cloud...`);
    const response = await fetch('/api/sync-sites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userEmail: State.user.email,
        sites: localSites
      })
    });
    const result = await response.json();
    if (response.ok && result.sites) {
      State.sites = result.sites;
      State.user.sites = result.sites;
      localStorage.setItem('saas_user', JSON.stringify(State.user));
      localStorage.removeItem(`saas_sites_${State.user.email}`);
      renderBlogList();
      console.log("Local sites successfully synced to cloud.");
    }
  } catch (err) {
    console.error('Migration error:', err);
  }
}

// Initialize / Load from LocalStorage
function init() {
  const savedUser = localStorage.getItem('saas_user');
  if (savedUser) {
    State.user = JSON.parse(savedUser);
    State.sites = State.user.sites || [];

    // Trigger migration if old localStorage sites exist
    const localSites = JSON.parse(localStorage.getItem(`saas_sites_${State.user.email}`) || '[]');
    if (localSites.length > 0) {
      migrateLocalSitesToServer(localSites);
    }

    State.credentials = {
      githubToken: State.user.githubToken || "",
      vercelToken: State.user.vercelToken || "",
      vercelTeamId: State.user.vercelTeamId || "",
      geminiApiKey: State.user.geminiApiKey || ""
    };
    updateAuthUI(true);
    renderBlogList();
    updateTwoFactorUI();
    showView('dashboard');
  } else {
    updateAuthUI(false);
    showView('landing');
  }

  // Pre-populate settings form
  el.setGithubToken.value = State.credentials.githubToken || '';
  el.setVercelToken.value = State.credentials.vercelToken || '';
  el.setVercelTeam.value = State.credentials.vercelTeamId || '';
  el.setGeminiKey.value = State.credentials.geminiApiKey || '';
}

// Update UI based on auth state
function updateAuthUI(isLoggedIn) {
  const safiraTrigger = document.getElementById('safira-floating-trigger');
  const comeceTrigger = document.getElementById('comece-rapido-trigger');
  if (isLoggedIn) {
    el.navLinksPrivate.forEach(link => link.classList.remove('hidden'));
    el.navLinksPublic.forEach(link => link.classList.add('hidden'));
    el.userDisplayEmail.textContent = State.user.email;
    el.dashUserName.textContent = State.user.name || 'Empreendedor';
    if (safiraTrigger) safiraTrigger.classList.remove('hidden');
    if (comeceTrigger) comeceTrigger.classList.remove('hidden');
  } else {
    el.navLinksPrivate.forEach(link => link.classList.add('hidden'));
    el.navLinksPublic.forEach(link => link.classList.remove('hidden'));
    if (safiraTrigger) safiraTrigger.classList.add('hidden');
    if (comeceTrigger) comeceTrigger.classList.add('hidden');
    if (typeof closeSafiraChat === 'function') closeSafiraChat();
  }
}

// Auth Actions
function logout() {
  localStorage.removeItem('saas_user');
  State.user = null;
  State.sites = [];
  updateAuthUI(false);
  showToast('Desconectado com sucesso!');
  showView('landing');
}

// Render user blog sites
function renderBlogList() {
  el.siteListCount.textContent = `${State.sites.length} site(s) criado(s)`;
  el.statTotalBlogs.textContent = State.sites.length;
  el.statArticlesCount.textContent = State.sites.length * 5; // Simulating initial generated articles

  if (State.sites.length === 0) {
    el.blogListTbody.innerHTML = `
      <tr class="empty-state-row">
        <td colspan="4" class="empty-state">
          <div class="empty-icon">🛸</div>
          <h4>Nenhum blog criado ainda</h4>
          <p>Clique no botão para criar o seu primeiro blog em menos de 1 minuto!</p>
          <button class="btn btn-sm btn-primary" id="empty-state-create-btn-inside">Criar Meu Primeiro Blog</button>
        </td>
      </tr>
    `;
    const btn = document.getElementById('empty-state-create-btn-inside');
    if (btn) btn.addEventListener('click', () => showView('newSite'));
    return;
  }

  el.blogListTbody.innerHTML = '';
  State.sites.forEach(site => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="blog-name-cell">
          <span style="font-weight: 600; display: block; margin-bottom: 4px; color: var(--text-main);">${site.repoName}</span>
          ${site.lastSeoPosition !== undefined ? `
            <div style="font-size: 0.78rem; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              <span style="background: rgba(37, 99, 235, 0.12); color: #3b82f6; padding: 2px 8px; border-radius: 4px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                🔍 Google Rank: ${site.lastSeoPosition > 0 ? `#${site.lastSeoPosition}` : 'N/A'}
              </span>
              <span style="color: var(--text-muted); font-size: 0.78rem;">
                para <strong style="color: var(--text-main);">"${site.lastSeoKeyword}"</strong> em ${new Date(site.lastSeoDate).toLocaleDateString('pt-BR')}
              </span>
            </div>
          ` : ''}
          <a href="${site.repoUrl}" target="_blank" class="blog-sub">🌐 Ver Repositório GitHub</a>
        </div>
      </td>
      <td><span class="badge-outline" style="text-transform: capitalize;">${site.theme}</span></td>
      <td><span class="badge-success">Ativo & Online</span></td>
      <td>
        <div class="action-links" style="display: flex; gap: 8px; flex-wrap: wrap;">
          <a href="${site.deployUrl}/admin/generator.html" target="_blank" class="btn btn-sm btn-primary">🚀 Gerar Conteúdo IA</a>
          <a href="${site.deployUrl}/admin/" target="_blank" class="btn btn-sm btn-secondary">Entrar no CMS</a>
          <button class="btn btn-sm btn-outline configure-domain-btn" data-repo="${site.repoName}" style="border: 1px solid var(--border); color: var(--text);">⚙️ Domínio</button>
          <a href="${site.deployUrl}" target="_blank" class="btn btn-sm" style="border: 1px solid var(--border); color: var(--text);">Ver Blog</a>
        </div>
      </td>
    `;
    el.blogListTbody.appendChild(tr);
  });

  // Attach event listeners to domain config buttons
  document.querySelectorAll('.configure-domain-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const repoName = e.currentTarget.getAttribute('data-repo');
      openDomainConfig(repoName);
    });
  });
}

// Dynamic input handler for Theme selector
el.siteTheme.addEventListener('change', (e) => {
  if (e.target.value === 'custom') {
    el.customThemeGroup.classList.remove('hidden');
    el.siteCustomTheme.required = true;
    el.siteRepoName.value = '';
  } else {
    el.customThemeGroup.classList.add('hidden');
    el.siteCustomTheme.required = false;
    el.siteCustomTheme.value = '';
    el.siteRepoName.value = `afiliados-blog-${e.target.value}`;
  }
});

// Update slug on custom theme change
el.siteCustomTheme.addEventListener('input', (e) => {
  el.siteRepoName.value = sluggify(`afiliados-blog-${e.target.value}`);
});

// Trigger change event to initialize fields on load
setTimeout(() => {
  if (el.siteTheme) {
    el.siteTheme.dispatchEvent(new Event('change'));
  }
}, 500);

// EVENT LISTENERS

// View Routing clicks
el.navLogo.addEventListener('click', () => showView(State.user ? 'dashboard' : 'landing'));
document.querySelector('a[href="#dashboard"]').addEventListener('click', (e) => { e.preventDefault(); showView('dashboard'); });
document.querySelector('a[href="#niche"]').addEventListener('click', (e) => { e.preventDefault(); showView('niche'); });
document.querySelector('a[href="#new-site"]').addEventListener('click', (e) => { e.preventDefault(); showView('newSite'); });
document.querySelector('a[href="#multi-generator"]').addEventListener('click', (e) => { e.preventDefault(); showView('multiGenerator'); });
document.querySelector('a[href="#silo-structure"]').addEventListener('click', (e) => { e.preventDefault(); showView('siloStructure'); });
document.querySelector('a[href="#site-position"]').addEventListener('click', (e) => { e.preventDefault(); showView('sitePosition'); });
document.querySelector('a[href="#backlink-tracker"]').addEventListener('click', (e) => { e.preventDefault(); showView('backlinkTracker'); });
document.querySelector('a[href="#neto-salva"]').addEventListener('click', (e) => { e.preventDefault(); showView('netoSalva'); });
document.querySelector('a[href="#settings"]').addEventListener('click', (e) => { e.preventDefault(); showView('settings'); });

el.loginNavBtn.addEventListener('click', () => { showView('auth'); el.tabLoginBtn.click(); });
el.registerNavBtn.addEventListener('click', () => { showView('auth'); el.tabRegisterBtn.click(); });
el.heroCtaBtn.addEventListener('click', () => { showView('auth'); el.tabRegisterBtn.click(); });
el.logoutBtn.addEventListener('click', logout);
el.dashNewBlogBtn.addEventListener('click', () => showView('newSite'));
const emptyBtn = document.getElementById('empty-state-create-btn');
if (emptyBtn) emptyBtn.addEventListener('click', () => showView('newSite'));

el.authTriggerBtns.forEach(btn => {
  btn.addEventListener('click', () => { showView('auth'); el.tabRegisterBtn.click(); });
});

// Auth Tabs switching
el.tabLoginBtn.addEventListener('click', () => {
  el.tabLoginBtn.classList.add('active');
  el.tabRegisterBtn.classList.remove('active');
  el.loginForm.classList.add('active');
  el.registerForm.classList.remove('active');
});

el.tabRegisterBtn.addEventListener('click', () => {
  el.tabRegisterBtn.classList.add('active');
  el.tabLoginBtn.classList.remove('active');
  el.registerForm.classList.add('active');
  el.loginForm.classList.remove('active');
});

// --- TWO-FACTOR AUTHENTICATION FRONTEND ENGINE ---
let tempLoginEmail = null;

function handleLoginSuccess(user) {
  localStorage.setItem('saas_user', JSON.stringify(user));
  State.user = user;
  State.sites = user.sites || [];
  State.credentials = {
    githubToken: user.githubToken || "",
    vercelToken: user.vercelToken || "",
    vercelTeamId: user.vercelTeamId || "",
    geminiApiKey: user.geminiApiKey || ""
  };
  
  // Pre-populate settings form
  el.setGithubToken.value = State.credentials.githubToken || '';
  el.setVercelToken.value = State.credentials.vercelToken || '';
  el.setVercelTeam.value = State.credentials.vercelTeamId || '';
  el.setGeminiKey.value = State.credentials.geminiApiKey || '';
  
  updateAuthUI(true);
  renderBlogList();
  updateTwoFactorUI();
  showToast(`Bem-vindo, ${user.name}!`);
  showView('dashboard');
}

function updateTwoFactorUI() {
  if (!State.user) return;
  const isEnabled = !!State.user.twoFactorEnabled;
  
  if (isEnabled) {
    el.twoFactorStatus.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="color: #10b981; font-size: 1.25rem;">●</span>
        <span>A autenticação de dois fatores (2FA) está <strong style="color: #10b981;">ATIVADA</strong> em sua conta.</span>
      </div>
    `;
    el.btnEnable2fa.style.display = 'none';
    el.twoFactorSetupSteps.style.display = 'none';
    el.twoFactorDisableSteps.style.display = 'block';
    el.twoFactorDisableCode.value = '';
  } else {
    el.twoFactorStatus.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="color: #ef4444; font-size: 1.25rem;">●</span>
        <span>A autenticação de dois fatores (2FA) está <strong style="color: #ef4444;">DESATIVADA</strong> em sua conta.</span>
      </div>
    `;
    el.btnEnable2fa.style.display = 'inline-block';
    el.twoFactorSetupSteps.style.display = 'none';
    el.twoFactorDisableSteps.style.display = 'none';
  }
}

// 2FA Login Form
el.twoFactorLoginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const code = el.login2faCode.value.trim().replace(/\s/g, '');
  if (!code || code.length !== 6) {
    showToast('O código deve conter 6 dígitos.', 'error');
    return;
  }
  
  try {
    const res = await fetch('/api/login/verify-2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: tempLoginEmail, code })
    });
    const result = await res.json();
    if (!res.ok || result.error) {
      throw new Error(result.error || 'Código inválido ou expirado.');
    }
    
    // Restore layout
    el.loginForm.style.display = 'block';
    el.twoFactorLoginForm.style.display = 'none';
    const tabs = document.querySelector('.auth-tabs');
    if (tabs) tabs.style.display = 'flex';
    
    handleLoginSuccess(result.user);
  } catch (err) {
    showToast(err.message, 'error');
  }
});

// Cancel 2FA Login
el.btnCancel2faLogin.addEventListener('click', () => {
  tempLoginEmail = null;
  el.loginForm.style.display = 'block';
  el.twoFactorLoginForm.style.display = 'none';
  const tabs = document.querySelector('.auth-tabs');
  if (tabs) tabs.style.display = 'flex';
});

// Submit Login Form
el.loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = el.loginEmail.value;
  const password = el.loginPass.value;
  
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const result = await res.json();
    if (!res.ok || result.error) {
      throw new Error(result.error || 'Erro ao fazer login.');
    }
    
    if (result.twoFactorRequired) {
      tempLoginEmail = result.email;
      el.loginForm.style.display = 'none';
      if (el.registerForm) el.registerForm.style.display = 'none';
      const tabs = document.querySelector('.auth-tabs');
      if (tabs) tabs.style.display = 'none';
      el.twoFactorLoginForm.style.display = 'block';
      el.login2faCode.value = '';
      el.login2faCode.focus();
      showToast('Autenticação de dois fatores necessária.', 'info');
      return;
    }
    
    handleLoginSuccess(result.user);
  } catch (err) {
    showToast(err.message, 'error');
  }
});

// 2FA Setup trigger
el.btnEnable2fa.addEventListener('click', async () => {
  try {
    el.btnEnable2fa.disabled = true;
    el.btnEnable2fa.textContent = 'Gerando Chave...';
    
    const res = await fetch('/api/two-factor/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail: State.user.email })
    });
    const result = await res.json();
    if (!res.ok || result.error) {
      throw new Error(result.error || 'Erro ao iniciar configuração de 2FA.');
    }
    
    el.qrImage.src = result.qrCodeUrl;
    el.twoFactorSecretKey.textContent = result.secret;
    el.twoFactorSetupSteps.style.display = 'block';
    el.btnEnable2fa.style.display = 'none';
    el.twoFactorVerificationCode.value = '';
    el.twoFactorVerificationCode.focus();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    el.btnEnable2fa.disabled = false;
    el.btnEnable2fa.textContent = 'Configurar 2FA';
  }
});

// Cancel 2FA Setup
el.btnCancel2faSetup.addEventListener('click', () => {
  el.twoFactorSetupSteps.style.display = 'none';
  el.btnEnable2fa.style.display = 'inline-block';
});

// Confirm 2FA Enable
el.twoFactorVerifyForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const code = el.twoFactorVerificationCode.value.trim().replace(/\s/g, '');
  if (!code || code.length !== 6) {
    showToast('O código deve conter 6 dígitos.', 'error');
    return;
  }
  
  try {
    const res = await fetch('/api/two-factor/enable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail: State.user.email, code })
    });
    const result = await res.json();
    if (!res.ok || result.error) {
      throw new Error(result.error || 'Código de verificação incorreto.');
    }
    
    State.user.twoFactorEnabled = true;
    localStorage.setItem('saas_user', JSON.stringify(State.user));
    
    updateTwoFactorUI();
    showToast('Autenticação de dois fatores ativada com sucesso!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
});

// Disable 2FA
el.twoFactorDisableForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const code = el.twoFactorDisableCode.value.trim().replace(/\s/g, '');
  if (!code || code.length !== 6) {
    showToast('O código deve conter 6 dígitos.', 'error');
    return;
  }
  
  try {
    const res = await fetch('/api/two-factor/disable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail: State.user.email, code })
    });
    const result = await res.json();
    if (!res.ok || result.error) {
      throw new Error(result.error || 'Código incorreto.');
    }
    
    State.user.twoFactorEnabled = false;
    localStorage.setItem('saas_user', JSON.stringify(State.user));
    
    updateTwoFactorUI();
    showToast('Autenticação de dois fatores desativada com sucesso.', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
});

// Submit Register Form
el.registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = el.registerName.value;
  const email = el.registerEmail.value;
  const password = el.registerPass.value;
  const geminiApiKey = document.getElementById('register-gemini-key').value;

  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, geminiApiKey })
    });
    const result = await res.json();
    if (!res.ok || result.error) {
      throw new Error(result.error || 'Erro ao realizar cadastro.');
    }

    showToast('Cadastro enviado para aprovação do administrador!', 'success');
    el.registerForm.reset();
    el.tabLoginBtn.click(); // Switch to login tab
  } catch (err) {
    showToast(err.message, 'error');
  }
});

// Submit Settings Form
el.settingsForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const githubToken = el.setGithubToken.value.trim();
  const vercelToken = el.setVercelToken.value.trim();
  const vercelTeamId = el.setVercelTeam.value.trim();
  const geminiApiKey = el.setGeminiKey.value.trim();

  try {
    const response = await fetch('/api/save-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userEmail: State.user.email,
        githubToken,
        vercelToken,
        vercelTeamId,
        geminiApiKey
      })
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      throw new Error(result.error || 'Erro ao salvar configurações.');
    }

    State.user = result.user;
    localStorage.setItem('saas_user', JSON.stringify(State.user));
    State.credentials = {
      githubToken: State.user.githubToken || "",
      vercelToken: State.user.vercelToken || "",
      vercelTeamId: State.user.vercelTeamId || "",
      geminiApiKey: State.user.geminiApiKey || ""
    };

    showToast('Credenciais salvas com sucesso no banco de dados!', 'success');
    showView('dashboard');
  } catch (err) {
    console.error(err);
    showToast(`Falha ao salvar configurações: ${err.message}`, 'error');
  }
});

// Submit Wizard Site Creator Form (Real Cloud Generation!)
el.wizardForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const themeValue = el.siteTheme.value;
  const finalTheme = themeValue === 'custom' ? el.siteCustomTheme.value : themeValue;
  const finalDesc = el.siteDescription.value;
  const finalRepo = el.siteRepoName.value;
  const selectedPalette = document.querySelector('input[name="color-palette"]:checked').value;

  // 1. Show generation loader overlay
  el.genOverlay.classList.remove('hidden');
  updateProgress('github', 'active', 'Conectando ao GitHub API...');

  try {
    // Stage 1: GitHub Creation
    await delay(1500);
    updateProgress('github', 'completed', 'Repositório GitHub criado com sucesso!');
    updateProgress('template', 'active', 'Acessando modelo Astro do Gerador Ninja...');

    // Stage 2: Cloning template
    await delay(1500);
    updateProgress('template', 'completed', 'Modelo Astro carregado na memória temporária.');
    updateProgress('git', 'active', 'Personalizando Sveltia CMS e enviando arquivos para nuvem...');

    // Stage 3: Remote Push
    await delay(1800);
    updateProgress('git', 'completed', 'Código-fonte enviado com sucesso para a branch main.');
    updateProgress('vercel', 'active', 'Conectando ao Gerador Ninja e iniciando deploy em nuvem...');

    // Stage 4: Call Real Server API
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        theme: finalTheme,
        themeDescription: finalDesc,
        repoName: finalRepo,
        githubToken: State.credentials.githubToken,
        vercelToken: State.credentials.vercelToken,
        vercelTeamId: State.credentials.vercelTeamId,
        colorPalette: selectedPalette,
        geminiKey: localStorage.getItem("gemini_key") || "",
        userEmail: State.user.email
      })
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      let errMsg = result.error || 'Erro ao gerar o site na nuvem.';
      if (result.details) {
        if (result.details.message) {
          errMsg += ` (${result.details.message})`;
        }
        if (Array.isArray(result.details.errors)) {
          const detailMsgs = result.details.errors.map(e => `${e.field || e.resource || 'erro'}: ${e.message}`).join(', ');
          errMsg += ` [${detailMsgs}]`;
        } else if (typeof result.details === 'string') {
          errMsg += ` (${result.details})`;
        }
      }
      throw new Error(errMsg);
    }

    updateProgress('vercel', 'active', 'Iniciando build no Gerador Ninja... (aguardando ficar online)');
    
    const dplId = result.vercelDeploymentId;
    let buildStatus = 'BUILDING';
    let pollCount = 0;
    const maxPolls = 40; // Max 200 seconds

    while ((buildStatus === 'BUILDING' || buildStatus === 'INITIALIZING' || buildStatus === 'QUEUED') && pollCount < maxPolls) {
      await delay(5000); // Check every 5 seconds
      pollCount++;
      try {
        const statusRes = await fetch(`/api/deployment-status/${dplId}?vercelToken=${encodeURIComponent(State.credentials.vercelToken)}&vercelTeamId=${encodeURIComponent(State.credentials.vercelTeamId)}`);
        const statusData = await statusRes.json();
        if (statusRes.ok && statusData.readyState) {
          buildStatus = statusData.readyState;
          console.log(`Vercel build status check: ${buildStatus}`);
          updateProgress('vercel', 'active', `Compilando no Gerador Ninja... Status: ${buildStatus} (${pollCount * 5}s)`);
        }
      } catch (err) {
        console.warn('Error polling build status:', err);
      }
    }

    if (buildStatus === 'READY') {
      updateProgress('vercel', 'completed', 'Deploy concluído! Site 100% online!');
    } else {
      updateProgress('vercel', 'completed', 'Build enviado para fila do Gerador Ninja! Ficando online em instantes.');
    }
    await delay(1500);

    // Update state & storage from the backend synchronized list
    if (result.sites) {
      State.sites = result.sites;
    } else {
      // Fallback
      const newSite = {
        repoName: result.repoName,
        repoUrl: result.repoUrl,
        deployUrl: result.deployUrl,
        theme: finalTheme,
        vercelProjectId: result.vercelProjectId
      };
      State.sites.push(newSite);
    }
    State.user.sites = State.sites;
    localStorage.setItem('saas_user', JSON.stringify(State.user));

    // Hide overlay
    el.genOverlay.classList.add('hidden');
    showToast('Parabéns! Seu blog premium foi fabricado do zero!', 'success');
    
    // Refresh & redirect to dashboard
    renderBlogList();
    showView('dashboard');

  } catch (err) {
    console.error(err);
    el.genOverlay.classList.add('hidden');
    showToast(`Falha na criação do blog: ${err.message}`, 'error');
  }
});

// Cancel wizard
el.wizardCancelBtn.addEventListener('click', () => {
  showView('dashboard');
});

// Open domain config panel
function openDomainConfig(repoName) {
  const site = State.sites.find(s => s.repoName === repoName);
  if (!site) return;

  el.domainSiteName.textContent = site.repoName;
  el.domainSiteRepo.value = site.repoName;
  el.customDomainInput.value = site.customDomain || '';

  showView('domainConfig');
}

// Cancel domain config
el.domainCancelBtn.addEventListener('click', () => {
  showView('dashboard');
});

// Submit domain config form
el.domainConfigForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const repoName = el.domainSiteRepo.value;
  const domain = el.customDomainInput.value.trim().toLowerCase();

  if (!domain) {
    showToast('Por favor, insira um domínio válido.', 'error');
    return;
  }

  const submitBtn = document.getElementById('domain-submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Configurando...';

  try {
    const response = await fetch('/api/configure-domain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repoName: repoName,
        domain: domain,
        vercelToken: State.credentials.vercelToken,
        vercelTeamId: State.credentials.vercelTeamId,
        userEmail: State.user.email
      })
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      throw new Error(result.error || 'Erro ao mapear o domínio na Vercel.');
    }

    // Update state & storage from the backend synchronized list
    if (result.sites) {
      State.sites = result.sites;
    } else {
      const siteIdx = State.sites.findIndex(s => s.repoName === repoName);
      if (siteIdx !== -1) {
        State.sites[siteIdx].customDomain = domain;
        State.sites[siteIdx].deployUrl = `https://${domain}`;
      }
    }
    State.user.sites = State.sites;
    localStorage.setItem('saas_user', JSON.stringify(State.user));

    showToast(`Domínio ${domain} configurado com sucesso!`, 'success');
    renderBlogList();
    showView('dashboard');
  } catch (err) {
    console.error(err);
    showToast(`Falha ao configurar domínio: ${err.message}`, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'USAR MEU DOMÍNIO';
  }
});

// Helper for UI loading states
function updateProgress(stepId, state, statusText) {
  const stepEl = el.steps[stepId];
  if (!stepEl) return;

  el.progressStatus.textContent = statusText;

  if (state === 'active') {
    stepEl.className = 'step active';
    if (stepId === 'github') el.progressBarFill.style.width = '25%';
    if (stepId === 'template') el.progressBarFill.style.width = '50%';
    if (stepId === 'git') el.progressBarFill.style.width = '75%';
    if (stepId === 'vercel') el.progressBarFill.style.width = '90%';
  } else if (state === 'completed') {
    stepEl.className = 'step completed';
    if (stepId === 'vercel') el.progressBarFill.style.width = '100%';
  }
}

// Delay promise helper
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Google Auth Frontend Functions
async function initGoogleAuth() {
  try {
    const configRes = await fetch('/api/config');
    const config = await configRes.json();

    if (config.googleClientId && window.google) {
      window.google.accounts.id.initialize({
        client_id: config.googleClientId,
        callback: handleGoogleAuthCallback
      });

      // Render the buttons
      const loginBtnDiv = document.getElementById('google-login-btn');
      if (loginBtnDiv) {
        window.google.accounts.id.renderButton(loginBtnDiv, {
          theme: 'filled_blue',
          size: 'large',
          text: 'signin_with',
          width: 320
        });
      }

      const registerBtnDiv = document.getElementById('google-register-btn');
      if (registerBtnDiv) {
        window.google.accounts.id.renderButton(registerBtnDiv, {
          theme: 'filled_blue',
          size: 'large',
          text: 'signup_with',
          width: 320
        });
      }
    }
  } catch (err) {
    console.error('Failed to init Google Auth:', err);
  }
}

async function handleGoogleAuthCallback(response) {
  const idToken = response.credential;
  if (!idToken) return;

  try {
    showToast('Autenticando com o Google...', 'info');
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });

    const result = await res.json();
    if (!res.ok || result.error) {
      throw new Error(result.error || 'Erro ao autenticar com o Google.');
    }

    const user = result.user;
    localStorage.setItem('saas_user', JSON.stringify(user));
    State.user = user;
    State.sites = user.sites || [];
    State.credentials = {
      githubToken: user.githubToken || "",
      vercelToken: user.vercelToken || "",
      vercelTeamId: user.vercelTeamId || "",
      geminiApiKey: user.geminiApiKey || ""
    };

    // Pre-populate settings form
    el.setGithubToken.value = State.credentials.githubToken || '';
    el.setVercelToken.value = State.credentials.vercelToken || '';
    el.setVercelTeam.value = State.credentials.vercelTeamId || '';
    el.setGeminiKey.value = State.credentials.geminiApiKey || '';

    updateAuthUI(true);
    renderBlogList();
    showToast(`Bem-vindo, ${user.name}!`);
    showView('dashboard');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ==========================================
// LÓGICA DO MULTI-GERADOR (ARTIGOS EM LOTE 1-CLIQUE)
// ==========================================

function populateMultiGeneratorSites() {
  const select = document.getElementById('multi-select-site');
  if (!select) return;
  
  if (State.sites.length === 0) {
    select.innerHTML = '<option value="">Crie um blog primeiro na aba "Criar Blog"</option>';
    return;
  }
  
  select.innerHTML = '';
  State.sites.forEach(site => {
    const opt = document.createElement('option');
    opt.value = site.repoName;
    opt.dataset.theme = site.theme;
    opt.textContent = `${site.repoName} (${site.theme})`;
    select.appendChild(opt);
  });
}

// 1. Busca ideias de títulos de cauda longa
const btnGetIdeas = document.getElementById('btn-get-ideas');
if (btnGetIdeas) {
  btnGetIdeas.addEventListener('click', async () => {
    const keyword = document.getElementById('multi-seed-keyword').value.trim();
    if (!keyword) {
      showToast('Por favor, digite uma palavra-chave semente.', 'error');
      return;
    }
    
    btnGetIdeas.disabled = true;
    btnGetIdeas.textContent = '🔍 Pesquisando...';
    
    // Obter dados do site selecionado no painel inferior para contexto de tema
    const siteSelectEl = document.getElementById('multi-select-site');
    const selectedSiteOption = siteSelectEl && siteSelectEl.selectedOptions.length > 0 ? siteSelectEl.selectedOptions[0] : null;
    const theme = selectedSiteOption ? (selectedSiteOption.dataset.theme || 'multicategorias') : 'multicategorias';
    const repoName = siteSelectEl ? siteSelectEl.value : '';
    
    try {
      const response = await fetch('/api/generate-title-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword,
          theme,
          repoName,
          githubToken: State.credentials.githubToken,
          geminiApiKey: State.credentials.geminiApiKey
        })
      });
      
      const result = await response.json();
      if (!response.ok || result.error) {
        throw new Error(result.error || 'Erro ao buscar ideias.');
      }
      
      const listContainer = document.getElementById('titles-list');
      if (listContainer) {
        listContainer.innerHTML = '';
        
        result.ideas.forEach((idea) => {
          const li = document.createElement('li');
          li.textContent = idea.title;
          li.style.padding = '8px 0';
          li.style.borderBottom = '1px solid rgba(255, 255, 255, 0.05)';
          listContainer.appendChild(li);
        });
        
        document.getElementById('container-ideas-list').style.display = 'block';
        showToast('Encontramos 10 caudas longas perfeitas!', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btnGetIdeas.disabled = false;
      btnGetIdeas.textContent = '🔍 Gerar Ideias de Títulos';
    }
  });
}

// 2. Copiar Todos os Títulos
const btnCopyTitles = document.getElementById('btn-copy-titles');
if (btnCopyTitles) {
  btnCopyTitles.addEventListener('click', () => {
    const listItems = document.querySelectorAll('#titles-list li');
    if (listItems.length === 0) {
      showToast('Nenhum título para copiar.', 'error');
      return;
    }
    const textToCopy = Array.from(listItems).map(li => li.textContent.trim()).join('\n');
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        showToast('Todos os títulos foram copiados para a área de transferência!', 'success');
      })
      .catch(err => {
        showToast('Erro ao copiar títulos: ' + err.message, 'error');
      });
  });
}

// ==========================================
// LÓGICA DO MONITOR DE POSIÇÃO NO GOOGLE (SEO TRACKER)
// ==========================================

function populatePositionSites() {
  const select = document.getElementById('position-select-site');
  if (!select) return;
  
  select.innerHTML = '<option value="custom" selected>✨ Outro Site / URL Customizada</option>';
  
  if (State.sites && State.sites.length > 0) {
    State.sites.forEach(site => {
      const opt = document.createElement('option');
      opt.value = site.deployUrl || site.repoName;
      opt.dataset.repo = site.repoName;
      opt.textContent = `${site.repoName} (${site.deployUrl ? site.deployUrl.replace(/https?:\/\//, '') : 'Sem Domínio'})`;
      select.appendChild(opt);
    });
  }
  
  // Trigger update
  const event = new Event('change');
  select.dispatchEvent(event);
}

// Handler for select site dropdown change
const positionSelectSite = document.getElementById('position-select-site');
const positionCustomUrlGroup = document.getElementById('position-custom-url-group');
const positionCustomUrl = document.getElementById('position-custom-url');

if (positionSelectSite && positionCustomUrlGroup && positionCustomUrl) {
  positionSelectSite.addEventListener('change', () => {
    if (positionSelectSite.value === 'custom') {
      positionCustomUrlGroup.style.display = 'block';
      positionCustomUrl.required = true;
    } else {
      positionCustomUrlGroup.style.display = 'none';
      positionCustomUrl.required = false;
    }
  });
}

// Clear button logic
const btnCancelPosition = document.getElementById('btn-cancel-position');
if (btnCancelPosition) {
  btnCancelPosition.addEventListener('click', () => {
    const form = document.getElementById('position-tracker-form');
    if (form) form.reset();
    
    const resultsContainer = document.getElementById('position-results-container');
    if (resultsContainer) resultsContainer.style.display = 'none';
    
    const initialMock = document.getElementById('seo-initial-mock');
    if (initialMock) initialMock.classList.remove('hidden');
    
    const loadingMock = document.getElementById('seo-loading-mock');
    if (loadingMock) loadingMock.classList.add('hidden');
    
    if (positionSelectSite) {
      positionSelectSite.value = 'custom';
      const event = new Event('change');
      positionSelectSite.dispatchEvent(event);
    }
  });
}

// Tracker Form Submit
const positionTrackerForm = document.getElementById('position-tracker-form');
if (positionTrackerForm) {
  positionTrackerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const selectEl = document.getElementById('position-select-site');
    const selectSite = selectEl.value;
    let targetUrl = '';
    let repoName = '';
    if (selectSite === 'custom') {
      targetUrl = document.getElementById('position-custom-url').value.trim();
      
      // Fallback inteligente: se digitou manualmente, tenta bater o domínio com algum site do usuário para salvar
      const cleanTarget = targetUrl.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
      const matchedSite = State.sites.find(s => {
        const cleanDeploy = (s.deployUrl || '').toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
        const cleanRepo = s.repoName.replace('afiliados-blog-', '');
        return cleanTarget.includes(cleanDeploy) || cleanDeploy.includes(cleanTarget) || cleanTarget.includes(cleanRepo);
      });
      if (matchedSite) {
        repoName = matchedSite.repoName;
      }
    } else {
      targetUrl = selectSite;
      const selectedOpt = selectEl.options[selectEl.selectedIndex];
      if (selectedOpt) {
        repoName = selectedOpt.dataset.repo || '';
      }
    }
    
    const keyword = document.getElementById('position-keyword').value.trim();
    
    if (!targetUrl || !keyword) {
      showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
      return;
    }
    
    // UI elements
    const initialMock = document.getElementById('seo-initial-mock');
    const loadingMock = document.getElementById('seo-loading-mock');
    const loadingStatus = document.getElementById('seo-loading-status');
    const resultsContainer = document.getElementById('position-results-container');
    const analyzeBtn = document.getElementById('btn-analyze-position');
    
    // Update loading state
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '⚡ Analisando...';
    if (initialMock) initialMock.classList.add('hidden');
    if (resultsContainer) resultsContainer.style.display = 'none';
    if (loadingMock) loadingMock.classList.remove('hidden');
    if (loadingStatus) loadingStatus.textContent = 'Rastreando as primeiras 100 posições orgânicas no Google...';
    
    try {
      const response = await fetch('/api/check-google-position', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: targetUrl,
          keyword: keyword,
          geminiApiKey: State.credentials.geminiApiKey,
          userEmail: State.user ? State.user.email : null,
          repoName: repoName || null
        })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro desconhecido ao rastrear a posição.');
      }
      
      // Update local storage and UI list if sites are returned
      if (data.sites) {
        State.sites = data.sites;
        if (State.user) {
          State.user.sites = data.sites;
          localStorage.setItem('saas_user', JSON.stringify(State.user));
        }
        renderBlogList();
      }
      
      if (loadingMock) loadingMock.classList.add('hidden');
      
      // Populate elements
      const methodBadge = document.getElementById('seo-method-badge');
      const rankValue = document.getElementById('seo-rank-value');
      const rankStatus = document.getElementById('seo-rank-status');
      const volumeValue = document.getElementById('seo-volume-value');
      const pageLink = document.getElementById('seo-page-link');
      const competitorsTbody = document.getElementById('seo-competitors-tbody');
      const adviceList = document.getElementById('seo-advice-list');
      
      if (methodBadge) methodBadge.textContent = data.method || 'Direct Scraper';
      
      // Rank Display format
      const pos = data.position;
      if (pos > 0) {
        if (rankValue) {
          rankValue.textContent = `#${pos}`;
          rankValue.className = 'gradient-text';
          rankValue.style.color = '';
        }
        if (rankStatus) {
          if (pos <= 3) {
            rankStatus.textContent = 'Excelente (Top 3)';
            rankStatus.style.background = 'rgba(16, 185, 129, 0.15)';
            rankStatus.style.color = '#10b981';
          } else if (pos <= 10) {
            rankStatus.textContent = 'Muito Bom (Top 10)';
            rankStatus.style.background = 'rgba(59, 130, 246, 0.15)';
            rankStatus.style.color = '#3b82f6';
          } else {
            rankStatus.textContent = 'Ranqueado (Top 100)';
            rankStatus.style.background = 'rgba(245, 158, 11, 0.15)';
            rankStatus.style.color = '#f59e0b';
          }
        }
      } else {
        if (rankValue) {
          rankValue.textContent = 'N/A';
          rankValue.className = '';
          rankValue.style.color = 'var(--text-muted)';
        }
        if (rankStatus) {
          rankStatus.textContent = 'Não Encontrado (Top 100)';
          rankStatus.style.background = 'rgba(239, 68, 68, 0.15)';
          rankStatus.style.color = '#ef4444';
        }
      }
      
      if (volumeValue) {
        volumeValue.textContent = data.searchVolume || 'Média';
      }
      
      if (pageLink) {
        if (data.pageUrl) {
          pageLink.href = data.pageUrl;
          pageLink.textContent = data.pageUrl.replace(/https?:\/\//, '');
          pageLink.style.pointerEvents = 'auto';
        } else {
          pageLink.href = '#';
          pageLink.textContent = 'Nenhuma página encontrada';
          pageLink.style.pointerEvents = 'none';
        }
      }
      
      // Top 10 Table
      if (competitorsTbody) {
        competitorsTbody.innerHTML = '';
        if (data.topResults && data.topResults.length > 0) {
          data.topResults.forEach(item => {
            const tr = document.createElement('tr');
            
            // Format domains for comparison
            const cleanTarget = targetUrl.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
            const isUserSite = (item.url && item.url.includes(cleanTarget));
            
            if (isUserSite) {
              tr.style.background = 'rgba(37, 99, 235, 0.08)';
              tr.style.borderLeft = '4px solid #2563eb';
            }
            
            tr.innerHTML = `
              <td style="text-align: center; font-weight: bold; color: ${item.position <= 3 ? '#fbbf24' : 'var(--text-muted)'};">
                ${item.position}
              </td>
              <td>
                <div style="font-weight: 600; color: var(--text-main); margin-bottom: 2px;">
                  ${item.title || 'Resultado do Google'}
                </div>
                <a href="${item.url || '#'}" target="_blank" style="font-size: 0.8rem; color: var(--primary); text-decoration: none; word-break: break-all;">
                  ${item.url || ''}
                </a>
                ${item.snippet ? `<div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px; line-height: 1.3;">${item.snippet}</div>` : ''}
              </td>
            `;
            competitorsTbody.appendChild(tr);
          });
        } else {
          competitorsTbody.innerHTML = '<tr><td colspan="2" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">Nenhum resultado orgânico retornado.</td></tr>';
        }
      }
      
      // Ninja Agent SEO Advice
      if (adviceList) {
        adviceList.innerHTML = '';
        if (data.seoAdvice && data.seoAdvice.length > 0) {
          data.seoAdvice.forEach(advice => {
            const li = document.createElement('li');
            li.innerHTML = `<span style="color: var(--primary); font-weight: bold; margin-right: 5px;">✓</span> ${advice}`;
            adviceList.appendChild(li);
          });
        } else {
          adviceList.innerHTML = '<li>Nenhuma recomendação disponível para esta palavra-chave no momento.</li>';
        }
      }
      
      if (resultsContainer) resultsContainer.style.display = 'block';
      showToast('Análise de classificação concluída com sucesso!');
      
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
      if (initialMock) initialMock.classList.remove('hidden');
      if (resultsContainer) resultsContainer.style.display = 'none';
    } finally {
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = '⚡ Analisar Posição no Google';
      if (loadingMock) loadingMock.classList.add('hidden');
    }
  });
}

// ==========================================
// LÓGICA DO ARQUITETO SILO
// ==========================================

function populateSiloSites() {
  const select = document.getElementById('silo-select-site');
  if (!select) return;
  
  if (State.sites.length === 0) {
    select.innerHTML = '<option value="">Crie um blog primeiro na aba "Criar Blog"</option>';
    return;
  }
  
  select.innerHTML = '';
  State.sites.forEach(site => {
    const opt = document.createElement('option');
    opt.value = site.repoName;
    opt.textContent = `${site.repoName} (${site.theme})`;
    select.appendChild(opt);
  });
}

const siloForm = document.getElementById('silo-structure-form');
if (siloForm) {
  siloForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const repoName = document.getElementById('silo-select-site').value;
    const niche = document.getElementById('silo-niche').value.trim();
    
    if (!repoName || !niche) {
      showToast('Preencha todos os campos obrigatórios.', 'error');
      return;
    }
    
    const initialMock = document.getElementById('silo-initial-mock');
    const loadingMock = document.getElementById('silo-loading-mock');
    const resultsContainer = document.getElementById('silo-results-container');
    const treeVisualizer = document.getElementById('silo-tree-visualizer');
    const analyzeBtn = document.getElementById('btn-analyze-silo');
    
    const stepClone = document.getElementById('silo-step-clone');
    const stepResearch = document.getElementById('silo-step-research');
    const stepTemplates = document.getElementById('silo-step-templates');
    const stepPush = document.getElementById('silo-step-push');
    
    // Reset steps UI
    [stepClone, stepResearch, stepTemplates, stepPush].forEach(el => {
      if (el) {
        el.style.color = 'var(--text-muted)';
        el.textContent = el.textContent.replace('✓', '⏳').replace('❌', '⏳');
      }
    });
    
    if (initialMock) initialMock.classList.add('hidden');
    if (loadingMock) loadingMock.classList.remove('hidden');
    if (resultsContainer) resultsContainer.style.display = 'none';
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '⚡ Processando SILO...';
    
    try {
      // Step 1: Clone
      if (stepClone) {
        stepClone.style.color = 'var(--primary)';
        stepClone.textContent = '⏳ Clonando repositório e analisando artigos...';
      }
      
      const payload = {
        repoName,
        niche,
        githubToken: State.credentials.githubToken || localStorage.getItem('github_token'),
        geminiApiKey: State.credentials.geminiApiKey || localStorage.getItem('gemini_key'),
        userEmail: State.user ? State.user.email : null
      };
      
      // We will make a post to our API endpoint
      // We'll update the steps based on simulated delay or custom server events, but let's let the single request do it.
      if (stepResearch) {
        setTimeout(() => {
          stepClone.style.color = 'var(--success)';
          stepClone.textContent = '✓ Clonando repositório e analisando artigos concluído.';
          stepResearch.style.color = 'var(--primary)';
          stepResearch.textContent = '⏳ Pesquisando palavras cabeça e médias (Gemini)...';
        }, 3000);
      }
      
      if (stepTemplates) {
        setTimeout(() => {
          stepResearch.style.color = 'var(--success)';
          stepResearch.textContent = '✓ Pesquisando palavras cabeça e médias concluído.';
          stepTemplates.style.color = 'var(--primary)';
          stepTemplates.textContent = '⏳ Escrevendo silo.json e novos templates no repositório...';
        }, 9000);
      }

      if (stepPush) {
        setTimeout(() => {
          stepTemplates.style.color = 'var(--success)';
          stepTemplates.textContent = '✓ Escrevendo silo.json e novos templates concluído.';
          stepPush.style.color = 'var(--primary)';
          stepPush.textContent = '⏳ Enviando atualizações para o GitHub...';
        }, 13000);
      }

      const res = await fetch('/api/restructure-silo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao reestruturar blog em SILO.');
      }
      
      // Update steps to done
      [stepClone, stepResearch, stepTemplates, stepPush].forEach(el => {
        if (el) {
          el.style.color = 'var(--success)';
          el.textContent = el.textContent.replace('⏳', '✓');
        }
      });
      
      showToast('Estrutura SILO aplicada com sucesso!', 'success');
      
      // Render the visual tree
      if (treeVisualizer && data.silo) {
        let treeHtml = `<div style="font-weight: bold; color: var(--primary); margin-bottom: 1rem;">🌳 SITE: ${repoName} (Micro-Nicho: ${niche})</div>`;
        
        data.silo.categories.forEach(cat => {
          treeHtml += `<div style="margin-left: 10px; margin-top: 1rem;">📁 CATEGORIA (Head Term): <strong style="color: #fff;">${cat.name}</strong></div>`;
          treeHtml += `<div style="margin-left: 25px; font-size: 0.85rem; color: var(--text-muted); font-style: italic;">"${cat.description}"</div>`;
          
          cat.subcategories.forEach(sub => {
            treeHtml += `<div style="margin-left: 30px; margin-top: 0.5rem; color: #a855f7;">📂 SUBCATEGORIA (Middle Term): <strong>${sub.name}</strong></div>`;
            treeHtml += `<div style="margin-left: 45px; font-size: 0.85rem; color: var(--text-muted); font-style: italic;">"${sub.description}"</div>`;
            
            sub.articles.forEach(art => {
              treeHtml += `<div style="margin-left: 60px; color: #10b981;">📄 Artigo (Long-Tail): ${art.title} <span style="color: var(--text-muted); font-size: 0.85rem;">(${art.slug})</span></div>`;
            });
          });
        });
        
        treeVisualizer.innerHTML = treeHtml;
      }
      
      if (resultsContainer) resultsContainer.style.display = 'block';
      
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
      
      // Mark failed step in red
      [stepClone, stepResearch, stepTemplates, stepPush].forEach(el => {
        if (el && el.textContent.includes('⏳')) {
          el.style.color = '#ef4444';
          el.textContent = el.textContent.replace('⏳', '❌');
        }
      });
      
      if (initialMock) initialMock.classList.remove('hidden');
    } finally {
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = '⚡ Planejar e Estruturar SILO';
      if (loadingMock) loadingMock.classList.add('hidden');
    }
  });
}

// ========================================================
// LÓGICA DO SISTEMA NETO SALVA (BACKUPS)
// ========================================================

function populateBackupSites() {
  const select = document.getElementById('backup-select-site');
  if (!select) return;

  if (State.sites.length === 0) {
    select.innerHTML = '<option value="">Crie um blog primeiro na aba "Criar Blog"</option>';
    document.getElementById('backups-list-container').style.display = 'none';
    return;
  }

  select.innerHTML = '';
  State.sites.forEach(site => {
    const opt = document.createElement('option');
    opt.value = site.repoName;
    opt.textContent = `${site.repoName} (${site.theme})`;
    select.appendChild(opt);
  });

  // Attach event listener once if not already done
  if (!select.dataset.wired) {
    select.dataset.wired = 'true';
    select.addEventListener('change', () => {
      const repoName = select.value;
      if (repoName) {
        loadBackups(repoName);
      }
    });
  }

  // Initial load
  loadBackups(select.value);
}

async function loadBackups(repoName) {
  const container = document.getElementById('backups-list-container');
  const tbody = document.getElementById('backups-tbody');
  const badge = document.getElementById('backups-count-badge');

  if (!repoName) return;

  tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;"><div class="spinner" style="margin: 0 auto 0.5rem auto;"></div>Carregando backups...</td></tr>';
  container.style.display = 'block';

  try {
    const response = await fetch(`/api/neto-salva/backups?repoName=${encodeURIComponent(repoName)}&githubToken=${encodeURIComponent(State.credentials.githubToken)}`);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Erro ao carregar os backups do servidor.');
    }

    badge.textContent = `${data.backups.length} backup(s) salvo(s)`;
    tbody.innerHTML = '';

    if (data.backups.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">Nenhum ponto de restauração encontrado para este blog.</td></tr>';
      return;
    }

    data.backups.forEach(backup => {
      const tr = document.createElement('tr');
      const backupDate = new Date(backup.date).toLocaleString('pt-BR');
      const isAuto = backup.isAuto;
      
      tr.innerHTML = `
        <td><strong style="color: var(--text-main);">${backupDate}</strong></td>
        <td><code style="background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px; color: var(--primary); font-size: 0.85rem;">${backup.id}</code></td>
        <td style="color: var(--text-main);">${backup.description}</td>
        <td>
          <span class="badge" style="background: ${isAuto ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)'}; color: ${isAuto ? '#f59e0b' : '#10b981'}; font-weight: 600; padding: 4px 10px; border-radius: 6px;">
            ${isAuto ? 'Automático' : 'Manual'}
          </span>
        </td>
        <td style="text-align: center;">
          <div style="display: flex; gap: 8px; justify-content: center;">
            <button class="btn btn-sm btn-primary" onclick="triggerRestore('${repoName}', '${backup.id}')" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); border: none;">Restaurar</button>
            <a class="btn btn-sm btn-outline" href="/api/neto-salva/download?repoName=${encodeURIComponent(repoName)}&tagName=${encodeURIComponent(backup.id)}&githubToken=${encodeURIComponent(State.credentials.githubToken)}" style="border: 1px solid var(--border); color: var(--text);">Baixar ZIP</a>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #ef4444; padding: 1.5rem;">Erro ao carregar backups: ${err.message}</td></tr>`;
    showToast(err.message, 'error');
  }
}

// Global window reference for inline onclick triggers
window.triggerRestore = async function(repoName, tagName) {
  const confirmRestore = confirm(`Deseja realmente restaurar o blog para a versão "${tagName}"?\n\nIsso substituirá o estado atual do blog na nuvem. Um backup automático do estado atual será criado antes da restauração para sua segurança.`);
  if (!confirmRestore) return;

  const initialMock = document.getElementById('backup-initial-mock');
  const loadingMock = document.getElementById('backup-loading-mock');
  const loadingTitle = document.getElementById('backup-loading-title');
  const loadingStatus = document.getElementById('backup-loading-status');
  const createBtn = document.getElementById('btn-create-backup');

  // Set loading UI
  if (initialMock) initialMock.classList.add('hidden');
  if (loadingMock) loadingMock.classList.remove('hidden');
  if (loadingTitle) loadingTitle.textContent = 'Restaurando Blog...';
  if (loadingStatus) loadingStatus.textContent = 'Criando backup automático de segurança e aplicando a versão...';
  if (createBtn) createBtn.disabled = true;

  try {
    const response = await fetch('/api/neto-salva/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repoName,
        tagName,
        githubToken: State.credentials.githubToken,
        userEmail: State.user ? State.user.email : null
      })
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Erro ao realizar a restauração do backup.');
    }

    showToast('Blog restaurado com sucesso! O deploy da Vercel foi iniciado na nuvem.', 'success');
    
    // Reload backup list to show the new auto safeguard backup
    await loadBackups(repoName);

  } catch (err) {
    console.error(err);
    showToast(err.message, 'error');
  } finally {
    if (loadingMock) loadingMock.classList.add('hidden');
    if (initialMock) initialMock.classList.remove('hidden');
    if (createBtn) createBtn.disabled = false;
  }
};

// Form submit for backup creation
const netoSalvaForm = document.getElementById('neto-salva-form');
if (netoSalvaForm) {
  netoSalvaForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const repoName = document.getElementById('backup-select-site').value;
    const description = document.getElementById('backup-description').value.trim();

    if (!repoName || !description) {
      showToast('Por favor, preencha todos os campos.', 'error');
      return;
    }

    const initialMock = document.getElementById('backup-initial-mock');
    const loadingMock = document.getElementById('backup-loading-mock');
    const loadingTitle = document.getElementById('backup-loading-title');
    const loadingStatus = document.getElementById('backup-loading-status');
    const createBtn = document.getElementById('btn-create-backup');

    if (initialMock) initialMock.classList.add('hidden');
    if (loadingMock) loadingMock.classList.remove('hidden');
    if (loadingTitle) loadingTitle.textContent = 'Criando Backup...';
    if (loadingStatus) loadingStatus.textContent = 'Clonando repositório e gerando ponto de restauração no GitHub...';
    if (createBtn) createBtn.disabled = true;

    try {
      const response = await fetch('/api/neto-salva/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoName,
          description,
          githubToken: State.credentials.githubToken,
          userEmail: State.user ? State.user.email : null
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao gerar o ponto de restauração.');
      }

      showToast(`Ponto de restauração "${data.tagName}" criado com sucesso!`, 'success');
      document.getElementById('backup-description').value = '';
      
      // Reload backups list
      await loadBackups(repoName);

    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    } finally {
      if (loadingMock) loadingMock.classList.add('hidden');
      if (initialMock) initialMock.classList.remove('hidden');
      if (createBtn) createBtn.disabled = false;
    }
  });
}

// Form submit for backup restore via ZIP upload
const netoSalvaUploadForm = document.getElementById('neto-salva-upload-form');
if (netoSalvaUploadForm) {
  netoSalvaUploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const repoName = document.getElementById('backup-select-site').value;
    const fileInput = document.getElementById('backup-zip-file');
    
    if (!repoName) {
      showToast('Selecione um blog primeiro.', 'error');
      return;
    }
    if (!fileInput.files || fileInput.files.length === 0) {
      showToast('Por favor, selecione um arquivo ZIP de backup.', 'error');
      return;
    }

    const file = fileInput.files[0];
    const confirmUpload = confirm(`Deseja realmente restaurar o blog "${repoName}" a partir do arquivo "${file.name}"?\n\nIsso apagará e substituirá o estado atual do blog na nuvem. Um backup automático do estado atual será criado antes da restauração para sua segurança.`);
    if (!confirmUpload) return;

    const initialMock = document.getElementById('backup-initial-mock');
    const loadingMock = document.getElementById('backup-loading-mock');
    const loadingTitle = document.getElementById('backup-loading-title');
    const loadingStatus = document.getElementById('backup-loading-status');
    const uploadBtn = document.getElementById('btn-upload-restore');

    if (initialMock) initialMock.classList.add('hidden');
    if (loadingMock) loadingMock.classList.remove('hidden');
    if (loadingTitle) loadingTitle.textContent = 'Enviando & Restaurando ZIP...';
    if (loadingStatus) loadingStatus.textContent = 'Lendo o arquivo compactado e transmitindo para o servidor...';
    if (uploadBtn) uploadBtn.disabled = true;

    try {
      // Read file as base64
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => {
          // Extract base64 part of DataURL
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
        };
        reader.onerror = (error) => reject(error);
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      if (loadingStatus) loadingStatus.textContent = 'Extraindo ZIP e atualizando repositório na nuvem (isso pode levar cerca de 1 minuto)...';

      const response = await fetch('/api/neto-salva/restore-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoName,
          zipData: base64Data,
          githubToken: State.credentials.githubToken,
          userEmail: State.user ? State.user.email : null
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao restaurar a partir do ZIP enviado.');
      }

      showToast('Blog restaurado com sucesso a partir do ZIP! O deploy da Vercel foi iniciado na nuvem.', 'success');
      fileInput.value = '';
      
      // Reload backups list
      await loadBackups(repoName);

    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    } finally {
      if (loadingMock) loadingMock.classList.add('hidden');
      if (initialMock) initialMock.classList.remove('hidden');
      if (uploadBtn) uploadBtn.disabled = false;
    }
  });
}

// helper delay function
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run app init on load
init();

// Wait and initialize Google Auth when client SDK is loaded
let checkCount = 0;
const checkInterval = setInterval(() => {
  checkCount++;
  if (window.google && window.google.accounts) {
    clearInterval(checkInterval);
    initGoogleAuth();
  } else if (checkCount > 20) {
    clearInterval(checkInterval);
    console.warn('Google Identity Services script did not load in time.');
  }
}, 300);

// --- BACKLINK TRACKER CLIENT LOGIC ---

// Populates drop-down selection with user's blogs
function populateBacklinkSites() {
  const selectSite = document.getElementById('backlink-select-site');
  if (!selectSite) return;

  // Clear existing options except the manual input
  selectSite.innerHTML = '<option value="custom" selected>✨ Inserir URL Customizada</option>';

  State.sites.forEach(site => {
    const domain = site.deployUrl ? site.deployUrl.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '') : site.repoName;
    const option = document.createElement('option');
    option.value = site.deployUrl || site.repoName;
    option.textContent = `${site.repoName} (${domain})`;
    option.dataset.repo = site.repoName;
    selectSite.appendChild(option);
  });
}

// Toggle manual input group based on dropdown selection
const selectBacklinkSite = document.getElementById('backlink-select-site');
const customUrlGroup = document.getElementById('backlink-custom-url-group');

if (selectBacklinkSite && customUrlGroup) {
  selectBacklinkSite.addEventListener('change', () => {
    if (selectBacklinkSite.value === 'custom') {
      customUrlGroup.style.display = 'block';
    } else {
      customUrlGroup.style.display = 'none';
    }
  });
}

// Clear Backlink Form
const btnCancelBacklink = document.getElementById('btn-cancel-backlink');
if (btnCancelBacklink) {
  btnCancelBacklink.addEventListener('click', () => {
    const form = document.getElementById('backlink-tracker-form');
    if (form) form.reset();
    if (customUrlGroup) customUrlGroup.style.display = 'block';
    
    document.getElementById('backlink-initial-mock').classList.remove('hidden');
    document.getElementById('backlink-loading-mock').classList.add('hidden');
    document.getElementById('backlink-results-container').style.display = 'none';
  });
}

// Submit Handlers
const backlinkForm = document.getElementById('backlink-tracker-form');
if (backlinkForm) {
  backlinkForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const selectSite = document.getElementById('backlink-select-site').value;
    let targetUrl = '';
    
    if (selectSite === 'custom') {
      targetUrl = document.getElementById('backlink-custom-url').value.trim();
    } else {
      targetUrl = selectSite;
    }
    
    if (!targetUrl) {
      showToast('Por favor, insira ou selecione uma URL.', 'error');
      return;
    }
    
    const initialMock = document.getElementById('backlink-initial-mock');
    const loadingMock = document.getElementById('backlink-loading-mock');
    const loadingStatus = document.getElementById('backlink-loading-status');
    const resultsContainer = document.getElementById('backlink-results-container');
    const analyzeBtn = document.getElementById('btn-analyze-backlink');
    const resultsTbody = document.getElementById('backlink-results-tbody');
    
    // Set UI states
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '⚡ Analisando...';
    if (initialMock) initialMock.classList.add('hidden');
    if (resultsContainer) resultsContainer.style.display = 'none';
    if (loadingMock) loadingMock.classList.remove('hidden');
    
    // Update steps
    const steps = {
      google: document.getElementById('backlink-step-google'),
      dns: document.getElementById('backlink-step-dns'),
      geoip: document.getElementById('backlink-step-geoip')
    };
    
    const setStepState = (step, state) => {
      if (!step) return;
      if (state === 'active') {
        step.style.color = 'var(--primary)';
        step.style.fontWeight = '700';
      } else if (state === 'done') {
        step.style.color = 'var(--success)';
        step.style.fontWeight = '400';
        step.textContent = step.textContent.replace('⏳', '✓');
      } else {
        step.style.color = 'var(--text-muted)';
        step.style.fontWeight = '400';
      }
    };
    
    // Restore text
    if (steps.google) steps.google.textContent = '⏳ Pesquisando backlinks (Gemini Grounding)...';
    if (steps.dns) steps.dns.textContent = '⏳ Resolvendo IP e servidores DNS...';
    if (steps.geoip) steps.geoip.textContent = '⏳ Localizando servidores de hospedagem...';
    
    try {
      setStepState(steps.google, 'active');
      if (loadingStatus) loadingStatus.textContent = 'Pesquisando referências e links reais apontando para o site...';
      await delay(1000);
      
      const response = await fetch('/api/analyze-backlinks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: targetUrl,
          geminiApiKey: State.credentials.geminiApiKey
        })
      });
      
      setStepState(steps.google, 'done');
      setStepState(steps.dns, 'active');
      if (loadingStatus) loadingStatus.textContent = 'Buscando IP e registros DNS (nameservers)...';
      await delay(1000);
      
      setStepState(steps.dns, 'done');
      setStepState(steps.geoip, 'active');
      if (loadingStatus) loadingStatus.textContent = 'Identificando o local físico e provedores de hospedagem...';
      await delay(800);
      
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao analisar backlinks.');
      }
      
      setStepState(steps.geoip, 'done');
      await delay(400);
      
      if (loadingMock) loadingMock.classList.add('hidden');
      if (resultsContainer) resultsContainer.style.display = 'block';
      
      // Populate results table
      resultsTbody.innerHTML = '';
      if (data.backlinks.length === 0) {
        resultsTbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">Nenhum link externo encontrado para esta URL.</td></tr>';
      } else {
        data.backlinks.forEach((link, idx) => {
          const row = document.createElement('tr');
          
          let relevanceClass = 'relevance-low';
          if (link.relevance === 'Alta') relevanceClass = 'relevance-high';
          else if (link.relevance === 'Média') relevanceClass = 'relevance-medium';
          
          row.innerHTML = `
            <td>
              <strong style="color: #fff; font-size: 15px;">${link.domain}</strong>
              <div style="font-size: 12px; color: var(--text-muted); max-width: 250px; white-space: normal; margin-top: 4px;">${link.description || ''}</div>
            </td>
            <td>
              <span class="relevance-badge ${relevanceClass}">${link.relevance} (${link.relevanceScore})</span>
            </td>
            <td>
              <code style="background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 4px; font-weight: bold; color: var(--primary);">${link.anchorText}</code>
            </td>
            <td>
              <div class="backlink-tech-info">
                <span>IP: <strong>${link.ip}</strong></span>
                <span>NS: <strong style="font-size: 11px;">${link.dns}</strong></span>
              </div>
            </td>
            <td>
              <div class="backlink-tech-info">
                <span>ISP: <strong>${link.hostingProvider}</strong></span>
                <span>Local: <strong>${link.hostingLocation}</strong></span>
              </div>
            </td>
            <td>
              <div style="display: flex; gap: 8px; align-items: center;">
                <button type="button" class="btn btn-sm btn-primary" onclick="saveBacklink('${link.anchorText.replace(/'/g, "\\'")}', '${link.domain.replace(/'/g, "\\'")}')" style="padding: 6px 12px; font-size: 12px;">Salvar</button>
                <a href="${link.url}" target="_blank" class="btn btn-sm btn-outline" style="padding: 6px 10px; font-size: 12px; text-decoration: none;">🔗 Link</a>
              </div>
            </td>
          `;
          resultsTbody.appendChild(row);
        });
      }
      
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
      if (initialMock) initialMock.classList.remove('hidden');
      if (loadingMock) loadingMock.classList.add('hidden');
    } finally {
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = '⚡ Analisar Backlinks';
    }
  });
}

// Save backlink to LocalStorage list
window.saveBacklink = function(anchorText, domain) {
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem('saas_saved_backlinks')) || [];
  } catch (e) {
    saved = [];
  }
  
  // Check if already exists
  const exists = saved.some(item => item.anchorText.toLowerCase() === anchorText.toLowerCase() && item.domain.toLowerCase() === domain.toLowerCase());
  if (exists) {
    showToast('Este link já está salvo na sua lista.', 'warning');
    return;
  }
  
  saved.push({ anchorText, domain, savedAt: new Date().toISOString() });
  localStorage.setItem('saas_saved_backlinks', JSON.stringify(saved));
  
  showToast('Link salvo com sucesso!', 'success');
  renderSavedBacklinks();
};

// Delete backlink from LocalStorage list
window.deleteSavedBacklink = function(index) {
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem('saas_saved_backlinks')) || [];
  } catch (e) {
    saved = [];
  }
  
  saved.splice(index, 1);
  localStorage.setItem('saas_saved_backlinks', JSON.stringify(saved));
  
  showToast('Item removido da lista.', 'success');
  renderSavedBacklinks();
};

// Render saved backlinks table
function renderSavedBacklinks() {
  const savedTbody = document.getElementById('backlink-saved-tbody');
  if (!savedTbody) return;
  
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem('saas_saved_backlinks')) || [];
  } catch (e) {
    saved = [];
  }
  
  if (saved.length === 0) {
    savedTbody.innerHTML = `
      <tr class="empty-backlinks-row">
        <td colspan="3" style="text-align: center; color: var(--text-muted); padding: 2rem;">
          Nenhum backlink salvo na lista ainda. Faça uma análise acima e clique em "Salvar" para começar a gerenciar.
        </td>
      </tr>
    `;
    return;
  }
  
  savedTbody.innerHTML = '';
  saved.forEach((item, idx) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <code style="background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 4px; font-weight: bold; color: var(--primary);">${item.anchorText}</code>
      </td>
      <td>
        <strong style="color: #fff;">${item.domain}</strong>
      </td>
      <td style="text-align: center;">
        <button type="button" class="btn btn-sm btn-outline" onclick="deleteSavedBacklink(${idx})" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.2); padding: 6px 12px; font-size: 12px;">Remover</button>
      </td>
    `;
    savedTbody.appendChild(row);
  });
}


// ==========================================
// SAFIRA AI CHATBOT AGENT INTEGRATION
// ==========================================

let safiraHistory = [];

function toggleSafiraChat() {
  const sidebar = document.getElementById('safira-chat-sidebar');
  const backdrop = document.getElementById('safira-backdrop');
  if (sidebar && backdrop) {
    sidebar.classList.toggle('active');
    backdrop.classList.toggle('active');
  }
}

function openSafiraChat() {
  const sidebar = document.getElementById('safira-chat-sidebar');
  const backdrop = document.getElementById('safira-backdrop');
  if (sidebar && backdrop) {
    sidebar.classList.add('active');
    backdrop.classList.add('active');
  }
}

function closeSafiraChat() {
  const sidebar = document.getElementById('safira-chat-sidebar');
  const backdrop = document.getElementById('safira-backdrop');
  if (sidebar && backdrop) {
    sidebar.classList.remove('active');
    backdrop.classList.remove('active');
  }
}

function formatSafiraMessage(text) {
  // Safe escape
  let cleanText = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Format code blocks
  cleanText = cleanText.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code class="language-${lang}">${code.trim()}</code></pre>`;
  });

  // Format inline code
  cleanText = cleanText.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Format bold
  cleanText = cleanText.replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>');

  // Format lists & paragraphs
  const lines = cleanText.split('\n');
  let inList = false;
  let formattedLines = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) {
        formattedLines.push('<ul>');
        inList = true;
      }
      formattedLines.push(`<li>${line.substring(2)}</li>`);
    } else {
      if (inList) {
        formattedLines.push('</ul>');
        inList = false;
      }
      if (line !== '') {
        formattedLines.push(`<p>${line}</p>`);
      }
    }
  }
  if (inList) {
    formattedLines.push('</ul>');
  }

  return formattedLines.join('\n');
}

async function sendSafiraMessage(userText) {
  if (!userText.trim()) return;

  const chatMessages = document.getElementById('safira-messages');
  
  // Render user bubble
  const userBubble = document.createElement('div');
  userBubble.className = 'safira-message user';
  userBubble.innerHTML = `<p>${userText}</p>`;
  chatMessages.appendChild(userBubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Render typing indicator
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'safira-typing';
  typingIndicator.id = 'safira-typing-indicator';
  typingIndicator.innerHTML = '<span></span><span></span><span></span>';
  chatMessages.appendChild(typingIndicator);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Save in history
  safiraHistory.push({ role: 'user', text: userText });

  try {
    const response = await fetch('/api/safira/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: userText,
        history: safiraHistory.slice(0, -1), // Send previous history
        userEmail: State.user ? State.user.email : null,
        geminiApiKey: State.credentials ? State.credentials.geminiApiKey : null
      })
    });

    const data = await response.json();
    
    // Remove typing indicator
    const indicator = document.getElementById('safira-typing-indicator');
    if (indicator) indicator.remove();

    if (data.success && data.message) {
      let replyText = data.message;
      
      // Save model reply in history
      safiraHistory.push({ role: 'model', text: replyText });
      
      // Look for [[ACTION: ...]]
      let actionMatch = replyText.match(/\[\[ACTION:\s*([\s\S]*?)\s*\]\]/);
      let actionObj = null;
      if (actionMatch) {
        try {
          actionObj = JSON.parse(actionMatch[1]);
          // Clean the action text from response message
          replyText = replyText.replace(/\[\[ACTION:\s*[\s\S]*?\s*\]\]/g, '').trim();
        } catch (e) {
          console.error('Failed to parse action json:', e);
        }
      }

      // Render assistant bubble
      const assistantBubble = document.createElement('div');
      assistantBubble.className = 'safira-message assistant';
      assistantBubble.innerHTML = formatSafiraMessage(replyText);
      chatMessages.appendChild(assistantBubble);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // Execute action if matched
      if (actionObj) {
        await executeSafiraAction(actionObj);
      }
    } else {
      throw new Error(data.error || 'Erro ao processar resposta.');
    }
  } catch (err) {
    console.error('Safira Chat Error:', err);
    // Remove typing indicator
    const indicator = document.getElementById('safira-typing-indicator');
    if (indicator) indicator.remove();

    const errorBubble = document.createElement('div');
    errorBubble.className = 'safira-message assistant';
    errorBubble.style.borderColor = 'rgba(239, 68, 68, 0.2)';
    errorBubble.innerHTML = `<p style="color: var(--danger);">⚠️ Erro: Desculpe, não consegui processar sua requisição agora. Por favor, tente novamente.</p>`;
    chatMessages.appendChild(errorBubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

async function executeSafiraAction(action) {
  console.log('Safira requested action:', action);
  
  const chatMessages = document.getElementById('safira-messages');
  const badge = document.createElement('div');
  badge.className = 'safira-action-badge';
  badge.innerHTML = `⚙️ Executando: <strong>${action.type.toUpperCase()}</strong>...`;
  chatMessages.appendChild(badge);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    switch (action.type) {
      case 'navigate':
        if (action.params && action.params.target) {
          showView(action.params.target);
          badge.innerHTML = `✓ Navegado para a seção: ${action.params.target}`;
        }
        break;

      case 'backup':
        const backupSelect = document.getElementById('backup-select-site');
        const repoName = (action.params && action.params.repoName) || (backupSelect ? backupSelect.value : '');
        if (!repoName) {
          badge.style.color = 'var(--danger)';
          badge.style.borderColor = 'rgba(239, 68, 68, 0.3)';
          badge.innerHTML = `⚠️ Erro: Selecione um site antes de fazer backup.`;
          break;
        }
        badge.innerHTML = `💾 Iniciando Backup Neto Salva para ${repoName}...`;
        
        const res = await fetch('/api/neto-salva/backup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            repoName: repoName,
            description: action.params && action.params.description ? action.params.description : 'Backup via assistente Safira',
            githubToken: State.credentials.githubToken,
            userEmail: State.user.email
          })
        });
        const backupData = await res.json();
        if (backupData.success) {
          badge.innerHTML = `✓ Backup Neto Salva realizado! Tag: ${backupData.tagName || 'Sucesso'}`;
          if (typeof loadBackupsList === 'function') loadBackupsList(repoName);
        } else {
          throw new Error(backupData.error);
        }
        break;

      case 'silo':
        const siloSelect = document.getElementById('silo-select-site');
        const siloRepo = (action.params && action.params.repoName) || (siloSelect ? siloSelect.value : '');
        const siloNiche = (action.params && action.params.niche) || 'Micro-nicho';
        if (!siloRepo) {
          badge.style.color = 'var(--danger)';
          badge.innerHTML = `⚠️ Erro: Repositório não especificado para reestruturação SILO.`;
          break;
        }
        badge.innerHTML = `📐 Reestruturando ${siloRepo} em SILO...`;
        showView('siloStructure');
        const sRes = await fetch('/api/restructure-silo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            repoName: siloRepo,
            niche: siloNiche,
            githubToken: State.credentials.githubToken,
            geminiApiKey: State.credentials.geminiApiKey,
            userEmail: State.user.email
          })
        });
        const sData = await sRes.json();
        if (sData.success) {
          badge.innerHTML = `✓ Arquitetura SILO gerada com sucesso para ${siloRepo}!`;
        } else {
          throw new Error(sData.error);
        }
        break;

      case 'google-position':
        if (!action.params || !action.params.domain || !action.params.keyword) {
          badge.style.color = 'var(--danger)';
          badge.innerHTML = `⚠️ Erro: Domínio e palavra-chave necessários.`;
          break;
        }
        badge.innerHTML = `🔍 Analisando posição de "${action.params.keyword}" para ${action.params.domain}...`;
        showView('sitePosition');
        const pRes = await fetch('/api/check-google-position', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domain: action.params.domain,
            keyword: action.params.keyword,
            geminiApiKey: State.credentials.geminiApiKey
          })
        });
        const pData = await pRes.json();
        if (pData.success) {
          badge.innerHTML = `✓ Palavra-chave encontrada na Posição #${pData.position} no Google.`;
        } else {
          throw new Error(pData.error);
        }
        break;

      case 'backlinks':
        if (!action.params || !action.params.domain) {
          badge.style.color = 'var(--danger)';
          badge.innerHTML = `⚠️ Erro: Domínio de destino necessário.`;
          break;
        }
        badge.innerHTML = `🔗 Analisando backlinks de ${action.params.domain}...`;
        showView('backlinkTracker');
        const bRes = await fetch('/api/analyze-backlinks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domain: action.params.domain,
            geminiApiKey: State.credentials.geminiApiKey
          })
        });
        const bData = await bRes.json();
        if (bData.success) {
          badge.innerHTML = `✓ Análise finalizada. Encontrados ${bData.backlinks ? bData.backlinks.length : 0} backlinks relevantes.`;
        } else {
          throw new Error(bData.error);
        }
        break;

      case 'generate-single':
        if (!action.params || !action.params.theme) {
          badge.style.color = 'var(--danger)';
          badge.innerHTML = `⚠️ Erro: Tema do artigo em falta.`;
          break;
        }
        badge.innerHTML = `✍️ Preenchendo campos de geração para o tema: ${action.params.theme}...`;
        showView('newSite');
        const themeInput = document.getElementById('new-site-niche');
        const descInput = document.getElementById('new-site-description');
        if (themeInput) themeInput.value = action.params.theme;
        if (descInput && action.params.themeDescription) descInput.value = action.params.themeDescription;
        badge.innerHTML = `✓ Campos preenchidos na seção Criar Blog.`;
        break;

      default:
        badge.style.color = 'var(--danger)';
        badge.innerHTML = `⚠️ Ação não suportada: ${action.type}`;
    }
  } catch (err) {
    console.error('Safira action error:', err);
    badge.style.color = 'var(--danger)';
    badge.style.borderColor = 'rgba(239, 68, 68, 0.3)';
    badge.innerHTML = `⚠️ Falha ao executar ação: ${err.message}`;
  }
}

function sendSafiraSuggestion(text) {
  const input = document.getElementById('safira-chat-input');
  if (input) {
    input.value = text;
    const form = document.getElementById('safira-chat-form');
    if (form) {
      // Dispatch submit event
      const event = new Event('submit', { cancelable: true });
      form.dispatchEvent(event);
    }
  }
}

function tourClearAllHighlights() {
  document.querySelectorAll('.tour-highlight').forEach(el => {
    el.classList.remove('tour-highlight');
  });
  document.querySelectorAll('.tour-arrow-indicator').forEach(el => {
    el.remove();
  });
}

window.tourClearAllHighlights = tourClearAllHighlights;

function tourHighlightElement(selector, arrowText, position = 'top') {
  tourClearAllHighlights();
  
  const element = document.querySelector(selector);
  if (!element) return;
  
  element.classList.add('tour-highlight');
  
  const indicator = document.createElement('div');
  indicator.className = `tour-arrow-indicator arrow-${position}`;
  indicator.innerText = arrowText;
  document.body.appendChild(indicator);
  
  const rect = element.getBoundingClientRect();
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  let indicatorLeft = 0;
  let indicatorTop = 0;
  
  if (position === 'top') {
    indicatorLeft = rect.left + rect.width / 2 + scrollLeft;
    indicatorTop = rect.top + scrollTop - 45;
  } else if (position === 'bottom') {
    indicatorLeft = rect.left + rect.width / 2 + scrollLeft;
    indicatorTop = rect.bottom + scrollTop + 15;
  } else if (position === 'left') {
    indicatorLeft = rect.left + scrollLeft - 150; // offset width approx
    indicatorTop = rect.top + rect.height / 2 + scrollTop - 15;
  } else if (position === 'right') {
    indicatorLeft = rect.right + scrollLeft + 15;
    indicatorTop = rect.top + rect.height / 2 + scrollTop - 15;
  }
  
  indicator.style.left = `${indicatorLeft}px`;
  indicator.style.top = `${indicatorTop}px`;
  
  // Refine position dynamically after dimensions are known
  setTimeout(() => {
    if (position === 'top' || position === 'bottom') {
      indicator.style.left = `${rect.left + rect.width / 2 + scrollLeft - indicator.offsetWidth / 2}px`;
    } else if (position === 'left') {
      indicator.style.left = `${rect.left + scrollLeft - indicator.offsetWidth - 15}px`;
    }
function closeComeceRapidoComic() {
  tourClearAllHighlights();
  const existingBubble = document.getElementById('safira-hq-bubble');
  if (existingBubble) existingBubble.remove();
}

window.closeComeceRapidoComic = closeComeceRapidoComic;

// SETUP LISTENERS
document.addEventListener('DOMContentLoaded', () => {
  const openBtn = document.getElementById('open-safira-btn');
  const closeBtn = document.getElementById('safira-close-btn');
  const floatingBtn = document.getElementById('safira-floating-trigger');
  const comeceBtn = document.getElementById('comece-rapido-trigger');
  const backdrop = document.getElementById('safira-backdrop');
  const chatForm = document.getElementById('safira-chat-form');
  const chatInput = document.getElementById('safira-chat-input');

  if (openBtn) openBtn.addEventListener('click', (e) => { e.preventDefault(); openSafiraChat(); });
  if (closeBtn) closeBtn.addEventListener('click', closeSafiraChat);
  if (floatingBtn) floatingBtn.addEventListener('click', toggleSafiraChat);
  if (comeceBtn) comeceBtn.addEventListener('click', startComeceRapidoJourney);
  if (backdrop) backdrop.addEventListener('click', closeSafiraChat);

  if (chatForm) {
        if (!siloRepo) {
          badge.style.color = 'var(--danger)';
          badge.innerHTML = `⚠️ Erro: Repositório não especificado para reestruturação SILO.`;
          break;
        }
        badge.innerHTML = `📐 Reestruturando ${siloRepo} em SILO...`;
        showView('siloStructure');
        const sRes = await fetch('/api/restructure-silo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            repoName: siloRepo,
            niche: siloNiche,
            githubToken: State.credentials.githubToken,
            geminiApiKey: State.credentials.geminiApiKey,
            userEmail: State.user.email
          })
        });
        const sData = await sRes.json();
        if (sData.success) {
          badge.innerHTML = `✓ Arquitetura SILO gerada com sucesso para ${siloRepo}!`;
        } else {
          throw new Error(sData.error);
        }
        break;

      case 'google-position':
        if (!action.params || !action.params.domain || !action.params.keyword) {
          badge.style.color = 'var(--danger)';
          badge.innerHTML = `⚠️ Erro: Domínio e palavra-chave necessários.`;
          break;
        }
        badge.innerHTML = `🔍 Analisando posição de "${action.params.keyword}" para ${action.params.domain}...`;
        showView('sitePosition');
        const pRes = await fetch('/api/check-google-position', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domain: action.params.domain,
            keyword: action.params.keyword,
            geminiApiKey: State.credentials.geminiApiKey
          })
        });
        const pData = await pRes.json();
        if (pData.success) {
          badge.innerHTML = `✓ Palavra-chave encontrada na Posição #${pData.position} no Google.`;
        } else {
          throw new Error(pData.error);
        }
        break;

      case 'backlinks':
        if (!action.params || !action.params.domain) {
          badge.style.color = 'var(--danger)';
          badge.innerHTML = `⚠️ Erro: Domínio de destino necessário.`;
          break;
        }
        badge.innerHTML = `🔗 Analisando backlinks de ${action.params.domain}...`;
        showView('backlinkTracker');
        const bRes = await fetch('/api/analyze-backlinks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domain: action.params.domain,
            geminiApiKey: State.credentials.geminiApiKey
          })
        });
        const bData = await bRes.json();
        if (bData.success) {
          badge.innerHTML = `✓ Análise finalizada. Encontrados ${bData.backlinks ? bData.backlinks.length : 0} backlinks relevantes.`;
        } else {
          throw new Error(bData.error);
        }
        break;

      case 'generate-single':
        if (!action.params || !action.params.theme) {
          badge.style.color = 'var(--danger)';
          badge.innerHTML = `⚠️ Erro: Tema do artigo em falta.`;
          break;
        }
        badge.innerHTML = `✍️ Preenchendo campos de geração para o tema: ${action.params.theme}...`;
        showView('newSite');
        const themeInput = document.getElementById('new-site-niche');
        const descInput = document.getElementById('new-site-description');
        if (themeInput) themeInput.value = action.params.theme;
        if (descInput && action.params.themeDescription) descInput.value = action.params.themeDescription;
        badge.innerHTML = `✓ Campos preenchidos na seção Criar Blog.`;
        break;

      default:
        badge.style.color = 'var(--danger)';
        badge.innerHTML = `⚠️ Ação não suportada: ${action.type}`;
    }
  } catch (err) {
    console.error('Safira action error:', err);
    badge.style.color = 'var(--danger)';
    badge.style.borderColor = 'rgba(239, 68, 68, 0.3)';
    badge.innerHTML = `⚠️ Falha ao executar ação: ${err.message}`;
  }
}

function sendSafiraSuggestion(text) {
  const input = document.getElementById('safira-chat-input');
  if (input) {
    input.value = text;
    const form = document.getElementById('safira-chat-form');
    if (form) {
      // Dispatch submit event
      const event = new Event('submit', { cancelable: true });
      form.dispatchEvent(event);
    }
  }
}

function tourClearAllHighlights() {
  document.querySelectorAll('.tour-highlight').forEach(el => {
    el.classList.remove('tour-highlight');
  });
  document.querySelectorAll('.tour-arrow-indicator').forEach(el => {
    el.remove();
  });
}

window.tourClearAllHighlights = tourClearAllHighlights;

function tourHighlightElement(selector, arrowText, position = 'top') {
  tourClearAllHighlights();
  
  const element = document.querySelector(selector);
  if (!element) return;
  
  element.classList.add('tour-highlight');
  
  const indicator = document.createElement('div');
  indicator.className = `tour-arrow-indicator arrow-${position}`;
  indicator.innerText = arrowText;
  document.body.appendChild(indicator);
  
  const rect = element.getBoundingClientRect();
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  let indicatorLeft = 0;
  let indicatorTop = 0;
  
  if (position === 'top') {
    indicatorLeft = rect.left + rect.width / 2 + scrollLeft;
    indicatorTop = rect.top + scrollTop - 45;
  } else if (position === 'bottom') {
    indicatorLeft = rect.left + rect.width / 2 + scrollLeft;
    indicatorTop = rect.bottom + scrollTop + 15;
  } else if (position === 'left') {
    indicatorLeft = rect.left + scrollLeft - 150; // offset width approx
    indicatorTop = rect.top + rect.height / 2 + scrollTop - 15;
  } else if (position === 'right') {
    indicatorLeft = rect.right + scrollLeft + 15;
    indicatorTop = rect.top + rect.height / 2 + scrollTop - 15;
  }
  
  indicator.style.left = `${indicatorLeft}px`;
  indicator.style.top = `${indicatorTop}px`;
  
  // Refine position dynamically after dimensions are known
  setTimeout(() => {
    if (position === 'top' || position === 'bottom') {
      indicator.style.left = `${rect.left + rect.width / 2 + scrollLeft - indicator.offsetWidth / 2}px`;
    } else if (position === 'left') {
      indicator.style.left = `${rect.left + scrollLeft - indicator.offsetWidth - 15}px`;
    }
  });
}

function closeComeceRapidoComic() {
  tourClearAllHighlights();
  const existingBubble = document.getElementById('safira-hq-bubble');
  if (existingBubble) existingBubble.remove();
}

window.closeComeceRapidoComic = closeComeceRapidoComic;

// SETUP LISTENERS
document.addEventListener('DOMContentLoaded', () => {
  const openBtn = document.getElementById('open-safira-btn');
  const closeBtn = document.getElementById('safira-close-btn');
  const floatingBtn = document.getElementById('safira-floating-trigger');
  const comeceBtn = document.getElementById('comece-rapido-trigger');
  const backdrop = document.getElementById('safira-backdrop');
  const chatForm = document.getElementById('safira-chat-form');
  const chatInput = document.getElementById('safira-chat-input');

  if (openBtn) openBtn.addEventListener('click', (e) => { e.preventDefault(); openSafiraChat(); });
  if (closeBtn) closeBtn.addEventListener('click', closeSafiraChat);
  if (floatingBtn) floatingBtn.addEventListener('click', toggleSafiraChat);
  if (comeceBtn) comeceBtn.addEventListener('click', startComeceRapidoJourney);
  if (backdrop) backdrop.addEventListener('click', closeSafiraChat);

  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const messageText = chatInput.value.trim();
      if (messageText) {
        chatInput.value = '';
        sendSafiraMessage(messageText);
      }
    });
  }

  // Hook suggestions
  const sugLego = document.getElementById('safira-sug-lego');
  const sugBackup = document.getElementById('safira-sug-backup');
  const sugSilo = document.getElementById('safira-sug-silo');
  const sugSeo = document.getElementById('safira-sug-seo');

  if (sugLego) sugLego.addEventListener('click', () => sendSafiraSuggestion('Como o Agente Lego funciona?'));
  if (sugBackup) sugBackup.addEventListener('click', () => sendSafiraSuggestion('Fazer backup Neto Salva'));
  if (sugSilo) sugSilo.addEventListener('click', () => sendSafiraSuggestion('Quero reestruturar o silo de um dos meus blogs'));
  if (sugSeo) sugSeo.addEventListener('click', () => sendSafiraSuggestion('Como verificar meu posicionamento no Google?'));

  // Comece Rápido interactive page hooks
  const wizardForm = document.getElementById('wizard-form');
  if (wizardForm) {
    wizardForm.addEventListener('submit', () => {
      if (window.comeceRapidoState && window.comeceRapidoState.active && window.comeceRapidoState.step === 2) {
        window.comeceRapidoState.createdBlog = true;
        setTimeout(() => {
          advanceComeceRapidoComic(3);
        }, 1500);
      }
    });
  }

  const btnGetIdeas = document.getElementById('btn-get-ideas');
  if (btnGetIdeas) {
    btnGetIdeas.addEventListener('click', () => {
      if (window.comeceRapidoState && window.comeceRapidoState.active && window.comeceRapidoState.step === 3) {
        window.comeceRapidoState.generatedTitles = true;
        setTimeout(() => {
          advanceComeceRapidoComic(4);
        }, 2000);
      }
    });
  }

  const btnAnalyzeSilo = document.getElementById('btn-analyze-silo');
  if (btnAnalyzeSilo) {
    btnAnalyzeSilo.addEventListener('click', () => {
      if (window.comeceRapidoState && window.comeceRapidoState.active && window.comeceRapidoState.step === 4) {
        window.comeceRapidoState.structuredSilo = true;
        setTimeout(() => {
          advanceComeceRapidoComic(5);
        }, 1500);
      }
    });
  }

  const btnAnalyzePosition = document.getElementById('btn-analyze-position');
  if (btnAnalyzePosition) {
    btnAnalyzePosition.addEventListener('click', () => {
      if (window.comeceRapidoState && window.comeceRapidoState.active && window.comeceRapidoState.step === 5) {
        window.comeceRapidoState.trackedPosition = true;
        setTimeout(() => {
          advanceComeceRapidoComic(6);
        }, 1500);
      }
    });
  }

  const btnCreateBackup = document.getElementById('btn-create-backup');
  if (btnCreateBackup) {
    btnCreateBackup.addEventListener('click', () => {
      if (window.comeceRapidoState && window.comeceRapidoState.active && window.comeceRapidoState.step === 6) {
        window.comeceRapidoState.backedUp = true;
        setTimeout(() => {
          finishComeceRapidoComic();
        }, 2000);
      }
    });
  }
});

// --- NICHE SELECTOR ENGINE & DATA ---

const NicheData = {
  macro: [
    {
      id: 'health',
      name: 'Saúde & Bem-estar',
      icon: '❤️',
      desc: 'Um mercado eterno focado em longevidade, performance física, mental e bem-estar geral.',
      subs: [
        {
          id: 'sleep',
          name: 'Sono & Saúde do Sono',
          icon: '💤',
          desc: 'Aparelhos, travesseiros e rastreadores para melhorar a qualidade do sono.',
          micros: [
            {
              name: 'Travesseiros e Acessórios para Quem Dorme de Lado',
              desc: 'Foco exclusivo em reviews de travesseiros ergonômicos, colchões e suportes corporais voltados para a postura de dormir de lado (Side Sleepers), que representa mais de 60% da população mundial.',
              lucratividade: 'Altas comissões com afiliação da Amazon, parcerias diretas com marcas de colchões D2C (ex: Emma, Casper) e anúncios de alta receita (Mediavine/Raptive).',
              caseStudy: {
                site: 'Sleepopolis.com',
                earnings: 'Adquirido por mais de US$ 5 milhões',
                strategy: 'Reviews aprofundados de colchões usando testes reais com vídeo e dados detalhados de firmeza e pressão.'
              },
              details: [
                'Foco em termos informativos: "melhor travesseiro de corpo para quem dorme de lado", "dor no ombro ao dormir de lado".',
                'Público qualificado buscando resolver dores crônicas de postura.',
                'Alta conversão de afiliação devido ao valor elevado dos colchões sugeridos.'
              ]
            }
          ]
        },
        {
          id: 'home-gym',
          name: 'Academia em Casa',
          icon: '🏋️',
          desc: 'Equipamentos compactos e rotinas para treinar sem sair de casa.',
          micros: [
            {
              name: 'Halteres Ajustáveis e Equipamentos Compactos para Apartamento',
              desc: 'Reviews de equipamentos de musculação inteligentes e modulares que economizam espaço físico em apartamentos e pequenos estúdios.',
              lucratividade: 'Excelentes comissões na Amazon e marketplaces nacionais. Ticket médio alto com halteres ajustáveis e bancos dobráveis.',
              caseStudy: {
                site: 'GarageGymReviews.com',
                earnings: 'Faturamento estimado de +US$ 300K/mês',
                strategy: 'Comparativos extremamente detalhados com fotos e testes práticos de durabilidade sob condições extremas.'
              },
              details: [
                'Artigos focados em: "melhores halteres ajustáveis para apartamento", "equipamentos de calistenia compactos".',
                'Público urbano de classe média com alta intenção de compra imediata.',
                'Baixa devolução de produtos devido a análises reais que eliminam surpresas.'
              ]
            }
          ]
        },
        {
          id: 'biohacking',
          name: 'Biohacking & Longevidade',
          icon: '🧬',
          desc: 'Técnicas de otimização biológica e envelhecimento saudável.',
          micros: [
            {
              name: 'Terapia de Luz Vermelha Portátil',
              desc: 'Dispositivos domésticos de luz infravermelha para recuperação celular e rejuvenescimento.',
              lucratividade: 'Alta margem em e-commerce próprio ou afiliação de marcas premium.',
              caseStudy: { site: 'BenGreenfieldLife.com', earnings: '+US$ 150K/mês', strategy: 'Testes de auto-otimização biológica.' },
              details: ['Guias de uso de luz vermelha em casa.', 'Nicho de alta renda.']
            }
          ]
        },
        {
          id: 'mental-health',
          name: 'Saúde Mental & Meditação',
          icon: '🧘',
          desc: 'Cadernos, diários e acessórios de atenção plena.',
          micros: [
            {
              name: 'Diários de Gratidão Guiados',
              desc: 'Livros físicos de anotação diária com perguntas focadas em psicologia positiva.',
              lucratividade: 'Excelente margem com impressão sob demanda ou produtos próprios.',
              caseStudy: { site: 'DailyStoic.com', earnings: '+US$ 250K/mês', strategy: 'Produção de conteúdo histórico aplicado ao dia a dia.' },
              details: ['Foco em mindfulness e rotinas matinais.', 'Baixo custo de produção.']
            }
          ]
        },
        {
          id: 'air-purification',
          name: 'Alergias & Purificação',
          icon: '🍃',
          desc: 'Equipamentos e soluções para limpeza e qualidade do ar.',
          micros: [
            {
              name: 'Filtros HEPA para Donos de Pets',
              desc: 'Foco em purificadores e filtros para eliminar ácaros, pelos e poeira do ambiente.',
              lucratividade: 'Comissões recorrentes com refis de filtros de reposição.',
              caseStudy: { site: 'HouseFresh.com', earnings: '+US$ 60K/mês', strategy: 'Testes independentes com detector de partículas.' },
              details: ['Reviews transparentes de aparelhos de filtragem.', 'Foco em donos de pets alérgicos.']
            }
          ]
        },
        {
          id: 'yoga',
          name: 'Yoga & Flexibilidade',
          icon: '🤸',
          desc: 'Tapetes, blocos e acessórios de alta performance.',
          micros: [
            {
              name: 'Tapetes de Yoga Ecológicos Extra Grossos',
              desc: 'Tapetes antiderrapantes biodegradáveis com amortecimento reforçado para articulações.',
              lucratividade: 'Afiliação de marcas ecológicas premium e venda de acessórios complementares.',
              caseStudy: { site: 'YogaJournal.com', earnings: 'Milionário (Ad network + Afiliação)', strategy: 'Tutoriais de posturas vinculados a reviews de acessórios.' },
              details: ['Termos: "melhor tapete de yoga para dor no joelho", "mat ecológico".', 'Audiência extremamente engajada e fiel.']
            }
          ]
        },
        {
          id: 'sports-nutrition',
          name: 'Nutrição Esportiva',
          icon: '🥤',
          desc: 'Suplementação alimentar focada em performance e saúde.',
          micros: [
            {
              name: 'Suplementos Veganos para Hipertrofia',
              desc: 'Proteínas isoladas vegetais, creatinas limpas e blends de superalimentos para atletas veganos.',
              lucratividade: 'Clubs de assinatura recorrentes e cupons exclusivos com grandes distribuidoras.',
              caseStudy: { site: 'BarBend.com', earnings: 'Adquirido por valor multimilionário', strategy: 'Reviews científicos com testes de sabor e solubilidade.' },
              details: ['Keywords: "melhor whey vegano para ganho de massa", "creatina vegetal funciona".', 'Público com alto consumo recorrente mensal.']
            }
          ]
        },
        {
          id: 'workplace-ergonomics',
          name: 'Ergonomia no Trabalho',
          icon: '🪑',
          desc: 'Suportes, apoios e cadeiras ergonômicas para escritório.',
          micros: [
            {
              name: 'Cadeiras Ergonômicas para Quem Tem Dor Lombar',
              desc: 'Reviews de cadeiras de escritório profissionais e ajustes corretos de postura.',
              lucratividade: 'Comissões muito altas devido ao ticket elevado de cadeiras ergonômicas (R$ 1.500 a R$ 6.000).',
              caseStudy: { site: 'BTOD.com', earnings: 'Faturamento milionário com e-commerce + conteúdo', strategy: 'Comparativos em vídeo desmontando as cadeiras para avaliar a mecânica interna.' },
              details: ['Keywords: "cadeira de escritório para hernia de disco", "ergonomia home office".', 'Alta conversão devido à necessidade médica de alívio de dor.']
            }
          ]
        },
        {
          id: 'restrictive-diets',
          name: 'Dietas Restritivas',
          icon: '🍞',
          desc: 'Receitas e produtos sem glúten, lactose ou açúcar.',
          micros: [
            {
              name: 'Panificação Sem Glúten para Iniciantes',
              desc: 'Técnicas de fermentação, farinhas especiais e receitas de pães sem glúten perfeitos.',
              lucratividade: 'Venda de e-books de receitas próprios, cursos online de panificação e afiliação de batedeiras.',
              caseStudy: { site: 'GlutenFreeOnAShoeString.com', earnings: '+US$ 45K/mês', strategy: 'Receitas de substituição de ingredientes com explicações científicas simples.' },
              details: ['Keywords: "pão sem glúten fofinho receita", "farinha substituta para trigo".', 'Forte conexão emocional e fidelidade do público celíaco.']
            }
          ]
        },
        {
          id: 'oral-health',
          name: 'Saúde Oral',
          icon: '🪥',
          desc: 'Aparelhos sônicos e higiene avançada.',
          micros: [
            {
              name: 'Escovas de Dente Sônicas e Irrigadores Bucais',
              desc: 'Reviews detalhados de tecnologia para limpeza interdental profunda em casa.',
              lucratividade: 'Afiliação forte e anúncios de fabricantes que patrocinam testes.',
              caseStudy: { site: 'ElectricTeeth.com', earnings: '+US$ 30K/mês', strategy: 'Testes de escovação com placas de revelação de bactérias.' },
              details: ['Keywords: "melhor irrigador bucal portátil", "escova sônica philips vs oral-b".', 'Público buscando tratamentos preventivos de saúde.']
            }
          ]
        }
      ]
    },
    {
      id: 'home',
      name: 'Casa & Cozinha',
      icon: '🍳',
      desc: 'O nicho ideal para review de eletrodomésticos, decoração e itens práticos de dia a dia.',
      subs: [
        {
          id: 'appliances',
          name: 'Eletrodomésticos Específicos',
          icon: '🔌',
          desc: 'Reviews e receitas focados em aparelhos de cozinha modernos.',
          micros: [
            {
              name: 'Acessórios e Receitas de Air Fryer para Idosos',
              desc: 'Blog nichado em ensinar idosos e solteiros a usar a Air Fryer com receitas simplificadas de poucos passos e reviews dos melhores acessórios (formas de silicone, grelhas, etc.).',
              lucratividade: 'Anúncios premium, links de afiliados para utensílios e venda de e-books de receitas com fontes grandes e legíveis.',
              caseStudy: {
                site: 'AirFryerWorld.com',
                earnings: 'Faturamento estimado de +US$ 80K/mês',
                strategy: 'Receitas passo a passo ultra explicadas e com fotos em alta definição dos pratos antes, durante e depois.'
              },
              details: [
                'Foco em: "receitas rápidas na airfryer para duas pessoas", "melhor forma de silicone para fritadeira elétrica".',
                'Altíssimo volume de tráfego recorrente focado em receitas diárias.',
                'Engajamento de comunidade muito forte (compartilhamento em grupos de família).'
              ]
            }
          ]
        },
        {
          id: 'coffee',
          name: 'Cafeteiras e Cultura de Café',
          icon: '☕',
          desc: 'Reviews de moedores, grãos e cafeteiras de nível barista.',
          micros: [
            {
              name: 'Moedores Manuais de Alta Precisão e Cafeteiras Expresso Manuais',
              desc: 'Análises detalhadas de equipamentos manuais e baristas residenciais para entusiastas do café especial de alta qualidade.',
              lucratividade: 'Parcerias com importadoras de grãos, afiliação de equipamentos de metal premium com ótimas margens.',
              caseStudy: {
                site: 'Home-Barista.com',
                earnings: 'Faturamento estimado de +US$ 50K/mês',
                strategy: 'Comunidade forte integrada ao blog que gera autoridade imbatível e tráfego orgânico nativo.'
              },
              details: [
                'Keywords: "melhor moedor de café manual para expresso", "como regular cafeteira gaggia classic".',
                'Nicho de entusiastas que não hesitam em gastar R$ 500+ em um único acessório.',
                'Fidelização de leitores altíssima.'
              ]
            }
          ]
        },
        {
          id: 'urban-gardening',
          name: 'Jardinagem Urbana',
          icon: '🌱',
          desc: 'Hortas inteligentes e plantas em pequenos espaços.',
          micros: [
            {
              name: 'Hortas Hidropônicas Inteligentes para Apartamento',
              desc: 'Reviews de sistemas automáticos de cultivo indoor por água com luzes LED integradas.',
              lucratividade: 'Venda de sementes, nutrientes e afiliação de marcas famosas como Click & Grow ou AeroGarden.',
              caseStudy: { site: 'EpicGardening.com', earnings: '+US$ 500K/mês (atualmente expansivo)', strategy: 'Vídeos práticos e artigos com foco em auto-suficiência urbana.' },
              details: ['Keywords: "como plantar alface no apartamento", "melhor horta hidroponica".', 'Grande apelo visual e focado em bem-estar.']
            }
          ]
        },
        {
          id: 'barbecue',
          name: 'Churrasco & Defumação',
          icon: '🍖',
          desc: 'Grelhas, carvão e defumadores para quintal.',
          micros: [
            {
              name: 'Defumadores de Pellets de Madeira Portáteis',
              desc: 'Reviews de equipamentos de defumação lenta para entusiastas de carnes defumadas em áreas externas compactas.',
              lucratividade: 'Comissões altas com afiliação de churrasqueiras e pellets recorrentes.',
              caseStudy: { site: 'AmazingRibs.com', earnings: '+US$ 120K/mês', strategy: 'Testes de física e termodinâmica aplicados a cortes de carne.' },
              details: ['Keywords: "melhor defumador de pellet", "como defumar costela barbecue".', 'Público com alto poder de compra focado em hobbies gastronômicos.']
            }
          ]
        },
        {
          id: 'home-pizza',
          name: 'Pizza em Casa',
          icon: '🍕',
          desc: 'Fornos e utensílios para pizzaiolos amadores.',
          micros: [
            {
              name: 'Fornos de Pizza Portáteis a Gás e Lenha',
              desc: 'Análises de fornos compactos externos (tipo Ooni) e técnicas de fermentação de massa de longa maturação.',
              lucratividade: 'Altas comissões de venda direta de fornos (ticket médio R$ 3.000+).',
              caseStudy: { site: 'PizzaOvenRadar.com', earnings: '+US$ 25K/mês', strategy: 'Comparativos e reviews de temperatura máxima dos fornos portáteis.' },
              details: ['Keywords: "forno ooni koda vale a pena", "receita massa neapolitana".', 'Grande apelo em redes sociais e tráfego visual.']
            }
          ]
        },
        {
          id: 'pantry-org',
          name: 'Organização de Despensas',
          icon: '🥫',
          desc: 'Recipientes e organizadores plásticos e de vidro.',
          micros: [
            {
              name: 'Potes Herméticos Empilháveis Livres de BPA',
              desc: 'Reviews de potes de acrílico e vidro borossilicato para organização visual da cozinha.',
              lucratividade: 'Parcerias com marcas de utilidades domésticas e links afiliados da Amazon de alta conversão.',
              caseStudy: { site: 'TheHomeEdit.com', earnings: 'Negócio multimilionário (parceria Netflix)', strategy: 'Estética de cores do arco-íris e fotos antes/depois impecáveis.' },
              details: ['Keywords: "melhores potes herméticos empilháveis", "como organizar despensa".', 'Forte tráfego no Pinterest e Instagram.']
            }
          ]
        },
        {
          id: 'home-fermentation',
          name: 'Fermentação Artesanal',
          icon: '🥛',
          desc: 'Bebidas e conservas fermentadas saudáveis.',
          micros: [
            {
              name: 'Kits para Fermentação de Kombucha em Casa',
              desc: 'Reviews de vidros, Scoby e termômetros para produção segura de Kombucha.',
              lucratividade: 'Venda de kits próprios e e-books de saborização.',
              caseStudy: { site: 'KombuchaKamp.com', earnings: '+US$ 40K/mês', strategy: 'Autoridade educacional sobre segurança bacteriológica de fermentados.' },
              details: ['Keywords: "como fazer scoby de kombucha", "kombucha caseira segunda fermentação".', 'Alta retenção de usuários devido a processos recorrentes.']
            }
          ]
        },
        {
          id: 'minimalist-decor',
          name: 'Decoração Minimalista',
          icon: '🛋️',
          desc: 'Mobiliário leve e sustentável para ambientes integrados.',
          micros: [
            {
              name: 'Organizadores Multifuncionais de Bambu',
              desc: 'Reviews de gaveteiros, prateleiras e suportes ecológicos feitos de madeira de bambu.',
              lucratividade: 'Afiliação de marcas de móveis e vendas diretas de dropshipping de nicho.',
              caseStudy: { site: 'MinimalistHome.com', earnings: '+US$ 60K/mês', strategy: 'Design minimalista focado em sustentabilidade e eliminação de excessos.' },
              details: ['Keywords: "organizador de gavetas bambu", "decoracao minimalista sustentavel".', 'Público que busca sofisticação aliada à ecologia.']
            }
          ]
        },
        {
          id: 'cleaning-automation',
          name: 'Automação de Limpeza',
          icon: '🧹',
          desc: 'Dispositivos inteligentes de faxina e aspiração.',
          micros: [
            {
              name: 'Robôs Aspiradores com Mapeamento LiDAR',
              desc: 'Comparativos detalhados de sensores, poder de sucção e sistemas de passagem de pano autônomos.',
              lucratividade: 'Altas margens afiliadas da Amazon e marcas parceiras de tecnologia.',
              caseStudy: { site: 'VacuumWars.com', earnings: '+US$ 150K/mês', strategy: 'Vídeos extremamente técnicos testando a sucção em diferentes tipos de carpetes.' },
              details: ['Keywords: "melhor robo aspirador que mapeia casa", "robo aspirador lidar".', 'Público com alto poder de compra querendo economizar tempo de tarefas domésticas.']
            }
          ]
        },
        {
          id: 'functional-kitchen',
          name: 'Cozinha Funcional',
          icon: '🔪',
          desc: 'Facas e cutelaria culinária de precisão.',
          micros: [
            {
              name: 'Facas de Aço Damasco para Chefs Amadores',
              desc: 'Guia de afiação com pedra d\'água e reviews de facas artesanais de alto padrão.',
              lucratividade: 'Venda direta de pedras de afiar exclusivas e parcerias com cuteleiros.',
              caseStudy: { site: 'ChefSteps.com', earnings: 'Adquirido por grande fabricante', strategy: 'Fotografia macro espetacular dos cortes e uso de slowmotion.' },
              details: ['Keywords: "melhor faca do chef aço damasco", "como afiar faca com pedra".', 'Público apaixonado por gastronomia profissional e gastronomia em casa.']
            }
          ]
        }
      ]
    },
    {
      id: 'tech',
      name: 'Tecnologia & Games',
      icon: '🎮',
      desc: 'Reviews de eletrônicos, automação residencial e setups ergonômicos.',
      subs: [
        {
          id: 'smart-home',
          name: 'Casa Inteligente',
          icon: '🏠',
          desc: 'Configurações de automação e reviews de gadgets compatíveis.',
          micros: [
            {
              name: 'Dispositivos e Automações Exclusivas para Apple HomeKit',
              desc: 'Reviews de lâmpadas, fechaduras e sensores compatíveis 100% com o ecossistema Apple HomeKit e Siri.',
              lucratividade: 'Público Apple com altíssimo poder aquisitivo. Comissões de produtos premium (fechaduras de R$ 1.500+).',
              caseStudy: {
                site: 'HomeKitAuthority.com',
                earnings: 'Faturamento estimado de +US$ 40K/mês',
                strategy: 'Guias práticos de solução de problemas e novidades em tempo recorde sobre atualizações do ecossistema.'
              },
              details: [
                'Termos chaves: "melhor fechadura compatível com apple homekit", "como automatizar luzes pela siri".',
                'Público fiel ao ecossistema Apple que consome muitos gadgets complementares.',
                'Baixa concorrência em comparação a Alexa/Google Home geral.'
              ]
            }
          ]
        },
        {
          id: 'ergonomics',
          name: 'Teclados & Ergonomia',
          icon: '⌨️',
          desc: 'Acessórios de mesa, mouses e teclados mecânicos ergonômicos.',
          micros: [
            {
              name: 'Teclados Mecânicos Bipartidos (Split Keyboards) e Ergonomia',
              desc: 'Análises e guias de montagem para teclados mecânicos bipartidos que previnem L.E.R. e oferecem conforto supremo no home office.',
              lucratividade: 'Venda de peças customizadas, cabos premium, afiliação de marcas de nicho ergonômico.',
              caseStudy: {
                site: 'SwitchAndClick.com',
                earnings: 'Faturamento de +US$ 100K/mês (adquirido posteriormente)',
                strategy: 'Reviews em vídeo comparando o som e a digitação de diferentes interruptores (switches) e designs.'
              },
              details: [
                'Buscas comuns: "melhor teclado ergonômico bipartido", "como programar layout ergodox".',
                'Público composto por programadores e escritores dispostos a investir em saúde laboral.',
                'Ótimo nicho para monetizar com infoprodutos (tutoriais de solda/customização).'
              ]
            }
          ]
        },
        {
          id: 'hifi-audio',
          name: 'Áudio de Alta Fidelidade (Hi-Fi)',
          icon: '🎧',
          desc: 'Fones planares, amplificadores e áudio de estúdio.',
          micros: [
            {
              name: 'DACs Portáteis e Fones de Ouvido Planares',
              desc: 'Reviews de amplificadores de bolso e fones magnéticos planares para audição analógica de alta fidelidade em computadores e celulares.',
              lucratividade: 'Afiliação de marcas audiófilas de alta fidelidade com altas margens de lucro.',
              caseStudy: { site: 'Head-Fi.org', earnings: 'Faturamento multimilionário com anúncios e fórum patrocinado', strategy: 'Comunidade engajada e reviews com medição de espectro de áudio.' },
              details: ['Keywords: "melhor dac portatil para celular", "fones magnéticos planares baratas".', 'Público que investe milhares de reais em pequenos ganhos de áudio.']
            }
          ]
        },
        {
          id: 'streaming-setup',
          name: 'Setup de Transmissão',
          icon: '🎙️',
          desc: 'Microfones, iluminação e placas de captura de vídeo.',
          micros: [
            {
              name: 'Microfones XLR e Placas de Captura para Streamers de Console',
              desc: 'Reviews de mixers de áudio e placas de captura externa para streamers de PlayStation e Xbox.',
              lucratividade: 'Comissões altas com equipamentos de gravação de áudio e vídeo profissionais na Amazon e revendedores.',
              caseStudy: { site: 'GamingScan.com', earnings: '+US$ 80K/mês', strategy: 'Tutoriais de configuração passo a passo usando diagramas de conexão visual.' },
              details: ['Keywords: "melhor microfone xlr para iniciar stream", "placa de captura externa elgato".', 'Público jovem focado em criar canais com alta conversão.']
            }
          ]
        },
        {
          id: 'vr-tech',
          name: 'Realidade Virtual (VR)',
          icon: '🥽',
          desc: 'Acessórios e headsets de realidade virtual.',
          micros: [
            {
              name: 'Acessórios de Conforto para Meta Quest',
              desc: 'Reviews de alças de cabeça com bateria extra, protetores faciais de silicone e lentes de grau magnéticas para VR.',
              lucratividade: 'Parcerias com fabricantes terceiros de acessórios e links de afiliados da Amazon.',
              caseStudy: { site: 'UploadVR.com', earnings: '+US$ 50K/mês', strategy: 'Análises de conforto em sessões prolongadas de jogos de realidade virtual.' },
              details: ['Keywords: "melhor strap para meta quest 3", "acessorios conforto vr".', 'Nicho tecnológico com crescimento acelerado e sem concorrência local expressiva.']
            }
          ]
        },
        {
          id: 'wearable-health',
          name: 'Wearables de Saúde',
          icon: '⌚',
          desc: 'Anéis inteligentes e relógios biométricos.',
          micros: [
            {
              name: 'Smart Rings (Anéis Inteligentes) para Monitoramento de Sono',
              desc: 'Reviews aprofundados e comparativos entre anéis inteligentes que registram batimentos, temperatura e respiração.',
              lucratividade: 'Alta comissão por indicação de marcas diretas e cupons exclusivos.',
              caseStudy: { site: 'DC Rainmaker (seção Wearables)', earnings: '+US$ 110K/mês', strategy: 'Análises e gráficos sobrepostos comparando a precisão dos sensores contra aparelhos médicos.' },
              details: ['Keywords: "melhor anel inteligente sono", "oura ring vs ultra ring".', 'Público que prioriza dados de saúde e tem alto orçamento.']
            }
          ]
        },
        {
          id: '3d-printing',
          name: 'Impressão 3D',
          icon: '🖨️',
          desc: 'Impressoras FDM e resina para makers.',
          micros: [
            {
              name: 'Filamentos e Upgrades para Impressoras 3D de Resina',
              desc: 'Reviews de resinas laváveis em água, filtros de carvão ativo e telas de LCD de reposição.',
              lucratividade: 'Venda de arquivos STL de designs próprios e afiliação de impressoras de resina.',
              caseStudy: { site: 'All3DP.com', earnings: 'Faturamento milionário com anúncios e afiliados', strategy: 'Guias de calibração exaustivos e arquivos gratuitos prontos para imprimir.' },
              details: ['Keywords: "melhor resina para impressora 3d", "calibrar impressora resina".', 'Nicho de makers entusiastas com alto consumo mensal de matéria-prima.']
            }
          ]
        },
        {
          id: 'home-servers',
          name: 'Mini PCs & Servidores Caseiros',
          icon: '💾',
          desc: 'Servidores NAS e setups Plex domésticos.',
          micros: [
            {
              name: 'Servidores NAS para Backup Pessoal e Plex',
              desc: 'Guias de configuração de armazenamento em rede e streaming doméstico sem necessidade de nuvem paga.',
              lucratividade: 'Comissões excelentes com discos rígidos corporativos (HDDs de alta capacidade) e módulos NAS.',
              caseStudy: { site: 'NASCompares.com', earnings: '+US$ 70K/mês', strategy: 'Tabelas comparativas e análise de performance de decodificação de vídeo em tempo real.' },
              details: ['Keywords: "como montar servidor plex nas", "melhor nas para backup residencial".', 'Leitores qualificados e profissionais de TI com alto poder aquisitivo.']
            }
          ]
        },
        {
          id: 'portable-power',
          name: 'Energia Portátil',
          icon: '🔋',
          desc: 'Estações de energia e geradores solares compactos.',
          micros: [
            {
              name: 'Estações de Energia Solar Portáteis para Camping e Emergências',
              desc: 'Análises de geradores a bateria (tipo Jackery) recarregáveis com placas solares portáteis.',
              lucratividade: 'Altas comissões de produtos de alto valor (estações custando R$ 3.000 a R$ 15.000).',
              caseStudy: { site: 'Wirecutter (seção Portable Power)', earnings: 'Faturamento milionário', strategy: 'Testes práticos de descarga conectando geladeiras e furadeiras nas baterias.' },
              details: ['Keywords: "gerador solar portatil acampamento", "estacao de energia portatil recomendada".', 'Mercado em expansão nos nichos de camping, caravanismo e preparação de emergências.']
            }
          ]
        },
        {
          id: 'retrogaming',
          name: 'Retrogaming',
          icon: '🕹️',
          desc: 'Consoles clássicos e emuladores portáteis.',
          micros: [
            {
              name: 'Consoles Portáteis de Emulação Clássica',
              desc: 'Reviews de pequenos aparelhos portáteis modernos configurados para rodar jogos de consoles clássicos.',
              lucratividade: 'Afiliação robusta na Amazon/AliExpress e receita de anúncios em massa.',
              caseStudy: { site: 'RetroDodo.com', earnings: '+US$ 90K/mês', strategy: 'Fotografias macro lindíssimas dos aparelhos com alto apelo nostálgico.' },
              details: ['Keywords: "melhor portatil emulador retro", "anbernic reviews brasil".', 'Altíssimo engajamento orgânico de comunidade apaixonada por nostalgia.']
            }
          ]
        }
      ]
    },
    {
      id: 'pets',
      name: 'Animais de Estimação',
      icon: '🐾',
      desc: 'Reviews de alimentos, saúde, brinquedos e cuidados com raças específicas.',
      subs: [
        {
          id: 'dogs',
          name: 'Cães de Raça Específica',
          icon: '🐶',
          desc: 'Cuidados dedicados a uma única raça popular para dominar a autoridade no Google.',
          micros: [
            {
              name: 'Saúde, Dieta e Acessórios Especiais para Buldogue Francês',
              desc: 'Tudo sobre cuidados preventivos, problemas respiratórios, rações adequadas e coleiras ortopédicas para Buldogues Franceses.',
              lucratividade: 'Afiliação de rações premium, planos de saúde pet, brinquedos interativos e produtos de limpeza especializados.',
              caseStudy: {
                site: 'FrenchieJourney.com',
                earnings: 'Faturamento estimado de +US$ 20K/mês',
                strategy: 'Resolução de dúvidas médicas comuns ("por que buldogue francês solta muito pelo?") de forma empática.'
              },
              details: [
                'Consultas comuns: "melhor coleira peitoral para buldogue francês", "ração recomendada para buldogue filhote".',
                'Donos de cães de raça que tratam os pets como filhos e têm orçamento flexível.',
                'Extremamente fácil de posicionar no Google devido à especificidade da marca.'
              ]
            }
          ]
        },
        {
          id: 'aquarismo',
          name: 'Aquarismo Marinho',
          icon: '🐠',
          desc: 'Nano aquários e cultivo de corais exóticos.',
          micros: [
            {
              name: 'Nano Reef Aquariums e Cultivo de Corais Coloridos',
              desc: 'Guias e análises de equipamentos de filtragem, iluminação LED e suplementos para manter pequenos ecossistemas de corais marinhos em casa.',
              lucratividade: 'Afiliação de iluminação e filtros de alta tecnologia, banners de lojas especializadas e venda de mudas de corais cultivados.',
              caseStudy: {
                site: 'Reef2Rainforest.com',
                earnings: 'Faturamento estimado de +US$ 35K/mês',
                strategy: 'Conteúdo científico simplificado com passo a passo para ciclar a água e evitar pragas no aquário.'
              },
              details: [
                'Keywords: "melhor led para nano reef", "como eliminar algas marrons aquario marinho".',
                'Hobbies caros onde os praticantes compram itens de alto valor recorrente.',
                'Fácil diferenciação no Google por imagens e vídeos explicativos.'
              ]
            }
          ]
        },
        {
          id: 'natural-pet-food',
          name: 'Alimentação Natural Pet',
          icon: '🥩',
          desc: 'Dieta barf e alimentação caseira para cães.',
          micros: [
            {
              name: 'Receitas de Comida Caseira Desidratada para Cães Idosos',
              desc: 'Guia de cozimento e conservação de dietas naturais personalizadas para pets idosos.',
              lucratividade: 'Venda de guias nutricionais próprios e e-books em parceria com veterinários.',
              caseStudy: { site: 'DogsNaturallyMagazine.com', earnings: '+US$ 80K/mês', strategy: 'Defesa apaixonada contra alimentos ultraprocessados comerciais.' },
              details: ['Keywords: "receita comida natural caes idosos", "alimentacao natural barf".', 'Alta taxa de abertura em e-mails e engajamento em newsletters.']
            }
          ]
        },
        {
          id: 'maine-coon',
          name: 'Maine Coons (Gatos Gigantes)',
          icon: '🐈',
          desc: 'Alimentação e arranhadores gigantes para gatos exóticos.',
          micros: [
            {
              name: 'Arranhadores Reforçados e Nutrição para Gatos Maine Coon',
              desc: 'Reviews de arranhadores de alta resistência e rações ricas em glucosamina para gatos gigantes.',
              lucratividade: 'Afiliação de produtos simples da Amazon (arranhadores de R$ 800+) com excelentes comissões.',
              caseStudy: { site: 'MaineCoonFancy.com', earnings: '+US$ 25K/mês', strategy: 'Foco exclusivo na maior raça de gatos domésticos do mundo.' },
              details: ['Keywords: "arranhador gigante resistente maine coon", "melhor racao para maine coon".', 'Donos orgulhosos com alto envolvimento nas redes sociais.']
            }
          ]
        },
        {
          id: 'cockatiels',
          name: 'Aves & Calopsitas',
          icon: '🦜',
          desc: 'Gaiolas, rações e adestramento de aves domésticas.',
          micros: [
            {
              name: 'Brinquedos de Madeira Natural e Viveiros de Canto para Calopsitas',
              desc: 'Reviews de viveiros espaçosos e técnicas de enriquecimento ambiental para calopsitas mansas.',
              lucratividade: 'Indicação de fornecedores de sementes orgânicas e brinquedos seguros contra intoxicação.',
              caseStudy: { site: 'BirdTricks.com', earnings: '+US$ 45K/mês', strategy: 'Vídeos divertidos no YouTube ensinando truques complexos para calopsitas.' },
              details: ['Keywords: "gaiola ideal para calopsita mansa", "como ensinar calopsita a cantar".', 'Comunidade forte de donos de aves ornamentais.']
            }
          ]
        },
        {
          id: 'positive-training',
          name: 'Adestramento Positivo',
          icon: '🦴',
          desc: 'Métodos baseados em reforço positivo para cães.',
          micros: [
            {
              name: 'Clickers e Petiscos de Treinamento para Filhotes Hiperativos',
              desc: 'Reviews de acessórios de recompensa rápida e guias passo a passo de adestramento.',
              lucratividade: 'Venda de cursos de adestramento online próprios e afiliação de brinquedos interativos Kong.',
              caseStudy: { site: 'ClickerTraining.com', earnings: '+US$ 60K/mês', strategy: 'Uso de vídeos curtos demonstrando a mudança rápida de comportamento do cão.' },
              details: ['Keywords: "como usar clicker no adestramento", "petiscos saudaveis para filhote".', 'Foco em resolver problemas comportamentais urgentes de donos desesperados.']
            }
          ]
        },
        {
          id: 'cat-hygiene',
          name: 'Higiene de Gatos',
          icon: '🧼',
          desc: 'Caixas de areia inteligentes e areias biodegradáveis.',
          micros: [
            {
              name: 'Caixas de Areia Autolimpantes Elétricas',
              desc: 'Reviews honestos de caixas de areia automáticas que filtram detritos sozinhas e areias ecológicas.',
              lucratividade: 'Altas comissões por venda (aparelhos custam R$ 2.000+) e links afiliados de areias recorrentes.',
              caseStudy: { site: 'Catster.com (seção reviews)', earnings: '+US$ 100K/mês', strategy: 'Testes de eliminação de odor com sensores de amônia no ambiente.' },
              details: ['Keywords: "melhor caixa de areia automatica", "areia de mandioca para gatos".', 'Altíssima conversão devido à dor de limpar caixas manualmente.']
            }
          ]
        },
        {
          id: 'reptile-care',
          name: 'Répteis & Terrários',
          icon: '🦎',
          desc: 'Terrários, aquecimento e alimentação de iguanas e cobras.',
          micros: [
            {
              name: 'Lâmpadas UVB e Controladores de Temperatura para Terrários',
              desc: 'Reviews de lâmpadas UV para répteis, substratos seguros e termostatos de alta precisão.',
              lucratividade: 'Afiliação de marcas de terrários premium e publicidade contextual.',
              caseStudy: { site: 'ReptilesMagazine.com', earnings: 'Adquirido por grande rede de mídia', strategy: 'Guias de sobrevivência para manter répteis exóticos saudáveis em casa.' },
              details: ['Keywords: "lampada uvb ideal para jabuti", "como montar terrario gecko".', 'Nicho de colecionadores extremamente dedicados.']
            }
          ]
        },
        {
          id: 'traveling-pets',
          name: 'Pets Viajantes',
          icon: '🎒',
          desc: 'Acessórios e hotéis recomendados para viagens com cães.',
          micros: [
            {
              name: 'Caixas de Transporte de Pets Aprovadas para Voo (IATA)',
              desc: 'Reviews de marcas de caixas de transporte homologadas por companhias aéreas internacionais.',
              lucratividade: 'Comissões de itens caros de segurança aérea e cupons em seguros de viagem pet.',
              caseStudy: { site: 'BringFido.com', earnings: 'Faturamento milionário com reservas e parcerias', strategy: 'Banco de dados de hotéis e voos que aceitam cães no mundo todo.' },
              details: ['Keywords: "caixa de transporte pet iata aviao", "viajar com cachorro internacional".', 'Público apaixonado por pets com alto poder de consumo em turismo.']
            }
          ]
        },
        {
          id: 'rodents',
          name: 'Pequenos Roedores',
          icon: '🐹',
          desc: 'Porquinhos-da-índia, hamsters e gaiolas modulares.',
          micros: [
            {
              name: 'Gaiolas Modulares C&C e Feno Timothy para Porquinhos-da-Índia',
              desc: 'Reviews de gaiolas customizáveis e guias de saúde digestiva para roedores domésticos.',
              lucratividade: 'Afiliação de suprimentos da Amazon e e-commerce de acessórios próprios de tecido soft (fleece).',
              caseStudy: { site: 'GuineaPigCages.com', earnings: '+US$ 15K/mês', strategy: 'Fórum ativo e guias de construção de cercados caseiros.' },
              details: ['Keywords: "cercado cc porquinho da india", "alimentacao hamsters saudavel".', 'Baixa concorrência em português no Google.']
            }
          ]
        }
      ]
    },
    {
      id: 'hobbies',
      name: 'Hobbies & Outdoors',
      icon: '⛺',
      desc: 'Esportes de aventura, equipamentos de música e colecionáveis.',
      subs: [
        {
          id: 'cycling',
          name: 'Ciclismo Alternativo',
          icon: '🚲',
          desc: 'Bicicletas elétricas de carga, mountain bikes e cicloviagens.',
          micros: [
            {
              name: 'Bicicletas de Carga Elétricas para Famílias',
              desc: 'Reviews detalhados de bicicletas elétricas com caçambas para transporte de crianças, compras e cargas urbanas.',
              lucratividade: 'Ticket médio elevadíssimo (bicicletas custando entre R$ 8.000 e R$ 25.000). Altas comissões por venda.',
              caseStudy: {
                site: 'ElectricBikeReport.com',
                earnings: 'Faturamento milionário com publicidade e patrocínio de marcas',
                strategy: 'Testes práticos de autonomia de bateria subindo ladeiras reais com peso máximo suportado.'
              },
              details: [
                'Foco em buscas como: "melhor e-bike de carga familiar", "bicicleta elétrica para levar duas crianças".',
                'Nicho em ascensão explosiva com a transição verde de mobilidade urbana.',
                'Audiência qualificada de pais de classe média-alta preocupados com sustentabilidade.'
              ]
            }
          ]
        },
        {
          id: 'ultralight-backpacking',
          name: 'Trekking & Montanhismo',
          icon: '🥾',
          desc: 'Mochilas, barracas e equipamentos ultraleves.',
          micros: [
            {
              name: 'Mochilas e Barracas Ultraleves para Travessias Longas',
              desc: 'Reviews de equipamentos com peso abaixo de 1kg para trekking de longa distância (thru-hiking).',
              lucratividade: 'Comissões altas com equipamentos técnicos importados e links de afiliados da Amazon.',
              caseStudy: { site: 'OutdoorGearLab.com', earnings: 'Faturamento milionário corporativo', strategy: 'Testes em trilhas reais com pesagem milimétrica de cada item.' },
              details: ['Keywords: "barraca ultraleve menor que 1kg", "mochila de trekking leve".', 'Leitores entusiastas do montanhismo focados em comprar equipamentos de alta performance.']
            }
          ]
        },
        {
          id: 'birdwatching',
          name: 'Observação de Aves',
          icon: '🦅',
          desc: 'Binóculos, lunetas e guias de identificação de aves.',
          micros: [
            {
              name: 'Binóculos de Alta Definição (HD) para Observação de Aves',
              desc: 'Reviews de prismas ópticos, foco rápido e resistência à água de binóculos para birdwatching.',
              lucratividade: 'Afiliação de marcas de óptica premium (Nikon, Celestron) com ótimas margens.',
              caseStudy: { site: 'Audubon.org (seção gear)', earnings: 'Financia projetos globais através de afiliação e patrocínios', strategy: 'Testes de aberração cromática e conforto de lente.' },
              details: ['Keywords: "melhor binoculo para observar passaros", "lente de longo alcance aves".', 'Público de classe média-alta e aposentados ativos com alta renda.']
            }
          ]
        },
        {
          id: 'astronomy',
          name: 'Astronomia Amadora',
          icon: '🔭',
          desc: 'Telescópios e astrofotografia urbana.',
          micros: [
            {
              name: 'Telescópios Computadorizados (GoTo) para Astrofotografia',
              desc: 'Reviews de telescópios inteligentes que localizam constelações sozinhos no céu da cidade.',
              lucratividade: 'Excelentes comissões da Amazon e lojas ópticas especializadas (tacos médios de R$ 4.000+).',
              caseStudy: { site: 'SkyAndTelescope.org', earnings: 'Grandes receitas com rede de anúncios de astronomia', strategy: 'Tutoriais de calibração alinhados a links de compra de lentes e filtros.' },
              details: ['Keywords: "melhor telescopio motorizado goto", "como fotografar a lua com celular e telescopio".', 'Nicho de entusiastas apaixonados dispostos a investir pesado em ótica.']
            }
          ]
        },
        {
          id: 'flyfishing',
          name: 'Pesca com Mosca (Fly)',
          icon: '🎣',
          desc: 'Varas técnicas e iscas artesanais.',
          micros: [
            {
              name: 'Varas de Carbono e Iscas Artesanais para Fly Fishing',
              desc: 'Reviews de varas de pesca ultraleves e tutoriais de confecção de moscas artificiais (fly tying).',
              lucratividade: 'Afiliação de vestimentas impermeáveis (waders) e venda de iscas feitas à mão.',
              caseStudy: { site: 'FlyFisherman.com', earnings: 'Líder em receita de anúncios contextuais e guias turísticos de pesca', strategy: 'Fotografias incríveis de rios cristalinos e peixes gigantes.' },
              details: ['Keywords: "melhor vara de pescar mosca", "como atar isca de fly".', 'Esporte considerado de elite, com alta margem por comprador.']
            }
          ]
        },
        {
          id: 'overlanding',
          name: 'Camping Off-Road (Overland)',
          icon: '🚙',
          desc: 'Barracas de teto para carros e cozinhas de acampamento.',
          micros: [
            {
              name: 'Barracas de Teto para Carros SUVs e 4x4',
              desc: 'Reviews de barracas rígidas de acoplamento sobre teto do carro e acessórios de cozinha off-road.',
              lucratividade: 'Comissões altas devido a produtos de valor elevado (R$ 5.000 a R$ 15.000) e parcerias.',
              caseStudy: { site: 'OverlandJournal.com', earnings: 'Negócio de assinaturas impressas premium e rede afiliada', strategy: 'Testes de resistência a ventos de furacão e impermeabilidade.' },
              details: ['Keywords: "melhor barraca de teto automotiva", "equipamentos de overland 4x4".', 'Público que busca aventura off-road com alto poder aquisitivo.']
            }
          ]
        },
        {
          id: 'bushcraft',
          name: 'Bushcraft & Sobrevivência',
          icon: '🔪',
          desc: 'Facas, pederneiras e abrigo em matas.',
          micros: [
            {
              name: 'Facas Bushcraft de Aço de Carbono Feitas à Mão',
              desc: 'Reviews de ferramentas de corte para madeira, construção de abrigos selvagens e técnicas de fogo.',
              lucratividade: 'Venda de produtos próprios (isqueiros solares, facas) e afiliação de marcas tradicionais.',
              caseStudy: { site: 'BladeMag.com', earnings: '+US$ 80K/mês', strategy: 'Análises de dureza Rockwell de lâminas sob fadiga severa.' },
              details: ['Keywords: "melhor faca para bushcraft", "como iniciar fogo com pederneira".', 'Comunidade engajada com forte apelo estético no Instagram/YouTube.']
            }
          ]
        },
        {
          id: 'rock-climbing',
          name: 'Escalada Esportiva',
          icon: '🧗',
          desc: 'Sapatilhas, cordas e mosquetões de segurança.',
          micros: [
            {
              name: 'Sapatilhas de Escalada de Alta Aderência para Boulder',
              desc: 'Reviews de borracha aderente e ergonomia de sapatilhas de escalada indoor e outdoor.',
              lucratividade: 'Afiliação de marcas esportivas e parcerias com ginásios de escalada.',
              caseStudy: { site: 'Climbing.com', earnings: 'Líder corporativo em tráfego orgânico esportivo', strategy: 'Tutoriais de treino de força de dedos associados a reviews de hangboards.' },
              details: ['Keywords: "sapatilha de escalada boulder iniciante", "melhor corda de escalada".', 'Nicho olímpico em ascensão com público jovem e urbano.']
            }
          ]
        },
        {
          id: 'paddle-sports',
          name: 'Esportes de Remo',
          icon: '🛶',
          desc: 'Caiaques e pranchas de Stand Up Paddle portáteis.',
          micros: [
            {
              name: 'Caiaques Infláveis e Pranchas de Stand Up Paddle (SUP)',
              desc: 'Reviews de caiaques resistentes de PVC reforçado e pranchas fáceis de carregar no porta-malas.',
              lucratividade: 'Comissões excelentes com equipamentos de água (ticket R$ 2.000+).',
              caseStudy: { site: 'Paddling.com', earnings: '+US$ 110K/mês', strategy: 'Mapas de pontos de remo interativos associados a indicações de compra de caiaque.' },
              details: ['Keywords: "melhor caiaque inflavel para pesca", "prancha de stand up paddle portatil".', 'Público focado em lazer náutico no verão com alta propensão a comprar online.']
            }
          ]
        },
        {
          id: 'metal-detectors',
          name: 'Detecção de Metais',
          icon: '🪙',
          desc: 'Detectores de metal e caça ao tesouro.',
          micros: [
            {
              name: 'Detectores de Metal Subaquáticos para Busca de Ouro',
              desc: 'Reviews de bobinas de detecção e aparelhos à prova d\'água para busca de joias e relíquias em praias.',
              lucratividade: 'Comissões altas (aparelhos de detecção custam R$ 1.500+).',
              caseStudy: { site: 'MetalDetectingWorld.com', earnings: '+US$ 20K/mês', strategy: 'Relatos detalhados de buscas e fotos macro de moedas raras encontradas.' },
              details: ['Keywords: "melhor detector de metal ouro praia", "detector minelab reviews".', 'Hobby nostálgico com baixa concorrência e alto engajamento.']
            }
          ]
        }
      ]
    },
    {
      id: 'finance',
      name: 'Finanças & Carreira',
      icon: '💵',
      desc: 'Orçamento pessoal, investimentos, rendas extras e mobilidade internacional.',
      subs: [
        {
          id: 'investing-init',
          name: 'Investimento para Iniciantes',
          icon: '📈',
          desc: 'Ações, fundos imobiliários e ETFs de baixo custo.',
          micros: [
            {
              name: 'ETFs Globais de Baixo Custo para Aposentadoria',
              desc: 'Guias de montagem de carteira passiva de longo prazo focado em redução de taxas e impostos.',
              lucratividade: 'Altas comissões por indicação de corretoras autorizadas e venda de cursos e planilhas financeiras.',
              caseStudy: { site: 'MrMoneyMustache.com', earnings: '+US$ 150K/mês', strategy: 'Blog de estilo de vida frugal focado em aposentar-se aos 30 anos.' },
              details: ['Keywords: "como comprar etf de bogleheads", "investir em etf internacional taxa zero".', 'Público que preza pela segurança patrimonial no longo prazo.']
            }
          ]
        },
        {
          id: 'side-hustles',
          name: 'Side Hustles (Renda Extra)',
          icon: '💼',
          desc: 'Trabalhos freelancers, automação digital e pequenos bicos lucrativos.',
          micros: [
            {
              name: 'Freelancing Remoto em Inteligência Artificial',
              desc: 'Como atuar revisando respostas de LLMs, treinamento de IA e engenharia de prompt como renda extra.',
              lucratividade: 'Venda de templates Notion de gerenciamento e cursos rápidos de formação de analistas IA.',
              caseStudy: { site: 'SideHustleNation.com', earnings: '+US$ 80K/mês', strategy: 'Entrevistas semanais com pessoas comuns que criaram fluxos de R$ 5k+/mês de renda extra.' },
              details: ['Keywords: "vagas trabalho home office ia", "como ganhar dinheiro com engenharia de prompt".', 'Apelo em massa devido à urgência financeira da população.']
            }
          ]
        },
        {
          id: 'digital-nomad',
          name: 'Nômades Digitais',
          icon: '✈️',
          desc: 'Trabalho remoto viajando pelo mundo.',
          micros: [
            {
              name: 'Roteadores 5G Portáteis e Vistos de Nômade Digital',
              desc: 'Reviews de equipamentos de conexão celular global e guias para emissão de vistos de residência temporária.',
              lucratividade: 'Afiliação de seguros de viagem específicos para nômades (tipo SafetyWing) e chips eSIM de internet internacional.',
              caseStudy: { site: 'NomadList.com', earnings: '+US$ 300K/mês (plataforma integrada)', strategy: 'Banco de dados de cidades interativo com custo de vida, internet e segurança.' },
              details: ['Keywords: "melhor internet portatil nomade digital", "como tirar visto de nomade na espanha".', 'Público jovem qualificado com alto orçamento operacional.']
            }
          ]
        },
        {
          id: 'fire-movement',
          name: 'Aposentadoria Precoce (FIRE)',
          icon: '🔥',
          desc: 'Independência financeira extrema e frugalidade.',
          micros: [
            {
              name: 'Planejamento de Independência Financeira Avançada',
              desc: 'Técnicas de taxa de poupança agressiva e investimento focado em gerar dividendos mensais rápidos.',
              lucratividade: 'Venda de calculadoras financeiras avançadas e consultoria individual de planejamento.',
              caseStudy: { site: 'ChooseFI.com', earnings: '+US$ 100K/mês (rede + podcast)', strategy: 'Histórias reais de pessoas que cortaram despesas e saíram da rotina corporativa tradicional.' },
              details: ['Keywords: "regra dos 4 por cento aposentadoria", "como calcular taxa de poupança fire".', 'Audiência extremamente focada em mudar de estilo de vida.']
            }
          ]
        },
        {
          id: 'miles-cashback',
          name: 'Cartões de Crédito & Milhas',
          icon: '💳',
          desc: 'Programas de milhas e cashback corporativos.',
          micros: [
            {
              name: 'Acúmulo de Milhas e Cashback para Viagens de Luxo',
              desc: 'Estratégias para acumular milhas com compras do dia a dia e emitir passagens em executiva/primeira classe pagando taxas mínimas.',
              lucratividade: 'Altas indicações de novos cartões de crédito premium e plataformas de milhas.',
              caseStudy: { site: 'ThePointsGuy.com', earnings: 'Adquirido por milhões por empresa de marketing', strategy: 'Notícias em tempo real de promoções de bonificação de cartões e reviews de cabines de avião.' },
              details: ['Keywords: "melhor cartao para acumular milhas 2026", "como viajar de executiva de graca".', 'Público que busca luxo financeiro otimizando gastos diários.']
            }
          ]
        },
        {
          id: 'tech-career',
          name: 'Carreira Tech',
          icon: '💻',
          desc: 'Preparação para vagas de programação e engenharia.',
          micros: [
            {
              name: 'Preparação para Entrevistas de Algoritmo em Empresas Gringas',
              desc: 'Como se preparar para testes técnicos remotos recebendo em dólar trabalhando do Brasil.',
              lucratividade: 'Venda de mentorias e simulados de interviews técnicas em inglês.',
              caseStudy: { site: 'TechInterviewGuide (seção comercial)', earnings: '+US$ 50K/mês', strategy: 'Exercícios práticos explicados passo a passo de estrutura de dados.' },
              details: ['Keywords: "como passar no leetcode", "entrevista programador em ingles remota".', 'Público disposto a gastar para conquistar salários em moeda estrangeira.']
            }
          ]
        },
        {
          id: 'family-budgeting',
          name: 'Orçamento Familiar',
          icon: '🏠',
          desc: 'Organização de contas e finanças domésticas.',
          micros: [
            {
              name: 'Planilhas e Aplicativos de Orçamento Automático de Contas',
              desc: 'Reviews de ferramentas que integram cartões e contas familiares e guias de redução de dívidas.',
              lucratividade: 'Venda de templates financeiros de planilhas customizadas no Notion ou Sheets.',
              caseStudy: { site: 'YNAB (You Need A Budget Blog)', earnings: 'Faturamento milionário corporativo', strategy: 'Educação financeira focado em 4 regras fundamentais de fluxo de caixa.' },
              details: ['Keywords: "melhor planilha de gastos familiares excel", "aplicativo de financas integrado banco".', 'Grande apelo para chefes de família buscando economizar e organizar as contas.']
            }
          ]
        },
        {
          id: 'child-finance',
          name: 'Educação Financeira Infantil',
          icon: '👦',
          desc: 'Contas digitais e mesada educativa para crianças.',
          micros: [
            {
              name: 'Cartões de Mesada e Aplicativos Financeiros para Crianças',
              desc: 'Reviews e comparativos de cartões de débito controlados por pais e tarefas domésticas remuneradas digitalmente.',
              lucratividade: 'Indicação afiliada de bancos digitais focados no público menor de idade.',
              caseStudy: { site: 'Greenlight Blog', earnings: 'Unicórnio tecnológico (SaaS de mesada)', strategy: 'Conteúdo focado em pais educando seus filhos para a responsabilidade financeira.' },
              details: ['Keywords: "melhor cartao de debito infantil", "como gerenciar mesada do filho".', 'Público qualificado de pais de classe média-alta buscando educação de qualidade.']
            }
          ]
        },
        {
          id: 'mei-taxes',
          name: 'Isenção de Impostos MEI',
          icon: '📁',
          desc: 'Declarações e contabilidade de pequenas empresas.',
          micros: [
            {
              name: 'Redução de Impostos Legais para Microempreendedores Digitais',
              desc: 'Contabilidade básica passo a passo para freelancers que emitem notas fiscais e querem economizar com tributos.',
              lucratividade: 'Parcerias com escritórios de contabilidade online para indicação de serviços recorrentes.',
              caseStudy: { site: 'TaxJar (seção educacional)', earnings: 'Adquirido pela Stripe', strategy: 'Respostas simples para as maiores dúvidas tributárias de e-commerces e MEIs.' },
              details: ['Keywords: "impostos freelancer MEI", "como declarar rendimentos nota fiscal".', 'Público que precisa de ajuda legal de forma urgente para evitar multas.']
            }
          ]
        },
        {
          id: 'airbnb-investing',
          name: 'Investimento em Airbnb',
          icon: '🔑',
          desc: 'Aluguel de temporada e compra de imóveis turísticos.',
          micros: [
            {
              name: 'Gestão e Automação de Propriedades de Temporada (Airbnb)',
              desc: 'Reviews de fechaduras eletrônicas integradas, softwares de precificação dinâmica e guias de recepção de hóspedes.',
              lucratividade: 'Afiliação de produtos de automação de acesso e softwares de PMS (Property Management System).',
              caseStudy: { site: 'BiggerPockets.com (seção Vacation Rentals)', earnings: 'Faturamento milionário com assinaturas e fórum', strategy: 'Estudos de caso reais de pessoas que transformaram kitnets em fluxos de R$ 10k/mês.' },
              details: ['Keywords: "como automatizar checkin airbnb", "preco dinamico software aluguel".', 'Público investidor de alto padrão focado em retorno rápido.']
            }
          ]
        }
      ]
    },
    {
      id: 'beauty',
      name: 'Beleza & Moda',
      icon: '💄',
      desc: 'Cosméticos ecológicos, moda sustentável, calçados ergonômicos e acessórios refinados.',
      subs: [
        {
          id: 'vegan-makeup',
          name: 'Maquiagem Vegana & Orgânica',
          icon: '💅',
          desc: 'Produtos de maquiagem livre de testes em animais e químicas nocivas.',
          micros: [
            {
              name: 'Batom e Maquiagem Cruelty-Free Orgânica',
              desc: 'Reviews de bases, batons e corretivos naturais com testes de durabilidade reais.',
              lucratividade: 'Afiliação direta de marcas de beleza verde de alta conversão.',
              caseStudy: { site: 'CrueltyFreeKitty.com', earnings: '+US$ 90K/mês', strategy: 'Banco de dados de marcas certificadas cruelty-free com atualizações semanais.' },
              details: ['Keywords: "melhor base organica vegana", "marcas de maquiagem que nao testam em animais".', 'Tráfego visual orgânico recorrente e qualificado.']
            }
          ]
        },
        {
          id: 'niche-perfumery',
          name: 'Perfumaria de Nicho',
          icon: '🧴',
          desc: 'Decants, resenhas de perfumes importados e marcas independentes.',
          micros: [
            {
              name: 'Fragrâncias Artesanais e Resenhas de Decants',
              desc: 'Reviews olfativos detalhados de perfumes importados exclusivos e dicas para comprar decants confiáveis.',
              lucratividade: 'Afiliação de e-commerces de decants e marcas de perfumaria artesanal.',
              caseStudy: { site: 'Fragrantica.com (seção reviews)', earnings: 'Faturamento milionário com publicidade premium', strategy: 'Notas olfativas mapeadas por inteligência de comunidade.' },
              details: ['Keywords: "melhor perfume importado masculino 2026", "decants de perfumes confiaveis".', 'Público que investe quantias significativas em fragrâncias exclusivas.']
            }
          ]
        },
        {
          id: 'curly-hair',
          name: 'Cabelos Cacheados & Crespos',
          icon: '💇',
          desc: 'Transição capilar, técnicas No-Poo e Low-Poo.',
          micros: [
            {
              name: 'Cronograma Capilar e Shampoos Sem Sulfato',
              desc: 'Guias de hidratação profunda e resenhas de finalizadores para cabelos crespos e ondulados.',
              lucratividade: 'Clube de assinaturas de produtos de cronograma e comissões da Amazon.',
              caseStudy: { site: 'NaturallyCurly.com', earnings: 'Adquirido por grande rede de mídia', strategy: 'Fórum de suporte para transição capilar e categorização de tipos de cacho (2A a 4C).' },
              details: ['Keywords: "cronograma capilar cabelo crespo", "shampoo low poo custo beneficio".', 'Alta fidelidade de leitores que buscam indicações de produtos testados.']
            }
          ]
        },
        {
          id: 'capsule-wardrobe',
          name: 'Guarda-Roupa Cápsula',
          icon: '👗',
          desc: 'Moda minimalista e looks versáteis.',
          micros: [
            {
              name: 'Moda Minimalista com Tecidos Sustentáveis',
              desc: 'Como montar um armário funcional com menos de 40 peças combinando estilos duráveis.',
              lucratividade: 'Afiliação de marcas de slow-fashion ecológicas com comissões diferenciadas.',
              caseStudy: { site: 'Unfancy (Capsule Wardrobe Blog)', earnings: '+US$ 35K/mês', strategy: 'Desafios sazonais de vestuário mostrando fotos diárias de combinações criativas.' },
              details: ['Keywords: "guarda roupa capsula minimalista feminino", "looks basicos elegantes".', 'Grande apelo estético no Pinterest e Instagram.']
            }
          ]
        },
        {
          id: 'barefoot-shoes',
          name: 'Calçados Barefoot',
          icon: '👟',
          desc: 'Tênis minimalistas e calçados anatômicos.',
          micros: [
            {
              name: 'Tênis Barefoot para Corrida e Dia a Dia',
              desc: 'Reviews de calçados de sola ultrafina flexível com formato largo nos dedos (toe box amplo).',
              lucratividade: 'Parcerias com fabricantes inovadores de tênis anatômicos e alta margem por clique.',
              caseStudy: { site: 'BarefootRunners.org', earnings: '+US$ 40K/mês', strategy: 'Guias de transição corretas para corrida barefoot prevenindo lesões no calcanhar.' },
              details: ['Keywords: "tenis barefoot corrida brasil", "sapato anatomico toe box largo".', 'Nicho de saúde física e ergonomia com forte intenção de compra.']
            }
          ]
        },
        {
          id: 'k-beauty',
          name: 'K-Beauty (Beleza Coreana)',
          icon: '🧖',
          desc: 'Skincare e rotinas coreanas de alta hidratação.',
          micros: [
            {
              name: 'Rotina de Skincare Coreana para Pele Sensível',
              desc: 'Reviews de tônicos de centelha asiática, essências de mucina de caracol e protetores solares coreanos fluidos.',
              lucratividade: 'Indicação de importadores autorizados e vendas afiliadas da Shopee/Amazon.',
              caseStudy: { site: 'SokoGlam.com (seção editorial)', earnings: 'Faturamento milionário com e-commerce integrado', strategy: 'Artigos educacionais profundos desmistificando os ingredientes químicos das rotinas.' },
              details: ['Keywords: "rotina coreana 10 passos pele sensivel", "melhores marcas kbeauty".', 'Público que compra múltiplos produtos de skincare mensalmente.']
            }
          ]
        },
        {
          id: 'automatic-watches',
          name: 'Relojoaria Mecânica',
          icon: '⌚',
          desc: 'Relógios automáticos acessíveis e micro-marcas.',
          micros: [
            {
              name: 'Relógios Automáticos Mecânicos Acessíveis',
              desc: 'Resenhas de relógios automáticos abaixo de R$ 1.500 (Seiko, Citizen, Orient) e pulseiras de reposição.',
              lucratividade: 'Afiliação de lojas especializadas e venda de acessórios de luxo (estojos, pulseiras de couro).',
              caseStudy: { site: 'Hodinkee.com (início como blog)', earnings: 'Multimilionário (venda e e-commerce de relógios de luxo)', strategy: 'Resenhas altamente fotográficas com histórias e análise de calibres mecânicos.' },
              details: ['Keywords: "relogio automatico de entrada", "relogios mecanicos custo beneficio".', 'Nicho de colecionismo apaixonado e com excelente ticket médio por transação.']
            }
          ]
        },
        {
          id: 'affordable-frames',
          name: 'Óculos de Grau Online',
          icon: '👓',
          desc: 'Armações de acetato e lentes de prescrição online.',
          micros: [
            {
              name: 'Armações de Acetato Italianas Baratas Online',
              desc: 'Reviews de serviços que enviam óculos de grau completos e armações estilosas pelos correios.',
              lucratividade: 'Altas comissões de marcas inovadoras de óculos diretos ao consumidor.',
              caseStudy: { site: 'WarbyParker Blog (conteúdo institucional)', earnings: 'Faturamento bilionário', strategy: 'Guias de estilo baseados no formato de rosto e testes virtuais 3D.' },
              details: ['Keywords: "como comprar oculos de grau online", "armacoes de acetato baratas".', 'Alta conversão devido à economia expressiva comparada às óticas tradicionais.']
            }
          ]
        },
        {
          id: 'nail-art-home',
          name: 'Unhas Decoradas (Nail Art)',
          icon: '💅',
          desc: 'Esmaltação em gel e cabines UV residenciais.',
          micros: [
            {
              name: 'Esmaltes em Gel e Cabines UV Residenciais',
              desc: 'Tutoriais de aplicação segura de gel em casa, alongamentos e resenha de cabines LED/UV de secagem rápida.',
              lucratividade: 'Afiliação de insumos de manicure da Amazon/AliExpress e venda de decalques autorais.',
              caseStudy: { site: 'NailPro.com', earnings: '+US$ 65K/mês', strategy: 'Tutoriais em vídeo de passo a passo de decorações temáticas e tendências sazonais.' },
              details: ['Keywords: "como fazer unha em gel sozinha", "melhor cabine led uv residencial".', 'Altíssimo volume de buscas de tutoriais de faça-você-mesmo.']
            }
          ]
        },
        {
          id: 'classic-shaving',
          name: 'Barbear Clássico',
          icon: '🪒',
          desc: 'Aparelhos de segurança (safety razors), pincéis e sabões tradicionais.',
          micros: [
            {
              name: 'Navalhas de Segurança e Óleos de Barbear Tradicionais',
              desc: 'Como fazer o barbear clássico prevenindo irritação e pelos encravados usando pincel e navalha tradicional.',
              lucratividade: 'Afiliação de marcas de metal e aço inoxidável duráveis e venda de sabões artesanais.',
              caseStudy: { site: 'Sharpologist.com', earnings: '+US$ 25K/mês', strategy: 'Guias exaustivos de angulação da lâmina e massagem pré-barba.' },
              details: ['Keywords: "aparelho de barbear classico de metal", "como evitar foliculite na barba".', 'Público masculino engajado buscando um ritual de cuidado premium.']
            }
          ]
        }
      ]
    },
    {
      id: 'automotive',
      name: 'Automotivo & Mobilidade',
      icon: '🚗',
      desc: 'Detalhamento estético, upgrades para carros elétricos, motorhomes e mecânica faça-você-mesmo.',
      subs: [
        {
          id: 'car-detailing',
          name: 'Detalhamento Automotivo',
          icon: '✨',
          desc: 'Limpeza técnica, ceras, vitrificadores e politrizes.',
          micros: [
            {
              name: 'Ceras de Carnaúba Premium e Vitrificadores de Pintura',
              desc: 'Reviews de shampoos neutros, ceras duras protetoras e politrizes rotativas para polimento residencial.',
              lucratividade: 'Afiliação de produtos químicos e links afiliados de ferramentas de alto valor (lavadoras de pressão, politrizes).',
              caseStudy: { site: 'DetailKing.com (editorial)', earnings: 'Faturamento milionário com loja + cursos', strategy: 'Guias passo a passo comparando a durabilidade de ceras sintéticas vs naturais.' },
              details: ['Keywords: "como polir o carro em casa", "melhor vitrificador de pintura automotiva".', 'Hobby de entusiastas apaixonados por carros que gastam quantias elevadas em estética.']
            }
          ]
        },
        {
          id: 'ev-accessories',
          name: 'Acessórios para Veículos Elétricos',
          icon: '🔌',
          desc: 'Carregadores do tipo 2, adaptadores e painéis solares residenciais para EVs.',
          micros: [
            {
              name: 'Carregadores de Parede Rápidos (Wallbox) Tipo 2',
              desc: 'Reviews de carregadores inteligentes com integração Wi-Fi e adaptadores de viagem para carros elétricos.',
              lucratividade: 'Altas indicações de instaladores elétricos e comissões de venda de carregadores wallbox (R$ 2.500+).',
              caseStudy: { site: 'InsideEVs.com (seção acessórios)', earnings: 'Grande receita com anúncios e afiliados', strategy: 'Testes de velocidade de recarga sob diferentes amperagens e temperaturas.' },
              details: ['Keywords: "melhor carregador de parede carro eletrico", "wallbox inteligente tipo 2".', 'Público pioneiro de alta renda buscando otimizar o tempo de carga.']
            }
          ]
        },
        {
          id: 'van-life',
          name: 'Conversão de Vans & Motorhomes',
          icon: '🚐',
          desc: 'Isolamento termoacústico, elétrica 12V e móveis para vans de viagem.',
          micros: [
            {
              name: 'Isolamento Térmico de Lã de Rocha e Painéis Solares 12V',
              desc: 'Como projetar a elétrica solar e o isolamento de vans para morar ou viajar longos períodos.',
              lucratividade: 'Afiliação de inversores de energia de alta qualidade, baterias de lítio de ciclo profundo e geladeiras 12V.',
              caseStudy: { site: 'GnomadHome.com', earnings: '+US$ 45K/mês', strategy: 'Calculadoras gratuitas de consumo elétrico que indicam quais baterias comprar.' },
              details: ['Keywords: "eletrica solar para motorhome 12v", "isolamento termico van life".', 'Nicho de estilo de vida aventureiro com alto valor por clique comercial.']
            }
          ]
        },
        {
          id: 'diy-mechanic',
          name: 'Mecânica DIY (Faça Você Mesmo)',
          icon: '🔧',
          desc: 'Diagnóstico por OBD2, troca de filtros e manutenção simples em casa.',
          micros: [
            {
              name: 'Scanners de Diagnóstico OBD2 Bluetooth',
              desc: 'Reviews de pequenos scanners de tomada OBD2 que mostram códigos de falha do motor diretamente no smartphone.',
              lucratividade: 'Afiliação de ferramentas mecânicas e scanners parceiros da Amazon/AliExpress.',
              caseStudy: { site: 'EricTheCarGuy.com', earnings: '+US$ 90K/mês (conteúdo + parcerias)', strategy: 'Vídeos extremamente didáticos de consertos mostrando cada parafuso.' },
              details: ['Keywords: "melhor scanner obd2 bluetooth", "como apagar luz de injeção motor".', 'Grande volume de tráfego de proprietários querendo economizar na oficina.']
            }
          ]
        },
        {
          id: 'adventure-moto',
          name: 'Motociclismo de Aventura',
          icon: '🏍️',
          desc: 'Capacetes, intercomunicadores e jaquetas com proteção para viagens longas.',
          micros: [
            {
              name: 'Capacetes Modulares com Intercomunicadores Bluetooth',
              desc: 'Reviews de isolamento acústico de capacetes modulares e testes de alcance de comunicadores entre motos.',
              lucratividade: 'Ticket médio alto. Altas comissões de roupas de proteção de cordura e botas técnicas.',
              caseStudy: { site: 'RevZilla.com (editorial)', earnings: 'Negócio milionário com e-commerce integrado', strategy: 'Reviews detalhados em vídeo demonstrando a resistência de costuras e zíperes.' },
              details: ['Keywords: "melhor intercomunicador moto bluetooth", "capacete modular silencioso".', 'Público que investe quantias significativas em segurança na estrada.']
            }
          ]
        },
        {
          id: 'car-safety',
          name: 'Segurança Automotiva',
          icon: '📹',
          desc: 'Câmeras de painel (dashcams) e rastreadores GPS de precisão.',
          micros: [
            {
              name: 'Dashcams 4K com Gravação Noturna e Sensor de Estacionamento',
              desc: 'Análises de qualidade de vídeo para leitura de placas no escuro e sistemas G-Sensor contra colisões.',
              lucratividade: 'Parcerias com fabricantes diretos de tecnologia automotiva e links de afiliação.',
              caseStudy: { site: 'DashCamTalk.com', earnings: '+US$ 35K/mês (tráfego e fórum)', strategy: 'Reviews independentes comparando sensores de imagem da Sony de diferentes marcas.' },
              details: ['Keywords: "melhor camera de painel carro", "dashcam 4k com geraçao estacionado".', 'Audiência preocupada com segurança jurídica e proteção contra golpes de trânsito.']
            }
          ]
        },
        {
          id: 'classic-cars',
          name: 'Carros Clássicos',
          icon: '🚘',
          desc: 'Restauração de carros antigos e busca de peças originais.',
          micros: [
            {
              name: 'Peças de Reposição Originais para Fuscas e Opalas',
              desc: 'Reviews de distribuidores confiáveis de borrachas de vedação, painéis clássicos e carburadores originais.',
              lucratividade: 'Banners de autopeças de nicho e venda de manuais de restauração em PDF.',
              caseStudy: { site: 'Hemmings.com (início editorial)', earnings: 'Negócio de anúncios classificados multimilionário', strategy: 'Listagem de eventos, feiras de carros e histórias detalhadas de restauração.' },
              details: ['Keywords: "peças restaurar fusca antigo", "carburador original opala".', 'Comunidade extremamente engajada de colecionadores dispostos a pagar premium.']
            }
          ]
        },
        {
          id: 'urban-ebikes',
          name: 'Bicicletas Elétricas de Uso Diário',
          icon: '🚲',
          desc: 'E-bikes dobráveis e kits de conversão elétrica para trânsito urbano.',
          micros: [
            {
              name: 'Kits de Conversão de Bicicleta Comum para Elétrica',
              desc: 'Reviews de motores de cubo traseiro, baterias tipo garrafa e guias de montagem DIY.',
              lucratividade: 'Afiliação de marcas de kits e venda de manuais de instalação segura.',
              caseStudy: { site: 'EbikesSchool.com', earnings: '+US$ 40K/mês', strategy: 'Tutoriais em texto e vídeo extremamente didáticos simplificando a elétrica de e-bikes.' },
              details: ['Keywords: "kit motor eletrico bicicleta converter", "bateria ebike garrafa 36v".', 'Alta conversão devido a leitores buscando alternativa barata à compra de uma e-bike inteira.']
            }
          ]
        },
        {
          id: 'eco-wash',
          name: 'Lavagem Ecológica',
          icon: '🧼',
          desc: 'Produtos de limpeza sem água e ecologicamente corretos.',
          micros: [
            {
              name: 'Shampoos de Lavagem a Seco com Polímeros Protetores',
              desc: 'Reviews de produtos biodegradáveis que limpam e enceram o veículo sem usar baldes de água.',
              lucratividade: 'Venda de kits próprios de dropshipping ecológico e afiliação.',
              caseStudy: { site: 'EcoTouch (início editorial)', earnings: 'Faturamento de +US$ 50K/mês', strategy: 'Vídeos mostrando a remoção de sujeira pesada sem riscar a pintura do carro.' },
              details: ['Keywords: "melhor produto lavagem a seco carro", "lavar carro sem agua ecologico".', 'Público que vive em condomínios com restrição de uso de mangueira.']
            }
          ]
        },
        {
          id: 'car-racks',
          name: 'Suportes & Bagageiros',
          icon: '🛹',
          desc: 'Racks de teto, suportes de bicicleta e bagageiros de caçamba.',
          micros: [
            {
              name: 'Racks de Teto Aerodinâmicos e Suportes de Transbike',
              desc: 'Reviews de suportes de teto e engates traseiros para transporte seguro de pranchas e bicicletas.',
              lucratividade: 'Altas comissões de itens mecânicos pesados de segurança de grandes marcas (Thule, Yakima).',
              caseStudy: { site: 'Yakima Blog (editorial cooperado)', earnings: 'Faturamento milionário de divisão de tráfego', strategy: 'Guias de compatibilidade de racks por modelo exato de carro.' },
              details: ['Keywords: "melhor rack de teto Thule custo beneficio", "transbike engate traseiro seguro".', 'Público de ciclistas e surfistas com alto poder aquisitivo buscando segurança.']
            }
          ]
        }
      ]
    },
    {
      id: 'babies',
      name: 'Bebês & Maternidade',
      icon: '👶',
      desc: 'Enxoval ecológico, carrinhos compactos, rotinas de sono e introdução alimentar.',
      subs: [
        {
          id: 'strollers',
          name: 'Carrinhos de Bebê de Alta Mobilidade',
          icon: '🛒',
          desc: 'Carrinhos ultracompactos, leves e aprovados para voo.',
          micros: [
            {
              name: 'Carrinhos Compactos Dobráveis para Viagem de Avião',
              desc: 'Reviews de modelos que cabem no bagageiro superior da cabine do avião sem precisar despachar.',
              lucratividade: 'Excelentes comissões da Amazon com ticket médio elevado (carrinhos custando R$ 1.500+).',
              caseStudy: { site: 'Strolleria.com', earnings: 'Faturamento de +US$ 250K/mês com e-commerce + conteúdo', strategy: 'Comparativos em vídeo lado a lado dobrando os carrinhos com apenas uma mão.' },
              details: ['Keywords: "carrinho de bebe compacto para viagem", "carrinho que cabe no aviao".', 'Público qualificado de pais viajantes buscando conveniência e conforto.']
            }
          ]
        },
        {
          id: 'breastfeeding',
          name: 'Amamentação Prática',
          icon: '🍼',
          desc: 'Bombas tira-leite elétricas, extratores e armazenamento de leite.',
          micros: [
            {
              name: 'Bombas Tira-Leite Elétricas Mãos-Livres (Wearables)',
              desc: 'Reviews de extratores que cabem dentro do sutiã sem fios ou tubos externos, permitindo mobilidade total à mãe.',
              lucratividade: 'Comissões altas de tecnologia de saúde materna e parcerias com marcas D2C.',
              caseStudy: { site: 'ExclusivePumping.com', earnings: '+US$ 45K/mês', strategy: 'Guias exaustivos de higiene, tabelas de equivalência de tamanhos de funil e rotinas de extração.' },
              details: ['Keywords: "melhor bomba tira leite eletrica maos livres", "bomba extratora wearable".', 'Alta conversão devido ao forte desejo de mães que retornam ao trabalho.']
            }
          ]
        },
        {
          id: 'eco-diapers',
          name: 'Enxoval Ecológico',
          icon: '🌱',
          desc: 'Fraldas de pano modernas, tecidos orgânicos e lavagem ecológica.',
          micros: [
            {
              name: 'Fraldas Ecológicas de Pano Modernas e Rotina de Lavagem',
              desc: 'Como escolher modelos de fralda de pano impermeáveis ajustáveis e métodos de lavagem profunda para evitar odores.',
              lucratividade: 'Venda de pacotes de fraldas próprias de dropshipping nacional e afiliação de marcas brasileiras.',
              caseStudy: { site: 'FluffLoveUniversity.com', earnings: 'Milhões de pageviews mensais com doações e rede de afiliados', strategy: 'Mecanismo de busca de lavadoras de roupa informando o ciclo exato para higienização de fraldas.' },
              details: ['Keywords: "fralda ecologica de pano como lavar", "melhores marcas fralda pano moderna".', 'Comunidade engajada de mães focadas em sustentabilidade e economia de longo prazo.']
            }
          ]
        },
        {
          id: 'baby-feeding',
          name: 'Alimentação Infantil',
          icon: '🥣',
          desc: 'Introdução alimentar, método BLW e papinhas orgânicas.',
          micros: [
            {
              name: 'Introdução Alimentar pelo Método BLW (Baby-Led Weaning)',
              desc: 'Como oferecer alimentos inteiros de forma segura aos bebês, cortes corretos para evitar engasgo (reflexo de gag) e receitas saudáveis.',
              lucratividade: 'Venda de e-books de receitas e venda de pratos de silicone com ventosa e babadores de silicone.',
              caseStudy: { site: 'SolidStarts.com', earnings: 'Negócio SaaS multimilionário com app e guias', strategy: 'Banco de dados gratuito de fotos e vídeos de cada alimento cortado na forma correta por idade.' },
              details: ['Keywords: "cortes seguros blw 6 meses", "receitas blw introducao alimentar".', 'Pais de primeira viagem buscando segurança e informações confiáveis.']
            }
          ]
        },
        {
          id: 'baby-sleep',
          name: 'Sono do Bebê',
          icon: '💤',
          desc: 'Aparelhos de ruído branco, berços portáteis e técnicas de rotina do sono.',
          micros: [
            {
              name: 'Aparelhos de Ruído Branco Portáteis e Técnicas de Associação',
              desc: 'Reviews de aparelhos de som calmante (white noise) e métodos de transição para o berço sem choro excessivo.',
              lucratividade: 'Venda de cursos online de rotina de sono do bebê e afiliação de casulos (swaddles).',
              caseStudy: { site: 'TakingCarababies.com', earnings: 'Faturamento milionário com infoprodutos e cursos', strategy: 'Conteúdo de blog extremamente empático que valida o cansaço dos pais antes de vender as soluções.' },
              details: ['Keywords: "melhor aparelho ruido branco bebe", "como fazer bebe dormir no berço sozinho".', 'Público desesperado por noites de sono completas, resultando em alta conversão imediata.']
            }
          ]
        },
        {
          id: 'montessori-toys',
          name: 'Brinquedos Educativos',
          icon: '🧩',
          desc: 'Brinquedos de madeira Montessori por faixa etária de desenvolvimento.',
          micros: [
            {
              name: 'Brinquedos de Madeira Montessori por Faixa Etária',
              desc: 'Reviews de kits de assinatura de brinquedos que estimulam a coordenação motora e raciocínio lógico sensorial.',
              lucratividade: 'Afiliação de marcas premium de madeira e venda de guias de brincadeiras sensoriais.',
              caseStudy: { site: 'Lovevery Review (seção editorial independente)', earnings: '+US$ 50K/mês de afiliados', strategy: 'Análise detalhada do valor pedagógico de cada kit de brinquedos.' },
              details: ['Keywords: "brinquedos montessori 1 ano madeira", "atividades sensoriais para bebe".', 'Pais dispostos a pagar mais por brinquedos educativos não eletrônicos de alta durabilidade.']
            }
          ]
        },
        {
          id: 'organic-purees',
          name: 'Papinhas Orgânicas',
          icon: '🍎',
          desc: 'Processadores de papinha e receitas de congelamento prático.',
          micros: [
            {
              name: 'Processadores de Alimentos para Papinhas Frescas',
              desc: 'Reviews de aparelhos que cozinham no vapor e trituram papinhas em um único recipiente.',
              lucratividade: 'Comissões excelentes com eletrodomésticos infantis na Amazon e revendedores locais.',
              caseStudy: { site: 'BabyFoodEats.com', earnings: '+US$ 30K/mês', strategy: 'Guias visuais de congelamento e descongelamento seguro em potes de vidro livres de toxinas.' },
              details: ['Keywords: "melhor processador de papinha bebe", "como congelar papinha de bebe".', 'Mães trabalhadoras buscando otimizar o preparo de comida saudável.']
            }
          ]
        },
        {
          id: 'baby-safety',
          name: 'Segurança Infantil',
          icon: '🛡️',
          desc: 'Grades de proteção, travas invisíveis e câmeras de monitoramento (babás eletrônicas).',
          micros: [
            {
              name: 'Grades de Escada Retráteis e Babás Eletrônicas Wi-Fi',
              desc: 'Reviews de sistemas de trava invisível magnética para gavetas e babás eletrônicas com sensor de respiração.',
              lucratividade: 'Afiliação de eletrônicos de segurança residencial com ótimas margens.',
              caseStudy: { site: 'SafeKids.org (conteúdo afiliado)', earnings: '+US$ 45K/mês', strategy: 'Listagem de riscos domésticos comuns por idade alinhando os produtos de prevenção.' },
              details: ['Keywords: "melhor baba eletronica wi-fi", "trava magnetica para gavetas de Bebe".', 'Público que prioriza a segurança física do filho acima do preço.']
            }
          ]
        },
        {
          id: 'babywearing',
          name: 'Maternidade Ativa (Babywearing)',
          icon: '👶',
          desc: 'Slings de malha, cangurus ergonômicos e suportes de caminhada.',
          micros: [
            {
              name: 'Slings e Cangurus Ergonômicos para Bebês',
              desc: 'Reviews de tecidos respiráveis para slings e suportes que mantêm a postura em "M" (saudável para os quadris do bebê).',
              lucratividade: 'Venda de slings próprios sob marca própria (PLR) e afiliação de marcas premium.',
              caseStudy: { site: 'BabywearingInternational', earnings: 'Líder em filiação de suportes de quadril', strategy: 'Tutoriais de amarração seguros em vídeo e artigos explicativos.' },
              details: ['Keywords: "canguru ergonomico postura correta", "melhor wrap sling calor".', 'Mães ativas e pais que buscam praticidade para passear sem carrinho.']
            }
          ]
        },
        {
          id: 'organic-cotton-clothes',
          name: 'Roupas de Algodão Orgânico',
          icon: '👕',
          desc: 'Pijamas e bodies de fibras naturais e tintas hipoalergênicas.',
          micros: [
            {
              name: 'Pijamas de Zíper Duplo e Tecidos Hipoalergênicos',
              desc: 'Reviews de marcas de roupas infantis confortáveis que facilitam a troca de fraldas noturna sem despir o bebê.',
              lucratividade: 'Afiliação de lojas infantis de grife orgânica e e-commerce de revenda.',
              caseStudy: { site: 'HannaAnderssonFans (editorial)', earnings: '+US$ 35K/mês', strategy: 'Destaque para a maciez do algodão pima e resistência à lavagem industrial.' },
              details: ['Keywords: "pijama ziper duplo bebe algodao", "roupas hipoalergenicas recem nascido".', 'Público buscando o máximo conforto térmico contra alergias de pele.']
            }
          ]
        }
      ]
    },
    {
      id: 'travel',
      name: 'Viagem & Turismo',
      icon: '✈️',
      desc: 'Mochilão minimalista, roteiros para mulheres solo, bagagens inteligentes e destinos familiares.',
      subs: [
        {
          id: 'backpacking-trip',
          name: 'Viagens de Mochilão',
          icon: '🎒',
          desc: 'Viagens de baixo custo pela Europa, América do Sul e Sudeste Asiático.',
          micros: [
            {
              name: 'Hostels de Festa na Europa para Jovens',
              desc: 'Reviews detalhados de hospedagem compartilhada com atividades sociais, pub crawls e áreas de co-working baratas.',
              lucratividade: 'Comissões de reservas de hospedagem (Hostelworld/Booking) e programas de afiliados de passes de trem (Eurail).',
              caseStudy: { site: 'HostelworldBlog', earnings: 'Gera milhões de reservas anuais', strategy: 'Guias escritos por mochileiros reais contando segredos locais de cada cidade.' },
              details: ['Keywords: "melhor hostel de festa em barcelona", "mochilao europa roteiro barato".', 'Alto tráfego de público jovem com grande potencial de cliques em links de afiliados.']
            }
          ]
        },
        {
          id: 'solo-female-travel',
          name: 'Viagem Solo Feminina',
          icon: '👩',
          desc: 'Dicas de segurança, roteiros amigáveis e grupos de viagem para mulheres.',
          micros: [
            {
              name: 'Roteiros de Segurança no Sudeste Asiático para Mulheres',
              desc: 'Como viajar sozinha com segurança pela Tailândia, Vietnã e Indonésia, avaliando transportes e golpes locais.',
              lucratividade: 'Afiliação de seguros de viagem específicos para mulheres, venda de alarmes de porta portáteis e e-books de guias locais.',
              caseStudy: { site: 'SoloFemaleTravelers.club', earnings: '+US$ 40K/mês (guias + tours exclusivos)', strategy: 'Comunidade fechada no Facebook com verificação de identidade que serve de canal de tração de leads.' },
              details: ['Keywords: "viajar sozinha tailandia dicas segurança", "roteiro mochilao feminino asia".', 'Nicho com alta confiança na marca e engajamento em newsletters.']
            }
          ]
        },
        {
          id: 'minimalist-luggage',
          name: 'Bagagem de Mão Minimalista',
          icon: '💼',
          desc: 'Viagens sem despachar malas usando mochilas de cabine.',
          micros: [
            {
              name: 'Mochilas de Viagem de 40L com Abertura Estilo Mala',
              desc: 'Reviews de mochilas que atendem às regras de tamanho de bagagem de mão de companhias aéreas de baixo custo.',
              lucratividade: 'Comissões altas de malas inteligentes de marcas premium (Farpoint, Peak Design).',
              caseStudy: { site: 'PackHacker.com', earnings: '+US$ 150K/mês', strategy: 'Gifs interativos demonstrando como guardar cada item dentro dos compartimentos da mochila.' },
              details: ['Keywords: "melhor mochila de viagem 40 litros", "viajar de aviao sem despachar mala".', 'Público que viaja com frequência e busca economizar taxas de bagagem de forma prática.']
            }
          ]
        },
        {
          id: 'travel-kids',
          name: 'Viagem com Crianças',
          icon: '👪',
          desc: 'Resorts familiares, passagens aéreas promocionais e malas infantis.',
          micros: [
            {
              name: 'Resorts All-Inclusive Focados em Recreação Infantil',
              desc: 'Reviews detalhados de hotéis familiares com monitoria, parques aquáticos seguros e alimentação especial para bebês.',
              lucratividade: 'Excelentes comissões por pacotes de viagem familiares fechados na Booking ou Hoteis.com.',
              caseStudy: { site: 'TravelBabies.com', earnings: '+US$ 55K/mês', strategy: 'Vídeos divertidos do dia a dia da família no hotel mostrando as comodidades reais de lazer.' },
              details: ['Keywords: "melhor resort com monitoria infantil", "dicas voar com bebe de colo".', 'Público composto por pais de classe média-alta buscando férias seguras e tranquilas.']
            }
          ]
        },
        {
          id: 'adventure-tourism',
          name: 'Turismo de Aventura',
          icon: '🏕️',
          desc: 'Roteiros de trekking autoguiados e esportes radicais.',
          micros: [
            {
              name: 'Roteiros de Trilha Autoguiados na Patagônia',
              desc: 'Como fazer o circuito W em Torres del Paine ou acampar em El Chaltén sem precisar de guias caros.',
              lucratividade: 'Comissões de equipamentos de acampamento e afiliação de seguros de turismo de aventura (World Nomads).',
              caseStudy: { site: 'StingyNomads.com', earnings: '+US$ 50K/mês', strategy: 'Guias e mapas GPX gratuitos com cada ponto de água e local de acampamento demarcados.' },
              details: ['Keywords: "trilha torres del paine sem guia roteiro", "viajar patagonia acampando".', 'Público focado em aventuras independentes com alto consumo de roupas técnicas de frio.']
            }
          ]
        },
        {
          id: 'boutique-hotels',
          name: 'Pousadas de Charme & Glamping',
          icon: '🏨',
          desc: 'Hospedagens de luxo sustentáveis e integradas à natureza.',
          micros: [
            {
              name: 'Glampings de Luxo e Pousadas Sustentáveis no Brasil',
              desc: 'Reviews de cabanas com design inovador, banheiras ao ar livre e serviços integrados na serra ou praia.',
              lucratividade: 'Parcerias pagas de promoção turística e links de afiliação direta com Booking de alto ticket.',
              caseStudy: { site: 'TabletHotelsBlog', earnings: 'Adquirido pelo Guia Michelin', strategy: 'Foco em curadoria estética extrema com fotografias profissionais exclusivas de hotéis de design.' },
              details: ['Keywords: "glamping de luxo perto de sp", "pousadas charmosas serra da mantiqueira".', 'Público premium buscando viagens curtas de fim de semana para casais.']
            }
          ]
        },
        {
          id: 'road-trips',
          name: 'Road Trips Nacionais',
          icon: '🚙',
          desc: 'Rotas de carro, aluguel de veículos e paradas recomendadas.',
          micros: [
            {
              name: 'Aluguel de Carros e Rotas Panorâmicas no Nordeste',
              desc: 'Roteiros de carro pela Rota das Emoções ou litoral sul do RN, avaliando estradas e pontos de parada.',
              lucratividade: 'Afiliação de locadoras de carros (Rentcars) com comissões recorrentes excelentes.',
              caseStudy: { site: 'AlongDustyRoads.com', earnings: '+US$ 60K/mês', strategy: 'Guias estéticos com foco em fotografia artística local e suporte a rotas independentes.' },
              details: ['Keywords: "aluguel de carro recife porto de galinhas", "rota das emocoes carro roteiro".', 'Leitores com intenção ativa de organizar viagens rodoviárias autônomas.']
            }
          ]
        },
        {
          id: 'cruise-trips',
          name: 'Cruzeiros de Rio',
          icon: '🚢',
          desc: 'Cruzeiros fluviais de luxo na Europa e Ásia.',
          micros: [
            {
              name: 'Cruzeiros Fluviais na Europa para Casais Seniores',
              desc: 'Reviews comparativos de companhias como Viking Cruises no rio Danúbio ou Reno, com acessibilidade e passeios inclusos.',
              lucratividade: 'Altas comissões por venda de cruzeiros de luxo (comissões podem ultrapassar R$ 2.000 por cabine).',
              caseStudy: { site: 'CruiseCritic.com (seção River Cruises)', earnings: 'Faturamento milionário com rede afiliada de navios', strategy: 'Reviews de passageiros reais com notas e dicas de cabines específicas.' },
              details: ['Keywords: "cruzeiro rio danubio viking reviews", "viagem fluvial europa idosos".', 'Público maduro aposentado com alto orçamento para férias de luxo.']
            }
          ]
        },
        {
          id: 'food-travel',
          name: 'Gastronomia de Viagem',
          icon: '🍜',
          desc: 'Tours gastronômicos, mercados locais e comida de rua.',
          micros: [
            {
              name: 'Tours Gastronômicos e Comida de Rua no Sudeste Asiático',
              desc: 'Guias sobre o que comer em Bangkok, Hanói e Penang de forma segura e deliciosa em mercados populares.',
              lucratividade: 'Afiliação de atividades e passeios turísticos (GetYourGuide, Klook) e guias digitais de restaurantes.',
              caseStudy: { site: 'Migrationology.com', earnings: '+US$ 150K/mês (ads + YouTube + tours)', strategy: 'Reviews entusiasmados de comida local gravados em vídeo de alta qualidade com preços e localização exata.' },
              details: ['Keywords: "comida de rua bangkok onde comer", "tours gastronomicos hanói".', 'Audiência altamente apaixonada por turismo culinário e cultura local.']
            }
          ]
        },
        {
          id: 'travel-photography',
          name: 'Fotografia de Viagem',
          icon: '📷',
          desc: 'Câmeras mirrorless compactas, lentes de viagem e drones.',
          micros: [
            {
              name: 'Drones Ultraleves e Lentes Zoom para Viagem',
              desc: 'Reviews de drones que não exigem registro complexo e lentes versáteis que cobrem do grande angular ao zoom.',
              lucratividade: 'Comissões altas de equipamentos eletrônicos de alto ticket na Amazon e lojas de foto.',
              caseStudy: { site: 'DanFlyingSolo.com', earnings: '+US$ 45K/mês', strategy: 'Guias de locação de fotografia mostrando as configurações exatas usadas para capturar paisagens famosas.' },
              details: ['Keywords: "melhor drone de viagem leve dji", "lente unica para viagem sony".', 'Criadores de conteúdo e entusiastas buscando melhorar a qualidade das suas fotos de férias.']
            }
          ]
        }
      ]
    },
    {
      id: 'art-music',
      name: 'Arte & Música',
      icon: '🎨',
      desc: 'Pintura em aquarela, desenho digital, home studio e sintetizadores eurorack.',
      subs: [
        {
          id: 'watercolor',
          name: 'Pintura em Aquarela',
          icon: '🖌️',
          desc: 'Tintas artesanais, papéis de algodão e técnicas de pintura fluida.',
          micros: [
            {
              name: 'Tintas de Aquarela Artesanais e Pincéis Sintéticos',
              desc: 'Reviews de pigmentos naturais de pastilha, papéis livres de ácido e técnicas básicas de lavagem molhada sobre molhado.',
              lucratividade: 'Venda de paletas de aquarela exclusivas e cursos online de técnicas de pintura botânica.',
              caseStudy: { site: 'Doodlewash.com', earnings: '+US$ 20K/mês (comunidade + afiliados)', strategy: 'Desafios diários de desenho com fotos de leitores criando um hub viral.' },
              details: ['Keywords: "como pintar flor em aquarela", "melhores pasteis de aquarela artesanal".', 'Público que gasta de forma recorrente em pincéis e blocos de papel de alta gramatura.']
            }
          ]
        },
        {
          id: 'calligraphy',
          name: 'Caligrafia & Lettering',
          icon: '✒️',
          desc: 'Canetas-tinteiro, tintas metalizadas e escrita clássica.',
          micros: [
            {
              name: 'Canetas-Tinteiro Flexíveis e Tintas Caligráficas',
              desc: 'Reviews de penas flexíveis para caligrafia moderna e receitas de tintas metalizadas para convites de casamento.',
              lucratividade: 'Cursos de caligrafia para noivas e afiliação de papelarias de arte fina.',
              caseStudy: { site: 'ThePostmansKnock.com', earnings: '+US$ 40K/mês', strategy: 'Templates para impressão digital (worksheets de treino) de baixo custo com altíssima margem de lucro.' },
              details: ['Keywords: "como aprender caligrafia de casamento", "melhor pena flexivel tinteiro".', 'Alta conversão com infoprodutos e downloads de guias de treino.']
            }
          ]
        },
        {
          id: 'digital-illustration',
          name: 'Desenho Digital',
          icon: '✍️',
          desc: 'Pincéis digitais, Procreate no iPad e mesas digitalizadoras.',
          micros: [
            {
              name: 'Pincéis Customizados para Procreate no iPad',
              desc: 'Análises de texturas de tela, canetas digitais e tutoriais de pintura de conceito.',
              lucratividade: 'Venda direta de pincéis (brushes) digitais e texturas de papel realistas.',
              caseStudy: { site: 'BardotBrush.com', earnings: '+US$ 100K/mês', strategy: 'Tutoriais rápidos no Instagram mostrando a facilidade de desenhar com os pincéis do blog.' },
              details: ['Keywords: "melhores pinceis procreate aquarela", "textura de papel ipad desenhar".', 'Mercado gigante de designers e ilustradores iniciantes buscando praticidade.']
            }
          ]
        },
        {
          id: 'synthesizers',
          name: 'Sintetizadores de Áudio',
          icon: '🎹',
          desc: 'Sintetizadores modulares eurorack e teclados MIDI.',
          micros: [
            {
              name: 'Sintetizadores Modulares Eurorack e Cabos de Patch',
              desc: 'Reviews de osciladores, filtros eurorack de boutique e técnicas de modulação de som.',
              lucratividade: 'Parcerias com fabricantes alemães e americanos de módulos analógicos.',
              caseStudy: { site: 'PatchwerksBlog', earnings: '+US$ 50K/mês (conteúdo + loja física)', strategy: 'Tutoriais ensinando a criar sons específicos (como vento, bateria) usando apenas cabos.' },
              details: ['Keywords: "como iniciar sintese eurorack", "melhor modulo oscilador analógico".', 'Nicho de áudio profissional com altíssimo custo por equipamento.']
            }
          ]
        },
        {
          id: 'home-studio',
          name: 'Produção Musical Home Studio',
          icon: '🎧',
          desc: 'Monitores de referência, placas de áudio e softwares DAW.',
          micros: [
            {
              name: 'Monitores de Áudio de Campo Próximo e Plugins VST',
              desc: 'Reviews de caixas de som acústicas para quartos pequenos e comparativos de softwares de emulação de amplificador.',
              lucratividade: 'Afiliação de grandes distribuidores de áudio e venda de pacotes de samples/loops autorais.',
              caseStudy: { site: 'SoundOnSound.com', earnings: 'Negócio editorial global de assinaturas', strategy: 'Análises extremamente técnicas com medições físicas de curvas de equalização.' },
              details: ['Keywords: "melhor monitor de audio para quarto pequeno", "plugins de equalizacao gratuitos VST".', 'Público de músicos independentes investindo constantemente em equipamentos.']
            }
          ]
        },
        {
          id: 'custom-guitar',
          name: 'Guitarra Customizada',
          icon: '🎸',
          desc: 'Captadores artesanais, pedais de boutique e amplificadores valvulados.',
          micros: [
            {
              name: 'Captadores Alnico Artesanais e Pedais de Boutique',
              desc: 'Resenhas de componentes eletrônicos de guitarra para timbres vintage e pedais de delay analógicos.',
              lucratividade: 'Venda de kits de solda eletrônica próprios e parcerias com luthiers locais.',
              caseStudy: { site: 'PremierGuitar.com (conteúdo editorial)', earnings: 'Faturamento milionário com anúncios e afiliados', strategy: 'Série "Rig Rundown" onde mostram os setups exatos de guitarristas famosos antes de shows.' },
              details: ['Keywords: "melhor captador vintage estrato", "pedais de delay analógico boutique".', 'Comunidade fanática por timbres clássicos e equipamentos colecionáveis.']
            }
          ]
        },
        {
          id: 'ukulele-init',
          name: 'Ukulele para Iniciantes',
          icon: '🪕',
          desc: 'Aulas, cifras e reviews de ukuleles soprano e concerto.',
          micros: [
            {
              name: 'Ukuleles de Madeira Koa Havaiana Acessíveis',
              desc: 'Reviews de marcas de ukulele com boa afinação e guias de batidas rítmicas iniciais.',
              lucratividade: 'Afiliação de instrumentos na Amazon e venda de métodos de cifra rápida facilitada.',
              caseStudy: { site: 'UkuleleHunt.com', earnings: '+US$ 15K/mês', strategy: 'Disponibilização de tablaturas gratuitas de músicas populares adaptadas para ukulele.' },
              details: ['Keywords: "melhor ukulele iniciante custo beneficio", "cifras de ukulele faceis".', 'Grande volume de buscas de estudantes e entusiastas casuais de música.']
            }
          ]
        },
        {
          id: 'analog-photo',
          name: 'Fotografia Analógica',
          icon: '🎞️',
          desc: 'Câmeras de filme 35mm, revelação química e rolos de filme.',
          micros: [
            {
              name: 'Câmeras 35mm Clássicas e Revelação Caseira',
              desc: 'Reviews de câmeras analógicas clássicas (Canon AE-1, Olympus OM-1) e passo a passo de revelação com química caseira.',
              lucratividade: 'Venda de kits de químicos prontos e afiliação de rolos de filme da Amazon.',
              caseStudy: { site: '35mmc.com', earnings: '+US$ 25K/mês (patrocínios + fórum)', strategy: 'Resenhas escritas por fotógrafos convidados compartilhando suas fotos analógicas sem edição.' },
              details: ['Keywords: "camera analogica 35mm iniciante", "revelar filme colorido em casa".', 'Nicho hipster-artístico em forte expansão nostálgica.']
            }
          ]
        },
        {
          id: 'clay-sculpture',
          name: 'Escultura em Argila',
          icon: '🏺',
          desc: 'Argila polimérica, fornos e modelagem manual.',
          micros: [
            {
              name: 'Argila Polimérica (Polymer Clay) e Fornos de Mesa',
              desc: 'Reviews de ferramentas de escultura fina, moldagem de miniaturas e técnicas de cura térmica doméstica.',
              lucratividade: 'Venda de joias/miniaturas prontas ou moldes de silicone próprios para replicação.',
              caseStudy: { site: 'ThePotteryWheel.com', earnings: '+US$ 20K/mês', strategy: 'Guias e soluções para problemas comuns ("por que minha argila rachou no forno?").' },
              details: ['Keywords: "ferramentas escultura argila iniciante", "como assar argila polimerica".', 'Público criativo focado em modelagem e artesanato com alta retenção.']
            }
          ]
        },
        {
          id: 'music-theory',
          name: 'Teoria Musical Prática',
          icon: '🎼',
          desc: 'Piano acelerado, leitura de partituras e harmonia funcional.',
          micros: [
            {
              name: 'Aulas Aceleradas de Piano Baseado em Acordes',
              desc: 'Como aprender a tocar suas músicas favoritas no piano sem passar anos decorando partituras tradicionais.',
              lucratividade: 'Venda de infoprodutos, cursos digitais e parcerias com teclados controladores digitais.',
              caseStudy: { site: 'PianoIn21Days.com', earnings: '+US$ 80K/mês', strategy: 'Desafios de 21 dias com vídeos demonstrativos focados em acordes simples.' },
              details: ['Keywords: "aprender piano rapido acordes", "teoria musical descomplicada".', 'Alta conversão de estudantes adultos buscando resultados rápidos de lazer.']
            }
          ]
        }
      ]
    },
    {
      id: 'sports',
      name: 'Esportes & Atletismo',
      icon: '🏃',
      desc: 'Corrida de trilha, tênis de mesa profissional, beach tennis e golfe amador.',
      subs: [
        {
          id: 'trail-running',
          name: 'Corrida de Trilha',
          icon: '⛰️',
          desc: 'Tênis com garras de carbono, mochilas de hidratação e corridas de montanha.',
          micros: [
            {
              name: 'Tênis de Trilha Reforçados e Coletes de Hidratação',
              desc: 'Reviews de calçados com aderência para lama, pedras soltas e mochilas leves para ultramaratonas.',
              lucratividade: 'Afiliação forte de grandes marcas esportivas (Salomon, Hoka) na Amazon e lojas técnicas.',
              caseStudy: { site: 'iRunFar.com', earnings: 'Negócio milionário com patrocínios de marcas de trail', strategy: 'Cobertura em tempo real das maiores ultramaratonas de montanha do mundo.' },
              details: ['Keywords: "melhor tenis para corrida de montanha", "colete de hidratacao ultra leve".', 'Leitores esportistas assíduos com alto consumo anual de tênis específicos.']
            }
          ]
        },
        {
          id: 'table-tennis',
          name: 'Tênis de Mesa',
          icon: '🏓',
          desc: 'Borachas tensionadas, raquetes de carbono e robôs lançadores de bolas.',
          micros: [
            {
              name: 'Borrachas Tensionadas e Raquetes de Carbono',
              desc: 'Reviews de borrachas para efeito de topspin extremo e madeiras de alta tolerância para torneios.',
              lucratividade: 'Indicação de sites especializados de materiais oficiais chineses/japoneses.',
              caseStudy: { site: 'TableTennisDaily.com', earnings: '+US$ 35K/mês (conteúdo + loja parceira)', strategy: 'Fórum ativo e vídeos divertidos testando raquetes gigantes ou borrachas modificadas.' },
              details: ['Keywords: "melhor borracha tenis de mesa efeito", "raquete carbono iniciante ping pong".', 'Nicho muito específico com pouca concorrência de autoridade no Google.']
            }
          ]
        },
        {
          id: 'beach-tennis-sport',
          name: 'Beach Tennis',
          icon: '🎾',
          desc: 'Raquetes de Kevlar, bolinhas de descompressão rápida e redes portáteis.',
          micros: [
            {
              name: 'Raquetes de Fibra de Kevlar e Carbono 3K',
              desc: 'Reviews de controle de impacto de raquetes e tratamentos de aderência de face para o esporte de areia.',
              lucratividade: 'Venda de materiais e afiliação de marcas brasileiras e italianas com alta margem (raquetes de R$ 800+).',
              caseStudy: { site: 'BeachTennisBlog (editorial de autoridade)', earnings: '+US$ 30K/mês', strategy: 'Dicas de golpes táticos e comparativos detalhados de peso de raquete.' },
              details: ['Keywords: "raquete beach tennis kevlar vs carbono", "bolinhas de beach tennis recomendadas".', 'Esporte de maior crescimento social da década, com público de alta renda.']
            }
          ]
        },
        {
          id: 'golf',
          name: 'Golfe Amador',
          icon: '🏌️',
          desc: 'Tacos híbridos, telêmetros a laser e simuladores de tacada domésticos.',
          micros: [
            {
              name: 'Telêmetros a Laser e Tacos Híbridos Tolerantes',
              desc: 'Reviews de medidores de distância a laser de precisão e tacos que facilitam o jogo de iniciantes.',
              lucratividade: 'Altas comissões de e-commerces de golfe (ticket médio mais alto do esporte amador).',
              caseStudy: { site: 'MyGolfSpy.com', earnings: 'Multimilionário com rede afiliada e patrocínios', strategy: 'Selo "Most Wanted" com testes empíricos de precisão de bolas e tacos usando robôs.' },
              details: ['Keywords: "melhor medidor de distancia golfe laser", "tacos de golfe faceis de jogar".', 'Público qualificado de alto padrão financeiro com alta intenção de compra.']
            }
          ]
        },
        {
          id: 'skateboarding',
          name: 'Skate Street',
          icon: '🛹',
          desc: 'Shapes de maple canadense, rodas de uretano e rolamentos rápidos.',
          micros: [
            {
              name: 'Rodas de Uretano e Rolamentos de Cerâmica para Skate',
              desc: 'Reviews de durabilidade de shapes contra rachaduras e testes de velocidade de rolamentos.',
              lucratividade: 'Afiliação de skateshops e venda de camisetas e skates customizados próprios.',
              caseStudy: { site: 'ShrederBlog', earnings: '+US$ 25K/mês', strategy: 'Análises e tutoriais ensinando a mandar manobras em slowmotion com foco nos pés.' },
              details: ['Keywords: "rolamento red bones original vs pirata", "melhor shape maple nacional".', 'Público jovem engajado na cultura de rua e streetwear.']
            }
          ]
        },
        {
          id: 'crossfit-gear',
          name: 'Treinos de Crossfit',
          icon: '🏋️',
          desc: 'Tênis de estabilidade, joelheiras de neoprene e cordas de velocidade.',
          micros: [
            {
              name: 'Tênis de Estabilidade e Joelheiras de Neoprene',
              desc: 'Reviews de tênis projetados para saltos em caixa e levantamento de peso olímpico simultâneos.',
              lucratividade: 'Afiliação de grandes marcas (Reebok, Nike) e venda de planos de treino online.',
              caseStudy: { site: 'Crossfit Gear Reviews (BTWB Blog)', earnings: '+US$ 50K/mês', strategy: 'Mapeamento de desgaste de sola após 100 treinos WOD.' },
              details: ['Keywords: "melhor tenis para crossfit nano vs metcon", "joelheira crossfit neoprene 7mm".', 'Comunidade extremamente focada em performance e consumo de suplementos/acessórios.']
            }
          ]
        },
        {
          id: 'jiujitsu',
          name: 'Artes Marciais (Jiu-Jitsu)',
          icon: '🥋',
          desc: 'Kimonos de trançado leve, faixas especiais e protetores bucais.',
          micros: [
            {
              name: 'Kimonos de Algodão Trançado Leve e Resistente',
              desc: 'Reviews de costuras reforçadas de kimonos para treinos intensos no calor e dicas de conservação do tecido.',
              lucratividade: 'Venda direta de kimonos sob marca própria (PLR) e afiliação de suplementação muscular.',
              caseStudy: { site: 'BJJEasternEurope.com', earnings: '+US$ 45K/mês', strategy: 'Entrevistas com atletas de elite e notícias mundiais da modalidade.' },
              details: ['Keywords: "kimono jiu jitsu trançado leve", "melhor kimono para competiçao".', 'Público praticante fiel e orgulhoso que consome vestimentas específicas com frequência.']
            }
          ]
        },
        {
          id: 'watersports',
          name: 'Esportes de Vento (Kitesurf)',
          icon: '🏄',
          desc: 'Pipetas de kite, pranchas de hidrofólio (foil) e roupas térmicas.',
          micros: [
            {
              name: 'Pranchas com Hidrofólio (Foilboards) para Kitesurf',
              desc: 'Reviews de tecnologia de flutuação sobre a água com hidrofólios de alumínio e carbono.',
              lucratividade: 'Altas comissões por clique (pranchas de foil custam R$ 6.000 a R$ 15.000).',
              caseStudy: { site: 'Kiteboarding.com', earnings: '+US$ 80K/mês (anúncios + guias)', strategy: 'Mapas de condições de vento e resenhas em vídeo de segurança de linhas de kite.' },
              details: ['Keywords: "prancha foilboard kitesurf como funciona", "melhor pipa de kite iniciante".', 'Nicho de esporte radical náutico premium com alto ticket.']
            }
          ]
        },
        {
          id: 'calisthenics',
          name: 'Ginástica Calistênica',
          icon: '🤸',
          desc: 'Argolas olímpicas de madeira, barras paralelas e faixas elásticas.',
          micros: [
            {
              name: 'Argolas Olímpicas de Madeira e Barras Paralelas de Metal',
              desc: 'Reviews de fitas de ancoragem com fivelas de aço e setups de treino de rua portátil.',
              lucratividade: 'Venda de rotinas de treinamento físico em PDF e afiliação de calçados leves.',
              caseStudy: { site: 'CalisthenicsParks.com', earnings: '+US$ 30K/mês', strategy: 'Mapa global de parques públicos de calistenia associado a reviews de materiais de treino.' },
              details: ['Keywords: "argolas de madeira olimpicas pendurar", "treino barra fixa calistenia".', 'Grande apelo de vídeos de transformações físicas orgânicas.']
            }
          ]
        },
        {
          id: 'openwaterswim',
          name: 'Natação em Águas Abertas',
          icon: '🏊',
          desc: 'Óculos espelhados, wetsuits flexíveis e boias de sinalização.',
          micros: [
            {
              name: 'Wetsuits de Neoprene Flexíveis e Boias de Sinalização',
              desc: 'Reviews de roupas de borracha térmica que ajudam na flutuabilidade e segurança em mar aberto.',
              lucratividade: 'Afiliação de marcas de natação e parcerias com assessorias esportivas de travessia.',
              caseStudy: { site: 'SwimSwam.com (seção águas abertas)', earnings: 'Líder em publicidade e afiliados de natação global', strategy: 'Resenhas de óculos de proteção contra embaçamento sob luz solar intensa.' },
              details: ['Keywords: "boia de segurança natacao mar aberto", "roupa de neoprene natação travessia".', 'Praticantes focados em competições e segurança ativa na natureza.']
            }
          ]
        }
      ]
    },
    {
      id: 'gardening',
      name: 'Jardinagem & Plantas',
      icon: '🌻',
      desc: 'Plantas de interior, suculentas raras, orquídeas exóticas, cultivo de pimentas e bonsai.',
      subs: [
        {
          id: 'houseplants',
          name: 'Plantas de Interior (Houseplants)',
          icon: '🪴',
          desc: 'Costelas-de-Adão, suculentas gigantes, vasos decorativos e adubação orgânica.',
          micros: [
            {
              name: 'Substratos e Vasos de Autoirrigação para Costelas-de-Adão',
              desc: 'Reviews de substratos leves contra fungo de raiz, adubação de folhas e vasos inteligentes.',
              lucratividade: 'Afiliação da Amazon de adubos e vasos e dropshipping de vasos de cerâmica estéticos.',
              caseStudy: { site: 'TheSpruce.com (divisão jardinagem)', earnings: 'Faturamento milionário com anúncios e afiliados', strategy: 'Guias de rega com ilustrações simples e diagnóstico de folhas amarelas.' },
              details: ['Keywords: "folhas amarelas costela de adao o que fazer", "vaso autoirrigavel funciona".', 'Público que investe na estética verde da casa de forma contínua.']
            }
          ]
        },
        {
          id: 'succulents',
          name: 'Cultivo de Suculentas Raras',
          icon: '🌵',
          desc: 'Solo de drenagem rápida, estufas e iluminação de cultivo LED.',
          micros: [
            {
              name: 'Painéis LED de Cultivo Artificial para Suculentas',
              desc: 'Reviews de iluminação de espectro total para manter a cor vibrante de suculentas cultivadas em ambientes internos.',
              lucratividade: 'Venda de brotos e mudas de suculentas raras embaladas com segurança e afiliação.',
              caseStudy: { site: 'SucculentsAndSunshine.com', earnings: '+US$ 40K/mês', strategy: 'E-books ensinando como salvar suculentas apodrecendo por excesso de rega.' },
              details: ['Keywords: "lampada led para suculentas indoor", "solo para suculentas drenagem rapida".', 'Audiência de colecionadores obstinados em cultivar espécies exóticas em casa.']
            }
          ]
        },
        {
          id: 'orchids',
          name: 'Orquidicultura',
          icon: '🌸',
          desc: 'Fertilização foliar, substratos de casca de pinus e floração de espécies exóticas.',
          micros: [
            {
              name: 'Fertilizantes Foliares e Cascas de Pinus Tratadas',
              desc: 'Como fazer orquídeas Phalaenopsis florescerem novamente usando adubação foliar e substratos corretos.',
              lucratividade: 'Parcerias com floriculturas online de orquídeas exóticas e cursos digitais de cultivo.',
              caseStudy: { site: 'OrchidBoard.com', earnings: '+US$ 15K/mês (tráfego + publicidade)', strategy: 'Fórum ativo e guias de identificação de pragas nas raízes.' },
              details: ['Keywords: "como fazer orquidea dar flores novamente", "adubo foliar para orquideas".', 'Público fiel de aposentados com dedicação diária ao cuidado de suas coleções.']
            }
          ]
        },
        {
          id: 'bonsai-care',
          name: 'Cultivo de Bonsai',
          icon: '🌳',
          desc: 'Ferramentas de poda côncavas, arames de alumínio e técnicas de curvatura.',
          micros: [
            {
              name: 'Alicates Côncavos Japoneses e Arames de Modelagem',
              desc: 'Análise de kits de poda de aço carbono para cortes cicatrizantes e arames de modelagem.',
              lucratividade: 'Venda de mudas pré-bonsai (pré-cultivadas) e afiliação de ferramentas de precisão importadas.',
              caseStudy: { site: 'BonsaiEmpire.com', earnings: '+US$ 35K/mês (cursos + afiliados)', strategy: 'Vídeos extremamente relaxantes em alta definição ensinando a moldar árvores passo a passo.' },
              details: ['Keywords: "alicate concavo bonsai de precisao", "como modelar bonsai de pinheiro".', 'Hobby artístico de longo prazo com alto envolvimento financeiro.']
            }
          ]
        },
        {
          id: 'chili-peppers',
          name: 'Cultivo de Pimentas Nucleares',
          icon: '🌶️',
          desc: 'Pimentas Carolina Reaper, Bhut Jolokia e sementes de alta pureza.',
          micros: [
            {
              name: 'Sementes de Pimentas Nucleares e Molhos Artesanais',
              desc: 'Como cultivar pimentas super quentes em vasos e receitas de molhos de pimenta caseiros.',
              lucratividade: 'Venda direta de sementes certificadas de alta germinação e kits de molhos artesanais.',
              caseStudy: { site: 'PepperGeek.com', earnings: '+US$ 45K/mês', strategy: 'Testes de ardência gravados provando pimentas cruas com reações divertidas.' },
              details: ['Keywords: "como plantar carolina reaper em vaso", "sementes de pimenta nuclear".', 'Comunidade muito ativa de colecionadores de sementes e molhos quentes.']
            }
          ]
        },
        {
          id: 'vertical-garden',
          name: 'Jardinagem Vertical',
          icon: '🏢',
          desc: 'Módulos de parede verde, irrigação por gotejamento automática.',
          micros: [
            {
              name: 'Sistemas de Irrigação por Gotejamento em Parede Verde',
              desc: 'Reviews de módulos de feltro e plástico para hortas verticais automáticas em varandas de apartamentos.',
              lucratividade: 'Afiliação de marcas de irrigação automática inteligentes e projetos de instalação.',
              caseStudy: { site: 'VerticalGardening.com', earnings: '+US$ 25K/mês', strategy: 'Tutoriais de faça-você-mesmo montando sistemas com tubos de PVC.' },
              details: ['Keywords: "como montar parede verde varanda", "irrigacao automatica gota a gota".', 'Público que vive em apartamentos querendo cultivar alimentos frescos.']
            }
          ]
        },
        {
          id: 'indoor-compost',
          name: 'Compostagem Doméstica',
          icon: '🪱',
          desc: 'Composteiras Bokashi sem cheiro para cozinha.',
          micros: [
            {
              name: 'Composteiras Bokashi de Farelo Fermentado',
              desc: 'Reviews de baldes herméticos de cozinha que aceleram a compostagem de resíduos de comida sem atrair insetos.',
              lucratividade: 'Venda de farelos inoculados Bokashi próprios e comissões da Amazon.',
              caseStudy: { site: 'Composting101 (seção Bokashi)', earnings: '+US$ 20K/mês', strategy: 'Guias práticos comparando o tempo de decomposição com minhocários tradicionais.' },
              details: ['Keywords: "composteira de apartamento bokashi sem cheiro", "farelo bokashi como usar".', 'Audiência engajada em práticas sustentáveis urbanas.']
            }
          ]
        },
        {
          id: 'english-roses',
          name: 'Cultivo de Rosas',
          icon: '🌹',
          desc: 'Adubação de roseiras inglesas e fungicidas ecológicos.',
          micros: [
            {
              name: 'Fungicidas Ecológicos de Cobre e Adubação Orgânica',
              desc: 'Reviews de tratamentos biológicos contra a mancha preta das roseiras e adubos ricos em fósforo para floração.',
              lucratividade: 'Afiliação de viveiros de mudas de rosas inglesas David Austin e venda de e-books de cultivo.',
              caseStudy: { site: 'HeirloomRosesFans (editorial cooperado)', earnings: '+US$ 30K/mês', strategy: 'Fotos macros deslumbrantes de pétalas e dicas de podas corretas pós-inverno.' },
              details: ['Keywords: "como combater mancha preta nas rosas", "adubo caseiro para roseira florir".', 'Público de donos de casas com quintal dedicados ao paisagismo floral de prestígio.']
            }
          ]
        },
        {
          id: 'potted-fruits',
          name: 'Frutíferas em Vasos',
          icon: '🍋',
          desc: 'Limoeiros e jabuticabeiras anãs para varandas.',
          micros: [
            {
              name: 'Jabuticabeiras Anãs e Limoeiros Sicilianos em Vasos',
              desc: 'Guias de poda de contenção de raiz e adubação mineral para produção de frutos em vasos pequenos.',
              lucratividade: 'Indicação de fornecedores de mudas enxertadas produtivas e afiliação de vasos pesados.',
              caseStudy: { site: 'GrowVeg.com (seção frutíferas)', earnings: 'Faturamento milionário corporativo', strategy: 'Planejador digital de plantio associado a links afiliados de fertilizantes.' },
              details: ['Keywords: "limao siciliano em vaso como produzir", "jabuticabeira enxertada vaso".', 'Consumidores buscando o prazer de colher frutas frescas mesmo sem ter quintal.']
            }
          ]
        },
        {
          id: 'carnivorous-plants',
          name: 'Plantas Carnívoras',
          icon: '🪴',
          desc: 'Dioneias, Nepenthes em musgo esfagno.',
          micros: [
            {
              name: 'Dioneias (Venus Flytrap) em Musgo Esfagno',
              desc: 'Reviews de luzes de cultivo e qualidade de água destilada para manter dioneias saudáveis.',
              lucratividade: 'Venda de sementes e mudas selecionadas e e-books de cultivo de plantas carnívoras.',
              caseStudy: { site: 'CarnivorousPlants.org', earnings: 'Gera receitas para financiar estudos científicos', strategy: 'Artigos técnicos aprofundados sobre a biologia e digestão de insetos pelas plantas.' },
              details: ['Keywords: "como alimentar dioneia planta carnivora", "musgo esfagno para carnivoras".', 'Nicho de colecionadores curiosos e hobbistas entusiastas de plantas exóticas.']
            }
          ]
        }
      ]
    },
    {
      id: 'productivity',
      name: 'Produtividade & Organização',
      icon: '📅',
      desc: 'Bullet journal, templates Notion, pomodoro timers físicos e minimalismo digital.',
      subs: [
        {
          id: 'bullet-journal',
          name: 'Bullet Journal',
          icon: '📓',
          desc: 'Cadernos pontilhados, canetas fine liner e rotinas de planejamento analógico.',
          micros: [
            {
              name: 'Cadernos Pontilhados de Alta Gramatura e Canetas Fine Liner',
              desc: 'Reviews de papel de 160g que não transfere tinta (ghosting) e conjuntos de canetas artísticas de traço fino.',
              lucratividade: 'Venda de cadernos pontilhados de marca própria e links afiliados da Amazon.',
              caseStudy: { site: 'TinyRayofSunshine.com', earnings: '+US$ 25K/mês', strategy: 'Fotografias com layouts minimalistas coloridos desenhados à mão.' },
              details: ['Keywords: "caderno pontilhado 160g que nao sangra", "canetas para bullet journal".', 'Grande engajamento visual de comunidade apaixonada por papelaria e arte.']
            }
          ]
        },
        {
          id: 'notion-templates',
          name: 'Notion Personalizado',
          icon: '💻',
          desc: 'Sistemas Notion para freelancers, estudantes e organização diária.',
          micros: [
            {
              name: 'Templates Notion para Gerenciamento de Projetos Freelancers',
              desc: 'Reviews e tutoriais de quadros Kanban, controle financeiro e rastreamento de tarefas integrados no Notion.',
              lucratividade: 'Venda direta de templates premium digitais com entrega automática por e-mail.',
              caseStudy: { site: 'RedGregory (Notion Specialist)', earnings: '+US$ 60K/mês', strategy: 'Páginas gratuitas de download de blocos específicos que servem de isca para as versões pagas.' },
              details: ['Keywords: "template notion organizar estudos gratis", "notion para controle financeiro".', 'Facilidade logística total (produto digital sem estoque ou frete).']
            }
          ]
        },
        {
          id: 'time-management',
          name: 'Gestão de Tempo',
          icon: '⏱️',
          desc: 'Pomodoro timers físicos e planejadores diários.',
          micros: [
            {
              name: 'Pomodoro Timers Físicos e Planners Diários',
              desc: 'Reviews de relógios de contagem regressiva hexagonais sem distrações digitais e planners semanais.',
              lucratividade: 'Afiliação de relógios de mesa inteligentes e venda de blocos de anotações impressos.',
              caseStudy: { site: 'Lifehack.org (seção time management)', earnings: 'Faturamento milionário com anúncios e cursos', strategy: 'Lista de hacks de produtividade baseados em rotinas científicas de foco.' },
              details: ['Keywords: "relogio pomodoro fisico para mesa", "planner semanal de mesa papel".', 'Público corporativo focado em eficiência laboral e foco.']
            }
          ]
        },
        {
          id: 'digital-org',
          name: 'Organização Digital',
          icon: '🗄️',
          desc: 'Métodos Inbox Zero e arquivamento em nuvem.',
          micros: [
            {
              name: 'Método Inbox Zero e Armazenamento em Nuvem Pessoal',
              desc: 'Reviews de aplicativos de automação de e-mail e sistemas de pastas para arquivos digitais livres de bagunça.',
              lucratividade: 'Afiliação de serviços de hospedagem e venda de cursos de organização digital corporativa.',
              caseStudy: { site: 'KeepProductive.com', earnings: '+US$ 80K/mês (plataforma + youtube)', strategy: 'Reviews de novos softwares de anotações comparando recursos de busca e tags.' },
              details: ['Keywords: "como organizar e-mails inbox zero", "servicos de nuvem criptografada".', 'Profissionais de tecnologia buscando otimizar seu fluxo digital diário.']
            }
          ]
        },
        {
          id: 'weekly-planning',
          name: 'Planejamento Semanal',
          icon: '🗓️',
          desc: 'Planners de mesa ecológicos e blocos de organização semanal.',
          micros: [
            {
              name: 'Planners Semanais de Mesa de Papel Reciclado',
              desc: 'Reviews de planners horizontais que ficam embaixo do teclado facilitando a anotação ativa diária.',
              lucratividade: 'Dropshipping de papelaria corporativa premium de bambu e papel reciclado.',
              caseStudy: { site: 'PassionPlanner Fans (editorial)', earnings: '+US$ 40K/mês', strategy: 'Estudos de caso reais de pessoas que atingiram objetivos usando metas semanais.' },
              details: ['Keywords: "planner semanal horizontal de mesa", "bloco organizador semanal".', 'Audiência de secretárias, gerentes de projetos e estudantes organizados.']
            }
          ]
        },
        {
          id: 'gtd-method',
          name: 'Método GTD',
          icon: '📥',
          desc: 'Getting Things Done (método de produtividade pessoal de David Allen).',
          micros: [
            {
              name: 'Sistemas Digitais baseados no Getting Things Done (GTD)',
              desc: 'Reviews de aplicativos como Todoist e Things 3 configurados especificamente com as 5 etapas do método GTD.',
              lucratividade: 'Venda de mentorias de organização pessoal e comissões de indicações de apps premium.',
              caseStudy: { site: 'GTDTimes (editorial licenciado)', earnings: '+US$ 55K/mês', strategy: 'Artigos mostrando como CEOs e celebridades organizam seus projetos diários.' },
              details: ['Keywords: "como configurar o todoist para GTD", "metodo getting things done guias".', 'Público executivo altamente focado em otimização de tempo.']
            }
          ]
        },
        {
          id: 'digital-minimalism',
          name: 'Minimalismo Digital',
          icon: '📴',
          desc: 'Bloqueadores de distrações e redução do tempo de tela.',
          micros: [
            {
              name: 'Aplicativos de Bloqueio de Celular e Telefones Minimalistas',
              desc: 'Reviews de celulares de e-ink (tela de tinta eletrônica sem distrações) e bloqueadores de aplicativos de redes sociais.',
              lucratividade: 'Indicação afiliada de dispositivos minimalistas (Light Phone, etc.) e e-books de detox digital.',
              caseStudy: { site: 'CalNewportBlog (seção Digital Minimalism)', earnings: 'Faturamento milionário com livros e palestras', strategy: 'Ensaios profundos sobre o impacto do vício em redes sociais na foco cognitivo.' },
              details: ['Keywords: "celular e-ink minimalista comprar", "como fazer detox digital celular".', 'Audiência cansada do vício em notificações buscando paz mental.']
            }
          ]
        },
        {
          id: 'speed-reading',
          name: 'Leitura Rápida',
          icon: '📖',
          desc: 'Aplicativos de leitura e técnicas de fixação visual de blocos.',
          micros: [
            {
              name: 'Softwares de Leitura Rápida de Bloco de Texto',
              desc: 'Reviews de apps que aumentam a velocidade de leitura movendo as palavras rapidamente no centro da tela (tecnologia RSVP).',
              lucratividade: 'Afiliação de assinaturas de aplicativos e cursos digitais de memorização ativa.',
              caseStudy: { site: 'IrisReading (seção blog)', earnings: '+US$ 50K/mês', strategy: 'Testes de velocidade de leitura gratuitos que capturam e-mails de leads.' },
              details: ['Keywords: "melhor aplicativo de leitura rapida", "como ler 1 livro por semana".', 'Público que busca devorar conhecimento para concursos ou mercado corporativo.']
            }
          ]
        },
        {
          id: 'growth-journals',
          name: 'Diários de Crescimento',
          icon: '📔',
          desc: 'Diários com prompts reflexivos e inteligência emocional.',
          micros: [
            {
              name: 'Diários com Perguntas Diárias para Foco Mental',
              desc: 'Reviews de cadernos de couro e blocos de notas com questionários estruturados de autoavaliação.',
              lucratividade: 'Alta margem com dropshipping próprio de papelaria estético premium ou afiliação.',
              caseStudy: { site: 'IntelligentChangeFans', earnings: '+US$ 120K/mês (afiliados + vendas)', strategy: 'Postagens de fotos estéticas com citações inspiradoras do diário "The Five Minute Journal".' },
              details: ['Keywords: "diario de cinco minutos onde comprar", "diarios reflexivos prompts".', 'Forte tráfego no Pinterest e apelo motivacional visual.']
            }
          ]
        },
        {
          id: 'closet-organization',
          name: 'Organização de Armários',
          icon: '🧥',
          desc: 'Cabides ultrafinos e organizadores de gaveta de veludo.',
          micros: [
            {
              name: 'Cabides de Veludo Ultrafinos e Organizadores de Meias',
              desc: 'Reviews de cabides antiderrapantes que otimizam o espaço vertical de guarda-roupas.',
              lucratividade: 'Afiliação da Amazon de alta conversão de utilidades domésticas organizacionais.',
              caseStudy: { site: 'ClosetCore (editorial)', earnings: '+US$ 30K/mês', strategy: 'Antes e depois de closets residenciais bagunçados organizados visualmente.' },
              details: ['Keywords: "cabide de veludo fino antiderrapante", "organizadores de gaveta dobra".', 'Alta conversão de afiliação devido ao baixo preço dos produtos sugeridos.']
            }
          ]
        }
      ]
    },
    {
      id: 'business',
      name: 'Negócios & Empreendedorismo',
      icon: '🏢',
      desc: 'Lançamento de infoprodutos, e-commerce dropshipping local, consultorias de SEO e gravação de podcasts.',
      subs: [
        {
          id: 'sales-pages',
          name: 'Infoprodutos & Copywriting',
          icon: '✍️',
          desc: 'Modelos de página de vendas de alta conversão e copy persuasiva.',
          micros: [
            {
              name: 'Templates de Páginas de Vendas e Elementos de Copy',
              desc: 'Reviews de construtores de landing pages (Kajabi, WordPress) e roteiros prontos de e-mail marketing.',
              lucratividade: 'Venda de pacotes de roteiros de e-mail (copywriting) e afiliação de construtores de sites.',
              caseStudy: { site: 'Copyblogger.com', earnings: 'Negócio de serviços e SaaS multimilionário', strategy: 'Artigos ensinando a arte de escrever títulos atraentes que geram cliques.' },
              details: ['Keywords: "como escrever pagina de vendas copywriting", "modelos de e-mail que vendem".', 'Público de infoprodutores e agências buscando otimizar suas taxas de conversão.']
            }
          ]
        },
        {
          id: 'dropshipping-local',
          name: 'Dropshipping Nacional',
          icon: '📦',
          desc: 'Mineração de produtos e fornecedores brasileiros com entrega rápida.',
          micros: [
            {
              name: 'Fornecedores Locais e Softwares de Integração de Pedidos',
              desc: 'Reviews de fornecedores nacionais (produtos físicos) e ferramentas que automatizam os envios (D drop, etc.).',
              lucratividade: 'Venda de listas de fornecedores validados e afiliação de plataformas de e-commerce (Shopify, Nuvemshop).',
              caseStudy: { site: 'Shopify Blog (seção Dropshipping)', earnings: 'Bilhões de dólares de ecossistema', strategy: 'Guias práticos de mineração de produtos de alta demanda viral baseados em anúncios do TikTok.' },
              details: ['Keywords: "fornecedores dropshipping nacional frete rapido", "como minerar produtos vencedores".', 'Grande apelo para jovens querendo criar seu primeiro negócio online sem investir em estoque.']
            }
          ]
        },
        {
          id: 'local-seo',
          name: 'SEO para Negócios Locais',
          icon: '🗺️',
          desc: 'Google Meu Negócio e otimização para buscas locais de serviços.',
          micros: [
            {
              name: 'Auditorias de Google Meu Negócio e Links Locais',
              desc: 'Como posicionar clínicas, restaurantes e lojas locais nas buscas do Google Maps em sua cidade.',
              lucratividade: 'Venda de relatórios de auditoria automatizados e cursos de formação de consultores de SEO local.',
              caseStudy: { site: 'SearchEngineLand.com (seção Local SEO)', earnings: 'Faturamento milionário com anúncios e eventos virtuais', strategy: 'Resolução de atualizações algorítmicas do Google Maps explicadas de forma simples.' },
              details: ['Keywords: "como posicionar minha empresa no google maps", "consultoria de seo local".', 'Excelente mercado de serviços B2B com possibilidade de faturar mensalidades recorrentes.']
            }
          ]
        },
        {
          id: 'lms-systems',
          name: 'Plataformas de Cursos (LMS)',
          icon: '🎓',
          desc: 'Sistemas de ensino online e ferramentas de gravação de videoaulas.',
          micros: [
            {
              name: 'Softwares LMS e Câmeras de Gravação de Videoaulas',
              desc: 'Reviews e comparativos de plataformas de membros e microfones de lapela USB recomendados para professores online.',
              lucratividade: 'Afiliação de softwares de hospedagem de cursos com comissões recorrentes excelentes.',
              caseStudy: { site: 'Teachable Blog (editorial)', earnings: 'Faturamento milionário cooperado', strategy: 'Estudos de caso mostrando faturamentos de criadores de cursos independentes de nichos incomuns (como desenho).' },
              details: ['Keywords: "melhor plataforma para hospedar curso online", "microfone usb para gravar videoaulas".', 'Criadores de conteúdo e profissionais experientes buscando monetizar seu conhecimento.']
            }
          ]
        },
        {
          id: 'podcast-gear',
          name: 'Produção de Podcasts',
          icon: '🎙️',
          desc: 'Mesas de som portáteis, gravadores digitais e softwares de edição automatizados.',
          micros: [
            {
              name: 'Mesas de Som Portáteis (Rodecaster) e Gravadores de Linha',
              desc: 'Reviews de equipamentos de gravação de áudio com cancelamento de ruído em tempo real para entrevistas presenciais.',
              lucratividade: 'Comissões excelentes com equipamentos eletrônicos profissionais e parcerias com estúdios.',
              caseStudy: { site: 'PodcastHost.com', earnings: '+US$ 50K/mês', strategy: 'Guias e diagramas de conexão visual simplificando a engenharia de som para iniciantes.' },
              details: ['Keywords: "melhor mesa de som para podcast usb", "como gravar podcast a distancia".', 'Nicho corporativo e de criadores de marcas com alto poder aquisitivo.']
            }
          ]
        },
        {
          id: 'branding-packs',
          name: 'Design de Branding Corporativo',
          icon: '🎨',
          desc: 'Identidade visual de startups e pacotes de mockup prontos.',
          micros: [
            {
              name: 'Mockups e Identidades Visuais Prontas para Startups',
              desc: 'Reviews de pacotes de identidade de marca com logotipos e tipografias customizáveis.',
              lucratividade: 'Venda de arquivos digitais vetoriais próprios e assinaturas afiliadas do Adobe Creative Cloud.',
              caseStudy: { site: 'BrandNew (UnderConsideration Blog)', earnings: '+US$ 40K/mês (assinaturas e prêmios)', strategy: 'Análises críticas ácidas e aprofundadas dos redesigns de logomarcas de grandes corporações mundiais.' },
              details: ['Keywords: "pacote de mockup de identidade visual", "branding pronto para empresa".', 'Designer freelancers e fundadores de startups buscando material ágil de qualidade.']
            }
          ]
        },
        {
          id: 'photo-licensing',
          name: 'Venda de Fotos Online',
          icon: '📷',
          desc: 'Fotografia comercial para bancos de imagens e marcas.',
          micros: [
            {
              name: 'Licenciamento de Imagens Comerciais para Bancos de Fotos',
              desc: 'Como tirar fotos estéticas e comercializar seus direitos de imagem no Shutterstock, Adobe Stock e iStock.',
              lucratividade: 'Comissões de indicação de equipamentos de iluminação de estúdio e venda de presets de Lightroom.',
              caseStudy: { site: 'Shutterstock Contributor Blog (editorial)', earnings: 'Bilhões distribuídos a fotógrafos', strategy: 'Tendências mensais de busca visual mapeadas informando quais tipos de fotos têm maior demanda comercial imediata.' },
              details: ['Keywords: "como vender fotos no shutterstock", "presets lightroom fotografia comercial".', 'Fotógrafos amadores e profissionais querendo monetizar seus arquivos guardados.']
            }
          ]
        },
        {
          id: 'virtual-assistant',
          name: 'Assistentes Virtuais',
          icon: '💻',
          desc: 'Gestão de agendas, atendimento ao cliente digital e ferramentas de CRM.',
          micros: [
            {
              name: 'Softwares de CRM e Calendários Compartilhados para Assistentes',
              desc: 'Reviews de ferramentas como Asana, Trello e softwares de disparo de mensagens automáticas de WhatsApp.',
              lucratividade: 'Afiliação de softwares corporativos e venda de cursos de formação profissional.',
              caseStudy: { site: 'VirtualAssistantSavvy', earnings: '+US$ 30K/mês', strategy: 'Simulados de contratação e modelos de contratos de prestação de serviços prontos para download.' },
              details: ['Keywords: "como trabalhar de assistente virtual home office", "ferramentas de agenda compartilhada".', 'Público majoritariamente feminino buscando transição rápida de carreira para o home office.']
            }
          ]
        },
        {
          id: 'franchise-low-cost',
          name: 'Franquias de Baixo Custo',
          icon: '🏪',
          desc: 'Microfranquias home-based e de serviços digitais.',
          micros: [
            {
              name: 'Microfranquias Home-Based e de Serviços Digitais',
              desc: 'Reviews comparativos de franquias baratas com investimento inicial abaixo de R$ 20.000.',
              lucratividade: 'Altas comissões de intermediação comercial de marcas franqueadoras e anúncios patrocinados.',
              caseStudy: { site: 'FranchiseTimes.com', earnings: 'Faturamento milionário com anúncios e eventos do setor', strategy: 'Tabelas financeiras de tempo estimado de retorno sobre investimento (ROI) de marcas.' },
              details: ['Keywords: "melhores microfranquias de baixo custo 2026", "franquias baratas home office".', 'Investidores individuais querendo abrir negócios físicos/serviços de forma rápida e segura.']
            }
          ]
        },
        {
          id: 'authority-affiliate',
          name: 'Marketing de Afiliados de Nicho',
          icon: '🔗',
          desc: 'Estratégias de tráfego orgânico para blogs de reviews de produtos.',
          micros: [
            {
              name: 'Estratégias de Tráfego Orgânico para Blogs de Reviews',
              desc: 'Como criar conteúdo focado em intenção de compra comercial (ex: "melhor X de 2026") e posicionar no Google.',
              lucratividade: 'Indicação de serviços de hospedagem web (Hostinger, Bluehost) com altas margens de afiliação.',
              caseStudy: { site: 'AuthorityHacker.com', earnings: 'Faturamento milionário com cursos e afiliação de ferramentas', strategy: 'Testes empíricos profundos de novos plugins de WordPress e inteligência artificial.' },
              details: ['Keywords: "como estruturar site de afiliados do zero", "melhores ferramentas de seo".', 'Empreendedores digitais experientes buscando escalar sua rede de sites.']
            }
          ]
        }
      ]
    }
  ]
};

let selectedMacro = null;
let selectedSub = null;

// Shuffle utility for randomizing arrays
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function initNicheSelector() {
  selectedMacro = null;
  selectedSub = null;
  
  // Reset navigation steps
  updateNicheSteps(1);
  renderNicheStep1();
}

function updateNicheSteps(step) {
  // Update indicators
  const label = document.getElementById('niche-step-label');
  if (label) label.textContent = `Passo ${step} de 3`;
  
  // Progress tracker classes
  for (let i = 1; i <= 3; i++) {
    const progStep = document.getElementById(`prog-step-${i}`);
    if (progStep) {
      if (i === step) {
        progStep.classList.add('active');
      } else {
        progStep.classList.remove('active');
      }
    }
  }

  // Display/Hide steps content
  document.getElementById('niche-step-1').style.display = step === 1 ? 'block' : 'none';
  document.getElementById('niche-step-2').style.display = step === 2 ? 'block' : 'none';
  document.getElementById('niche-step-3').style.display = step === 3 ? 'block' : 'none';
}

function renderNicheStep1() {
  const container = document.getElementById('macro-niche-list');
  if (!container) return;
  
  // Select at least 12 random macro niches each time the user enters
  const shuffledMacros = shuffleArray(NicheData.macro).slice(0, 12);
  
  container.innerHTML = shuffledMacros.map(macro => `
    <div class="macro-card" data-id="${macro.id}">
      <div class="macro-card-icon">${macro.icon}</div>
      <h4>${macro.name}</h4>
      <p>${macro.desc}</p>
    </div>
  `).join('');

  // Attach event listeners
  container.querySelectorAll('.macro-card').forEach(card => {
    card.addEventListener('click', () => {
      const macroId = card.getAttribute('data-id');
      selectedMacro = NicheData.macro.find(m => m.id === macroId);
      updateNicheSteps(2);
      renderNicheStep2();
      if (window.comeceRapidoState && window.comeceRapidoState.active) {
        window.comeceRapidoState.selectedMacro = selectedMacro;
        showSafiraComicBubble('.sub-card', 1);
      }
    });
  });
}

function renderNicheStep2() {
  const container = document.getElementById('sub-niche-list');
  const title = document.getElementById('sub-niche-title');
  if (!container || !selectedMacro) return;
  
  if (title) title.textContent = `Macro Nicho: ${selectedMacro.name} → Selecione uma Especialidade:`;

  // Select 8 random sub-niches within the chosen macro niche
  const shuffledSubs = shuffleArray(selectedMacro.subs).slice(0, 8);

  container.innerHTML = shuffledSubs.map(sub => `
    <div class="sub-card" data-id="${sub.id}">
      <div class="sub-card-icon">${sub.icon}</div>
      <div class="sub-card-info">
        <h4>${sub.name}</h4>
        <p>${sub.desc}</p>
      </div>
    </div>
  `).join('');

  // Attach event listeners
  container.querySelectorAll('.sub-card').forEach(card => {
    card.addEventListener('click', () => {
      const subId = card.getAttribute('data-id');
      selectedSub = selectedMacro.subs.find(s => s.id === subId);
      updateNicheSteps(3);
      renderNicheStep3();
      if (window.comeceRapidoState && window.comeceRapidoState.active) {
        window.comeceRapidoState.selectedSub = selectedSub;
        showSafiraComicBubble('.btn-select-micro-niche', 1);
      }
    });
  });
}

function renderNicheStep3() {
  const container = document.getElementById('micro-niche-list');
  const title = document.getElementById('micro-niche-title');
  if (!container || !selectedSub) return;

  if (title) title.textContent = `Especialidade: ${selectedSub.name} → Micro Nichos Disponíveis:`;

  container.innerHTML = selectedSub.micros.map((micro, index) => `
    <div class="micro-card">
      <div class="micro-card-header">
        <div class="micro-card-title">
          <h4>${micro.name}</h4>
          <span class="micro-card-lucrative-badge">🔥 Lucratividade Validada</span>
        </div>
      </div>
      
      <p class="micro-card-description">${micro.desc}</p>
      
      <div class="micro-card-details-grid">
        <div class="micro-detail-panel">
          <h5>💸 Por que é Lucrativo?</h5>
          <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 12px;">${micro.lucratividade}</p>
          <h5>🎯 Dicas e Palavras-chave</h5>
          <ul>
            ${micro.details.map(detail => `<li>${detail}</li>`).join('')}
          </ul>
        </div>
        
        <div class="micro-detail-panel micro-case-study">
          <h5>🇺🇸 Caso de Sucesso Americano</h5>
          <p style="font-size: 0.85rem; color: var(--text-main); font-weight: bold; margin-bottom: 8px;">
            Blog de Referência: <span style="color: var(--secondary); font-size: 1rem;">${micro.caseStudy.site}</span>
          </p>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px;">
            <strong>Resultado Estimado:</strong> <span class="case-metric">${micro.caseStudy.earnings}</span>
          </p>
          <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; margin: 0;">
            <strong>Estratégia do Case:</strong> ${micro.caseStudy.strategy}
          </p>
        </div>
      </div>

      <div style="text-align: right;">
        <button type="button" class="btn btn-primary btn-select-micro-niche" data-index="${index}">
          ⚡ Escolher este Nicho e Criar Blog
        </button>
      </div>
    </div>
  `).join('');

  // Attach event listeners
  container.querySelectorAll('.btn-select-micro-niche').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-index'), 10);
      const chosenMicro = selectedSub.micros[idx];
      
      selectNicheAndRedirect(chosenMicro);
    });
  });
}

function selectNicheAndRedirect(micro) {
  if (window.comeceRapidoState && window.comeceRapidoState.active) {
    window.comeceRapidoState.selectedMicro = micro;
  }
  
  // Fill the Create Blog Wizard Form fields
  if (el.siteTheme) {
    el.siteTheme.value = 'custom';
    el.siteTheme.dispatchEvent(new Event('change'));
  }
  
  if (el.siteCustomTheme) {
    el.siteCustomTheme.value = micro.name;
    el.siteCustomTheme.dispatchEvent(new Event('input')); // Generate repository slug
  }
  
  if (el.siteDescription) {
    el.siteDescription.value = `Um blog premium focado em reviews, tutoriais e análises sinceras sobre ${micro.name.toLowerCase()}, ajudando entusiastas a tomarem decisões de compra inteligentes com base em dados de qualidade.`;
  }
  
  showToast(`Nicho "${micro.name}" selecionado com sucesso!`, 'success');
  
  // Transition smoothly to Create Blog tab
  showView('newSite');
  
  if (window.comeceRapidoState && window.comeceRapidoState.active) {
    advanceComeceRapidoComic(2);
  }
}

// Wire up Back Buttons in DOMContentLoaded step
document.addEventListener('DOMContentLoaded', () => {
  const backToStep1 = document.getElementById('btn-back-to-step1');
  const backToStep2 = document.getElementById('btn-back-to-step2');
  
  if (backToStep1) {
    backToStep1.addEventListener('click', () => {
      updateNicheSteps(1);
    });
  }
  
  if (backToStep2) {
    backToStep2.addEventListener('click', () => {
      updateNicheSteps(2);
    });
  }
});;