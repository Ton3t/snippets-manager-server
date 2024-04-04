const router = require("express").Router();
const Snippet = require("../models/snippetModel");
const auth = require("../middleware/auth");

// recibir todos los datos de la base datos

router.get("/", auth, async (req, res) => {
  try {
    console.log(req.user);
    // ahora le decimos q solo muester los snippets de cada usuario
    // borrando el objeto user mostramos todos los snippets de todos los usuaios
    const snippets = await Snippet.find({ user: req.user });
    res.json(snippets);
  } catch (err) {
    res.status(500).send();
  }
});

// mandar datos a la api o crear un nuevo snippet

router.post("/", auth, async (req, res) => {
  try {
    // parametros que recibimos de la web
    const { title, description, code } = req.body;

    // validar datos

    if (!description && !code) {
      return res.status(400).json({
        errorMessage: "Debe introducir al menos una descripción o un código.",
      });
    }

    // construimos el nuevo snippet pasando los datos

    const newSnippet = new Snippet({
      title,
      description,
      code,
      user: req.user,
    });

    // pasamos los datos y enviamos una respuesta del objeto creado

    const savedSnippet = await newSnippet.save();
    res.json(savedSnippet);
  } catch (err) {
    res.status(500).send();
  }
});

// Modificar datos según el id

router.put("/:id", auth, async (req, res) => {
  try {
    // recogemos los datos que vienen de la web
    const { title, description, code } = req.body;
    const snippetId = req.params.id;

    // validar datos

    if (!description && !code) {
      return res.status(400).json({
        errorMessage: "Debe introducir al menos una descripción o un código.",
      });
    }

    // verificamos que vienen datos
    if (!snippetId) {
      return res.status(400).json({
        errorMessage:
          "No se identifica el ID del fragmento. Porfavor contacte con un programador.",
      });
    }

    // si vienen comparamos los datos con la base datos, si no coinciden les mandamos un error
    const originalSnippet = await Snippet.findById(snippetId);
    if (!originalSnippet) {
      return res.status(400).json({
        errorMessage:
          "No se ha encontrado ningún fragmento con este ID. Porfavor contacte con un programador.",
      });
    }

    if(originalSnippet.user.toString() !== req.user) {
      return res.status(401).json({ errorMessage: "No estas autorizado."});
    }

    // si coninciden empezamos el proceso de actualizar los datos
    originalSnippet.title = title;
    originalSnippet.description = description;
    originalSnippet.code = code;

    const savedSnippet = await originalSnippet.save();
    res.json(savedSnippet);
  } catch (err) {
    res.status(500).send();
  }
});

// Borrar datos según el id pasado

router.delete("/:id", auth, async (req, res) => {
  try {
    // recogemos los datos que vienen de la web
    const snippetId = req.params.id;

    // verificamos que vienen datos
    if (!snippetId) {
      return res.status(400).json({
        errorMessage:
          "No se identifica el ID del fragmento. Porfavor contacte con un programador.",
      });
    }

    // si vienen comparamos los datos con la base datos, si no coinciden les mandamos un error
    const existingSnippet = await Snippet.findById(snippetId);
    if (!existingSnippet) {
      return res.status(400).json({
        errorMessage:
          "No se ha encontrado ningún fragmento con este ID. Porfavor contacte con un programador.",
      });
    }

    if(existingSnippet.user.toString() !== req.user) {
      return res.status(401).json({ errorMessage: "No estas autorizado."});
    }

    // si coninciden empezamos el proceso de borrar los datos
    await existingSnippet.deleteOne();
    res.json(existingSnippet);
  } catch (err) {
    res.status(500).send();
  }
});

module.exports = router;
