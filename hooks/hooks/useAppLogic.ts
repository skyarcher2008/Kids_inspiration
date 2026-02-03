// Deprecated. Use useLearningAppLogic instead.
export {};

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

export const useAppLogic = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('math');
  const [userName, setUserName] = useState(() => localStorage.getItem('app_username') || '');
  const [themeKey, setThemeKey] = useState<ThemeKey>(() => (localStorage.getItem('app_theme') as ThemeKey) || 'lemon');

  const [points, setPoints] = useState<number>(() => parseInt(localStorage.getItem('app_points') || '0', 10));
  const [totalAnswered, setTotalAnswered] = useState<number>(() => parseInt(localStorage.getItem('app_total_answered') || '0', 10));
  const [totalCorrect, setTotalCorrect] = useState<number>(() => parseInt(localStorage.getItem('app_total_correct') || '0', 10));
  const [consecutiveCorrect, setConsecutiveCorrect] = useState<number>(() => parseInt(localStorage.getItem('app_streak') || '0', 10));
  const [bestStreak, setBestStreak] = useState<number>(() => parseInt(localStorage.getItem('app_best_streak') || '0', 10));
  const [questionsSinceEnvelope, setQuestionsSinceEnvelope] = useState<number>(() => parseInt(localStorage.getItem('app_q_since_env') || '0', 10));
  const [envelopeInterval, setEnvelopeInterval] = useState<number>(() => parseInt(localStorage.getItem('app_envelope_interval') || String(DEFAULT_ENVELOPE_INTERVAL), 10));
  const [envelopesOpened, setEnvelopesOpened] = useState<number>(() => parseInt(localStorage.getItem('app_envelopes_opened') || '0', 10));
  const [pendingEnvelope, setPendingEnvelope] = useState<null | { points: number; luck: number }>(null);

  const [rewards, setRewards] = useState<Reward[]>(() => {
    const saved = localStorage.getItem('app_rewards');
    return saved ? JSON.parse(saved) : INITIAL_REWARDS;
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

  useEffect(() => localStorage.setItem('app_username', userName), [userName]);
  useEffect(() => localStorage.setItem('app_theme', themeKey), [themeKey]);
  useEffect(() => localStorage.setItem('app_points', points.toString()), [points]);
  useEffect(() => localStorage.setItem('app_total_answered', totalAnswered.toString()), [totalAnswered]);
  useEffect(() => localStorage.setItem('app_total_correct', totalCorrect.toString()), [totalCorrect]);
  useEffect(() => localStorage.setItem('app_streak', consecutiveCorrect.toString()), [consecutiveCorrect]);
  useEffect(() => localStorage.setItem('app_best_streak', bestStreak.toString()), [bestStreak]);
  useEffect(() => localStorage.setItem('app_q_since_env', questionsSinceEnvelope.toString()), [questionsSinceEnvelope]);
  useEffect(() => localStorage.setItem('app_envelope_interval', envelopeInterval.toString()), [envelopeInterval]);
  useEffect(() => localStorage.setItem('app_envelopes_opened', envelopesOpened.toString()), [envelopesOpened]);
  useEffect(() => localStorage.setItem('app_rewards', JSON.stringify(rewards)), [rewards]);
  useEffect(() => localStorage.setItem('app_achievements', JSON.stringify(achievements)), [achievements]);
  useEffect(() => localStorage.setItem('app_words', JSON.stringify(words)), [words]);
  useEffect(() => localStorage.setItem('app_grammar', JSON.stringify(grammarQuestions)), [grammarQuestions]);
  useEffect(() => localStorage.setItem('app_transactions', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('app_math_difficulty', mathDifficulty), [mathDifficulty]);

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

  const applyAnswerResult = (isCorrect: boolean, source: 'math' | 'word' | 'grammar', extraLabel?: string) => {
    const nextTotalAnswered = totalAnswered + 1;
    const nextTotalCorrect = isCorrect ? totalCorrect + 1 : totalCorrect;
    const nextStreak = isCorrect ? consecutiveCorrect + 1 : 0;
    const nextBestStreak = Math.max(bestStreak, nextStreak);
    setTotalAnswered(nextTotalAnswered);
    setTotalCorrect(nextTotalCorrect);
    setConsecutiveCorrect(nextStreak);
    setBestStreak(nextBestStreak);

    let bonus = 0;
    if (isCorrect) {
      if (nextStreak % 10 === 0) bonus += 15;
      else if (nextStreak % 5 === 0) bonus += 5;
      const totalGain = 10 + bonus;
      addPoints(totalGain, `${source}答题 +${totalGain}${extraLabel ? `（${extraLabel}）` : ''}`);
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

    const nextSince = questionsSinceEnvelope + 1;
    if (nextSince >= envelopeInterval) {
      const reward = getEnvelopeReward(nextTotalAnswered);
      setPendingEnvelope(reward);
      setQuestionsSinceEnvelope(0);
    } else {
      setQuestionsSinceEnvelope(nextSince);
    }
  };

  const claimEnvelope = () => {
    if (!pendingEnvelope) return;
    addPoints(pendingEnvelope.points, '红包奖励');
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
    showToast(`红包奖励 +${pendingEnvelope.points} 分！`, 'success');
  };

  const createNewMathQuestion = (difficulty = mathDifficulty) => {
    const newQuestion = createMathQuestion(difficulty);
    setCurrentMathQuestion(newQuestion);
    return newQuestion;
  };

  const checkMathAnswer = (question: MathQuestion, answer: string) => {
    const normalized = answer.trim();
    const numeric = Number(normalized);
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
      safeConfetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#60A5FA', '#34D399', '#FCD34D'] });
      showToast(`成功兑换：${reward.title}`, 'success');
    } else {
      showToast(`积分不够，还差 ${reward.cost - points} 分。`, 'error');
    }
  };

  const updateWordAfterAnswer = (wordId: string, isCorrect: boolean) => {
    setWords(prev => prev.map(word => {
      if (word.id !== wordId) return word;
      const nextStage = clamp(word.stage + (isCorrect ? 1 : -1), 0, REVIEW_INTERVALS.length - 1);
      const updated = {
        ...word,
        stage: nextStage,
        familiarity: getFamiliarity(nextStage),
        lastReview: Date.now(),
        nextReview: scheduleNextReview(nextStage),
        correctCount: word.correctCount + (isCorrect ? 1 : 0),
        wrongCount: word.wrongCount + (isCorrect ? 0 : 1)
      };
      return updated;
    }));
    applyAnswerResult(isCorrect, 'word', isCorrect ? '单词' : '拼写');
  };

  const updateGrammarAfterAnswer = (questionId: string, isCorrect: boolean) => {
    applyAnswerResult(isCorrect, 'grammar', '语法');
  };

  const parseWordLines = (lines: string[]) => {
    const list: WordItem[] = [];
    lines.forEach(line => {
      const cleaned = line.replace(/\s+/g, ' ').trim();
      if (!cleaned) return;
      const parts = cleaned.includes(',') ? cleaned.split(',') : cleaned.split(' ');
      const [word, meaning] = [parts[0], parts.slice(1).join(' ')].map(p => p?.trim()).filter(Boolean);
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
      if (['xlsx', 'xls', 'csv'].includes(ext)) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];
        const lines = rows.map(row => row.filter(Boolean).join(',')).filter(Boolean);
        const newWords = parseWordLines(lines);
        setWords(prev => [...newWords, ...prev]);
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
        setWords(prev => [...newWords, ...prev]);
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
      if (row.length < 6) return;
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
        const rows = lines.map(line => line.split('|').map(item => item.trim()));
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
      questionsSinceEnvelope,
      envelopeInterval,
      envelopesOpened,
      rewards,
      achievements,
      words,
      grammarQuestions,
      transactions
    });
  };

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
      if (typeof data.questionsSinceEnvelope === 'number') setQuestionsSinceEnvelope(data.questionsSinceEnvelope);
      if (typeof data.envelopeInterval === 'number') setEnvelopeInterval(data.envelopeInterval);
      if (typeof data.envelopesOpened === 'number') setEnvelopesOpened(data.envelopesOpened);
      if (Array.isArray(data.rewards)) setRewards(data.rewards);
      if (Array.isArray(data.achievements)) setAchievements(data.achievements);
      if (Array.isArray(data.words)) setWords(data.words);
      if (Array.isArray(data.grammarQuestions)) setGrammarQuestions(data.grammarQuestions);
      if (Array.isArray(data.transactions)) setTransactions(data.transactions);
      showToast('数据导入成功', 'success');
      return true;
    } catch (error) {
      console.error(error);
      showToast('导入失败，请检查文件内容', 'error');
      return false;
    }
  };

  const resetData = () => {
    if (window.confirm('确定要重置所有数据吗？此操作无法撤销！')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const luckValue = calculateLuck(totalAnswered);
  const envelopeCountdown = envelopeInterval - questionsSinceEnvelope;

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
      envelopeInterval,
      envelopeCountdown,
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
      updateGrammarAfterAnswer,
      claimEnvelope,
      setRewards,
      setWords,
      setGrammarQuestions,
      importWords,
      importGrammar,
      exportData,
      importData,
      setEnvelopeInterval,
      resetData,
      showToast,
      hideToast
    }
  };
};

  const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  const pickOne = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

  const formatTwoDigits = (num: number) => num.toString().padStart(2, '0');

  const createMathQuestion = (difficulty: MathDifficulty): MathQuestion => {
    const id = generateId();

    if (difficulty === 'easy') {
      const type = pickOne(['add', 'sub', 'time', 'unit']);
      if (type === 'add') {
        const a = randomInt(5, 50);
        const b = randomInt(5, 50);
        return { id, prompt: `${a} + ${b} = ?`, answer: a + b, difficulty };
      }
      if (type === 'sub') {
        const a = randomInt(20, 80);
        const b = randomInt(1, a - 1);
        return { id, prompt: `${a} - ${b} = ?`, answer: a - b, difficulty };
      }
      if (type === 'time') {
        const hour = randomInt(1, 11);
        const minute = randomInt(0, 50);
        const addMinutes = pickOne([10, 15, 20, 30]);
        const totalMinutes = hour * 60 + minute + addMinutes;
        const newHour = Math.floor(totalMinutes / 60) % 12 || 12;
        const newMinute = totalMinutes % 60;
        return {
          id,
          prompt: `现在是 ${hour}:${formatTwoDigits(minute)}，再过 ${addMinutes} 分钟是几点？`,
          answer: Number(`${newHour}${formatTwoDigits(newMinute)}`),
          difficulty
        };
      }
      const meters = randomInt(1, 9);
      return { id, prompt: `${meters} 米 = ? 厘米`, answer: meters * 100, difficulty };
    }

    if (difficulty === 'medium') {
      const type = pickOne(['mul', 'div', 'mix', 'unit']);
      if (type === 'mul') {
        const a = randomInt(2, 9);
        const b = randomInt(3, 12);
        return { id, prompt: `${a} × ${b} = ?`, answer: a * b, difficulty };
      }
      if (type === 'div') {
        const b = randomInt(2, 9);
        const a = b * randomInt(3, 12);
        return { id, prompt: `${a} ÷ ${b} = ?`, answer: a / b, difficulty };
      }
      if (type === 'mix') {
        const a = randomInt(10, 40);
        const b = randomInt(2, 9);
        const c = randomInt(2, 9);
        return { id, prompt: `${a} + ${b} × ${c} = ?`, answer: a + b * c, difficulty };
      }
      const kg = randomInt(1, 5);
      return { id, prompt: `${kg} 千克 = ? 克`, answer: kg * 1000, difficulty };
    }

    const type = pickOne(['mixed', 'time', 'unit']);
    if (type === 'mixed') {
      const a = randomInt(20, 60);
      const b = randomInt(3, 9);
      const c = randomInt(2, 9);
      return { id, prompt: `(${a} - ${b}) × ${c} = ?`, answer: (a - b) * c, difficulty };
    }
    if (type === 'time') {
      const hour = randomInt(6, 11);
      const minute = randomInt(0, 40);
      const addMinutes = pickOne([35, 45, 50, 55]);
      const totalMinutes = hour * 60 + minute + addMinutes;
      const newHour = Math.floor(totalMinutes / 60) % 12 || 12;
      const newMinute = totalMinutes % 60;
      return {
        id,
        prompt: `现在是 ${hour}:${formatTwoDigits(minute)}，再过 ${addMinutes} 分钟是几点？`,
        answer: Number(`${newHour}${formatTwoDigits(newMinute)}`),
        difficulty
      };
    }
    const km = randomInt(1, 4);
    const m = randomInt(100, 900);
    return {
      id,
      prompt: `${km} 千米 ${m} 米 = ? 米`,
      answer: km * 1000 + m,
      difficulty
    };
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

  export const useAppLogic = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('math');
    const [userName, setUserName] = useState(() => localStorage.getItem('app_username') || '');
    const [themeKey, setThemeKey] = useState<ThemeKey>(() => (localStorage.getItem('app_theme') as ThemeKey) || 'lemon');

    const [points, setPoints] = useState<number>(() => parseInt(localStorage.getItem('app_points') || '0', 10));
    const [totalAnswered, setTotalAnswered] = useState<number>(() => parseInt(localStorage.getItem('app_total_answered') || '0', 10));
    const [totalCorrect, setTotalCorrect] = useState<number>(() => parseInt(localStorage.getItem('app_total_correct') || '0', 10));
    const [consecutiveCorrect, setConsecutiveCorrect] = useState<number>(() => parseInt(localStorage.getItem('app_streak') || '0', 10));
    const [bestStreak, setBestStreak] = useState<number>(() => parseInt(localStorage.getItem('app_best_streak') || '0', 10));
    const [questionsSinceEnvelope, setQuestionsSinceEnvelope] = useState<number>(() => parseInt(localStorage.getItem('app_q_since_env') || '0', 10));
    const [envelopeInterval, setEnvelopeInterval] = useState<number>(() => parseInt(localStorage.getItem('app_envelope_interval') || String(DEFAULT_ENVELOPE_INTERVAL), 10));
    const [envelopesOpened, setEnvelopesOpened] = useState<number>(() => parseInt(localStorage.getItem('app_envelopes_opened') || '0', 10));
    const [pendingEnvelope, setPendingEnvelope] = useState<null | { points: number; luck: number }>(null);

    const [rewards, setRewards] = useState<Reward[]>(() => {
      const saved = localStorage.getItem('app_rewards');
      return saved ? JSON.parse(saved) : INITIAL_REWARDS;
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

    useEffect(() => localStorage.setItem('app_username', userName), [userName]);
    useEffect(() => localStorage.setItem('app_theme', themeKey), [themeKey]);
    useEffect(() => localStorage.setItem('app_points', points.toString()), [points]);
    useEffect(() => localStorage.setItem('app_total_answered', totalAnswered.toString()), [totalAnswered]);
    useEffect(() => localStorage.setItem('app_total_correct', totalCorrect.toString()), [totalCorrect]);
    useEffect(() => localStorage.setItem('app_streak', consecutiveCorrect.toString()), [consecutiveCorrect]);
    useEffect(() => localStorage.setItem('app_best_streak', bestStreak.toString()), [bestStreak]);
    useEffect(() => localStorage.setItem('app_q_since_env', questionsSinceEnvelope.toString()), [questionsSinceEnvelope]);
    useEffect(() => localStorage.setItem('app_envelope_interval', envelopeInterval.toString()), [envelopeInterval]);
    useEffect(() => localStorage.setItem('app_envelopes_opened', envelopesOpened.toString()), [envelopesOpened]);
    useEffect(() => localStorage.setItem('app_rewards', JSON.stringify(rewards)), [rewards]);
    useEffect(() => localStorage.setItem('app_achievements', JSON.stringify(achievements)), [achievements]);
    useEffect(() => localStorage.setItem('app_words', JSON.stringify(words)), [words]);
    useEffect(() => localStorage.setItem('app_grammar', JSON.stringify(grammarQuestions)), [grammarQuestions]);
    useEffect(() => localStorage.setItem('app_transactions', JSON.stringify(transactions)), [transactions]);
    useEffect(() => localStorage.setItem('app_math_difficulty', mathDifficulty), [mathDifficulty]);

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

    const applyAnswerResult = (isCorrect: boolean, source: 'math' | 'word' | 'grammar', extraLabel?: string) => {
      const nextTotalAnswered = totalAnswered + 1;
      const nextTotalCorrect = isCorrect ? totalCorrect + 1 : totalCorrect;
      const nextStreak = isCorrect ? consecutiveCorrect + 1 : 0;
      const nextBestStreak = Math.max(bestStreak, nextStreak);
      setTotalAnswered(nextTotalAnswered);
      setTotalCorrect(nextTotalCorrect);
      setConsecutiveCorrect(nextStreak);
      setBestStreak(nextBestStreak);

      let bonus = 0;
      if (isCorrect) {
        if (nextStreak % 10 === 0) bonus += 15;
        else if (nextStreak % 5 === 0) bonus += 5;
        const totalGain = 10 + bonus;
        addPoints(totalGain, `${source}答题 +${totalGain}${extraLabel ? `（${extraLabel}）` : ''}`);
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

      const nextSince = questionsSinceEnvelope + 1;
      if (nextSince >= envelopeInterval) {
        const reward = getEnvelopeReward(nextTotalAnswered);
        setPendingEnvelope(reward);
        setQuestionsSinceEnvelope(0);
      } else {
        setQuestionsSinceEnvelope(nextSince);
      }

    
    };

    const claimEnvelope = () => {
      if (!pendingEnvelope) return;
      addPoints(pendingEnvelope.points, '红包奖励');
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
      showToast(`红包奖励 +${pendingEnvelope.points} 分！`, 'success');
    };

    const createNewMathQuestion = (difficulty = mathDifficulty) => {
      const newQuestion = createMathQuestion(difficulty);
      setCurrentMathQuestion(newQuestion);
      return newQuestion;
    };

    const checkMathAnswer = (question: MathQuestion, answer: string) => {
      const normalized = answer.trim();
      const numeric = Number(normalized);
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
        safeConfetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#60A5FA', '#34D399', '#FCD34D'] });
        showToast(`成功兑换：${reward.title}`, 'success');
      } else {
        showToast(`积分不够，还差 ${reward.cost - points} 分。`, 'error');
      }
    };

    const updateWordAfterAnswer = (wordId: string, isCorrect: boolean) => {
      setWords(prev => prev.map(word => {
        if (word.id !== wordId) return word;
        const nextStage = clamp(word.stage + (isCorrect ? 1 : -1), 0, REVIEW_INTERVALS.length - 1);
        const updated = {
          ...word,
          stage: nextStage,
          familiarity: getFamiliarity(nextStage),
          lastReview: Date.now(),
          nextReview: scheduleNextReview(nextStage),
          correctCount: word.correctCount + (isCorrect ? 1 : 0),
          wrongCount: word.wrongCount + (isCorrect ? 0 : 1)
        };
        return updated;
      }));
      applyAnswerResult(isCorrect, 'word', isCorrect ? '单词' : '拼写');
    };

    const updateGrammarAfterAnswer = (questionId: string, isCorrect: boolean) => {
      applyAnswerResult(isCorrect, 'grammar', '语法');
    };

    const parseWordLines = (lines: string[]) => {
      const list: WordItem[] = [];
      lines.forEach(line => {
        const cleaned = line.replace(/\s+/g, ' ').trim();
        if (!cleaned) return;
        const parts = cleaned.includes(',') ? cleaned.split(',') : cleaned.split(' ');
        const [word, meaning] = [parts[0], parts.slice(1).join(' ')].map(p => p?.trim()).filter(Boolean);
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
        if (['xlsx', 'xls', 'csv'].includes(ext)) {
          const data = await file.arrayBuffer();
          const workbook = XLSX.read(data, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];
          const lines = rows.map(row => row.filter(Boolean).join(',')).filter(Boolean);
          const newWords = parseWordLines(lines);
          setWords(prev => [...newWords, ...prev]);
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
          setWords(prev => [...newWords, ...prev]);
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
        if (row.length < 6) return;
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
          const rows = lines.map(line => line.split('|').map(item => item.trim()));
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
        questionsSinceEnvelope,
        envelopeInterval,
        envelopesOpened,
        rewards,
        achievements,
        words,
        grammarQuestions,
        transactions
      });
    };

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
        if (typeof data.questionsSinceEnvelope === 'number') setQuestionsSinceEnvelope(data.questionsSinceEnvelope);
        if (typeof data.envelopeInterval === 'number') setEnvelopeInterval(data.envelopeInterval);
        if (typeof data.envelopesOpened === 'number') setEnvelopesOpened(data.envelopesOpened);
        if (Array.isArray(data.rewards)) setRewards(data.rewards);
        if (Array.isArray(data.achievements)) setAchievements(data.achievements);
        if (Array.isArray(data.words)) setWords(data.words);
        if (Array.isArray(data.grammarQuestions)) setGrammarQuestions(data.grammarQuestions);
        if (Array.isArray(data.transactions)) setTransactions(data.transactions);
        showToast('数据导入成功', 'success');
        return true;
      } catch (error) {
        console.error(error);
        showToast('导入失败，请检查文件内容', 'error');
        return false;
      }
    };

    const resetData = () => {
      if (window.confirm('确定要重置所有数据吗？此操作无法撤销！')) {
        localStorage.clear();
        window.location.reload();
      }
    };

    const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
    const luckValue = calculateLuck(totalAnswered);
    const envelopeCountdown = envelopeInterval - questionsSinceEnvelope;

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
        envelopeInterval,
        envelopeCountdown,
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
        updateGrammarAfterAnswer,
        claimEnvelope,
        setRewards,
        setWords,
        setGrammarQuestions,
        importWords,
        importGrammar,
        exportData,
        importData,
        setEnvelopeInterval,
        resetData,
        showToast,
        hideToast
      }
    };
  };
