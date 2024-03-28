const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

// setup express server

const app = express();

app.use(express.json());

app.listen(5000, () => console.log("Server corriendo en el puerto 5000"));

// set up de la carpeta routers

app.use("/snippet", require("./routers/snippetRouter"));

// conectar a mongodb

mongoose.connect(process.env.MDB_CONNECT_STRING).then(
    () => {console.log("Conectado a MongoDB")},
    err => {
        console.log(err);
    }
);