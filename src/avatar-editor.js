/**
 * 形象编辑器 - 处理形象组件的选择和渲染
 */

/**
 * 创建形象编辑器实例
 * @param {HTMLCanvasElement} canvas - 渲染画布
 * @param {Object} templates - 模板和组件配置
 * @param {Function} onChange - 选择变化回调
 * @returns {Object} 编辑器实例
 */
export function createAvatarEditor(canvas, templates, onChange) {
  const ctx = canvas.getContext('2d')
  const dpr = window.devicePixelRatio || 1

  const state = {
    selectedBody: templates.templates[0],
    selectedHead: templates.components.heads[0],
    selectedHand: templates.components.hands[0],
  }

  const imageCache = new Map()

  /**
   * 预加载图片
   * @param {string} src - 图片路径
   * @returns {Promise<HTMLImageElement>}
   */
  function loadImage(src) {
    if (imageCache.has(src)) {
      return Promise.resolve(imageCache.get(src))
    }
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        imageCache.set(src, img)
        resolve(img)
      }
      img.onerror = reject
      img.src = src
    })
  }

  /**
   * 渲染形象到画布
   */
  async function render() {
    const width = canvas.width
    const height = canvas.height

    ctx.clearRect(0, 0, width, height)

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)

    try {
      if (state.selectedBody && state.selectedBody.image) {
        const bodyImg = await loadImage(state.selectedBody.image)
        ctx.drawImage(bodyImg, 0, 0, width, height)
      }

      if (state.selectedHead && state.selectedHead.image && state.selectedBody) {
        const headImg = await loadImage(state.selectedHead.image)
        const slot = state.selectedBody.headSlot
        const headSize = 60
        ctx.drawImage(headImg, slot.x - headSize / 2, slot.y, headSize, headSize)
      }

      if (state.selectedHand && state.selectedHand.image && state.selectedBody) {
        const handImg = await loadImage(state.selectedHand.image)
        const slot = state.selectedBody.handSlot
        const handSize = 50
        ctx.drawImage(handImg, slot.x, slot.y, handSize, handSize)
      }
    } catch (err) {
      console.warn('图片加载失败:', err)
      drawPlaceholder()
    }
  }

  /**
   * 绘制占位符
   */
  function drawPlaceholder() {
    ctx.fillStyle = '#f0f4f1'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#6b7b6e'
    ctx.font = '14px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('形象预览', canvas.width / 2, canvas.height / 2 - 20)
    ctx.font = '12px system-ui, sans-serif'
    ctx.fillStyle = '#9ca89e'
    ctx.fillText('(请添加图片资源)', canvas.width / 2, canvas.height / 2 + 10)
  }

  /**
   * 创建选择器 UI
   * @param {HTMLElement} container - 容器元素
   * @param {Array} options - 选项列表
   * @param {string} type - 类型 (body/head/hand)
   */
  function createSelector(container, options, type) {
    container.innerHTML = ''

    options.forEach((option, index) => {
      const btn = document.createElement('button')
      btn.className = 'selector-option'
      btn.dataset.id = option.id
      btn.title = option.name

      if (option.image) {
        const img = document.createElement('img')
        img.src = option.image
        img.alt = option.name
        img.onerror = () => {
          btn.textContent = option.name
        }
        btn.appendChild(img)
      } else {
        btn.textContent = option.name
      }

      if (index === 0) {
        btn.classList.add('active')
      }

      btn.addEventListener('click', () => {
        container.querySelectorAll('.selector-option').forEach((b) => b.classList.remove('active'))
        btn.classList.add('active')

        if (type === 'body') {
          state.selectedBody = option
        } else if (type === 'head') {
          state.selectedHead = option
        } else if (type === 'hand') {
          state.selectedHand = option
        }

        render()
        if (onChange) onChange(getSelection())
      })

      container.appendChild(btn)
    })
  }

  /**
   * 获取当前选择
   * @returns {Object}
   */
  function getSelection() {
    return {
      body: state.selectedBody,
      head: state.selectedHead,
      hand: state.selectedHand,
    }
  }

  /**
   * 设置选择
   * @param {Object} selection
   */
  function setSelection(selection) {
    if (selection.body) {
      state.selectedBody = templates.templates.find((t) => t.id === selection.body) || templates.templates[0]
    }
    if (selection.head) {
      state.selectedHead = templates.components.heads.find((c) => c.id === selection.head) || templates.components.heads[0]
    }
    if (selection.hand) {
      state.selectedHand = templates.components.hands.find((c) => c.id === selection.hand) || templates.components.hands[0]
    }
    render()
  }

  return {
    render,
    createSelector,
    getSelection,
    setSelection,
    drawPlaceholder,
  }
}
