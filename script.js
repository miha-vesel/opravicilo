// Meta za učenke -> razred in razredničarka
const STUDENT_META = {
  "Neli Vesel": { razred: "5.c", razrednicarka: "Nina Brbot" },
  "Zarja Vesel": { razred: "2.b", razrednicarka: "Darija Peternelj" }
};

// Elements
const pIme = document.getElementById("p_ime");
const pNaslov1 = document.getElementById("p_naslov1");
const pNaslov2 = document.getElementById("p_naslov2");
const pKraj = document.getElementById("p_kraj");
const pDatum = document.getElementById("p_datum");

const rIme = document.getElementById("r_ime");
const rSola = document.getElementById("r_sola");
const rNaslov = document.getElementById("r_naslov");

const studentEl = document.getElementById("student");
const razredEl = document.getElementById("razred");
const razrednicarkaEl = document.getElementById("razrednicarka");

const datumOdEl = document.getElementById("datum_od");
const datumDoEl = document.getElementById("datum_do");
const vzrokEl = document.getElementById("vzrok");

const genBtn = document.getElementById("genBtn");
const copyBtn = document.getElementById("copyBtn");
const pdfBtn = document.getElementById("pdfBtn");
const msgEl = document.getElementById("msg");
const preview = document.getElementById("preview");

// Helpers
function todayStr() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}. ${mm}. ${yyyy}`;
}
function isEmpty(v){ return !v || !String(v).trim(); }

function updateStudentMeta() {
  const s = studentEl.value;
  const meta = STUDENT_META[s] || { razred: "", razrednicarka: "" };
  razredEl.value = meta.razred || "";
  razrednicarkaEl.value = meta.razrednicarka || "";
  // Če je razredničarka prazna, ne prepisujemo polja prejemnika
  if (!isEmpty(meta.razrednicarka)) {
    rIme.value = `ga. ${meta.razrednicarka}`;
  }
}
studentEl.addEventListener("change", updateStudentMeta);
updateStudentMeta();

function buildLetterText() {
  const parentName = pIme.value.trim();
  const parentAddr1 = pNaslov1.value.trim();
  const parentAddr2 = pNaslov2.value.trim();
  const kraj = pKraj.value.trim() || "Ljubljana";
  const datumInline = isEmpty(pDatum.value) ? todayStr() : pDatum.value.trim();

  const recipName = rIme.value.trim();
  const recipSchool = rSola.value.trim();
  const recipAddr = rNaslov.value.trim();

  const student = studentEl.value;
  const razred = razredEl.value.trim();
  const od = datumOdEl.value.trim();
  const doo = datumDoEl.value.trim();
  const vzrok = vzrokEl.value.trim();

  if (isEmpty(student) || isEmpty(razred) || isEmpty(od) || isEmpty(vzrok)) {
    return null;
  }

  let odsotnost;
  if (isEmpty(doo)) {
    odsotnost = `je bila odsotna od pouka ${od} zaradi ${vzrok}.`;
  } else {
    odsotnost = `je bila odsotna od pouka od ${od} do ${doo} zaradi ${vzrok}.`;
  }

  const lines = [
    `${parentName}`,
    `${parentAddr1}`,
    `${parentAddr2}`,
    ``,
    `${kraj}, ${datumInline}`,
    ``,
    `---`,
    `${recipName}`,
    `${recipSchool}`,
    `${recipAddr}`,
    ``,
    `Spoštovani!`,
    ``,
    `Hčerka ${student}, učenka ${razred}, ${odsotnost}`,
    `Prosim, če izostanek opravičite.`,
    ``,
    `S spoštovanjem!`,
    ``,
    `${parentName}`
  ];
  return lines.join("\n");
}

function renderPreview() {
  const txt = buildLetterText();
  if (txt === null) {
    preview.textContent = "Izpolnite obvezna polja (učenka, razred, datum od, razlog).";
  } else {
    preview.textContent = txt;
  }
}

function feedback(msg, isError=false) {
  msgEl.textContent = msg;
  msgEl.style.color = isError ? "#c62828" : "#2f6fed";
  setTimeout(() => (msgEl.textContent = ""), 2500);
}

function generiraj() {
  const txt = buildLetterText();
  if (txt === null) return feedback("Manjkajo obvezni podatki.", true);
  renderPreview();
  feedback("Pismo generirano.");
}

async function kopiraj() {
  const txt = buildLetterText();
  if (txt === null) return feedback("Najprej izpolnite obvezna polja.", true);
  try {
    await navigator.clipboard.writeText(txt);
    feedback("Kopirano!");
  } catch (e) {
    // Fallback
    const ta = document.createElement("textarea");
    ta.value = txt;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    feedback("Kopirano!");
  }
}

function saveAsPDF() {
  const txt = buildLetterText();
  if (txt === null) return feedback("Najprej izpolnite obvezna polja.", true);

  const parentName = pIme.value.trim();
  const kraj = (pKraj.value.trim() || "Ljubljana");
  const datumInline = isEmpty(pDatum.value) ? todayStr() : pDatum.value.trim();
  const recipName = rIme.value.trim();
  const recipSchool = rSola.value.trim();
  const recipAddr = rNaslov.value.trim();

  const safe = (s)=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

  const win = window.open("", "_blank", "width=800,height=900");
  const html = `<!DOCTYPE html>
<html lang="sl">
<head>
  <meta charset="utf-8" />
  <title>Opravičilo – ${safe(parentName)}</title>
  <style>
    @page { size: A4; margin: 2cm; }
    body { font-family: Arial, sans-serif; margin: 2cm; line-height: 1.5; }
    .sender { white-space: pre-wrap; }
    .date { margin-top: 10px; }
    .divider { margin: 14px 0; height: 1px; background: #aaa; }
    .recipient { margin-top: 8px; white-space: pre-wrap; }
    .content { margin-top: 18px; white-space: pre-wrap; }
  </style>
</head>
<body>
  <div class="sender">${safe(pIme.value)}\n${safe(pNaslov1.value)}\n${safe(pNaslov2.value)}</div>
  <div class="date">${safe(kraj)}, ${safe(datumInline)}</div>
  <div class="divider"></div>
  <div class="recipient">${safe(recipName)}\n${safe(recipSchool)}\n${safe(recipAddr)}</div>
  <div class="content">${safe(txt.split('---').pop().trim())}</div>
  <script>setTimeout(()=>window.print(), 250);</script>
</body>
</html>`;
  win.document.open();
  win.document.write(html);
  win.document.close();
}

// Bindings
genBtn.addEventListener("click", generiraj);
copyBtn.addEventListener("click", kopiraj);
pdfBtn.addEventListener("click", saveAsPDF);

// Live preview updates
document.querySelectorAll("input, select").forEach(el => {
  el.addEventListener("input", renderPreview);
  el.addEventListener("change", renderPreview);
});
renderPreview();
