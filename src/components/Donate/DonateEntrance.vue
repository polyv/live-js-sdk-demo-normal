<template>
  <button :class="{
            'donate-entrance':true,
            'mobile':isMobile
          }"
          data-type="donate-entrance"
          @click="handleDonate"></button>
</template>

<script>
import { mapState } from 'vuex';
import { DonateMessageHub, DonateMessageHubEvents } from './DonateMixin';

export default {
  name: 'DonateEntrance',
  computed: {
    ...mapState({
      isMobile: (state) => state.isMobile,
    }),
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
  methods: {
    handleDonate() {
      this.panelVisible = !this.panelVisible;
      DonateMessageHub.trigger(DonateMessageHubEvents.PANEL_VISIBLE_TOGGLE, {
        visible: this.panelVisible,
      });
    },
  },
  mounted() {
    if (!this.isMobile) {
      const $tabChatInputController = document
        .getElementById('tab-chat')
        .querySelector('.polyv-chat-input-main .polyv-chat-input-top');
      $tabChatInputController.appendChild(this.$el);
    } else {
      const $tabChatInputController = document
        .getElementById('tab-chat')
        .querySelector('.polyv-chat-input-main>div');
      $tabChatInputController.style.setProperty('padding-left', '60px');
      $tabChatInputController.appendChild(this.$el);
    }
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
