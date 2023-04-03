import {Router} from "express";
import bodyParser from "body-parser";
import {body, validationResult} from 'express-validator';
import passport from "passport";
import PassportLocal from "passport-local";
import session from "express-session";
import cookieParser from "cookie-parser";
import pg from "pg";
import dotenv from "dotenv";

// sección configuraciones
const router = Router()
const PassPortLocal = PassportLocal.Strategy
const {Pool} = pg;

dotenv.config()

const pool = new Pool ({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB,
    password: process.env.DB_PASS,
    user: process.env.DB_USER,
    max: 20,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis:2000
})

pool.query('select * from usuario', (err,res)=>{
    if(err){
        throw err
    }else{
        console.table(res.rows)
    }
})

// sección rutas
router.get("/", (req, res)=>{
    res.render("index")
})
 router.post("/")
export default router 