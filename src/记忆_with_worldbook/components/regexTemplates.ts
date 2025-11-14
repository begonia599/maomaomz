// 精美 Regex 模板库
export interface RegexTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  tags: string[];
  triggerRegex: string;
  htmlTemplate: string;
  cssContent: string;
  scriptContent: string;
}

export const templates: RegexTemplate[] = [
  {
    id: 'notebook-style',
    name: '学神笔记本',
    description: '精美的笔记本风格，带翻页效果、侧边导航、马克笔标记和进度条',
    icon: '📓',
    color: 'linear-gradient(135deg, #a7ff83 0%, #17b978 100%)',
    tags: ['笔记本', '翻页', '可爱', '进度条'],
    triggerRegex:
      '/\\[Status\\][\\r\\n\\s]*动作:(.*?)[\\r\\n\\s]*日期:(.*?)[\\r\\n\\s]*时分:(.*?)[\\r\\n\\s]*天气:(.*?)[\\r\\n\\s]*图标:\\s*(.*?)[\\r\\n\\s]*地点:(.*?)[\\r\\n\\s]*阶级:(.*?)[\\r\\n\\s]*姓名:(.*?)[\\r\\n\\s]*年龄:(.*?)[\\r\\n\\s]*学号:(.*?)[\\r\\n\\s]*班级:(.*?)[\\r\\n\\s]*外貌:(.*?)[\\r\\n\\s]*外套:(.*?)[\\r\\n\\s]*内衣:(.*?)[\\r\\n\\s]*体温:(.*?)[\\r\\n\\s]*心率:(.*?)[\\r\\n\\s]*血压:(.*?)[\\r\\n\\s]*健康:(.*?)[\\r\\n\\s]*疼痛:(.*?)[\\r\\n\\s]*饥饿:(.*?)[\\r\\n\\s]*清洁:(.*?)[\\r\\n\\s]*经期:(.*?)[\\r\\n\\s]*异常:(.*?)[\\r\\n\\s]*当学:(.*?)[\\r\\n\\s]*掌握:(.*?)[\\r\\n\\s]*上次:(.*?)[\\r\\n\\s]*长期:(.*?)[\\r\\n\\s]*主线:(.*?)[\\r\\n\\s]*日常:([\\s\\S]*?)(?=[\\r\\n\\s]*信任:)[\\r\\n\\s]*信任:(.*?)[\\r\\n\\s]*觉醒:(.*?)[\\r\\n\\s]*分析:(.*?)[\\r\\n\\s]*提醒:(.*?)[\\r\\n\\s]*积分:(.*?)[\\r\\n\\s]*商城:([\\s\\S]*?)\\[\\/Status\\]/',
    htmlTemplate: `<!DOCTYPE html>
</head>
<link rel="stylesheet" href="MultiverseTerminalSystem.css">
<body>
<div class="outer-container">
    <div class="notebook">
        <!-- 封面 -->
        <div class="page cover" data-page-index="0">
            <div class="datetime">
                <div class="time">$3</div>
                <div class="date">$2</div>
            </div>
            <div class="weather">
                <div class="weather-icon">$5</div>
                <div class="weather-text">☘$4</div>
            </div>
            <div class="avatar-container">
                <img src="https://files.catbox.moe/rdlwo1.jpg" alt="头像" class="user_avatar">
            </div>
            <div class="title"> ༺ 学神手册 ༻
            </div>
            <div class="action-bar">
                <div>⚚$1⚚</div>
            </div>
            <div class="location">
                <div> $6
                </div>
            </div>
        </div>
        <!-- 第二页：基础信息 -->
        <div class="page inner-page" data-page-index="1">
            <div class="info-block">
                <div class="inner-avatar-container">
                    <img src="https://files.catbox.moe/s4wrij.png" alt="头像" class="user_avatar">
                </div>
                <div class="info-content">
                    <div><span class="label  marker-title orange">🆔姓名:</span> <span class="value">$8</span></div>
                    <div><span class="label">🎂年龄:</span> <span class="value">$9</span></div>
                    <div><span class="label">🔢 学号:</span> <span class="value">$10</span></div>
                    <div><span class="label">🏫班级:</span> <span class="value">$11</span></div>
                    <div><span class="label">🎖️阶级:</span> <span class="value marker-title cyan">$7</span></div>
                </div>
            </div>
            <div class="attire-block">
                <div>
                    <div><span class="label marker-title pink">💄外貌:</span> <span class="value">$12</span></div>
                    <div><span class="label">🧥外套:</span> <span class="value">$13</span></div>
                    <div><span class="label">👙内衣:</span> <span class="value marker-title khaki">$14</span></div>
                </div>
            </div>
            <div class="vitals-block">
                <div class="row">
                    <div class="section">
                        <div><span class="label marker-title yellow">🌡️体温:</span> <span class="value">$15</span></div>
                        <div><span class="label">💓心率:</span> <span class="value">$16</span></div>
                        <div><span class="label marker-title red">🫀血压:</span> <span class="value">$17</span></div>
                    </div>
                    <div class="section2">
                        <div> <span class="label marker-title purple">⚡️疼痛:   </span>
                            <div class="progress-bar" data-value="$19" data-color="purple">
                                <div class="progress-fill"></div>
                            </div>
                            <span class="progress-value">$19</span>
                        </div>
                        <div>
                            <span class="label">🍎饥饿:   </span>
                            <div class="progress-bar" data-value="$20" data-color="orange">
                                <div class="progress-fill"></div>
                            </div>
                            <span class="progress-value">$20</span>
                        </div>
                        <div>
                            <span class="label label marker-title blue ">✨清洁:   </span>
                            <div class="progress-bar" data-value="$21" data-color="blue">
                                <div class="progress-fill"></div>
                            </div>
                            <span class="progress-value">$21</span>
                        </div>
                    </div>
                </div>
                <div class="section3">
                    <div><span class="label marker-title pink">🩸经期:</span> <span class="value marker-title pink">$22</span></div>
                    <div><span class="label marker-title green">💪健康:</span> <span class="value">$18</span></div>
                    <div><span class="label marker-title purple">❓异常:</span> <span class="value marker-title purple">$23</span></div>
                </div>
            </div>
        </div>
        <!-- 第三页：学习任务 -->
        <div class="page inner-page study-page" data-page-index="2">
            <div class="item-block study-block">
                <div><span class="label marker-title purple">📚当前学习:</span> <span class="value">$24</span></div>
                <div><span class="label">🎓 掌握程度:</span> <span class="value marker-title khaki">$25</span></div>
                <div><span class="label">🔙 上次考试:</span> <span class="value">$26</span></div>
            </div>
            <div class="item-block task-block">
                <div><span class="label marker-title yellow">📅 长期任务:</span> <span class="value">$27</span></div>
                <div><span class="label marker-title pink ">🔑主线任务:</span> <span class="value ">$28</span></div>
                <div><span class="label marker-title green">📌日常任务:</span> <span class="value">$29</span></div>
            </div>
            <div class="item-block item-sub-block">
                <div>
                    <span class="label">🤗信任度:   </span>
                    <div class="progress-bar" data-value="$30" data-color="pink">
                        <div class="progress-fill"></div>
                    </div>
                    <span class="progress-value">$30</span>
                </div>
                <div>
                    <span class="label">💡觉醒度:   </span>
                    <div class="progress-bar" data-value="$31" data-color="cyan">
                        <div class="progress-fill"></div>
                    </div>
                    <span class="progress-value">$31</span>
                </div>
                <div>
                    <span class="label marker-title orange">📊系统分析:</span> <span class="value">$32</span>
                </div>
            </div>
            <div class="remind-block"><span class="label marker-title red">🔔提醒:</span> <span
                    class="value marker-title red">$33</span>
            </div>
        </div>
        <!-- 第四页：商城 -->
        <div class="page inner-page shop-page" data-page-index="3">
            <div class="shop-title ">
                <center><span class="label marker-title pink">🛒系统商城
            </div>
            <div>
                <div class="shop-thing-block"><span class="label marker-title green">💎积分:</span> <span
                        class="value"> $34</span></div>
            </div>
            <div>
                <div class="shop-thing-block"><span class="label marker-title khaki">商城可购买物品:</span> <span
                        class="value">
                        <P>$35
                    </span></div>
            </div>
        </div>
    </div>
    <!-- 侧边导航栏 -->
    <div class="sidebar">
        <div class="nav-tab active" data-page="0">封面</div>
        <div class="nav-tab" data-page="1">基础信息</div>
        <div class="nav-tab" data-page="2">学习任务</div>
        <div class="nav-tab" data-page="3">系统商城</div>
    </div>
</div>
    <script src="MultiverseTerminalSystem.js"></script>
</body>
</html>`,
    cssContent: `/* CSS 样式内容会被注入 */`,
    scriptContent: `/* JavaScript 内容会被注入 */`,
  },
];
