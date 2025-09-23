// --- Helpers ---------------------------------------------------------------

function formatDateSl(d) {
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  return `${day}. ${month}. ${year}`;
}

function normalizeDateInput(str) {
  if (!str) return '';
  const m = str.match(/\s*(\d{1,2})\s*\.\s*(\d{1,2})\s*\.\s*(\d{4})\s*$/);
  if (!m) return str.trim();
  const d = Number(m[1]);
  const mo = Number(m[2]);
  const y = Number(m[3]);
  return `${d}. ${mo}. ${y}`;
}

// --- Elements --------------------------------------------------------------

const $ = (id) => document.getElementById(id);

const p_ime       = $('p_ime');
const p_naslov1   = $('p_naslov1');
const p_naslov2   = $('p_naslov2');
const p_kraj      = $('p_kraj');
const p_datum     = $('p_datum');

const r_ime       = $('r_ime');
const r_sola      = $('r_sola');
const r_naslov    = $('r_naslov');
const r_posta = $('r_posta');

const studentSel  = $('student');
const razred      = $('razred');
const razrednicarka = $('razrednicarka');

const datum_od    = $('datum_od');
const datum_do    = $('datum_do');
const vzrok       = $('vzrok');

const genBtn      = $('genBtn');
const copyBtn     = $('copyBtn');
const pdfBtn      = $('pdfBtn');
const preview     = $('preview');
const msg         = $('msg');

// --- Student → defaults mapping -------------------------------------------
// Add/adjust values here as needed.
const teacherByStudent = {
  'Neli Vesel': { razred: '5.c', razrednicarka: 'ga. Nina Jančič' },
  'Zarja Vesel': { razred: '2.b', razrednicarka: 'ga. Darija Peternelj' },
};

function applyStudentDefaults() {
  const m = teacherByStudent[studentSel.value];
  if (m) {
    if (m.razred) razred.value = m.razred;
    if (m.razrednicarka) {
      razrednicarka.value = m.razrednicarka; // read-only field
      r_ime.value = m.razrednicarka;         // set recipient to match teacher
    }
  }
}

// Keep auto field in sync when user edits the recipient (if they change it manually)
r_ime.addEventListener('input', () => {
  razrednicarka.value = r_ime.value || '';
});

// --- Defaults & init -------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  if (!p_datum.value.trim()) {
    p_datum.value = formatDateSl(new Date());
  }
  applyStudentDefaults(); // set defaults for initial selection
});

// Update defaults when switching student
studentSel.addEventListener('change', () => {
  applyStudentDefaults();
  generatePreview(); // refresh preview so header shows new recipient immediately
});

// --- Letter generation ------------------------------------------------------

function buildLetterHTML() {
  const senderBlock =
`${p_ime.value}
${p_naslov1.value}
${p_naslov2.value}`;
  const dateLine = `${p_kraj.value}, ${p_datum.value.trim() ? normalizeDateInput(p_datum.value) : formatDateSl(new Date())}`;
  const recipientBlock =
`${r_ime.value}
${r_sola.value}
${r_naslov.value}
${r_posta.value}`;

  const učenka = studentSel.value;
  const razredTxt = razred.value.trim() ? `, učenka ${razred.value.trim()} razreda,` : '';

  const od = normalizeDateInput(datum_od.value.trim());
  const doo = normalizeDateInput(datum_do.value.trim());

  let odsotnostLine = '';
  if (od && doo) {
    odsotnostLine = `je bila odsotna od pouka od ${od} do ${doo} zaradi ${vzrok.value.trim() || '____'}.`;
  } else if (od) {
    odsotnostLine = `je bila odsotna od pouka ${od} zaradi ${vzrok.value.trim() || '____'}.`;
  } else {
    odsotnostLine = `bo odsotna od pouka zaradi ${vzrok.value.trim() || '____'}.`;
  }

  const bodyPara =
`OPRAVIČILO

Spoštovani!

Hčerka ${učenka}${razredTxt} ${odsotnostLine}
Prosim, če izostanek opravičite.

Hvala in lep pozdrav,

${p_ime.value}`;

  return `
<div>${senderBlock.replace(/\n/g, '<br>')}</div>
<div>${dateLine}</div>
<div>${recipientBlock.replace(/\n/g, '<br>')}</div>

<div>${bodyPara.replace(/\n/g, '<br>')}</div>
`.trim();
}

function generatePreview() {
  if (p_datum.value.trim()) p_datum.value = normalizeDateInput(p_datum.value);
  if (datum_od.value.trim()) datum_od.value = normalizeDateInput(datum_od.value);
  if (datum_do.value.trim()) datum_do.value = normalizeDateInput(datum_do.value);

  preview.innerHTML = buildLetterHTML();
  msg.textContent = 'Pismo je pripravljeno.';
  setTimeout(() => (msg.textContent = ''), 2000);
}

// --- Copy & PDF ------------------------------------------------------------

function copyPreviewToClipboard() {
  const text = preview.innerText;
  if (!text.trim()) {
    msg.textContent = 'Ni vsebine za kopiranje.';
    setTimeout(() => (msg.textContent = ''), 1800);
    return;
  }
  navigator.clipboard.writeText(text).then(() => {
    msg.textContent = 'Kopirano v odložišče.';
    setTimeout(() => (msg.textContent = ''), 1800);
  }).catch(() => {
    msg.textContent = 'Kopiranje ni uspelo.';
    setTimeout(() => (msg.textContent = ''), 1800);
  });
}

function printPreviewToPDF() {
  if (!preview.innerHTML.trim()) {
    generatePreview();
  }
  const finalHtml = preview.innerHTML;

  const w = window.open('', '_blank');
  w.document.write(`<!doctype html>
<html lang="sl">
<head>
  <meta charset="utf-8">
  <title>Opravičilo</title>
  <link rel="stylesheet" href="style.css">
  <style>
    @page { margin: 18mm; }
    body { font-family: Arial, sans-serif; }
    .letter-preview { border: none; padding: 0; }
  </style>
</head>
<body>
  <div class="letter-preview">
    ${finalHtml}
  </div>
</body>
</html>`);
  w.document.close();
  w.focus();
  w.print();
  w.close();
}

// --- Events ----------------------------------------------------------------

genBtn.addEventListener('click', generatePreview);
copyBtn.addEventListener('click', copyPreviewToClipboard);
pdfBtn.addEventListener('click', printPreviewToPDF);

// Generate once so preview isn't empty
generatePreview();
