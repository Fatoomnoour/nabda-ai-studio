import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const text = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('/ renders the landing page', () => {
  assert.match(text('src/app/page.tsx'), /<LandingPage \/>/);
});
test('/app renders the original NabdaWorkspace', () => {
  assert.match(text('src/app/app/page.tsx'), /from "@\/components\/NabdaWorkspace"/);
  assert.match(text('src/app/app/page.tsx'), /<NabdaWorkspace \/>/);
});
test('/login is a demo entry with no fake authentication', () => {
  const page = text('src/app/login/page.tsx');
  assert.doesNotMatch(page, /type="password"|<input|<form/);
  assert.match(page, /href="\/app"/);
});
test('every "try Nabda" CTA leads straight to the live studio', () => {
  for (const f of ['ConversionSection', 'PulseHero', 'SiteNav', 'TeamPage'])
    assert.match(text(`src/components/landing/${f}.tsx`), /href="\/studio"/);
  assert.doesNotMatch(text('src/components/landing/PulseHero.tsx'), /href="#start"/);
});
test('future formats are labelled as vision, never as available', () => {
  const content = text('src/components/landing/content.ts');
  const block = content.slice(content.indexOf('VISION_FORMATS'), content.indexOf('NOT_OPERATIONAL'));
  assert.ok((block.match(/status: "ضمن الرؤية"|status: "قريبًا"/g) || []).length >= 5);
  for (const item of ['النشر التلقائي', 'الصوت السعودي (TTS)', 'تصدير الفيديو MP4']) assert.ok(content.includes(item));
});
test('landing uses the official logo path unchanged', () => {
  assert.match(text('src/components/landing/LandingPage.tsx'), /"\/brand\/nabda-logo.png"/);
});
