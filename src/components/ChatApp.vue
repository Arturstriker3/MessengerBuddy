<template>
  <div>
    <PageLoader />
    <div v-if="!joined" class="parent-container">
      <typewriterVue></typewriterVue>
        <div class="name-container">
          <div class="status-bar" :style="{ 'background-color': isButtonDisabled ? 'red' : 'green' }"></div>
          <input class="user-name" :disabled="isButtonDisabled" placeholder="Usuário" type="text" v-model="currentUser"/>
          <button class="join-button" :disabled="isButtonDisabled" v-on:click="join">Entrar</button>
        </div>
    </div>
    
    <div v-if="joined">

      <div class="navbar-container">
        <div class="navbar-menu1">
          <div class="user-info">
            <i class="fa-solid fa-user"></i>
            <p>{{ currentUser }}</p>
          </div>
          <div class="users-info">
            <i class="fa-solid fa-users"></i>
            <p>999</p>
          </div>
        </div>
        <div class="navbar-menu2">
          <button>
            <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>

      <div class="list-container" ref="messageList">
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
      <div class="text-input-container">
        <input 
          v-model="text"
          class="text-message"
          @keyup.enter="sendMessage"
          type="text"
          placeholder="Digite sua mensagem..."
        />
        <button class="send-button" @click="sendMessage">Enviar</button>
      </div>
    </div>
  </div>
</template>
  
<script>
  import typewriterVue from './typewriter.vue';
  import io from 'socket.io-client';
  import PageLoader from './PageLoader.vue'

  export default {
    data() {
      return {
        joined: false,
        currentUser: "",
        text: "",
        messages: [],
        isButtonDisabled: true,
        serverAddress: 'http://localhost:3000',
      };
    },
    components: {
        typewriterVue,
        PageLoader,
    },

    created() {
      this.checkServerConnection();

      this.loadSavedUser();
    },

    methods: {

      checkServerConnection() {
        this.socketInstance = io(this.serverAddress);

        this.socketInstance.on("connect", () => {
          this.isButtonDisabled = false;
        });
      },

      join() {
        this.joined = true;
        this.socketInstance = io(this.serverAddress);
        
        this.socketInstance.on(
          "message:received", (data) => {
            this.messages = this.messages.concat(data);
          }
        )

        localStorage.setItem('currentUser', this.currentUser);
      },

      sendMessage() {
        this.addMessage();

        // Clear the text input field
        this.text = "";
      },

      addMessage() {
          const now = new Date();
          const formattedTime = this.formatTime(now);

          const message = {
            id: new Date().getTime(),
            text: this.text,
            user: this.currentUser,
            time: formattedTime,
          };

          this.messages = this.messages.concat(message);

          // Rola automaticamente para a última mensagem adicionada
          this.$nextTick(() => {
            const messageList = this.$refs.messageList;
            messageList.scrollTop = messageList.scrollHeight;
          });

          this.socketInstance.emit('message', message);
      },

      formatTime(date) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
      },

      loadSavedUser() {
        // Verifica se há um usuário salvo no localStorage
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          this.currentUser = savedUser;
          this.joined = true;
        }
      },
    },
  };
</script>

<style lang="scss" scoped>

  /* Menu de Acesso */

  .parent-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    flex-direction: column;

    .name-container {
      display: flex;
      flex-direction: column;
      width: 200px;

      .status-bar {
        width: 5px;
        height: 5px;
        margin-bottom: 5px;
        border-radius: 50%;
      }

      .user-name {
        height: 30px;
        font-size: 20px;
        padding: 5px;
        margin-bottom: 5px;
        text-align: center;
        font-weight: bold;
        border: 3px double black;
      }

      .join-button {
        height: 30px;
        font-size: 20px;
        color: #fff;
        background: linear-gradient(to bottom, #ff8a00, #e52e71);
        transition: background 0.3s;

        &:hover{
          cursor: pointer;
          background: linear-gradient(to bottom, #e52e71, #ff8a00);
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

  .navbar-container {
    display: flex;
    flex-direction: row;
    justify-content: center;
    background-color: #ff8a00;
    border-radius: 0 0 10px 10px; /* Os valores são para a parte inferior direita e inferior esquerda */
    margin-bottom: 15px;
    height: 7vh;

    .navbar-menu1 {
      flex-grow: 0.8; /* Ocupa metade da largura disponível */
      display: flex;
      align-items: center;
      flex-direction: row;
      justify-content: center;
      font-size: 20px;

      .user-info {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        flex-grow: 1;
        font-size: 15px;

        i {
          margin-right: 15px;
          font-size: 30px;
        }

        p {
          font-size: 15px;
        }
      }

      .users-info {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        flex-grow: 1;

        i {
          margin-right: 15px;
          font-size: 30px;
        }

        p {
          font-size: 15px;
        }
      }
    }

    .navbar-menu2 {
      flex-grow: 0.2; /* Ocupa metade da largura disponível */
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;

      button {
        height: 35px;
        width: 50%;
        font-size: 18px;
        color: #fff;
        background: linear-gradient(to bottom, #4caf50, #ff8a00);
        border: 1px, solid black;
        border-radius: 5px;
        padding: 5px;
        cursor: pointer;

        display: flex;
        justify-content: center;
        align-items: center;

        &:hover {
          background: linear-gradient(to bottom, #45a049, #4caf50);
        }
      }
    }
  }

  // Mensagens

  .list-container {
    max-height: 80vh;
    overflow-y: auto;

    .own-message {
      text-align: right;
    }

    .message-sender {
      font-weight: bold;
      margin-right: 5px;
    }

    .other-message-text{
      background-color: #363638;
      border-radius: 10px;
      display: inline-block;
      padding: 5px 10px;
      margin-bottom: 3px;
      color: #FFFFFF;
      font-size: 20px;
    }

    .own-message-text {
      background-color: #4caf50;
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
      color: #808080;
      margin-right: 5px;
      margin-bottom: 15px;
      filter: brightness(35%);
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
    padding: 10px;
    align-items: center;
    backdrop-filter: blur(10px);

    .text-message {
      flex: 1;
      height: 50px;
      padding: 10px;
      border-radius: 15px;
    }

    .send-button {
      height: 50px;
      font-size: 18px;
      color: #fff;
      background: linear-gradient(to bottom, #4caf50, #ff8a00);
      border: 1px, solid black;
      border-radius: 5px;
      padding: 10px;
      cursor: pointer;
      margin-left: 5px;

      &:hover {
        background: linear-gradient(to bottom, #45a049, #4caf50);
      }
    }
  }
</style>