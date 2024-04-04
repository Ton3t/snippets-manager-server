const router = require("express").Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/", async (req, res) => {
  try {
    const { email, password, passwordVerify } = req.body;

    // validando los datos del body

    if (!email || !password || !passwordVerify) {
      return res.status(400).json({
        errorMessage: "Todos los campos son requeridos.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        errorMessage: "Porfavor el password debe tener al menos 6 carácteres.",
      });
    }

    if (password !== passwordVerify) {
      return res.status(400).json({
        errorMessage: "Porfavor verifique el password.",
      });
    }

    // comparando emails en la base de datos

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        errorMessage: "El usuario ya existe en la base de datos.",
      });
    }

    // hash password

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    // guardar usuarios en la base de datos

    const newUser = new User({
      email,
      passwordHash,
    });

    const savedUser = await newUser.save();

    // jwt token - token de sesion

    const token = jwt.sign(
      {
        id: savedUser._id,
      },
      process.env.JWT_SECRET
    );

    // de esta manera evitamos  que inyecten javascript en las cookies

    res.cookie("token", token, { httpOnly: true }).send();
  } catch (err) {
    res.status(500).send();
  }
});

// logear usuarios

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // validando los datos del body

    if (!email || !password) {
      return res.status(400).json({
        errorMessage: "Todos los campos son requeridos.",
      });
    }

    // obtener cuenta de usuario

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(401).json({
        errorMessage: "Correo electrónico o password incorrecto.",
      });
    }

    // comparando el password encriptado en la base de datos

    const correctPassword = await bcrypt.compare(
      password,
      existingUser.passwordHash
    );

    if (!correctPassword) {
      return res.status(401).json({
        errorMessage: "Correo electrónico o password incorrecto.",
      });
    }

    // jwt token - token de sesion

    const token = jwt.sign(
      {
        id: existingUser._id,
      },
      process.env.JWT_SECRET
    );

    // de esta manera evitamos  que inyecten javascript en las cookies

    res.cookie("token", token, { httpOnly: true }).send();
  } catch (err) {
    res.status(500).send();
  }
});

// token de sesión de usuarios

router.get("/loggedIn", (req, res) => {
  try {
    const token = req.cookies.token;

    if(!token) {
      return res.json(null);
    }

    const validatedUser = jwt.verify(token, process.env.JWT_SECRET);
    res.json(validatedUser.id);

  } catch (err) {
    return res.json(null);
  }
});

// cerrar sesión usuario

router.get("/logOut", (req, res) => {
  try {
    return res.clearCookie("token").send();
  } catch (err) {
    return res.json(null);
  }
});

module.exports = router;
