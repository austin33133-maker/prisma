import Anthropic from '@anthropic-ai/sdk'

export const SHOT_SIZES = ['远景', '全景', '中景', '中近景', '近景', '特写', '大特写']

export const CAMERA_MOVES = ['固定', '推', '拉', '摇', '移', '跟', '升降', '环绕', '手持', '航拍']

/**
 * JSON Schema for structured output. Constraints follow the structured-outputs
 * limitations: `additionalProperties: false` on every object, no numeric/string
 * length constraints.
 */
export const STORYBOARD_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string', description: '影片/短片标题' },
    logline: { type: 'string', description: '一句话故事梗概' },
    visualStyle: { type: 'string', description: '整体视觉风格描述' },
    shots: {
      type: 'array',
      description: '按时间顺序排列的分镜列表',
      items: {
        type: 'object',
        properties: {
          shotNumber: { type: 'integer', description: '镜号，从 1 开始递增' },
          scene: { type: 'string', description: '场景，如：内景-公寓-夜' },
          shotSize: { type: 'string', enum: SHOT_SIZES, description: '景别' },
          cameraMove: { type: 'string', enum: CAMERA_MOVES, description: '运镜方式' },
          durationSeconds: { type: 'number', description: '预估时长（秒）' },
          description: { type: 'string', description: '画面内容描述：构图、人物动作、关键细节' },
          dialogue: { type: 'string', description: '台词或旁白，无则为空字符串' },
          sound: { type: 'string', description: '音效/音乐提示，无则为空字符串' },
          mood: { type: 'string', description: '情绪与光线氛围' },
          imagePrompt: {
            type: 'string',
            description: '可直接用于 AI 文生图的英文提示词，包含画面主体、构图、镜头、光线、风格',
          },
        },
        required: [
          'shotNumber',
          'scene',
          'shotSize',
          'cameraMove',
          'durationSeconds',
          'description',
          'dialogue',
          'sound',
          'mood',
          'imagePrompt',
        ],
        additionalProperties: false,
      },
    },
  },
  required: ['title', 'logline', 'visualStyle', 'shots'],
  additionalProperties: false,
}

const SYSTEM_PROMPT = `你是一位资深电影分镜师（storyboard artist）兼摄影指导。
你的任务是把用户提供的剧本或故事梗概拆解为一份可直接交给摄制组使用的专业分镜表。

要求：
- 镜头语言专业：景别、运镜的选择要服务于叙事节奏和情绪，避免连续多个镜头使用相同景别。
- 画面描述具体可拍：写清楚构图（前景/背景）、人物位置与动作、关键道具，而不是抽象的文学描写。
- 节奏合理：对话场景以中近景/近景为主并注意正反打；动作场景镜头更短更碎；情绪段落允许长镜头。
- imagePrompt 用英文书写，适合直接粘贴到文生图模型，包含 subject、composition、camera/lens、lighting、style 关键词。
- 严格按照给定的 JSON Schema 输出。`

/**
 * Generate a storyboard via the Claude Messages API (structured JSON output).
 *
 * @param {{ script: string, style?: string, shotCount?: number }} input
 * @returns {Promise<object>} storyboard object matching STORYBOARD_SCHEMA
 */
export async function generateStoryboard({ script, style, shotCount }) {
  const client = new Anthropic()

  const userPrompt = [
    `请为以下故事生成分镜表，目标镜头数约 ${shotCount || 12} 个。`,
    style ? `期望视觉风格：${style}。` : '',
    '',
    '【剧本/故事梗概】',
    script,
  ]
    .filter(Boolean)
    .join('\n')

  const stream = client.messages.stream({
    model: 'claude-opus-4-8',
    max_tokens: 32000,
    thinking: { type: 'adaptive' },
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
    output_config: {
      format: { type: 'json_schema', schema: STORYBOARD_SCHEMA },
    },
  })

  const message = await stream.finalMessage()

  if (message.stop_reason === 'refusal') {
    throw new Error('模型拒绝了该请求，请调整剧本内容后重试。')
  }
  if (message.stop_reason === 'max_tokens') {
    throw new Error('输出超出长度限制，请减少目标镜头数后重试。')
  }

  const textBlock = message.content.find((block) => block.type === 'text')
  if (!textBlock) {
    throw new Error('模型未返回内容，请重试。')
  }
  return JSON.parse(textBlock.text)
}

/**
 * Sample storyboard returned in demo mode (no ANTHROPIC_API_KEY set), so the
 * UI can be exercised end-to-end without network access or credentials.
 */
export function demoStoryboard({ style, shotCount }) {
  const shots = [
    {
      shotNumber: 1,
      scene: '外景-城市天台-黄昏',
      shotSize: '远景',
      cameraMove: '航拍',
      durationSeconds: 6,
      description: '无人机镜头缓缓掠过暮色中的城市天际线，前景是一栋老式居民楼的天台，一个小小的人影站在天台边缘放飞纸飞机。',
      dialogue: '',
      sound: '城市环境声渐入，远处车流，轻柔钢琴主题',
      mood: '孤独而温柔，金色夕阳逆光',
      imagePrompt:
        'aerial drone shot of a city skyline at golden hour, tiny figure on an old apartment rooftop throwing a paper plane, warm backlight, cinematic wide shot, anamorphic lens, film grain',
    },
    {
      shotNumber: 2,
      scene: '外景-城市天台-黄昏',
      shotSize: '中景',
      cameraMove: '跟',
      durationSeconds: 4,
      description: '镜头跟随少女小雨跑向天台边，她伸手去够被风吹回来的纸飞机，发丝被风吹乱。',
      dialogue: '',
      sound: '风声，衣料摩擦声',
      mood: '轻快、期待',
      imagePrompt:
        'medium tracking shot of a teenage girl running on a rooftop at dusk, reaching for a paper plane in the wind, hair blowing, warm rim light, shallow depth of field, cinematic',
    },
    {
      shotNumber: 3,
      scene: '外景-城市天台-黄昏',
      shotSize: '特写',
      cameraMove: '固定',
      durationSeconds: 3,
      description: '纸飞机机翼特写：上面用钢笔写着一行小字"给十年后的我"。背景虚化成金色光斑。',
      dialogue: '（旁白）那年我十四岁，把愿望都叠进了纸飞机。',
      sound: '钢琴主题渐强',
      mood: '怀旧，柔焦暖调',
      imagePrompt:
        'extreme close-up of a paper plane wing with handwritten chinese ink words, golden bokeh background, soft warm light, nostalgic film look, macro lens',
    },
  ]
  const result = []
  const count = Math.max(1, Math.min(shotCount || 3, 3))
  for (let i = 0; i < count; i++) result.push(shots[i])
  return {
    title: '纸飞机（演示数据）',
    logline: '十四岁的少女把写给未来的愿望叠进纸飞机，从天台放飞。',
    visualStyle: style || '电影感写实，金色黄昏暖调，浅景深',
    shots: result,
  }
}
