/**
 * SBTI 人格卡工坊 - 主逻辑
 */

import { createAvatarEditor } from './avatar-editor.js'
import { createCardPreview } from './card-preview.js'

/**
 * 加载 JSON 文件
 * @param {string} path
 * @returns {Promise<Object>}
 */
async function loadJSON(path) {
  const res = await fetch(path)
  return res.json()
}

/**
 * 获取 sessionStorage 中的测试数据
 * @returns {Object|null}
 */
function getTestData() {
  const dataStr = sessionStorage.getItem('sbti_workshop_data')
  if (!dataStr) return null
  try {
    return JSON.parse(dataStr)
  } catch (e) {
    console.error('解析测试数据失败:', e)
    return null
  }
}

/**
 * 保存卡片到本地存储
 * @param {Object} cardData
 */
function saveCard(cardData) {
  const cards = JSON.parse(localStorage.getItem('sbti_cards') || '[]')
  cards.push({
    ...cardData,
    id: `card_${Date.now()}`,
    createdAt: new Date().toISOString(),
  })
  localStorage.setItem('sbti_cards', JSON.stringify(cards))
}

/**
 * 初始化工坊
 */
async function init() {
  const testData = getTestData()

  if (!testData) {
    alert('未找到测试数据，请先完成测试')
    window.location.href = 'index.html'
    return
  }

  const templates = await loadJSON(new URL('../data/avatar-templates.json', import.meta.url).href)

  const avatarCanvas = document.getElementById('avatar-canvas')
  const previewCanvas = document.getElementById('card-preview-canvas')

  const avatarEditor = createAvatarEditor(avatarCanvas, templates, handleAvatarChange)
  const cardPreview = createCardPreview(previewCanvas)

  avatarEditor.drawPlaceholder()

  const bodySelector = document.getElementById('body-selector')
  const headSelector = document.getElementById('head-selector')
  const handSelector = document.getElementById('hand-selector')

  avatarEditor.createSelector(bodySelector, templates.templates, 'body')
  avatarEditor.createSelector(headSelector, templates.components.heads, 'head')
  avatarEditor.createSelector(handSelector, templates.components.hands, 'hand')

  const inputCode = document.getElementById('input-code')
  const inputName = document.getElementById('input-name')
  const inputIntro = document.getElementById('input-intro')
  const inputDesc = document.getElementById('input-desc')
  const testMatchInfo = document.getElementById('test-match-info')

  if (testData.primary) {
    inputCode.value = testData.primary.code || ''
    inputName.value = testData.primary.cn || ''
    inputIntro.value = testData.primary.intro || ''
    inputDesc.value = testData.primary.desc || ''
    testMatchInfo.textContent = `匹配度 ${testData.primary.similarity}% · 精准命中 ${testData.primary.exact}/15 维`
  }

  const textInputs = [inputCode, inputName, inputIntro, inputDesc]
  textInputs.forEach((input) => {
    input.addEventListener('input', updatePreview)
  })

  avatarEditor.render()

  function handleAvatarChange(selection) {
    updatePreview()
  }

  function updatePreview() {
    const avatarSelection = avatarEditor.getSelection()

    const cardData = {
      avatar: {
        body: avatarSelection.body,
        head: avatarSelection.head,
        hand: avatarSelection.hand,
      },
      text: {
        code: inputCode.value,
        name: inputName.value,
        intro: inputIntro.value,
        desc: inputDesc.value,
      },
      testInfo: testData.primary
        ? {
            similarity: testData.primary.similarity,
            exact: testData.primary.exact,
          }
        : null,
    }

    cardPreview.render(cardData)
  }

  updatePreview()

  const btnSave = document.getElementById('btn-save')
  const btnExport = document.getElementById('btn-export')

  btnSave.addEventListener('click', () => {
    const avatarSelection = avatarEditor.getSelection()
    const cardData = {
      testData: testData,
      customData: {
        avatar: {
          template: avatarSelection.body?.id,
          head: avatarSelection.head?.id,
          hand: avatarSelection.hand?.id,
        },
        text: {
          code: inputCode.value,
          name: inputName.value,
          intro: inputIntro.value,
          desc: inputDesc.value,
        },
      },
    }

    saveCard(cardData)
    alert('已保存到本地！')
  })

  btnExport.addEventListener('click', () => {
    const filename = `SBTI-${inputCode.value || 'card'}.jpg`
    cardPreview.exportJPG(filename)
  })
}

init()
