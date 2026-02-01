// 孩子视角任务管理
class ChildTaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.achievements = this.loadAchievements();
        this.currentTaskId = null;
        this.init();
    }

    init() {
        this.renderTasks();
        this.updatePointsDisplay();
        this.renderRecentAchievements();
        this.bindEvents();
        this.animateWelcome();
    }

    // 数据持久化
    loadTasks() {
        const saved = localStorage.getItem('tasks');
        return saved ? JSON.parse(saved) : this.getDefaultTasks();
    }

    loadAchievements() {
        const saved = localStorage.getItem('achievements');
        return saved ? JSON.parse(saved) : this.getDefaultAchievements();
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    saveAchievements() {
        localStorage.setItem('achievements', JSON.stringify(this.achievements));
    }

    getDefaultTasks() {
        return [
            {
                id: 1,
                name: '整理房间',
                description: '把玩具收拾整齐，床铺整理好',
                points: 10,
                difficulty: 3,
                status: 'pending',
                createdAt: new Date().toISOString(),
                completedAt: null,
                reviewedAt: null,
                completionNote: ''
            },
            {
                id: 2,
                name: '完成数学作业',
                description: '完成第5页的数学练习题',
                points: 15,
                difficulty: 4,
                status: 'review',
                createdAt: new Date().toISOString(),
                completedAt: new Date().toISOString(),
                reviewedAt: null,
                completionNote: '我已经认真完成了所有题目！'
            },
            {
                id: 3,
                name: '帮忙洗碗',
                description: '晚饭后帮忙清洗餐具',
                points: 8,
                difficulty: 2,
                status: 'completed',
                createdAt: new Date().toISOString(),
                completedAt: new Date().toISOString(),
                reviewedAt: new Date().toISOString(),
                completionNote: '洗得很干净！'
            },
            {
                id: 4,
                name: '阅读30分钟',
                description: '安静阅读喜欢的故事书30分钟',
                points: 12,
                difficulty: 2,
                status: 'pending',
                createdAt: new Date().toISOString(),
                completedAt: null,
                reviewedAt: null,
                completionNote: ''
            },
            {
                id: 5,
                name: '练习钢琴',
                description: '练习钢琴30分钟，复习今天学的曲子',
                points: 20,
                difficulty: 4,
                status: 'pending',
                createdAt: new Date().toISOString(),
                completedAt: null,
                reviewedAt: null,
                completionNote: ''
            }
        ];
    }

    getDefaultAchievements() {
        return [
            {
                id: 1,
                name: '第一次完成',
                description: '完成了第一个任务',
                icon: '🌟',
                unlocked: true,
                unlockedAt: new Date().toISOString()
            },
            {
                id: 2,
                name: '连续三天',
                description: '连续三天完成任务',
                icon: '🔥',
                unlocked: true,
                unlockedAt: new Date().toISOString()
            },
            {
                id: 3,
                name: '积分达人',
                description: '累计获得100积分',
                icon: '💎',
                unlocked: false,
                unlockedAt: null
            },
            {
                id: 4,
                name: '任务高手',
                description: '完成10个任务',
                icon: '🏆',
                unlocked: false,
                unlockedAt: null
            }
        ];
    }

    // 渲染任务列表
    renderTasks() {
        const taskList = document.getElementById('childTaskList');
        const pendingTasks = this.tasks.filter(task => task.status === 'pending');
        const reviewTasks = this.tasks.filter(task => task.status === 'review');
        const completedTasks = this.tasks.filter(task => task.status === 'completed');

        // 按状态排序：待完成 -> 审核中 -> 已完成
        const sortedTasks = [...pendingTasks, ...reviewTasks, ...completedTasks];

        if (sortedTasks.length === 0) {
            taskList.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <div class="text-4xl mb-2">📝</div>
                    <p>暂无任务</p>
                </div>
            `;
            return;
        }

        taskList.innerHTML = sortedTasks.map(task => this.renderTaskCard(task)).join('');
        this.updateTaskProgress();
    }

    renderTaskCard(task) {
        const statusInfo = this.getStatusInfo(task.status);
        const difficultyStars = '⭐'.repeat(task.difficulty);
        
        let actionButton = '';
        if (task.status === 'pending') {
            actionButton = `
                <button onclick="childTaskManager.showCompleteTask(${task.id})" 
                        class="bg-gradient-to-r from-green-400 to-green-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                    🎉 完成任务
                </button>
            `;
        } else if (task.status === 'review') {
            actionButton = `
                <div class="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-sm font-medium">
                    ⏳ 等待审核
                </div>
            `;
        } else if (task.status === 'completed') {
            actionButton = `
                <div class="bg-green-100 text-green-700 px-4 py-2 rounded-xl text-sm font-medium">
                    ✨ 已完成
                </div>
            `;
        }

        return `
            <div class="task-card bg-gray-50 rounded-xl p-4 border-l-4 ${statusInfo.borderColor}">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                        <h4 class="font-semibold text-gray-800 text-sm mb-1">${task.name}</h4>
                        <p class="text-gray-600 text-xs mb-2">${task.description}</p>
                        <div class="flex items-center space-x-2 mb-2">
                            <span class="text-xs text-gray-500">${difficultyStars}</span>
                            <span class="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">${task.points}积分</span>
                        </div>
                        <div class="text-xs px-2 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.textColor} inline-block">
                            ${statusInfo.text}
                        </div>
                    </div>
                    <div class="ml-3">
                        ${actionButton}
                    </div>
                </div>
            </div>
        `;
    }

    getStatusInfo(status) {
        const statusMap = {
            'pending': {
                text: '待完成',
                bgColor: 'bg-gray-100',
                textColor: 'text-gray-700',
                borderColor: 'border-gray-300'
            },
            'review': {
                text: '审核中',
                bgColor: 'bg-blue-100',
                textColor: 'text-blue-700',
                borderColor: 'border-blue-300'
            },
            'completed': {
                text: '已完成',
                bgColor: 'bg-green-100',
                textColor: 'text-green-700',
                borderColor: 'border-green-300'
            }
        };
        return statusMap[status] || statusMap['pending'];
    }

    // 更新任务进度
    updateTaskProgress() {
        const completedTasks = this.tasks.filter(task => task.status === 'completed').length;
        const totalTasks = this.tasks.length;
        const progressText = `${completedTasks}/${totalTasks} 已完成`;
        
        document.getElementById('taskProgress').textContent = progressText;
    }

    // 更新积分显示
    updatePointsDisplay() {
        const currentPoints = this.calculateCurrentPoints();
        const nextWishPoints = 200; // 假设下个心愿需要200积分
        const pointsNeeded = Math.max(0, nextWishPoints - currentPoints);
        const progressPercent = Math.min(100, (currentPoints / nextWishPoints) * 100);

        document.getElementById('currentPoints').textContent = currentPoints;
        document.getElementById('pointsNeeded').textContent = pointsNeeded;
        
        // 更新进度环
        this.updateProgressRing(progressPercent);
    }

    updateProgressRing(percent) {
        const circle = document.getElementById('progressCircle');
        const circumference = 2 * Math.PI * 52; // r = 52
        const offset = circumference - (percent / 100) * circumference;
        
        anime({
            targets: circle,
            strokeDashoffset: offset,
            duration: 1000,
            easing: 'easeOutQuad'
        });
    }

    calculateCurrentPoints() {
        return this.tasks
            .filter(task => task.status === 'completed')
            .reduce((sum, task) => sum + task.points, 0);
    }

    // 显示完成任务模态框
    showCompleteTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        this.currentTaskId = taskId;
        const modal = document.getElementById('completeTaskModal');
        const content = document.getElementById('taskCompletionContent');

        content.innerHTML = `
            <div class="text-center mb-4">
                <div class="text-3xl mb-2">${this.getTaskIcon(task.name)}</div>
                <h4 class="font-semibold text-gray-800 mb-2">${task.name}</h4>
                <p class="text-gray-600 text-sm">${task.description}</p>
            </div>
            <div class="bg-yellow-50 rounded-xl p-3 mb-4 text-center">
                <div class="text-sm text-gray-700 mb-1">完成奖励</div>
                <div class="text-xl font-bold text-yellow-600">+${task.points} 积分</div>
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

    // 隐藏完成任务模态框
    hideCompleteTask() {
        const modal = document.getElementById('completeTaskModal');
        modal.classList.add('hidden');
        this.currentTaskId = null;
        document.getElementById('completionNote').value = '';
    }

    // 提交任务完成
    submitTaskCompletion() {
        if (!this.currentTaskId) return;

        const task = this.tasks.find(t => t.id === this.currentTaskId);
        if (task) {
            task.status = 'review';
            task.completedAt = new Date().toISOString();
            task.completionNote = document.getElementById('completionNote').value;
            
            this.saveTasks();
            this.renderTasks();
            this.updatePointsDisplay();
            
            this.hideCompleteTask();
            this.showSuccessMessage('任务提交成功！等待家长审核...');
            this.celebrateAnimation();
        }
    }

    // 获取任务图标
    getTaskIcon(taskName) {
        const iconMap = {
            '整理房间': '🏠',
            '完成数学作业': '📐',
            '帮忙洗碗': '🍽️',
            '阅读30分钟': '📚',
            '练习钢琴': '🎹'
        };
        return iconMap[taskName] || '📝';
    }

    // 渲染最近成就
    renderRecentAchievements() {
        const container = document.getElementById('recentAchievements');
        const unlockedAchievements = this.achievements.filter(a => a.unlocked).slice(0, 3);

        if (unlockedAchievements.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4 text-gray-500">
                    <div class="text-2xl mb-2">🏆</div>
                    <p class="text-xs">还没有成就，加油完成任务吧！</p>
                </div>
            `;
            return;
        }

        container.innerHTML = unlockedAchievements.map(achievement => `
            <div class="flex items-center space-x-3 bg-yellow-50 rounded-lg p-3">
                <div class="text-2xl">${achievement.icon}</div>
                <div class="flex-1">
                    <div class="font-semibold text-gray-800 text-sm">${achievement.name}</div>
                    <div class="text-gray-600 text-xs">${achievement.description}</div>
                </div>
            </div>
        `).join('');
    }

    // 庆祝动画
    celebrateAnimation() {
        // 创建星星粒子效果
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createStarParticle();
            }, i * 200);
        }
    }

    createStarParticle() {
        const star = document.createElement('div');
        star.style.position = 'fixed';
        star.style.top = '50%';
        star.style.left = '50%';
        star.style.transform = 'translate(-50%, -50%)';
        star.style.fontSize = '2rem';
        star.style.zIndex = '9999';
        star.innerHTML = '⭐';
        document.body.appendChild(star);

        const randomX = (Math.random() - 0.5) * 200;
        const randomY = (Math.random() - 0.5) * 200;

        anime({
            targets: star,
            translateX: randomX,
            translateY: randomY,
            scale: [1, 0],
            opacity: [1, 0],
            duration: 1500,
            easing: 'easeOutQuad',
            complete: () => {
                if (document.body.contains(star)) {
                    document.body.removeChild(star);
                }
            }
        });
    }

    // 显示成功消息
    showSuccessMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg z-50 text-sm font-medium';
        toast.textContent = message;
        document.body.appendChild(toast);

        anime({
            targets: toast,
            translateY: [-20, 0],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutQuad'
        });

        setTimeout(() => {
            anime({
                targets: toast,
                translateY: [0, -20],
                opacity: [1, 0],
                duration: 300,
                easing: 'easeInQuad',
                complete: () => {
                    if (document.body.contains(toast)) {
                        document.body.removeChild(toast);
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

        // 任务卡片入场动画
        anime({
            targets: '.task-card',
            translateY: [20, 0],
            opacity: [0, 1],
            duration: 600,
            delay: anime.stagger(100),
            easing: 'easeOutQuad'
        });
    }

    // 绑定事件
    bindEvents() {
        // 完成任务模态框关闭
        document.getElementById('completeTaskModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideCompleteTask();
            }
        });

        document.getElementById('successModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideSuccessModal();
            }
        });

        // 家长切换模态框外部点击关闭
        const parentSwitchModal = document.getElementById('parentSwitchModal');
        if (parentSwitchModal) {
            parentSwitchModal.addEventListener('click', (e) => {
                if (e.target === e.currentTarget) {
                    this.hideParentSwitchModal();
                }
            });
        }

        const parentSwitchLink = document.getElementById('parentSwitchLink');
        if (parentSwitchLink) {
            parentSwitchLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showParentSwitchModal();
            });
        }
    }

    // 显示心愿页面
    showWishes() {
        window.location.href = 'wishes.html';
    }

    // 显示成就页面
    showAchievements() {
        window.location.href = 'rewards.html';
    }

    // 隐藏成功模态框
    hideSuccessModal() {
        const modal = document.getElementById('successModal');
        modal.classList.add('hidden');
    }

    // 切换到家长视角（密码校验）
    showParentSwitchModal() {
        const modal = document.getElementById('parentSwitchModal');
        modal.classList.remove('hidden');
        anime({
            targets: modal.querySelector('.bg-white'),
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutQuad'
        });
    }

    hideParentSwitchModal() {
        const modal = document.getElementById('parentSwitchModal');
        modal.classList.add('hidden');
        const input = document.getElementById('parentSwitchPassword');
        if (input) input.value = '';
    }

    confirmParentSwitch() {
        const input = document.getElementById('parentSwitchPassword');
        const savedPassword = localStorage.getItem('parentPassword') || '123';
        if (!input || input.value !== savedPassword) {
            this.showSuccessMessage('家长密码错误！');
            return;
        }
        localStorage.setItem('userRole', 'parent');
        localStorage.setItem('loginTime', new Date().toISOString());
        window.location.href = 'index.html';
    }
}

// 全局函数
function showCompleteTask(taskId) {
    childTaskManager.showCompleteTask(taskId);
}

function hideCompleteTask() {
    childTaskManager.hideCompleteTask();
}

function submitTaskCompletion() {
    childTaskManager.submitTaskCompletion();
}

function showWishes() {
    childTaskManager.showWishes();
}

function showAchievements() {
    childTaskManager.showAchievements();
}

function hideSuccessModal() {
    childTaskManager.hideSuccessModal();
}

function showParentSwitchModal() {
    childTaskManager.showParentSwitchModal();
}

function hideParentSwitchModal() {
    childTaskManager.hideParentSwitchModal();
}

function confirmParentSwitch() {
    childTaskManager.confirmParentSwitch();
}

// 初始化应用
let childTaskManager;
document.addEventListener('DOMContentLoaded', () => {
    childTaskManager = new ChildTaskManager();
});
