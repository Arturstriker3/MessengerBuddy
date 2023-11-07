<template>
    <div class="login-page">

        <div>
            <typewriterVue></typewriterVue>
        </div>
        
        <div class="card">
            <form @submit.prevent="login">
                <div class="title">Login</div>
                <input placeholder="Username" type="text" v-model="username" />
                <br />
                <input placeholder="Password" type="password" v-model="password" />
                <br />
                <button type="submit">Login</button>
            </form>

            <form @submit.prevent="signup">
                <div class="title">Sign Up</div>
                <input
                class="input"
                placeholder="Username"
                type="text"
                v-model="username"
                />
                <br />
                <input placeholder="Password" type="password" v-model="password" />
                <br />
                <input placeholder="Email" type="text" v-model="email" />
                <br />
                <input placeholder="First name" type="text" v-model="first_name" />
                <br />
                <input placeholder="Last name" type="text" v-model="last_name" />
                <br />
                <button type="submit">Sign Up</button>
            </form>
        </div>
    </div>
</template>
  
<script>
    import typewriterVue from '../../components/typewriter.vue';
  // import { loginRest, signupRest } from "./api";
  
  export default {
    data() {
      return {
        username: "",
        password: "",
        email: "",
        first_name: "",
        last_name: "",
      };
    },
    components: {
        typewriterVue,
    },
    methods: {
      login() {
        // loginRest(this.username, this.password)
        //   .then((response) =>
        //     this.$emit("onAuth", { ...response.data, secret: this.password })
        //   )
        //   .catch((error) => console.log("Login error", error));
      },
      signup() {
        // signupRest(
        //   this.username,
        //   this.password,
        //   this.email,
        //   this.first_name,
        //   this.last_name
        // )
        //   .then((response) =>
        //     this.$emit("onAuth", { ...response.data, secret: this.password })
        //   )
        //   .catch((error) => console.log("Sign up error", error));
      },
    },
  };
</script>

<style scoped>

</style>