const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use("/resurse", express.static(path.join(__dirname, "public", "resurse")));

// 🔁 Variabilă globală
global.obGlobal = {
  obErori: null
};

// 🔁 Inițializare erori din JSON
function initErori() {
  const caleJson = path.join(__dirname, "erori.json");
  fs.readFile(caleJson, "utf-8", (err, data) => {
    if (err) {
      console.error("Eroare la citirea erori.json:", err);
      return;
    }
    try {
      obGlobal.obErori = JSON.parse(data);

      const caleAbs = path.join(__dirname, "public", obGlobal.obErori.cale_baza);
      // Setăm calea absolută pentru fiecare imagine de eroare
      obGlobal.obErori.info_erori.forEach(eroare => {
        eroare.imagine = path.join(obGlobal.obErori.cale_baza, eroare.imagine);
      });

      obGlobal.obErori.eroare_default.imagine = path.join(
        obGlobal.obErori.cale_baza,
        obGlobal.obErori.eroare_default.imagine
      );

      console.log("Erorile au fost încărcate în obGlobal.");
    } catch (e) {
      console.error("Eroare la parsarea erori.json:", e);
    }
  });
}

// 🔁 Funcție afișare erori
function afisareEroare(res, identificator, titlu, text, imagine) {
  let eroare;

  if (obGlobal.obErori) {
    eroare = obGlobal.obErori.info_erori.find(e => e.identificator === identificator);
  }

  if (!eroare) {
    eroare = obGlobal.obErori?.eroare_default || {
      titlu: "Eroare necunoscută",
      text: "A apărut o problemă neprevăzută.",
      imagine: "/resurse/imagini/erori/default.png"
    };
  }

  res.status(eroare.status ? identificator : 200).render("eroare", {
    titlu: titlu || eroare.titlu,
    text: text || eroare.text,
    imagine: imagine || eroare.imagine
  });
}

// 🔁 Ruta standard principală
app.get(["/", "/index", "/home"], (req, res) => {
  res.render("pagini/index", { titlu: "Pescaria 'la Negru" });
});

// 🔁 Ruta generală cu callback
app.get("/*", (req, res) => {
  const numePagina = req.path.slice(1);

  res.render(`pagini/${numePagina}`, {}, function (err, rezultatRandare) {
    if (err) {
      if (!obGlobal.obErori) {
        return res.status(500).send("Erorile nu au fost încărcate.");
      }

      if (err.message.startsWith("Failed to lookup view")) {
        afisareEroare(res, 404);
      } else {
        afisareEroare(res, 500);
      }
    } else {
      res.send(rezultatRandare);
    }
  });
});

// 🔁 Pornire server
app.listen(PORT, () => {
  console.log(`Serverul rulează pe http://localhost:${PORT}`);
  initErori(); // Inițializăm erorile o singură dată
});
