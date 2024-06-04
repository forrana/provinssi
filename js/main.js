const numbersListRaw = [
  {
    name: "Alku, tulirotuaali",
    participanst: "Kaikki",
    time: 0
  },
  {
    name: "Vannekoreo alku",
    participanst: "Pi, El, Ti, An",
    time: 130
  },
  {
    name: "Vannekoreo + Ruoska/Vannesoolo",
    participanst: "Pi, El, Ti, An, Si",
    time: 160
  },
  {
    name: "2 Vanteella",
    participanst: "An, Si",
    time: 255
  },
  {
    name: "Dragonkoreo alku",
    participanst: "Al, Ti",
    time: 315
  },
  {
    name: "Dragonkoreo",
    participanst: "Al, Ti",
    time: 330
  },
  {
    name: "Muokarisoolo",
    participanst: "An",
    time: 480
  },
  {
    name: "Miekkakoreo",
    participanst: "Si/Pi, An, Ti, Al",
    time: 600
  },
  {
    name: "Hyppikset",
    participanst: "kaikki",
    time: 705
  },
  {
    name: "Kontaktikeppisoolo",
    participanst: "An",
    time: 810
  },
  {
    name: "Snakekoreo",
    participanst: "Pi/Si, Al, El, An, Ti",
    time: 880
  },
  {
    name: "Keppibalanssi",
    participanst: "An",
    time: 960
  },
  {
    name: "Fanit",
    participanst: "Pi/Si, Ti, El, An",
    time: 1010
  },
  {
    name: "Komet keppi solo",
    participanst: "Al",
    time: 1110
  },
  {
    name: "Loppubileet",
    participanst: "Al",
    time: 1170
  }
]

const numbersListProcessed = numbersListRaw.map((element, index, array) => {
  element.totalTime = array[index+1] ? array[index+1].time  - element.time : 1324 - element.time;
  return element;
})

function secondsToMMSS(seconds) {
  return new Date(seconds * 1000).toISOString().substr(14, 5);
}

const EventHandling = {
  data() {
    return {
      currentTime: 0,
      isPaused: true,
      isRepeatMode: false,
      isLocked: false,
      timeDelta: 5,
      activeElementIndex: 0,
      isManualChangeInProcess: false,
      selectedForRepeat: null,
    }
  },
  watch: {
    activeElementIndex(newIndex, oldIndex) {
      if(this.isManualChangeInProcess) {
        this.isManualChangeInProcess = false;
        return;
      }

      if(this.isRepeatMode) {
        let selectedIndex = this.numbersList.findIndex(({name}) => this.selectedForRepeat.name == name)
        if(newIndex != selectedIndex) {
          this.setNumberTime(this.selectedForRepeat);
        }
      }
    }
  },
  methods: {
    setNumberTime(number, isManual) {
      let audioElement = this.$refs.audio;
      if(isManual) this.selectedForRepeat = number;
      audioElement.currentTime = number.time;
      this.isManualChangeInProcess = isManual;
      this.play(audioElement)
    },
    play(audioElement) {
      audioElement.play();
      this.isPaused = audioElement.paused;
      audioElement.addEventListener('timeupdate', () => {
        this.currentTime = audioElement.currentTime.toFixed();
        this.activeElementIndex = this.numbersList.findIndex(({time, totalTime}) => this.currentTime >= time && this.currentTime < time+totalTime+this.timeDelta)
      });
    },
    pause(audioElement) {
      audioElement.pause();
      this.isPaused = audioElement.paused;
    },
    playOrPause() {
      let audioElement = this.$refs.audio;
      audioElement.paused ? this.play(audioElement) : this.pause(audioElement);
    },
    toggleRepeat() {
      this.isRepeatMode = !this.isRepeatMode
    },
    toggleLock() {
      this.isLocked = !this.isLocked
    },
    totalTime(number) {
      let totalTime = number.totalTime;
      return secondsToMMSS(totalTime);
    }
  },
  computed: {
    numbersList() {
      return numbersListProcessed.map((element) => {
        element.time -= this.timeDelta;
        return element;
      })
    },
    timeLeft() {
      let startTime = this.numbersList[this.activeElementIndex].time + this.timeDelta;
      let totalTime = this.numbersList[this.activeElementIndex].totalTime;
      let timeLeft = startTime + totalTime - this.currentTime;
      return secondsToMMSS(timeLeft)
    }
  },
  created() {
    window.addEventListener('keyup', (e) => {
      if (e.code == 'Space') {
        this.playOrPause()
      }
    });
  }
}

Vue.createApp(EventHandling).mount('#app')
