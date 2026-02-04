import React, { useState } from 'react';
import { Download, Upload, Settings, User } from 'lucide-react';
import { Achievement } from '../../types';
import { AchievementBadges } from '../AchievementBadges';

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
