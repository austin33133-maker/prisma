# 「搭子」社交 App —— Cursor 开发指导文档

> 本文档是给 AI 编程工具（Cursor）的完整开发依据。包含产品定位、分阶段路线图、功能需求、
> 技术选型、数据模型（Prisma schema）、商业化分成规则与合规清单。
> 请 Cursor 严格按「阶段划分」逐步开发，每个阶段有明确的交付物和验收标准。

---

## 1. 产品定位

**一句话定位**：帮同城年轻人找到具体事情的搭子 —— 以场景（一起吃饭 / 运动 / 看演出）
为破冰理由的轻量陌生人社交应用，而不是以"认识陌生人"本身为目的。

- **对标但不复制陌陌**：陌陌/探探已占据通用 LBS 陌生人社交心智，正面竞争无胜算。
  我们从"搭子场景"切入，冷启动按「城市 + 场景」逐个打。
- **目标用户**：18–30 岁一二线城市年轻人，有明确的同城活动需求（饭搭子、运动搭子、
  演出搭子、桌游搭子）。
- **为什么这个定位成立**：
  - "搭子"目的性弱、破冰自然，女性用户接受度高（女性用户密度决定这类产品生死）；
  - 内容合规风险低于泛交友；
  - 天然带线下转化，商业化路径清晰（活动票务、本地商家、会员、直播打赏、广告）。

**核心演进路径（已验证的行业路径）**：
文字聊天/搭子匹配 → 多人语音房（连麦、陪聊、点唱）→ 视频直播。
直播是供给驱动业务：有好主播才有观众，有观众才有打赏，有打赏才能留住主播。

---

## 2. 分阶段路线图

### 阶段一：搭子社交 MVP（第 1–3 个月）

目标：验证"场景化搭子匹配"的留存，把基础社交链路跑通。

功能清单：
1. 手机号注册/登录 + 实名认证（合规硬性要求）
2. 个人资料：头像、昵称、年龄、性别、兴趣标签、所在城市
3. 搭子发布：选择场景类型（吃饭/运动/演出/桌游/自定义）+ 时间 + 地点 + 人数
4. 附近搭子流：按 LBS + 场景筛选的信息流
5. 报名/匹配：用户报名搭子局，发起者确认
6. 单聊 IM：文字、图片、位置（WebSocket 长连接）
7. 局内群聊：搭子局确认后自动建群
8. 举报/拉黑/封禁 + 基础内容审核（接第三方审核 API：数美/网易易盾）

北极星指标：次周留存率、搭子局成局率。

### 阶段二：语音房 + 打赏（第 4–8 个月）

目标：养成"房间文化"和礼物消费习惯。**先做语音房，不做视频直播** ——
语音房主播供给门槛低（普通用户就能开麦）、带宽成本低、审核压力小。

功能清单：
1. 多人语音房：房主 + 麦位（8 麦）+ 观众，支持上麦/下麦/禁麦
   （RTC 使用声网 Agora 或即构 ZEGO，不要自研）
2. 房间类型：陪聊房、点唱房、搭子拼场房（和阶段一场景打通）
3. 虚拟币体系（**充值币与收益币分离** —— 财务合规的标准做法）：
   - 用户充值获得「钻石」（充值币）
   - 打赏消耗钻石，主播收到「星光」（收益币）
   - 星光可提现，钻石不可提现、不可逆向兑换
4. 礼物系统：礼物特效分层（1 元小礼物 → 千元豪礼），礼物面板、连击、全屏特效
5. 榜单系统：房间在线榜、日榜/周榜、守护榜（制造攀比，打赏的核心驱动）
6. 充值：
   - iOS 内购（IAP，苹果抽 30%）
   - **H5/网页充值通道**（微信/支付宝，绕开渠道费，充值送额外钻石做引导）
   - 安卓端直接接支付宝/微信 SDK
7. 公会（工会）系统：公会入驻、主播签约、公会长后台（数据看板、主播管理）
8. 分成与结算：见第 5 节的分成规则，按月出账单，主播/公会申请提现，平台代扣个税
9. 新主播扶持流量池：新开播房间保底曝光
10. 直播入口渗透：附近的人/匹配流里插入直播房间卡片；单聊可一键升级为语音房

北极星指标：开播渗透率、主播首周留存、付费率、ARPPU。

### 阶段三：视频直播 + PK + 广告（第 9 个月起）

前置条件：语音房 DAU 与打赏流水验证成功、视听许可证问题解决（见合规清单）。

功能清单：
1. 视频直播（RTC 供应商同上，加 CDN 旁路推流）
2. 连麦 PK：两个主播比拼礼物值（**打赏峰值的最大来源**），PK 进度条、惩罚环节
3. 平台自营广告（保底收入，不涉及分成）：
   接聚合 ADX —— 穿山甲（字节）、优量汇（腾讯）；广告位：开屏、信息流、匹配等待页
4. 激励视频广告：用户看广告获得少量免费钻石（广告收入转化为打赏池）
5. 创作者广告分成（DAU 过几十万后再做）：品牌任务分发给主播（口播/挂购物袋），
   平台抽 20–30% 服务费，其余归主播/公会（对标抖音星图模式）

---

## 3. 技术栈建议

| 层 | 选型 | 说明 |
|---|---|---|
| 移动端 | React Native 或 Flutter | 双端一套代码，MVP 阶段够用 |
| 后端 | Node.js (NestJS) + TypeScript | 与 Prisma 生态契合 |
| ORM | **Prisma**（`prisma-client` 生成器 + 驱动适配器） | 数据模型见第 4 节 |
| 数据库 | PostgreSQL（主库）+ Redis（榜单/在线状态/计数） | 榜单用 Redis Sorted Set |
| IM | 自建 WebSocket（阶段一）；量大后评估融云/环信 | |
| RTC | 声网 Agora 或即构 ZEGO | 语音房 & 视频直播，不要自研 |
| 内容审核 | 数美 / 网易易盾（文本、图片、音频流、视频流） | 机审 + 人审后台 |
| 支付 | 微信支付、支付宝、Apple IAP | H5 充值通道优先建设 |
| 对象存储 | 阿里云 OSS / 腾讯云 COS | 头像、聊天图片、礼物资源 |

---

## 4. 核心数据模型（Prisma Schema）

以下为商业化核心（钱包/打赏/分成/结算）+ 社交基础的数据模型，
Cursor 可直接以此为基础生成 `schema.prisma` 并迭代：

```prisma
// ---------- 用户与社交 ----------

model User {
  id            String   @id @default(cuid())
  phone         String   @unique
  nickname      String
  avatarUrl     String?
  gender        Gender
  birthDate     DateTime
  city          String
  latitude      Float?
  longitude     Float?
  realNameVerified Boolean @default(false) // 实名认证，开播/提现前置条件
  isMinor       Boolean  @default(false)   // 未成年标记：禁止充值打赏
  status        UserStatus @default(ACTIVE)
  createdAt     DateTime @default(now())

  wallet        Wallet?
  streamerProfile Streamer?
  activities    Activity[]      @relation("ActivityCreator")
  participations ActivityMember[]
  giftsSent     GiftRecord[]    @relation("GiftSender")
  rechargeOrders RechargeOrder[]
}

enum Gender { MALE FEMALE OTHER }
enum UserStatus { ACTIVE BANNED SUSPENDED }

// 搭子局（阶段一核心）
model Activity {
  id          String   @id @default(cuid())
  creatorId   String
  creator     User     @relation("ActivityCreator", fields: [creatorId], references: [id])
  category    ActivityCategory
  title       String
  city        String
  latitude    Float
  longitude   Float
  startTime   DateTime
  maxMembers  Int
  status      ActivityStatus @default(OPEN)
  createdAt   DateTime @default(now())

  members     ActivityMember[]
}

enum ActivityCategory { FOOD SPORTS SHOW BOARDGAME CUSTOM }
enum ActivityStatus { OPEN FULL FINISHED CANCELLED }

model ActivityMember {
  activityId String
  userId     String
  status     MemberStatus @default(APPLIED)
  activity   Activity @relation(fields: [activityId], references: [id])
  user       User     @relation(fields: [userId], references: [id])

  @@id([activityId, userId])
}

enum MemberStatus { APPLIED CONFIRMED REJECTED }

// ---------- 直播（阶段二/三） ----------

model Streamer {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id])
  guildId     String?
  guild       Guild?   @relation(fields: [guildId], references: [id])
  // 分成比例（基点，10000 = 100%）。冷启动补贴期可上浮，按阶梯调整
  shareRateBp Int      @default(5000)
  createdAt   DateTime @default(now())

  rooms       LiveRoom[]
  earnings    EarningRecord[]
  settlements Settlement[]
}

model Guild {
  id          String   @id @default(cuid())
  name        String
  ownerUserId String
  // 公会在主播分成之外的额外分成（通常 500–1000 bp，即 5%–10%）
  shareRateBp Int      @default(800)
  streamers   Streamer[]
  settlements Settlement[]
}

model LiveRoom {
  id         String   @id @default(cuid())
  streamerId String
  streamer   Streamer @relation(fields: [streamerId], references: [id])
  type       RoomType
  title      String
  status     RoomStatus @default(LIVE)
  startedAt  DateTime @default(now())
  endedAt    DateTime?

  giftRecords GiftRecord[]
}

enum RoomType { VOICE_CHAT VOICE_SING VOICE_DAZI VIDEO }
enum RoomStatus { LIVE ENDED BANNED }

// ---------- 虚拟币与打赏（充值币/收益币分离） ----------

model Wallet {
  id        String @id @default(cuid())
  userId    String @unique
  user      User   @relation(fields: [userId], references: [id])
  diamonds  Int    @default(0) // 充值币：只能充值获得、打赏消耗，不可提现
  starlight Int    @default(0) // 收益币：只能收礼获得，可提现
  version   Int    @default(0) // 乐观锁，所有余额变动必须走事务 + 版本校验
}

model RechargeOrder {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  channel    PayChannel
  amountCny  Int      // 单位：分
  diamonds   Int      // 到账钻石（H5 渠道有加赠）
  status     OrderStatus @default(PENDING)
  channelTxn String?  // 渠道流水号
  createdAt  DateTime @default(now())

  @@index([userId, createdAt])
}

enum PayChannel { APPLE_IAP WECHAT ALIPAY H5_WECHAT H5_ALIPAY }
enum OrderStatus { PENDING PAID FAILED REFUNDED }

model Gift {
  id        String @id @default(cuid())
  name      String
  iconUrl   String
  effectUrl String? // 特效资源，豪礼有全屏特效
  priceDiamonds Int // 钻石售价，1 元小礼物 → 千元豪礼分层
  tier      GiftTier
  active    Boolean @default(true)
  records   GiftRecord[]
}

enum GiftTier { SMALL MEDIUM LARGE LUXURY }

// 打赏流水：核心账目表，只增不改
model GiftRecord {
  id           String   @id @default(cuid())
  senderId     String
  sender       User     @relation("GiftSender", fields: [senderId], references: [id])
  roomId       String
  room         LiveRoom @relation(fields: [roomId], references: [id])
  giftId       String
  gift         Gift     @relation(fields: [giftId], references: [id])
  count        Int
  diamondsSpent Int     // 冗余记录当时价格，礼物调价不影响历史账目
  createdAt    DateTime @default(now())

  earning      EarningRecord?

  @@index([roomId, createdAt])
  @@index([senderId, createdAt])
}

// 主播收益流水：由 GiftRecord 派生，记录分成快照
model EarningRecord {
  id            String   @id @default(cuid())
  giftRecordId  String   @unique
  giftRecord    GiftRecord @relation(fields: [giftRecordId], references: [id])
  streamerId    String
  streamer      Streamer @relation(fields: [streamerId], references: [id])
  grossDiamonds Int      // 打赏总额
  streamerRateBp Int     // 结算时的主播分成比例快照
  guildRateBp   Int      // 结算时的公会分成比例快照
  starlight     Int      // 主播实得收益币
  createdAt     DateTime @default(now())

  @@index([streamerId, createdAt])
}

// 月度结算账单
model Settlement {
  id            String   @id @default(cuid())
  streamerId    String
  streamer      Streamer @relation(fields: [streamerId], references: [id])
  guildId       String?
  guild         Guild?   @relation(fields: [guildId], references: [id])
  period        String   // "2026-07"
  totalStarlight Int
  payoutCny     Int      // 提现金额（分），扣税前
  taxCny        Int      // 平台代扣个税
  status        SettlementStatus @default(PENDING)
  paidAt        DateTime?

  @@unique([streamerId, period])
}

enum SettlementStatus { PENDING APPROVED PAID REJECTED }
```

**账目一致性要求（Cursor 必须遵守）**：
- 打赏必须在**单个数据库事务**内完成：扣减 sender 钻石（带乐观锁版本校验）→
  写 `GiftRecord` → 按快照比例写 `EarningRecord` → 增加主播星光。
- 所有流水表（`GiftRecord`、`EarningRecord`、`RechargeOrder`）只增不改，
  修正用红冲记录（负向流水），不做 UPDATE。
- 分成比例在流水中做快照（`streamerRateBp`/`guildRateBp`），后续调比例不影响历史账目。

---

## 5. 商业化分成规则

### 5.1 资金链路

用户充值 100 元 → **渠道抽成**（iOS IAP 苹果 30%；H5/安卓自有渠道 ≈0%，仅支付手续费 ~0.6%）
→ 剩余入平台 → 打赏时按比例分给主播/公会 → 主播提现时平台代扣个税。

### 5.2 打赏分成比例（以到账流水计）

| 对象 | 比例 | 说明 |
|---|---|---|
| 散人主播 | 平台 50% / 主播 50% | 行业默认线 |
| 公会主播 | 平台 45–50% / 公会+主播 50–55% | 公会再从主播份额抽 10–20% |
| 冷启动补贴期 | 主播可给到 60–70% | **必须设阶梯**（流水越高比例越好）并写明限时，否则后期降不下来 |

### 5.3 渠道费优化

- 引导用户走 **H5/网页充值**（充值送额外钻石），绕开苹果 30% 抽成；
- iOS 端内不做任何指向外部充值的引导文案（否则违反 App Store 条款被下架），
  H5 充值入口通过短信/公众号/客服触达。

### 5.4 广告收入

- **自营广告**（阶段三）：穿山甲 + 优量汇聚合，收入 100% 归平台，是保底收入；
- **激励视频**：广告收入折算为免费钻石发给用户，最终以打赏形式流向主播（等于把广告收入注入打赏分成池）;
- **创作者广告分成**：品牌任务模式，平台抽 20–30% 服务费；DAU 过几十万后再启动，早做只会增加结算复杂度。

---

## 6. 合规清单（前置条件，不是事后补）

1. **ICP 许可证**（经营性互联网信息服务）
2. **《网络文化经营许可证》**（直播类目）—— 语音房上线前必须取得
3. **《信息网络传播视听节目许可证》** —— 视频直播需要，极难独立获取，
   通常通过挂靠或收购持证主体解决；这决定了视频直播放在阶段三
4. **实名制**：注册需手机号实名；开播、提现必须完成人脸实名认证
5. **未成年人保护**：未成年账号禁止充值/打赏；未成年人打赏支持退款流程；青少年模式
6. **内容审核**：文本/图片/音频流/视频流机审（数美/网易易盾）+ 人审后台 + 审核日志留存
7. **打赏冷静期与限额**：单日充值/打赏限额配置能力，大额打赏二次确认
8. **税务**：主播提现平台代扣代缴个税，结算账单留存
9. **算法备案与数据合规**：推荐算法备案、《个人信息保护法》合规（隐私政策、数据出境评估）

---

## 7. 关键指标（按阶段）

| 阶段 | 北极星指标 | 辅助指标 |
|---|---|---|
| 一 | 次周留存率 | 搭子局成局率、女性用户占比 |
| 二 | 打赏流水 | 开播渗透率、主播首周留存、付费率、ARPPU |
| 三 | 总营收（打赏+广告） | PK 场均礼物值、广告 eCPM、创作者任务成交额 |

---

## 8. 给 Cursor 的执行指令

1. **严格按阶段开发**，阶段一完成并通过验收前不要写阶段二的代码。
2. 每个阶段先输出：模块拆分 → API 设计（OpenAPI）→ Prisma schema 迁移 → 实现 → 测试。
3. 钱包/打赏/结算相关代码必须有**单元测试覆盖并发扣款场景**（乐观锁冲突重试）。
4. 所有金额一律用整数（分 / 钻石个数），禁止浮点数。
5. 审核、限额、未成年拦截等合规逻辑做成可配置的中间件，不要散落在业务代码里。
6. 第 4 节 schema 是起点不是终点，IM 消息表、榜单、PK、广告任务表在对应阶段补充设计。

### 阶段验收标准

- **阶段一**：注册→发搭子局→报名→成局→群聊全链路可跑通；审核 API 接通；封禁生效。
- **阶段二**：充值（H5 + IAP 沙箱）→ 打赏 → 主播收益 → 月度账单 → 提现审批全链路对账无误
  （任意时刻：总充值钻石 = 未消耗钻石 + 已打赏钻石；打赏总额按比例 = 星光总额 + 平台留存）。
- **阶段三**：PK 礼物值实时同步误差 < 1s；广告 SDK 展示/点击回调入库；创作者任务结算可出账。
