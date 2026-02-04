import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import * as XLSX from 'xlsx';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  INITIAL_REWARDS,
  INITIAL_ACHIEVEMENTS,
  DEFAULT_WORDS,
  DEFAULT_GRAMMAR_QUESTIONS
} from '../../constants';
import { LEARNING_CONFIG } from '../../config/learningConfig';
import { Achievement, GrammarQuestion, MathDifficulty, MathQuestion, Reward, Transaction, WordItem } from '../../types';
import { ThemeKey } from '../../styles/themes';
import { ToastType } from '../../components/Toast';

GlobalWorkerOptions.workerSrc = pdfWorker;

type ActiveTab = 'math' | 'words' | 'grammar' | 'rewards' | 'achievements';
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

const SOURCE_CONFIG: Record<LearningSource, { basePoints: number; streakRewardInterval: number; envelopeInterval: number; dailyDoubleLimit: number; label: string }> = {
  math: { basePoints: 20, streakRewardInterval: 3, envelopeInterval: 5, dailyDoubleLimit: 10, label: '口算' },
  word: { basePoints: 10, streakRewardInterval: 5, envelopeInterval: 10, dailyDoubleLimit: 10, label: '单词' },
  grammar: { basePoints: 15, streakRewardInterval: 5, envelopeInterval: 10, dailyDoubleLimit: 10, label: '语法' }
};

const SIGN_IN_REWARDS = [20, 40, 60, 80, 100];

const REVIEW_INTERVALS = [
  5 * 60 * 1000,
  24 * 60 * 60 * 1000,
  3 * 24 * 60 * 60 * 1000,
  7 * 24 * 60 * 60 * 1000,
  15 * 24 * 60 * 60 * 1000
];

const generateId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const pickOne = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

const formatTwoDigits = (num: number) => num.toString().padStart(2, '0');

const getDateKey = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parseDateKey = (value: string) => {
  const [y, m, d] = value.split('-').map(part => Number(part));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

const isYesterday = (lastKey: string, todayKey: string) => {
  const lastDate = parseDateKey(lastKey);
  const todayDate = parseDateKey(todayKey);
  if (!lastDate || !todayDate) return false;
  const diff = todayDate.getTime() - lastDate.getTime();
  return diff >= 1000 * 60 * 60 * 24 && diff < 1000 * 60 * 60 * 48;
};

const getSignInReward = (streak: number) => {
  if (streak >= 5) return 100;
  return SIGN_IN_REWARDS[Math.max(0, streak - 1)] || 100;
};

const buildEmptySubjectStats = (todayKey: string): SubjectStats => ({
  totalAnswered: 0,
  totalCorrect: 0,
  consecutiveCorrect: 0,
  bestStreak: 0,
  questionsSinceEnvelope: 0,
  dailyAnsweredCount: 0,
  dailyDateKey: todayKey,
  lastSignInDate: '',
  signInStreak: 0
});

const normalizeSubjectStats = (raw: Partial<Record<LearningSource, Partial<SubjectStats>>> | undefined, todayKey: string) => {
  const empty = buildEmptySubjectStats(todayKey);
  const merge = (value?: Partial<SubjectStats>) => ({ ...empty, ...(value || {}) });
  return {
    math: merge(raw?.math),
    word: merge(raw?.word),
    grammar: merge(raw?.grammar)
  } as Record<LearningSource, SubjectStats>;
};

const pickWeighted = (weights: { mul: number; div: number; mix: number }) => {
  const total = weights.mul + weights.div + weights.mix;
  const r = Math.random() * total;
  if (r < weights.mul) return 'mul';
  if (r < weights.mul + weights.div) return 'div';
  return 'mix';
};

const createMathQuestion = (difficulty: MathDifficulty): MathQuestion => {
  const id = generateId();
  const rules = LEARNING_CONFIG.math[difficulty];
  const category = pickWeighted(rules.weights);

  if (category === 'mix' && rules.add && rules.sub) {
    const mixType = Math.random() < 0.5 ? 'add' : 'sub';
    if (mixType === 'add') {
      const a = randomInt(rules.add.minA, rules.add.maxA);
      const b = randomInt(rules.add.minB, rules.add.maxB);
      return { id, prompt: `${a} + ${b} = ?`, answer: a + b, difficulty };
    }
    const a = randomInt(rules.sub.minA, rules.sub.maxA);
    const b = randomInt(rules.sub.minB, rules.sub.maxB);
    const [maxVal, minVal] = a >= b ? [a, b] : [b, a];
    return { id, prompt: `${maxVal} - ${minVal} = ?`, answer: maxVal - minVal, difficulty };
  }

  if (category === 'mul' && rules.mul) {
    const a = randomInt(rules.mul.multiplicandMin, rules.mul.multiplicandMax);
    const b = randomInt(rules.mul.multiplierMin, rules.mul.multiplierMax);
    return { id, prompt: `${a} × ${b} = ?`, answer: a * b, difficulty };
  }
  if (category === 'div' && rules.div) {
    const divisor = randomInt(rules.div.divisorMin, rules.div.divisorMax);
    const quotient = randomInt(rules.div.quotientMin, rules.div.quotientMax);
    const dividend = divisor * quotient;
    return { id, prompt: `${dividend} ÷ ${divisor} = ?`, answer: quotient, difficulty };
  }

  if (category === 'mix' && rules.add) {
    const a = randomInt(rules.add.minA, rules.add.maxA);
    const b = randomInt(rules.add.minB, rules.add.maxB);
    return { id, prompt: `${a} + ${b} = ?`, answer: a + b, difficulty };
  }
  return { id, prompt: '200 + 300 = ?', answer: 500, difficulty };
};

const calculateLuck = (totalAnswered: number) => 1 + (totalAnswered / 20) * 0.5;

const getEnvelopeReward = (totalAnswered: number) => {
  const luck = calculateLuck(totalAnswered);
  const base = [
    { min: 10, max: 40, weight: 0.5 },
    { min: 41, max: 70, weight: 0.35 },
    { min: 71, max: 90, weight: 0.1 },
    { min: 91, max: 100, weight: 0.05 }
  ];
  const adjusted = base.map((item, index) => {
    const boost = index === 0 ? 1 / Math.min(2.5, luck) : 1 + (luck - 1) * (0.2 + index * 0.3);
    return { ...item, weight: item.weight * boost };
  });
  const totalWeight = adjusted.reduce((sum, item) => sum + item.weight, 0);
  const r = Math.random() * totalWeight;
  let acc = 0;
  const selected = adjusted.find(item => {
    acc += item.weight;
    return r <= acc;
  }) || adjusted[0];
  return { points: randomInt(selected.min, selected.max), luck };
};

const getFamiliarity = (stage: number) => {
  if (stage <= 0) return 'new';
  if (stage <= 2) return 'fuzzy';
  return 'known';
};

const scheduleNextReview = (stage: number) => Date.now() + REVIEW_INTERVALS[clamp(stage, 0, REVIEW_INTERVALS.length - 1)];

const normalizeAnswer = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[.!,?，。！？]/g, '')
    .replace(/\s+/g, ' ');

const decodeTextWithFallback = (buffer: ArrayBuffer) => {
  let text = new TextDecoder('utf-8').decode(buffer);
  if (text.includes('�')) {
    try {
      text = new TextDecoder('gbk').decode(buffer);
    } catch {
      // fallback stays utf-8
    }
  }
  return text;
};

export const useLearningAppLogic = () => {
  const BACKUP_KEY = 'app_backup';
  const BACKUP_TIME_KEY = 'app_backup_time';
  const [activeTab, setActiveTab] = useState<ActiveTab>('math');
  const [userName, setUserName] = useState(() => localStorage.getItem('app_username') || '');
  const [themeKey, setThemeKey] = useState<ThemeKey>(() => (localStorage.getItem('app_theme') as ThemeKey) || 'lemon');

  const [points, setPoints] = useState<number>(() => parseInt(localStorage.getItem('app_points') || '0', 10));
  const [totalAnswered, setTotalAnswered] = useState<number>(() => parseInt(localStorage.getItem('app_total_answered') || '0', 10));
  const [totalCorrect, setTotalCorrect] = useState<number>(() => parseInt(localStorage.getItem('app_total_correct') || '0', 10));
  const [consecutiveCorrect, setConsecutiveCorrect] = useState<number>(() => parseInt(localStorage.getItem('app_streak') || '0', 10));
  const [bestStreak, setBestStreak] = useState<number>(() => parseInt(localStorage.getItem('app_best_streak') || '0', 10));
  const [envelopesOpened, setEnvelopesOpened] = useState<number>(() => parseInt(localStorage.getItem('app_envelopes_opened') || '0', 10));
  const [pendingEnvelope, setPendingEnvelope] = useState<null | { points: number; luck?: number; kind?: 'normal' | 'signin'; sourceLabel?: string; signInDay?: number }>(null);

  const [subjectStats, setSubjectStats] = useState<Record<LearningSource, SubjectStats>>(() => {
    const saved = localStorage.getItem('app_subject_stats');
    const todayKey = getDateKey();
    if (saved) {
      try {
        const raw = JSON.parse(saved) as Partial<Record<LearningSource, Partial<SubjectStats>>>;
        return normalizeSubjectStats(raw, todayKey);
      } catch {
        // fallthrough
      }
    }
    return normalizeSubjectStats(undefined, todayKey);
  });

  const [rewards, setRewards] = useState<Reward[]>(() => {
    const saved = localStorage.getItem('app_rewards');
    if (!saved) return INITIAL_REWARDS;
    try {
      const parsed = JSON.parse(saved) as Reward[];
      const normalized = parsed.map(item => {
        if (!item.link) return item;
        let link = item.link;
        let guard = 0;
        while (link.includes('%25') && guard < 3) {
          try {
            link = decodeURIComponent(link);
          } catch {
            break;
          }
          guard += 1;
        }
        return link === item.link ? item : { ...item, link };
      });
      const legacyIds = new Set(['r1', 'r2', 'r3', 'r4', 'r5', 'r6']);
      const hasLegacy = normalized.some(item => legacyIds.has(item.id));
      return hasLegacy ? INITIAL_REWARDS : normalized;
    } catch {
      return INITIAL_REWARDS;
    }
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('app_achievements');
    return saved ? JSON.parse(saved) : INITIAL_ACHIEVEMENTS;
  });

  const [words, setWords] = useState<WordItem[]>(() => {
    const saved = localStorage.getItem('app_words');
    return saved ? JSON.parse(saved) : DEFAULT_WORDS;
  });

  const [grammarQuestions, setGrammarQuestions] = useState<GrammarQuestion[]>(() => {
    const saved = localStorage.getItem('app_grammar');
    return saved ? JSON.parse(saved) : DEFAULT_GRAMMAR_QUESTIONS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('app_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [mathDifficulty, setMathDifficulty] = useState<MathDifficulty>(() => (localStorage.getItem('app_math_difficulty') as MathDifficulty) || 'easy');
  const [currentMathQuestion, setCurrentMathQuestion] = useState<MathQuestion>(() => createMathQuestion(mathDifficulty));

  const [showCelebration, setShowCelebration] = useState<{ show: boolean; points: number; type: 'success' | 'penalty' }>({
    show: false,
    points: 0,
    type: 'success'
  });

  const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType }>({
    show: false,
    message: '',
    type: 'success'
  });

  const [backupUpdatedAt, setBackupUpdatedAt] = useState<string>(() => localStorage.getItem(BACKUP_TIME_KEY) || '');
  const [notificationUrl, setNotificationUrl] = useState<string>(() => localStorage.getItem('app_notification_url') || '');

  useEffect(() => localStorage.setItem('app_username', userName), [userName]);
  useEffect(() => localStorage.setItem('app_theme', themeKey), [themeKey]);
  useEffect(() => localStorage.setItem('app_points', points.toString()), [points]);
  useEffect(() => localStorage.setItem('app_total_answered', totalAnswered.toString()), [totalAnswered]);
  useEffect(() => localStorage.setItem('app_total_correct', totalCorrect.toString()), [totalCorrect]);
  useEffect(() => localStorage.setItem('app_streak', consecutiveCorrect.toString()), [consecutiveCorrect]);
  useEffect(() => localStorage.setItem('app_best_streak', bestStreak.toString()), [bestStreak]);
  useEffect(() => localStorage.setItem('app_envelopes_opened', envelopesOpened.toString()), [envelopesOpened]);
  useEffect(() => localStorage.setItem('app_subject_stats', JSON.stringify(subjectStats)), [subjectStats]);
  useEffect(() => localStorage.setItem('app_rewards', JSON.stringify(rewards)), [rewards]);
  useEffect(() => localStorage.setItem('app_achievements', JSON.stringify(achievements)), [achievements]);
  useEffect(() => localStorage.setItem('app_words', JSON.stringify(words)), [words]);
  useEffect(() => localStorage.setItem('app_grammar', JSON.stringify(grammarQuestions)), [grammarQuestions]);
  useEffect(() => localStorage.setItem('app_transactions', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('app_math_difficulty', mathDifficulty), [mathDifficulty]);
  useEffect(() => localStorage.setItem('app_backup_time', backupUpdatedAt), [backupUpdatedAt]);
  useEffect(() => localStorage.setItem('app_notification_url', notificationUrl), [notificationUrl]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ show: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, []);

  const safeConfetti = (opts: any) => {
    try {
      if (typeof confetti === 'function') {
        confetti(opts);
      } else if (typeof (window as any).confetti === 'function') {
        (window as any).confetti(opts);
      }
    } catch (e) {
      console.warn('Confetti failed to load or execute', e);
    }
  };

  const playSound = (type: 'success' | 'error' | 'envelope') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = type === 'success' ? 880 : type === 'envelope' ? 660 : 220;
      gain.gain.value = 0.08;
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // ignore audio errors
    }
  };

  const updateAchievements = (nextPoints: number, nextTotalCorrect: number, nextStreak: number, nextEnvelopes: number) => {
    setAchievements(prev => prev.map(achievement => {
      if (achievement.unlocked) return achievement;
      const unlock =
        (achievement.id === 'first-correct' && nextTotalCorrect >= 1) ||
        (achievement.id === 'correct-50' && nextTotalCorrect >= 50) ||
        (achievement.id === 'correct-100' && nextTotalCorrect >= 100) ||
        (achievement.id === 'correct-200' && nextTotalCorrect >= 200) ||
        (achievement.id === 'points-500' && nextPoints >= 500) ||
        (achievement.id === 'points-1000' && nextPoints >= 1000) ||
        (achievement.id === 'streak-5' && nextStreak >= 5) ||
        (achievement.id === 'streak-10' && nextStreak >= 10) ||
        (achievement.id === 'envelope-5' && nextEnvelopes >= 5);

      return unlock
        ? { ...achievement, unlocked: true, unlockedDate: new Date().toISOString() }
        : achievement;
    }));
  };

  const addPoints = (amount: number, description: string) => {
    if (amount <= 0) return;
    const nextPoints = points + amount;
    setPoints(nextPoints);
    const newTx: Transaction = {
      id: generateId(),
      date: new Date().toISOString(),
      description,
      amount,
      type: 'EARN'
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const spendPoints = (amount: number, description: string) => {
    const nextPoints = points - amount;
    setPoints(nextPoints);
    const newTx: Transaction = {
      id: generateId(),
      date: new Date().toISOString(),
      description,
      amount: -amount,
      type: 'SPEND'
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const sendRedeemNotification = async (reward: Reward, nextBalance: number) => {
    if (!notificationUrl) return;
    const timestamp = new Date().toLocaleString();
    const content = `小朋友兑换奖励：${reward.title}（${reward.cost} 分）\n剩余积分：${nextBalance}\n时间：${timestamp}`;
    try {
      const separator = notificationUrl.includes('?') ? '&' : '?';
      const url = `${notificationUrl}${separator}content=${encodeURIComponent(content)}`;
      await fetch(url, { mode: 'no-cors' });
    } catch (error) {
      console.error('通知发送失败', error);
    }
  };

  const applyAnswerResult = (isCorrect: boolean, source: LearningSource, extraLabel?: string) => {
    const nextTotalAnswered = totalAnswered + 1;
    const nextTotalCorrect = isCorrect ? totalCorrect + 1 : totalCorrect;
    const nextStreak = isCorrect ? consecutiveCorrect + 1 : 0;
    const nextBestStreak = Math.max(bestStreak, nextStreak);
    setTotalAnswered(nextTotalAnswered);
    setTotalCorrect(nextTotalCorrect);
    setConsecutiveCorrect(nextStreak);
    setBestStreak(nextBestStreak);

    const config = SOURCE_CONFIG[source];
    const todayKey = getDateKey();
    const currentStats = subjectStats[source];
    const currentDailyCount = currentStats.dailyDateKey === todayKey ? currentStats.dailyAnsweredCount : 0;
    const nextDailyCount = currentDailyCount + 1;

    const nextSubjectTotalAnswered = currentStats.totalAnswered + 1;
    const nextSubjectTotalCorrect = isCorrect ? currentStats.totalCorrect + 1 : currentStats.totalCorrect;
    const nextSubjectStreak = isCorrect ? currentStats.consecutiveCorrect + 1 : 0;
    const nextSubjectBestStreak = Math.max(currentStats.bestStreak, nextSubjectStreak);

    let nextQuestionsSinceEnvelope = currentStats.questionsSinceEnvelope + 1;
    const isDouble = nextDailyCount <= config.dailyDoubleLimit;

    let bonus = 0;
    if (isCorrect && nextSubjectStreak > 0 && nextSubjectStreak % config.streakRewardInterval === 0) {
      bonus = 5;
    }

    const baseGain = config.basePoints + bonus;
    const totalGain = isCorrect ? baseGain * (isDouble ? 2 : 1) : 0;

    if (isCorrect) {
      const labels = [] as string[];
      if (bonus > 0) labels.push('连对奖励');
      if (isDouble) labels.push('双倍积分（每日前十题）');
      if (extraLabel && !labels.includes(extraLabel)) labels.push(extraLabel);
      addPoints(totalGain, `${config.label}答题 +${totalGain}${labels.length ? `（${labels.join('，')}）` : ''}`);
      const nextPoints = points + totalGain;
      updateAchievements(nextPoints, nextTotalCorrect, nextStreak, envelopesOpened);
      setShowCelebration({ show: true, points: totalGain, type: 'success' });
      playSound('success');
      safeConfetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FBBF24', '#FCD34D', '#FDE68A']
      });
    } else {
      setShowCelebration({ show: true, points: 0, type: 'penalty' });
      playSound('error');
      updateAchievements(points, nextTotalCorrect, nextStreak, envelopesOpened);
    }

    setTimeout(() => setShowCelebration(prev => ({ ...prev, show: false })), 1200);

    let nextSignInStreak = currentStats.signInStreak;
    let nextLastSignInDate = currentStats.lastSignInDate;
    const shouldSignIn = currentStats.lastSignInDate !== todayKey;
    if (shouldSignIn) {
      nextSignInStreak = currentStats.lastSignInDate && isYesterday(currentStats.lastSignInDate, todayKey)
        ? currentStats.signInStreak + 1
        : 1;
      nextLastSignInDate = todayKey;
    }

    const canOpenEnvelope = !pendingEnvelope;
    if (canOpenEnvelope && shouldSignIn) {
      const rewardPoints = getSignInReward(nextSignInStreak);
      setPendingEnvelope({
        points: rewardPoints,
        kind: 'signin',
        sourceLabel: config.label,
        signInDay: nextSignInStreak
      });
    } else if (canOpenEnvelope && nextQuestionsSinceEnvelope >= config.envelopeInterval) {
      const reward = getEnvelopeReward(nextSubjectTotalAnswered);
      setPendingEnvelope({
        points: reward.points,
        luck: reward.luck,
        kind: 'normal',
        sourceLabel: config.label
      });
      nextQuestionsSinceEnvelope = 0;
    }

    setSubjectStats(prev => ({
      ...prev,
      [source]: {
        ...currentStats,
        totalAnswered: nextSubjectTotalAnswered,
        totalCorrect: nextSubjectTotalCorrect,
        consecutiveCorrect: nextSubjectStreak,
        bestStreak: nextSubjectBestStreak,
        questionsSinceEnvelope: nextQuestionsSinceEnvelope,
        dailyAnsweredCount: nextDailyCount,
        dailyDateKey: todayKey,
        lastSignInDate: nextLastSignInDate,
        signInStreak: nextSignInStreak
      }
    }));
  };

  const claimEnvelope = () => {
    if (!pendingEnvelope) return;
    const envelopeLabel = pendingEnvelope.kind === 'signin' ? '签到红包' : '红包奖励';
    addPoints(pendingEnvelope.points, envelopeLabel);
    const nextEnvelopes = envelopesOpened + 1;
    setEnvelopesOpened(nextEnvelopes);
    updateAchievements(points + pendingEnvelope.points, totalCorrect, consecutiveCorrect, nextEnvelopes);
    setPendingEnvelope(null);
    playSound('envelope');
    safeConfetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#FB7185', '#F97316', '#F59E0B']
    });
    showToast(`${envelopeLabel} +${pendingEnvelope.points} 分！`, 'success');
  };

  const createNewMathQuestion = (difficulty = mathDifficulty) => {
    const newQuestion = createMathQuestion(difficulty);
    setCurrentMathQuestion(newQuestion);
    return newQuestion;
  };

  const checkMathAnswer = (question: MathQuestion, answer: string) => {
    const normalized = answer.trim();
    let numeric = Number(normalized);
    if (!Number.isFinite(numeric) && normalized.includes(':')) {
      const [h, m] = normalized.split(':').map(part => Number(part));
      if (Number.isFinite(h) && Number.isFinite(m)) {
        numeric = Number(`${h}${formatTwoDigits(m)}`);
      }
    }
    if (!Number.isFinite(numeric)) {
      return { correct: false, correctAnswer: question.answer };
    }
    const correct = Math.abs(numeric - question.answer) < 0.0001;
    applyAnswerResult(correct, 'math');
    return { correct, correctAnswer: question.answer };
  };

  const redeemReward = (reward: Reward) => {
    if (points >= reward.cost) {
      spendPoints(reward.cost, `兑换: ${reward.title}`);
      const nextBalance = points - reward.cost;
      sendRedeemNotification(reward, nextBalance);
      safeConfetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#60A5FA', '#34D399', '#FCD34D'] });
      showToast(`成功兑换：${reward.title}`, 'success');
    } else {
      showToast(`积分不够，还差 ${reward.cost - points} 分。`, 'error');
    }
  };

  const updateWordAfterAnswer = (wordId: string, isCorrect: boolean, options?: { silent?: boolean }) => {
    setWords(prev => prev.map(word => {
      if (word.id !== wordId) return word;
      const nextStage = clamp(word.stage + (isCorrect ? 1 : -1), 0, REVIEW_INTERVALS.length - 1);
      return {
        ...word,
        stage: nextStage,
        familiarity: getFamiliarity(nextStage),
        lastReview: Date.now(),
        nextReview: scheduleNextReview(nextStage),
        correctCount: word.correctCount + (isCorrect ? 1 : 0),
        wrongCount: word.wrongCount + (isCorrect ? 0 : 1)
      };
    }));
    if (!options?.silent) {
      applyAnswerResult(isCorrect, 'word', isCorrect ? '单词' : '拼写');
    }
  };

  const revealWordAnswer = (wordId: string) => {
    updateWordAfterAnswer(wordId, false, { silent: true });
  };

  const updateGrammarAfterAnswer = (questionId: string, isCorrect: boolean) => {
    applyAnswerResult(isCorrect, 'grammar', '语法');
  };

  const parseWordLines = (lines: string[]) => {
    const list: WordItem[] = [];
    lines.forEach(line => {
      const cleaned = line.trim();
      if (!cleaned) return;
      const delimiter = LEARNING_CONFIG.wordImport.delimiters.find(d => cleaned.includes(d));
      if (!delimiter) return;
      const index = cleaned.indexOf(delimiter);
      if (index <= 0) return;
      const word = cleaned.slice(0, index).trim();
      const meaning = cleaned.slice(index + delimiter.length).trim();
      if (word.toLowerCase() === 'word' && meaning.toLowerCase() === 'meaning') return;
      if (!word || !meaning) return;
      if (!word || !meaning) return;
      list.push({
        id: generateId(),
        word: word.toLowerCase(),
        meaning,
        stage: 0,
        familiarity: 'new',
        nextReview: Date.now(),
        correctCount: 0,
        wrongCount: 0
      });
    });
    return list;
  };

  const importWords = async (file: File) => {
    const ext = file.name.toLowerCase().split('.').pop();
    if (!ext) return;

    try {
      if (ext === 'csv') {
        const data = await file.arrayBuffer();
        const text = decodeTextWithFallback(data);
        const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
        const newWords = parseWordLines(lines);
        setWords(newWords);
        showToast(`成功导入 ${newWords.length} 个单词`, 'success');
        return;
      }

      if (['xlsx', 'xls'].includes(ext)) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];
        const lines = rows.map(row => row.filter(Boolean).join(',')).filter(Boolean);
        const newWords = parseWordLines(lines);
        setWords(newWords);
        showToast(`成功导入 ${newWords.length} 个单词`, 'success');
        return;
      }

      if (ext === 'pdf') {
        const data = await file.arrayBuffer();
        const pdf = await getDocument({ data }).promise;
        const lines: string[] = [];
        for (let i = 1; i <= pdf.numPages; i += 1) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const text = content.items.map((item: any) => item.str).join(' ');
          text.split(/\n|\r/).forEach(line => lines.push(line));
        }
        const newWords = parseWordLines(lines);
        setWords(newWords);
        showToast(`成功导入 ${newWords.length} 个单词`, 'success');
        return;
      }
      showToast('暂不支持该文件格式', 'error');
    } catch (error) {
      console.error(error);
      showToast('导入失败，请检查文件格式', 'error');
    }
  };

  const parseGrammarRows = (rows: string[][]) => {
    const list: GrammarQuestion[] = [];
    rows.forEach(row => {
      if (row.length < LEARNING_CONFIG.grammarImport.expectedColumns - 1) return;
      const [sentence, a, b, c, d, answer, explanation] = row.map(item => `${item || ''}`.trim());
      const answerIndex = ['A', 'B', 'C', 'D'].indexOf(answer.toUpperCase());
      if (!sentence || answerIndex < 0) return;
      list.push({
        id: generateId(),
        sentence,
        options: [a, b, c, d],
        answerIndex,
        explanation: explanation || '请根据语法规则选择正确答案。'
      });
    });
    return list;
  };

  const importGrammar = async (file: File) => {
    const ext = file.name.toLowerCase().split('.').pop();
    if (!ext) return;
    try {
      if (['xlsx', 'xls', 'csv'].includes(ext)) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];
        const newQuestions = parseGrammarRows(rows);
        setGrammarQuestions(prev => [...newQuestions, ...prev]);
        showToast(`成功导入 ${newQuestions.length} 道语法题`, 'success');
        return;
      }

      if (ext === 'pdf') {
        const data = await file.arrayBuffer();
        const pdf = await getDocument({ data }).promise;
        const lines: string[] = [];
        for (let i = 1; i <= pdf.numPages; i += 1) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const text = content.items.map((item: any) => item.str).join(' ');
          text.split(/\n|\r/).forEach(line => lines.push(line));
        }
        const rows = lines.map(line => line.split(LEARNING_CONFIG.grammarImport.pdfDelimiter).map(item => item.trim()));
        const newQuestions = parseGrammarRows(rows);
        setGrammarQuestions(prev => [...newQuestions, ...prev]);
        showToast(`成功导入 ${newQuestions.length} 道语法题`, 'success');
        return;
      }
      showToast('暂不支持该文件格式', 'error');
    } catch (error) {
      console.error(error);
      showToast('导入失败，请检查文件格式', 'error');
    }
  };

  const exportData = () => {
    return JSON.stringify({
      userName,
      themeKey,
      points,
      totalAnswered,
      totalCorrect,
      consecutiveCorrect,
      bestStreak,
      envelopesOpened,
      subjectStats,
      rewards,
      achievements,
      words,
      grammarQuestions,
      transactions,
      notificationUrl
    });
  };

  const createBackup = useCallback(() => {
    const payload = exportData();
    localStorage.setItem(BACKUP_KEY, payload);
    const timestamp = new Date().toISOString();
    localStorage.setItem(BACKUP_TIME_KEY, timestamp);
    setBackupUpdatedAt(timestamp);
  }, [exportData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        createBackup();
      } catch {
        // ignore backup errors
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [
    userName,
    themeKey,
    points,
    totalAnswered,
    totalCorrect,
    consecutiveCorrect,
    bestStreak,
    envelopesOpened,
    subjectStats,
    rewards,
    achievements,
    words,
    grammarQuestions,
    transactions,
    createBackup
  ]);

  const importData = async (content: string) => {
    try {
      const data = JSON.parse(content);
      if (typeof data.userName === 'string') setUserName(data.userName);
      if (data.themeKey) setThemeKey(data.themeKey as ThemeKey);
      if (typeof data.points === 'number') setPoints(data.points);
      if (typeof data.totalAnswered === 'number') setTotalAnswered(data.totalAnswered);
      if (typeof data.totalCorrect === 'number') setTotalCorrect(data.totalCorrect);
      if (typeof data.consecutiveCorrect === 'number') setConsecutiveCorrect(data.consecutiveCorrect);
      if (typeof data.bestStreak === 'number') setBestStreak(data.bestStreak);
      if (typeof data.envelopesOpened === 'number') setEnvelopesOpened(data.envelopesOpened);
      if (data.subjectStats) setSubjectStats(normalizeSubjectStats(data.subjectStats, getDateKey()));
      if (Array.isArray(data.rewards)) setRewards(data.rewards);
      if (Array.isArray(data.achievements)) setAchievements(data.achievements);
      if (Array.isArray(data.words)) setWords(data.words);
      if (Array.isArray(data.grammarQuestions)) setGrammarQuestions(data.grammarQuestions);
      if (Array.isArray(data.transactions)) setTransactions(data.transactions);
      if (typeof data.notificationUrl === 'string') setNotificationUrl(data.notificationUrl);
      showToast('数据导入成功', 'success');
      return true;
    } catch (error) {
      console.error(error);
      showToast('导入失败，请检查文件内容', 'error');
      return false;
    }
  };

  const restoreFromBackup = async () => {
    const backup = localStorage.getItem(BACKUP_KEY);
    if (!backup) {
      showToast('未找到本地备份', 'error');
      return false;
    }
    return importData(backup);
  };

  const resetData = () => {
    if (window.confirm('确定要重置所有数据吗？此操作无法撤销！')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const luckValue = calculateLuck(totalAnswered);
  const mathStats = subjectStats.math;
  const mathAccuracy = mathStats.totalAnswered > 0 ? Math.round((mathStats.totalCorrect / mathStats.totalAnswered) * 100) : 0;
  const mathLuckValue = calculateLuck(mathStats.totalAnswered);
  const mathEnvelopeCountdown = SOURCE_CONFIG.math.envelopeInterval - mathStats.questionsSinceEnvelope;

  return {
    state: {
      activeTab,
      userName,
      themeKey,
      points,
      totalAnswered,
      totalCorrect,
      consecutiveCorrect,
      bestStreak,
      accuracy,
      luckValue,
      subjectStats,
      mathAccuracy,
      mathLuckValue,
      mathEnvelopeCountdown,
      backupUpdatedAt,
      notificationUrl,
      rewards,
      achievements,
      words,
      grammarQuestions,
      transactions,
      currentMathQuestion,
      mathDifficulty,
      pendingEnvelope,
      envelopesOpened,
      toast,
      showCelebration
    },
    actions: {
      setActiveTab,
      setUserName,
      setThemeKey,
      setMathDifficulty: (level: MathDifficulty) => {
        setMathDifficulty(level);
        setCurrentMathQuestion(createMathQuestion(level));
      },
      createNewMathQuestion,
      checkMathAnswer,
      redeemReward,
      updateWordAfterAnswer,
      revealWordAnswer,
      updateGrammarAfterAnswer,
      claimEnvelope,
      setRewards,
      setWords,
      setGrammarQuestions,
      importWords,
      importGrammar,
      exportData,
      importData,
      restoreFromBackup,
      setNotificationUrl,
      resetData,
      showToast,
      hideToast
    }
  };
};
