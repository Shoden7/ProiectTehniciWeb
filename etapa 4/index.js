const express = require("express");
const path = require("path");

const app = express();
const PORT = 8080;

// Setare view engine EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Servirea fișierelor statice
app.use("/resurse", express.static(path.join(__dirname, "public/resurse")));

// Afișare informații despre căi
console.log("__dirname:", __dirname);
console.log("__filename:", __filename);
console.log("process.cwd():", process.cwd());

app.get(["/", "/index", "/home"], (req, res) => {
  res.render("pagini/index", {
    titlu: "Pescaria 'la Negru"
  });
});


app.listen(PORT, () => {
  console.log(`Server pornit pe http://localhost:${PORT}`);
});
