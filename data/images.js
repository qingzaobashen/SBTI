/**
 * 图片资源配置文件
 * 图片已上传至Supabase Storage
 */

const CDN_BASE_URL = 'https://uwgvflkueracnwgwdwpe.supabase.co/storage/v1/object/public/sbti-images/images/'

/**
 * 人格图片URL映射
 * 格式: { 人格代码: 图片URL }
 */
export const PERSONALITY_IMAGES = {
  'ATM-er': `${CDN_BASE_URL}/ATM-er.jpg`,
  'BOSS': `${CDN_BASE_URL}/BOSS.jpg`,
  'CTRL': `${CDN_BASE_URL}/CTRL.jpg`,
  'DEAD': `${CDN_BASE_URL}/DEAD.jpg`,
  'DRUNK': `${CDN_BASE_URL}/DRUNK.jpg`,
  'Dior-s': `${CDN_BASE_URL}/Dior-s.jpg`,
  'FAKE': `${CDN_BASE_URL}/FAKE.jpg`,
  'FUCK': `${CDN_BASE_URL}/FUCK.jpg`,
  'GOGO': `${CDN_BASE_URL}/GOGO.jpg`,
  'HHHH': `${CDN_BASE_URL}/HHHH.jpg`,
  'IMFW': `${CDN_BASE_URL}/IMFW.jpg`,
  'IMSB': `${CDN_BASE_URL}/IMSB.jpg`,
  'JOKE-R': `${CDN_BASE_URL}/JOKE-R.jpg`,
  'LOVE-R': `${CDN_BASE_URL}/LOVE-R.jpg`,
  'MALO': `${CDN_BASE_URL}/MALO.jpg`,
  'MONK': `${CDN_BASE_URL}/MONK.jpg`,
  'MUM': `${CDN_BASE_URL}/MUM.jpg`,
  'OH-NO': `${CDN_BASE_URL}/OH-NO.jpg`,
  'OJBK': `${CDN_BASE_URL}/OJBK.jpg`,
  'POOR': `${CDN_BASE_URL}/POOR.jpg`,
  'SEXY': `${CDN_BASE_URL}/SEXY.jpg`,
  'SHIT': `${CDN_BASE_URL}/SHIT.jpg`,
  'SOLO': `${CDN_BASE_URL}/SOLO.jpg`,
  'THAN-K': `${CDN_BASE_URL}/THAN-K.jpg`,
  'THIN-K': `${CDN_BASE_URL}/THIN-K.jpg`,
  'WOC': `${CDN_BASE_URL}/WOC.jpg`,
  'ZZZZ': `${CDN_BASE_URL}/ZZZZ.jpg`
}

/**
 * 获取人格图片URL
 * @param {string} code - 人格代码
 * @returns {string|null} - 图片URL或null
 */
export function getPersonalityImageUrl(code) {
  return PERSONALITY_IMAGES[code] || null
}

/**
 * 检查人格是否有对应图片
 * @param {string} code - 人格代码
 * @returns {boolean}
 */
export function hasPersonalityImage(code) {
  return !!PERSONALITY_IMAGES[code]
}
