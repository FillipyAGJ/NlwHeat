import axios from "axios";
import prismaClient from "../prisma";
import { sign } from "jsonwebtoken"
/**
* Receber code(string)
* Recuperar o acess_token no github
* Recuperar infos do user no github
* Verificar se o usuario existe no DB
* ---- SIM = Gera um token
* ---- NAO = Cria no DB, gera um token
* Retornar o token com as infos do user
*/

class AuthenticateUserService {
 async execute(code: string) {

  /** Recuperando o acesso no github */
  const url = "https://github.com/login/oauth/access_token";

  /** aqui só terá o acess token */
  interface IAcessTokenReponse {
   access_token: string;
  }

  /** fazendo uma filtragem de quais dados irei querer do usuário*/
  interface IUserResponse {
   avatar_url: string,
   login: string,
   id: number,
   name: string
  }

  /** aqui o código vai esperar o axios puxar a url, data( um body que está null), parametros do usuário e um header  */
  const { data: accessTokenResponse } = await axios.post<IAcessTokenReponse>(url, null, {
   params: {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code,
   },
   headers: {
    "Accept": "application/json"
   }
  })

  /** pega todas as informações do usuário que tá logado na aplicação */
  const response = await axios.get<IUserResponse>("https://api.github.com/user", {
   headers: {
    authorization: `Bearer ${accessTokenResponse.access_token}`
   }
  });

  const { login, id, avatar_url, name } = response.data

  /** primeiro ele vai procurar o id do usuário */
  let user = await prismaClient.user.findFirst({
   where: {
    github_id: id
   }
  });
  /** verificar se o usuário está criado no banco, se não estiver, vai criar*/
  if (!user) {
   user = await prismaClient.user.create({
    data: {
     github_id: id,
     login,
     avatar_url,
     name
    }
   })
  }
  /** token de criação do usuário */
  const token = sign(
   {
    user: {
     name: user.name,
     avatar_url: user.avatar_url,
     id: user.id
    }
   },
   process.env.JWT_SECRET,
   {
    subject: user.id,
    expiresIn: "1d"
   }
  )
  /** vai retornar o token e usuário para quem estiver fazendo a requisição */
  return { token, user };

 }
}

export { AuthenticateUserService };