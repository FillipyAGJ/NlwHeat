import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

interface IPayload {
 sub: string;
}

/** Vai verificar se o token existe, se existe irá passar para a
 *  próxima etapa, se não, vai dar um erro. */
export function ensureAuthenticated(request: Request, response: Response, next: NextFunction) {
 const authToken = request.headers.authorization;

 /** Verificando a existência do token */
 if (!authToken) {
  return response.status(401).json({
   errorCode: "token.invalid",
  });
 }

 // Bearer s98j9a8sj9f8sds0duf8
 // [0] Bearer
 // [1] s98j9a8sj9f8sds0duf8

 const [, token] = authToken.split(" ");
 try {
  const { sub } = verify(token, process.env.JWT_SECRET) as IPayload;

  request.user_id = sub;

  return next();
 } catch (err) {
  return response.status(401).json({ errorCode: "token.expired" });
 }
}