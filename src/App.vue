<script setup>
    import Authpage from "./views/ChatApp.vue"
</script>

<template>       
    <Authpage/>
</template>

<script>
export default {
    data() {
        return {
            user: undefined,
        };
    },
    methods: {
        handleAuth(user){
            this.user = user;
        },
    },
};
</script>