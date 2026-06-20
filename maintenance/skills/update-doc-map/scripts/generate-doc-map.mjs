#!/usr/bin/env node

/**
 * generate-doc-map.mjs
 * 
 * Scans the project for all documentation files and generates a doc-map.md
 * file that helps AI agents navigate the codebase documentation.
 */

import { readdir, stat, writeFile } from 'node:fs/promises';
import { join, relative, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
// The script is in .agents/, so the project root is one level up
// Accept PROJECT_ROOT from command line argument or environment variable, otherwise calculate
const PROJECT_ROOT = process.argv[2] || process.env.PROJECT_ROOT || join(__dirname, '../../../../..');

// Packages that have their own .agents/documentation
const PACKAGES = [
  'core', 'agent', 'cli', 'wscli', 'types', 'smem', 'tmem', 'server'
];

/**
 * Recursively find all markdown files in a directory
 */
async function findMarkdownFiles(dir, baseDir) {
  const files = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        // Skip node_modules and other non-doc directories
        if (!['node_modules', '.git', 'dist', 'build', '__pycache__'].includes(entry.name)) {
          files.push(...await findMarkdownFiles(fullPath, baseDir));
        }
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const relPath = relative(baseDir, fullPath);
        files.push({ path: fullPath, relative: relPath });
      }
    }
  } catch (err) {
    // Skip directories we can't read
  }
  return files;
}

/**
 * Extract a human-readable title from the filename
 */
function extractTitle(fileRelative) {
  const parts = fileRelative.split('/');
  const filename = basename(fileRelative, '.md');

  // Try to get a better name from the path segments
  if (parts.length > 1) {
    return parts.slice(0, -1).join('/') + '/' + filename;
  }
  return filename;
}

/**
 * Format a file path for display and linking using full workspace-relative path
 */
function formatLink(fileRelative, basePath) {
  // Return full path from workspace root with .md extension preserved
  return `${basePath}/${fileRelative}`;
}

/**
 * Generate the documentation map markdown content
 */
async function generateDocMap() {
  const docSections = [];

  // Scan public documentation (docsite/public/doc)
  const publicDocPath = join(PROJECT_ROOT, 'docsite/public/doc');
  try {
    await stat(publicDocPath);
    const files = await findMarkdownFiles(publicDocPath, publicDocPath);

    if (files.length > 0) {
      // Group by top-level category
      const grouped = {};
      for (const file of files) {
        const parts = file.relative.split('/');
        const category = parts[0] || 'root';
        if (!grouped[category]) grouped[category] = [];
        grouped[category].push(file);
      }

      docSections.push({
        title: '📚 Public Documentation',
        description: 'Main project documentation hosted in the docsite.',
        files: grouped,
        basePath: 'docsite/public/doc'
      });
    }
  } catch (err) {
    // Skip if directory doesn't exist
  }

  // Scan root .agents/documentation
  const rootAgentsPath = join(PROJECT_ROOT, '.agents/documentation');
  try {
    await stat(rootAgentsPath);
    const files = await findMarkdownFiles(rootAgentsPath, rootAgentsPath);

    if (files.length > 0) {
      docSections.push({
        title: '🤖 Root Agent Documentation',
        description: 'Documentation for the agent system itself.',
        files: { '': files },
        basePath: '.agents'
      });
    }
  } catch (err) {
    // Skip if directory doesn't exist
  }

  // Scan each package's .agents/documentation
  for (const pkg of PACKAGES) {
    const pkgAgentsPath = join(PROJECT_ROOT, `packages/${pkg}/.agents/documentation`);
    try {
      await stat(pkgAgentsPath);
      const files = await findMarkdownFiles(pkgAgentsPath, pkgAgentsPath);

      if (files.length > 0) {
        docSections.push({
          title: `📦 Package: @agent-smith/${pkg}`,
          description: `Documentation for the ${pkg} package.`,
          files: { '': files },
          basePath: `packages/${pkg}/.agents/documentation`
        });
      }
    } catch (err) {
      // Skip if directory doesn't exist or has no docs
    }
  }

  // Generate the markdown content - compact format for AI agents
  const lines = [
    '# 🗺️ Documentation Map',
    '',
  ];

  // Detailed sections only (no summary table, no horizontal rules)
  for (const section of docSections) {
    lines.push(`## ${section.title}`);
    lines.push('');

    for (const [category, files] of Object.entries(section.files)) {
      if (files.length === 0) continue;

      if (category) {
        lines.push(`### ${category}`);
        lines.push('');
      }

      // Sort files: files starting with numbers come first, then alphabetical
      const sortedFiles = [...files].sort((a, b) => {
        const aName = basename(a.relative, '.md');
        const bName = basename(b.relative, '.md');
        return aName.localeCompare(bName, undefined, { numeric: true });
      });

      for (const file of sortedFiles) {
        const fullPath = formatLink(file.relative, section.basePath);
        const workspacePath = `agent-smith/${fullPath}`;
        lines.push(`- [\`${workspacePath}\`](${workspacePath})`);
      }

      lines.push('');
    }
  }

  return lines.join('\n');
}

// Main execution
async function main() {
  console.log('🔍 Scanning for documentation files...');

  const content = await generateDocMap();
  const outputPath = join(PROJECT_ROOT, '.agents/documentation/documentation-map.md');

  // Write the file
  await writeFile(outputPath, content, 'utf-8');

  console.log(`✅ Documentation map generated: ${outputPath}`);
}

main().catch(err => {
  console.error('❌ Error generating doc-map:', err);
  process.exit(1);
});
