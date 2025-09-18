function danes() {
  const d = new Date();
  return d.toLocaleDateString("sl-SI");
}

// ob izbiri otroka nastavi razred in razredničarko
document.getElementById("student").addEventListener("change", function() {
  if (this.value === "Neli Vesel") {
    document.getElementById("razred").value = "5.c";
    document.getElementById("razrednicarka").value = "ga. Nina Brbot";
  } else {
    document.getElementById("razred").value = "2.b";
    document.getElementById("razrednicarka").value = "ga. Darija Peternelj";
  }
});
// sprožimo inicializacijo ob nalaganju strani
document.getElementById("student").dispatchEvent(new Event("change"));

function generiraj() {
  const student = document.getElementById("student").value;
  const razred = document.getElementById("razred").value;
  const razrednicarka = document.getElementById("razrednicarka").value;
  const datum_od = document.getElementById("datum_od").value;
  const datum_do = document.getElementById("datum_do").value;
  const vzrok = document.getElementById("vzrok").value;

  let datum_text = "";
  if (datum_od && datum_do) {
    datum_text = `od ${datum_od} do ${datum_do}`;
  } else if (datum_od) {
    datum_text = `${datum_od}`;
  }

  const text = `Miha Vesel
Ulica bratov Učakar 46
1000 Ljubljana

Ljubljana, ${danes()}

---
${razrednicarka}
OŠ Koseze
Ledarska 23

Spoštovani!

Hčerka ${student}, učenka ${razred} razreda, je bila odsotna od pouka ${datum_text ? "" + datum_text : ""} zaradi ${vzrok}.
Prosim, če izostanek opravičite.

S spoštovanjem!

Miha Vesel`;

  document.getElementById("rezultat").value = text;
}
