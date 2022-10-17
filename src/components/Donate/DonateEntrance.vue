<template>
  <button :class="{
            'donate-entrance':true,
            'mobile':isMobile
          }"
          data-type="donate-entrance"
          @click="handleDonate"></button>
</template>

<script>
import { DonateMessageHub, DonateMessageHubEvents } from './DonateMixin';

export default {
  name: 'DonateEntrance',
  props: {
    isMobile: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      panelVisible: false,
    };
  },
  created() {
    window.handleDonate = this.handleDonate;
    DonateMessageHub.on(DonateMessageHubEvents.PANEL_CLOSE, () => {
      this.handleDonate();
    });
  },
  mounted() {
    if (this.isMobile) {
      this.customMountEl_Mobile();
    } else {
      this.customMountEl_PC();
    }
  },
  methods: {
    customMountEl_PC() {
      const $tabChatInputController = document
        .getElementById('tab-chat')
        .querySelector('.polyv-chat-input-main>div');
      $tabChatInputController.style.setProperty('padding-left', '60px');
      $tabChatInputController.appendChild(this.$el);
    },
    customMountEl_Mobile() {
      const $tabChatInputController = document
        .getElementById('tab-chat')
        .querySelector('.polyv-chat-input-main .polyv-chat-input-top');
      $tabChatInputController.appendChild(this.$el);
    },
    handleDonate() {
      this.panelVisible = !this.panelVisible;
      DonateMessageHub.trigger(DonateMessageHubEvents.PANEL_VISIBLE_TOGGLE, {
        visible: this.panelVisible,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.donate-entrance {
  margin-top: -2px;
  width: 22px;
  height: 22px;

  vertical-align: top;

  background-color: transparent;
  background-image: url(./imgs/icon-reward.png);
  background-position: center;
  background-size: 100%;
  cursor: pointer;

  &:hover {
    animation: scale .35s ease-in;
  }
  &:active {
    transition: all .05s ease-in;
    transform: scale(1.2);
  }

  &.mobile {
    position: absolute;
    margin: 0;
    left: 28px;
    top: 4px;
    width: 24px;
    height: 24px;
  }
}
</style>
