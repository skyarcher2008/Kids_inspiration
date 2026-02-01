# 猪猪银行 (Piggy Bank) 项目完整文档

## 项目概述

### 基本信息
- **项目名称**: 猪猪银行 (Piggy Bank)
- **项目类型**: React TypeScript Progressive Web App (PWA) - 任务管理应用
- **主题**: 以存钱罐为主题的任务完成奖励系统
- **语言**: 中文界面
- **当前版本**: v2.5.8

### 核心概念
- **任务完成 = 存钱**: 完成任务获得星星奖励，模拟往存钱罐里存钱
- **永久累计**: 总星星数只能增加，永不减少，保护用户成就感
- **成就系统**: 基于任务完成情况解锁不同等级的成就徽章
- **分类管理**: 四种任务类别，每种有独特的颜色主题

## 技术栈架构

### 前端技术栈
```
React 18 + TypeScript
├── 样式: Tailwind CSS
├── 状态管理: Zustand + persist middleware
├── 构建工具: Create React App (CRA)
├── PWA: Service Worker enabled
└── 数据库: 本地存储 (Supabase暂时禁用)
```

### 项目结构
```
src/
├── components/           # 可复用React组件
│   ├── AchievementBadges.tsx      # 成就徽章展示 (4个/页)
│   ├── CelebrationAnimation.tsx   # 任务完成庆祝动画
│   ├── DailyReport.tsx           # 每日报告生成
│   ├── TaskManager.tsx           # 任务CRUD + 模板管理
│   ├── TodayStats.tsx            # 今日统计数据
│   ├── TodayTasks.tsx            # 今日任务列表 (滑动操作)
│   ├── WeeklyChart.tsx           # 周进度图表 (箭头翻页)
│   ├── PasswordModal.tsx         # 密码验证弹窗
│   ├── StarsAdjustmentModal.tsx  # 星星调整界面
│   ├── PiggyDialog.tsx           # 猪猪风格对话框系统
│   └── PiggyBankCelebration.tsx  # 存钱罐掉落庆祝动画
├── pages/               # 页面组件
│   └── HomePage.tsx     # 主页面 (3列布局)
├── stores/              # Zustand状态管理
│   └── useStore.ts      # 全局状态存储
├── contexts/            # React Context
│   └── DialogContext.tsx # 对话框上下文
└── libs/                # 外部服务集成
    └── *.backup         # Supabase备份文件
```

## 核心功能模块

### 1. 任务管理系统

#### 任务分类 (4种)
```typescript
type TaskCategory = 'study' | 'exercise' | 'behavior' | 'creativity';

// 颜色主题映射
study: 蓝色系 (📚 学习)
exercise: 绿色系 (🏃 运动)  
behavior: 琥珀色系 (😊 行为)
creativity: 紫色系 (🎨 创造)
```

#### 任务模板系统
- **分类下拉菜单**: 按4种类别组织模板
- **使用统计**: 记录每个模板的使用次数
- **软删除**: 删除的模板进入回收站，可恢复
- **一键添加**: 从模板快速创建今日任务

#### 今日任务操作
- **左滑完成**: 向左滑动80px触发完成
- **右滑恢复**: 向右滑动80px恢复未完成状态
- **磁吸效果**: 滑动60px触发磁吸反馈，短暂停留后回弹
- **触觉反馈**: 支持手机震动反馈 (50ms完成, 30ms磁吸)
- **按钮备用**: 保留原有按钮作为备选操作方式

### 2. 数据统计系统

#### 星星计算逻辑
```typescript
// 今日星星统计 (实时)
const todayTotalStars = tasks
  .filter(task => task.completed)
  .reduce((total, task) => total + task.stars, 0);

// 总星星数计算 (基于历史记录)
const calculateTotalStarsFromHistory = (dailyRecords: DailyRecord[]): number => {
  return dailyRecords.reduce((total, record) => total + record.totalStars, 0);
};

// 永不减少保护机制
const validateStarsSafety = (currentStars: number, newStars: number): number => {
  return newStars < currentStars ? currentStars : newStars;
};
```

#### 数据结构
```typescript
interface Task {
  id: string;
  name: string;
  category: TaskCategory;
  completed: boolean;
  stars: number;
  date: string;
}

interface DailyRecord {
  date: string;           // YYYY-MM-DD格式
  tasks: Task[];          // 当日所有任务
  totalStars: number;     // 当日完成任务星星总数
  report?: string;        // 每日总结
}

interface AppState {
  totalStars: number;           // 历史累计总星星 (永不减少)
  currentStreak: number;        // 连续完成天数
  dailyRecords: DailyRecord[];  // 每日记录
  achievements: Achievement[];  // 成就列表
  taskTemplates: TaskTemplate[]; // 任务模板
  adminPassword?: string;       // 管理员密码 (base64加密)
}
```

### 3. 成就系统

#### 成就类别
```typescript
// 星星里程碑成就
const starMilestones = [
  { stars: 1, id: 'first-star', name: '初次闪耀' },
  { stars: 50, id: 'star-collector-50', name: '星星新手' },
  { stars: 100, id: 'star-collector-100', name: '星星收集者' },
  { stars: 200, id: 'star-collector-200', name: '星星专家' },
  // ... 更多等级
];

// 行为成就
- 'perfect-day': 完美一天 (当日100%完成率)
- 'super-day': 超级一天 (单日20+星星)
- 'all-category': 全能选手 (单日完成所有类别)
- 'week-warrior': 周冠军 (连续7天)
- 'month-master': 月度大师 (连续30天)
```

#### 成就展示
- **分页显示**: 移动端4个/页，桌面端5个/页
- **解锁动画**: 成就解锁时的特殊动画效果
- **解锁通知**: 自定义事件通知Dialog系统

### 4. 视觉交互系统

#### 猪猪主题设计
- **存钱罐庆祝**: 完成任务时掉落存钱罐+星星雨动画
- **猪猪对话框**: 替代系统alert/confirm，5种类型 (success/error/warning/confirm/achievement)
- **音效系统**: Web Audio API生成金币音效
- **颜色主题**: 粉色系主色调 (#FF69B4)

#### 动画效果 (CSS)
```css
/* 关键动画 */
@keyframes starFall { ... }           // 星星掉落
@keyframes piggyBounce { ... }        // 存钱罐弹跳
@keyframes slideDown { ... }          // 下拉展开
@keyframes magneticPull { ... }       // 磁吸效果
@keyframes swipeComplete { ... }      // 滑动完成
@keyframes achievementUnlock { ... }  // 成就解锁
```

### 5. 数据安全机制

#### 永久累计保护
- **uncompleteTask**: 恢复任务时总星星数保持不变
- **clearTodayTasks**: 清除任务时保持累计不变
- **validateStarsSafety**: 防止任何减少总星星数的操作
- **同步机制**: 启动时检查并修复数据不一致

#### 管理员功能
- **密码保护**: base64加密存储
- **星星调整**: 允许手动调整总星星数 (有减少警告)
- **数据导入导出**: JSON格式数据备份

## 开发历程 (Git版本)

### 主要版本节点
```
v2.5.8 - 总星星数统计分析和修复
v2.5.7 - 今日任务左右滑动完成和恢复
v2.5.6 - 任务模板下拉菜单 (按分类组织)
v2.5.5 - 今日任务误触统计问题解决
v2.5.4 - 猪猪存钱罐庆祝动画
v2.5.3 - 猪猪风格对话框系统
v2.5.2 - 任务分类颜色主题
v2.5.1 - 密码保护星星调整功能
v2.5.0 - 组件模块化重构
```

### 关键技术决策
1. **状态管理**: 选择Zustand而非Redux，简化状态管理
2. **数据持久化**: 使用Zustand persist中间件存储到localStorage
3. **动画系统**: 纯CSS动画 + React状态控制，避免重型动画库
4. **滑动手势**: 自实现滑动检测，兼容触摸和鼠标事件
5. **组件架构**: 功能组件化，单一职责原则

## 开发规范

### 命名约定
- **组件**: PascalCase (TaskManager.tsx)
- **函数**: camelCase (handleCompleteTask)
- **CSS类**: kebab-case (mobile-scrollbar)
- **状态**: camelCase (totalStars, currentStreak)

### 代码质量
- **TypeScript**: 严格类型检查，所有接口明确定义
- **React Hooks**: 使用useCallback优化性能，避免不必要的重渲染
- **错误处理**: try-catch包装关键操作，console日志记录
- **响应式设计**: Tailwind CSS实现移动端适配

### 测试策略
- **构建测试**: 每次修改后运行`npm run build`验证
- **功能测试**: 手动测试核心用户流程
- **数据完整性**: 重点测试永久累计机制

## 当前状态

### 已实现功能 ✅
- [x] 任务CRUD操作 (分类颜色主题)
- [x] 任务模板系统 (分类下拉菜单)
- [x] 左右滑动手势完成/恢复任务
- [x] 永久累计星星系统 (数据安全保护)
- [x] 成就系统 (多级别，自动解锁)
- [x] 猪猪主题视觉设计 (对话框，庆祝动画)
- [x] 密码保护的管理员功能
- [x] 数据导入导出功能
- [x] 周进度图表 (箭头翻页)
- [x] PWA支持

### 技术债务 ⚠️
- Supabase集成被临时禁用 (云端同步待开发)
- 测试覆盖率需要提升
- 部分组件可进一步拆分优化

### 开发环境配置
```bash
# 安装依赖
npm install

# 开发服务器
npm start

# 生产构建
npm run build

# 类型检查
npm run typecheck

# 代码检查
npm run lint
```

## 后续开发建议

### 新功能开发流程
1. **分支策略**: 为重大功能创建feature分支
2. **设计先行**: 先设计接口和数据结构
3. **渐进开发**: 分模块实现，保持可构建状态
4. **测试验证**: 功能完成后全面测试
5. **文档更新**: 及时更新此文档

### 技术栈升级考虑
- React 19 (当稳定时)
- 考虑引入React Query处理数据同步
- 评估Framer Motion替代CSS动画
- 考虑添加单元测试 (Jest + React Testing Library)

---

**文档版本**: v2.5.8  
**最后更新**: 2025-01-10  
**维护者**: Claude Code Assistant

> 此文档应在每次重大功能更新后同步更新，确保新的开发者能快速上手项目。