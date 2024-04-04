const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

dotenv.config();

// setup express server

const app = express();

app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.use(cookieParser());

app.listen(5000, () => console.log("Server corriendo en el puerto 5000"));

// set up de la carpeta routers

app.use("/snippet", require("./routers/snippetRouter"));
app.use("/auth", require("./routers/userRouter"));

// conectar a mongodb

mongoose.connect(process.env.MDB_CONNECT_STRING).then(
    () => {console.log("Conectado a MongoDB")},
    err => {
        console.log(err);
    }
);