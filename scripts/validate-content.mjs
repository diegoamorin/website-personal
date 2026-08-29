import { access, readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

const ROOT = process.cwd();
const collections = [
  ['blog', join(ROOT, 'src', 'content', 'blog')],
  ['projects', join(ROOT, 'src', 'content', 'projects')],
];
const errors = [];

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

for (const [name, directory] of collections) {
  const files = (await readdir(directory, { recursive: true })).filter((file) => file.endsWith('.md'));
  if (!files.length) errors.push(`${name}: no contiene Markdown.`);
  for (const file of files) {
    const absolute = join(directory, file);
    const contents = await readFile(absolute, 'utf8');
    const references = [
      ...contents.matchAll(/!\[[^\]]*\]\((\.\/[^\s)]+)/g),
      ...contents.matchAll(/(?:featuredImage|image):\s*['"]?(\.\/[^\s'"\n]+)/g),
      ...contents.matchAll(/<(?:video|source)[^>]+src=["'](\.\/[^"']+)/g),
    ];
    for (const match of references) {
      const target = resolve(dirname(absolute), match[1]);
      if (!(await exists(target))) errors.push(`${file}: falta ${match[1]}.`);
    }
  }
}

const blogCount = (await readdir(collections[0][1], { recursive: true })).filter((file) => file.endsWith('.md')).length;
const projectCount = (await readdir(collections[1][1], { recursive: true })).filter((file) => file.endsWith('.md')).length;

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Contenido válido: ${blogCount} artículos y ${projectCount} proyectos.`);
}
