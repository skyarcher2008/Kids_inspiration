// 心愿管理系统
class WishManager {
    constructor() {
        this.wishes = this.loadWishes();
        this.currentPoints = this.calculateCurrentPoints();
        this.currentWishId = null;
        this.init();
    }

    init() {
        this.renderWishes();
        this.updatePointsSummary();
        this.initChart();
        this.bindEvents();
        this.animateWelcome();
    }

    // 数据持久化
    loadWishes() {
        const saved = localStorage.getItem('wishes');
        return saved ? JSON.parse(saved) : this.getDefaultWishes();
    }

    saveWishes() {
        localStorage.setItem('wishes', JSON.stringify(this.wishes));
    }

    getDefaultWishes() {
        return [
            {
                id: 1,
                name: '想要一个新玩具',
                description: '希望能得到一个乐高积木套装，可以搭建很多有趣的东西',
                points: 200,
                priority: 'high',
                status: 'active',
                createdAt: new Date().toISOString(),
                fulfilledAt: null
            },
            {
                id: 2,
                name: '去游乐园玩',
                description: '希望能和爸爸妈妈一起去游乐园玩一整天',
                points: 300,
                priority: 'medium',
                status: 'active',
                createdAt: new Date().toISOString(),
                fulfilledAt: null
            },
            {
                id: 3,
                name: '买一本故事书',
                description: '想要一本关于冒险故事的图画书',
                points: 100,
                priority: 'low',
                status: 'fulfilled',
                createdAt: new Date().toISOString(),
                fulfilledAt: new Date().toISOString()
            }
        ];
    }

    // 计算当前积分
    calculateCurrentPoints() {
        // 从任务系统中获取已完成的积分
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const completedPoints = tasks
            .filter(task => task.status === 'completed')
            .reduce((sum, task) => sum + task.points, 0);
        
        // 减去已兑换心愿消耗的积分
        const redeemedPoints = this.wishes
            .filter(wish => wish.status === 'fulfilled')
            .reduce((sum, wish) => sum + wish.points, 0);
        
        // 减去扣减的积分
        const deductions = JSON.parse(localStorage.getItem('deductions') || '[]');
        const deductedPoints = deductions.reduce((sum, deduction) => sum + deduction.points, 0);
        
        return Math.max(0, completedPoints - redeemedPoints - deductedPoints);
    }

    // 添加心愿
    addWish(wishData) {
        const newWish = {
            id: Date.now(),
            name: wishData.name,
            description: wishData.description,
            points: 0, // 初始为0，等待家长设定
            priority: wishData.priority,
            status: 'pending', // 待审核状态
            createdAt: new Date().toISOString(),
            fulfilledAt: null,
            approvedAt: null
        };
        
        this.wishes.push(newWish);
        this.saveWishes();
        this.renderWishes();
        this.updatePointsSummary();
        this.initChart();
        
        this.showSuccessMessage('心愿已提交，等待家长审核！');
        this.celebrateAddWish();
    }

    // 渲染心愿列表
    renderWishes() {
        const wishesList = document.getElementById('wishesList');
        const activeWishes = this.wishes.filter(wish => wish.status === 'active');
        const pendingWishes = this.wishes.filter(wish => wish.status === 'pending');
        
        if (activeWishes.length === 0 && pendingWishes.length === 0) {
            wishesList.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <div class="text-4xl mb-2">🌟</div>
                    <p>还没有心愿，添加一个吧！</p>
                </div>
            `;
            return;
        }

        let html = '';
        
        // 显示待审核的心愿（只显示状态，不可操作）
        if (pendingWishes.length > 0) {
            html += `
                <div class="mb-4">
                    <h4 class="text-sm font-semibold text-gray-700 mb-2">等待家长审核</h4>
                    ${pendingWishes.map(wish => this.renderPendingWishCard(wish)).join('')}
                </div>
            `;
        }
        
        // 显示已批准的心愿
        if (activeWishes.length > 0) {
            if (pendingWishes.length > 0) {
                html += `<h4 class="text-sm font-semibold text-gray-700 mb-2">我的心愿</h4>`;
            }
            // 按优先级排序
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            activeWishes.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
            html += activeWishes.map(wish => this.renderWishCard(wish)).join('');
        }
        
        wishesList.innerHTML = html;
    }

    renderPendingWishCard(wish) {
        return `
            <div class="bg-gray-100 rounded-xl p-4 border-l-4 border-gray-400 mb-2">
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <h4 class="font-semibold text-gray-600 text-sm mb-1">${wish.name}</h4>
                        <p class="text-gray-500 text-xs">${wish.description}</p>
                        <div class="flex items-center mt-2 space-x-2">
                            <span class="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-600">
                                等待审核
                            </span>
                        </div>
                    </div>
                    <div class="text-2xl opacity-50">⏳</div>
                </div>
            </div>
        `;
    }

    renderWishCard(wish) {
        const progress = Math.min(100, (this.currentPoints / wish.points) * 100);
        const canRedeem = this.currentPoints >= wish.points;
        const priorityIcon = this.getPriorityIcon(wish.priority);
        
        return `
            <div class="wish-card bg-gray-50 rounded-xl p-4 border-l-4 ${this.getPriorityBorderColor(wish.priority)}">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                        <div class="flex items-center space-x-2 mb-2">
                            <h4 class="font-semibold text-gray-800 text-sm">${wish.name}</h4>
                            <span class="text-xs">${priorityIcon}</span>
                        </div>
                        <p class="text-gray-600 text-xs mb-3">${wish.description}</p>
                        
                        <!-- Progress Bar -->
                        <div class="mb-3">
                            <div class="flex justify-between text-xs text-gray-600 mb-1">
                                <span>进度</span>
                                <span>${this.currentPoints}/${wish.points} 积分</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="progress-bar bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full" 
                                     style="width: ${progress}%"></div>
                            </div>
                        </div>
                        
                        <div class="flex items-center justify-between">
                            <span class="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                                需要 ${wish.points} 积分
                            </span>
                            <button onclick="wishManager.showWishDetail(${wish.id})" 
                                    class="text-xs bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors">
                                查看详情
                            </button>
                        </div>
                    </div>
                </div>
                
                ${canRedeem ? `
                    <div class="mt-3 p-2 bg-green-50 rounded-lg text-center">
                        <div class="text-sm text-green-700 font-medium">🎉 可以兑换了！</div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    getPriorityIcon(priority) {
        const icons = {
            high: '🔴',
            medium: '🟡',
            low: '🟢'
        };
        return icons[priority] || '🟡';
    }

    getPriorityBorderColor(priority) {
        const colors = {
            high: 'border-red-300',
            medium: 'border-yellow-300',
            low: 'border-green-300'
        };
        return colors[priority] || 'border-yellow-300';
    }

    // 更新积分摘要
    updatePointsSummary() {
        const activeWishes = this.wishes.filter(wish => wish.status === 'active').length;
        const fulfilledWishes = this.wishes.filter(wish => wish.status === 'fulfilled').length;

        document.getElementById('currentPointsDisplay').textContent = this.currentPoints;
        document.getElementById('totalWishesDisplay').textContent = this.wishes.length;
        document.getElementById('fulfilledWishesDisplay').textContent = fulfilledWishes;

        // 添加数字动画
        this.animateNumbers();
    }

    animateNumbers() {
        const elements = ['currentPointsDisplay', 'totalWishesDisplay', 'fulfilledWishesDisplay'];
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

    // 初始化图表
    initChart() {
        const chartDom = document.getElementById('wishProgressChart');
        const myChart = echarts.init(chartDom);

        const activeWishes = this.wishes.filter(wish => wish.status === 'active').length;
        const fulfilledWishes = this.wishes.filter(wish => wish.status === 'fulfilled').length;

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
                    name: '心愿状态',
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
                            value: fulfilledWishes,
                            name: '已实现',
                            itemStyle: { color: '#4ECDC4' }
                        },
                        {
                            value: activeWishes,
                            name: '进行中',
                            itemStyle: { color: '#FF6B6B' }
                        }
                    ]
                }
            ]
        };

        myChart.setOption(option);
    }

    // 显示心愿详情
    showWishDetail(wishId) {
        const wish = this.wishes.find(w => w.id === wishId);
        if (!wish) return;

        this.currentWishId = wishId;
        const modal = document.getElementById('wishDetailModal');
        const content = document.getElementById('wishDetailContent');
        const redeemButton = document.getElementById('redeemButton');

        const progress = Math.min(100, (this.currentPoints / wish.points) * 100);
        const canRedeem = this.currentPoints >= wish.points;

        content.innerHTML = `
            <div class="text-center mb-4">
                <div class="text-4xl mb-2">${this.getWishIcon(wish.name)}</div>
                <h4 class="font-semibold text-gray-800 mb-2">${wish.name}</h4>
                <p class="text-gray-600 text-sm mb-4">${wish.description}</p>
            </div>
            
            <div class="bg-gray-50 rounded-xl p-4 mb-4">
                <div class="flex justify-between text-sm text-gray-700 mb-2">
                    <span>进度</span>
                    <span>${this.currentPoints}/${wish.points} 积分</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3 mb-3">
                    <div class="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full" 
                         style="width: ${progress}%"></div>
                </div>
                <div class="text-center">
                    <span class="text-sm font-medium text-gray-700">${progress.toFixed(1)}% 完成</span>
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 text-center">
                <div class="bg-blue-50 rounded-lg p-3">
                    <div class="text-sm text-gray-600">优先级</div>
                    <div class="font-semibold">${this.getPriorityText(wish.priority)}</div>
                </div>
                <div class="bg-green-50 rounded-lg p-3">
                    <div class="text-sm text-gray-600">创建时间</div>
                    <div class="font-semibold text-xs">${new Date(wish.createdAt).toLocaleDateString()}</div>
                </div>
            </div>
        `;

        redeemButton.style.display = canRedeem ? 'block' : 'none';
        redeemButton.textContent = canRedeem ? '兑换心愿' : '积分不足';
        redeemButton.disabled = !canRedeem;
        redeemButton.className = canRedeem 
            ? 'flex-1 bg-gradient-to-r from-green-400 to-green-500 text-white py-2 px-4 rounded-lg font-medium text-sm'
            : 'flex-1 bg-gray-300 text-gray-500 py-2 px-4 rounded-lg font-medium text-sm cursor-not-allowed';

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

    // 隐藏心愿详情
    hideWishDetail() {
        const modal = document.getElementById('wishDetailModal');
        modal.classList.add('hidden');
        this.currentWishId = null;
    }

    // 兑换心愿
    redeemWish() {
        if (!this.currentWishId) return;

        const wish = this.wishes.find(w => w.id === this.currentWishId);
        if (!wish || this.currentPoints < wish.points) return;

        // 更新心愿状态
        wish.status = 'fulfilled';
        wish.fulfilledAt = new Date().toISOString();
        
        // 更新积分
        this.currentPoints -= wish.points;
        
        this.saveWishes();
        this.unlockWishAchievements();
        this.hideWishDetail();
        this.showRedeemModal(wish);
        
        // 更新显示
        this.renderWishes();
        this.updatePointsSummary();
        this.initChart();
    }

    unlockWishAchievements() {
        let achievements = JSON.parse(localStorage.getItem('achievements') || '[]');
        if (!achievements || achievements.length === 0) {
            achievements = [
                { id: 10, name: '心愿实现家', description: '实现第一个心愿', icon: '🌈', category: 'wish', requirement: 1, current: 0, unlocked: false, unlockedAt: null, points: 50 },
                { id: 11, name: '心愿收藏家', description: '实现5个心愿', icon: '🎁', category: 'wish', requirement: 5, current: 0, unlocked: false, unlockedAt: null, points: 200 }
            ];
        }
        const fulfilledCount = this.wishes.filter(w => w.status === 'fulfilled').length;
        let changed = false;
        achievements.forEach(a => {
            if (a.unlocked) return;
            if (a.category === 'wish' && fulfilledCount >= a.requirement) {
                a.unlocked = true;
                a.unlockedAt = new Date().toISOString();
                changed = true;
            }
        });
        if (changed) {
            localStorage.setItem('achievements', JSON.stringify(achievements));
        }
    }

    // 显示兑换成功模态框
    showRedeemModal(wish) {
        const modal = document.getElementById('redeemModal');
        document.getElementById('redeemedPoints').textContent = `-${wish.points} 积分`;
        
        modal.classList.remove('hidden');
        
        // 庆祝动画
        this.celebrateRedeem();
    }

    // 隐藏兑换模态框
    hideRedeemModal() {
        const modal = document.getElementById('redeemModal');
        modal.classList.add('hidden');
    }

    // 显示添加心愿模态框
    showAddWish() {
        const modal = document.getElementById('addWishModal');
        modal.classList.remove('hidden');
        
        anime({
            targets: modal.querySelector('.bg-white'),
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutQuad'
        });
    }

    // 隐藏添加心愿模态框
    hideAddWish() {
        const modal = document.getElementById('addWishModal');
        modal.classList.add('hidden');
        document.getElementById('addWishForm').reset();
    }

    // 庆祝添加心愿
    celebrateAddWish() {
        // 创建星星动画
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.createSparkle();
            }, i * 300);
        }
    }

    // 庆祝兑换心愿
    celebrateRedeem() {
        // 创建烟花效果
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                this.createFirework();
            }, i * 100);
        }
    }

    createSparkle() {
        const sparkle = document.createElement('div');
        sparkle.style.position = 'fixed';
        sparkle.style.top = '50%';
        sparkle.style.left = '50%';
        sparkle.style.transform = 'translate(-50%, -50%)';
        sparkle.style.fontSize = '3rem';
        sparkle.style.zIndex = '9999';
        sparkle.innerHTML = '✨';
        document.body.appendChild(sparkle);

        anime({
            targets: sparkle,
            scale: [0, 1.5, 0],
            rotate: [0, 360],
            opacity: [0, 1, 0],
            duration: 2000,
            easing: 'easeInOutQuad',
            complete: () => {
                if (document.body.contains(sparkle)) {
                    document.body.removeChild(sparkle);
                }
            }
        });
    }

    createFirework() {
        const firework = document.createElement('div');
        firework.style.position = 'fixed';
        firework.style.top = '30%';
        firework.style.left = `${20 + Math.random() * 60}%`;
        firework.style.transform = 'translate(-50%, -50%)';
        firework.style.fontSize = '2rem';
        firework.style.zIndex = '9999';
        firework.innerHTML = '🎉';
        document.body.appendChild(firework);

        anime({
            targets: firework,
            translateY: [0, -100],
            scale: [0.5, 1.5, 0],
            opacity: [1, 1, 0],
            duration: 2000,
            easing: 'easeOutQuad',
            complete: () => {
                if (document.body.contains(firework)) {
                    document.body.removeChild(firework);
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

        // 心愿卡片入场动画
        anime({
            targets: '.wish-card',
            translateY: [20, 0],
            opacity: [0, 1],
            duration: 600,
            delay: anime.stagger(100),
            easing: 'easeOutQuad'
        });
    }

    // 绑定事件
    bindEvents() {
        // 添加心愿表单提交
        document.getElementById('addWishForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const wishData = {
                name: document.getElementById('wishName').value,
                description: document.getElementById('wishDescription').value,
                priority: document.getElementById('wishPriority').value
            };
            
            this.addWish(wishData);
            this.hideAddWish();
        });

        // 模态框点击外部关闭
        document.getElementById('addWishModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideAddWish();
            }
        });

        document.getElementById('wishDetailModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideWishDetail();
            }
        });

        document.getElementById('redeemModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideRedeemModal();
            }
        });
    }
}

// 全局函数
function showAddWish() {
    wishManager.showAddWish();
}

function hideAddWish() {
    wishManager.hideAddWish();
}

function showWishDetail(wishId) {
    wishManager.showWishDetail(wishId);
}

function hideWishDetail() {
    wishManager.hideWishDetail();
}

function redeemWish() {
    wishManager.redeemWish();
}

function hideRedeemModal() {
    wishManager.hideRedeemModal();
}

// 初始化应用
let wishManager;
document.addEventListener('DOMContentLoaded', () => {
    wishManager = new WishManager();
});
