/**
 * 卡片预览渲染 - 生成最终的人格卡图片
 */

/**
 * 创建卡片预览渲染器
 * @param {HTMLCanvasElement} canvas - 预览画布
 * @returns {Object} 渲染器实例
 */
export function createCardPreview(canvas) {
  const ctx = canvas.getContext('2d')
  const width = 800
  const height = 1200

  canvas.width = width
  canvas.height = height

  const colors = {
    bg: '#f0f4f1',
    cardBg: '#ffffff',
    text: '#2c3e2d',
    textSecondary: '#6b7b6e',
    accent: '#4c6752',
    accentLight: '#e8f0ea',
  }

  const imageCache = new Map()

  /**
   * 加载图片
   * @param {string} src - 图片路径
   * @returns {Promise<HTMLImageElement>}
   */
  function loadImage(src) {
    if (!src) return Promise.resolve(null)
    if (imageCache.has(src)) {
      return Promise.resolve(imageCache.get(src))
    }
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        imageCache.set(src, img)
        resolve(img)
      }
      img.onerror = () => resolve(null)
      img.src = src
    })
  }

  /**
   * 绘制圆角矩形
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   * @param {number} r
   */
  function roundRect(x, y, w, h, r) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  /**
   * 绘制文本自动换行
   * @param {string} text
   * @param {number} x
   * @param {number} y
   * @param {number} maxWidth
   * @param {number} lineHeight
   */
  function wrapText(text, x, y, maxWidth, lineHeight) {
    const chars = text.split('')
    let line = ''
    let currentY = y

    for (let i = 0; i < chars.length; i++) {
      const testLine = line + chars[i]
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, x, currentY)
        line = chars[i]
        currentY += lineHeight
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, x, currentY)
    return currentY + lineHeight
  }

  /**
   * 渲染卡片
   * @param {Object} data - 卡片数据
   */
  async function render(data) {
    const { avatar, text, testInfo } = data

    ctx.fillStyle = colors.bg
    ctx.fillRect(0, 0, width, height)

    roundRect(40, 40, width - 80, height - 80, 24)
    ctx.fillStyle = colors.cardBg
    ctx.fill()

    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
    ctx.shadowBlur = 20
    ctx.shadowOffsetY = 4
    roundRect(40, 40, width - 80, height - 80, 24)
    ctx.fill()
    ctx.shadowColor = 'transparent'

    const avatarX = (width - 200) / 2
    const avatarY = 80
    const avatarSize = 200

    roundRect(avatarX, avatarY, avatarSize, avatarSize * 1.5, 16)
    ctx.fillStyle = '#f8faf8'
    ctx.fill()

    try {
      if (avatar && avatar.body && avatar.body.image) {
        const bodyImg = await loadImage(avatar.body.image)
        if (bodyImg) {
          ctx.drawImage(bodyImg, avatarX, avatarY, avatarSize, avatarSize * 1.5)
        }
      }

      if (avatar && avatar.head && avatar.head.image && avatar.body) {
        const headImg = await loadImage(avatar.head.image)
        if (headImg) {
          const slot = avatar.body.headSlot
          const headSize = 60
          const scale = avatarSize / 200
          ctx.drawImage(
            headImg,
            avatarX + slot.x * scale - headSize / 2,
            avatarY + slot.y * scale,
            headSize,
            headSize
          )
        }
      }

      if (avatar && avatar.hand && avatar.hand.image && avatar.body) {
        const handImg = await loadImage(avatar.hand.image)
        if (handImg) {
          const slot = avatar.body.handSlot
          const handSize = 50
          const scale = avatarSize / 200
          ctx.drawImage(
            handImg,
            avatarX + slot.x * scale,
            avatarY + slot.y * scale,
            handSize,
            handSize
          )
        }
      }
    } catch (err) {
      console.warn('形象渲染失败:', err)
    }

    const textStartY = avatarY + avatarSize * 1.5 + 40

    ctx.fillStyle = colors.accent
    ctx.font = 'bold 48px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(text.code || 'TYPE', width / 2, textStartY)

    ctx.fillStyle = colors.text
    ctx.font = 'bold 36px system-ui, sans-serif'
    ctx.fillText(text.name || '人格类型', width / 2, textStartY + 50)

    if (text.intro) {
      ctx.fillStyle = colors.textSecondary
      ctx.font = '24px system-ui, sans-serif'
      ctx.fillText(text.intro, width / 2, textStartY + 95)
    }

    ctx.strokeStyle = colors.accentLight
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(100, textStartY + 120)
    ctx.lineTo(width - 100, textStartY + 120)
    ctx.stroke()

    if (text.desc) {
      ctx.fillStyle = colors.text
      ctx.font = '20px system-ui, sans-serif'
      ctx.textAlign = 'left'
      wrapText(text.desc, 80, textStartY + 160, width - 160, 32)
    }

    if (testInfo) {
      const infoY = height - 140
      ctx.fillStyle = colors.accentLight
      roundRect(60, infoY, width - 120, 60, 12)
      ctx.fill()

      ctx.fillStyle = colors.accent
      ctx.font = 'bold 18px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`匹配度 ${testInfo.similarity}% · 精准命中 ${testInfo.exact}/15 维`, width / 2, infoY + 38)
    }

    ctx.fillStyle = colors.textSecondary
    ctx.font = '16px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('SBTI 人格测试 · sbti.app', width / 2, height - 60)
  }

  /**
   * 导出为 JPG
   * @param {string} filename - 文件名
   */
  function exportJPG(filename = 'sbti-card.jpg') {
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    const link = document.createElement('a')
    link.download = filename
    link.href = dataUrl
    link.click()
  }

  /**
   * 获取 JPG Data URL
   * @returns {string}
   */
  function getJPGDataUrl() {
    return canvas.toDataURL('image/jpeg', 0.9)
  }

  return {
    render,
    exportJPG,
    getJPGDataUrl,
  }
}
