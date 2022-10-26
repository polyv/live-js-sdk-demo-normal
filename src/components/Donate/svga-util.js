// 地址目录
const BASE_URL = 'https://s1.videocc.net/default-img/donate-svga';

// 目前可用的打赏动效
const svgas = {
  coffee: 'coffee.svga',
  like: 'like.svga',
  handclap: 'handclap.svga',
  666: '666.svga',
  star: 'star.svga',
  diamond: 'diamond.svga',
  car: 'car.svga',
  rocket: 'rocket.svga',
  bear: 'bear.svga',
  crown: 'crown.svga',
  cup: 'cup.svga',
  microphone: 'microphone.svga',
  villa: 'villa.svga',
};

/**
 * 获取 SVGA 地址
 * @param {string} gimg 打赏道具图片地址
 */
export function getSvgaUrl(gimg) {
  if (!gimg) return '';
  const pathname = gimg.split('/');
  const key = pathname[pathname.length - 1].split('.')[0];
  const svgaFileName = svgas[key];
  return svgaFileName ? BASE_URL + '/' + svgaFileName : '';
}
