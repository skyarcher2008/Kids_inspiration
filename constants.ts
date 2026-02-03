
import { Reward, Achievement, WordItem, GrammarQuestion } from './types';

export const DEFAULT_ENVELOPE_INTERVAL = 5;

export const INITIAL_REWARDS: Reward[] = [
  { id: 'cash-1000', title: '7元钱', cost: 1000, icon: '💵' },
  { id: 'cash-2000', title: '16元钱', cost: 2000, icon: '💵' },
  { id: 'cash-3000', title: '27元钱', cost: 3000, icon: '💵' },
  { id: 'cash-4000', title: '38元钱', cost: 4000, icon: '💵' },
  { id: 'cash-5000', title: '50元钱', cost: 5000, icon: '💵' },
  { id: 'cash-10000', title: '100元钱', cost: 10000, icon: '💵' },
  {
    id: 'reward-sanrio-face',
    title: '三丽鸥家族-变脸公仔系列盲盒',
    cost: 4999,
    icon: '🎁',
    link: '/Sanrio 三丽鸥家族-变脸公仔系列盲盒 - 随机发货 _ 玩具反斗城中国官方网站 _ Toys_R_Us China Official Website.mhtml'
  },
  {
    id: 'reward-sanrio-birthday',
    title: '三丽鸥家族-生日许愿系列毛绒盲盒',
    cost: 4999,
    icon: '🎁',
    link: '/Sanrio三丽鸥家族-生日许愿系列毛绒盲盒 - 随机发货 _ 玩具反斗城中国官方网站 _ Toys_R_Us China Official Website.mhtml'
  },
  {
    id: 'reward-frozen',
    title: '迪士尼冰雪奇缘系列水晶球盲盒',
    cost: 4999,
    icon: '❄️',
    link: '/Disney Frozen迪士尼冰雪奇缘系列水晶球盲盒 - 随机发货 _ 玩具反斗城中国官方网站 _ Toys_R_Us China Official Website.mhtml'
  },
  {
    id: 'reward-stitch',
    title: '史迪奇怪可爱系列盲盒',
    cost: 5999,
    icon: '🪐',
    link: '/52Toys 史迪奇怪可爱系列盲盒 - 随机发货 _ 玩具反斗城中国官方网站 _ Toys_R_Us China Official Website.mhtml'
  },
  {
    id: 'reward-mengke',
    title: '奇妙萌可大电影特别版盲盒',
    cost: 5999,
    icon: '🎬',
    link: '/奇妙萌可大电影特别版盲盒 - 随机发货 _ 玩具反斗城中国官方网站 _ Toys_R_Us China Official Website.mhtml'
  }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first-correct', name: '初次闯关', description: '第一次答对题目', icon: '🌟', unlocked: false },
  { id: 'correct-50', name: '题海小将', description: '累计答对50题', icon: '✨', unlocked: false },
  { id: 'correct-100', name: '答题达人', description: '累计答对100题', icon: '💫', unlocked: false },
  { id: 'correct-200', name: '刷题高手', description: '累计答对200题', icon: '🌠', unlocked: false },
  { id: 'points-500', name: '积分起飞', description: '累计积分达到500', icon: '🚀', unlocked: false },
  { id: 'points-1000', name: '积分大师', description: '累计积分达到1000', icon: '🏆', unlocked: false },
  { id: 'streak-5', name: '连对5题', description: '连续答对5题', icon: '🔥', unlocked: false },
  { id: 'streak-10', name: '连对10题', description: '连续答对10题', icon: '⚡', unlocked: false },
  { id: 'envelope-5', name: '红包达人', description: '开启5个红包', icon: '🧧', unlocked: false }
];

export const DEFAULT_WORDS: WordItem[] = [
  {
    id: 'w1',
    word: 'apple',
    meaning: '苹果',
    stage: 0,
    familiarity: 'new',
    nextReview: Date.now(),
    correctCount: 0,
    wrongCount: 0
  },
  {
    id: 'w2',
    word: 'banana',
    meaning: '香蕉',
    stage: 0,
    familiarity: 'new',
    nextReview: Date.now(),
    correctCount: 0,
    wrongCount: 0
  },
  {
    id: 'w3',
    word: 'teacher',
    meaning: '老师',
    stage: 0,
    familiarity: 'new',
    nextReview: Date.now(),
    correctCount: 0,
    wrongCount: 0
  }
];

export const DEFAULT_GRAMMAR_QUESTIONS: GrammarQuestion[] = [
  {
    id: 'g1',
    sentence: 'I ____ to school by bus every day.',
    options: ['go', 'goes', 'going', 'went'],
    answerIndex: 0,
    explanation: '主语是 I，用动词原形 go。'
  },
  {
    id: 'g2',
    sentence: 'She ____ a book now.',
    options: ['read', 'reads', 'is reading', 'reading'],
    answerIndex: 2,
    explanation: 'now 表示正在进行，用现在进行时 is reading。'
  },
  {
    id: 'g3',
    sentence: 'We ____ a picnic last Sunday.',
    options: ['have', 'has', 'had', 'having'],
    answerIndex: 2,
    explanation: 'last Sunday 表示过去，用过去式 had。'
  }
];
