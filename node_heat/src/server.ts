import { serverHttp } from "./app";

/** Abre a porta 4000 e Manda uma mensagem no console dizendo que a aplicação está funcionando */
serverHttp.listen(4000, () => console.log(`🚀 Server is running on PORT 4000`));