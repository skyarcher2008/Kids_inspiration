// 数据存储和管理
class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.wishes = this.loadWishes();
        this.currentReviewTaskId = null;
        this.currentReviewWishId = null;
        this.init();
    }

    init() {
        this.renderTasks();
        this.renderWishReviewList();
        this.updateStats();
        this.initChart();
        this.bindEvents();
        const achievementList = document.getElementById('achievementAdminList');
        if (achievementList) {
            const achievements = this.ensureAchievementsSeed();
            achievementList.innerHTML = this.renderAchievementAdminList(achievements);
        }
    }

    // 数据持久化
    loadTasks() {
        const saved = localStorage.getItem('tasks');
        return saved ? JSON.parse(saved) : this.getDefaultTasks();
    }

    loadWishes() {
        const saved = localStorage.getItem('wishes');
        return saved ? JSON.parse(saved) : this.getDefaultWishes();
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    saveWishes() {
        localStorage.setItem('wishes', JSON.stringify(this.wishes));
    }

    getDefaultWishes() {
        return [
            {
                id: 101,
                name: '想要一个新玩具',
                description: '提交审核后由家长设定积分',
                points: 0,
                priority: 'medium',
                status: 'pending',
                createdAt: new Date().toISOString(),
                approvedAt: null,
                fulfilledAt: null
            },
            {
                id: 102,
                name: '去游乐园玩',
                description: '等待家长审核与积分设定',
                points: 0,
                priority: 'high',
                status: 'pending',
                createdAt: new Date().toISOString(),
                approvedAt: null,
                fulfilledAt: null
            }
        ];
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
                reviewedAt: null
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
                reviewedAt: null
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
                reviewedAt: new Date().toISOString()
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
                reviewedAt: null
            },
            {
                id: 5,
                name: '练习钢琴',
                description: '练习钢琴30分钟，复习今天学的曲子',
                points: 20,
                difficulty: 4,
                status: 'review',
                createdAt: new Date().toISOString(),
                completedAt: new Date().toISOString(),
                reviewedAt: null
            }
        ];
    }

    // 创建任务
    createTask(taskData) {
        const range = this.getPointsRangeForDifficulty(parseInt(taskData.difficulty));
        const pts = parseInt(taskData.points);
        if (isNaN(pts) || pts < range.min || pts > range.max) {
            this.showErrorMessage(`积分需在${range.min}-${range.max}之间`);
            return;
        }
        const newTask = {
            id: Date.now(),
            name: taskData.name,
            description: taskData.description,
            points: pts,
            difficulty: parseInt(taskData.difficulty),
            status: 'pending',
            createdAt: new Date().toISOString(),
            completedAt: null,
            reviewedAt: null
        };
        
        this.tasks.push(newTask);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        
        // 显示成功动画
        this.showSuccessMessage('任务创建成功！');
    }

    // 渲染任务列表
    renderTasks() {
        const taskList = document.getElementById('taskList');
        const filterSelect = document.getElementById('taskFilter');
        const filter = filterSelect ? filterSelect.value : 'all';
        
        let filteredTasks = this.tasks;
        if (filter !== 'all') {
            filteredTasks = this.tasks.filter(task => task.status === filter);
        }

        if (filteredTasks.length === 0) {
            if (taskList) {
                taskList.innerHTML = `
                    <div class="text-center py-8 text-gray-500">
                        <div class="text-4xl mb-2">📝</div>
                        <p>暂无任务</p>
                    </div>
                `;
            }
            return;
        }

        if (taskList) {
            taskList.innerHTML = filteredTasks.map(task => this.renderTaskCard(task)).join('');
        }
    }

    // 渲染心愿审核列表
    renderWishReviewList() {
        const wishReviewList = document.getElementById('wishReviewList');
        const pendingWishes = this.wishes.filter(wish => wish.status === 'pending');

        const pendingWishesCountElement = document.getElementById('pendingWishesCount');
        if (pendingWishesCountElement) {
            pendingWishesCountElement.textContent = `${pendingWishes.length} 个待审核`;
        }

        if (pendingWishes.length === 0) {
            if (wishReviewList) {
                wishReviewList.innerHTML = `
                    <div class="text-center py-8 text-gray-500">
                        <div class="text-4xl mb-2">🌟</div>
                        <p>暂无心愿需要审核</p>
                    </div>
                `;
            }
            return;
        }

        if (wishReviewList) {
            wishReviewList.innerHTML = pendingWishes.map(wish => this.renderWishReviewCard(wish)).join('');
        }
    }

    renderWishReviewCard(wish) {
        const priorityIcon = this.getPriorityIcon(wish.priority);
        
        return `
            <div class="bg-yellow-50 rounded-xl p-4 border-l-4 border-yellow-300">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center space-x-2 mb-2">
                            <h4 class="font-semibold text-gray-800 text-sm">${wish.name}</h4>
                            <span class="text-xs">${priorityIcon}</span>
                        </div>
                        <p class="text-gray-600 text-xs mb-3">${wish.description}</p>
                        <div class="text-xs px-2 py-1 rounded-full bg-yellow-200 text-yellow-800 inline-block">
                            等待审核
                        </div>
                    </div>
                    <div class="ml-3">
                        <button onclick="showReviewWish(${wish.id})" 
                                class="text-xs bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition-colors">
                            审核
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderTaskCard(task) {
        const statusInfo = this.getStatusInfo(task.status);
        const difficultyStars = '⭐'.repeat(task.difficulty);
        
        return `
            <div class="bg-gray-50 rounded-xl p-4 border-l-4 ${statusInfo.borderColor}">
                <div class="flex items-start justify-between mb-2">
                    <div class="flex-1">
                        <h4 class="font-semibold text-gray-800 text-sm">${task.name}</h4>
                        <p class="text-gray-600 text-xs mt-1">${task.description}</p>
                        <div class="flex items-center mt-2 space-x-2">
                            <span class="text-xs text-gray-500">${difficultyStars}</span>
                            <span class="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">${task.points}积分</span>
                        </div>
                    </div>
                    <div class="flex flex-col items-end space-y-1">
                        <span class="text-xs px-2 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.textColor}">
                            ${statusInfo.text}
                        </span>
                        ${task.status === 'review' ? 
                            `<button onclick="taskManager.showReviewTask(${task.id})" class="text-xs bg-blue-500 text-white px-2 py-1 rounded-lg hover:bg-blue-600 transition-colors">
                                审核
                            </button>` : ''
                        }
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
                text: '待审核',
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

    // 更新统计信息
    updateStats() {
        const todayTasks = this.tasks.filter(task => {
            const taskDate = new Date(task.createdAt).toDateString();
            const today = new Date().toDateString();
            return taskDate === today;
        }).length;

        const completedPoints = this.tasks
            .filter(task => task.status === 'completed')
            .reduce((sum, task) => sum + task.points, 0);
        const deductions = JSON.parse(localStorage.getItem('deductions') || '[]');
        const deductedPoints = deductions.reduce((sum, d) => sum + (parseInt(d.points) || 0), 0);
        const achievements = JSON.parse(localStorage.getItem('achievements') || '[]');
        const achievementPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + (parseInt(a.points) || 0), 0);
        const totalPoints = Math.max(0, completedPoints + achievementPoints - deductedPoints);

        const pendingTasks = this.tasks.filter(task => task.status === 'review').length;
        const pendingWishes = this.wishes.filter(wish => wish.status === 'pending').length;

        document.getElementById('todayTasks').textContent = todayTasks;
        document.getElementById('totalPoints').textContent = totalPoints;
        document.getElementById('pendingTasks').textContent = pendingTasks;
        document.getElementById('pendingWishes').textContent = pendingWishes;

        // 更新通知提醒
        this.updateNotifications(pendingTasks, pendingWishes);

        // 添加数字滚动动画
        this.animateNumbers();
    }

    // 更新通知提醒
    updateNotifications(pendingTasks, pendingWishes) {
        const taskNotification = document.getElementById('taskNotification');
        const wishNotification = document.getElementById('wishNotification');

        if (pendingTasks > 0) {
            taskNotification.classList.remove('hidden');
            taskNotification.textContent = pendingTasks > 9 ? '9+' : pendingTasks;
        } else {
            taskNotification.classList.add('hidden');
        }

        if (pendingWishes > 0) {
            wishNotification.classList.remove('hidden');
            wishNotification.textContent = pendingWishes > 9 ? '9+' : pendingWishes;
        } else {
            wishNotification.classList.add('hidden');
        }
    }

    animateNumbers() {
        const elements = ['todayTasks', 'totalPoints', 'pendingTasks', 'pendingWishes'];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (!element) return;
            anime({
                targets: element,
                scale: [1, 1.1, 1],
                duration: 600,
                easing: 'easeInOutQuad'
            });
        });
    }

    // 初始化图表
    initChart() {
        const chartDom = document.getElementById('progressChart');
        const completedTasks = this.tasks.filter(task => task.status === 'completed').length;
        const totalTasks = this.tasks.length;
        const pendingTasks = totalTasks - completedTasks;
        if (typeof echarts === 'undefined') {
            if (!chartDom) return;
            const percent = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
            chartDom.innerHTML = `
                <div class="space-y-2">
                    <div class="flex items-center justify-between text-sm text-gray-700">
                        <span>完成率</span>
                        <span>${percent}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full" style="width: ${percent}%"></div>
                    </div>
                    <div class="grid grid-cols-2 gap-2 text-center">
                        <div class="bg-green-50 rounded-lg p-2">
                            <div class="text-xs text-gray-600">已完成</div>
                            <div class="text-lg font-bold text-green-600">${completedTasks}</div>
                        </div>
                        <div class="bg-pink-50 rounded-lg p-2">
                            <div class="text-xs text-gray-600">进行中</div>
                            <div class="text-lg font-bold text-pink-600">${pendingTasks}</div>
                        </div>
                    </div>
                </div>
            `;
            return;
        }
        const myChart = echarts.init(chartDom);

        // values computed above

        const option = {
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c} ({d}%)'
            },
            legend: {
                orient: 'horizontal',
                bottom: '0',
                textStyle: {
                    fontSize: 12
                }
            },
            series: [
                {
                    name: '任务状态',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['50%', '45%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: '16',
                            fontWeight: 'bold'
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: [
                        {
                            value: completedTasks,
                            name: '已完成',
                            itemStyle: { color: '#4ECDC4' }
                        },
                        {
                            value: pendingTasks,
                            name: '进行中',
                            itemStyle: { color: '#FF6B6B' }
                        }
                    ]
                }
            ]
        };

        myChart.setOption(option);
    }

    // 显示审核模态框
    showReviewTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        this.currentReviewTaskId = taskId;
        const modal = document.getElementById('reviewTaskModal');
        const content = document.getElementById('reviewTaskContent');

        content.innerHTML = `
            <div class="mb-4">
                <h4 class="font-semibold text-gray-800 mb-2">${task.name}</h4>
                <p class="text-gray-600 text-sm mb-3">${task.description}</p>
                <div class="bg-gray-50 rounded-lg p-3 mb-3">
                    <div class="text-sm text-gray-700">
                        <strong>完成时间：</strong>${new Date(task.completedAt).toLocaleString()}
                    </div>
                    <div class="text-sm text-gray-700">
                        <strong>积分奖励：</strong>${task.points} 积分
                    </div>
                    <div class="text-sm text-gray-700">
                        <strong>难度等级：</strong>${'⭐'.repeat(task.difficulty)}
                    </div>
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

    // 隐藏审核模态框
    hideReviewTask() {
        const modal = document.getElementById('reviewTaskModal');
        modal.classList.add('hidden');
        this.currentReviewTaskId = null;
    }

    // 显示心愿审核
    showReviewWish(wishId) {
        const wish = this.wishes.find(w => w.id === wishId);
        if (!wish) return;

        this.currentReviewWishId = wishId;
        const modal = document.getElementById('reviewWishModal');
        const content = document.getElementById('reviewWishContent');

        if (!modal || !content) {
            console.error('Modal or content not found');
            return;
        }

        content.innerHTML = `
            <div class="text-center mb-4">
                <div class="text-3xl mb-2">${this.getWishIcon(wish.name)}</div>
                <h4 class="font-semibold text-gray-800 mb-2">${wish.name}</h4>
                <p class="text-gray-600 text-sm mb-3">${wish.description}</p>
            </div>
            <div class="bg-blue-50 rounded-lg p-3 mb-3">
                <div class="text-sm text-gray-700">
                    <strong>优先级：</strong>${this.getPriorityText(wish.priority)}
                </div>
                <div class="text-sm text-gray-700">
                    <strong>创建时间：</strong>${new Date(wish.createdAt).toLocaleString()}
                </div>
            </div>
        `;

        const pointsInput = document.getElementById('wishPointsInput');
        if (pointsInput) {
            pointsInput.value = wish.points || '';
        }

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

    // 隐藏心愿审核
    hideReviewWish() {
        const modal = document.getElementById('reviewWishModal');
        modal.classList.add('hidden');
        this.currentReviewWishId = null;
    }

    // 批准心愿
    approveWish() {
        if (!this.currentReviewWishId) return;

        const wish = this.wishes.find(w => w.id === this.currentReviewWishId);
        const pointsInput = document.getElementById('wishPointsInput');
        
        if (!wish || !pointsInput) {
            this.showErrorMessage('心愿信息不完整');
            return;
        }

        const points = parseInt(pointsInput.value);
        
        if (!points || points < 10) {
            this.showErrorMessage('请输入有效的积分值（最少10积分）');
            return;
        }

        wish.points = points;
        wish.status = 'active';
        wish.approvedAt = new Date().toISOString();
        
        this.saveWishes();
        this.renderWishReviewList();
        this.updateStats();
        this.hideReviewWish();
        
        this.showSuccessMessage(`心愿已批准！需要 ${points} 积分`);
        this.celebrateApproval();
    }

    // 驳回心愿
    rejectWish() {
        if (!this.currentReviewWishId) return;

        const wishIndex = this.wishes.findIndex(w => w.id === this.currentReviewWishId);
        if (wishIndex !== -1) {
            this.wishes.splice(wishIndex, 1); // 从列表中移除
            this.saveWishes();
            this.updateStats();
            this.hideReviewWish();
            this.showSuccessMessage('心愿已驳回');
        }
    }

    getWishIcon(wishName) {
        const iconMap = {
            '玩具': '🧸',
            '游乐园': '🎡',
            '书': '📚',
            '游戏': '🎮',
            '零食': '🍿',
            '衣服': '👕',
            '运动': '⚽',
            '音乐': '🎵'
        };
        
        for (const [key, icon] of Object.entries(iconMap)) {
            if (wishName.includes(key)) return icon;
        }
        return '⭐';
    }

    getPriorityText(priority) {
        const texts = {
            high: '高优先级',
            medium: '中优先级',
            low: '低优先级'
        };
        return texts[priority] || '中优先级';
    }

    getPriorityIcon(priority) {
        const icons = {
            high: '🔴',
            medium: '🟡',
            low: '🟢'
        };
        return icons[priority] || '🟡';
    }

    celebrateApproval() {
        // 创建批准动画
        const celebration = document.createElement('div');
        celebration.style.position = 'fixed';
        celebration.style.top = '50%';
        celebration.style.left = '50%';
        celebration.style.transform = 'translate(-50%, -50%)';
        celebration.style.fontSize = '4rem';
        celebration.style.zIndex = '9999';
        celebration.innerHTML = '✅';
        document.body.appendChild(celebration);

        anime({
            targets: celebration,
            scale: [0, 1.2, 1],
            rotate: [0, 360],
            opacity: [0, 1, 0],
            duration: 2000,
            easing: 'easeInOutQuad',
            complete: () => {
                if (document.body.contains(celebration)) {
                    document.body.removeChild(celebration);
                }
            }
        });
    }

    showErrorMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg z-50 text-sm font-medium';
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

    // 批准任务
    approveTask() {
        if (!this.currentReviewTaskId) return;

        const task = this.tasks.find(t => t.id === this.currentReviewTaskId);
        if (task) {
            task.status = 'completed';
            task.reviewedAt = new Date().toISOString();
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.initChart();
            this.unlockAchievementsBasic();
            
            // 显示庆祝动画
            this.showSuccessMessage(`任务完成！获得 ${task.points} 积分！`);
            this.celebrateAnimation();
        }

        this.hideReviewTask();
    }

    // 驳回任务
    rejectTask() {
        if (!this.currentReviewTaskId) return;

        const task = this.tasks.find(t => t.id === this.currentReviewTaskId);
        if (task) {
            task.status = 'pending';
            task.completedAt = null;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
        }

        this.hideReviewTask();
        this.showSuccessMessage('任务已驳回，请重新完成');
    }

    // 庆祝动画
    celebrateAnimation() {
        // 创建庆祝粒子效果
        const celebration = document.createElement('div');
        celebration.style.position = 'fixed';
        celebration.style.top = '50%';
        celebration.style.left = '50%';
        celebration.style.transform = 'translate(-50%, -50%)';
        celebration.style.fontSize = '3rem';
        celebration.style.zIndex = '9999';
        celebration.innerHTML = '🎉';
        document.body.appendChild(celebration);

        anime({
            targets: celebration,
            scale: [0, 1.5, 1],
            rotate: [0, 360],
            opacity: [0, 1, 0],
            duration: 2000,
            easing: 'easeInOutQuad',
            complete: () => {
                document.body.removeChild(celebration);
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
                    document.body.removeChild(toast);
                }
            });
        }, 3000);
    }

    // 绑定事件
    bindEvents() {
        // 创建任务表单提交
        document.getElementById('createTaskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const taskData = {
                name: document.getElementById('taskName').value,
                description: document.getElementById('taskDescription').value,
                points: document.getElementById('taskPoints').value,
                difficulty: document.getElementById('taskDifficulty').value
            };
            
            this.createTask(taskData);
            e.target.reset();
            this.hideCreateTask();
        });
        const diffSelect = document.getElementById('taskDifficulty');
        if (diffSelect) {
            diffSelect.addEventListener('change', () => this.updatePointsConstraints());
        }
    }

    // 显示创建任务模态框
    showCreateTask() {
        const modal = document.getElementById('createTaskModal');
        modal.classList.remove('hidden');
        this.updatePointsConstraints();
        
        anime({
            targets: modal.querySelector('.bg-white'),
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutQuad'
        });
    }

    // 隐藏创建任务模态框
    hideCreateTask() {
        const modal = document.getElementById('createTaskModal');
        modal.classList.add('hidden');
    }

    getPointsRangeForDifficulty(diff) {
        const map = {
            1: { min: 1, max: 200, label: '简单' },
            2: { min: 1, max: 200, label: '一般' },
            3: { min: 1, max: 200, label: '困难' },
            4: { min: 201, max: 1000, label: '挑战' },
            5: { min: 201, max: 1000, label: '超级挑战' }
        };
        return map[diff] || map[1];
    }

    updatePointsConstraints() {
        const diffSelect = document.getElementById('taskDifficulty');
        const pointsInput = document.getElementById('taskPoints');
        const hint = document.getElementById('pointsRuleHint');
        if (!diffSelect || !pointsInput) return;
        const diff = parseInt(diffSelect.value);
        const range = this.getPointsRangeForDifficulty(diff);
        pointsInput.min = String(range.min);
        pointsInput.max = String(range.max);
        pointsInput.placeholder = String(range.min);
        if (hint) {
            hint.textContent = `难度：${range.label}，积分范围：${range.min}-${range.max}`;
        }
        const current = parseInt(pointsInput.value);
        if (isNaN(current) || current < range.min || current > range.max) {
            pointsInput.value = String(range.min);
        }
    }

    // 显示扣减积分模态框
    showDeductPoints() {
        const modal = document.getElementById('deductPointsModal');
        modal.classList.remove('hidden');
        
        anime({
            targets: modal.querySelector('.bg-white'),
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutQuad'
        });
    }

    // 隐藏扣减积分模态框
    hideDeductPoints() {
        const modal = document.getElementById('deductPointsModal');
        modal.classList.add('hidden');
        document.getElementById('deductReason').value = '';
        document.getElementById('deductPoints').value = '';
    }

    // 确认扣减积分
    confirmDeductPoints() {
        const reason = document.getElementById('deductReason').value;
        const points = parseInt(document.getElementById('deductPoints').value);
        
        if (!reason || !points || points <= 0) {
            this.showErrorMessage('请填写完整的扣减信息');
            return;
        }
        
        // 创建扣减记录
        const deductionRecord = {
            id: Date.now(),
            type: 'deduction',
            reason: reason,
            points: points,
            createdAt: new Date().toISOString()
        };
        
        // 保存到localStorage
        const deductions = JSON.parse(localStorage.getItem('deductions') || '[]');
        deductions.push(deductionRecord);
        localStorage.setItem('deductions', JSON.stringify(deductions));
        
        this.hideDeductPoints();
        this.showSuccessMessage(`已扣减 ${points} 积分：${reason}`);
        this.updateStats();
    }

    showDeductionHistory() {
        const modal = document.getElementById('deductionHistoryModal');
        const list = document.getElementById('deductionList');
        const deductions = this.getDeductions();
        if (list) {
            list.innerHTML = this.renderDeductionList(deductions);
        }
        modal.classList.remove('hidden');
        anime({
            targets: modal.querySelector('.bg-white'),
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutQuad'
        });
    }

    hideDeductionHistory() {
        const modal = document.getElementById('deductionHistoryModal');
        modal.classList.add('hidden');
    }

    getDeductions() {
        return JSON.parse(localStorage.getItem('deductions') || '[]');
    }

    saveDeductions(list) {
        localStorage.setItem('deductions', JSON.stringify(list));
    }

    renderDeductionList(items) {
        if (!items || items.length === 0) {
            return `
                <div class="text-center py-6 text-gray-500">
                    <div class="text-3xl mb-2">📭</div>
                    <p class="text-xs">暂无扣减记录</p>
                </div>
            `;
        }
        return items.slice().reverse().map(item => `
            <div class="bg-gray-50 rounded-xl p-4 border-l-4 border-red-300">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="font-semibold text-gray-800 text-sm mb-1">${item.reason}</div>
                        <div class="text-gray-600 text-xs mb-2">-${item.points} 积分</div>
                        <div class="text-gray-400 text-xs">${new Date(item.createdAt).toLocaleString()}</div>
                    </div>
                    <div class="ml-3">
                        <button onclick="undoDeduction(${item.id})" class="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-300">撤销</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    undoLastDeduction() {
        const list = this.getDeductions();
        if (list.length === 0) return;
        list.pop();
        this.saveDeductions(list);
        this.updateStats();
        this.showSuccessMessage('已撤销最近一次扣减');
        this.showDeductionHistory();
    }

    undoDeduction(id) {
        const list = this.getDeductions();
        const next = list.filter(x => x.id !== id);
        this.saveDeductions(next);
        this.updateStats();
        this.showSuccessMessage('已撤销扣减');
        this.showDeductionHistory();
    }

    // 显示修改密码模态框
    showChangePassword() {
        const modal = document.getElementById('changePasswordModal');
        modal.classList.remove('hidden');
        
        anime({
            targets: modal.querySelector('.bg-white'),
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutQuad'
        });
    }

    // 隐藏修改密码模态框
    hideChangePassword() {
        const modal = document.getElementById('changePasswordModal');
        modal.classList.add('hidden');
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    }

    // 确认修改密码
    confirmChangePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        const savedPassword = localStorage.getItem('parentPassword') || '123';
        if (currentPassword !== savedPassword) {
            this.showErrorMessage('当前密码错误');
            return;
        }
        
        // 验证新密码
        if (!newPassword || newPassword.length < 3) {
            this.showErrorMessage('新密码至少需要3位字符');
            return;
        }
        
        // 验证密码一致性
        if (newPassword !== confirmPassword) {
            this.showErrorMessage('两次输入的新密码不一致');
            return;
        }
        
        // 保存新密码
        localStorage.setItem('parentPassword', newPassword);
        
        this.hideChangePassword();
        this.showSuccessMessage('密码修改成功！');
    }

    showResetModal() {
        const modal = document.getElementById('resetDataModal');
        modal.classList.remove('hidden');
        anime({
            targets: modal.querySelector('.bg-white'),
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutQuad'
        });
    }

    hideResetModal() {
        const modal = document.getElementById('resetDataModal');
        modal.classList.add('hidden');
        const input = document.getElementById('resetPassword');
        if (input) input.value = '';
    }

    confirmReset() {
        const input = document.getElementById('resetPassword');
        const savedPassword = localStorage.getItem('parentPassword') || '123';
        if (!input || input.value !== savedPassword) {
            this.showErrorMessage('家长密码错误');
            return;
        }
        // 清空数据并重置为初始状态
        this.tasks = [];
        this.wishes = [];
        localStorage.setItem('tasks', JSON.stringify([]));
        localStorage.setItem('wishes', JSON.stringify([]));
        localStorage.setItem('deductions', JSON.stringify([]));
        localStorage.setItem('achievements', JSON.stringify([]));
        this.saveTasks();
        this.saveWishes();
        this.renderTasks();
        this.renderWishReviewList();
        this.updateStats();
        this.initChart();
        this.hideResetModal();
        this.showSuccessMessage('已重置：任务、心愿、积分与成就');
    }

    // 切换到孩子视角（同时设置角色）
    switchToChildView() {
        localStorage.setItem('userRole', 'child');
        localStorage.setItem('loginTime', new Date().toISOString());
        window.location.href = 'child-view.html';
    }
    ensureAchievementsSeed() {
        let achievements = JSON.parse(localStorage.getItem('achievements') || '[]');
        if (!achievements || achievements.length === 0) {
            achievements = [
                { id: 1, name: '初次尝试', description: '完成第一个任务', icon: '🌟', category: 'task', requirement: 1, current: 0, unlocked: false, unlockedAt: null, points: 10 },
                { id: 2, name: '任务达人', description: '完成10个任务', icon: '📋', category: 'task', requirement: 10, current: 0, unlocked: false, unlockedAt: null, points: 50 },
                { id: 7, name: '积分新秀', description: '累计获得100积分', icon: '💰', category: 'points', requirement: 100, current: 0, unlocked: false, unlockedAt: null, points: 20 },
                { id: 8, name: '积分富翁', description: '累计获得500积分', icon: '💎', category: 'points', requirement: 500, current: 0, unlocked: false, unlockedAt: null, points: 100 },
                { id: 10, name: '心愿实现家', description: '实现第一个心愿', icon: '🌈', category: 'wish', requirement: 1, current: 0, unlocked: false, unlockedAt: null, points: 50 },
                { id: 11, name: '心愿收藏家', description: '实现5个心愿', icon: '🎁', category: 'wish', requirement: 5, current: 0, unlocked: false, unlockedAt: null, points: 200 }
            ];
            localStorage.setItem('achievements', JSON.stringify(achievements));
        }
        return achievements;
    }
    unlockAchievementsBasic() {
        const achievements = this.ensureAchievementsSeed();
        const completedTasks = this.tasks.filter(t => t.status === 'completed').length;
        const earnedPoints = this.tasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + (parseInt(t.points) || 0), 0);
        const deductions = JSON.parse(localStorage.getItem('deductions') || '[]');
        const deductedPoints = deductions.reduce((sum, d) => sum + (parseInt(d.points) || 0), 0);
        const totalPoints = Math.max(0, earnedPoints - deductedPoints);
        const fulfilledWishes = JSON.parse(localStorage.getItem('wishes') || '[]').filter(w => w.status === 'fulfilled').length;
        let changed = false;
        achievements.forEach(a => {
            if (a.unlocked) return;
            let ok = false;
            if (a.category === 'task') ok = completedTasks >= a.requirement;
            if (a.category === 'points') ok = totalPoints >= a.requirement;
            if (a.category === 'wish') ok = fulfilledWishes >= a.requirement;
            if (ok) {
                a.unlocked = true;
                a.unlockedAt = new Date().toISOString();
                changed = true;
            }
        });
        if (changed) {
            localStorage.setItem('achievements', JSON.stringify(achievements));
            this.showSuccessMessage('成就已更新');
        }
    }

    showAchievementsAdmin() {
        const list = document.getElementById('achievementAdminList');
        const section = document.getElementById('achievementsAdminSection');
        const achievements = this.ensureAchievementsSeed();
        if (list) list.innerHTML = this.renderAchievementAdminList(achievements);
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    hideAchievementsAdmin() {
        const form = document.getElementById('addAchievementForm');
        if (form) form.reset();
    }

    saveAchievementDefinition() {
        const name = document.getElementById('achievementName').value;
        const description = document.getElementById('achievementDescription').value;
        const category = document.getElementById('achievementCategory').value;
        const requirement = parseInt(document.getElementById('achievementRequirement').value);
        const points = parseInt(document.getElementById('achievementPoints').value);
        if (!name || !category || !requirement || !points) {
            this.showErrorMessage('请填写完整的成就信息');
            return;
        }
        const achievements = this.ensureAchievementsSeed();
        achievements.push({ id: Date.now(), name, description, icon: '🎖️', category, requirement, current: 0, unlocked: false, unlockedAt: null, points });
        localStorage.setItem('achievements', JSON.stringify(achievements));
        const list = document.getElementById('achievementAdminList');
        if (list) list.innerHTML = this.renderAchievementAdminList(achievements);
        this.showSuccessMessage('成就已添加');
    }

    renderAchievementAdminList(items) {
        return items.slice().reverse().map(a => `
            <div class="bg-gray-50 rounded-xl p-4 border-l-4 ${a.unlocked ? 'border-green-300' : 'border-gray-300'}">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="font-semibold text-gray-800 text-sm mb-1">${a.name}</div>
                        <div class="text-gray-600 text-xs mb-2">${a.description || ''}</div>
                        <div class="text-xs text-gray-500">类型：${a.category} 要求：${a.requirement} 积分：${a.points}</div>
                        <div class="text-xs mt-1 ${a.unlocked ? 'text-green-600' : 'text-gray-500'}">${a.unlocked ? '已完成' : '未完成'}</div>
                    </div>
                    <div class="ml-3">
                        ${a.unlocked ? '' : `<button onclick="markAchievementUnlocked(${a.id})" class="text-xs bg-blue-500 text-white px-3 py-1 rounded-lg">标记完成</button>`}
                    </div>
                </div>
            </div>
        `).join('');
    }

    markAchievementUnlocked(id) {
        const achievements = this.ensureAchievementsSeed();
        const idx = achievements.findIndex(a => a.id === id);
        if (idx !== -1) {
            achievements[idx].unlocked = true;
            achievements[idx].unlockedAt = new Date().toISOString();
            localStorage.setItem('achievements', JSON.stringify(achievements));
            const list = document.getElementById('achievementAdminList');
            if (list) list.innerHTML = this.renderAchievementAdminList(achievements);
            this.updateStats();
            this.showSuccessMessage('成就已标记完成');
        }
    }
}

// 全局函数
function showCreateTask() {
    taskManager.showCreateTask();
}

function hideCreateTask() {
    taskManager.hideCreateTask();
}

function showDeductPoints() {
    taskManager.showDeductPoints();
}

function hideDeductPoints() {
    taskManager.hideDeductPoints();
}

function confirmDeductPoints() {
    taskManager.confirmDeductPoints();
}

function scrollToTaskSection() {
    const taskSection = document.getElementById('taskList');
    if (taskSection) {
        taskSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function scrollToWishSection() {
    const wishSection = document.getElementById('wishReviewList');
    if (wishSection) {
        wishSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function showChangePassword() {
    taskManager.showChangePassword();
}

function hideChangePassword() {
    taskManager.hideChangePassword();
}

function confirmChangePassword() {
    taskManager.confirmChangePassword();
}

function showReviewTask(taskId) {
    taskManager.showReviewTask(taskId);
}

function hideReviewTask() {
    taskManager.hideReviewTask();
}

function approveTask() {
    taskManager.approveTask();
}

function rejectTask() {
    taskManager.rejectTask();
}

function filterTasks() {
    taskManager.renderTasks();
}

function showReviewWish(wishId) {
    taskManager.showReviewWish(wishId);
}

function hideReviewWish() {
    taskManager.hideReviewWish();
}

function approveWish() {
    taskManager.approveWish();
}

function rejectWish() {
    taskManager.rejectWish();
}

function showDeductionHistory() {
    taskManager.showDeductionHistory();
}

function hideDeductionHistory() {
    taskManager.hideDeductionHistory();
}

function undoLastDeduction() {
    taskManager.undoLastDeduction();
}

function undoDeduction(id) {
    taskManager.undoDeduction(id);
}

function showResetModal() {
    taskManager.showResetModal();
}

function hideResetModal() {
    taskManager.hideResetModal();
}

function confirmReset() {
    taskManager.confirmReset();
}

function switchToChildView() {
    taskManager.switchToChildView();
}

function showAchievementsAdmin() {
    taskManager.showAchievementsAdmin();
}

function hideAchievementsAdmin() {
    taskManager.hideAchievementsAdmin();
}

function saveAchievementDefinition() {
    taskManager.saveAchievementDefinition();
}

function markAchievementUnlocked(id) {
    taskManager.markAchievementUnlocked(id);
}

// 初始化应用
let taskManager;
document.addEventListener('DOMContentLoaded', () => {
    taskManager = new TaskManager();
});
