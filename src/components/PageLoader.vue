<template>
    <div class="page-loader" v-if="!isloaded">
      <div class="cube"></div>
      <div class="cube"></div>
      <div class="cube"></div>
      <div class="cube"></div>
    </div> 
  </template>
  
  <script>
    export default {
      data: () => {
        return {
          isloaded: false,
        }
      },
      methods: {
        setLoadedStatus(isLoaded) {
          this.isloaded = isLoaded;
        },
        delayAndSetLoadedStatus(delay) {
          setTimeout(() => {
            this.isloaded = true;
          }, delay);
        },
      },
    }
  </script>
  
  <style lang="scss" scoped>
     $colors: #fff, #ff8a00, #fff, #ff6a00;
  
    // -----------------------------------------------------

    .page-loader {
      display: flex;
      justify-content: center;
      align-items: center;
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 999;
      background-color: #292929;
      cursor: none;
    }
  
    // -----------------------------------------------------
  
    .cube{
      width: 40px;
      height: 40px;
      margin-right: 10px;
  
      @for $i from 1 through length($colors) {
        &:nth-child(#{$i}) {
          background-color: nth($colors, $i);
        }
      }
  
      &:first-child {
        animation: left 1s infinite;
      }
  
      &:last-child {
        animation: right 1s infinite .5s;
      }
    }
  
    // -----------------------------------------------------
  
    @keyframes left {
      40% {
        transform: translateX(-60px);
      }
      50% {
        transform: translateX(0);      
      }
    }
  
    @keyframes right {
      40% {
        transform: translateX(60px);
      }
      50% {
        transform: translateX(0);
      }
    }
  </style>