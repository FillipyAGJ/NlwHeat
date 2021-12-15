import "dotenv/config"
import express, { response } from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

import { router } from "./routes";

const app = express();
app.use(cors());

const serverHttp = http.createServer(app);

const io = new Server(serverHttp, {
 cors: {
  origin: "*"
 }
});

io.on("connection", socket => {
 console.log(`Usuário conectado no socket ${socket.id}`)
});

/** Aqui iremos passar a rota e o express.json, pq o express não entende apenas a
 * rota sendo enviado via json, então tem que avisar que será enviado um json*/
app.use(express.json());

app.use(router);

/** Login do usuário
 * tem um get para redirecionar o usuário para autentica-lo
 */
app.get("/github", (request, response) => {
 response.redirect(
  `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}`
 );
});

/* Validar o usuário para ver se ele tem permissão */
app.get("/signin/callback", (request, response) => {
 const { code } = request.query;

 /** retornando para o json */
 return response.json(code);
});

export { serverHttp, io }