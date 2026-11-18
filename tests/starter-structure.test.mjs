import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url));
const text = path => read(path).toString('utf8');

const files = [
  'src/app/page.tsx', 'src/app/layout.tsx', 'src/app/globals.css',
  'src/components/NabdaWorkspace.tsx', 'src/features/content/ContentInput.tsx',
  'src/features/script/ScriptStudio.tsx', 'src/features/video/VideoStudio.tsx',
  'src/features/review/FinalReview.tsx', 'src/lib/api/service.ts',
  'src/lib/contracts/domain.ts', 'docs/API_CONTRACT.md', 'docs/AG_FIRST_PROMPT.md',
  'docs/ARCHITECTURE.md', 'docs/PROJECT_HANDOFF.md', 'docs/references/leader-prototype.html',
  'public/brand/nabda-logo.png',
];

test('required application and handoff files exist', () => {
  for (const f of files) assert.ok(existsSync(new URL(`../${f}`, import.meta.url)), `missing ${f}`);
});
test('leader HTML reference is byte-for-byte original', () => {
  assert.equal(createHash('sha256').update(read('docs/references/leader-prototype.html')).digest('hex'),
    '66b864091cbac93599a14ec727316570b5212ba9886c02ee7beba39fd504c32f');
});
test('all provided frontend business API routes are explicitly draft', () => {
  const doc = text('docs/API_CONTRACT.md');
  assert.match(doc, /ALL ROUTES DRAFT/);
  assert.match(text('src/lib/api/service.ts'), /class IntegrationNotConfiguredError/);
  assert.match(text('src/lib/api/service.ts'), /LocalDevelopmentService/);
});
test('source facts are matched from exact source quotes', () => {
  const fixture = text('src/lib/fixtures/aptitude.ts');
  assert.match(fixture, /source\.indexOf\(quote\)/);
  assert.match(text('src/features/script/ScriptStudio.tsx'), /text\.slice\(f\.start, f\.end\) === f\.quote/);
});
test('video export is visibly unavailable without real approved media', () => {
  assert.match(text('src/features/video/VideoStudio.tsx'), /ليست فيديو أو صوتًا مُنتجًا/);
  assert.match(text('src/features/review/FinalReview.tsx'), /disabled=\{!videoApproved \|\| !asset\}/);
});
test('official logo is a real PNG', () => {
  assert.deepEqual([...read('public/brand/nabda-logo.png').subarray(0,8)], [137,80,78,71,13,10,26,10]);
});
