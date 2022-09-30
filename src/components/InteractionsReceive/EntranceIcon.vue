<template functional>
  <div class="c-interactive-entrance-btn pws-interaction-entrance"
       @click="props.open">
    <span v-if="props.icon"
          class="c-interactive-entrance-btn-icon"
          :style="`background: url(${props.icon})`"></span>
    <span>{{ props.name }}</span>
  </div>
</template>

<script>
export default {
  name: 'EntranceIcon',
  props: {
    name: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
    open: {
      type: Function,
      default: () => {},
    },
  },
};
</script>

<style lang="scss" scoped>
.c-interactive-entrance-btn {
  height: 28px;
  line-height: 28px;
  padding: 0 10px;
  white-space: nowrap;
  color: #FFFFFF;
  text-align: center;
  margin-right: 8px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: mix(#000000, rgba(#fff, 0.1), 1);
  border-radius: 14px;
  &:nth-last-child(1) {
    margin-right: 0;
  }
  &:hover {
    background-color: mix(#000000, rgba(#fff, 0.2), 1);
  }
}
.c-interactive-entrance-btn-icon {
  width: 16px;
  height: 16px;
  display: inline-block;
  line-height: 31px;
  margin-right: 4px;
  background-position: center !important;
  background-size: contain !important;
}
</style>
