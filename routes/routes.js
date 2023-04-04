import {Router} from "express";
import bodyParser from "body-parser";
import {body, validationResult} from 'express-validator';
import passport from "passport";
import PassportLocal from "passport-local";
import session from "express-session";
import cookieParser from "cookie-parser";
import pg from "pg";
import dotenv from "dotenv";
import flash from "express-flash"
// sección configuraciones
const router = Router()
const PassPortLocal = PassportLocal.Strategy
const {Pool} = pg;

dotenv.config()


router.use(bodyParser.urlencoded({extended: true}))

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


router.use(cookieParser("secretKey"))

//-------------------------------------------------------- Configuración session --------------------------------------------------------------------
router.use(session({
    secret:"secretKey",
    saveUninitialized: true, 
    resave:true

}))

router.use(passport.initialize())
router.use(passport.session())


passport.use(new PassPortLocal(function(username,password,done){
    let consulta = {
        name: "login",
        text: `SELECT * FROM usuario WHERE email LIKE $1`,
        values: [username]
    }
    pool.query(consulta, (error,res,fields) =>{
        if(error){
            console.log(error)
        }else{
            if(res.rows.length > 0){
                let usuario = res.rows[0]

                if(username == usuario.email && password == usuario.password){
                    return done(null,{id:usuario.id, correo:usuario.email})
                }else if(username != usuario.email && password != usuario.password){
                    return done(null,false)
                }
                
            }else{
                return done(null,false)
            }
            
        }
    })
    
}))

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null,user)
});


//express-flash
router.use(flash())


// sección rutas
router.get("/", (req, res)=>{
    
    res.render("index")
})

router.get("/index", (req, res)=>{
    res.render("index")
})



router.post("/login",body("username").isString().notEmpty(),
                    body("password").isString().notEmpty(),
                    passport.authenticate("local",{failureRedirect: "/index"}),
                    (req, res) =>{
                        let error = validationResult(req)
                        if ( !error.isEmpty()) {
                            console.log(error.array());
                            return respuesta.json({error: error.array() });
                        }else{
                            let email = req.session.passport.user.correo
                            res.render("perfil",{email})
                        }
                    }
)

router.get("/login",(req,res,next) =>{                  
                        if(req.isAuthenticated()){ 
                            
                            let email = req.session.passport.user.correo
                            res.render("perfil",{email})
                        }else{
                            res.redirect("/index")
                        }
                    }
)

router.get("/perfil",(req,res,next) =>{                  
                        if(req.isAuthenticated()){ 
                            let email = req.session.passport.user.correo
                            res.render("perfil",{email})
                        }else{
                            res.redirect("/index")
                        }
                    } 
)


router.post("/crear",   body("username").isString().notEmpty(),
                        body("password").isString().notEmpty(),
                        (req, response) =>{
                            let error = validationResult(req)
                            if ( !error.isEmpty()) {
                                console.log(error.array());
                                return respuesta.json({error: error.array() });
                            }else{
                                let consulta = {
                                    name: "usuarios",
                                    text: "INSERT INTO usuario(email,password) VALUES($1,$2)",
                                    values: [req.body.username, req.body.password]
                                }
                                try{
                                    pool.query(consulta, (error,res, fields) =>{
                                        if(error){
                                            console.log(error)
                                        }else{
                                            console.log("Usuario creado")
                                            response.render("index")
                                        }
                                    })
                                }catch (err){
                                    console.log(err)
                                }
                                
                            }
                        }
)

export default router 