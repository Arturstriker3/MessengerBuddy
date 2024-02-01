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
      <div class="list-container" ref="messageList">
        <div v-for="message in messages" :key="message.id" :class="{ 'own-message': message.user === currentUser }">
          {{ message.time }} |
          <span v-if="message.user !== currentUser" class="message-sender">{{ message.user }}:</span>
          <span :class="{ 'own-message-text': message.user === currentUser }">
            {{ message.text }}
          </span>
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
    },
  };
</script>

<style scoped>

  @import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Open+Sans&family=Roboto&display=swap');

  *{
    font-family: 'Roboto', sans-serif;
  }

  .status-bar {
    width: 5px;
    height: 5px;
    margin-bottom: 5px;
    border-radius: 50%;
  }

  .parent-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    flex-direction: column;
  }

  .name-container {
    display: flex;
    flex-direction: column;
    width: 200px;
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
  }

  .join-button:hover{
    cursor: pointer;
    background: linear-gradient(to bottom, #e52e71, #ff8a00);
  }

  .join-button:disabled {
    cursor: not-allowed;
    background-color: #ccc;
    color: #999;
  }

  .list-container {
    max-height: 87vh; /* Defina uma altura máxima desejada */
    overflow-y: auto; /* Adicione a rolagem vertical apenas quando necessário */
  }

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
  }

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
}
  .send-button:hover {
    background: linear-gradient(to bottom, #45a049, #4caf50);
  }

/* Mensagens */

.own-message {
  text-align: right;
}

.message-sender {
  font-weight: bold;
  margin-right: 5px;
}

.own-message-text {
  background-color: #d3ffd3; /* Adapte a cor de fundo conforme necessário */
  border-radius: 10px;
  display: inline-block;
  padding: 5px 10px;
  margin-bottom: 5px;
}

</style>