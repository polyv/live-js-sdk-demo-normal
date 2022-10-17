<template>
  <!-- 积分记录弹窗 -->
  <section>
    <li ref="point-record-entrance"
        @click="setPonitRecordPanelVisible(true)">
      <span class="polyv-input-more-icon ponit-record-icon"
            data-status="false"></span>
      <span>积分</span>
    </li>
    <modal :visible="pointRecordPanelVisible"
           title="积分记录"
           @close="setPonitRecordPanelVisible(false)"
           class="mobile-point-record-modal">
      <MobilePointRERecord :visible="pointRecordPanelVisible"
                           :red-envelope-sdk="redEnvelopeSdk"
                           unit="点" />
    </modal>
  </section>
</template>

<script>
import { RedEnvelope } from '@polyv/interactions-receive-sdk';
import MobilePointRERecord from '@polyv/interactions-receive-sdk-ui-default/lib/MobilePointRERecord';
import { RedEnvelopeMessageHub, RedEnvelopeMessageHubEvents } from './mixin';

export default {
  components: {
    MobilePointRERecord,
  },
  data() {
    return {
      // 红包 SDK 实例
      redEnvelopeSdk: null,
      pointRecordPanelVisible: false,
    };
  },
  created() {
    this.redEnvelopeSdk = new RedEnvelope();
    RedEnvelopeMessageHub.on(
      RedEnvelopeMessageHubEvents.POINT_RECORD_SHOW,
      () => {
        this.setPonitRecordPanelVisible(true);
      }
    );
  },
  mounted() {
    this.customMountEl();
  },
  methods: {
    customMountEl() {
      const $morePanel = document.querySelector('.polyv-more-control-list');
      const $li = this.$refs['point-record-entrance'];
      $morePanel.appendChild($li);
    },
    setPonitRecordPanelVisible(visible) {
      this.pointRecordPanelVisible = visible;
    },
  },
};
</script>

<style lang="scss">
.ponit-record-icon {
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAMAAADVRocKAAAAxlBMVEUAAAD/VFT/W1v/XV3/U1P/U1P/U1P/VFT/U1P/U1P/VFT/VFT/VFT/VVX/VVX/VFT/VFT/VFT/VFT/VFT/VFT/VVX/U1P/VFT/VFT/VFT/WFj/WVn/VFT/U1P/////+Pj/4+P/fn7/ZWX/Wlr/n5//lpb/hIT/Xl7/Vlb/eXn/+vr/8/P/v7//s7P/p6f/cnL/6en/3t7/2dn/09P/ycn/xMT/trb/q6v/iIj/aWn/7e3/z8//r6//nJz/kpL/u7v/bW3/a2v0JawSAAAAHXRSTlMA+Q4D7P7d09DDqY5jSzT888mdgltaWU9GOiAU7R/bK64AAAPoSURBVGjezZppd5pQEIYBQQW3xGibNH1BEFBx3zUuSf//n2qrp8ZthqvAaZ6PLu893Blm5s5cSQylWHky9ExalWU1ndGNp0pRkeJCKeSyGi7QsrmCEoN6Xi+BpKTno61RMGSEIBuFe9VT1QyEyFRT98jn0xAmnb95iZcsbiL7cpP8a1nDjWjlV3H97z9xB+p30d3P4U5yQpb48Yi7efwRrl9UEQG1GKb//IBIPDzz+t9kRET+xupriIzGrPAsIwbkZ9K+D4iFhyLhnypiQr3qralHxMbjtTcuhxjJXYk/iJXvF/HzJ2JFPY+tZfA4vvs+Hg7aQdAeDMfvru+Ap3yWXzTQ1P1ZzbygNvProNFeTjyIyV+/um2ToN39xeS4Y0/Kg2I5MVkmS1Dkjx6Ayu/NnmWGYPWaVCXw+QhVavPHpgBjyhTVwwJE/dMYmUKMGkS9dKjfcJ2OKUiHEChIewxcxTaFaeEqxl5fIbLA1BRmSmQGhfXRmilMjfVUHdexTGEsQkLf7VApuScoKYwPYW0KswZBgUs0jiW8Qw6XeOg455mCeHTEkySFCdQ9Mf0eE7QVqQgGzxLYHw8MRakCjv44NNT1wVGRnkBi//3vYsTGuQWAvg2SJ8mgM+WgvYsxrdnbdfW32f779oDOnYakcyYO9tmk2dp0amevVmfT2n/XCzgz61IGFMOd0OKQHVqLrTufzebudtE6ZIDFbuEhKDJSGuBj0dCrk5voDQ+xiCAtqaAYHBxx4jm4wPEmBycegEKVZFBMTgw66W3tZaMO1BtLe9ubnBh+AgqZWWBhCrNgFlBBshLVX4FEZYwMZyCmP3DAGDkDGqcmlG0c0GQkHQyNjkDN0gCDLhlgsUMeomaDxeCCXdfHH/wVY939L7pcsKvQodoMtvsK211ZV/LAyt1X1tvA7NPhmkk4naMNrtub2fgt2EsHb+PZxq4fmanDJBxFA1e2tN0mPmk2HKdx8oHb3lmCTplM0rf+HWM+QPDRbYcEuyxXtow+XWVt1y8iqb3+dLARV7YUSCc69cfp3PNb/Y+Pfsv35tNT7+1yhZdSSq7wKilc8YuNKcgGBHrIEXMupj8POWgqdEpwg3D5wAXAHkC4cNQfhZ4A+yAxDodABq/GxjoPDAX2GHvAnlqE80xtcGSODuI8TXs9tM7Eh2u7CZ4q0UogWPruvPs+nb53566/RDjpFNsMiU6ebedEJ5viGlLR0V7Yllp0yudNQRWxor4m3dZMujGbeGs56eZ40u39pAcUSY9Ykh4SJT3mSnpQ9/9HjdGGpV9j3Hv3wPorjdzvuDTw9a493HBx4ytfPUn+8kz06z+/AYjjRU6iKjQHAAAAAElFTkSuQmCC);
}
</style>
