// Checks that the JSON files the API is served from match docs/openapi.yaml.
// Run:  npm install --prefix tools --no-save ajv@8.17.1 ajv-formats@3.0.1 js-yaml@4.1.0
//       node tools/contract-test.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import * as yaml from 'js-yaml';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const spec = yaml.load(fs.readFileSync(path.join(root, 'docs/openapi.yaml'), 'utf8'));
const dataDir = path.join(root, 'public');

// Point every $ref at the components of the spec.
const fix = (node) => {
  if (Array.isArray(node)) return node.map(fix);
  if (node && typeof node === 'object') {
    return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, k === '$ref' ? 'oas' + v : fix(v)]));
  }
  return node;
};
const ajv = new Ajv({ strict: false, allErrors: true });
addFormats(ajv);
ajv.addSchema({ $id: 'oas', components: fix(spec.components) });

let failures = 0;
const check = (label, ok, detail = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? '  ' + detail : ''}`);
};

const documented = new Set();
for (const [route, item] of Object.entries(spec.paths)) {
  const media = item.get.responses['200'].content['application/json'];
  const validate = ajv.compile(fix(media.schema));
  const file = path.join(dataDir, route);
  documented.add(path.resolve(file));

  check(`${route}: file exists`, fs.existsSync(file));
  if (fs.existsSync(file)) {
    const ok = validate(JSON.parse(fs.readFileSync(file, 'utf8')));
    check(`${route}: data matches schema`, ok, ok ? '' : ajv.errorsText(validate.errors));
  }
  const exampleOk = validate(media.example);
  check(`${route}: example matches schema`, exampleOk, exampleOk ? '' : ajv.errorsText(validate.errors));
}

// Every JSON file in public/api must be documented.
const apiDir = path.join(dataDir, 'api');
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
for (const f of walk(apiDir)) {
  check(`${path.relative(dataDir, f)}: documented in the spec`, documented.has(path.resolve(f)));
}

console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed');
process.exit(failures ? 1 : 0);
