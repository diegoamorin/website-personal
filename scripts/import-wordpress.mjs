import { access, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { load as loadHtml } from 'cheerio';
import he from 'he';
import * as yaml from 'js-yaml';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const SITE_URL = 'https://diegoamorin.com';
const WP_API = `${SITE_URL}/wp-json/wp/v2`;
const ROOT = process.cwd();
const BLOG_DIR = join(ROOT, 'src', 'content', 'blog');
const PROJECTS_DIR = join(ROOT, 'src', 'content', 'projects');
const SITE_ASSETS_DIR = join(ROOT, 'src', 'assets', 'site');
const FORCE = process.argv.includes('--force');
const RESERVED_POST_SLUGS = new Set(['blog', 'proyecto', 'proyectos']);

const siteAssets = {
  'diego-hero.jpg': 'https://diegoamorin.com/wp-content/uploads/2025/10/diego-hero-image-2025-2.jpg',
  'diego-about.jpg': 'https://diegoamorin.com/wp-content/uploads/2025/06/diego-amorin-768x768.jpg',
  'brand-gric.svg': 'https://diegoamorin.com/wp-content/uploads/2025/07/logo-gric.svg',
  'brand-palmeras.svg': 'https://diegoamorin.com/wp-content/uploads/2025/10/logo-las-palmeras-del-sur.svg',
  'brand-papaya.svg': 'https://diegoamorin.com/wp-content/uploads/2025/07/logo-marketing-papaya.svg',
  'brand-citigram.svg': 'https://diegoamorin.com/wp-content/uploads/2025/07/logo-citigram.svg',
  'brand-guo.svg': 'https://diegoamorin.com/wp-content/uploads/2025/07/logo-guo.svg',
  'brand-lifetime.svg': 'https://diegoamorin.com/wp-content/uploads/2025/07/logo-lifetime.svg',
  'testimonial-luis.png': 'https://diegoamorin.com/wp-content/uploads/2022/12/luispino.png',
  'testimonial-ani.jpg': 'https://diegoamorin.com/wp-content/uploads/2024/01/AniGuevara.jpg',
  'testimonial-cristopher.jpg': 'https://diegoamorin.com/wp-content/uploads/2024/06/cristopher-rivas.jpg',
  'testimonial-franklin.jpg': 'https://diegoamorin.com/wp-content/uploads/2024/04/franklinvargas.jpg',
};

const knownClients = {
  'citigram-landing-pages': {
    name: 'Luis Pino',
    role: 'Cofundador de Citigram',
    imageUrl: siteAssets['testimonial-luis.png'],
    testimonial:
      'Diego es muy profesional, proactivo, ordenado pero sobre todo apasionado. Venimos trabajando un buen tiempo con la creación de nuestra página web, y sinceramente ha sido y sigue siendo una experiencia muy buena, porque vamos logrando los objetivos que nos estamos proponiendo en este aspecto. Lo recomiendo totalmente!',
  },
  'marketing-papaya-google-ads': {
    name: 'Ani Guevara',
    role: 'CEO de Marketing Papaya',
    imageUrl: siteAssets['testimonial-ani.jpg'],
    testimonial:
      'Recientemente, tuve la oportunidad de trabajar con Diego para el diseño de mi landing page y quedé completamente satisfecha con los resultados. Diego demostró un alto nivel de profesionalismo y creatividad en su trabajo. Su habilidad para capturar exactamente lo que necesitaba y darle vida a mis ideas fue impresionante. Además, su atención al detalle y su compromiso con la calidad son dignos de elogio. Sin duda, recomiendo a Diego a cualquiera que busque servicios de diseño web de alta calidad. Su talento y dedicación son evidentes en cada aspecto de su trabajo.',
  },
  'gric-bienes-raices': {
    name: 'Cristopher Rivas',
    role: 'Agente inmobiliario',
    imageUrl: siteAssets['testimonial-cristopher.jpg'],
    testimonial:
      'Contacté a Diego porque quería mejorar completamente mi página web y la experiencia de usuario. Escuchó mis necesidades, se adaptó a Webflow y el resultado ha sido impresionante. Es organizado, diseña y programa muy bien; ha sido una muy buena decisión haberlo contratado.',
  },
  'lifetime-coffee': {
    name: 'Franklin Vargas',
    role: 'Gerente de Lifetime Coffee',
    imageUrl: siteAssets['testimonial-franklin.jpg'],
    testimonial:
      'Diego creó mi página web con mucha organización y profesionalismo. Escuchó mis necesidades, adaptó su trabajo a mis ideas y desarrolló un diseño y código de alta calidad. Lo recomiendo para cualquier proyecto web.',
  },
};

const knownProjectMeta = {
  'gric-bienes-raices': {
    startedAt: '2024-04-26',
    projectUrl: 'https://www.gricbienesraices.com/',
  },
  'citigram-landing-pages': { startedAt: '2024-02-07' },
  'marketing-papaya-google-ads': {
    startedAt: '2023-12-29',
    projectUrl: 'https://evolucionaagenciadigital.com/',
  },
  'lifetime-coffee': {
    startedAt: '2023-08-14',
    projectUrl: 'https://lifetimecoffee.pe/',
  },
  citigram: {
    startedAt: '2022-10-07',
    projectUrl: 'https://citigram.pe/',
  },
  'stickers-de-millie-bobby': { startedAt: '2020-10-17' },
};

function log(message) {
  process.stdout.write(`${message}\n`);
}

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function containsMarkdown(path) {
  if (!(await pathExists(path))) return false;
  const entries = await readdir(path, { recursive: true });
  return entries.some((entry) => entry.endsWith('.md'));
}

async function prepareDirectories() {
  const hasExistingContent =
    (await containsMarkdown(BLOG_DIR)) || (await containsMarkdown(PROJECTS_DIR));

  if (hasExistingContent && !FORCE) {
    throw new Error(
      'Ya existe contenido importado. Usa --force solo si deseas reemplazarlo por completo.',
    );
  }

  if (FORCE) {
    await rm(BLOG_DIR, { recursive: true, force: true });
    await rm(PROJECTS_DIR, { recursive: true, force: true });
  }

  await Promise.all([
    mkdir(BLOG_DIR, { recursive: true }),
    mkdir(PROJECTS_DIR, { recursive: true }),
    mkdir(SITE_ASSETS_DIR, { recursive: true }),
  ]);
}

async function fetchWithRetry(url, options = {}, attempts = 4) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'Diego-Amorin-Astro-Migrator/1.0',
          Accept: '*/*',
          ...options.headers,
        },
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 500));
      }
    }
  }
  throw new Error(`No se pudo descargar ${url}: ${lastError?.message}`);
}

async function fetchAll(type) {
  const url = new URL(`${WP_API}/${type}`);
  url.searchParams.set('status', 'publish');
  url.searchParams.set('per_page', '100');
  url.searchParams.set('_embed', '1');
  const response = await fetchWithRetry(url);
  const expected = Number(response.headers.get('x-wp-total') || 0);
  const entries = await response.json();
  if (entries.length !== expected) {
    throw new Error(`${type}: WordPress anunció ${expected} entradas y devolvió ${entries.length}.`);
  }
  return entries;
}

function cleanText(value = '') {
  const $ = loadHtml(`<div>${value}</div>`);
  return he
    .decode($('div').text())
    .replace(/\[…\]|\[&hellip;\]|\s+/g, ' ')
    .trim();
}

function safeSlug(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function fileNameFor(url, usedNames) {
  const parsed = new URL(url);
  let name = decodeURIComponent(basename(parsed.pathname)) || 'asset';
  name = name.replace(/[^a-zA-Z0-9._-]/g, '-');
  const original = name;
  let counter = 1;
  while (usedNames.has(name) && usedNames.get(name) !== url) {
    const extension = extname(original);
    name = `${basename(original, extension)}-${counter}${extension}`;
    counter += 1;
  }
  usedNames.set(name, url);
  return name;
}

async function downloadTo(url, targetPath) {
  const response = await fetchWithRetry(url);
  const buffer = Buffer.from(await response.arrayBuffer());
  if (!buffer.length) throw new Error(`El recurso ${url} llegó vacío.`);
  await writeFile(targetPath, buffer);
}

async function downloadSiteAssets() {
  log('Descargando recursos de Inicio…');
  await Promise.all(
    Object.entries(siteAssets).map(async ([name, url]) => {
      const target = join(SITE_ASSETS_DIR, name);
      if (!FORCE && (await pathExists(target))) return;
      await downloadTo(url, target);
    }),
  );
}

function termsFor(entry, taxonomy) {
  const groups = entry._embedded?.['wp:term'] || [];
  return groups
    .flat()
    .filter((term) => term.taxonomy === taxonomy)
    .map((term) => cleanText(term.name));
}

function featuredMedia(entry) {
  const media = entry._embedded?.['wp:featuredmedia']?.[0];
  if (!media) return null;
  return {
    url: media.source_url,
    alt: cleanText(media.alt_text) || cleanText(entry.title.rendered),
  };
}

function findLabeledDate($, label) {
  const nodes = $('h1,h2,h3,h4,h5,p,span')
    .toArray()
    .map((node) => cleanText($(node).text()))
    .filter(Boolean);
  const index = nodes.findIndex((text) => text.toLowerCase() === label.toLowerCase());
  for (let cursor = index + 1; index >= 0 && cursor < Math.min(nodes.length, index + 8); cursor += 1) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(nodes[cursor])) return nodes[cursor];
  }
  return null;
}

async function scrapeProjectMeta(entry) {
  const known = knownProjectMeta[entry.slug] || {};
  try {
    const response = await fetchWithRetry(entry.link);
    const html = await response.text();
    const $ = loadHtml(html);
    const startedAt = findLabeledDate($, 'Fecha de inicio:');
    let projectUrl;
    $('a[href]').each((_, anchor) => {
      if (projectUrl) return;
      const text = cleanText($(anchor).text()).toLowerCase();
      const href = $(anchor).attr('href');
      if (!href || !text.includes('visitar proyecto')) return;
      try {
        const candidate = new URL(href, SITE_URL);
        if (candidate.hostname !== 'diegoamorin.com' && candidate.protocol.startsWith('http')) {
          projectUrl = candidate.toString();
        }
      } catch {
        // El campo quedará inactivo.
      }
    });
    return {
      startedAt: known.startedAt || startedAt,
      projectUrl: known.projectUrl || projectUrl,
    };
  } catch (error) {
    log(`Aviso: no se pudieron complementar los metadatos de ${entry.slug}: ${error.message}`);
    return known;
  }
}

async function gistToCode(url) {
  const id = url.match(/gist\.github\.com\/[^/]+\/([a-f0-9]+)/i)?.[1];
  if (!id) return null;
  try {
    const response = await fetchWithRetry(`https://api.github.com/gists/${id}`, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    const gist = await response.json();
    return Object.values(gist.files)
      .map((file) => ({
        language: file.language ? safeSlug(file.language) : extname(file.filename).slice(1),
        content: file.content,
      }))
      .filter((file) => file.content);
  } catch {
    return null;
  }
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function htmlToMarkdown(html, assetDir) {
  const $ = loadHtml(`<main>${html}</main>`, null, false);
  const usedNames = new Map();
  const downloaded = new Map();
  const tokens = new Map();
  let tokenCount = 0;

  function makeToken(htmlValue) {
    const token = `MIGRATIONTOKEN${tokenCount}`;
    tokenCount += 1;
    tokens.set(token, htmlValue);
    return token;
  }

  const headingIds = new Map();
  const seenHeadingSlugs = new Map();
  $('h2,h3,h4').each((_, heading) => {
    const oldId = $(heading).attr('id');
    const base = safeSlug(cleanText($(heading).text())) || 'seccion';
    const seen = seenHeadingSlugs.get(base) || 0;
    const generated = seen ? `${base}-${seen}` : base;
    seenHeadingSlugs.set(base, seen + 1);
    if (oldId) headingIds.set(oldId, generated);
    $(heading).removeAttr('id class');
  });
  $('a[href^="#"]').each((_, anchor) => {
    const old = $(anchor).attr('href')?.slice(1);
    if (old && headingIds.has(old)) $(anchor).attr('href', `#${headingIds.get(old)}`);
  });

  const gistScripts = $('script[src*="gist.github.com"]').toArray();
  for (const script of gistScripts) {
    const src = $(script).attr('src');
    const files = src ? await gistToCode(src) : null;
    if (files?.length) {
      const replacement = files
        .map(
          (file) =>
            `<pre data-language="${file.language || 'text'}"><code>${escapeHtml(file.content)}</code></pre>`,
        )
        .join('\n');
      $(script).replaceWith(replacement);
    } else {
      $(script).replaceWith(`<p><a href="${src}">Ver código fuente en GitHub Gist</a></p>`);
    }
  }

  const images = $('img[src]').toArray();
  for (const image of images) {
    const src = $(image).attr('src');
    if (!src) continue;
    const absolute = new URL(src, SITE_URL).toString();
    let name = downloaded.get(absolute);
    if (!name) {
      name = fileNameFor(absolute, usedNames);
      await downloadTo(absolute, join(assetDir, name));
      downloaded.set(absolute, name);
    }
    $(image)
      .attr('src', `./${name}`)
      .removeAttr('srcset sizes class style width height loading decoding fetchpriority');
  }

  const videos = $('video[src]').toArray();
  for (const video of videos) {
    const src = $(video).attr('src');
    if (!src) continue;
    const absolute = new URL(src, SITE_URL).toString();
    const name = fileNameFor(absolute, usedNames);
    await downloadTo(absolute, join(assetDir, name));
    const token = makeToken(`<video class="article-video" controls preload="metadata" src="./${name}"></video>`);
    $(video).replaceWith(`<p>${token}</p>`);
  }

  $('iframe').each((_, iframe) => {
    const src = $(iframe).attr('src');
    const title = cleanText($(iframe).attr('title')) || 'Video relacionado';
    if (!src) {
      $(iframe).remove();
      return;
    }
    try {
      const parsed = new URL(src);
      const videoId = parsed.pathname.match(/\/embed\/([^/]+)/)?.[1];
      if (parsed.hostname.includes('youtube.com') && videoId) {
        const safeTitle = title.replace(/"/g, '&quot;');
        const token = makeToken(
          `<div class="video-embed"><iframe src="https://www.youtube-nocookie.com/embed/${videoId}" title="${safeTitle}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`,
        );
        $(iframe).replaceWith(`<p>${token}</p>`);
      } else {
        $(iframe).replaceWith(`<p><a href="${src}">${title}</a></p>`);
      }
    } catch {
      $(iframe).remove();
    }
  });

  $('script,style,noscript,.shcb-language').remove();
  $('mark,span').each((_, node) => $(node).replaceWith($(node).contents()));
  $('a[href]').each((_, anchor) => {
    const href = $(anchor).attr('href');
    if (!href) return;
    try {
      const url = new URL(href, SITE_URL);
      if (url.hostname !== 'diegoamorin.com') return;
      if (url.pathname.startsWith('/wp-content/')) return;
      const projectMatch = url.pathname.match(/^\/proyectos\/([^/]+)\/?$/);
      $(anchor).attr('href', projectMatch ? `/proyecto/${projectMatch[1]}/` : `${url.pathname}${url.hash}`);
    } catch {
      // Conserva enlaces relativos válidos.
    }
  });

  const turndown = new TurndownService({
    headingStyle: 'atx',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    fence: '```',
    emDelimiter: '*',
  });
  turndown.use(gfm);
  turndown.addRule('wordpressCodeBlock', {
    filter: (node) => node.nodeName === 'PRE',
    replacement: (_, node) => {
      const rawLanguage = node.getAttribute('data-language') ||
        node.querySelector('code')?.getAttribute('class')?.match(/language-([\w-]+)/)?.[1] ||
        '';
      const language = rawLanguage === 'gradle' ? 'groovy' : rawLanguage;
      const code = node.textContent.replace(/^\n|\n$/g, '');
      return `\n\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;
    },
  });
  turndown.addRule('figure', {
    filter: 'figure',
    replacement: (content) => `\n\n${content.trim()}\n\n`,
  });
  turndown.addRule('figcaption', {
    filter: 'figcaption',
    replacement: (content) => (content.trim() ? `\n\n*${content.trim()}*` : ''),
  });

  let markdown = turndown.turndown($('main').html() || '');
  for (const [token, replacement] of tokens) {
    markdown = markdown.replace(token, `\n\n${replacement}\n\n`);
  }
  return markdown
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/[ \t]+$/gm, '')
    .trim();
}

function frontmatter(data) {
  return `---\n${yaml.dump(data, { lineWidth: -1, noRefs: true, sortKeys: false }).trim()}\n---\n\n`;
}

async function writeBlogPost(entry) {
  if (RESERVED_POST_SLUGS.has(entry.slug)) {
    throw new Error(`El artículo ${entry.slug} colisiona con una ruta reservada.`);
  }
  const directory = join(BLOG_DIR, entry.slug);
  await mkdir(directory, { recursive: true });
  const markdown = await htmlToMarkdown(entry.content.rendered, directory);
  const media = featuredMedia(entry);
  let featuredImage;
  if (media) {
    const name = fileNameFor(media.url, new Map());
    await downloadTo(media.url, join(directory, name));
    featuredImage = `./${name}`;
  }
  const words = cleanText(markdown).split(/\s+/).filter(Boolean).length;
  const data = {
    title: cleanText(entry.title.rendered),
    description: cleanText(entry.excerpt.rendered).slice(0, 220),
    publishedAt: entry.date,
    updatedAt: entry.modified,
    ...(featuredImage ? { featuredImage } : {}),
    featuredImageAlt: media?.alt || '',
    categories: termsFor(entry, 'category'),
    readingTime: Math.max(1, Math.ceil(words / 220)),
    sourceUrl: entry.link,
  };
  await writeFile(join(directory, 'index.md'), `${frontmatter(data)}${markdown}\n`, 'utf8');
}

async function writeProject(entry) {
  const directory = join(PROJECTS_DIR, entry.slug);
  await mkdir(directory, { recursive: true });
  const markdown = await htmlToMarkdown(entry.content.rendered, directory);
  const media = featuredMedia(entry);
  let featuredImage;
  if (media) {
    const name = fileNameFor(media.url, new Map());
    await downloadTo(media.url, join(directory, name));
    featuredImage = `./${name}`;
  }
  const scraped = await scrapeProjectMeta(entry);
  const client = knownClients[entry.slug] || {
    name: 'Nombre del cliente',
    role: 'Cargo o empresa',
    testimonial: 'Añade aquí el testimonio del cliente relacionado con este proyecto.',
  };
  let clientImage;
  if (client.imageUrl) {
    const name = `cliente${extname(new URL(client.imageUrl).pathname) || '.jpg'}`;
    await downloadTo(client.imageUrl, join(directory, name));
    clientImage = `./${name}`;
  }
  const categories = termsFor(entry, 'categorias');
  const data = {
    title: cleanText(entry.title.rendered),
    summary: cleanText(entry.excerpt.rendered),
    publishedAt: entry.date,
    updatedAt: entry.modified,
    startedAt: scraped.startedAt || entry.date.slice(0, 10),
    category: categories[0] || 'Proyecto web',
    technologies: termsFor(entry, 'tecnologias'),
    ...(featuredImage ? { featuredImage } : {}),
    featuredImageAlt: media?.alt || '',
    ...(scraped.projectUrl ? { projectUrl: scraped.projectUrl } : {}),
    projectUrlStatus: scraped.projectUrl ? 'active' : 'inactive',
    sourceUrl: entry.link,
    client: {
      name: client.name,
      role: client.role,
      ...(clientImage ? { image: clientImage } : {}),
      testimonial: client.testimonial,
    },
  };
  await writeFile(join(directory, 'index.md'), `${frontmatter(data)}${markdown}\n`, 'utf8');
}

async function main() {
  await prepareDirectories();
  await downloadSiteAssets();
  log('Consultando WordPress…');
  const [posts, projects] = await Promise.all([fetchAll('posts'), fetchAll('proyectos')]);
  log(`Importando ${posts.length} artículos…`);
  for (const [index, post] of posts.entries()) {
    log(`  [${index + 1}/${posts.length}] ${post.slug}`);
    await writeBlogPost(post);
  }
  log(`Importando ${projects.length} proyectos…`);
  for (const [index, project] of projects.entries()) {
    log(`  [${index + 1}/${projects.length}] ${project.slug}`);
    await writeProject(project);
  }
  log(`Migración terminada: ${posts.length} artículos y ${projects.length} proyectos.`);
}

main().catch((error) => {
  console.error(`\nError de migración: ${error.message}`);
  process.exitCode = 1;
});
