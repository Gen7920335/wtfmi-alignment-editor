const fs = require('fs');
const path = require('path');

const inputDirectory = process.argv[2];
if (!inputDirectory || !fs.statSync(inputDirectory).isDirectory()) {
  throw new Error('Usage: node scripts/build-cloud-state.js <project-directory>');
}

const candidates = [];
for (const entry of fs.readdirSync(inputDirectory, { withFileTypes: true })) {
  if (!entry.isFile() || !/^wtfmi-alignment-.*\.json$/i.test(entry.name)) continue;
  const filePath = path.join(inputDirectory, entry.name);
  const project = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!['wtfmi-alignment-project-v1', 'wtfmi-alignment-project-v2'].includes(project.schema)) continue;
  if (!project.map || !project.floor || !Array.isArray(project.points)) continue;
  const region = project.region || null;
  const key = region ? `${project.map}:${project.floor}:${region}` : `${project.map}:${project.floor}`;
  const savedAt = Date.parse(project.savedAt || '') || fs.statSync(filePath).mtimeMs;
  candidates.push({ key, savedAt, project, file: entry.name });
}

const latest = new Map();
for (const candidate of candidates) {
  const previous = latest.get(candidate.key);
  if (!previous || candidate.savedAt > previous.savedAt || (candidate.savedAt === previous.savedAt && candidate.file > previous.file)) {
    latest.set(candidate.key, candidate);
  }
}

const projects = {};
const customRegions = {};
for (const candidate of [...latest.values()].sort((left, right) => left.key.localeCompare(right.key))) {
  projects[candidate.key] = candidate.project;
  if (candidate.project.customRegion?.id) {
    customRegions[candidate.project.map] ||= [];
    const list = customRegions[candidate.project.map];
    const index = list.findIndex(item => item.id === candidate.project.customRegion.id);
    if (index >= 0) list[index] = candidate.project.customRegion;
    else list.push(candidate.project.customRegion);
  }
}

const payload = {
  schema: 'wtfmi-alignment-cloud-state-v1',
  savedAt: new Date().toISOString(),
  savedFrom: 'local-project-import',
  projects,
  customRegions,
  importSummary: {
    scannedProjects: candidates.length,
    selectedLatestProjects: latest.size,
    maps: [...new Set([...latest.values()].map(item => item.project.map))].sort(),
    selections: [...latest.values()].map(item => ({ key: item.key, file: item.file, savedAt: item.project.savedAt, points: item.project.points.length }))
  }
};

process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
