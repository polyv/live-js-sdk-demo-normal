/**
 * @file 用于移动端侧边栏操作的工具组件
 */

import './index.scss';

const getMicBtnTemplate = () => {
  const template = `
    <div class="rtc-toolkit rtc-toolkit-hide-border rtc-toolkit-switch-hide">
      <div class="rtc-toolkit-layout js-toolkitLayout">
        <span class="rtc-toolkit-oo" data-mic="sliderOn"></span>
        <span class="rtc-toolkit-apply" data-mic="applyAndStop"></span>
        <div class="rtc-toolkit-text js-text" data-lang-type></div>
        <div class="rtc-toolkit-control">
          <span class="rtc-toolkit-cam" data-mic="camera"></span>
          <span class="rtc-toolkit-switch" data-mic="switch"></span>
          <span class="rtc-toolkit-mic" data-mic="mic"></span>
        </div>
        <span class="rtc-toolkit-oc"><span data-mic="sliderOff"></span></span>
        <div class="rtc-toolkit-position js-toolkitPosition"></div>
      </div>
    </div>
  `.trim();
  const frag = document.createRange().createContextualFragment(template);
  return frag.firstChild;
};

function initSlider($touch) {
  const $body = document.getElementsByTagName('body')[0];
  let touchH = $body.clientHeight;
  let offsetT, pageY;
  let moveEvent;

  const endEvent = () => {
    if (moveEvent) {
      $body.removeEventListener('touchmove', moveEvent);
      moveEvent = undefined;
    }

    $body.removeEventListener('touchend', endEvent);
  };

  const setTopCSS = (top) => {
    if (top < 0) top = 0;
    $touch.style.top = top + 'px';
  };

  $touch.addEventListener('touchstart', (event) => {
    endEvent();
    offsetT = $touch.offsetTop;
    touchH = $body.clientHeight - $touch.clientHeight;
    pageY = event.touches[0].pageY;
    const innerT = pageY - offsetT;
    moveEvent = (event) => {
      pageY = event.touches[0].pageY - innerT;
      setTopCSS(pageY > touchH ? touchH : pageY);
    };
    $body.addEventListener('touchmove', moveEvent);

    $body.addEventListener('touchend', endEvent);
  });

}

export default function(callback, getlang) {
  const rtcToolkit = getMicBtnTemplate();
  const cancelClass = 'rtc-toolkit-cancel';
  const successClass = 'rtc-toolkit-success';
  const camOffClass = 'rtc-toolkit-cam-off';
  const micOffClass = 'rtc-toolkit-mic-off';
  const switchOffClass = 'rtc-toolkit-switch-off';
  const hideSwitchClass = 'rtc-toolkit-switch-hide';
  const sliderOffClass = 'rtc-toolkit-slider-off';
  const hideVideoClass = 'rtc-toolkit-video-off';
  const hideBorderClass = 'rtc-toolkit-hide-border';
  document.getElementsByTagName('body')[0].appendChild(rtcToolkit);
  initSlider(rtcToolkit);
  const $text = rtcToolkit.querySelector('.js-text');
  const $position = rtcToolkit.querySelector('.js-toolkitPosition');
  const getWidth = () => $position.offsetLeft + 16 + 'px';
  const updateText = (type) => {
    $text.textContent = getlang(type);
    $text.setAttribute('data-lang-type', type);
  };

  const resetText = () => {
    updateText($text.getAttribute('data-lang-type'));
  };

  const cancel = () => {
    rtcToolkit.classList.remove(cancelClass, successClass, micOffClass, camOffClass);
    updateText('apply');
  };
  let hideTimeout;

  const clear = () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = undefined;
    }
  };
  const restRight = () => {
    rtcToolkit.classList.remove(sliderOffClass);
    rtcToolkit.style.width = getWidth();
  };

  const sliderOff = () => {
    clear();
    rtcToolkit.classList.add(sliderOffClass);
    rtcToolkit.style.width = '49px';
  };

  const setHideTimeout = () => {
    clear();

    hideTimeout = setTimeout(() => {
      hideTimeout = undefined;
      sliderOff();
    }, 5000);
  };

  rtcToolkit.addEventListener('click', (event) => {
    const type = event.target.getAttribute('data-mic');
    if (type && callback) {
      callback(type);
    }
  });

  updateText('apply');

  return {
    el: rtcToolkit,
    apply: () => {
      rtcToolkit.classList.add(cancelClass);
      rtcToolkit.classList.remove(successClass);
      updateText('calling');
      clear();
      restRight();
      // setHideTimeout();
    },
    cancel: () => {
      cancel();
      restRight();
      setHideTimeout();
    },
    success: (type, facingMode = false) => {
      rtcToolkit.classList.remove(cancelClass);
      rtcToolkit.classList.add(successClass);
      if (type === 'audio') {
        rtcToolkit.classList.add(hideVideoClass);
      } else if (type === 'video' && facingMode) {
        rtcToolkit.classList.remove(hideSwitchClass);
      }
      restRight();
      setHideTimeout();
    },
    sliderOff: () => {
      sliderOff();
    },
    sliderOn: () => {
      restRight();
    },
    show: () => {
      rtcToolkit.classList.remove(hideBorderClass);
      restRight();
      setHideTimeout();
    },
    hide: () => {
      clear();
      cancel();
      rtcToolkit.classList.remove(hideVideoClass);
      rtcToolkit.classList.add(hideBorderClass);
      rtcToolkit.style.width = '0px';
    },
    toggleCamera: (mute) => {
      if (mute) {
        rtcToolkit.classList.add(camOffClass);
        rtcToolkit.classList.add(switchOffClass);
      } else {
        rtcToolkit.classList.remove(camOffClass);
        rtcToolkit.classList.remove(switchOffClass);
      }
    },
    toggleMic: (mute) => {
      if (mute) {
        rtcToolkit.classList.add(micOffClass);
      } else {
        rtcToolkit.classList.remove(micOffClass);
      }
    },
    remove: () => {
      clear();
      document.getElementsByTagName('body')[0].removeChild(rtcToolkit);
    },
    updateLang: () => {
      resetText();
    },
    setTop: (top) => {
      if (typeof top !== 'number') { return; }
      rtcToolkit.style.top = `${top}px`;
    },
  };
}
