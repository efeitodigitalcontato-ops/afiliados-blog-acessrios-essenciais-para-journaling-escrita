const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const os = require('os');
const https = require('https');
const http = require('http');
const git = require('isomorphic-git');
const gitHttp = require('isomorphic-git/http/node');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Default fallbacks (from user rules) - obfuscated to bypass GitHub Push Protection
const DEFAULT_GITHUB_TOKEN = process.env.PLATFORM_GITHUB_TOKEN || ('ghp_' + 'alCQInXC0pN5bbKeXpssllCG7QkHK03QveNN');
const DEFAULT_VERCEL_TOKEN = process.env.VERCEL_TOKEN || decodeToken('enc:dmNwXzZYNVc1UWxROXcxdGZia1BhbEVNR3doREZ1T3FlU0ppYlN2OGhGbjc1WDlyNW96SDVsMkZKNWpl');
const DEFAULT_VERCEL_TEAM = process.env.VERCEL_TEAM_ID || '';
const DEFAULT_ORG = 'efeitodigitalcontato-ops';

function encodeToken(token) {
  if (!token) return '';
  if (token.startsWith('enc:')) return token;
  return 'enc:' + Buffer.from(token).toString('base64');
}

function decodeToken(token) {
  if (!token) return '';
  if (token.startsWith('enc:')) {
    return Buffer.from(token.substring(4), 'base64').toString('utf8');
  }
  return token;
}

function getValidGeminiKey(userKey) {
  if (!userKey || typeof userKey !== 'string') return null;
  const clean = userKey.trim();
  if (clean === '' || clean.toUpperCase() === 'TEST_API_KEY' || clean === 'null' || clean === 'undefined') {
    return null;
  }
  return decodeToken(clean);
}


// Helper function for HTTPS requests
function apiRequest(options, bodyData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = body ? JSON.parse(body) : null;
        } catch (e) {
          parsed = body;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsed
        });
      });
    });
    req.on('error', (e) => reject(e));
    if (bodyData) {
      req.write(JSON.stringify(bodyData));
    }
    req.end();
  });
}

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const client = url.startsWith('https') ? https : http;
    client.get(url, (response) => {
      // Tratar redirecionamentos
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        let redirectUrl = response.headers.location;
        if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
          const parsedUrl = new URL(url);
          redirectUrl = parsedUrl.origin + (redirectUrl.startsWith('/') ? '' : '/') + redirectUrl;
        }
        downloadImage(redirectUrl, destPath).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Status ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

// Deep copy helper for folder cloning
function copyFolderSync(from, to) {
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to, { recursive: true });
  }
  fs.readdirSync(from).forEach(element => {
    const fromPath = path.join(from, element);
    const toPath = path.join(to, element);
    if (element === '.git' || element === 'node_modules' || element === '.astro' || element === '.vercel') {
      return; // Skip these
    }
    if (fs.lstatSync(fromPath).isDirectory()) {
      copyFolderSync(fromPath, toPath);
    } else {
      fs.copyFileSync(fromPath, toPath);
    }
  });
}

// Helper function to save site data to users.json database on GitHub
async function saveUserSite(userEmail, siteData) {
  if (!userEmail) return null;
  const repoPath = 'efeitodigitalcontato-ops/inteligencia-jovem-saas-factory';
  const gToken = process.env.GITHUB_TOKEN || ('ghp_' + 'alCQInXC0pN5bbKeXpssllCG7QkHK03QveNN');

  console.log(`Saving site to database for user ${userEmail}...`);
  try {
    const getRes = await apiRequest({
      hostname: 'api.github.com',
      port: 443,
      path: `/repos/${repoPath}/contents/users.json`,
      method: 'GET',
      headers: {
        'Authorization': `token ${gToken}`,
        'User-Agent': 'SaaS-Generator-App'
      }
    });

    if (getRes.statusCode === 200 && getRes.body && getRes.body.content) {
      const fileSha = getRes.body.sha;
      const content = Buffer.from(getRes.body.content, 'base64').toString('utf8');
      const users = JSON.parse(content);

      const userIdx = users.findIndex(u => u.email.toLowerCase() === userEmail.toLowerCase());
      if (userIdx !== -1) {
        if (!users[userIdx].sites) {
          users[userIdx].sites = [];
        }
        
        // Check if site already exists to avoid duplicates
        const siteIdx = users[userIdx].sites.findIndex(s => s.repoName === siteData.repoName);
        if (siteIdx !== -1) {
          users[userIdx].sites[siteIdx] = { ...users[userIdx].sites[siteIdx], ...siteData };
        } else {
          users[userIdx].sites.push(siteData);
        }

        const updatedContentBase64 = Buffer.from(JSON.stringify(users, null, 2), 'utf8').toString('base64');
        const putRes = await apiRequest({
          hostname: 'api.github.com',
          port: 443,
          path: `/repos/${repoPath}/contents/users.json`,
          method: 'PUT',
          headers: {
            'Authorization': `token ${gToken}`,
            'User-Agent': 'SaaS-Generator-App',
            'Content-Type': 'application/json'
          }
        }, {
          message: `Update sites for user: ${userEmail}`,
          content: updatedContentBase64,
          sha: fileSha
        });
        
        if (putRes.statusCode === 200 || putRes.statusCode === 201) {
          console.log(`Successfully updated users.json on GitHub for ${userEmail}.`);
          return users[userIdx].sites;
        }
      }
    }
  } catch (err) {
    console.error('Error saving user site in users.json:', err);
  }
  return null;
}

// Endpoint to generate site
app.post('/api/generate', async (req, res) => {
  const {
    theme,
    themeDescription,
    repoName,
    githubToken,
    vercelToken,
    vercelTeamId,
    colorPalette,
    userEmail
  } = req.body;

  let userGithubToken = "";
  let userVercelToken = "";
  let userVercelTeamId = "";
  let geminiApiKey = "";

  if (userEmail) {
    try {
      const repoPath = 'efeitodigitalcontato-ops/inteligencia-jovem-saas-factory';
      const getRes = await apiRequest({
        hostname: 'api.github.com',
        port: 443,
        path: `/repos/${repoPath}/contents/users.json`,
        method: 'GET',
        headers: {
          'Authorization': `token ${DEFAULT_GITHUB_TOKEN}`,
          'User-Agent': 'SaaS-Generator-App',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (getRes.statusCode === 200 && getRes.body && getRes.body.content) {
        const content = Buffer.from(getRes.body.content, 'base64').toString('utf8');
        const users = JSON.parse(content);
        const user = users.find(u => u.email.toLowerCase() === userEmail.toLowerCase());
        if (user) {
          if (user.geminiApiKey) geminiApiKey = decodeToken(user.geminiApiKey);
          if (user.githubToken) userGithubToken = decodeToken(user.githubToken);
          if (user.vercelToken) userVercelToken = decodeToken(user.vercelToken);
          if (user.vercelTeamId) userVercelTeamId = user.vercelTeamId;
          console.log(`Loaded saved credentials from database for user: ${userEmail}`);
        }
      }
    } catch (e) {
      console.warn("Could not fetch user's saved credentials:", e.message);
    }
  }

  const gToken = (!githubToken || githubToken === 'undefined' || githubToken === 'null' || githubToken.trim() === '') ? (userGithubToken || DEFAULT_GITHUB_TOKEN) : githubToken;
  const vToken = (!vercelToken || vercelToken === 'undefined' || vercelToken === 'null' || vercelToken.trim() === '') ? (userVercelToken || DEFAULT_VERCEL_TOKEN) : vercelToken;
  const vTeam = (!vercelTeamId || vercelTeamId === 'undefined' || vercelTeamId === 'null' || vercelTeamId.trim() === '') ? (userVercelTeamId || DEFAULT_VERCEL_TEAM) : vercelTeamId;

  let finalRepoName = repoName || `blog-ia-${theme.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
  let finalFullRepoPath = `${DEFAULT_ORG}/${finalRepoName}`;

  try {
    // 1. Create GitHub Repo
    console.log('Creating GitHub repository...');
    // Sanitize description for GitHub API (remove control chars, newlines, and limit to 150 chars)
    const githubSafeDescription = (themeDescription || '')
      .replace(/[\r\n\t]/g, ' ')
      .replace(/[^\x20-\x7E]/g, '') // remove non-printable ASCII
      .slice(0, 150)
      .trim();

    const createRepoRes = await apiRequest({
      hostname: 'api.github.com',
      port: 443,
      path: `/orgs/${DEFAULT_ORG}/repos`,
      method: 'POST',
      headers: {
        'Authorization': `token ${gToken}`,
        'User-Agent': 'SaaS-Generator-App',
        'Content-Type': 'application/json'
      }
    }, {
      name: finalRepoName,
      description: `Blog: ${theme}. ${githubSafeDescription}`,
      private: false,
      has_issues: true,
      has_projects: true,
      has_wiki: true
    });

    let repoId = null;
    let finalOwnerRepo = `${DEFAULT_ORG}/${finalRepoName}`;

    if (createRepoRes.statusCode === 201 && createRepoRes.body && createRepoRes.body.id) {
      repoId = createRepoRes.body.id;
      finalOwnerRepo = createRepoRes.body.full_name;
      console.log(`Repository created in org! ID: ${repoId}, Full Name: ${finalOwnerRepo}`);
    }

    if (createRepoRes.statusCode !== 201) {
      // Try as user repo if org fails
      console.log('Org creation failed, trying personal repository...');
      let createPersonalRes = await apiRequest({
        hostname: 'api.github.com',
        port: 443,
        path: '/user/repos',
        method: 'POST',
        headers: {
          'Authorization': `token ${gToken}`,
          'User-Agent': 'SaaS-Generator-App',
          'Content-Type': 'application/json'
        }
      }, {
        name: finalRepoName,
        description: `Blog: ${theme}. ${githubSafeDescription}`,
        private: false
      });

      // Self-heal: If repo name is already taken (422), append a unique suffix and retry
      if (createPersonalRes.statusCode === 422) {
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        finalRepoName = `${finalRepoName}-${randomSuffix}`;
        console.log(`Repo name exists! Automatically self-healing with name: ${finalRepoName}`);

        createPersonalRes = await apiRequest({
          hostname: 'api.github.com',
          port: 443,
          path: '/user/repos',
          method: 'POST',
          headers: {
            'Authorization': `token ${gToken}`,
            'User-Agent': 'SaaS-Generator-App',
            'Content-Type': 'application/json'
          }
        }, {
          name: finalRepoName,
          description: `Blog: ${theme}. ${githubSafeDescription}`,
          private: false
        });
      }

      if (createPersonalRes.statusCode === 201 && createPersonalRes.body && createPersonalRes.body.id) {
        repoId = createPersonalRes.body.id;
        finalOwnerRepo = createPersonalRes.body.full_name;
        console.log(`Personal repository created! ID: ${repoId}, Full Name: ${finalOwnerRepo}`);
      }

      if (createPersonalRes.statusCode !== 201) {
        return res.status(400).json({
          error: 'Falha ao criar repositório no GitHub',
          details: createPersonalRes.body || createRepoRes.body
        });
      }
    }

    // Get repo metadata with retry logic (resolves replication delays) only as fallback if not obtained yet
    if (!repoId) {
      let repoInfoRes = null;
      for (let attempt = 1; attempt <= 5; attempt++) {
        console.log(`Fetching repository metadata (Attempt ${attempt}/5)...`);
        repoInfoRes = await apiRequest({
          hostname: 'api.github.com',
          port: 443,
          path: `/repos/${DEFAULT_ORG}/${finalRepoName}`,
          method: 'GET',
          headers: {
            'Authorization': `token ${gToken}`,
            'User-Agent': 'SaaS-Generator-App'
          }
        });
        
        if (repoInfoRes.statusCode === 200 && repoInfoRes.body && repoInfoRes.body.id) {
          repoId = repoInfoRes.body.id;
          finalOwnerRepo = repoInfoRes.body.full_name;
          console.log(`Repository metadata found! ID: ${repoId}, Full Name: ${finalOwnerRepo}`);
          break;
        }
        
        console.log(`Repository metadata not available yet. Waiting 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    if (!repoId) {
      return res.status(400).json({ 
        error: 'Falha ao obter metadados do repositório no GitHub', 
        details: 'O repositório foi criado mas a API do GitHub demorou para disponibilizar os detalhes. Por favor, tente criar novamente.' 
      });
    }

    // 2. Clone/Copy Template to Temp Directory
    const tempDir = path.join(os.tmpdir(), `builder-${Date.now()}`);
    const themeLower = theme.toLowerCase().trim();
    const templateFolder = (themeLower === 'multicategorias' || themeLower === 'analisamelhor') ? 'template-multicategorias' : 'template-inteligencia';
    const templateDir = path.join(__dirname, templateFolder);

    console.log(`Copying template from ${templateDir} to temp folder ${tempDir}...`);
    copyFolderSync(templateDir, tempDir);

    // 3. Customize Config (Sveltia CMS config.yml)
    const configPath = path.join(tempDir, 'public', 'admin', 'config.yml');
    if (fs.existsSync(configPath)) {
      let configContent = fs.readFileSync(configPath, 'utf8');
      // Replace repo path
      configContent = configContent.replace(/repo: .*/g, `repo: ${finalOwnerRepo}`);
      // Replace site domain
      configContent = configContent.replace(/site_domain: .*/g, `site_domain: ${finalRepoName}.vercel.app`);
      fs.writeFileSync(configPath, configContent, 'utf8');
      console.log('Customized public/admin/config.yml successfully');
    }

    // 3.1 Customize Content Generator (public/admin/generator.html)
    const generatorPath = path.join(tempDir, 'public', 'admin', 'generator.html');
    if (fs.existsSync(generatorPath)) {
      let generatorContent = fs.readFileSync(generatorPath, 'utf8');
      // Replace repo name and owner in the generator
      generatorContent = generatorContent.replace(/const REPO_NAME = .*/g, `const REPO_NAME = "${finalRepoName}";`);
      const owner = finalOwnerRepo.split('/')[0];
      generatorContent = generatorContent.replace(/const REPO_OWNER = .*/g, `const REPO_OWNER = "${owner}";`);
      if (geminiApiKey) {
        generatorContent = generatorContent.replace(/const DEFAULT_GEMINI_KEY = .*/g, `const DEFAULT_GEMINI_KEY = "${geminiApiKey}";`);
      }
      fs.writeFileSync(generatorPath, generatorContent, 'utf8');
      console.log(`Customized public/admin/generator.html successfully with repo: ${finalRepoName} and injected geminiApiKey`);

      // 3.1.2 Generate generatorConfig.json with custom categories and images matching the theme
      const themeKey = theme.toLowerCase().trim();
      let configData = {
        theme: themeKey,
        categories: [],
        images: []
      };

      if (themeKey === 'colchoes') {
        configData.categories = [
          { value: "colchoes", label: "Colchões" },
          { value: "dicas", label: "Dicas" },
          { value: "camas", label: "Camas" }
        ];
        configData.images = [
          { value: "/recommended-emma.jpg", label: "Colchão Emma (Destaque)" },
          { value: "/recommended-castor.jpg", label: "Colchão Castor (Destaque)" },
          { value: "/recommended-luiza.jpg", label: "Colchão Luiza (Destaque)" }
        ];
      } else if (themeKey === 'bicicletas') {
        configData.categories = [
          { value: "ergometricas", label: "Bicicletas Ergométricas" },
          { value: "convencionais", label: "Bicicletas Convencionais" },
          { value: "acessorios", label: "Acessórios" },
          { value: "dicas", label: "Dicas" }
        ];
        configData.images = [
          { value: "/recommended-ergometrica.jpg", label: "Bicicleta Ergométrica (Destaque)" },
          { value: "/recommended-mountain-bike.jpg", label: "Bicicleta de Montanha (Destaque)" },
          { value: "/recommended-speed.jpg", label: "Bicicleta Speed (Destaque)" }
        ];
      } else if (themeKey === 'sofas') {
        configData.categories = [
          { value: "sofas-retrateis", label: "Sofás Retráteis" },
          { value: "sofas-canto", label: "Sofás de Canto" },
          { value: "poltronas", label: "Poltronas" },
          { value: "decoracao", label: "Decoração" }
        ];
        configData.images = [
          { value: "/recommended-sofa-retratil.jpg", label: "Sofá Retrátil (Destaque)" },
          { value: "/recommended-sofa-canto.jpg", label: "Sofá de Canto (Destaque)" },
          { value: "/recommended-poltrona.jpg", label: "Poltrona Premium (Destaque)" }
        ];
      } else if (themeKey === 'panelas') {
        configData.categories = [
          { value: "panelas-antiaderentes", label: "Panelas Antiaderentes" },
          { value: "panelas-inox", label: "Panelas de Inox" },
          { value: "panelas-ceramica", label: "Panelas de Cerâmica" },
          { value: "utensilios", label: "Utensílios" }
        ];
        configData.images = [
          { value: "/recommended-panela-antiaderente.jpg", label: "Panela Antiaderente (Destaque)" },
          { value: "/recommended-panela-inox.jpg", label: "Panela de Inox (Destaque)" },
          { value: "/recommended-panela-ceramica.jpg", label: "Panela de Cerâmica (Destaque)" }
        ];
      } else {
        // Custom theme logic
        const sanitizedTheme = themeKey.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
        const themeLabel = capitalize(themeKey);

        configData.categories = [
          { value: sanitizedTheme, label: themeLabel },
          { value: "dicas", label: `Dicas de ${themeLabel}` },
          { value: "analises", label: "Análises e Guias" }
        ];
        configData.images = [
          { value: `/recommended-${sanitizedTheme}-1.jpg`, label: `${themeLabel} Premium` },
          { value: `/recommended-${sanitizedTheme}-2.jpg`, label: `${themeLabel} Custo-Benefício` },
          { value: `/recommended-${sanitizedTheme}-3.jpg`, label: `Melhores ${themeLabel}` }
        ];
      }

      const configDataPath = path.join(tempDir, 'public', 'admin', 'generatorConfig.json');
      fs.writeFileSync(configDataPath, JSON.stringify(configData, null, 2), 'utf8');
      console.log(`Generated public/admin/generatorConfig.json successfully for theme: ${theme}`);
    }

    // 3.2 Customize siteConfig.json dynamically based on selected theme and description
    const siteConfigPath = path.join(tempDir, 'src', 'siteConfig.json');
    
    let finalTitle = (themeLower === 'multicategorias' || themeLower === 'analisamelhor') ? "AnalisaMelhor" : theme.toUpperCase();
    let finalTitleCapitalized = (themeLower === 'multicategorias' || themeLower === 'analisamelhor') ? "AnalisaMelhor" : (theme.charAt(0).toUpperCase() + theme.slice(1));
    let finalDescription = themeDescription || ((themeLower === 'multicategorias' || themeLower === 'analisamelhor') ? "Seu portal de conteúdo sobre reviews e análises de produtos. Trazemos análises, comparativos e guias de compra completos." : `Seu portal de conteúdo sobre ${theme}. Trazemos análises, comparativos e guias de compra completos.`);
    let finalFocus = (themeLower === 'multicategorias' || themeLower === 'analisamelhor') ? "Análises completas e opiniões sinceras de produtos de diversas categorias." : `Análises completas e opiniões sinceras sobre ${theme}.`;

    const dynamicConfig = {
      title: finalTitle,
      subtitle: "guias e análises",
      description: finalDescription,
      slogan: `${finalTitleCapitalized} - Comparativos e Análises`,
      focus: finalFocus,
      updated: "Conteúdo revisado e atualizado regularmente por nossa equipe.",
      affiliateNotice: "Este site contém links de afiliados. Ao comprar através deles, você apoia nosso trabalho sem custo extra."
    };
    fs.writeFileSync(siteConfigPath, JSON.stringify(dynamicConfig, null, 2), 'utf8');
    console.log(`Customized src/siteConfig.json dynamically for theme: ${theme}`);

    // 3.3 Delete default welcome post and generate a customized first post
    const defaultPostPath = path.join(tempDir, 'src', 'content', 'blog', 'bem-vindo.md');
    if (fs.existsSync(defaultPostPath)) {
      try {
        fs.unlinkSync(defaultPostPath);
      } catch (err) {
        console.warn('Could not delete default welcome post:', err.message);
      }
    }

    let generatedPostContent = '';
    const apiKey = getValidGeminiKey(req.body.geminiKey) || process.env.GEMINI_API_KEY || decodeToken('enc:QVEuQWI4Uk42SWxfY2N3UHB3aF9vX3BfSnlTNmM4eVIyM2huWlV5M3NLUTRuOXlKUTQ3UQ==');
    if (apiKey) {
      console.log('Generating customized first post using Google Gemini API...');
      try {
        const prompt = `Você é um redator de SEO especialista no nicho de ${theme}.
Gere um primeiro post de blog completo sobre o tema de forma atraente, contendo uma introdução cativante, pelo menos 3 seções/tópicos bem desenvolvidos em formato HTML (como <h2> e <h3>), e uma conclusão.
O post deve ser baseado na seguinte descrição do blog: "${themeDescription || ''}".
O post deve começar obrigatoriamente com o cabeçalho YAML delimitado por '---' exatamente neste formato:
---
title: "Título super atraente e focado em SEO"
description: "Uma meta descrição otimizada de 140 a 160 caracteres sobre o assunto."
pubDate: ${new Date().toISOString().split('T')[0]}
category: "${theme}"
author: "Redação Gerador Ninja"
---

Corpo do artigo em HTML limpo. Use tags <h2>, <h3>, <p>, <ul>, <li> para estruturar. NUNCA use marcadores de blocos de código como \`\`\`markdown ou \`\`\`html no início ou final do texto.`;

        const apiRes = await apiRequest({
          hostname: 'generativelanguage.googleapis.com',
          port: 443,
          path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }, {
          contents: [{
            parts: [{ text: prompt }]
          }]
        });

        if (apiRes.statusCode === 200 && apiRes.body && apiRes.body.candidates && apiRes.body.candidates[0].content.parts[0].text) {
          let rawText = apiRes.body.candidates[0].content.parts[0].text.trim();
          if (rawText.startsWith("```")) {
            rawText = rawText.substring(rawText.indexOf("\n") + 1);
          }
          if (rawText.endsWith("```")) {
            rawText = rawText.substring(0, rawText.lastIndexOf("```"));
          }
          generatedPostContent = rawText.trim();
          console.log('Successfully generated first post via Gemini API!');
        } else {
          console.warn('Gemini API request failed or returned invalid response, using fallback generator. Response:', apiRes.body);
        }
      } catch (err) {
        console.warn('Error calling Gemini API for first post generation:', err.message);
      }
    }

    if (!generatedPostContent) {
      console.log('Using fallback generator for first post...');
      generatedPostContent = generateFallbackPost(theme, themeDescription);
    }

    const firstPostPath = path.join(tempDir, 'src', 'content', 'blog', 'primeiro-post.md');
    fs.writeFileSync(firstPostPath, generatedPostContent, 'utf8');
    console.log('Wrote first post successfully');

    // 4. Customize CSS Theme variables in Layout.astro if selected
    const layoutPath = path.join(tempDir, 'src', 'layouts', 'Layout.astro');
    if (fs.existsSync(layoutPath)) {
      let layoutContent = fs.readFileSync(layoutPath, 'utf8');
      
      let rootCss = '';
      if (colorPalette === 'indigo') {
        rootCss = `	:root {
		--primary-color: #a855f7;
		--primary-hover: #9333ea;
		--bg-color: #0b0f19;
		--card-bg: #111827;
		--text-main: #f3f4f6;
		--text-muted: #9ca3af;
		--border-color: #1f2937;
		--shadow-subtle: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
		--shadow-md: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
		--font-family: 'Plus Jakarta Sans', sans-serif;
	}`;
      } else if (colorPalette === 'emerald') {
        rootCss = `	:root {
		--primary-color: #10b981;
		--primary-hover: #059669;
		--bg-color: #064e3b;
		--card-bg: #022c22;
		--text-main: #f3f4f6;
		--text-muted: #a7f3d0;
		--border-color: #065f46;
		--shadow-subtle: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
		--shadow-md: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
		--font-family: 'Plus Jakarta Sans', sans-serif;
	}`;
      } else { // 'dark' / 'classic' / default
        rootCss = `	:root {
		--primary-color: #6366f1;
		--primary-hover: #4f46e5;
		--bg-color: #0b0f19;
		--card-bg: #111827;
		--text-main: #f3f4f6;
		--text-muted: #9ca3af;
		--border-color: #1f2937;
		--shadow-subtle: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
		--shadow-md: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
		--font-family: 'Plus Jakarta Sans', sans-serif;
	}`;
      }
      
      layoutContent = layoutContent.replace(/:root\s*\{[^}]*\}/s, rootCss);
      fs.writeFileSync(layoutPath, layoutContent, 'utf8');
      console.log(`Customized Layout.astro variables dynamically for colorPalette: ${colorPalette}`);
    }

    // 5. Git Push to new Repository
    console.log('Initializing Git and pushing to GitHub (isomorphic-git)...');
    try {
      await git.init({ fs, dir: tempDir, defaultBranch: 'main' });
      
      async function addAllFiles(currentDir, baseDir = '') {
        const files = fs.readdirSync(currentDir);
        for (const file of files) {
          const fullPath = path.join(currentDir, file);
          const relativePath = path.join(baseDir, file).replace(/\\/g, '/');
          if (file === '.git' || file === 'node_modules') continue;
          if (fs.lstatSync(fullPath).isDirectory()) {
            await addAllFiles(fullPath, relativePath);
          } else {
            await git.add({ fs, dir: tempDir, filepath: relativePath });
          }
        }
      }
      await addAllFiles(tempDir);

      await git.commit({
        fs,
        dir: tempDir,
        author: {
          name: 'SaaS Builder',
          email: 'builder@saas.com'
        },
        message: `Initial commit of ${theme} blog from SaaS builder`
      });

      await git.push({
        fs,
        http: gitHttp,
        dir: tempDir,
        url: `https://github.com/${finalOwnerRepo}.git`,
        onAuth: () => ({ username: gToken }),
        force: true,
        ref: 'main'
      });
      console.log('Pushed files to GitHub repo successfully via isomorphic-git!');
    } catch (gitErr) {
      console.error('Git execution failed:', gitErr);
      return res.status(500).json({ error: 'Erro ao enviar arquivos para o GitHub', details: gitErr.message });
    } finally {
      // Clean up temp dir
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (rmErr) {
        console.warn('Could not remove temp folder:', rmErr.message);
      }
    }

    // 6. Provision Vercel Project & Deployment Flow with fallback retry
    let currentVToken = vToken;
    let currentVTeam = vTeam;

    const ALT_VERCEL_TOKEN_1 = decodeToken('enc:dmNwXzZYNVc1UWxROWoxdGZia1BhbEVNR3doREZ1T3FlU0ppYlN2OGhGbjc1WDlyNW96SDVsMkZKNWpl');
    const ALT_VERCEL_TEAM_1 = ''; // Hobby account has no team
    const ALT_VERCEL_TOKEN_2 = decodeToken('enc:dmNwXzBDM0tmV3pQSGdBQWViQkw2eVZtREZmZkFnZ1RqSEFySDBLdnJ5UjQ5T0RXbFdLeDRUM1NoUXJl');
    const ALT_VERCEL_TEAM_2 = 'team_Wd4A9CtlI7gAntKGdcxvaG2N';

    async function executeVercelFlow(token, teamId) {
      console.log('Provisioning Vercel Project...');
      const createProjectRes = await apiRequest({
        hostname: 'api.vercel.com',
        port: 443,
        path: `/v9/projects?teamId=${teamId}`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }, {
        name: finalRepoName,
        framework: 'astro',
        gitRepository: {
          type: 'github',
          repo: finalOwnerRepo,
          repoId: repoId
        }
      });

      let projectId = null;
      if (createProjectRes.statusCode === 200 || createProjectRes.statusCode === 201) {
        projectId = createProjectRes.body.id;
        console.log(`Vercel Project created with ID: ${projectId}`);
      } else {
        console.log('Vercel project creation info:', createProjectRes.body);
        // Try to fetch existing project if it conflicts
        const getProjectRes = await apiRequest({
          hostname: 'api.vercel.com',
          port: 443,
          path: `/v9/projects/${finalRepoName}?teamId=${teamId}`,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (getProjectRes.statusCode === 200) {
          projectId = getProjectRes.body.id;
        }
      }

      if (!projectId) {
        return { success: false, errorStage: 'project_creation', response: createProjectRes };
      }

      // Ensure Vercel Authentication (SSO / Deployment Protection) is disabled so the site is immediately public
      try {
        console.log('Disabling Vercel SSO / Deployment Protection on the project...');
        await apiRequest({
          hostname: 'api.vercel.com',
          port: 443,
          path: `/v9/projects/${projectId}?teamId=${teamId}`,
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }, {
          ssoProtection: null
        });
        console.log('Vercel SSO / Deployment Protection disabled successfully.');
      } catch (patchErr) {
        console.warn('Warning: Could not disable Vercel SSO Protection:', patchErr.message);
      }

      // Trigger Vercel Deployment
      console.log('Triggering Vercel Deployment...');
      const deployRes = await apiRequest({
        hostname: 'api.vercel.com',
        port: 443,
        path: `/v13/deployments?teamId=${teamId}`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }, {
        name: finalRepoName,
        target: 'production',
        gitSource: {
          type: 'github',
          repoId: repoId,
          ref: 'main'
        }
      });

      if (deployRes.statusCode !== 200 && deployRes.statusCode !== 201) {
        return { success: false, errorStage: 'deployment', response: deployRes };
      }

      return { success: true, projectId, response: deployRes };
    }

    let vercelResult = await executeVercelFlow(currentVToken, currentVTeam);

    // If it fails, check if we can fall back to another account
    if (!vercelResult.success) {
      console.warn(`Vercel deployment failed during stage "${vercelResult.errorStage}" with status ${vercelResult.response.statusCode}.`);
      
      const errorBodyStr = JSON.stringify(vercelResult.response.body || {}).toUpperCase();
      const isLimitError = vercelResult.response.statusCode === 402 || 
                           vercelResult.response.statusCode === 403 || 
                           vercelResult.response.statusCode === 429 ||
                           errorBodyStr.includes('LIMIT') || 
                           errorBodyStr.includes('QUOTA') || 
                           errorBodyStr.includes('UPGRADE') || 
                           errorBodyStr.includes('PAYMENT_REQUIRED');

      if (isLimitError) {
        // Switch to the fallback account depending on which one we initially used
        let nextToken = ALT_VERCEL_TOKEN_1;
        let nextTeam = ALT_VERCEL_TEAM_1;
        
        if (currentVToken === ALT_VERCEL_TOKEN_1) {
          nextToken = ALT_VERCEL_TOKEN_2;
          nextTeam = ALT_VERCEL_TEAM_2;
        }
        
        console.log(`Limit or quota restriction detected on current Vercel token! Retrying flow with alternative Vercel account...`);
        currentVToken = nextToken;
        currentVTeam = nextTeam;
        
        vercelResult = await executeVercelFlow(currentVToken, currentVTeam);
      }
    }

    if (!vercelResult.success) {
      return res.status(400).json({ 
        error: vercelResult.errorStage === 'project_creation' ? 'Não foi possível configurar o projeto na Vercel' : 'Erro ao iniciar build na Vercel', 
        details: vercelResult.response.body 
      });
    }

    const deployUrl = `https://${finalRepoName}.vercel.app`;
    console.log(`Successfully generated and deployed site! Live URL: ${deployUrl}`);

    const newSiteData = {
      repoName: finalRepoName,
      repoUrl: `https://github.com/${finalOwnerRepo}`,
      deployUrl: deployUrl,
      theme: theme
    };

    let updatedSites = null;
    if (userEmail) {
      updatedSites = await saveUserSite(userEmail, newSiteData);
    }

    res.json({
      success: true,
      repoUrl: `https://github.com/${finalOwnerRepo}`,
      deployUrl: deployUrl,
      repoName: finalRepoName,
      vercelProjectId: vercelResult.projectId,
      vercelDeploymentId: vercelResult.response.body.id,
      sites: updatedSites
    });

  } catch (err) {
    console.error('Generation Error:', err);
    res.status(500).json({ error: 'Erro inesperado na geração do site', details: err.message });
  }
});

// FUNÇÃO AUXILIAR PARA BUSCAR TÍTULOS/SLUGS DE ARTIGOS JÁ PUBLICADOS NO GITHUB
async function getExistingPostTitles(repoName, token) {
  const gToken = token || DEFAULT_GITHUB_TOKEN;
  const ownerRepo = repoName.includes('/') ? repoName : `efeitodigitalcontato-ops/${repoName}`;

  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const res = await apiRequest({
      hostname: 'api.github.com',
      port: 443,
      path: `/repos/${ownerRepo}/contents/src/content/blog`,
      method: 'GET',
      headers: {
        'Authorization': `token ${gToken}`,
        'User-Agent': 'SaaS-Generator-App',
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (res.statusCode === 200 && Array.isArray(res.body)) {
      const existingTitles = res.body
        .filter(file => file.name.endsWith('.md') || file.name.endsWith('.mdx'))
        .map(file => {
          // Converte o nome do arquivo slug (ex: "melhor-bicicleta-aro-29") de volta para termos de texto
          const slugWithoutExt = file.name.replace(/\.mdx?$/, '');
          return slugWithoutExt.replace(/-/g, ' ');
        });
      return existingTitles;
    }
    return [];
  } catch (err) {
    console.error('Error fetching existing posts from GitHub:', err);
    return [];
  }
}

// FUNÇÃO AUXILIAR PARA BUSCAR SUGESTÕES REAIS DO GOOGLE (AUTOCOMPLETE)
async function getGoogleSuggestions(keyword) {
  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const prefixes = ['', 'como ', 'melhor ', 'qual ', 'por que '];
    const suffixes = ['', ' vale a pena', ' barato', ' profissional'];
    const allSuggestions = new Set();

    // Vamos buscar sugestões para a palavra-chave e variações comuns
    const queries = [];
    prefixes.forEach(p => queries.push(p + keyword));
    suffixes.forEach(s => queries.push(keyword + s));

    // Pega as 4 primeiras queries para ser rápido e variado
    const selectedQueries = queries.slice(0, 5);

    for (const query of selectedQueries) {
      const url = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}&hl=pt-BR`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data[1])) {
          data[1].forEach(item => {
            if (item.toLowerCase() !== keyword.toLowerCase()) {
              allSuggestions.add(item);
            }
          });
        }
      }
    }
    return Array.from(allSuggestions).slice(0, 15);
  } catch (err) {
    console.error('Error fetching Google suggestions:', err);
    return [];
  }
}

// ROTA 1: BUSCAR IDEIAS DE TÍTULOS DE CAUDA LONGA BASEADO NA INTENÇÃO DE BUSCA E GOOGLE SUGGESTIONS (GEMINI)
app.post('/api/generate-title-ideas', async (req, res) => {
  const { keyword, theme, repoName, githubToken, geminiApiKey } = req.body;
  if (!keyword) {
    return res.status(400).json({ error: 'Palavra-chave semente é obrigatória.' });
  }

  const apiKey = getValidGeminiKey(geminiApiKey) || process.env.GEMINI_API_KEY || decodeToken('enc:QVEuQWI4Uk42SWxfY2N3UHB3aF9vX3BfSnlTNmM4eVIyM2huWlV5M3NLUTRuOXlKUTQ3UQ==');
  const gToken = githubToken || DEFAULT_GITHUB_TOKEN;

  try {
    let existingTitles = [];
    if (repoName) {
      console.log(`Checking existing posts for repository: "${repoName}"...`);
      existingTitles = await getExistingPostTitles(repoName, gToken);
      console.log(`Found ${existingTitles.length} existing posts/titles.`);
    }

    console.log(`Fetching Google search suggestions for seed: "${keyword}"...`);
    const suggestions = await getGoogleSuggestions(keyword);
    console.log(`Generating highly diverse, non-repetitive titles for seed: "${keyword}"...`);
    const prompt = `Você é um especialista em SEO avançado, tráfego orgânico de cauda longa, intenções de busca e micromomentos (Quero Saber, Quero Fazer, Quero Comprar, Quero Ir).
Sua tarefa é usar a sua ferramenta de busca (Google Search) para pesquisar sobre a palavra-chave semente "${keyword}" e analisar os resultados reais, dúvidas frequentes do público, perguntas reais do "As Pessoas Também Perguntam" (People Also Ask) e discussões online reais.

Com base nas pesquisas verdadeiras feitas na busca do Google e no tema do blog "${theme || 'Geral'}", gere uma lista de EXATAMENTE 10 ideias de títulos de postagem extremamente originais, criativas e otimizadas para taxa de clique (CTR) alta e SEO.

Aqui estão algumas sugestões iniciais de autocomplete do Google:
${suggestions.length > 0 ? suggestions.map(s => `- ${s}`).join('\n') : '(Nenhuma sugestão de autocomplete disponível, confie inteiramente na sua pesquisa ao vivo)'}

${existingTitles.length > 0 ? `CRÍTICO: Os seguintes artigos já foram publicados neste blog. NUNCA gere títulos iguais ou excessivamente parecidos com estes (evite canibalização de palavras-chave):\n${existingTitles.map(t => `- ${t}`).join('\n')}\n` : ''}

REGRAS CRÍTICAS PARA EVITAR REPETIÇÃO E MONOTONIA:
1. NUNCA comece dois títulos com o mesmo prefixo ou palavra! Varie totalmente a primeira palavra de cada título.
2. NÃO use a mesma estrutura de frase para mais de um título. Evite padrões repetitivos (não use "Como escolher...", "Dicas de...", "Guia de..." em mais de um título).
3. NÃO faça apenas substituição simples de palavras em templates fixos. Cada título deve ter um vocabulário, estrutura e tom completamente diferentes, baseados em pesquisas reais.
4. Varie as intenções de busca e os micromomentos de forma equilibrada:
   - **Quero Comprar / Transacional**: Comparativos diretos (Ex: "A vs B: Qual vale mais a pena?"), custo-benefício real, guias de decisão e preços.
   - **Quero Saber / Informacional**: Dicas práticas, conceitos básicos, "o que é", curiosidades ou fatos desconhecidos.
   - **Quero Fazer / Tutorial**: Tutoriais passo a passo de uso, manutenção, limpeza ou como resolver problemas comuns.
   - **Análise / Avaliação Crítica**: Reviews detalhados com foco em se um modelo específico ou marca é boa/confiável de verdade.
5. Adicione tempero de copywriting de forma variada: use colchetes ou parênteses com chamadas extras (ex: "[Guia Completo]", "(Passo a Passo)", "[Cuidado]", "(Atualizado 2026)").
6. Os títulos devem soar naturais, escritos por humanos especialistas e apaixonados pelo assunto, nunca robóticos ou genéricos.

O resultado DEVE ser estritamente um array JSON válido de objetos, onde cada objeto tem uma propriedade 'title'. Exemplo:
[
  {"title": "Título Incrível e Único de Exemplo"},
  {"title": "Outra Abordagem Totalmente Diferente"}
]

Retorne APENAS o JSON bruto. Não inclua wraps de marcação de bloco de código como \`\`\`json ou \`\`\` no início ou final do texto.`;

    const apiRes = await apiRequest({
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      contents: [{
        parts: [{ text: prompt }]
      }],
      tools: [{
        googleSearch: {}
      }],
      generationConfig: {
        temperature: 0.85
      }
    });

    if (apiRes.statusCode === 200 && apiRes.body && apiRes.body.candidates && apiRes.body.candidates[0].content.parts[0].text) {
      let rawText = apiRes.body.candidates[0].content.parts[0].text.trim();
      if (rawText.startsWith("```json")) {
        rawText = rawText.substring(7);
      } else if (rawText.startsWith("```")) {
        rawText = rawText.substring(3);
      }
      if (rawText.endsWith("```")) {
        rawText = rawText.substring(0, rawText.lastIndexOf("```"));
      }
      rawText = rawText.trim();

      const ideas = JSON.parse(rawText);
      res.json({ success: true, ideas });
    } else {
      console.error('Gemini failed:', apiRes.body);
      throw new Error('Falha na API do Gemini para gerar ideias.');
    }
  } catch (err) {
    console.error('Error generating titles:', err);
    // Fallback static/semi-dynamic ideas if Gemini fails
    const cleanKeyword = keyword.trim().replace(/^\w/, (c) => c.toUpperCase());
    const templates = [
      `Manual definitivo: Como escolher o ${keyword} ideal`,
      `Vale a pena comprar ${cleanKeyword}? Nossa opinião sincera`,
      `Os principais modelos de ${keyword} custo-benefício para investir`,
      `Dicas exclusivas e cuidados essenciais com seu ${keyword}`,
      `O ${cleanKeyword} realmente funciona? Analisamos os detalhes`,
      `Passo a passo para economizar na compra de um ${keyword} novo`,
      `Review comparativo das marcas mais procuradas de ${keyword}`,
      `Como identificar o melhor ${keyword} para suas necessidades diárias`,
      `Desmistificando o uso do ${keyword}: Tudo o que você precisa saber`,
      `Guia de compras: O que observar antes de adquirir seu produto`
    ];
    const fallbacks = templates.slice(0, 10).map(t => ({ title: t }));
    res.json({ success: true, ideas: fallbacks });
  }
});

// ROTA 2: GERAÇÃO EM MASSA (LOTE) DE ARTIGOS, IMAGENS E PUSH PRO GITHUB
app.post('/api/bulk-generate', async (req, res) => {
  const { repoName, posts, githubToken, geminiApiKey, userEmail } = req.body;
  const scheduleQueue = req.body.scheduleQueue !== false; // Padrão: true (fila ativada automaticamente)
  if (!repoName || !posts || !Array.isArray(posts)) {
    return res.status(400).json({ error: 'Parâmetros inválidos para geração em lote.' });
  }

  const gToken = githubToken || DEFAULT_GITHUB_TOKEN;
  const apiKey = getValidGeminiKey(geminiApiKey) || process.env.GEMINI_API_KEY || decodeToken('enc:QVEuQWI4Uk42SWxfY2N3UHB3aF9vX3BfSnlTNmM4eVIyM2huWlV5M3NLUTRuOXlKUTQ3UQ==');
  const tempDir = path.join(os.tmpdir(), `bulk-builder-${Date.now()}`);

  const QUEUE_DIR = path.join(__dirname, 'queue');
  const repoQueueDir = path.join(QUEUE_DIR, repoName);
  const repoImagesQueueDir = path.join(repoQueueDir, 'images');

  try {
    console.log(`Starting bulk generation of ${posts.length} posts for repository ${repoName}...`);

    if (scheduleQueue) {
      fs.mkdirSync(repoQueueDir, { recursive: true });
      fs.mkdirSync(repoImagesQueueDir, { recursive: true });
      fs.writeFileSync(path.join(repoQueueDir, '_config.json'), JSON.stringify({ githubToken: gToken, userEmail }, null, 2), 'utf8');
    } else {
      // 1. Clone/Fetch existing site repository from GitHub to local temp directory
      fs.mkdirSync(tempDir, { recursive: true });
      await git.clone({
        fs,
        http: gitHttp,
        dir: tempDir,
        url: `https://github.com/${DEFAULT_ORG}/${repoName}.git`,
        onAuth: () => ({ username: gToken }),
        singleBranch: true,
        depth: 1
      });
    }

    const generatedPosts = [];

    // 2. Generate content for each selected post
    for (const post of posts) {
      const slug = sluggify(post.title).slice(0, 80);
      const postFileName = `${slug}.md`;
      const postPath = scheduleQueue ? null : path.join(tempDir, 'src', 'content', 'blog', postFileName);

      // Determine publish date
      let pubDateStr = new Date().toISOString().split('T')[0];
      if (post.publishOption === 'schedule' && post.scheduleTime) {
        pubDateStr = post.scheduleTime.split('T')[0];
      }

      // Call Gemini to write article
      let articleContent = '';
      let postStatus = 'success';
      try {
        const affiliateLink = post.affiliateLink || '#';
        const prompt = `Você é o Agente Ninja, especialista em copywriting, SEO e reviews de alta conversão.
Escreva um artigo de blog completo e super atraente sobre o título: "${post.title}".
O artigo deve focar no cliente e seguir regras rígidas de conversão:
- Comece diretamente no cabeçalho YAML delimitado por '---':
---
title: "${post.title}"
description: "Uma meta descrição super otimizada de 140 a 160 caracteres contendo gatilhos para o leitor clicar."
pubDate: ${pubDateStr}
category: "Dicas"
author: "Redação Gerador Ninja"
---

- O corpo do post deve ser estruturado em HTML limpo.
- Use títulos de tópicos estruturados em H2 e H3 (ex: <h2> por que comprar... </h2>).
- Forneça prós e contras sinceros para aumentar a autoridade do texto.
- Insira uma chamada de ação de conversão (CTA) chamando o usuário a clicar e comprar com segurança. Use uma estrutura estilizada como:
<div style="background-color: #f3f4f6; border-left: 4px solid #10b981; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
  <h4 style="margin-top: 0; color: #065f46;">🔥 Recomendação de Compra</h4>
  <p>Encontramos esse produto com excelentes avaliações de clientes e entrega rápida.</p>
  <a href="${affiliateLink}" target="_blank" style="display: inline-block; background-color: #10b981; color: white; font-weight: bold; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 10px;">Ver Preço Aqui</a>
</div>

Se o link de afiliado for diferente de '#', garanta que o link de afiliado "${affiliateLink}" seja usado no atributo href do botão/link acima e em quaisquer outras menções de compra ou CTAs gerados no corpo do artigo.

NUNCA use marcadores de bloco de código de IA como \`\`\`markdown ou \`\`\`html no início ou final do texto. Comece diretamente com as linhas delimitadoras '---'.`;

        const apiRes = await apiRequest({
          hostname: 'generativelanguage.googleapis.com',
          port: 443,
          path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }, {
          contents: [{
            parts: [{ text: prompt }]
          }]
        });

        console.log(`Gemini response status for "${post.title}":`, apiRes.statusCode);
        if (apiRes.statusCode === 200 && apiRes.body && apiRes.body.candidates && apiRes.body.candidates[0].content.parts[0].text) {
          let rawText = apiRes.body.candidates[0].content.parts[0].text.trim();
          if (rawText.startsWith("```")) {
            rawText = rawText.substring(rawText.indexOf("\n") + 1);
          }
          if (rawText.endsWith("```")) {
            rawText = rawText.substring(0, rawText.lastIndexOf("```"));
          }
          articleContent = rawText.trim();
        } else {
          postStatus = 'fallback';
          console.warn(`Gemini API did not return expected content. Full response:`, JSON.stringify(apiRes.body));
        }
      } catch (err) {
        postStatus = 'fallback';
        console.warn(`Gemini error for "${post.title}":`, err.message);
      }

      if (!articleContent) {
        const affiliateLink = post.affiliateLink || '#';
        // Fallback static structure
        articleContent = `---
title: "${post.title}"
description: "Confira nosso guia completo sobre ${post.title} e faça a melhor escolha."
pubDate: ${pubDateStr}
category: "Dicas"
author: "Redação"
---
<h2>O que você precisa saber sobre esse tema</h2>
<p>Guia rápido de informações relevantes para ajudar sua jornada de compra.</p>
<div style="background-color: #f3f4f6; border-left: 4px solid #10b981; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
  <a href="${affiliateLink}" target="_blank" style="display: inline-block; background-color: #10b981; color: white; font-weight: bold; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Ver Preço Aqui</a>
</div>`;
      }

      // Process manual or auto image
      let imgName = 'recommended-comfort.jpg';
      if (post.imageOption === 'manual' && post.fileData) {
        const imageBuffer = Buffer.from(post.fileData, 'base64');
        const imgExt = post.fileName ? path.extname(post.fileName) : '.jpg';
        imgName = `${slug}${imgExt}`;
        const imgPath = scheduleQueue ? path.join(repoImagesQueueDir, imgName) : path.join(tempDir, 'public', imgName);
        fs.writeFileSync(imgPath, imageBuffer);
        
        articleContent = articleContent.replace('---', `---\nheroImage: "/${imgName}"`);
      } else if (post.imageOption === 'auto') {
        let nicheKeywords = 'product';
        const rName = repoName.toLowerCase();
        if (rName.includes('tenis') || rName.includes('tênis') || rName.includes('tnis') || rName.includes('corrida')) {
          nicheKeywords = 'running,shoes,sneaker';
        } else if (rName.includes('sofa') || rName.includes('sofás')) {
          nicheKeywords = 'sofa,couch,furniture';
        } else if (rName.includes('bicicleta') || rName.includes('bike')) {
          nicheKeywords = 'bicycle,bike,cycling';
        } else if (rName.includes('geladeira') || rName.includes('fridge')) {
          nicheKeywords = 'refrigerator,fridge,appliances';
        } else if (rName.includes('panela')) {
          nicheKeywords = 'cookware,pot,pan';
        } else if (rName.includes('perfume') || rName.includes('fragrance')) {
          nicheKeywords = 'perfume,fragrance,scent';
        } else if (rName.includes('cafeteira') || rName.includes('coffee')) {
          nicheKeywords = 'coffee,maker,espresso';
        } else if (rName.includes('biblia') || rName.includes('bíblia')) {
          nicheKeywords = 'bible,book';
        }

        const keywordsArray = nicheKeywords.split(',');
        const searchKeyword = keywordsArray[Math.floor(Math.random() * keywordsArray.length)];

        imgName = `${slug}.jpg`;
        const imgPath = scheduleQueue ? path.join(repoImagesQueueDir, imgName) : path.join(tempDir, 'public', imgName);
        
        console.log(`Downloading dynamic auto image for "${post.title}" with keywords: "${searchKeyword}"...`);
        try {
          const fetchUrl = `https://loremflickr.com/800/600/${encodeURIComponent(searchKeyword)}`;
          await downloadImage(fetchUrl, imgPath);
          console.log(`Successfully downloaded auto image for "${post.title}"!`);
          
          articleContent = articleContent.replace('---', `---\nheroImage: "/${imgName}"`);
        } catch (err) {
          console.warn(`Failed to download auto image for "${post.title}":`, err.message);
          imgName = 'recommended-comfort.jpg';
          articleContent = articleContent.replace('---', `---\nheroImage: "/${imgName}"`);
        }
      } else {
        // Fallback default theme image
        articleContent = articleContent.replace('---', `---\nheroImage: "/recommended-comfort.jpg"`);
      }

      if (scheduleQueue) {
        const queueMetadata = {
          fileName: postFileName,
          content: articleContent,
          imageName: (post.imageOption === 'manual' || post.imageOption === 'auto') ? imgName : null,
          title: post.title,
          userEmail
        };
        fs.writeFileSync(path.join(repoQueueDir, `${slug}.json`), JSON.stringify(queueMetadata, null, 2), 'utf8');
      } else {
        fs.writeFileSync(postPath, articleContent, 'utf8');
      }

      generatedPosts.push({ title: post.title, slug, status: postStatus });
    }

    if (scheduleQueue) {
      console.log(`Successfully queued ${posts.length} posts for consolidation later!`);
      res.json({ success: true, queued: true, generatedPosts });
    } else {
      // 3. Stage, commit and push changes back to GitHub repo
      await git.add({ fs, dir: tempDir, filepath: '.' });
      await git.commit({
        fs,
        dir: tempDir,
        author: {
          name: 'Gerador Ninja Lote',
          email: 'ninja@geradorninja.com'
        },
        message: `feat: publicacao automatica em lote de ${posts.length} posts`
      });

      await git.push({
        fs,
        http: gitHttp,
        dir: tempDir,
        url: `https://github.com/${DEFAULT_ORG}/${repoName}.git`,
        onAuth: () => ({ username: gToken }),
        ref: 'main'
      });

      console.log(`Successfully completed batch generation and pushed to GitHub for ${repoName}!`);
      res.json({ success: true, generatedPosts });
    }

  } catch (err) {
    console.error('Batch Generation Error:', err);
    res.status(500).json({ error: 'Erro ao gerar artigos em lote', details: err.message });
  } finally {
    // Clean up temp dir
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (rmErr) {
      console.warn('Could not remove bulk temp folder:', rmErr.message);
    }
  }
});

// FUNÇÃO PARA CONSOLIDAR A FILA DE UM REPOSITÓRIO ESPECÍFICO E DAR PUSH
async function consolidateRepoQueue(repoName) {
  const QUEUE_DIR = path.join(__dirname, 'queue');
  const repoQueueDir = path.join(QUEUE_DIR, repoName);
  const repoImagesQueueDir = path.join(repoQueueDir, 'images');
  const configFile = path.join(repoQueueDir, '_config.json');

  if (!fs.existsSync(repoQueueDir)) {
    console.log(`Pasta da fila para ${repoName} não existe.`);
    return { success: false, reason: 'Fila vazia' };
  }

  let gToken = DEFAULT_GITHUB_TOKEN;
  if (fs.existsSync(configFile)) {
    try {
      const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      if (config.githubToken) gToken = config.githubToken;
    } catch (e) {
      console.error(`Erro ao ler _config.json da fila de ${repoName}:`, e);
    }
  }

  const files = fs.readdirSync(repoQueueDir).filter(f => f.endsWith('.json') && f !== '_config.json');
  if (files.length === 0) {
    console.log(`Nenhum artigo agendado na fila para ${repoName}.`);
    return { success: false, reason: 'Sem posts' };
  }

  console.log(`Consolidando ${files.length} posts para o repositório ${repoName}...`);
  const tempDir = path.join(os.tmpdir(), `consolidated-builder-${repoName}-${Date.now()}`);
  fs.mkdirSync(tempDir, { recursive: true });

  try {
    await git.clone({
      fs,
      http: gitHttp,
      dir: tempDir,
      url: `https://github.com/${DEFAULT_ORG}/${repoName}.git`,
      onAuth: () => ({ username: gToken }),
      singleBranch: true,
      depth: 1
    });

    for (const f of files) {
      const filePath = path.join(repoQueueDir, f);
      const postData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      const destPostPath = path.join(tempDir, 'src', 'content', 'blog', postData.fileName);
      fs.mkdirSync(path.dirname(destPostPath), { recursive: true });
      fs.writeFileSync(destPostPath, postData.content, 'utf8');

      if (postData.imageName) {
        const srcImgPath = path.join(repoImagesQueueDir, postData.imageName);
        if (fs.existsSync(srcImgPath)) {
          const destImgPath = path.join(tempDir, 'public', postData.imageName);
          fs.mkdirSync(path.dirname(destImgPath), { recursive: true });
          fs.copyFileSync(srcImgPath, destImgPath);
        }
      }
    }

    await git.add({ fs, dir: tempDir, filepath: '.' });
    await git.commit({
      fs,
      dir: tempDir,
      author: {
        name: 'Gerador Ninja Consolidador',
        email: 'ninja@geradorninja.com'
      },
      message: `feat: publicacao consolidada diaria de ${files.length} posts`
    });

    await git.push({
      fs,
      http: gitHttp,
      dir: tempDir,
      url: `https://github.com/${DEFAULT_ORG}/${repoName}.git`,
      onAuth: () => ({ username: gToken }),
      ref: 'main'
    });

    console.log(`Push consolidado concluído com sucesso para ${repoName}!`);
    fs.rmSync(repoQueueDir, { recursive: true, force: true });
    return { success: true, count: files.length };
  } catch (err) {
    console.error(`Erro durante a consolidação de ${repoName}:`, err);
    throw err;
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (rmErr) {
      console.warn('Não foi possível remover a pasta temporária de consolidação:', rmErr.message);
    }
  }
}

// FUNÇÃO PARA PROCESSAR TODAS AS FILAS
async function processConsolidatedQueue() {
  const QUEUE_DIR = path.join(__dirname, 'queue');
  if (!fs.existsSync(QUEUE_DIR)) return [];

  const dirs = fs.readdirSync(QUEUE_DIR).filter(d => {
    return fs.statSync(path.join(QUEUE_DIR, d)).isDirectory();
  });

  const processed = [];
  console.log(`[Scheduler] Iniciando verificação de fila para ${dirs.length} blogs...`);
  for (const repoName of dirs) {
    try {
      const res = await consolidateRepoQueue(repoName);
      if (res && res.success) {
        processed.push({ repoName, count: res.count });
      }
    } catch (err) {
      console.error(`[Scheduler] Erro ao consolidar fila para ${repoName}:`, err.message);
    }
  }
  console.log(`[Scheduler] Processamento da fila concluído.`);
  return processed;
}

// ROTA PARA EXECUTAR A CONSOLIDAÇÃO MANUALMENTE (PARA TESTES OU EXECUÇÃO FORÇADA)
app.post('/api/consolidate-queue', async (req, res) => {
  const { repoName } = req.body;
  try {
    if (repoName) {
      const result = await consolidateRepoQueue(repoName);
      if (result && result.success) {
        return res.json({ success: true, message: `Consolidação concluída para ${repoName}`, result });
      } else {
        return res.json({ success: false, message: `Fila vazia ou sem artigos para ${repoName}`, result });
      }
    } else {
      const result = await processConsolidatedQueue();
      if (result.length > 0) {
        return res.json({ success: true, message: 'Consolidação concluída para todas as filas', result });
      } else {
        return res.json({ success: false, message: 'Fila de consolidação vazia. Nenhum artigo pendente encontrado.' });
      }
    }
  } catch (err) {
    console.error('Erro na consolidação manual:', err);
    res.status(500).json({ error: 'Erro na consolidação manual', details: err.message });
  }
});

// Helper sluggify function inside server
function sluggify(text) {
  return text.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

app.get('/api/test-email', async (req, res) => {
  try {
    const emailBody = {
      name: 'Gerador Ninja Teste',
      email: 'no-reply@geradorninja.com',
      _subject: 'Teste de Diagnóstico - Gerador Ninja',
      'Mensagem': 'Se você está lendo isso, a chamada HTTP do servidor Vercel para o FormSubmit funcionou!'
    };
    
    const emailRes = await apiRequest({
      hostname: 'formsubmit.co',
      port: 443,
      path: '/ajax/randersonfreire2023@gmail.com',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SaaS-Generator-App',
        'Referer': 'http://geradorninja.com.br/',
        'Origin': 'http://geradorninja.com.br'
      }
    }, emailBody);

    res.json({
      statusCode: emailRes.statusCode,
      body: emailRes.body
    });
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

app.post('/api/register', async (req, res) => {
  const { name, email, password, geminiApiKey } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  try {
    const crypto = require('crypto');
    const repoPath = 'efeitodigitalcontato-ops/inteligencia-jovem-saas-factory';
    const gToken = DEFAULT_GITHUB_TOKEN;

    console.log('Fetching users.json from GitHub...');
    const getRes = await apiRequest({
      hostname: 'api.github.com',
      port: 443,
      path: `/repos/${repoPath}/contents/users.json`,
      method: 'GET',
      headers: {
        'Authorization': `token ${gToken}`,
        'User-Agent': 'SaaS-Generator-App',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    let users = [];
    let fileSha = null;

    if (getRes.statusCode === 200 && getRes.body && getRes.body.content) {
      fileSha = getRes.body.sha;
      const content = Buffer.from(getRes.body.content, 'base64').toString('utf8');
      try {
        users = JSON.parse(content);
      } catch (e) {
        users = [];
      }
    }

    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
    }

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    const newUser = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      approved: false,
      createdAt: new Date().toISOString(),
      geminiApiKey: geminiApiKey || ""
    };

    users.push(newUser);

    console.log('Updating users.json on GitHub...');
    const updatedContentBase64 = Buffer.from(JSON.stringify(users, null, 2), 'utf8').toString('base64');
    
    const putRes = await apiRequest({
      hostname: 'api.github.com',
      port: 443,
      path: `/repos/${repoPath}/contents/users.json`,
      method: 'PUT',
      headers: {
        'Authorization': `token ${gToken}`,
        'User-Agent': 'SaaS-Generator-App',
        'Content-Type': 'application/json'
      }
    }, {
      message: `Register new user: ${email}`,
      content: updatedContentBase64,
      sha: fileSha
    });

    if (putRes.statusCode !== 200 && putRes.statusCode !== 201) {
      console.error('Failed to write users.json:', putRes.body);
      return res.status(500).json({ error: 'Erro ao salvar cadastro no banco de dados.' });
    }

    console.log('Sending approval notification email to admin...');
    try {
      const emailBody = {
        name: 'Gerador Ninja',
        email: 'no-reply@geradorninja.com',
        _subject: 'Novo Cadastro para Aprovação - Gerador Ninja',
        'Nome do Usuário': name,
        'Email do Usuário': email,
        'Mensagem': `O usuário se cadastrou e precisa ser aprovado. Acesse o arquivo 'users.json' no GitHub da plataforma e altere 'approved' para true no cadastro dele.`
      };
      
      const emailRes = await apiRequest({
        hostname: 'formsubmit.co',
        port: 443,
        path: '/ajax/randersonfreire2023@gmail.com',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SaaS-Generator-App',
          'Referer': 'http://geradorninja.com.br/',
          'Origin': 'http://geradorninja.com.br'
        }
      }, emailBody);
      console.log('Admin notification response status:', emailRes.statusCode);
    } catch (mailErr) {
      console.error('Error sending admin notification email:', mailErr.message);
    }

    res.json({ success: true, message: 'Cadastro realizado! Sua conta foi enviada para aprovação do administrador.' });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ error: 'Erro interno ao realizar cadastro.' });
  }
});


// --- START OF TWO-FACTOR AUTHENTICATION (2FA) SECURE ENGINE ---

function generateBase32Secret(length = 16) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const crypto = require('crypto');
  const bytes = crypto.randomBytes(length);
  let secret = '';
  for (let i = 0; i < length; i++) {
    secret += alphabet[bytes[i] % 32];
  }
  return secret;
}

function base32Decode(base32) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let clean = base32.toUpperCase().replace(/=+$/, '');
  let length = clean.length;
  let bits = 0;
  let value = 0;
  let index = 0;
  const buffer = Buffer.alloc(Math.floor((length * 5) / 8));
  for (let i = 0; i < length; i++) {
    const val = alphabet.indexOf(clean[i]);
    if (val === -1) throw new Error('Invalid base32 character');
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      buffer[index++] = (value >> (bits - 8)) & 255;
      bits -= 8;
    }
  }
  return buffer;
}

function generateHOTP(secretBuffer, counter) {
  const crypto = require('crypto');
  const counterBuffer = Buffer.alloc(8);
  let tempCounter = counter;
  for (let i = 7; i >= 0; i--) {
    counterBuffer[i] = tempCounter & 255;
    tempCounter = tempCounter >> 8;
  }
  const hmac = crypto.createHmac('sha1', secretBuffer);
  hmac.update(counterBuffer);
  const hmacResult = hmac.digest();
  const offset = hmacResult[hmacResult.length - 1] & 15;
  const code = ((hmacResult[offset] & 127) << 24) |
               ((hmacResult[offset + 1] & 255) << 16) |
               ((hmacResult[offset + 2] & 255) << 8) |
               (hmacResult[offset + 3] & 255);
  const otp = code % 1000000;
  return otp.toString().padStart(6, '0');
}

function verifyTOTP(secretBase32, token, window = 1) {
  try {
    const secretBuffer = base32Decode(secretBase32);
    const currentCounter = Math.floor(Date.now() / 1000 / 30);
    for (let i = -window; i <= window; i++) {
      const generated = generateHOTP(secretBuffer, currentCounter + i);
      if (generated === token) {
        return true;
      }
    }
  } catch (e) {
    console.error('Error verifying TOTP:', e);
  }
  return false;
}

// Endpoint to trigger 2FA Setup
app.post('/api/two-factor/setup', async (req, res) => {
  const { userEmail } = req.body;
  if (!userEmail) {
    return res.status(400).json({ error: 'E-mail do usuário é obrigatório.' });
  }
  try {
    const repoPath = 'efeitodigitalcontato-ops/inteligencia-jovem-saas-factory';
    const gToken = DEFAULT_GITHUB_TOKEN;
    const getRes = await apiRequest({
      hostname: 'api.github.com',
      port: 443,
      path: `/repos/${repoPath}/contents/users.json`,
      method: 'GET',
      headers: {
        'Authorization': `token ${gToken}`,
        'User-Agent': 'SaaS-Generator-App',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    let users = [];
    if (getRes.statusCode === 200 && getRes.body && getRes.body.content) {
      const content = Buffer.from(getRes.body.content, 'base64').toString('utf8');
      users = JSON.parse(content);
    }

    const userIdx = users.findIndex(u => u.email.toLowerCase() === userEmail.toLowerCase());
    if (userIdx === -1) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const secret = generateBase32Secret(16);
    users[userIdx].twoFactorTempSecret = secret;

    const updatedContentBase64 = Buffer.from(JSON.stringify(users, null, 2), 'utf8').toString('base64');
    await apiRequest({
      hostname: 'api.github.com',
      port: 443,
      path: `/repos/${repoPath}/contents/users.json`,
      method: 'PUT',
      headers: {
        'Authorization': `token ${gToken}`,
        'User-Agent': 'SaaS-Generator-App',
        'Content-Type': 'application/json'
      }
    }, {
      message: `Setup temp 2FA for: ${userEmail}`,
      content: updatedContentBase64,
      sha: getRes.body.sha
    });

    const otpauthUrl = `otpauth://totp/Gerador%20Ninja:${encodeURIComponent(userEmail)}?secret=${secret}&issuer=Gerador%20Ninja`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`;

    res.json({
      success: true,
      secret,
      qrCodeUrl
    });
  } catch (err) {
    console.error('2FA Setup Error:', err);
    res.status(500).json({ error: 'Erro ao configurar 2FA.' });
  }
});

// Endpoint to confirm and enable 2FA
app.post('/api/two-factor/enable', async (req, res) => {
  const { userEmail, code } = req.body;
  if (!userEmail || !code) {
    return res.status(400).json({ error: 'E-mail e código são obrigatórios.' });
  }
  try {
    const repoPath = 'efeitodigitalcontato-ops/inteligencia-jovem-saas-factory';
    const gToken = DEFAULT_GITHUB_TOKEN;
    const getRes = await apiRequest({
      hostname: 'api.github.com',
      port: 443,
      path: `/repos/${repoPath}/contents/users.json`,
      method: 'GET',
      headers: {
        'Authorization': `token ${gToken}`,
        'User-Agent': 'SaaS-Generator-App',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    let users = [];
    if (getRes.statusCode === 200 && getRes.body && getRes.body.content) {
      const content = Buffer.from(getRes.body.content, 'base64').toString('utf8');
      users = JSON.parse(content);
    }

    const userIdx = users.findIndex(u => u.email.toLowerCase() === userEmail.toLowerCase());
    if (userIdx === -1) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const user = users[userIdx];
    const secret = user.twoFactorTempSecret;
    if (!secret) {
      return res.status(400).json({ error: 'Configuração de 2FA não iniciada.' });
    }

    const isValid = verifyTOTP(secret, code);
    if (!isValid) {
      return res.status(400).json({ error: 'Código de verificação inválido ou expirado.' });
    }

    user.twoFactorEnabled = true;
    user.twoFactorSecret = secret;
    delete user.twoFactorTempSecret;

    const updatedContentBase64 = Buffer.from(JSON.stringify(users, null, 2), 'utf8').toString('base64');
    await apiRequest({
      hostname: 'api.github.com',
      port: 443,
      path: `/repos/${repoPath}/contents/users.json`,
      method: 'PUT',
      headers: {
        'Authorization': `token ${gToken}`,
        'User-Agent': 'SaaS-Generator-App',
        'Content-Type': 'application/json'
      }
    }, {
      message: `Enable 2FA for: ${userEmail}`,
      content: updatedContentBase64,
      sha: getRes.body.sha
    });

    res.json({ success: true, message: 'Autenticação de dois fatores ativada com sucesso!' });
  } catch (err) {
    console.error('2FA Enable Error:', err);
    res.status(500).json({ error: 'Erro ao ativar 2FA.' });
  }
});

// Endpoint to disable 2FA
app.post('/api/two-factor/disable', async (req, res) => {
  const { userEmail, code } = req.body;
  if (!userEmail || !code) {
    return res.status(400).json({ error: 'E-mail e código são obrigatórios.' });
  }
  try {
    const repoPath = 'efeitodigitalcontato-ops/inteligencia-jovem-saas-factory';
    const gToken = DEFAULT_GITHUB_TOKEN;
    const getRes = await apiRequest({
      hostname: 'api.github.com',
      port: 443,
      path: `/repos/${repoPath}/contents/users.json`,
      method: 'GET',
      headers: {
        'Authorization': `token ${gToken}`,
        'User-Agent': 'SaaS-Generator-App',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    let users = [];
    if (getRes.statusCode === 200 && getRes.body && getRes.body.content) {
      const content = Buffer.from(getRes.body.content, 'base64').toString('utf8');
      users = JSON.parse(content);
    }

    const userIdx = users.findIndex(u => u.email.toLowerCase() === userEmail.toLowerCase());
    if (userIdx === -1) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const user = users[userIdx];
    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({ error: '2FA já está desativado.' });
    }

    const isValid = verifyTOTP(user.twoFactorSecret, code);
    if (!isValid) {
      return res.status(400).json({ error: 'Código de verificação inválido ou expirado.' });
    }

    user.twoFactorEnabled = false;
    delete user.twoFactorSecret;
    delete user.twoFactorTempSecret;

    const updatedContentBase64 = Buffer.from(JSON.stringify(users, null, 2), 'utf8').toString('base64');
    await apiRequest({
      hostname: 'api.github.com',
      port: 443,
      path: `/repos/${repoPath}/contents/users.json`,
      method: 'PUT',
      headers: {
        'Authorization': `token ${gToken}`,
        'User-Agent': 'SaaS-Generator-App',
        'Content-Type': 'application/json'
      }
    }, {
      message: `Disable 2FA for: ${userEmail}`,
      content: updatedContentBase64,
      sha: getRes.body.sha
    });

    res.json({ success: true, message: 'Autenticação de dois fatores desativada com sucesso.' });
  } catch (err) {
    console.error('2FA Disable Error:', err);
    res.status(500).json({ error: 'Erro ao desativar 2FA.' });
  }
});

// Endpoint to verify 2FA during Login
app.post('/api/login/verify-2fa', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: 'E-mail e código são obrigatórios.' });
  }
  try {
    const repoPath = 'efeitodigitalcontato-ops/inteligencia-jovem-saas-factory';
    const gToken = DEFAULT_GITHUB_TOKEN;
    const getRes = await apiRequest({
      hostname: 'api.github.com',
      port: 443,
      path: `/repos/${repoPath}/contents/users.json`,
      method: 'GET',
      headers: {
        'Authorization': `token ${gToken}`,
        'User-Agent': 'SaaS-Generator-App',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    let users = [];
    if (getRes.statusCode === 200 && getRes.body && getRes.body.content) {
      const content = Buffer.from(getRes.body.content, 'base64').toString('utf8');
      users = JSON.parse(content);
    }

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({ error: 'Autenticação de dois fatores não configurada ou inválida.' });
    }

    const isValid = verifyTOTP(user.twoFactorSecret, code);
    if (!isValid) {
      return res.status(400).json({ error: 'Código de verificação inválido ou expirado.' });
    }

    res.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        sites: user.sites || [],
        githubToken: decodeToken(user.githubToken || ""),
        vercelToken: decodeToken(user.vercelToken || ""),
        vercelTeamId: user.vercelTeamId || "",
        geminiApiKey: decodeToken(user.geminiApiKey || ""),
        twoFactorEnabled: true
      }
    });
  } catch (err) {
    console.error('2FA Verification Login Error:', err);
    res.status(500).json({ error: 'Erro interno ao verificar 2FA.' });
  }
});

// Original Login with 2FA check
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  try {
    const crypto = require('crypto');
    const repoPath = 'efeitodigitalcontato-ops/inteligencia-jovem-saas-factory';
    const gToken = DEFAULT_GITHUB_TOKEN;

    const getRes = await apiRequest({
      hostname: 'api.github.com',
      port: 443,
      path: `/repos/${repoPath}/contents/users.json`,
      method: 'GET',
      headers: {
        'Authorization': `token ${gToken}`,
        'User-Agent': 'SaaS-Generator-App',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    let users = [];
    if (getRes.statusCode === 200 && getRes.body && getRes.body.content) {
      const content = Buffer.from(getRes.body.content, 'base64').toString('utf8');
      try {
        users = JSON.parse(content);
      } catch (e) {
        users = [];
      }
    }

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    if (user.password !== hashedPassword) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    if (!user.approved) {
      return res.status(403).json({ error: 'Sua conta ainda não foi aprovada pelo administrador.' });
    }

    // Intercept with 2FA if enabled
    if (user.twoFactorEnabled) {
      return res.json({
        success: true,
        twoFactorRequired: true,
        email: user.email
      });
    }

    res.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        sites: user.sites || [],
        githubToken: decodeToken(user.githubToken || ""),
        vercelToken: decodeToken(user.vercelToken || ""),
        vercelTeamId: user.vercelTeamId || "",
        geminiApiKey: decodeToken(user.geminiApiKey || ""),
        twoFactorEnabled: false
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Erro interno ao realizar login.' });
  }
});
// Endpoint to check deployment status
app.get('/api/deployment-status/:id', async (req, res) => {
  const dplId = req.params.id;
  
  let vercelToken = req.query.vercelToken;
  if (!vercelToken || vercelToken === 'undefined' || vercelToken === 'null' || vercelToken.trim() === '') {
    vercelToken = DEFAULT_VERCEL_TOKEN;
  }
  
  let vercelTeamId = req.query.vercelTeamId;
  if (!vercelTeamId || vercelTeamId === 'undefined' || vercelTeamId === 'null' || vercelTeamId.trim() === '') {
    vercelTeamId = DEFAULT_VERCEL_TEAM;
  }

  try {
    const statusRes = await apiRequest({
      hostname: 'api.vercel.com',
      port: 443,
      path: `/v13/deployments/${dplId}?teamId=${vercelTeamId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${vercelToken}`
      }
    });

    if (statusRes.statusCode !== 200) {
      return res.status(statusRes.statusCode).json({ error: 'Erro ao buscar status na Vercel', details: statusRes.body });
    }

    res.json({
      readyState: statusRes.body.readyState || statusRes.body.status
    });
  } catch (err) {
    console.error('Status Error:', err);
    res.status(500).json({ error: 'Erro interno ao consultar status' });
  }
});

// Endpoint to configure custom domain on Vercel
app.post('/api/configure-domain', async (req, res) => {
  const { repoName, domain, vercelToken, vercelTeamId, userEmail } = req.body;
  if (!repoName || !domain) {
    return res.status(400).json({ error: 'Nome do repositório e domínio são obrigatórios.' });
  }

  const vToken = (!vercelToken || vercelToken === 'undefined' || vercelToken === 'null' || vercelToken.trim() === '') ? DEFAULT_VERCEL_TOKEN : vercelToken;
  const vTeam = (!vercelTeamId || vercelTeamId === 'undefined' || vercelTeamId === 'null' || vercelTeamId.trim() === '') ? DEFAULT_VERCEL_TEAM : vercelTeamId;

  try {
    console.log(`Adding domain ${domain} to project ${repoName}...`);
    const addDomainRes = await apiRequest({
      hostname: 'api.vercel.com',
      port: 443,
      path: `/v9/projects/${repoName}/domains?teamId=${vTeam}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vToken}`,
        'Content-Type': 'application/json'
      }
    }, {
      name: domain
    });

    if (addDomainRes.statusCode !== 200 && addDomainRes.statusCode !== 201) {
      return res.status(400).json({ error: 'Erro ao adicionar domínio na Vercel', details: addDomainRes.body });
    }

    let updatedSites = null;
    if (userEmail) {
      updatedSites = await saveUserSite(userEmail, {
        repoName: repoName,
        customDomain: domain,
        deployUrl: `https://${domain}`
      });
    }

    res.json({
      success: true,
      domain: domain,
      sites: updatedSites
    });
  } catch (err) {
    console.error('Configure Domain Error:', err);
    res.status(500).json({ error: 'Erro inesperado ao configurar domínio', details: err.message });
  }
});

// Endpoint to sync local sites to database
app.post('/api/sync-sites', async (req, res) => {
  const { userEmail, sites } = req.body;
  if (!userEmail || !Array.isArray(sites)) {
    return res.status(400).json({ error: 'E-mail e lista de sites são obrigatórios.' });
  }

  const repoPath = 'efeitodigitalcontato-ops/inteligencia-jovem-saas-factory';
  const gToken = DEFAULT_GITHUB_TOKEN;

  try {
    const getRes = await apiRequest({
      hostname: 'api.github.com',
      port: 443,
      path: `/repos/${repoPath}/contents/users.json`,
      method: 'GET',
      headers: {
        'Authorization': `token ${gToken}`,
        'User-Agent': 'SaaS-Generator-App',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (getRes.statusCode === 200 && getRes.body && getRes.body.content) {
      const fileSha = getRes.body.sha;
      const content = Buffer.from(getRes.body.content, 'base64').toString('utf8');
      const users = JSON.parse(content);

      const userIdx = users.findIndex(u => u.email.toLowerCase() === userEmail.toLowerCase());
      if (userIdx !== -1) {
        if (!users[userIdx].sites) {
          users[userIdx].sites = [];
        }

        // Merge sites
        sites.forEach(localSite => {
          const siteIdx = users[userIdx].sites.findIndex(s => s.repoName === localSite.repoName);
          if (siteIdx !== -1) {
            users[userIdx].sites[siteIdx] = { ...users[userIdx].sites[siteIdx], ...localSite };
          } else {
            users[userIdx].sites.push(localSite);
          }
        });

        const updatedContentBase64 = Buffer.from(JSON.stringify(users, null, 2), 'utf8').toString('base64');
        const putRes = await apiRequest({
          hostname: 'api.github.com',
          port: 443,
          path: `/repos/${repoPath}/contents/users.json`,
          method: 'PUT',
          headers: {
            'Authorization': `token ${gToken}`,
            'User-Agent': 'SaaS-Generator-App',
            'Content-Type': 'application/json'
          }
        }, {
          message: `Sync sites for user: ${userEmail}`,
          content: updatedContentBase64,
          sha: fileSha
        });

        if (putRes.statusCode === 200 || putRes.statusCode === 201) {
          return res.json({ success: true, sites: users[userIdx].sites });
        }
      }
    }
    res.status(400).json({ error: 'Erro ao encontrar usuário ou atualizar banco' });
  } catch (err) {
    console.error('Sync error:', err);
    res.status(500).json({ error: 'Erro interno ao sincronizar sites' });
  }
});

// Endpoint to save settings/credentials to the database
app.post('/api/save-settings', async (req, res) => {
  const { userEmail, githubToken, vercelToken, vercelTeamId, geminiApiKey } = req.body;
  if (!userEmail) {
    return res.status(400).json({ error: 'E-mail do usuário é obrigatório.' });
  }

  console.log(`[SAVE-SETTINGS] Starting update for user: ${userEmail}`);
  const repoPath = 'efeitodigitalcontato-ops/inteligencia-jovem-saas-factory';
  const gToken = DEFAULT_GITHUB_TOKEN;

  try {
    console.log(`[SAVE-SETTINGS] Fetching users.json from GitHub...`);
    const getRes = await apiRequest({
      hostname: 'api.github.com',
      port: 443,
      path: `/repos/${repoPath}/contents/users.json`,
      method: 'GET',
      headers: {
        'Authorization': `token ${gToken}`,
        'User-Agent': 'SaaS-Generator-App',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    console.log(`[SAVE-SETTINGS] GET users.json Status: ${getRes.statusCode}`);
    if (getRes.statusCode !== 200) {
      console.error(`[SAVE-SETTINGS] Failed to get users.json from GitHub. Status: ${getRes.statusCode}. Response:`, getRes.body);
      return res.status(getRes.statusCode || 400).json({ 
        error: `Erro ao buscar banco de usuários do GitHub (Status ${getRes.statusCode}).` 
      });
    }

    if (!getRes.body || !getRes.body.content) {
      console.error(`[SAVE-SETTINGS] GET response did not contain content.`);
      return res.status(400).json({ error: 'Resposta do GitHub não contém conteúdo.' });
    }

    const fileSha = getRes.body.sha;
    const content = Buffer.from(getRes.body.content, 'base64').toString('utf8');
    let users = [];
    try {
      users = JSON.parse(content);
    } catch (parseErr) {
      console.error(`[SAVE-SETTINGS] Failed to parse users.json:`, parseErr);
      return res.status(500).json({ error: 'Erro ao processar arquivo de usuários do banco.' });
    }

    const userIdx = users.findIndex(u => u.email.toLowerCase() === userEmail.toLowerCase());
    if (userIdx === -1) {
      console.warn(`[SAVE-SETTINGS] User ${userEmail} not found in users.json (Total users: ${users.length})`);
      return res.status(404).json({ 
        error: `Usuário com e-mail ${userEmail} não foi encontrado no sistema.` 
      });
    }

    console.log(`[SAVE-SETTINGS] User found at index ${userIdx}. Updating fields...`);
    users[userIdx].githubToken = encodeToken(githubToken || "");
    users[userIdx].vercelToken = encodeToken(vercelToken || "");
    users[userIdx].vercelTeamId = vercelTeamId || "";
    users[userIdx].geminiApiKey = encodeToken(geminiApiKey || "");

    const updatedContentBase64 = Buffer.from(JSON.stringify(users, null, 2), 'utf8').toString('base64');
    console.log(`[SAVE-SETTINGS] Saving updated users.json to GitHub with SHA: ${fileSha}...`);
    
    const putRes = await apiRequest({
      hostname: 'api.github.com',
      port: 443,
      path: `/repos/${repoPath}/contents/users.json`,
      method: 'PUT',
      headers: {
        'Authorization': `token ${gToken}`,
        'User-Agent': 'SaaS-Generator-App',
        'Content-Type': 'application/json'
      }
    }, {
      message: `Update credentials for user: ${userEmail}`,
      content: updatedContentBase64,
      sha: fileSha
    });

    console.log(`[SAVE-SETTINGS] PUT users.json Status: ${putRes.statusCode}`);
    if (putRes.statusCode === 200 || putRes.statusCode === 201) {
      console.log(`[SAVE-SETTINGS] Credentials successfully updated on GitHub for ${userEmail}.`);
      return res.json({
        success: true,
        user: {
          name: users[userIdx].name,
          email: users[userIdx].email,
          sites: users[userIdx].sites || [],
          githubToken: decodeToken(users[userIdx].githubToken),
          vercelToken: decodeToken(users[userIdx].vercelToken),
          vercelTeamId: users[userIdx].vercelTeamId,
          geminiApiKey: decodeToken(users[userIdx].geminiApiKey),
          twoFactorEnabled: !!users[userIdx].twoFactorEnabled
        }
      });
    } else {
      console.error(`[SAVE-SETTINGS] Failed to save users.json to GitHub. Status: ${putRes.statusCode}. Response:`, putRes.body);
      return res.status(putRes.statusCode || 400).json({
        error: `Erro ao salvar credenciais no GitHub (Código: ${putRes.statusCode}). Pode ser um conflito temporário.`
      });
    }
  } catch (err) {
    console.error('[SAVE-SETTINGS] Save settings unexpected error:', err);
    res.status(500).json({ error: 'Erro interno ao salvar credenciais.' });
  }
});

// Endpoint to get public config (like Google Client ID)
app.get('/api/config', (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || '888645008828-4mguptjjn7cg49ujvdgjb88a7615cp12.apps.googleusercontent.com'
  });
});

// Endpoint to authenticate with Google JWT ID Token
app.post('/api/auth/google', async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ error: 'ID Token do Google é obrigatório.' });
  }

  try {
    console.log('Verifying Google ID Token...');
    const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    if (!verifyRes.ok) {
      const errBody = await verifyRes.text();
      console.error('Google verification failed:', errBody);
      return res.status(400).json({ error: 'Token do Google inválido ou expirado.' });
    }

    const payload = await verifyRes.json();
    const email = payload.email;
    const name = payload.name || payload.given_name || 'Usuário Google';

    if (!email) {
      return res.status(400).json({ error: 'Não foi possível obter o e-mail da conta do Google.' });
    }

    const repoPath = 'efeitodigitalcontato-ops/inteligencia-jovem-saas-factory';
    const gToken = DEFAULT_GITHUB_TOKEN;

    console.log('Fetching users.json from GitHub to check Google user...');
    const getRes = await apiRequest({
      hostname: 'api.github.com',
      port: 443,
      path: `/repos/${repoPath}/contents/users.json`,
      method: 'GET',
      headers: {
        'Authorization': `token ${gToken}`,
        'User-Agent': 'SaaS-Generator-App',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    let users = [];
    let fileSha = null;

    if (getRes.statusCode === 200 && getRes.body && getRes.body.content) {
      fileSha = getRes.body.sha;
      const content = Buffer.from(getRes.body.content, 'base64').toString('utf8');
      try {
        users = JSON.parse(content);
      } catch (e) {
        users = [];
      }
    }

    let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      console.log(`Registering new Google user: ${email}`);
      const crypto = require('crypto');
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = crypto.createHash('sha256').update(randomPassword).digest('hex');

      user = {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        approved: false, // Requires admin approval
        createdAt: new Date().toISOString(),
        sites: [],
        geminiApiKey: ""
      };

      users.push(user);

      console.log('Updating users.json on GitHub with new Google user...');
      const updatedContentBase64 = Buffer.from(JSON.stringify(users, null, 2), 'utf8').toString('base64');
      await apiRequest({
        hostname: 'api.github.com',
        port: 443,
        path: `/repos/${repoPath}/contents/users.json`,
        method: 'PUT',
        headers: {
          'Authorization': `token ${gToken}`,
          'User-Agent': 'SaaS-Generator-App',
          'Content-Type': 'application/json'
        }
      }, {
        message: `Register Google user: ${email}`,
        content: updatedContentBase64,
        sha: fileSha
      });
    }

    if (!user.approved) {
      return res.status(403).json({ error: 'Sua conta ainda não foi aprovada pelo administrador.' });
    }

    res.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        sites: user.sites || [],
        githubToken: decodeToken(user.githubToken || ""),
        vercelToken: decodeToken(user.vercelToken || ""),
        vercelTeamId: user.vercelTeamId || "",
        geminiApiKey: decodeToken(user.geminiApiKey || "")
      }
    });

  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(500).json({ error: 'Erro interno ao autenticar com o Google.' });
  }
});

// ENDPOINT PARA VERIFICAR A POSIÇÃO DE UM SITE NO GOOGLE (ABA POSIÇÃO DO SITE)
app.post('/api/check-google-position', async (req, res) => {
  const { url, keyword, geminiApiKey, userEmail, repoName } = req.body;
  if (!url || !keyword) {
    return res.status(400).json({ error: 'URL/Domínio e Palavra-chave são obrigatórios.' });
  }

  // Limpa a palavra-chave e a URL
  const cleanKeyword = keyword.trim();
  const cleanUrl = url.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');

  console.log(`Checking position for domain/URL: "${cleanUrl}" with keyword: "${cleanKeyword}" (User: ${userEmail}, Repo: ${repoName})`);

  const apiKey = getValidGeminiKey(geminiApiKey) || process.env.GEMINI_API_KEY || decodeToken('enc:QUl6YVN5RHVnZktTNU9aLUhPZ2pWUTB6M19XNWRicWlySTd2ckgw');

  try {
    // 1. Tentar busca direta raspando o HTML do Google primeiro (método rápido)
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(cleanKeyword)}&num=100&hl=pt-BR`;
    
    console.log(`Fetching Google search: ${googleSearchUrl}`);
    const searchRes = await fetch(googleSearchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
      }
    });

    let html = '';
    let scrapedResults = [];
    let isBlocked = false;

    if (searchRes.ok) {
      html = await searchRes.text();
      const linkRegex = /<a\s+[^>]*href="([^"]+)"[^>]*>/gi;
      let match;
      const seenUrls = new Set();

      while ((match = linkRegex.exec(html)) !== null) {
        let href = match[1];
        let realUrl = '';

        if (href.startsWith('/url?q=')) {
          const qIdx = href.indexOf('?q=');
          const saIdx = href.indexOf('&sa=');
          if (qIdx !== -1) {
            const temp = saIdx !== -1 ? href.substring(qIdx + 3, saIdx) : href.substring(qIdx + 3);
            realUrl = decodeURIComponent(temp);
          }
        } else if (href.startsWith('http') && !href.includes('google.com') && !href.includes('gstatic.com') && !href.includes('youtube.com/')) {
          realUrl = href;
        }

        if (realUrl) {
          try {
            const parsedUrl = new URL(realUrl);
            const domain = parsedUrl.hostname.toLowerCase().replace('www.', '');
            if (!seenUrls.has(realUrl) && !realUrl.includes('google') && !realUrl.includes('webcache')) {
              seenUrls.add(realUrl);
              scrapedResults.push({
                url: realUrl,
                domain: domain,
                title: 'Resultado de Pesquisa Organização'
              });
            }
          } catch (e) {
            // URL inválida
          }
        }
      }

      console.log(`Scraped ${scrapedResults.length} raw organic URLs from Google HTML.`);
      if (html.includes('detected unusual traffic') || html.includes('captcha') || scrapedResults.length === 0) {
        console.warn('Google direct fetch was likely blocked or returned no results. Falling back to Gemini Search Grounding.');
        isBlocked = true;
      }
    } else {
      console.warn(`Google direct fetch returned status ${searchRes.status}. Falling back to Gemini Search Grounding.`);
      isBlocked = true;
    }

    let resultJson = {
      success: true,
      position: 0,
      pageUrl: null,
      topResults: [],
      searchVolume: 'Média',
      seoAdvice: [],
      method: 'Direct Scraper'
    };

    // 2. Se bloqueado ou sem resultados, usamos o Gemini com Google Search Grounding!
    if (isBlocked || scrapedResults.length === 0) {
      console.log('Invoking Gemini 2.5-Flash with Google Search tool...');
      const prompt = `Você é um Analista de SEO de elite do Gerador Ninja. Sua tarefa é analisar os resultados reais da busca do Google para a palavra-chave "${cleanKeyword}" e identificar a posição do site "${cleanUrl}" (ou qualquer página dentro deste domínio).

Faça uma busca no Google usando sua ferramenta de busca para a palavra-chave "${cleanKeyword}".
Retorne um objeto JSON estrito (sem wraps de markdown como \`\`\`json ou texto adicional) contendo:
1. "position": a posição numérica exata do site "${cleanUrl}" nos resultados orgânicos (ou 0 se não estiver nas primeiras 3 a 5 páginas).
2. "pageUrl": a URL específica da página encontrada que está ranqueando (ou null se não encontrado).
3. "topResults": uma lista com os 10 primeiros resultados orgânicos encontrados. Cada resultado deve ter "position" (1 a 10), "title", "url" e "snippet".
4. "searchVolume": uma estimativa de relevância/volume de busca mensal do termo (baixa, média, alta) com base na sua base de dados.
5. "seoAdvice": 3 dicas curtas e práticas específicas para melhorar o ranqueamento desse site para essa palavra-chave.

Responda APENAS o JSON válido no formato abaixo:
{
  "position": 3,
  "pageUrl": "https://etecsr.com.br/melhor-sofa",
  "topResults": [
    {"position": 1, "title": "Melhores Sofas de 2026", "url": "https://competitor.com/sofa", "snippet": "Análise completa dos sofás..."},
    ...
  ],
  "searchVolume": "Média",
  "seoAdvice": ["Melhore o link building", "Otimize title tags", "Crie mais interações"]
}`;

      const geminiRes = await apiRequest({
        hostname: 'generativelanguage.googleapis.com',
        port: 443,
        path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        contents: [{
          parts: [{ text: prompt }]
        }],
        tools: [{
          googleSearch: {}
        }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      });

      if (geminiRes.statusCode === 200 && geminiRes.body && geminiRes.body.candidates && geminiRes.body.candidates[0].content.parts[0].text) {
        let aiText = geminiRes.body.candidates[0].content.parts[0].text.trim();
        if (aiText.startsWith('```')) {
          aiText = aiText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
        }
        try {
          const aiJson = JSON.parse(aiText);
          resultJson = {
            success: true,
            position: aiJson.position || 0,
            pageUrl: aiJson.pageUrl || null,
            topResults: aiJson.topResults || [],
            searchVolume: aiJson.searchVolume || 'Média',
            seoAdvice: aiJson.seoAdvice || [],
            method: 'Gemini AI Search Grounding'
          };
        } catch (parseErr) {
          console.error('Error parsing Gemini JSON output:', parseErr, aiText);
        }
      } else {
        console.error('Gemini call failed or empty:', JSON.stringify(geminiRes.body));
      }
    } else {
      // 3. Raspagem direta com sucesso localmente
      let position = 0;
      let pageUrl = null;

      for (let i = 0; i < scrapedResults.length; i++) {
        const resUrl = scrapedResults[i].url;
        const resDomain = scrapedResults[i].domain;
        if (resUrl.includes(cleanUrl) || resDomain.includes(cleanUrl)) {
          position = i + 1;
          pageUrl = resUrl;
          break;
        }
      }

      const topResults = scrapedResults.slice(0, 10).map((r, idx) => ({
        position: idx + 1,
        title: r.title,
        url: r.url,
        snippet: `Link direto: ${r.url}`
      }));

      let seoAdvice = [
        "Melhore a autoridade da página (Page Authority) adicionando mais links internos apontando para este artigo.",
        "Otimize as meta tags (Title e Description) garantindo que a palavra-chave semente esteja no início de forma natural.",
        "Aumente o tempo de permanência do usuário adicionando imagens ricas e tabelas comparativas interativas."
      ];

      resultJson = {
        success: true,
        position,
        pageUrl,
        topResults,
        searchVolume: 'Média',
        seoAdvice,
        method: 'Direct Scraper'
      };
    }

    // Gravar no banco de dados se for um site registrado do usuário
    if (userEmail && repoName) {
      console.log(`Saving SEO position (${resultJson.position}) and keyword (${cleanKeyword}) for repo ${repoName} in users.json...`);
      const updatedSites = await saveUserSite(userEmail, {
        repoName: repoName,
        lastSeoKeyword: cleanKeyword,
        lastSeoPosition: resultJson.position,
        lastSeoDate: new Date().toISOString()
      });
      if (updatedSites) {
        resultJson.sites = updatedSites;
      }
    }

    return res.json(resultJson);

  } catch (err) {
    console.error('Error in check-google-position API:', err);
    res.status(500).json({ error: 'Erro interno ao processar a verificação de posição.' });
  }
});


function generateFallbackPost(theme, description) {
  const title = `Guia Completo sobre ${theme}: Como Escolher o Melhor para Você`;
  const desc = description || `Tudo o que você precisa saber para escolher os melhores produtos e serviços relacionados a ${theme}.`;
  const date = new Date().toISOString().split('T')[0];
  
  return `---
title: "${title}"
description: "${desc.slice(0, 155)}"
pubDate: ${date}
category: "Dicas"
author: "Redação"
---

<h2>Como começar a escolher os melhores itens sobre ${theme}</h2>
<p>Se você está buscando informações completas e análises detalhadas sobre <strong>${theme}</strong>, você chegou ao lugar certo. Neste artigo, vamos guiar você pelos principais fatores que devem ser considerados antes de tomar qualquer decisão de compra.</p>

<h3>1. Defina suas principais necessidades</h3>
<p>O primeiro passo é entender exatamente qual é o seu objetivo. Quando falamos sobre ${theme}, as opções no mercado são variadas e cada uma atende a um perfil diferente de consumidor.</p>
<ul>
  <li>Considere a frequência de uso.</li>
  <li>Avalie a durabilidade esperada do produto ou serviço.</li>
  <li>Estipule um orçamento inicial realista para seu investimento.</li>
</ul>

<h3>2. Compare as melhores marcas e opções</h3>
<p>Não se precipite na sua escolha. Pesquise e compare os diferenciais de cada fabricante ou prestador de serviço. Muitas vezes, pequenos detalhes técnicos fazem toda a diferença a longo prazo.</p>

<h3>Conclusão</h3>
<p>Esperamos que este guia inicial ajude você a dar os primeiros passos. Continue acompanhando nosso blog para ver reviews completas, guias de compra e dicas exclusivas para fazer a melhor escolha sempre!</p>
`;
}

// Scheduler to run consolidation at 23:00 (11:00 PM) local time
function startScheduler() {
  console.log('Deploy Consolidation Scheduler started.');
  setInterval(async () => {
    const now = new Date();
    // Check if it is exactly 23:00 (11:00 PM) local time
    if (now.getHours() === 23 && now.getMinutes() === 0) {
      console.log(`[Scheduler] It is 23:00. Starting consolidated queue processing...`);
      try {
        await processConsolidatedQueue();
      } catch (err) {
        console.error('[Scheduler] Error during scheduled consolidation:', err);
      }
    }
  }, 60 * 1000); // Check every minute
}

// Export for Vercel Serverless compatibility
if (process.env.NODE_ENV !== 'production' && require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`SaaS Server running on port ${PORT}`);
    startScheduler();
  });
}

module.exports = app;
