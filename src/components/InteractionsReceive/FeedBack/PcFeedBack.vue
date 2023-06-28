<template>
  <div>
    <modal ref="modal"
           class="polyv-feed-back-modal"
           :visible="isShowFeedBack"
           :modal-style="modalStyle"
           :title="feedBackTitle"
           @close="onCloseModal">
      <feedBack :feed-back-sdk="feedBackSdk"
                :is-show-feed-back="isShowFeedBack"
                @to-show="onSetFeedBackVisible(true)"
                @to-hide="onSetFeedBackVisible(false)" />
    </modal>
  </div>
</template>

<script>
import FeedBack from '@polyv/interactions-receive-sdk-ui-default/lib/PcFeedBack';
import Modal from '@/components/Base/Modal';
import mixin from './mixin';

export default {
  name: 'PC-FeedBack',
  components: {
    Modal,
    FeedBack
  },
  mixins: [mixin],

  data() {
    return {
      modalStyle: {
        width: '558px',
        'min-height': '178px',
        boxShadow: '0px 2px 8px 0px rgba(0, 0, 0, 0.15)'
      }
    };
  },
};
</script>
<style lang="scss">
.polyv-feed-back-modal .c-draggable-modal__hide__head--line {
  border-bottom: 1px solid #ECEFF1;
}
.polyv-feed-back-modal .plv-iar-pc-feed-back-default__footer {
  border-top: 1px solid #ECEFF1;
}
</style>
