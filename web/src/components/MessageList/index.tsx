import { api } from '../../services/api';
import io from 'socket.io-client';
import styles from './styles.module.scss';

import logoImg from '../../assets/logo.svg';
import { useEffect, useState } from 'react';

type Message = {
 id: string;
 text: string;
 user: {
  name: string;
  avatar_url: string;
 }
}

const messagesQueue: Message[] = [];

const socket = io('http://localhost:4000');

socket.on('new_message', (newMessage: Message) => {
 messagesQueue.push(newMessage);
})

export function MessageList() {
 /**
  * Uma das funcionalidades do react, que é uma das coisas mais
  * importantes junto com a parte de componentes.
  * Estado ➡ uma forma de eu armazenar informações dentro
  * do componente. São variáveis do componente.
  * 
  * sempre é bom colocar o valor inicial com o valor do estado
  * que será passado
  * 
  * a gente usa o segundo parametro pra atualizar o primeiro (imutabilidade)
  */
 const [messages, setMessages] = useState<Message[]>([])

 useEffect(() => {
  const timer = setInterval(() => {
   if (messagesQueue.length > 0) {
    setMessages(prevState => [
     messagesQueue[0],
     prevState[0],
     prevState[1],
    ].filter(Boolean))
    messagesQueue.shift()
   }
  }, 3000)
 }, [])

 /**
  * React ➡ Quando quero fazer uma requisição para o backend
  * usamos a função abaixo.
  * ele recebe 2 parametros:
  * 1 ➡ O que eu quero executar? qual função eu quero fazer?
  * 2 ➡ Quando eu quero fazer isso (ele é um array),
  * e dentro do array eu passo variáveis (posso deixar vazio),
  * mas quando eu quero que o primeiro valor execute apenas
  * uma vez (carregamentos de tela, listagens etc), eu deixo o
  * segundo valor vazio (array)
  */

 useEffect(() => {
  api.get<Message[]>('messages/last3').then(response => {
   setMessages(response.data)
  })
 }, [])

 return (
  <div className={styles.messageListWrapper}>
   <img src={logoImg} alt="DoWhile 2021" />

   <ul className={styles.messageList}>
    {messages.map(message => {
     return (
      <li key={message.id} className={styles.message}>
       <p className={styles.messageContent}>{message.text}</p>
       <div className={styles.messageUser}>
        <div className={styles.userImage}>
         <img src={message.user.avatar_url} alt={message.user.name} />
        </div>
        <span>{message.user.name}</span>
       </div>
      </li>
     );
    })}
   </ul>
  </div>
 )
}