// 开发者帮助工具
// 将这些函数添加到全局 window 对象，方便在控制台使用

window.piggyDev = {
  // 清除所有数据
  clear: function() {
    localStorage.removeItem('piggy-bank-storage');
    console.log('✅ 数据已清除，页面将自动刷新...');
    setTimeout(() => window.location.reload(), 1000);
  },
  
  // 查看当前数据
  show: function() {
    const data = localStorage.getItem('piggy-bank-storage');
    if (data) {
      console.log(JSON.parse(data));
    } else {
      console.log('❌ 没有找到存储数据');
    }
  },
  
  // 重置成就
  resetAchievements: function() {
    const data = localStorage.getItem('piggy-bank-storage');
    if (data) {
      const parsed = JSON.parse(data);
      parsed.state.achievements = parsed.state.achievements.map(ach => ({
        ...ach,
        unlocked: false,
        unlockedDate: undefined
      }));
      localStorage.setItem('piggy-bank-storage', JSON.stringify(parsed));
      console.log('✅ 成就已重置，页面将自动刷新...');
      setTimeout(() => window.location.reload(), 1000);
    }
  },
  
  // 添加测试星星
  addStars: function(count = 100) {
    const data = localStorage.getItem('piggy-bank-storage');
    if (data) {
      const parsed = JSON.parse(data);
      parsed.state.totalStars += count;
      localStorage.setItem('piggy-bank-storage', JSON.stringify(parsed));
      console.log(`✅ 已添加 ${count} 颗星星，页面将自动刷新...`);
      setTimeout(() => window.location.reload(), 1000);
    }
  },
  
  // 显示帮助
  help: function() {
    console.log(`
🛠️ Piggy Bank 开发工具
====================
piggyDev.clear()           - 清除所有本地数据
piggyDev.show()            - 查看当前存储的数据
piggyDev.resetAchievements() - 重置所有成就
piggyDev.addStars(100)     - 添加测试星星
piggyDev.help()            - 显示此帮助信息

💡 提示：
- 使用 piggyDev.clear() 是最快的清理方法
- 清理后页面会自动刷新
    `);
  }
};

// 自动显示帮助信息
if (window.location.hostname === 'localhost') {
  console.log('💡 输入 piggyDev.help() 查看开发工具');
}