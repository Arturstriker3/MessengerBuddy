<template>
  <Story>
    <div class="page-loader" v-if="!isloaded">
      <div class="cube"></div>
      <div class="cube"></div>
      <div class="cube"></div>
      <div class="cube"></div>
    </div>
  </Story> 
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
     $colors: #8CC271, #69BEEB, #F5AA39, #E9643B;
  
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
      background: linear-gradient(
            180deg,
            rgba(117, 84, 160, 1) 7%,
            rgba(117, 84, 160, 1) 17%,
            rgba(106, 95, 168, 1) 29%,
            rgba(99, 103, 174, 1) 44%,
            rgba(87, 116, 184, 1) 66%,
            rgba(70, 135, 198, 1) 83%,
            rgba(44, 163, 219, 1) 96%,
            rgba(22, 188, 237, 1) 100%
        );
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