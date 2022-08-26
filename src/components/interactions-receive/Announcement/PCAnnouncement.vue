<template>
  <modal title="公告"
         :visible="isShowAnnouncement"
         :close-on-click-modal="false"
         @close="isShowAnnouncement = false">
    <!-- 公告组件主体 -->
    <announcement :announcement-sdk="announcementSdk"
                  @to-show="setAnnouncementVisible(true)"
                  @to-hide="setAnnouncementVisible(false)" />
  </modal>
</template>

<script>
import { Announcement as AnnouncementSDK } from '@polyv/interactions-receive-sdk';
import Announcement from '@polyv/interactions-receive-sdk-ui-default/lib/PcAnnouncement';

export default {
  components: {
    Announcement,
  },

  data() {
    return {
      // 公告SDK实例
      announcementSdk: null,
      // 是否显示公告
      isShowAnnouncement: false,
    };
  },

  created() {
    this.announcementSdk = new AnnouncementSDK();
  },

  beforeDestroy() {
    this.announcementSdk?.destroy();
    this.announcementSdk = null;
  },

  methods: {
    setAnnouncementVisible(visible) {
      this.isShowAnnouncement = visible;
    },
  },
};
</script>
