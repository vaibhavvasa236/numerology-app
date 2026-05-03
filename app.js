import {
  pythagorean, chaldean, loShu,
  NUMBER_MEANINGS,
  CHALDEAN_PREDICTIONS,
  PYTHAGOREAN_PREDICTIONS,
  LOSHU_PLANE_PREDICTIONS,
  LOSHU_MISSING_PREDICTIONS
} from './numerology.js';

// ── Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
  });
});

// ── Form submit
document.getElementById('calc-form').addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('full-name').value.trim();
  const dob  = document.getElementById('dob').value;
  const err  = document.getElementById('form-error');

  if (!name || !/[a-zA-Z]/.test(name)) {
    err.textContent = 'Please enter a valid name containing letters.';
    err.classList.remove('hidden');
    return;
  }
  if (!dob) {
    err.textContent = 'Please select your date of birth.';
    err.classList.remove('hidden');
    return;
  }
  err.classList.add('hidden');

  renderChaldean(chaldean(name, dob));
  renderPythagorean(pythagorean(name, dob));
  renderLoShu(loShu(dob));

  document.getElementById('results').classList.remove('hidden');
  document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

function meaning(n) {
  return NUMBER_MEANINGS[n] || '';
}

function rawLabel(raw, reduced) {
  if (raw === reduced) return '';
  return `${raw} → ${reduced}`;
}

function predCard(icon, title, body) {
  return `<div class="pred-card">
    <div class="pred-icon">${icon}</div>
    <div class="pred-title">${title}</div>
    <p class="pred-body">${body}</p>
  </div>`;
}

// ── Chaldean renderer
function renderChaldean(c) {
  setText('chald-name-compound',     c.name.compound > c.name.single ? c.name.compound : '');
  setText('chald-name-single',       c.name.single);
  setText('chald-name-meaning',      meaning(c.name.single));

  setText('chald-dob-compound',      c.dob.compound > c.dob.single ? c.dob.compound : '');
  setText('chald-dob-single',        c.dob.single);
  setText('chald-dob-meaning',       meaning(c.dob.single));

  setText('chald-combined-compound', c.combined.compound > c.combined.single ? c.combined.compound : '');
  setText('chald-combined-single',   c.combined.single);
  setText('chald-combined-meaning',  meaning(c.combined.single));

  setText('chald-birthday-compound', c.birthday.compound > c.birthday.single ? c.birthday.compound : '');
  setText('chald-birthday-single',   c.birthday.single);
  setText('chald-birthday-meaning',  meaning(c.birthday.single));

  const table = document.getElementById('chald-letter-table');
  table.innerHTML = c.letterMap.map(({ letter, value }) =>
    `<div class="letter-chip">
      <span class="lc-letter">${letter}</span>
      <span class="lc-value">${value}</span>
    </div>`
  ).join('');

  // Predictions
  const namePred  = CHALDEAN_PREDICTIONS.name[c.name.single];
  const dobPred   = CHALDEAN_PREDICTIONS.dob[c.dob.single];
  const combPred  = CHALDEAN_PREDICTIONS.combined[c.combined.single];
  const bdayPred  = CHALDEAN_PREDICTIONS.birthday[c.birthday.single];

  document.getElementById('chald-predictions').innerHTML = [
    namePred  ? predCard('☽', `Name ${c.name.single} — ${namePred.title}`,           namePred.text)  : '',
    dobPred   ? predCard('☀', `Birth ${c.dob.single} — ${dobPred.title}`,            dobPred.text)   : '',
    combPred  ? predCard('✦', `Destiny ${c.combined.single} — ${combPred.title}`,    combPred.text)  : '',
    bdayPred  ? predCard('◈', `Birthday ${c.birthday.single} — ${bdayPred.title}`,   bdayPred.text)  : ''
  ].join('');
}

// ── Pythagorean renderer
function renderPythagorean(p) {
  setText('pyth-lifepath',    p.lifePath.reduced);
  setText('pyth-expression',  p.expression.reduced);
  setText('pyth-soul',        p.soulUrge.reduced);
  setText('pyth-personality', p.personality.reduced);
  setText('pyth-birthday',    p.birthday.reduced);

  setText('pyth-lifepath-raw',    rawLabel(p.lifePath.raw, p.lifePath.reduced));
  setText('pyth-expression-raw',  rawLabel(p.expression.raw, p.expression.reduced));
  setText('pyth-soul-raw',        rawLabel(p.soulUrge.raw, p.soulUrge.reduced));
  setText('pyth-personality-raw', rawLabel(p.personality.raw, p.personality.reduced));
  setText('pyth-birthday-raw',    rawLabel(p.birthday.raw, p.birthday.reduced));

  setText('pyth-lifepath-meaning',    meaning(p.lifePath.reduced));
  setText('pyth-expression-meaning',  meaning(p.expression.reduced));
  setText('pyth-soul-meaning',        meaning(p.soulUrge.reduced));
  setText('pyth-personality-meaning', meaning(p.personality.reduced));
  setText('pyth-birthday-meaning',    meaning(p.birthday.reduced));

  const table = document.getElementById('pyth-letter-table');
  table.innerHTML = p.letterMap.map(({ letter, value, isVowel }) =>
    `<div class="letter-chip ${isVowel ? 'vowel' : ''}">
      <span class="lc-letter">${letter}</span>
      <span class="lc-value">${value}</span>
    </div>`
  ).join('');

  // Predictions
  const lp  = PYTHAGOREAN_PREDICTIONS.lifePath[p.lifePath.reduced];
  const exp = PYTHAGOREAN_PREDICTIONS.expression[p.expression.reduced];
  const su  = PYTHAGOREAN_PREDICTIONS.soulUrge[p.soulUrge.reduced];
  const per = PYTHAGOREAN_PREDICTIONS.personality[p.personality.reduced];
  const bday = PYTHAGOREAN_PREDICTIONS.birthday[p.birthday.reduced];

  document.getElementById('pyth-predictions').innerHTML = [
    lp   ? predCard('☀', `Life Path ${p.lifePath.reduced} — ${lp.title}`,           lp.text)    : '',
    exp  ? predCard('★', `Expression ${p.expression.reduced} — ${exp.title}`,       exp.text)   : '',
    bday ? predCard('✦', `Birthday ${p.birthday.reduced} — ${bday.title}`,          bday.text)  : '',
    su   ? predCard('♡', `Soul Urge ${p.soulUrge.reduced}`,                         su)         : '',
    per  ? predCard('◈', `Personality ${p.personality.reduced}`,                    per)        : ''
  ].join('');
}

// ── Lo Shu renderer
function renderLoShu({ layout, counts, present, missing, meanings }) {
  const grid = document.getElementById('loshu-grid');
  grid.innerHTML = layout.flat().map(num => {
    const count = counts[num];
    const isPresent = count > 0;
    const dots = Array(Math.min(count, 5)).fill('<span class="cell-dot"></span>').join('');
    return `
      <div class="loshu-cell ${isPresent ? 'present' : 'missing'}" title="${meanings[num].trait}">
        <span class="cell-num">${num}</span>
        <div class="cell-dots">${dots}</div>
        ${isPresent ? `<span class="cell-count">${count}×</span>` : ''}
      </div>`;
  }).join('');

  // Present numbers analysis
  const analysisEl = document.getElementById('loshu-analysis');
  analysisEl.innerHTML = present.sort((a,b) => a-b).map(n => `
    <div class="analysis-card">
      <div class="ac-num">${n}</div>
      <div class="ac-planet">${meanings[n].planet}</div>
      <div class="ac-trait">${meanings[n].trait}</div>
      <div class="ac-count">Appears ${counts[n]} time${counts[n] > 1 ? 's' : ''}</div>
    </div>`
  ).join('');

  // Missing numbers
  const missingSection = document.getElementById('loshu-missing-section');
  const missingList = document.getElementById('loshu-missing-list');
  if (missing.length === 0) {
    missingSection.innerHTML = '<h3>Missing Numbers</h3><p style="color:var(--text-muted);font-size:.9rem">No missing numbers — a rare and balanced birth date!</p>';
  } else {
    missingList.innerHTML = missing.map(n => `
      <div class="missing-card">
        <div class="mc-num">${n}</div>
        <div class="mc-label">${meanings[n].planet} — Needs Development</div>
        <div class="mc-trait">${meanings[n].trait}</div>
      </div>`
    ).join('');
    missingSection.classList.remove('hidden');
  }

  // Lo Shu Predictions — evaluate planes
  const mentalNums    = [4, 9, 2];
  const emotionalNums = [3, 5, 7];
  const practicalNums = [8, 1, 6];

  function planeStrength(nums) {
    const filled = nums.filter(n => counts[n] > 0).length;
    if (filled === 3) return 'full';
    if (filled >= 1) return 'strong';
    return 'weak';
  }

  const mp = LOSHU_PLANE_PREDICTIONS.mental[planeStrength(mentalNums)];
  const ep = LOSHU_PLANE_PREDICTIONS.emotional[planeStrength(emotionalNums)];
  const pp = LOSHU_PLANE_PREDICTIONS.practical[planeStrength(practicalNums)];

  // Top missing number predictions (max 2 most significant)
  const missingPreds = missing.slice(0, 2).map(n => {
    const mp = LOSHU_MISSING_PREDICTIONS[n];
    return mp ? predCard('△', mp.title, mp.text) : '';
  }).join('');

  document.getElementById('loshu-predictions').innerHTML = [
    predCard('◈', mp.title, mp.text),
    predCard('♡', ep.title, ep.text),
    predCard('★', pp.title, pp.text),
    missingPreds
  ].join('');
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val ?? '';
}
