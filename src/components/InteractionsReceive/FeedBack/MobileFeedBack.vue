<template>
  <div>
    <popup :title="feedBackTitle"
           :visible="isShowFeedBack"
           @close="onCloseModal"
           fit-left-height>
      <feed-back :feed-back-sdk="feedBackSdk"
                 :is-show-feed-back="isShowFeedBack"
                 @to-show="onSetFeedBackVisible(true)"
                 @to-hide="onSetFeedBackVisible(false)" />
    </popup>
  </div>
</template>

<script>
import FeedBack from '@polyv/interactions-receive-sdk-ui-default/lib/MobileFeedBack';
import Popup from '@/components/Base/Popup';
import mixin from './mixin';

export default {
  name: 'Mobile-FeedBack',
  components: {
    Popup,
    FeedBack
  },
  mixins: [mixin]
};
</script>
