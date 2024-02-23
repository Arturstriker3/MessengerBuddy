<template>
    <div class="typewriter">
      <div class="container-tw">
        <h1>Messenger
            <span class="typed-text">{{ typeValue }}</span>
            <span class="cursor" :class="{'typing': typeStatus}">&nbsp;</span>
        </h1>
      </div>
    </div>
</template>
  
<script>
    export default {
        data: () => {
            return {
                typeValue: "",
                typeStatus: false,
                typeArray: ["Buddy", "...", "Buddy", "..."],
                typingSpeed: 100,
                erasingSpeed: 150,
                newTextDelay: 2000,
                typeArrayIndex: 0,
                charIndex: 0,

            }
        },
        methods: {
            typeText() {
                if(this.charIndex < this.typeArray[this.typeArrayIndex].length) {
                    if(!this.typeStatus)
                        this.typeStatus = true;

                    this.typeValue += this.typeArray[this.typeArrayIndex].charAt(this.charIndex)
                    this.charIndex += 1

                    setTimeout(this.typeText, this.typingSpeed);
                }
                else {
                    this.typeStatus = false
                    setTimeout(this.eraseText, this.newTextDelay)
                }
            },
            eraseText() {
                if(this.charIndex > 0){
                    if(!this.typeStatus)
                        this.typeStatus = true;

                    this.typeValue = this.typeArray[this.typeArrayIndex].substring(0, this.charIndex -1);
                    this.charIndex -= 1;
                    setTimeout(this.eraseText, this.erasingSpeed);
                }
                else {
                    this.typeStatus = false;
                    this.typeArrayIndex += 1;
                    if(this.typeArrayIndex >= this.typeArray.length){
                        this.typeArrayIndex = 0
                    }
                    setTimeout(this.typeText, this.typingSpeed + 1000);
                }
            }
        },
        created() {
            setTimeout(this.typeText, this.newTextDelay + 200)
        }

    }
</script>
  
<style scoped>
  .container-tw {
    width: 100%;
    height: 100%;
    display: flex;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .container-tw h1 {
    font-size: 6.5vh;
    font-weight: 600;
    text-align: center;
}

  
  span.cursor {
    display: inline-block;
    margin-left: 3px;
    width: 4px;
    background-color: #fff;
    animation: cursorBlink 1s infinite;
  }

  span {
    color: #ff8a00;
  }

  @keyframes cursorBlink {
    49% { background-color: #fff;}
    50% {backdrop-color: transparent;}
    99% {backdrop-color: transparent;}
  }
</style>
  