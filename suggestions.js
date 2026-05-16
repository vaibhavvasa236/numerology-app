const CHALDEAN = {
  A:1,B:2,C:3,D:4,E:5,F:8,G:3,H:5,I:1,
  J:1,K:2,L:3,M:4,N:5,O:7,P:8,Q:1,R:2,
  S:3,T:4,U:6,V:6,W:6,X:5,Y:1,Z:7
};

const GROUP1_DATES  = new Set([1,2,4,7,10,11,13,16,19,20,22,25,28,29,31]);
const UNLUCKY_FIRST = new Set([4,8,13,17,22,26,31]);
// Group 2 now includes master number 33
const LUCKY         = { 1:[19,37,46], 2:[24,33,42,55] };
const VOWELS        = new Set('AEIOU');
// Appending changes pronunciation — we rely only on in-place doublings

function cVal(l)        { return CHALDEAN[l.toUpperCase()] || 0; }
function cSum(s)        { return s.toUpperCase().replace(/[^A-Z]/g,'').split('').reduce((t,c)=>t+cVal(c),0); }
function grp(n)         { return GROUP1_DATES.has(n) ? 1 : 2; }
function isUnlucky1(n)  { return UNLUCKY_FIRST.has(n); }
function isVow(l)       { return VOWELS.has(l.toUpperCase()); }

// Reduce a number to a single digit (preserving master numbers 11, 22, 33)
function reduceNum(n) {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split('').reduce((s, d) => s + Number(d), 0);
  }
  return n;
}

// Life path: sum all digits of DOB then reduce
function lifePathNum(dob) {
  const digits = dob.replace(/[^0-9]/g, '').split('').map(Number);
  return reduceNum(digits.reduce((a, b) => a + b, 0));
}

// No 4+ consecutive consonants and length ≥ 2
function isNatural(name) {
  if (name.length < 2) return false;
  let run = 0;
  for (const c of name.toUpperCase().replace(/[^A-Z]/g,'')) {
    run = isVow(c) ? 0 : run + 1;
    if (run >= 4) return false;
  }
  return true;
}

// Single-step variants: double any letter in-place.
// Appending and removal are excluded — both change pronunciation.
// Variants that would create 3+ consecutive identical letters are skipped (e.g. AAA).
function safeVariants(name) {
  const up  = name.toUpperCase().replace(/[^A-Z]/g,'');
  const res = new Map();

  for (let i = 0; i < up.length; i++) {
    const v = up.slice(0, i+1) + up[i] + up.slice(i+1);
    if (/(.)\1\1/.test(v)) continue; // skip: would create 3 consecutive same letters
    if (!res.has(v)) res.set(v, `Double '${up[i]}' (pos ${i+1})`);
  }

  return res;
}

// Two-step variants (apply safeVariants twice)
function safeVariants2(name) {
  const res = new Map();
  for (const [v1, d1] of safeVariants(name)) {
    for (const [v2, d2] of safeVariants(v1)) {
      if (v2 !== name.toUpperCase() && !res.has(v2)) {
        res.set(v2, `${d1} → ${d2}`);
      }
    }
  }
  return res;
}

// Score a change — step-1 beats step-2; within each step, vowel doublings
// rank higher than consonant doublings (more pronunciation-preserving).
function varScore(desc) {
  if (desc === '(unchanged)') return 20;
  if (!desc.includes('→')) {
    // Step-1: base 10, +2 if the doubled letter is a vowel
    return 10 + (isVow(desc[8]) ? 2 : 0);
  }
  // Step-2: score by how many of the two doubled letters are vowels (0–4)
  const [d1, d2] = desc.split(' → ');
  return (isVow((d1 || '')[8]) ? 2 : 0) + (isVow((d2 || '')[8]) ? 2 : 0);
}

// Core combinator: iterate fnEntries × lnEntries, filter by lucky targets
function collect(fnEntries, lnEntries, middle, targets) {
  const results = [];
  const seen    = new Set();

  for (const [newFn, fnDesc] of fnEntries) {
    for (const [newLn, lnDesc] of lnEntries) {
      if (!isNatural(newFn) || !isNatural(newLn)) continue;
      const newFnSum = cSum(newFn);
      if (isUnlucky1(newFnSum)) continue;
      const display  = [newFn, middle, newLn].filter(Boolean).join(' ');
      if (seen.has(display)) continue;
      const fullSum  = cSum(display);
      if (!targets.includes(fullSum)) continue;
      seen.add(display);
      const score = varScore(fnDesc) + varScore(lnDesc);
      results.push({
        display, firstName: newFn, lastName: newLn, middle,
        firstNameSum: newFnSum, fullNameSum: fullSum,
        fnChange: fnDesc === '(unchanged)' ? null : fnDesc,
        lnChange: lnDesc === '(unchanged)' ? null : lnDesc,
        score
      });
    }
  }
  return results.sort((a, b) => b.score - a.score);
}

// Within one config (same fn/ln source, same middle), collect step-1 results
// then supplement with step-2 results to fill up to MAX.
// Step-1 always scores higher than step-2 via varScore, so ranking is natural.
function collectConfig(fn1, fn2, ln1, ln2, middle, targets, MAX) {
  const step1   = collect(fn1, ln1, middle, targets);
  if (step1.length >= MAX) return step1.slice(0, MAX);

  // Supplement with step-2 (double-doubling) to fill remaining slots
  const seen    = new Set(step1.map(s => s.display));
  const step2   = collect(fn2 ?? fn1, ln2 ?? ln1, middle, targets)
                    .filter(s => !seen.has(s.display));
  return [...step1, ...step2].slice(0, MAX);
}

// Try all priority configs for a given targets array.
// Within each config, step-1 doublings are supplemented by step-2 if < MAX results.
// Configs are tried in order; the first that yields any result wins.
function tryAllLevels(firstName, lastName, fatherName, targets) {
  const FN0   = firstName.toUpperCase().replace(/[^A-Z]/g,'');
  const LN0   = lastName.toUpperCase().replace(/[^A-Z]/g,'');
  const MID   = fatherName && fatherName.trim()
    ? fatherName.trim().toUpperCase().replace(/[^A-Z]/g, '')
    : null;
  const MAX   = 3;

  const fn1V    = [...safeVariants(firstName)];
  const fn2V    = [...safeVariants2(firstName)].filter(([v]) => !safeVariants(firstName).has(v));
  const ln1V    = [...safeVariants(lastName)];
  const ln2V    = [...safeVariants2(lastName)].filter(([v]) => !safeVariants(lastName).has(v));
  const fnFixed = [[FN0, '(unchanged)']];
  const lnFixed = [[LN0, '(unchanged)']];

  const midLabel = MID ? MID.charAt(0) + MID.slice(1).toLowerCase() : '';

  // Config: { fn1, fn2, ln1, ln2, mid, desc }
  // fn2/ln2 are step-2 variants used to supplement if step-1 gives < MAX
  const configs = [
    { fn1: fn1V,    fn2: fn2V,  ln1: lnFixed, ln2: null,  mid: null, needsFather: false, desc: 'First name adjustment' },
    { fn1: fnFixed, fn2: null,  ln1: lnFixed, ln2: null,  mid: MID,  needsFather: true,  desc: MID ? `Adding father name "${midLabel}"` : '' },
    { fn1: fn1V,    fn2: fn2V,  ln1: lnFixed, ln2: null,  mid: MID,  needsFather: true,  desc: MID ? `First name adjustment + father name "${midLabel}"` : '' },
    { fn1: fnFixed, fn2: null,  ln1: ln1V,    ln2: ln2V,  mid: null, needsFather: false, desc: 'Last name adjustment' },
    { fn1: fnFixed, fn2: null,  ln1: ln1V,    ln2: ln2V,  mid: MID,  needsFather: true,  desc: MID ? `Last name adjustment + father name "${midLabel}"` : '' },
  ];

  for (const { fn1, fn2, ln1, ln2, mid, needsFather, desc } of configs) {
    if (needsFather && !MID) continue; // skip father-initial configs when no father name given
    const hits = collectConfig(fn1, fn2, ln1, ln2, mid, targets, MAX);
    if (hits.length > 0) return { suggestions: hits, levelDesc: desc };
  }

  return { suggestions: [], levelDesc: '' };
}

// ── Public API ──────────────────────────────────────────────────────────────

export function analyzeCurrentName(firstName, lastName, officialName, dob) {
  const day     = parseInt(dob.split('-')[2], 10);
  const lp      = lifePathNum(dob);
  const birthGrp = grp(day);
  const lpGrp    = grp(lp);
  const targets  = LUCKY[birthGrp];

  const usedName = officialName && officialName.trim()
    ? officialName.trim()
    : [firstName, lastName].filter(Boolean).join(' ');

  const usedParts  = usedName.trim().split(/\s+/);
  const usedFirst  = usedParts[0];
  const fSum       = cSum(usedFirst);
  const fullSum    = cSum(usedName);
  const fullNameOk = targets.includes(fullSum);

  return {
    usedName, usedFirst,
    firstNameSum : fSum,
    fullNameSum  : fullSum,
    targets,
    dateGroup    : birthGrp,
    lifePathNum  : lp,
    lifePathGroup: lpGrp,
    firstNameOk  : !isUnlucky1(fSum),
    fullNameOk,
    fullyLucky   : !isUnlucky1(fSum) && fullNameOk
  };
}

export function generateSuggestions(firstName, lastName, fatherName, dob) {
  if (!firstName || !lastName) return { suggestions: [], levelDesc: '', usingFallback: false };

  const day      = parseInt(dob.split('-')[2], 10);
  const lp       = lifePathNum(dob);
  const birthGrp = grp(day);
  const lpGrp    = grp(lp);

  const primaryTargets  = LUCKY[birthGrp];
  const fallbackTargets = lpGrp !== birthGrp ? LUCKY[lpGrp] : null;

  // Try primary group first
  const primary = tryAllLevels(firstName, lastName, fatherName, primaryTargets);
  if (primary.suggestions.length > 0) {
    return { ...primary, usingFallback: false, fallbackReason: null };
  }

  // Fall back to life path group if different
  if (fallbackTargets) {
    const fallback = tryAllLevels(firstName, lastName, fatherName, fallbackTargets);
    if (fallback.suggestions.length > 0) {
      return {
        ...fallback,
        usingFallback  : true,
        fallbackReason : `Life path ${lp} → Group ${lpGrp} targets (${fallbackTargets.join(', ')})`
      };
    }
  }

  return { suggestions: [], levelDesc: '', usingFallback: false, fallbackReason: null };
}
