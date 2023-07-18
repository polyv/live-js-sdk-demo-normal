import PolyvLive from '@/sdk/live';

export const usePlayerAction = () => {
  function __getPlayer() {
    const liveSdk = PolyvLive.getInstance().liveSdk;
    return liveSdk.player;
  }

  /**
   * 获取播放器当前进度
   * @desc 兼容时移处理
   */
  function getCurrentTime() {
    const player = __getPlayer();
    if (player.getSupportTimeShift()) {
      const timeShiftLiveMode = player.getLiveMode() === 'timeShift';
      return timeShiftLiveMode ? player.getTimeShiftCurrentTime() : getDurationTime();
    }

    return player.currentTime;
  }

  /**
   * 获取播放器总的播放时长
   * @desc 兼容时移处理
   */
  function getDurationTime() {
    const player = __getPlayer();
    if (player.getSupportTimeShift()) {
      return player.getTotalDuration();
    }

    return player.duration;
  }

  /**
   * 请求到指定播放进度，单位：秒
   * @desc 兼容时移处理
   */
  function toSeekVideo(time) {
    const player = __getPlayer();

    if (player.getSupportTimeShift()) {
      const returnLive = time === -1;
      player.timeShiftTo({ start: returnLive ? undefined : time });
      return;
    }

    player.seek(time);
  }

  return {
    getCurrentTime,
    getDurationTime,
    toSeekVideo
  };
};
