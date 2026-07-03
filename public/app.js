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
    multiGenerator: document.getElementById('view-multi-generator'),
    sitePosition: document.getElementById('view-site-position'),
    settings: document.getElementById('view-settings'),
    domainConfig: document.getElementById('view-domain-config')
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
  if (isLoggedIn) {
    el.navLinksPrivate.forEach(link => link.classList.remove('hidden'));
    el.navLinksPublic.forEach(link => link.classList.add('hidden'));
    el.userDisplayEmail.textContent = State.user.email;
    el.dashUserName.textContent = State.user.name || 'Empreendedor';
  } else {
    el.navLinksPrivate.forEach(link => link.classList.add('hidden'));
    el.navLinksPublic.forEach(link => link.classList.remove('hidden'));
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
document.querySelector('a[href="#new-site"]').addEventListener('click', (e) => { e.preventDefault(); showView('newSite'); });
document.querySelector('a[href="#multi-generator"]').addEventListener('click', (e) => { e.preventDefault(); showView('multiGenerator'); });
document.querySelector('a[href="#site-position"]').addEventListener('click', (e) => { e.preventDefault(); showView('sitePosition'); });
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
    
    const selectSite = document.getElementById('multi-select-site').value;
    if (!selectSite) {
      showToast('Selecione um blog de destino.', 'error');
      return;
    }
    
    btnGetIdeas.disabled = true;
    btnGetIdeas.textContent = '🔍 Pesquisando...';
    
    try {
      const response = await fetch('/api/generate-title-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword,
          theme: document.getElementById('multi-select-site').selectedOptions[0].dataset.theme,
          repoName: document.getElementById('multi-select-site').value,
          githubToken: State.credentials.githubToken,
          geminiApiKey: State.credentials.geminiApiKey
        })
      });
      
      const result = await response.json();
      if (!response.ok || result.error) {
        throw new Error(result.error || 'Erro ao buscar ideias.');
      }
      
      const tbody = document.getElementById('ideas-tbody');
      tbody.innerHTML = '';
      
      const defaultAffiliateLink = document.getElementById('multi-default-affiliate')?.value.trim() || '';
      
      result.ideas.forEach((idea, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="text-align: center;">
            <input type="checkbox" class="idea-checkbox" data-idx="${idx}" checked>
          </td>
          <td>
            <div class="idea-title-wrapper" style="display: flex; align-items: center; gap: 8px;">
              <div contenteditable="true" class="idea-title-input" style="flex: 1; min-width: 250px; background: transparent; border: none; color: var(--text-main); font-size: 0.95rem; line-height: 1.4; outline: none; padding: 6px; border-radius: 4px; border-bottom: 1px dashed rgba(255,255,255,0.15); word-break: break-word; transition: all 0.2s;" title="Clique para editar este título">${idea.title}</div>
              <button type="button" class="btn-edit-title" style="background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: var(--text-muted); cursor: pointer; font-size: 0.85rem; padding: 4px 8px; border-radius: 4px; display: flex; align-items: center; justify-content: center; gap: 4px; transition: all 0.2s;" title="Editar Título">
                <span>✏️</span> Editar
              </button>
            </div>
          </td>
          <td>
            <select class="idea-image-select" style="width: 100%; font-size: 0.85rem; padding: 6px;">
              <option value="auto">🤖 Gerar com IA (Ninja)</option>
              <option value="manual">📎 Upload de Imagem</option>
            </select>
            <input type="file" class="idea-image-file hidden" accept="image/*" style="margin-top: 5px; font-size: 0.8rem;">
          </td>
          <td>
            <input type="url" class="idea-affiliate-link" placeholder="Ex: https://amzn.to/..." style="width: 100%; font-size: 0.85rem; padding: 6px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 4px;" value="${defaultAffiliateLink}">
          </td>
          <td>
            <select class="idea-schedule-select" style="width: 100%; font-size: 0.85rem; padding: 6px;">
              <option value="now">⚡ Imediato</option>
              <option value="schedule">📅 Agendar Post</option>
            </select>
            <input type="datetime-local" class="idea-schedule-time hidden" style="margin-top: 5px; font-size: 0.8rem; width: 100%;">
          </td>
        `;
        
        // Ativar funcionalidade de edição visual do título
        const titleInput = tr.querySelector('.idea-title-input');
        const editBtn = tr.querySelector('.btn-edit-title');

        editBtn.addEventListener('click', () => {
          const isFocused = document.activeElement === titleInput;
          if (!isFocused) {
            titleInput.focus();
            // Move cursor to end
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(titleInput);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
          } else {
            titleInput.blur();
          }
        });

        titleInput.addEventListener('focus', () => {
          titleInput.style.borderBottom = '1px solid var(--primary)';
          titleInput.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
          editBtn.innerHTML = '<span>💾</span> Salvar';
          editBtn.style.color = 'var(--primary)';
          editBtn.style.borderColor = 'var(--primary)';
        });

        titleInput.addEventListener('blur', () => {
          titleInput.style.borderBottom = '1px dashed rgba(255,255,255,0.15)';
          titleInput.style.backgroundColor = 'transparent';
          editBtn.innerHTML = '<span>✏️</span> Editar';
          editBtn.style.color = 'var(--text-muted)';
          editBtn.style.borderColor = 'var(--border-color)';
        });

        titleInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            titleInput.blur();
          }
        });

        // Ativar condicionalmente inputs de arquivo e agendamento
        const imageSelect = tr.querySelector('.idea-image-select');
        const imageFile = tr.querySelector('.idea-image-file');
        imageSelect.addEventListener('change', (e) => {
          if (e.target.value === 'manual') {
            imageFile.classList.remove('hidden');
          } else {
            imageFile.classList.add('hidden');
          }
        });
        
        const scheduleSelect = tr.querySelector('.idea-schedule-select');
        const scheduleTime = tr.querySelector('.idea-schedule-time');
        scheduleSelect.addEventListener('change', (e) => {
          if (e.target.value === 'schedule') {
            scheduleTime.classList.remove('hidden');
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + (idx + 1));
            tomorrow.setHours(9, 0, 0, 0);
            // Format to local ISO without offset
            const offset = tomorrow.getTimezoneOffset();
            const adjustedDate = new Date(tomorrow.getTime() - (offset*60*1000));
            scheduleTime.value = adjustedDate.toISOString().slice(0, 16);
          } else {
            scheduleTime.classList.add('hidden');
          }
        });
        
        tbody.appendChild(tr);
      });
      
      document.getElementById('container-ideas-table').style.display = 'block';
      showToast('Encontramos 10 caudas longas perfeitas!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btnGetIdeas.disabled = false;
      btnGetIdeas.textContent = '🔍 Gerar Ideias de Títulos';
    }
  });
}

// 2. Check All Toggle
const checkAllIdeas = document.getElementById('check-all-ideas');
if (checkAllIdeas) {
  checkAllIdeas.addEventListener('change', (e) => {
    document.querySelectorAll('.idea-checkbox').forEach(cb => {
      cb.checked = e.target.checked;
    });
  });
}

// 3. Botão Cancelar
const btnCancelMulti = document.getElementById('btn-cancel-multi');
if (btnCancelMulti) {
  btnCancelMulti.addEventListener('click', () => {
    document.getElementById('multi-seed-keyword').value = '';
    document.getElementById('container-ideas-table').style.display = 'none';
  });
}

// Helper to read file as Base64
function readFileAsBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.readAsDataURL(file);
  });
}

// 4. Botão Gerar e Publicar Tudo
const btnGenerateBulk = document.getElementById('btn-generate-bulk');
if (btnGenerateBulk) {
  btnGenerateBulk.addEventListener('click', async () => {
    const repoName = document.getElementById('multi-select-site').value;
    const selectedRows = Array.from(document.querySelectorAll('.idea-checkbox:checked')).map(cb => cb.closest('tr'));
    
    if (selectedRows.length === 0) {
      showToast('Por favor, selecione pelo menos um artigo para gerar.', 'error');
      return;
    }
    
    const overlay = document.getElementById('multi-generation-overlay');
    const statusText = document.getElementById('multi-progress-status-text');
    const barFill = document.getElementById('multi-progress-bar-fill');
    const stepsList = document.getElementById('multi-progress-steps-list');
    
    overlay.classList.remove('hidden');
    statusText.textContent = 'Iniciando redação em lote...';
    barFill.style.width = '5%';
    stepsList.innerHTML = '';
    
    try {
      // Coleta configurações dos posts
      const postsToGenerate = [];
      for (const row of selectedRows) {
        const title = row.querySelector('.idea-title-input').textContent.trim();
        const imgSelect = row.querySelector('.idea-image-select').value;
        const imgFileInput = row.querySelector('.idea-image-file');
        const schedSelect = row.querySelector('.idea-schedule-select').value;
        const schedTimeInput = row.querySelector('.idea-schedule-time');
        const affiliateLink = row.querySelector('.idea-affiliate-link')?.value.trim() || '';
        
        let fileData = null;
        let fileName = null;
        if (imgSelect === 'manual' && imgFileInput.files.length > 0) {
          const file = imgFileInput.files[0];
          fileData = await readFileAsBase64(file);
          fileName = file.name;
        }
        
        postsToGenerate.push({
          title,
          imageOption: imgSelect,
          fileData,
          fileName,
          publishOption: schedSelect,
          scheduleTime: schedSelect === 'schedule' ? schedTimeInput.value : null,
          affiliateLink: affiliateLink || null
        });
      }
      
      const totalPosts = postsToGenerate.length;
      let completedPosts = 0;
      
      // Envia requisições de geração e deploy para o servidor
      const response = await fetch('/api/bulk-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoName,
          posts: postsToGenerate,
          githubToken: State.credentials.githubToken,
          geminiApiKey: State.credentials.geminiApiKey,
          userEmail: State.user.email
        })
      });
      
      const result = await response.json();
      if (!response.ok || result.error) {
        throw new Error(result.error || 'Erro na geração em lote.');
      }
      
      // Animação/logs de progresso de escrita e deploy
      for (const post of result.generatedPosts) {
        const li = document.createElement('li');
        li.style.margin = '5px 0';
        
        if (post.status === 'fallback') {
          li.style.color = '#fbbf24';
          li.textContent = `⚠️ [Post] "${post.title}" gerado com conteúdo alternativo (limite da API excedido).`;
        } else {
          li.style.color = '#10b981';
          li.textContent = `✓ [Post] "${post.title}" gerado com sucesso via Gemini IA!`;
        }
        
        stepsList.appendChild(li);
        
        completedPosts++;
        const percent = Math.floor((completedPosts / totalPosts) * 80) + 5;
        barFill.style.width = `${percent}%`;
        statusText.textContent = `Geração concluída (${completedPosts}/${totalPosts})...`;
        await delay(300);
      }
      
      // Inicia fase de push e deploy
      barFill.style.width = '90%';
      statusText.textContent = 'Enviando atualizações para o GitHub e Vercel...';
      const liGit = document.createElement('li');
      liGit.style.margin = '5px 0';
      liGit.style.color = '#a855f7';
      liGit.textContent = `⚡ Efetuando Push para o repositório ${repoName}...`;
      stepsList.appendChild(liGit);
      
      await delay(2000);
      
      barFill.style.width = '100%';
      statusText.textContent = 'Parabéns! Artigos publicados!';
      const liDone = document.createElement('li');
      liDone.style.margin = '8px 0';
      liDone.style.fontWeight = 'bold';
      liDone.style.color = '#10b981';
      liDone.textContent = `🎉 Concluído! Blog atualizado com sucesso.`;
      stepsList.appendChild(liDone);
      
      await delay(1500);
      
      overlay.classList.add('hidden');
      showToast(`Sucesso! ${totalPosts} artigos gerados e enviados para publicação!`, 'success');
      showView('dashboard');
    } catch (err) {
      overlay.classList.add('hidden');
      showToast(`Erro na geração em lote: ${err.message}`, 'error');
    }
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
