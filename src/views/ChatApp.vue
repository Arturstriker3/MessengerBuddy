<template>
  <div>
    <PageLoader ref="pageLoader" />

    <section class="authentication-section">
      <div v-if="!joined" class="parent-container">
        <typewriterVue class="typewriter-overlay"></typewriterVue>
        <div class="name-container">
          <div class="status-bar" :style="{ 'background-color': isButtonDisabled ? 'red' : 'green' }"></div>
          <input class="user-name" :disabled="isButtonDisabled" @keyup.enter="join" placeholder="Usuário" type="text" v-model="currentUser"/>
          <button class="join-button" :disabled="isButtonDisabled" v-on:click="join">Entrar</button>
        </div>
      </div>
    </section>
    
    <div v-if="joined">

      <nav class="navbar">
        <div class="brand-title"><span>Olá, {{ currentUser }}</span></div>
        <a href="#" class="toggle-button" @click="toggleNavbar">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </a>
        <div class="navbar-links" :class="{ active: navbarActive }">
          <ul>
            <li><a href="https://mbserver-production.up.railway.app/api-docs/" target="_blank"><i class="fa-solid fa-book"></i><p>Docs</p></a></li>
            <li><a href="#"><i class="fa-solid fa-users"></i><p>{{ onlineUsers }}</p></a></li>
            <li><a href="#" @click="logout"><i class="fa-solid fa-right-from-bracket"></i><p>Sair</p></a></li>
          </ul>
        </div>
      </nav>

      <main>
        <div class="list-container" ref="messageList">
          <!-- Iterar sobre as datas -->
          <div v-for="(messages, date) in messagesByDate" :key="date">
            <!-- Exibir a data como um título -->
            <h3>{{ reverseDate(date) }}</h3>
            <!-- Iterar sobre as mensagens da data atual -->
            <div v-for="message in messages" :key="message.id" :class="{ 'own-message': message.user === currentUser }">
              <span v-if="message.user !== currentUser" class="message-sender">{{ message.user }}:</span>
              <span :class="{ 'own-message-text': message.user === currentUser, 'other-message-text': message.user !== currentUser }">
                {{ message.text }}
              </span>
              <div class="message-time">
                {{ message.time }}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer>
        <div class="text-input-container">
          <input 
            v-model="text"
            class="text-message"
            @keyup.enter="sendMessage"
            type="text"
            placeholder="Digite sua mensagem..."
          />
          <button class="send-button" @click="sendMessage"><i class="fa-regular fa-circle-up"></i></button>
        </div>
      </footer>
    </div>
  </div>
</template>
  
<script>
  import typewriterVue from '../components/typewriter.vue';
  import io from 'socket.io-client';
  import PageLoader from '../components/PageLoader.vue'
  import axios from 'axios';
  import notificationSound from '../audio/notification.mp3';
  import loginSound from '../audio/login.mp3';
  import logoutSound from '../audio/logout.mp3';
  import checkProfanity from "mrx-no-swearing-ptbr";

  export default {
    data() {
      return {
        joined: false,
        currentUser: "",
        text: "",
        messages: [],
        messagesByDate: {},
        isButtonDisabled: true,
        isAudioPlaying: false,
        onlineUsers: 1,
        navbarActive: false,
        profanityFilterEnabled: false,
        serverAddress: 'https://mbserver-production.up.railway.app',
      };
    },
    components: {
        typewriterVue,
        PageLoader,
    },

    created() {
      this.checkServerConnection();
      this.setupSocketListeners();
      this.groupMessagesByDate();
    },

    watch: {
      // Observador para atualizar as mensagens agrupadas por data sempre que o array de mensagens mudar
      messages: {
        handler() {
          this.groupMessagesByDate();
        },
        deep: true
      }
    },

    mounted() {
      this.$refs.pageLoader.delayAndSetLoadedStatus(1000);
    },

    beforeDestroy() {
      if (this.socketInstance) {
        this.socketInstance.off('onlineUsersCount', this.updateOnlineUsers);
      }
    },

    methods: {

      checkServerConnection() {
        this.socketInstance = io(this.serverAddress);

        this.socketInstance.on("connect", () => {
          this.isButtonDisabled = false;
        });
      },

      join() {
        // Verificar se o nome do usuário está definido
        if (this.currentUser.trim() === "") {
          // Se o nome do usuário estiver em branco, não faz nada
          return;
        }

        // Verificar se o nome de usuário está disponível
        axios.get(`${this.serverAddress}/api/checkUserOnline/${this.currentUser}`)
          .then(response => {
            if (response.data.online) {
              // Nome de usuário já está em uso
              alert('Este nome de usuário já está em uso. Por favor, escolha outro.');
              window.location.reload();
            } else {
              // Nome de usuário está disponível, então prossegue com a entrada do usuário
              this.joined = true;
              // Carregar as mensagens
              this.loadMessages();

              // Estabelecer a conexão do socket
              this.socketInstance = io(this.serverAddress);
              this.playLoginSound();

              // Emitir o nome de usuário para o servidor
              this.socketInstance.emit('currentUser', this.currentUser);

              // Lidar com mensagens recebidas
              this.socketInstance.on("message:received", (data) => {
                if (data.user !== this.currentUser) {
                  this.messages = this.messages.concat(data);
                  this.playNotificationSound(); // Adicione esta linha
                }
              });
            }
          })
          .catch(error => {
            console.error('Erro ao verificar disponibilidade do nome de usuário:', error);
          });
      },

      groupMessagesByDate() {
        // Limpar o objeto de mensagens agrupadas por data
        this.messagesByDate = {};

        // Iterar sobre as mensagens para agrupá-las por data
        this.messages.forEach(message => {
          const date = message.date;
          if (!this.messagesByDate[date]) {
            // Se ainda não houver mensagens para esta data, inicializa um array vazio
            this.messagesByDate[date] = [];
          }
          // Adicionar a mensagem ao array correspondente à sua data
          this.messagesByDate[date].push(message);
        });
      },

      formatTime(date) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      },

      formatDate(date) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
      },

      reverseDate(date) {
        const parts = date.split('-');
        return parts.reverse().join('/');
      },

      sendMessage() {
        // Verifica se o texto da mensagem está vazio
        if (this.text.trim() === "") {
          return;
        }

        // Verifica se o filtro de palavrões está habilitado
        if (this.profanityFilterEnabled) {
          // Verifica se o texto da mensagem contém palavrões
          const result = checkProfanity(this.text);
          if (result) {
            alert("A mensagem contém palavras ofensivas. Por favor, revise sua mensagem.");
            return;
          }
        }

        // Se não houver palavrões, continua enviando a mensagem
        this.addMessage();
        this.playNotificationSound();
        this.text = "";

        // Rola automaticamente para a última mensagem
        this.$nextTick(() => {
          const messageList = this.$refs.messageList;
          messageList.scrollTop = messageList.scrollHeight;
        });
      },

      addMessage() {
        const now = new Date();
        const formattedTime = this.formatTime(now);
        const formattedDate = this.formatDate(now);

        const message = {
          text: this.text,
          user: this.currentUser,
          time: formattedTime,
          date: formattedDate,
        };

        // Enviar mensagem para o backend (adicionar código de envio para o backend aqui)
        this.sendToBackend(message);

        // Emitir a mensagem para todos os clientes conectados
        this.messages = this.messages.concat(message);
      },

      sendToBackend(message) {
        if (message && message.user && message.time) {

          // console.log('Dados enviados para o backend:', message);

          axios.post(`${this.serverAddress}/api/sendMessage`, {
            user: message.user,
            text: message.text,
            date: message.date,
            time: message.time,
          })
          .then(response => {
            // console.log('Mensagem enviada com sucesso para o backend!', response.data);
          })
          .catch(error => {
            console.error('Erro ao enviar mensagem para o backend:', error);
          });
        } else {
          console.error('Objeto de mensagem inválido:', message);
        }
      },

      loadMessages() {
        this.$refs.pageLoader.setLoadedStatus(false);

        axios.get(`${this.serverAddress}/api/getMessages`)
          .then(response => {
            // Limpar as mensagens e o objeto de mensagens por data
            this.messages = [];
            this.messagesByDate = {};

            // Iterar sobre as mensagens recebidas
            response.data.forEach(message => {
              // Convertendo a data do UTC para o fuso horário local do cliente
              const utcDateTime = `${message.date}T${message.time}Z`;
              const localDate = new Date(utcDateTime);

              // Formatando a data da mensagem
              const formattedMessageDate = this.formatDate(localDate);

              // Adicionando a mensagem à lista geral de mensagens
              this.messages.push({
                text: message.text,
                user: message.user,
                time: this.formatTime(localDate),
                date: formattedMessageDate
              });

              // Agrupando a mensagem na lista de mensagens por data
              if (!this.messagesByDate[formattedMessageDate]) {
                this.messagesByDate[formattedMessageDate] = [];
              }
              this.messagesByDate[formattedMessageDate].push({
                text: message.text,
                user: message.user,
                time: this.formatTime(localDate)
              });
            });

            this.$refs.pageLoader.delayAndSetLoadedStatus(2000);

            this.$nextTick(() => {
              const messageList = this.$refs.messageList;
              messageList.scrollTop = messageList.scrollHeight;
            });
          })
          .catch(error => {
            console.error('Erro ao carregar mensagens:', error);
          });
      },

      playNotificationSound() {
        if (this.isAudioPlaying || !this.joined) {
          return;
        }

        const audio = new Audio(notificationSound);
        audio.play();

        this.isAudioPlaying = true;

        setTimeout(() => {
          this.isAudioPlaying = false;
        }, 500);
      },

      playLoginSound() {
        if (this.isAudioPlaying || !this.joined) {
          return;
        }

        const audio = new Audio(loginSound);
        audio.play();

        this.isAudioPlaying = true;

        setTimeout(() => {
          this.isAudioPlaying = false;
        }, 5000);
      },

      playLogoutSound() {
        if (this.isAudioPlaying || !this.joined) {
          return;
        }

        const audio = new Audio(logoutSound);
        audio.play();

        this.isAudioPlaying = true;

        setTimeout(() => {
          this.isAudioPlaying = false;
        }, 5000);
      },

      setupSocketListeners() {
        // Ouvir o evento 'onlineUsersCount' para manter atualizado o número de usuários online
        this.socketInstance.on('onlineUsersCount', (count) => {
          this.updateOnlineUsers(count);
        });
      },

      updateOnlineUsers(count) {
        if (count > 0) {
          this.onlineUsers = Math.ceil(count / 2); // Arredonda para cima para garantir que tenhamos pelo menos 1 usuário
        } else {
          this.onlineUsers = count;
        }
      },

      logout() {
        this.$refs.pageLoader.setLoadedStatus(false);

        // Desconectar o socket e redefinir variáveis
        if (this.socketInstance) {
          this.socketInstance.disconnect();
          this.socketInstance = null;
        }

        this.playLogoutSound();
        this.joined = false;
        this.currentUser = "";
        this.text = "";
        this.messages = [];
        this.joined = false;
        this.checkServerConnection()
        this.$refs.pageLoader.delayAndSetLoadedStatus(2000);
        this.navbarActive = false
      },

      toggleNavbar() {
        this.navbarActive = !this.navbarActive;
      }
    },
  };
</script>

<style lang="scss" scoped>

  /* Menu de Acesso */

  .parent-container {
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    .typewriter-overlay {
      position: absolute;
      top: -15vh;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .name-container {
      display: flex;
      flex-direction: column;
      width: 200px;
      z-index: 1;
      

      .status-bar {
        width: 5px;
        height: 5px;
        margin-bottom: 5px;
        border-radius: 50%;
      }

      .user-name {
        height: 30px;
        font-size: 14px;
        margin-bottom: 8px;
        text-align: center;
        font-weight: bold;
        border: none;
        border-radius: 99px;
      }

        .join-button {
          height: 30px;
          font-size: 14px;
          color: #fff;

          background: linear-gradient(to right, #ff8a00, #ff6a00);
          transition: background 0.3s;
          border-radius: 99px;
          border: none;

          &:hover{
            cursor: pointer;
            background: linear-gradient(to left, #ff8a00, #ff6a00);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }

        &:disabled {
          cursor: not-allowed;
          background-color: #ccc;
          color: #999;
        }
      }
    }
  }

  /* Navbar */

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #48494B ;
  color: #fff;
  margin-bottom: 32px;
  margin-top: 16px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  border-radius: 15px;
}

.brand-title {
  margin: 0.8rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 1.5rem; /* Define a altura igual à altura do texto "Olá," */

  span {
    margin-left: 10px;
    font-size: 1.2rem;
  }
}

.navbar-links ul {
  margin: 0;
  padding: 0;
  display: flex;
}

.navbar-links li {
  list-style: none;
}

.navbar-links li:hover {
  background-color: #555;
}

.navbar-links li a {
  text-decoration: none;
  color: #fff;
  padding-top: 1rem;
  padding-right: 1rem;
  padding-bottom: 0rem;
  padding-left: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.toggle-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  flex-direction: column;
  justify-content: space-between;
  width: 28px;
  height: 21px;
  cursor: pointer; /* Adicionado cursor pointer para indicar que é clicável */
}

.toggle-button .bar {
  height: 3px;
  width: 100%;
  background-color: white;
  border-radius: 10px;
}

@media (max-width: 425px) {

  .brand-title {

    span {
      margin-left: 10px;
      font-size: 1.1rem;
    }
  }

  .list-container {
    margin-top: 72px;
  }
  .toggle-button {
    display: flex;
  }

  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 999;
    flex-direction: column;
    align-items: flex-start;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    border-radius: 10px;
    margin-top: 2px;
    margin-bottom: 4px;
  }

  .navbar-links {
    display: none;
    width: 100%;
    height: 100vh;
    align-items: center;
    background-color: #808080;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    border-radius: 15px;
  }

  .navbar-links ul {
    width: 100%;
    flex-direction: column;
  }

  .navbar-links li {
    text-align: center;
    text-align: left; /* Alinhar texto à esquerda */
    width: 100%;
    margin-bottom: 40px;
  }

  .navbar-links li a {
    padding: 0.5rem 1rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start; /* Alinhar conteúdo da esquerda */
    width: 100%; /* Ocupar toda a largura disponível */
    box-sizing: border-box; /* Garantir que o padding não aumente a largura */

    p {
      font-size: 18px;
      font-family: 'Roboto', sans-serif;
    }

    i {
      font-size: 25px;
      color: white;
      margin-right: 10px;
      margin-left: 35vw; /* Define a margem esquerda como metade da largura da tela */
    }
  }

  .navbar-links.active {
    display: flex;
  }

  .message-time {
    font-size: 12px;
    color: #FFFFFF;
    margin-right: 5px;
    margin-bottom: 24px;
    filter: brightness(80%);
  }
}

  // Mensagens

  .list-container {
    max-height: 78vh;
    overflow-y: auto;
    margin-right: 5px;
    margin-left: 5px;
    padding-right: 10px;
    padding-left: 10px;

    h3 {
      color: #FFFFFF;
      background-color: #333;
      border-radius: 99px;
      font-size: 15px;
      text-align: center;
      margin-bottom: 30px;
      padding-top: 5px;
      padding-bottom: 5px;
    }

    &::-webkit-scrollbar{
      width: 6px;
    }

    &::-webkit-scrollbar-track{
      border-radius: 8px;
      background-color: #FFFFFF;
      border: 1px solid #fff;
      box-shadow: inset 0 0 6px rgba(0, 0, 0, .3);
    }

    &::-webkit-scrollbar-thumb{
      border-radius: 8px;
      background-color: #FF8833;
    }

    .own-message {
      text-align: right;
    }

    .message-sender {
      font-weight: bold;
      margin-right: 5px;
      color: #FF8833;
    }

    .other-message-text{
      background-color: #797979;
      border-radius: 10px;
      display: inline-block;
      padding: 5px 10px;
      margin-bottom: 3px;
      color: #FFFFFF;
      font-size: 20px;
    }

    .own-message-text {
      background-color: #0095FF;
      border-radius: 10px;
      display: inline-block;
      padding: 5px 10px;
      margin-bottom: 3px;
      color: #FFFFFF;
      font-size: 20px;
      text-align: left;
    }

    .message-time {
      font-size: 12px;
      color: #FFFFFF;
      margin-right: 5px;
      margin-bottom: 24px;
      filter: brightness(80%);
    }
  }

  /* Input das Mensagens */

  .text-input-container {
    position: fixed;
    bottom: 0;
    right: 0;
    left: 0;
    display: flex;
    justify-content: space-between;
    padding: 8px;
    align-items: center;

    .text-message {
      flex: 1;
      height: 50px;
      border-radius: 99px;
      font-family: 'Roboto', sans-serif;
      padding-left: 20px;
      background-color: #48494B;
      border: none;
      color: #fff;
    }

    .send-button {
      height: 50px;
      font-size: 16px;
      color: #fff;
      background: linear-gradient(to bottom, #ff8a00, #ff6a00);
      border: none;
      border-radius: 50%;
      padding: 15px;
      cursor: pointer;
      margin-left: 5px;

      i {
        transform: rotate(90deg);
      }

      &:hover {
        background: linear-gradient(to bottom, #ff6a00, #ff8a00);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
    }
  }
</style>