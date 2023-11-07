<template>
  <div v-if="!joined" class="parent-container">
    <typewriterVue></typewriterVue>
      <div class="name-container">
        <input class="user-name" :disabled="isButtonDisabled" placeholder="Usuário" type="text" v-model="currentUser"/>
        <button class="join-button" :disabled="isButtonDisabled" v-on:click="join">Entrar</button>
      </div>
  </div>
  <div v-if="joined">
    <div class="list-container">
      <div v-for="message in messages" :key="message.id">
        <b>
          {{ message.user }}
        </b>
        : {{ message.text }}
      </div>
    </div>
    <div class="text-input-container">
      <textarea 
        v-model="text"
        class="text-message"
        v-on:keyup.enter="sendMessage"
      ></textarea>
    </div>
  </div>
</template>
  
<script>
  import typewriterVue from './typewriter.vue';
  import io from 'socket.io-client';

  export default {
    data() {
      return {
        joined: false,
        currentUser: "",
        text: "",
        messages: [],
        isButtonDisabled: true,
      };
    },
    components: {
        typewriterVue,
    },
    methods: {
      join() {
        this.joined = true;
        this.socketInstance = io("http://localhost:3000")

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
          const message = {
            id: new Date().getTime(),
            text: this.text,
            user: this.currentUser,
          };

          console.log(message.text)

          this.messages = this.messages.concat(message);

          this.socketInstance.emit('message', message);
      }
    },
  };
</script>

<style scoped>

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
    background: linear-gradient(to bottom, #e52e71, #ff8a00); /* Gradiente de fundo alterado no hover */
  }

  .join-button:disabled {
    /* Defina os estilos de hover quando o botão estiver desativado */
    cursor: not-allowed; /* Altera o cursor */
    background-color: #ccc; /* Altera a cor de fundo */
    color: #999; /* Altera a cor do texto */
    /* Adicione outros estilos de hover personalizados, se necessário */
  }

  .text-input-container {
    height: 100vh;
  }

  .text-message {
    width: 100%;
    position: absolute;
    bottom: 0px;
    height: 70px;
    padding: 10px;
  }

</style>