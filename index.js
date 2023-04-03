import express from 'express';
import hbs from 'hbs';

import {dirname, join} from "path";
import { fileURLToPath } from 'url';

import indexRoutes from "./routes/routes.js"

const app = express();

const __dirname = dirname(fileURLToPath(import.meta.url))

app.use(express.static(join(__dirname,"/public" )))

app.set("views", join(__dirname, "views"))


app.set("view engine", "hbs");

app.use(indexRoutes)

app.listen(3000, function(){
    console.log("Server is listening in port 3000")
})