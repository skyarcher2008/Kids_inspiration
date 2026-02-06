import React, { useState } from 'react';
import { Download, Upload, Settings, User, Calculator, BookOpen, SpellCheck, TrendingUp, Calendar, Award } from 'lucide-react';
import { Achievement, Transaction } from '../../types';
import { AchievementBadges } from '../AchievementBadges';

type LearningSource = 'math' | 'word' | 'grammar';

interface SubjectStats {
  totalAnswered: number;
  totalCorrect: number;
  consecutiveCorrect: number;
  bestStreak: number;
  questionsSinceEnvelope: number;
  dailyAnsweredCount: number;
  dailyDateKey: string;
  lastSignInDate: string;
  signInStreak: number;
}

interface AchievementsViewProps {
  achievements: Achievement[];
  points: number;
  totalAnswered: number;
  totalCorrect: number;
  accuracy: number;
  streak: number;
  bestStreak: number;
  envelopesOpened: number;
  luckValue: number;
  userName: string;
  subjectStats: Record<LearningSource, SubjectStats>;
  transactions: Transaction[];
  familyId: string;
  syncPassword: string;
  syncStatus: 'idle' | 'syncing' | 'saved' | 'error';
  syncConfigured: boolean;
  lastSyncAt: string;
  onSetFamilyId: (value: string) => void;
  onSetSyncPassword: (value: string) => void;
  onCreateFamilyId: () => void;
  onSyncPull: () => void | Promise<boolean>;
  onSyncPush: () => void | Promise<boolean>;
  onDisconnect: () => void;
  onSetUserName: (name: string) => void;
  onExport: () => string;
  onImport: (content: string) => Promise<boolean> | boolean;
  onRestoreBackup: () => void;
  backupUpdatedAt: string;
  notificationUrl: string;
  onSetNotificationUrl: (url: string) => void;
  onReset: () => void;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({
  achievements,
  points,
  totalAnswered,
  totalCorrect,
  accuracy,
  streak,
  bestStreak,
  envelopesOpened,
  luckValue,
  userName,
  subjectStats,
  transactions,
  familyId,
  syncPassword,
  syncStatus,
  syncConfigured,
  lastSyncAt,
  onSetFamilyId,
  onSetSyncPassword,
  onCreateFamilyId,
  onSyncPull,
  onSyncPush,
  onDisconnect,
  onSetUserName,
  onExport,
  onImport,
  onRestoreBackup,
  backupUpdatedAt,
  notificationUrl,
  onSetNotificationUrl,
  onReset
}) => {
  const [nameInput, setNameInput] = useState(userName);

  // 计算今日和本周的统计数据
  const todayKey = new Date().toISOString().split('T')[0];
  const getWeekStart = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // 周一为一周开始
    const weekStart = new Date(now.getFullYear(), now.getMonth(), diff);
    return weekStart.toISOString().split('T')[0];
  };

  const weekStartKey = getWeekStart();

  // 从 transactions 统计本周数据
  const weekTransactions = transactions.filter(tx => {
    const txDate = tx.date.split('T')[0];
    return tx.type === 'EARN' && txDate >= weekStartKey && txDate <= todayKey;
  });

  // 统计本周各科目答题数和积分
  const weekStats = {
    math: { count: 0, points: 0 },
    word: { count: 0, points: 0 },
    grammar: { count: 0, points: 0 },
    envelopes: 0,
    totalPoints: 0
  };

  weekTransactions.forEach(tx => {
    if (tx.description.includes('口算')) {
      weekStats.math.count++;
      weekStats.math.points += tx.amount;
    } else if (tx.description.includes('单词')) {
      weekStats.word.count++;
      weekStats.word.points += tx.amount;
    } else if (tx.description.includes('语法')) {
      weekStats.grammar.count++;
      weekStats.grammar.points += tx.amount;
    } else if (tx.description.includes('红包') || tx.description.includes('签到')) {
      weekStats.envelopes++;
    }
    weekStats.totalPoints += tx.amount;
  });

  const weekTotalQuestions = weekStats.math.count + weekStats.word.count + weekStats.grammar.count;

  // 今日统计
  const todayStats = {
    math: subjectStats.math.dailyDateKey === todayKey ? subjectStats.math.dailyAnsweredCount : 0,
    word: subjectStats.word.dailyDateKey === todayKey ? subjectStats.word.dailyAnsweredCount : 0,
    grammar: subjectStats.grammar.dailyDateKey === todayKey ? subjectStats.grammar.dailyAnsweredCount : 0,
  };

  const todayTotal = todayStats.math + todayStats.word + todayStats.grammar;

  // 获取积分基础配置
  const SOURCE_CONFIG: Record<LearningSource, { basePoints: number; label: string; icon: React.ReactNode }> = {
    math: { basePoints: 20, label: '口算', icon: <Calculator size={18} /> },
    word: { basePoints: 10, label: '单词', icon: <BookOpen size={18} /> },
    grammar: { basePoints: 15, label: '语法', icon: <SpellCheck size={18} /> },
  };

  // 计算今日大约获得的积分（简化计算）
  const todayPoints = todayStats.math * 20 + todayStats.word * 10 + todayStats.grammar * 15;

  const handleExport = () => {
    const data = onExport();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'learning-garden-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="py-4 pb-24 animate-slide-up">
      <div className="px-4 mb-6">
        <h2 className="text-xl font-cute text-slate-700 flex items-center">
          <span className="bg-yellow-100 p-2 rounded-xl mr-3 shadow-sm"><Settings className="text-yellow-500 w-5 h-5" /></span>
          成就与成长
        </h2>
        <p className="text-xs text-slate-400 mt-1 ml-12">这里记录你的进步和奖励</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
          <div className="text-xs text-slate-400 font-bold">累计积分</div>
          <div className="text-2xl font-cute text-amber-400">{points}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
          <div className="text-xs text-slate-400 font-bold">答题数</div>
          <div className="text-2xl font-cute text-sky-500">{totalAnswered}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
          <div className="text-xs text-slate-400 font-bold">正确率</div>
          <div className="text-2xl font-cute text-emerald-500">{accuracy}%</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
          <div className="text-xs text-slate-400 font-bold">幸运值</div>
          <div className="text-2xl font-cute text-rose-400">{luckValue.toFixed(2)}</div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] mx-4 p-6 shadow-sm border border-slate-100 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-slate-400 font-bold">连对</div>
            <div className="text-xl font-cute text-amber-400">{streak}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 font-bold">最佳连对</div>
            <div className="text-xl font-cute text-amber-400">{bestStreak}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 font-bold">红包数</div>
            <div className="text-xl font-cute text-rose-400">{envelopesOpened}</div>
          </div>
        </div>
      </div>

      <div className="px-4 mb-6">
        <AchievementBadges achievements={achievements} />
      </div>

      {/* 今日学习统计 */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[2rem] mx-4 p-6 shadow-sm border-2 border-blue-100 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-blue-500 p-2 rounded-xl shadow-sm">
            <Calendar className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-cute text-lg text-slate-700">今日学习统计</h3>
            <p className="text-xs text-slate-400">共完成 {todayTotal} 道题</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {(Object.keys(SOURCE_CONFIG) as LearningSource[]).map(source => {
            const config = SOURCE_CONFIG[source];
            const stats = subjectStats[source];
            const todayCount = stats.dailyDateKey === todayKey ? stats.dailyAnsweredCount : 0;
            const todayCorrect = stats.dailyDateKey === todayKey ? Math.floor(todayCount * ((stats.totalCorrect / (stats.totalAnswered || 1)))) : 0;
            const accuracy = todayCount > 0 ? Math.round((todayCorrect / todayCount) * 100) : 0;

            return (
              <div key={source} className="bg-white rounded-xl p-3 shadow-sm">
                <div className="flex items-center justify-center mb-2 text-blue-500">
                  {config.icon}
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-400 font-bold mb-1">{config.label}</div>
                  <div className="text-2xl font-cute text-slate-700">{todayCount}</div>
                  {todayCount > 0 && (
                    <div className="text-[10px] text-emerald-500 font-bold mt-1">✓ {accuracy}%</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-slate-600">各科目累计进度</span>
            <TrendingUp className="text-emerald-500" size={16} />
          </div>
          {(Object.keys(SOURCE_CONFIG) as LearningSource[]).map(source => {
            const config = SOURCE_CONFIG[source];
            const stats = subjectStats[source];
            const accuracy = stats.totalAnswered > 0 ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100) : 0;

            return (
              <div key={source} className="mb-3 last:mb-0">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-600 flex items-center gap-1">
                    {config.icon}
                    {config.label}
                  </span>
                  <span className="text-slate-400">
                    {stats.totalAnswered} 题 · 正确 {stats.totalCorrect} · {accuracy}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                      style={{ width: `${accuracy}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-emerald-500">{stats.consecutiveCorrect}</span>
                    <span className="text-[10px] text-slate-400">连对</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {todayTotal > 0 && (
          <div className="mt-4 bg-amber-50 rounded-xl p-3 flex items-center justify-between">
            <span className="text-sm font-bold text-amber-700">今日约获积分</span>
            <span className="text-xl font-cute text-amber-500">+{todayPoints}</span>
          </div>
        )}
      </div>

      {/* 本周学习统计 */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-[2rem] mx-4 p-6 shadow-sm border-2 border-purple-100 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-purple-500 p-2 rounded-xl shadow-sm">
            <Award className="text-white" size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-cute text-lg text-slate-700">本周学习统计</h3>
            <p className="text-xs text-slate-400">本周共完成 {weekTotalQuestions} 道题，获得 {weekStats.totalPoints} 积分</p>
          </div>
        </div>

        {weekTotalQuestions > 0 ? (
          <>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {(Object.keys(SOURCE_CONFIG) as LearningSource[]).map(source => {
                const config = SOURCE_CONFIG[source];
                const count = source === 'math' ? weekStats.math.count : source === 'word' ? weekStats.word.count : weekStats.grammar.count;
                const earnedPoints = source === 'math' ? weekStats.math.points : source === 'word' ? weekStats.word.points : weekStats.grammar.points;

                return (
                  <div key={source} className="bg-white rounded-xl p-3 shadow-sm text-center">
                    <div className="flex items-center justify-center mb-2 text-purple-500">
                      {config.icon}
                    </div>
                    <div className="text-xs text-slate-400 font-bold mb-1">{config.label}</div>
                    <div className="text-2xl font-cute text-slate-700">{count}</div>
                    <div className="text-[10px] text-purple-500 font-bold mt-1">+{earnedPoints}</div>
                  </div>
                );
              })}
            </div>

            {/* 本周分布饼图样式展示 */}
            <div className="bg-white rounded-xl p-4 shadow-sm mb-3">
              <div className="text-xs font-bold text-slate-600 mb-2 text-center">本周练习分布</div>
              <div className="flex gap-1 h-3 rounded-full overflow-hidden">
                {weekStats.math.count > 0 && (
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-500"
                    style={{ width: `${(weekStats.math.count / weekTotalQuestions) * 100}%` }}
                    title={`口算: ${weekStats.math.count}题`}
                  />
                )}
                {weekStats.word.count > 0 && (
                  <div 
                    className="bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                    style={{ width: `${(weekStats.word.count / weekTotalQuestions) * 100}%` }}
                    title={`单词: ${weekStats.word.count}题`}
                  />
                )}
                {weekStats.grammar.count > 0 && (
                  <div 
                    className="bg-gradient-to-r from-purple-400 to-purple-500 transition-all duration-500"
                    style={{ width: `${(weekStats.grammar.count / weekTotalQuestions) * 100}%` }}
                    title={`语法: ${weekStats.grammar.count}题`}
                  />
                )}
              </div>
              <div className="flex justify-center gap-4 mt-2 text-[10px]">
                {weekStats.math.count > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-slate-500">口算 {Math.round((weekStats.math.count / weekTotalQuestions) * 100)}%</span>
                  </div>
                )}
                {weekStats.word.count > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-slate-500">单词 {Math.round((weekStats.word.count / weekTotalQuestions) * 100)}%</span>
                  </div>
                )}
                {weekStats.grammar.count > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="text-slate-500">语法 {Math.round((weekStats.grammar.count / weekTotalQuestions) * 100)}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* 鼓励信息 */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 border border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-amber-700 mb-1">
                    {weekTotalQuestions >= 100 ? '🏆 本周表现优秀！' : 
                     weekTotalQuestions >= 50 ? '🌟 本周很努力哦！' : 
                     weekTotalQuestions >= 20 ? '💪 继续保持！' : '📚 加油练习吧！'}
                  </div>
                  <div className="text-xs text-amber-600">
                    {weekTotalQuestions >= 100 ? '坚持不懈，成绩优异！' : 
                     weekTotalQuestions >= 50 ? '再接再厉，争取更好！' : 
                     weekTotalQuestions >= 20 ? '多多练习会更棒！' : '每天练习一点点，进步看得见！'}
                  </div>
                </div>
                {weekStats.envelopes > 0 && (
                  <div className="text-center">
                    <div className="text-2xl">🧧</div>
                    <div className="text-xs text-rose-500 font-bold">×{weekStats.envelopes}</div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="text-4xl mb-2 opacity-50">📚</div>
            <p className="text-sm text-slate-400">本周还没有学习记录</p>
            <p className="text-xs text-slate-300 mt-1">开始练习吧，让这里变得精彩！</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[2rem] mx-4 p-6 shadow-sm border border-slate-100 mb-6">
        <div className="text-sm text-slate-500 font-bold mb-3 flex items-center gap-2">
          <Settings size={16} /> 跨设备同步
        </div>
        <div className="text-xs text-slate-400 mb-4">
          将学习数据同步到 NAS，多个设备使用同一个家庭ID即可共享进度。
        </div>

        {!syncConfigured && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-xl p-3 mb-4">
            ⚠️ 未配置同步地址，请在环境变量中设置 VITE_SYNC_API_URL。
          </div>
        )}

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={familyId}
              onChange={(e) => onSetFamilyId(e.target.value.trim())}
              placeholder="家庭ID"
              className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2 text-slate-700 font-mono"
            />
            <button
              onClick={onCreateFamilyId}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold"
            >
              生成ID
            </button>
          </div>
          <input
            type="password"
            value={syncPassword}
            onChange={(e) => onSetSyncPassword(e.target.value)}
            placeholder="同步密码（可选）"
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2 text-slate-700"
          />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onSyncPull}
              disabled={!syncConfigured || !familyId || syncStatus === 'syncing'}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 font-bold disabled:opacity-50"
            >
              下载同步
            </button>
            <button
              onClick={onSyncPush}
              disabled={!syncConfigured || !familyId || syncStatus === 'syncing'}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-50 text-sky-600 font-bold disabled:opacity-50"
            >
              立即上传
            </button>
            <button
              onClick={onDisconnect}
              disabled={!familyId}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 text-rose-500 font-bold disabled:opacity-50"
            >
              断开同步
            </button>
          </div>
          <div className="text-xs text-slate-400">
            状态：{syncStatus === 'syncing' ? '同步中...' : syncStatus === 'saved' ? '已同步' : syncStatus === 'error' ? '同步失败' : '未同步'}
            {lastSyncAt && ` · 最近同步 ${new Date(lastSyncAt).toLocaleString()}`}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] mx-4 p-6 shadow-sm border border-slate-100">
        <div className="text-sm text-slate-500 font-bold mb-3 flex items-center gap-2">
          <User size={16} /> 个人设置
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="孩子姓名"
            className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 text-slate-700"
          />
          <button
            onClick={() => onSetUserName(nameInput.trim())}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold"
          >
            更新姓名
          </button>
        </div>

        <div className="text-sm text-slate-500 font-bold mb-2">红包触发说明</div>
        <div className="text-sm text-slate-400 mb-6">
          数学 5 题开红包，单词与语法 10 题开红包。
        </div>

        <div className="text-sm text-slate-500 font-bold mb-2">兑换通知设置</div>
        <div className="text-sm text-slate-400 mb-2">填写 Webhook 地址，可接入微信/短信/邮件服务。</div>
        <input
          value={notificationUrl}
          onChange={(e) => onSetNotificationUrl(e.target.value)}
          placeholder="例如：https://www.pushplus.plus/send?token=你的TOKEN&title=兑换通知"
          className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2 text-slate-700 mb-6"
        />

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-600"
          >
            <Download size={16} /> 导出数据
          </button>
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-600 cursor-pointer">
            <Upload size={16} /> 导入数据
            <input
              type="file"
              className="hidden"
              accept="application/json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                file.text().then(text => onImport(text));
                e.currentTarget.value = '';
              }}
            />
          </label>
          <button
            onClick={onRestoreBackup}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-600"
          >
            从本地备份恢复
          </button>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 text-rose-500"
          >
            重置数据
          </button>
        </div>
        {backupUpdatedAt && (
          <div className="mt-3 text-xs text-slate-400">
            最近一次自动备份：{new Date(backupUpdatedAt).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};
