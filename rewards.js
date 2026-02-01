// 成就统计系统
class RewardsManager {
    constructor() {
        this.achievements = this.loadAchievements();
        this.stats = this.calculateStats();
        this.init();
    }

    init() {
        this.renderStats();
        this.renderAchievements();
        this.initChart();
        this.animateWelcome();
    }

    // 数据持久化
    loadAchievements() {
        const saved = localStorage.getItem('achievements');
        return saved ? JSON.parse(saved) : this.getDefaultAchievements();
    }

    saveAchievements() {
        localStorage.setItem('achievements', JSON.stringify(this.achievements));
    }

    getDefaultAchievements() {
        return [
            // 基础任务成就
            {
                id: 1,
                name: '初次尝试',
                description: '完成第一个任务',
                icon: '🌟',
                category: 'task',
                requirement: 1,
                current: 1,
                unlocked: true,
                unlockedAt: new Date().toISOString(),
                points: 10
            },
            {
                id: 2,
                name: '任务达人',
                description: '完成10个任务',
                icon: '📋',
                category: 'task',
                requirement: 10,
                current: 8,
                unlocked: false,
                points: 50
            },
            {
                id: 3,
                name: '超级完成者',
                description: '完成50个任务',
                icon: '🏆',
                category: 'task',
                requirement: 50,
                current: 8,
                unlocked: false,
                points: 200
            },
            
            // 连续成就
            {
                id: 4,
                name: '坚持不懈',
                description: '连续3天完成任务',
                icon: '🔥',
                category: 'streak',
                requirement: 3,
                current: 3,
                unlocked: true,
                unlockedAt: new Date().toISOString(),
                points: 30
            },
            {
                id: 5,
                name: '一周勇士',
                description: '连续7天完成任务',
                icon: '⚡',
                category: 'streak',
                requirement: 7,
                current: 3,
                unlocked: false,
                points: 100
            },
            {
                id: 6,
                name: '月度冠军',
                description: '连续30天完成任务',
                icon: '👑',
                category: 'streak',
                requirement: 30,
                current: 3,
                unlocked: false,
                points: 500
            },
            
            // 积分类成就
            {
                id: 7,
                name: '积分新秀',
                description: '累计获得100积分',
                icon: '💰',
                category: 'points',
                requirement: 100,
                current: 156,
                unlocked: true,
                unlockedAt: new Date().toISOString(),
                points: 20
            },
            {
                id: 8,
                name: '积分富翁',
                description: '累计获得500积分',
                icon: '💎',
                category: 'points',
                requirement: 500,
                current: 156,
                unlocked: false,
                points: 100
            },
            {
                id: 9,
                name: '积分大师',
                description: '累计获得1000积分',
                icon: '💍',
                category: 'points',
                requirement: 1000,
                current: 156,
                unlocked: false,
                points: 300
            },
            
            // 心愿类成就
            {
                id: 10,
                name: '心愿实现家',
                description: '实现第一个心愿',
                icon: '🌈',
                category: 'wish',
                requirement: 1,
                current: 1,
                unlocked: true,
                unlockedAt: new Date().toISOString(),
                points: 50
            },
            {
                id: 11,
                name: '心愿收藏家',
                description: '实现5个心愿',
                icon: '🎁',
                category: 'wish',
                requirement: 5,
                current: 1,
                unlocked: false,
                points: 200
            },
            
            // 完成率类成就
            {
                id: 12,
                name: '完美一周',
                description: '单周完成率达到100%',
                icon: '💯',
                category: 'weekly_completion',
                requirement: 100,
                current: 75,
                unlocked: false,
                points: 150
            },
            {
                id: 13,
                name: '稳定发挥',
                description: '连续4周完成率超过80%',
                icon: '📈',
                category: 'monthly_completion',
                requirement: 80,
                current: 75,
                unlocked: false,
                points: 300
            },
            
            // 难度类成就
            {
                id: 14,
                name: '困难挑战者',
                description: '完成5个困难任务',
                icon: '⚔️',
                category: 'difficulty',
                requirement: 5,
                current: 2,
                unlocked: false,
                points: 100
            },
            {
                id: 15,
                name: '终极挑战者',
                description: '完成10个超级挑战任务',
                icon: '🗡️',
                category: 'super_difficulty',
                requirement: 10,
                current: 0,
                unlocked: false,
                points: 500
            },
            
            // 时间类成就
            {
                id: 16,
                name: '时间管理大师',
                description: '提前完成10个任务',
                icon: '⏰',
                category: 'time',
                requirement: 10,
                current: 4,
                unlocked: false,
                points: 80
            },
            {
                id: 17,
                name: '早起鸟儿',
                description: '在上午10点前完成5个任务',
                icon: '🌅',
                category: 'morning',
                requirement: 5,
                current: 2,
                unlocked: false,
                points: 60
            },
            
            // 技能类成就
            {
                id: 18,
                name: '学习小能手',
                description: '完成20个学习任务',
                icon: '📚',
                category: 'learning',
                requirement: 20,
                current: 5,
                unlocked: false,
                points: 120
            },
            {
                id: 19,
                name: '家务小帮手',
                description: '完成15个家务任务',
                icon: '🧹',
                category: 'chore',
                requirement: 15,
                current: 8,
                unlocked: false,
                points: 100
            },
            {
                id: 20,
                name: '运动健将',
                description: '完成10个运动任务',
                icon: '⚽',
                category: 'sports',
                requirement: 10,
                current: 3,
                unlocked: false,
                points: 80
            },
            
            // 特殊成就
            {
                id: 21,
                name: '全能小勇士',
                description: '解锁10个不同的成就',
                icon: '🎖️',
                category: 'variety',
                requirement: 10,
                current: 3,
                unlocked: false,
                points: 300
            },
            {
                id: 22,
                name: '幸运星',
                description: '在生日当天完成任务',
                icon: '🎂',
                category: 'special',
                requirement: 1,
                current: 0,
                unlocked: false,
                points: 100
            }
        ];
    }

    // 计算统计数据
    calculateStats() {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const wishes = JSON.parse(localStorage.getItem('wishes') || '[]');
        const deductions = JSON.parse(localStorage.getItem('deductions') || '[]');
        
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        const earnedPoints = tasks
            .filter(task => task.status === 'completed')
            .reduce((sum, task) => sum + task.points, 0);
        
        const deductedPoints = deductions.reduce((sum, deduction) => sum + deduction.points, 0);
        const achievements = JSON.parse(localStorage.getItem('achievements') || '[]');
        const achievementPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + (parseInt(a.points) || 0), 0);
        const totalPoints = Math.max(0, earnedPoints + achievementPoints - deductedPoints);
        
        const unlockedAchievements = this.achievements.filter(a => a.unlocked).length;
        const currentStreak = this.calculateStreak(tasks);
        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        const weeklyTasks = tasks.filter(t => new Date(t.createdAt) >= sevenDaysAgo).length;
        const weeklyPoints = tasks
            .filter(t => t.status === 'completed' && new Date(t.completedAt) >= sevenDaysAgo)
            .reduce((sum, t) => sum + t.points, 0);
        const weeklyDenominator = weeklyTasks || 0;
        const weeklyCompletedCount = tasks.filter(t => t.status === 'completed' && new Date(t.completedAt) >= sevenDaysAgo).length;
        const weeklyCompletionRate = weeklyDenominator ? Math.round((weeklyCompletedCount / weeklyDenominator) * 100) : 0;
        
        return {
            totalTasksCompleted: completedTasks,
            totalPointsEarned: totalPoints,
            totalAchievements: unlockedAchievements,
            currentStreak: currentStreak,
            weeklyTasks: weeklyTasks,
            weeklyPoints: weeklyPoints,
            completionRate: Math.round((completedTasks / tasks.length) * 100) || 0,
            weeklyCompletionRate: weeklyCompletionRate,
            monthlyCompletionRate: 80,
            difficultTasks: this.getCompletedTasksByDifficulty(3),
            superDifficultTasks: this.getCompletedTasksByDifficulty(4) + this.getCompletedTasksByDifficulty(5),
            earlyTasks: this.getEarlyCompletedTasks(),
            morningTasks: this.getMorningCompletedTasks(),
            learningTasks: this.getCompletedTasksByCategory('learning'),
            choreTasks: this.getCompletedTasksByCategory('chore'),
            sportsTasks: this.getCompletedTasksByCategory('sports')
        };
    }

    calculateStreak(tasks) {
        // 简化的连续天数计算
        const today = new Date();
        let streak = 0;
        
        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            const dateStr = checkDate.toDateString();
            
            const hasCompletedTask = tasks.some(task => {
                if (task.status !== 'completed') return false;
                const taskDate = new Date(task.completedAt);
                return taskDate.toDateString() === dateStr;
            });
            
            if (hasCompletedTask) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }

    // 渲染统计数据
    renderStats() {
        document.getElementById('totalTasksCompleted').textContent = this.stats.totalTasksCompleted;
        document.getElementById('totalPointsEarned').textContent = this.stats.totalPointsEarned;
        document.getElementById('totalAchievements').textContent = this.stats.totalAchievements;
        document.getElementById('currentStreak').textContent = this.stats.currentStreak;
        document.getElementById('weeklyTasks').textContent = this.stats.weeklyTasks;
        document.getElementById('weeklyPoints').textContent = this.stats.weeklyPoints;
        document.getElementById('completionRate').textContent = this.stats.completionRate + '%';

        // 添加数字动画
        this.animateNumbers();
    }

    animateNumbers() {
        const elements = ['totalTasksCompleted', 'totalPointsEarned', 'totalAchievements', 'currentStreak'];
        elements.forEach(id => {
            const element = document.getElementById(id);
            anime({
                targets: element,
                scale: [1, 1.1, 1],
                duration: 600,
                easing: 'easeInOutQuad'
            });
        });
    }

    // 渲染成就列表
    renderAchievements() {
        const achievementsList = document.getElementById('achievementsList');
        
        achievementsList.innerHTML = this.achievements.map(achievement => 
            this.renderAchievementCard(achievement)
        ).join('');
    }

    renderAchievementCard(achievement) {
        const progress = Math.min(100, (achievement.current / achievement.requirement) * 100);
        const isUnlocked = achievement.unlocked;
        
        return `
            <div class="achievement-card ${isUnlocked ? 'achievement-unlocked' : ''} bg-gray-50 rounded-xl p-4 border-2 ${
                isUnlocked ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'
            } cursor-pointer" onclick="rewardsManager.showAchievementDetail(${achievement.id})">
                <div class="text-center">
                    <div class="text-3xl mb-2 ${isUnlocked ? 'sparkle-animation' : 'grayscale opacity-50'}">${achievement.icon}</div>
                    <h4 class="font-semibold text-gray-800 text-sm mb-1">${achievement.name}</h4>
                    <p class="text-gray-600 text-xs mb-2">${achievement.description}</p>
                    
                    ${!isUnlocked ? `
                        <div class="mb-2">
                            <div class="w-full bg-gray-200 rounded-full h-1">
                                <div class="bg-gradient-to-r from-purple-400 to-purple-500 h-1 rounded-full" 
                                     style="width: ${progress}%"></div>
                            </div>
                            <div class="text-xs text-gray-600 mt-1">
                                ${achievement.current}/${achievement.requirement}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="text-xs ${isUnlocked ? 'text-yellow-700' : 'text-gray-500'}">
                        ${isUnlocked ? '✅ 已解锁' : '🏃‍♂️ 进行中'}
                    </div>
                    
                    ${isUnlocked ? `
                        <div class="text-xs text-yellow-600 font-medium mt-1">
                            +${achievement.points} 积分
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // 显示成就详情
    showAchievementDetail(achievementId) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (!achievement) return;

        const modal = document.getElementById('achievementModal');
        const content = document.getElementById('achievementContent');

        const progress = Math.min(100, (achievement.current / achievement.requirement) * 100);

        content.innerHTML = `
            <div class="text-6xl mb-4 ${achievement.unlocked ? 'sparkle-animation' : 'grayscale opacity-50'}">${achievement.icon}</div>
            <h3 class="text-2xl font-bold text-gray-800 mb-2">${achievement.name}</h3>
            <p class="text-gray-600 mb-4">${achievement.description}</p>
            
            ${achievement.unlocked ? `
                <div class="bg-green-50 rounded-xl p-4 mb-4">
                    <div class="text-sm text-green-700 mb-1">解锁时间</div>
                    <div class="font-semibold">${new Date(achievement.unlockedAt).toLocaleDateString()}</div>
                    <div class="text-sm text-green-600 mt-2">🎉 恭喜解锁此成就！</div>
                </div>
            ` : `
                <div class="bg-blue-50 rounded-xl p-4 mb-4">
                    <div class="text-sm text-blue-700 mb-2">进度</div>
                    <div class="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div class="bg-gradient-to-r from-purple-400 to-purple-500 h-3 rounded-full" 
                             style="width: ${progress}%"></div>
                    </div>
                    <div class="text-sm text-blue-600">
                        ${achievement.current}/${achievement.requirement} (${progress.toFixed(1)}%)
                    </div>
                    <div class="text-sm text-blue-500 mt-2">💪 继续努力，就快解锁了！</div>
                </div>
            `}
            
            <div class="grid grid-cols-2 gap-4 text-center">
                <div class="bg-yellow-50 rounded-lg p-3">
                    <div class="text-sm text-gray-600">奖励积分</div>
                    <div class="font-bold text-yellow-600">+${achievement.points}</div>
                </div>
                <div class="bg-purple-50 rounded-lg p-3">
                    <div class="text-sm text-gray-600">成就类型</div>
                    <div class="font-bold text-purple-600">${this.getCategoryText(achievement.category)}</div>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
        
        // 添加显示动画
        anime({
            targets: modal.querySelector('.bg-white'),
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutQuad'
        });
    }

    getCategoryText(category) {
        const categoryMap = {
            task: '任务类',
            streak: '连续类',
            points: '积分类',
            wish: '心愿类',
            completion: '完成率类',
            difficulty: '难度类',
            time: '时间类'
        };
        return categoryMap[category] || '其他';
    }

    // 隐藏成就详情
    hideAchievementDetail() {
        const modal = document.getElementById('achievementModal');
        modal.classList.add('hidden');
    }

    // 初始化图表
    initChart() {
        const chartDom = document.getElementById('progressChart');
        const myChart = echarts.init(chartDom);
        const tasksData = JSON.parse(localStorage.getItem('tasks') || '[]');
        const dates = [];
        const points = [];
        const tasks = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }));
            const dayStr = date.toDateString();
            const completedToday = tasksData.filter(t => t.status === 'completed' && t.completedAt && new Date(t.completedAt).toDateString() === dayStr);
            const pointsToday = completedToday.reduce((sum, t) => sum + (parseInt(t.points) || 0), 0);
            points.push(pointsToday);
            tasks.push(completedToday.length);
        }

        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: {
                        backgroundColor: '#6a7985'
                    }
                }
            },
            legend: {
                data: ['积分获得', '任务完成'],
                bottom: 0,
                textStyle: {
                    fontSize: 12
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                containLabel: true
            },
            xAxis: [
                {
                    type: 'category',
                    boundaryGap: false,
                    data: dates,
                    axisLabel: {
                        fontSize: 10
                    }
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    axisLabel: {
                        fontSize: 10
                    }
                }
            ],
            series: [
                {
                    name: '积分获得',
                    type: 'line',
                    stack: 'Total',
                    smooth: true,
                    lineStyle: {
                        width: 3
                    },
                    showSymbol: false,
                    areaStyle: {
                        opacity: 0.8,
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            {
                                offset: 0,
                                color: 'rgba(255, 107, 107, 0.3)'
                            },
                            {
                                offset: 1,
                                color: 'rgba(255, 107, 107, 0.1)'
                            }
                        ])
                    },
                    emphasis: {
                        focus: 'series'
                    },
                    data: points,
                    itemStyle: {
                        color: '#FF6B6B'
                    }
                },
                {
                    name: '任务完成',
                    type: 'line',
                    stack: 'Total',
                    smooth: true,
                    lineStyle: {
                        width: 3
                    },
                    showSymbol: false,
                    areaStyle: {
                        opacity: 0.8,
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            {
                                offset: 0,
                                color: 'rgba(78, 205, 196, 0.3)'
                            },
                            {
                                offset: 1,
                                color: 'rgba(78, 205, 196, 0.1)'
                            }
                        ])
                    },
                    emphasis: {
                        focus: 'series'
                    },
                    data: tasks,
                    itemStyle: {
                        color: '#4ECDC4'
                    }
                }
            ]
        };

        myChart.setOption(option);
    }

    // 检查并解锁新成就
    checkAchievements() {
        let newUnlocks = [];
        
        this.achievements.forEach(achievement => {
            if (achievement.unlocked) return;
            
            let shouldUnlock = false;
            
            switch (achievement.category) {
                case 'task':
                    shouldUnlock = this.stats.totalTasksCompleted >= achievement.requirement;
                    break;
                case 'points':
                    shouldUnlock = this.stats.totalPointsEarned >= achievement.requirement;
                    break;
                case 'streak':
                    shouldUnlock = this.stats.currentStreak >= achievement.requirement;
                    break;
                case 'wish':
                    const fulfilledWishes = JSON.parse(localStorage.getItem('wishes') || '[]')
                        .filter(w => w.status === 'fulfilled').length;
                    shouldUnlock = fulfilledWishes >= achievement.requirement;
                    break;
                case 'completion':
                    shouldUnlock = this.stats.completionRate >= achievement.requirement;
                    break;
                case 'weekly_completion':
                    shouldUnlock = this.stats.weeklyCompletionRate >= achievement.requirement;
                    break;
                case 'monthly_completion':
                    shouldUnlock = this.stats.monthlyCompletionRate >= achievement.requirement;
                    break;
                case 'difficulty':
                    const difficultTasks = this.getCompletedTasksByDifficulty(3);
                    shouldUnlock = difficultTasks >= achievement.requirement;
                    break;
                case 'super_difficulty':
                    const superDifficultTasks = this.getCompletedTasksByDifficulty(4) + this.getCompletedTasksByDifficulty(5);
                    shouldUnlock = superDifficultTasks >= achievement.requirement;
                    break;
                case 'time':
                    const earlyTasks = this.getEarlyCompletedTasks();
                    shouldUnlock = earlyTasks >= achievement.requirement;
                    break;
                case 'morning':
                    const morningTasks = this.getMorningCompletedTasks();
                    shouldUnlock = morningTasks >= achievement.requirement;
                    break;
                case 'learning':
                    const learningTasks = this.getCompletedTasksByCategory('learning');
                    shouldUnlock = learningTasks >= achievement.requirement;
                    break;
                case 'chore':
                    const choreTasks = this.getCompletedTasksByCategory('chore');
                    shouldUnlock = choreTasks >= achievement.requirement;
                    break;
                case 'sports':
                    const sportsTasks = this.getCompletedTasksByCategory('sports');
                    shouldUnlock = sportsTasks >= achievement.requirement;
                    break;
                case 'variety':
                    const unlockedCount = this.achievements.filter(a => a.unlocked).length;
                    shouldUnlock = unlockedCount >= achievement.requirement;
                    break;
                case 'special':
                    shouldUnlock = this.isBirthdayTaskCompleted();
                    break;
            }
            
            if (shouldUnlock) {
                achievement.unlocked = true;
                achievement.unlockedAt = new Date().toISOString();
                newUnlocks.push(achievement);
            }
        });
        
        if (newUnlocks.length > 0) {
            this.saveAchievements();
            this.celebrateNewAchievements(newUnlocks);
        }
    }

    // 辅助方法用于计算各种成就条件
    getCompletedTasksByDifficulty(difficulty) {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        return tasks.filter(task => task.status === 'completed' && task.difficulty === difficulty).length;
    }

    getCompletedTasksByCategory(category) {
        // 这里可以根据任务名称或描述来判断类别
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        return tasks.filter(task => {
            if (task.status !== 'completed') return false;
            
            const name = task.name.toLowerCase();
            switch (category) {
                case 'learning':
                    return name.includes('学习') || name.includes('作业') || name.includes('阅读') || name.includes('练习');
                case 'chore':
                    return name.includes('整理') || name.includes('打扫') || name.includes('洗碗') || name.includes('家务');
                case 'sports':
                    return name.includes('运动') || name.includes('跑步') || name.includes('游泳') || name.includes('健身');
                default:
                    return false;
            }
        }).length;
    }

    getEarlyCompletedTasks() {
        // 模拟提前完成的任务数量
        return Math.floor(Math.random() * 8) + 2;
    }

    getMorningCompletedTasks() {
        // 模拟上午完成的任务数量
        return Math.floor(Math.random() * 4) + 1;
    }

    isBirthdayTaskCompleted() {
        // 模拟生日任务完成情况
        return Math.random() > 0.8;
    }

    // 庆祝新成就解锁
    celebrateNewAchievements(newAchievements) {
        newAchievements.forEach((achievement, index) => {
            setTimeout(() => {
                this.showAchievementUnlock(achievement);
            }, index * 2000);
        });
    }

    showAchievementUnlock(achievement) {
        // 创建成就解锁通知
        const notification = document.createElement('div');
        notification.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-500 text-white p-6 rounded-2xl z-50 text-center card-shadow';
        notification.innerHTML = `
            <div class="text-4xl mb-2">${achievement.icon}</div>
            <h3 class="font-bold text-lg mb-1">成就解锁！</h3>
            <p class="text-sm mb-2">${achievement.name}</p>
            <div class="text-xs">+${achievement.points} 积分</div>
        `;
        
        document.body.appendChild(notification);
        
        anime({
            targets: notification,
            scale: [0, 1],
            opacity: [0, 1],
            duration: 500,
            easing: 'easeOutBack'
        });
        
        setTimeout(() => {
            anime({
                targets: notification,
                scale: [1, 0],
                opacity: [1, 0],
                duration: 500,
                easing: 'easeInBack',
                complete: () => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }
            });
        }, 3000);
    }

    // 欢迎动画
    animateWelcome() {
        anime({
            targets: '.floating-animation',
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 1000,
            easing: 'easeOutQuad',
            delay: 500
        });

        // 成就卡片入场动画
        anime({
            targets: '.achievement-card',
            translateY: [20, 0],
            opacity: [0, 1],
            duration: 600,
            delay: anime.stagger(100),
            easing: 'easeOutQuad'
        });

        // 检查新成就
        setTimeout(() => {
            this.checkAchievements();
        }, 2000);
    }
}

// 全局函数
function showAchievementDetail(achievementId) {
    rewardsManager.showAchievementDetail(achievementId);
}

function hideAchievementDetail() {
    rewardsManager.hideAchievementDetail();
}

// 初始化应用
let rewardsManager;
document.addEventListener('DOMContentLoaded', () => {
    rewardsManager = new RewardsManager();
});
