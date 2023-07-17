<template>
  <section v-if="visible"
           class="pc-mini-tool">
    <div class="tool-entrance"
         @click="handleMainPanelVisible">
      小工具<span class="tool-entrance__close">x</span>
    </div>
    <div v-show="mainPanelVisible"
         class="tool-main">
      <div class="tool-list">
        <div class="tool-list">
          <button class="tool-btn"
                  @click="getPlayBackList">
            获取回放列表
          </button>
          <div class="tool-input-group">
            <input v-model="toolLists.chatMessage"
                   placeholder="" />
            <button class="tool-btn"
                    @click="sendChat">
              发送聊天信息
            </button>
          </div>
          <div class="tool-input-group">
            <input v-model="toolLists.customMessage"
                   placeholder="" />
            <button class="tool-btn"
                    @click="sendCustomMessage">
              发送自定义消息
            </button>
          </div>
          <button class="tool-btn"
                  @click="getHistory">
            获取历史聊天记录
          </button>
          <button class="tool-btn"
                  @click="pausePlay">
            暂停播放
          </button>
          <button class="tool-btn"
                  @click="resumePlay">
            恢复播放
          </button>
          <button class="tool-btn"
                  @click="togglePlay">
            toggle播放
          </button>
          <div class="tool-input-group">
            <input v-model="toolLists.toolSeek"
                   placeholder="输入数字(单位秒)" />
            <button class="tool-btn"
                    @click="redirectByToolSeek">
              跳转
            </button>
          </div>
          <div class="tool-input-group">
            <input v-model="toolLists.switchVid"
                   placeholder="输入vid" />
            <button class="tool-btn"
                    @click="toolSwitchVod">
              切换回放(回放模式才有效)
            </button>
          </div>
          <div class="tool-input-group">
            <input v-model="toolLists.questionMessage"
                   placeholder="" />
            <button class="tool-btn"
                    @click="sendQuestion">
              发送问答私聊
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import PolyvLive, {
  plvLiveMessageHub,
  PlvLiveMessageHubEvents,
} from '@/sdk/live';

export default {
  name: 'PC-Mini-Tool',
  data() {
    return {
      visible: false,
      mainPanelVisible: false,
      toolLists: {
        chatMessage: '',
        customMessage: '',
        toolSeek: '',
        switchVid: '',
        questionMessage: '',
      },
    };
  },
  created() {
    plvLiveMessageHub.on(PlvLiveMessageHubEvents.PLAYER_INIT, () => {
      this.visible = true;
    });
  },
  methods: {
    handleMainPanelVisible() {
      this.mainPanelVisible = !this.mainPanelVisible;
    },
    /** 获取回放列表 */
    getPlayBackList() {
      const plive = PolyvLive.getInstance();
      plive.liveSdk
        .getPlaybackLists(1, 10)
        .then((data) => {
          console.info(data);
        })
        .catch((err) => {
          console.error(err);
        });
    },
    /** 发送聊天信息 */
    sendChat() {
      const plive = PolyvLive.getInstance();
      const value = this.toolLists.chatMessage;
      plive.liveSdk.send(value);
      console.info('发送信息(webscoket可见):' + value);
      this.toolLists.chatMessage = '';
    },
    /** 发送自定义消息 */
    sendCustomMessage() {
      const PolyvLiveSdk = window.PolyvLiveSdk;
      const plive = PolyvLive.getInstance();
      const message = this.toolLists.customMessage;

      plive.liveSdk.once(PolyvLiveSdk.EVENTS.CUSTOM_MESSAGE, (event, data) => {
        console.info('监听自定义消息', event, data);
      });
      plive.liveSdk.sendCustomMessage({
        EVENT: 'customMsg',
        version: '1.0',
        data: {
          // 自定义消息内容
          message,
        },
      });
      console.info('发送自定义信息(webscoket可见):' + message);
      this.toolLists.customMessage = '';
    },
    /** 获取历史聊天记录 */
    getHistory() {
      const PolyvLiveSdk = window.PolyvLiveSdk;
      const plive = PolyvLive.getInstance();

      plive.liveSdk.once(PolyvLiveSdk.EVENTS.HISTORY_MESSAGE, (event, data) => {
        console.info('历史聊天记录数据');
        console.info(data);
      });
      plive.liveSdk.getHistoryMessage();
    },
    /** 暂停播放 */
    pausePlay() {
      const plive = PolyvLive.getInstance();
      plive.liveSdk.player.pause();
    },
    /** 恢复播放 */
    resumePlay() {
      const plive = PolyvLive.getInstance();
      plive.liveSdk.player.play();
    },
    /** toggle播放 */
    togglePlay() {
      const plive = PolyvLive.getInstance();
      plive.liveSdk.player.togglePlay();
    },
    /** 根据输入数字(秒数)进行跳转 */
    redirectByToolSeek() {
      const plive = PolyvLive.getInstance();
      const value = this.toolLists.toolSeek;

      plive.liveSdk.player.seek(value);
      this.toolLists.toolSeek = '';
    },
    /** 切换回放(回放模式才有效) */
    toolSwitchVod() {
      const plive = PolyvLive.getInstance();
      const value = this.toolLists.switchVid;

      plive.liveSdk.switchVod({
        vid: value,
      });
      console.info('切换回放:' + value);
    },
    /** 发送问答私聊 */
    sendQuestion() {
      const plive = PolyvLive.getInstance();
      const value = this.toolLists.questionMessage;

      plive.liveSdk.sendQuestion(value);
      console.info('发送私聊:' + value);
      this.toolLists.questionMessage = '';
    },
  },
};
</script>

<style lang="scss" >
.tool-entrance {
  position: absolute;
  z-index: 99;
  top: 0;
  left: -30px;
  bottom: 0;
  margin: auto;
  display: inline-block;
  width: 30px;
  height: 85px;
  padding: 5px;
  background: #333;
  text-align: center;
  color: #fff;
  cursor: pointer;
  user-select: none;
}

.tool-main {
  position: absolute;
  z-index: 9999;
  top: 0;
  width: 100%;
  height: 100%;
  background: #ccc;
}
.tool-input-group > input {
  width: 40%;
}
.tool-input-group > button {
  width: 50%;
}

.tool-btn {
  box-sizing: border-box;
  margin: 5px;
}
</style>
