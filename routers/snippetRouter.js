const router = require("express").Router();
const Snippet = require("../models/snippetModel");

// recibir todos los datos de la base datos

router.get("/", async (req, res) => {
  try {
    const snippets = await Snippet.find();
    res.json(snippets);
  } catch (err) {
    res.status(500).send();
  }
});

// mandar datos a la api o crear un nuevo snippet

router.post("/", async (req, res) => {
  try {
    // recibimos la cantidad de snippets que tenemos en la base de datos

    const snippetsLength = (await Snippet.find()).length;

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
      snippetId: snippetsLength,
      title,
      description,
      code,
    });

    // pasamos los datos y enviamos una respuesta del objeto creado

    const savedSnippet = await newSnippet.save();
    res.json(savedSnippet);
  } catch (err) {
    res.status(500).send();
  }
});

// Modificar datos según el id

router.put("/:id", async (req, res) => {
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
      return res
        .status(400)
        .json({
          errorMessage:
            "No se identifica el ID del fragmento. Porfavor contacte con un programador.",
        });
    }

    // si vienen comparamos los datos con la base datos, si no coinciden les mandamos un error
    const originalSnippet = await Snippet.findById(snippetId);
    if (!originalSnippet) {
      return res
        .status(400)
        .json({
          errorMessage:
            "No se ha encontrado ningún fragmento con este ID. Porfavor contacte con un programador.",
        });
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

router.delete("/:id", async (req, res) => {
  try {
    // recogemos los datos que vienen de la web
    const snippetId = req.params.id;

    // verificamos que vienen datos
    if (!snippetId) {
      return res
        .status(400)
        .json({
          errorMessage:
            "No se identifica el ID del fragmento. Porfavor contacte con un programador.",
        });
    }

    // si vienen comparamos los datos con la base datos, si no coinciden les mandamos un error
    const existingSnippet = await Snippet.findById(snippetId);
    if (!existingSnippet) {
      return res
        .status(400)
        .json({
          errorMessage:
            "No se ha encontrado ningún fragmento con este ID. Porfavor contacte con un programador.",
        });
    }

    // si coninciden empezamos el proceso de borrar los datos
    await existingSnippet.deleteOne();
    res.json(existingSnippet);
  } catch (err) {
    res.status(500).send();
  }
});

module.exports = router;
