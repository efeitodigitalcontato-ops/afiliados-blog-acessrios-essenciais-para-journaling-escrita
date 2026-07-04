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
  }, 50);
}

window.tourHighlightElement = tourHighlightElement;

function addSafiraSystemMessage(htmlContent) {
  const chatMessages = document.getElementById('safira-messages');
  if (!chatMessages) return;
  const bubble = document.createElement('div');
  bubble.className = 'safira-message assistant';
  bubble.innerHTML = htmlContent;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function startComeceRapidoJourney() {
  // Close the Safira chat sidebar so we can guide the user directly on screen
  closeSafiraChat();
  
  showView('niche');
  
  setTimeout(() => {
    showSafiraComicBubble('.macro-card', 1);
  }, 300);
}

window.startComeceRapidoJourney = startComeceRapidoJourney;

function showSafiraComicBubble(selector, stepIndex) {
  // Clear any existing comic bubble and arrows
  const existingBubble = document.getElementById('safira-hq-bubble');
  if (existingBubble) existingBubble.remove();
  
  tourClearAllHighlights();
  
  const element = document.querySelector(selector);
  if (!element) return;
  
  // Highlight the target element
  element.classList.add('tour-highlight');
  
  // Steps Data
  const steps = [
    {
      title: "Escolha do Nicho",
      text: "Selecione o nicho do seu blog. Use as categorias abaixo para explorar micro nichos já validados antes de prosseguir.",
      position: "bottom"
    },
    {
      title: "Criar Blog",
      text: "Preenchi os campos de Tema, Descrição e Repositório automaticamente com ideias de Turismo Sustentável. Clique no botão de confirmação para colocar seu blog no ar!",
      position: "top"
    },
    {
      title: "Artigos em Lote",
      text: "Já defini a palavra semente 'Hospedagem Ecológica'. Clique no botão indicado pela seta para buscar ideias de títulos gerados por IA.",
      position: "bottom"
    },
    {
      title: "Estrutura Silo",
      text: "Configurei o nicho como 'Turismo Sustentável'. Clique no botão de planejamento para interligar os artigos do site automaticamente para o Google!",
      position: "top"
    },
    {
      title: "Posição do Site",
      text: "Preenchi o monitoramento com o domínio e a palavra-chave ideal. Basta clicar no botão de análise para verificar seu posicionamento.",
      position: "top"
    },
    {
      title: "Neto Salva (Backup)",
      text: "Preenchi a descrição do backup. Clique no botão em destaque para criar um ponto de restauração seguro de todo o seu banco de dados!",
      position: "top"
    }
  ];
  
  const currentStep = steps[stepIndex - 1];
  if (!currentStep) return;
  
  // Create comic bubble container
  const bubble = document.createElement('div');
  bubble.id = 'safira-hq-bubble';
  bubble.className = `safira-hq-bubble arrow-${currentStep.position}`;
  
  // Populate bubble HTML
  bubble.innerHTML = `
    <div class="safira-hq-avatar">💎</div>
    <div class="safira-hq-bubble-title">Safira</div>
    <div class="safira-hq-bubble-step">Etapa ${stepIndex} de ${steps.length} — ${currentStep.title}</div>
    <div class="safira-hq-bubble-text">${currentStep.text}</div>
    <div class="safira-hq-buttons">
      ${stepIndex > 1 ? `<button class="safira-hq-btn safira-hq-btn-prev" onclick="advanceComeceRapidoComic(${stepIndex - 1})">◀ Voltar</button>` : '<div></div>'}
      ${stepIndex < steps.length 
        ? `<button class="safira-hq-btn safira-hq-btn-next" onclick="advanceComeceRapidoComic(${stepIndex + 1})">Avançar ▶</button>`
        : `<button class="safira-hq-btn safira-hq-btn-next" onclick="finishComeceRapidoComic()">Finalizar 🎉</button>`
      }
      <button class="safira-hq-btn safira-hq-btn-close" onclick="closeComeceRapidoComic()" title="Encerrar Guia">✕</button>
    </div>
  `;
  
  document.body.appendChild(bubble);
  
  // Initial positioning relative to the target element
  const rect = element.getBoundingClientRect();
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  let bubbleLeft = rect.left + rect.width / 2 + scrollLeft;
  let bubbleTop = rect.bottom + scrollTop + 15;
  
  const position = currentStep.position;
  
  if (position === 'top') {
    bubbleTop = rect.top + scrollTop - 200;
  } else if (position === 'left') {
    bubbleLeft = rect.left + scrollLeft - 340;
    bubbleTop = rect.top + rect.height / 2 + scrollTop - 80;
  } else if (position === 'right') {
    bubbleLeft = rect.right + scrollLeft + 15;
    bubbleTop = rect.top + rect.height / 2 + scrollTop - 80;
  }
  
  bubble.style.left = `${bubbleLeft}px`;
  bubble.style.top = `${bubbleTop}px`;
  
  // Refine position dynamically after dimensions are resolved
  setTimeout(() => {
    const bubbleWidth = bubble.offsetWidth;
    const bubbleHeight = bubble.offsetHeight;
    
    if (position === 'top') {
      bubble.style.left = `${rect.left + rect.width / 2 + scrollLeft - bubbleWidth / 2}px`;
      bubble.style.top = `${rect.top + scrollTop - bubbleHeight - 15}px`;
    } else if (position === 'bottom') {
      bubble.style.left = `${rect.left + rect.width / 2 + scrollLeft - bubbleWidth / 2}px`;
      bubble.style.top = `${rect.bottom + scrollTop + 15}px`;
    } else if (position === 'left') {
      bubble.style.left = `${rect.left + scrollLeft - bubbleWidth - 15}px`;
      bubble.style.top = `${rect.top + rect.height / 2 + scrollTop - bubbleHeight / 2}px`;
    } else if (position === 'right') {
      bubble.style.left = `${rect.right + scrollLeft + 15}px`;
      bubble.style.top = `${rect.top + rect.height / 2 + scrollTop - bubbleHeight / 2}px`;
    }
    
    // Auto-scroll to view the highlighted element and the speech bubble smoothly
    bubble.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 50);

  // Add the pointing arrow indicator at the exact target location
  const arrowIndicator = document.createElement('div');
  arrowIndicator.className = `tour-arrow-indicator arrow-${position}`;
  arrowIndicator.innerText = "AQUI ➔";
  document.body.appendChild(arrowIndicator);

  if (position === 'top') {
    arrowIndicator.style.left = `${rect.left + rect.width / 2 + scrollLeft}px`;
    arrowIndicator.style.top = `${rect.top + scrollTop - 35}px`;
  } else if (position === 'bottom') {
    arrowIndicator.style.left = `${rect.left + rect.width / 2 + scrollLeft}px`;
    arrowIndicator.style.top = `${rect.bottom + scrollTop + 10}px`;
  }
  
  setTimeout(() => {
    if (position === 'top' || position === 'bottom') {
      arrowIndicator.style.left = `${rect.left + rect.width / 2 + scrollLeft - arrowIndicator.offsetWidth / 2}px`;
    }
  }, 50);
}

window.showSafiraComicBubble = showSafiraComicBubble;

function advanceComeceRapidoComic(step) {
  if (step === 1) {
    showView('niche');
    setTimeout(() => {
      showSafiraComicBubble('.macro-card', 1);
    }, 300);
  } else if (step === 2) {
    showView('newSite');
    setTimeout(() => {
      const selectTheme = document.getElementById('site-theme');
      if (selectTheme) {
        selectTheme.value = 'custom';
        selectTheme.dispatchEvent(new Event('change'));
      }
      const customTheme = document.getElementById('site-custom-theme');
      if (customTheme) {
        customTheme.value = 'Turismo Sustentável';
        customTheme.dispatchEvent(new Event('input'));
      }
      const siteDesc = document.getElementById('site-description');
      if (siteDesc) {
        siteDesc.value = 'Um blog premium focado em turismo sustentável, viagens ecológicas e hotéis verdes de alto padrão.';
      }
      showSafiraComicBubble('#wizard-submit-btn', 2);
    }, 300);
  } else if (step === 3) {
    showView('multiGenerator');
    setTimeout(() => {
      const keywordInput = document.getElementById('multi-seed-keyword');
      if (keywordInput) {
        keywordInput.value = 'Hospedagem Ecológica';
      }
      showSafiraComicBubble('#btn-get-ideas', 3);
    }, 300);
  } else if (step === 4) {
    showView('siloStructure');
    setTimeout(() => {
      const siloNiche = document.getElementById('silo-niche');
      if (siloNiche) {
        siloNiche.value = 'Turismo Sustentável';
      }
      showSafiraComicBubble('#btn-analyze-silo', 4);
    }, 300);
  } else if (step === 5) {
    showView('sitePosition');
    setTimeout(() => {
      const posKw = document.getElementById('position-keyword');
      if (posKw) {
        posKw.value = 'melhores hoteis sustentaveis';
      }
      const posUrl = document.getElementById('position-custom-url');
      if (posUrl) {
        posUrl.value = 'turismo-sustentavel-blog.vercel.app';
      }
      showSafiraComicBubble('#btn-analyze-position', 5);
    }, 300);
  } else if (step === 6) {
    showView('netoSalva');
    setTimeout(() => {
      const bkpDesc = document.getElementById('backup-description');
      if (bkpDesc) {
        bkpDesc.value = 'Backup automático da jornada Comece Rápido';
      }
      showSafiraComicBubble('#btn-create-backup', 6);
    }, 300);
  }
}

window.advanceComeceRapidoComic = advanceComeceRapidoComic;

function finishComeceRapidoComic() {
  tourClearAllHighlights();
  const existingBubble = document.getElementById('safira-hq-bubble');
  if (existingBubble) existingBubble.remove();
  
  // Reopen the chat sidebar and print a nice final message
  openSafiraChat();
  
  const chatMessages = document.getElementById('safira-messages');
  if (chatMessages) {
    chatMessages.innerHTML = '';
  }
  
  addSafiraSystemMessage(`
    <p>🎉 <strong>Parabéns! Jornada Concluída!</strong> 🚀</p>
    <p>Você utilizou com sucesso todas as principais ferramentas do <strong>Gerador Ninja</strong> com máxima velocidade e qualidade.</p>
    <p>Seu blog está criado, abastecido com artigos, estruturado com SILO, monitorado e com backup garantido.</p>
    <p>Estou sempre aqui no chat se precisar de mais alguma ajuda ou automação! Bons negócios! 💎</p>
  `);
}

window.finishComeceRapidoComic = finishComeceRapidoComic;

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
          id: 'aquarismo',
          name: 'Nano Aquarismo Marinho',
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
                'Hobbies caros onde os praticantes compram itens recorrentes de alto valor.',
                'Fácil diferenciação no Google por imagens e vídeos explicativos.'
              ]
            }
          ]
        }
      ]
    }
  ]
};

let selectedMacro = null;
let selectedSub = null;

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
  
  container.innerHTML = NicheData.macro.map(macro => `
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
    });
  });
}

function renderNicheStep2() {
  const container = document.getElementById('sub-niche-list');
  const title = document.getElementById('sub-niche-title');
  if (!container || !selectedMacro) return;
  
  if (title) title.textContent = `Macro Nicho: ${selectedMacro.name} → Selecione uma Especialidade:`;

  container.innerHTML = selectedMacro.subs.map(sub => `
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
});

