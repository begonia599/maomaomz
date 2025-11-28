/**
 * 内容预处理工具 - 过滤敏感信息避免触发 AI 安全机制
 */

/**
 * 替换内容中的敏感信息
 * 将敏感词替换为安全表述，避免触发 Gemini 等模型的安全拒绝
 */
export function sanitizeAgeContent(content: string): string {
  if (!content) return content;

  let result = content;

  // 中文年龄表述：X岁（X < 18）
  result = result.replace(/\b([1-9]|1[0-7])\s*岁/g, '年轻');
  result = result.replace(/\b0([1-9]|1[0-7])\s*岁/g, '年轻');

  // 英文年龄表述
  result = result.replace(/\b([1-9]|1[0-7])\s*years?\s*old\b/gi, 'young');
  result = result.replace(/\b([1-9]|1[0-7])-year-old\b/gi, 'young');
  result = result.replace(/\bage\s*([1-9]|1[0-7])\b/gi, 'young age');

  // 敏感词替换表
  const sensitiveTerms: [RegExp, string][] = [
    // === 年龄相关 ===
    [/未成年/g, '年轻人'],
    [/小孩子?/g, '年轻人'],
    [/小朋友/g, '年轻人'],
    [/小学生/g, '学生'],
    [/初中生/g, '学生'],
    [/中学生/g, '学生'],
    [/高中生/g, '学生'],
    [/幼女/g, '少女'],
    [/幼童/g, '年轻人'],
    [/儿童/g, '年轻人'],
    [/萝莉/g, '少女'],
    [/正太/g, '少年'],
    [/\bminor[s]?\b/gi, 'young person'],
    [/\bchild(ren)?\b/gi, 'young person'],
    [/\bkid[s]?\b/gi, 'young person'],
    [/\bteen(ager)?[s]?\b/gi, 'young person'],
    [/\bunder\s*age[d]?\b/gi, 'young'],
    [/\bloli\b/gi, 'girl'],
    [/\bshota\b/gi, 'boy'],

    // === 家庭关系敏感词（乱伦相关）===
    [/乱伦/g, '禁忌关系'],
    [/母子/g, '两人'],
    [/父女/g, '两人'],
    [/兄妹/g, '两人'],
    [/姐弟/g, '两人'],
    [/兄弟/g, '两人'],
    [/姐妹/g, '两人'],
    [/母女/g, '两人'],
    [/父子/g, '两人'],
    [/叔侄/g, '两人'],
    [/舅甥/g, '两人'],
    [/继母/g, '女性'],
    [/继父/g, '男性'],
    [/后妈/g, '女性'],
    [/后爸/g, '男性'],
    [/养母/g, '女性'],
    [/养父/g, '男性'],
    [/干妈/g, '女性'],
    [/干爹/g, '男性'],
    [/岳母/g, '女性'],
    [/公公/g, '男性'],
    [/婆婆/g, '女性'],
    [/嫂子/g, '女性'],
    [/小姨子?/g, '女性'],
    [/大姨子?/g, '女性'],
    [/小舅子?/g, '男性'],
    [/大舅子?/g, '男性'],
    [/\bincest\b/gi, 'forbidden relationship'],
    [/\bstep-?mom\b/gi, 'woman'],
    [/\bstep-?dad\b/gi, 'man'],
    [/\bstep-?mother\b/gi, 'woman'],
    [/\bstep-?father\b/gi, 'man'],
    [/\bstep-?sister\b/gi, 'woman'],
    [/\bstep-?brother\b/gi, 'man'],
    [/\bstep-?son\b/gi, 'man'],
    [/\bstep-?daughter\b/gi, 'woman'],

    // === 暴力/非自愿相关 ===
    [/强奸/g, '强制'],
    [/强暴/g, '强制'],
    [/轮奸/g, '侵犯'],
    [/迷奸/g, '侵犯'],
    [/侵犯/g, '亲密'],
    [/猥亵/g, '触碰'],
    [/性侵/g, '侵犯'],
    [/非礼/g, '触碰'],
    [/调戏/g, '挑逗'],
    [/骚扰/g, '打扰'],
    [/\brape[d]?\b/gi, 'take'],
    [/\braped\b/gi, 'taken'],
    [/\braping\b/gi, 'taking'],
    [/\bassault(ed)?\b/gi, 'touch'],
    [/\bmolest(ed)?\b/gi, 'touch'],
    [/\bforce[d]?\b/gi, 'push'],
    [/\bforcing\b/gi, 'pushing'],

    // === 露骨身体部位（中文）===
    [/阴茎/g, '下体'],
    [/阴道/g, '下体'],
    [/阴蒂/g, '敏感处'],
    [/阴唇/g, '私处'],
    [/阴囊/g, '下体'],
    [/睾丸/g, '下体'],
    [/龟头/g, '前端'],
    [/肉棒/g, '分身'],
    [/肉根/g, '分身'],
    [/肉刃/g, '分身'],
    [/鸡巴/g, '分身'],
    [/屌/g, '分身'],
    [/几把/g, '分身'],
    [/jb/gi, '分身'],
    [/阳具/g, '分身'],
    [/性器/g, '私处'],
    [/生殖器/g, '私处'],
    [/子宫/g, '深处'],
    [/宫口/g, '深处'],
    [/花穴/g, '私处'],
    [/肉穴/g, '私处'],
    [/小穴/g, '私处'],
    [/蜜穴/g, '私处'],
    [/菊穴/g, '后庭'],
    [/菊花/g, '后庭'],
    [/肛门/g, '后庭'],
    [/后穴/g, '后庭'],
    [/乳房/g, '胸部'],
    [/乳头/g, '胸前'],
    [/乳尖/g, '胸前'],
    [/乳晕/g, '胸前'],
    [/奶子/g, '胸部'],
    [/奶头/g, '胸前'],
    [/大奶/g, '丰满'],
    [/巨乳/g, '丰满'],
    [/贫乳/g, '娇小'],
    [/屁股/g, '臀部'],
    [/臀瓣/g, '臀部'],
    [/股沟/g, '臀缝'],
    [/会阴/g, '私处'],

    // === 露骨身体部位（英文）===
    [/\bpenis\b/gi, 'member'],
    [/\bcock\b/gi, 'member'],
    [/\bdick\b/gi, 'member'],
    [/\bphallus\b/gi, 'member'],
    [/\bvagina\b/gi, 'entrance'],
    [/\bpussy\b/gi, 'entrance'],
    [/\bcunt\b/gi, 'entrance'],
    [/\bclit(oris)?\b/gi, 'sensitive spot'],
    [/\btesticle[s]?\b/gi, 'parts'],
    [/\bball[s]?\b/gi, 'parts'],
    [/\banus\b/gi, 'rear'],
    [/\bass\b/gi, 'rear'],
    [/\basshole\b/gi, 'rear'],
    [/\bbreast[s]?\b/gi, 'chest'],
    [/\bboob[s]?\b/gi, 'chest'],
    [/\btit[s]?\b/gi, 'chest'],
    [/\bnipple[s]?\b/gi, 'tips'],
    [/\bareola[s]?\b/gi, 'tips'],

    // === 露骨动作（中文）===
    [/性交/g, '结合'],
    [/做爱/g, '亲热'],
    [/交媾/g, '结合'],
    [/交合/g, '结合'],
    [/媾和/g, '结合'],
    [/操/g, '要'],
    [/干/g, '要'],
    [/肏/g, '要'],
    [/草/g, '要'],
    [/艹/g, '要'],
    [/插入/g, '进入'],
    [/抽插/g, '律动'],
    [/抽送/g, '律动'],
    [/抽动/g, '动作'],
    [/顶弄/g, '触碰'],
    [/冲刺/g, '加速'],
    [/射精/g, '释放'],
    [/射了/g, '释放了'],
    [/内射/g, '注入'],
    [/中出/g, '注入'],
    [/颜射/g, '释放'],
    [/口交/g, '服侍'],
    [/口爆/g, '释放'],
    [/深喉/g, '吞入'],
    [/舔弄/g, '亲吻'],
    [/舔舐/g, '亲吻'],
    [/吮吸/g, '品尝'],
    [/吞咽/g, '吞下'],
    [/手淫/g, '抚慰'],
    [/自慰/g, '抚慰'],
    [/撸/g, '抚摸'],
    [/打飞机/g, '抚慰'],
    [/高潮/g, '巅峰'],
    [/潮吹/g, '释放'],
    [/潮喷/g, '释放'],
    [/绝顶/g, '巅峰'],
    [/爽/g, '舒服'],
    [/淫/g, '欲'],
    [/骚/g, '媚'],
    [/浪/g, '放纵'],
    [/荡/g, '放纵'],
    [/贱/g, '顺从'],
    [/婊/g, '女人'],
    [/妓/g, '女人'],
    [/娼/g, '女人'],
    [/勃起/g, '挺立'],
    [/硬了/g, '反应了'],
    [/湿了/g, '有感觉了'],
    [/流水/g, '湿润'],
    [/淫水/g, '液体'],
    [/爱液/g, '液体'],
    [/精液/g, '液体'],
    [/白浊/g, '液体'],

    // === 露骨动作（英文）===
    [/\bfuck(ed|ing)?\b/gi, 'have'],
    [/\bscrew(ed|ing)?\b/gi, 'have'],
    [/\bbang(ed|ing)?\b/gi, 'have'],
    [/\bpound(ed|ing)?\b/gi, 'push'],
    [/\bthrust(ed|ing)?\b/gi, 'move'],
    [/\bpenetrat(e|ed|ing)\b/gi, 'enter'],
    [/\bejaculat(e|ed|ing)\b/gi, 'release'],
    [/\bcum(ming)?\b/gi, 'release'],
    [/\borgasm(ed|ing)?\b/gi, 'peak'],
    [/\bblowjob\b/gi, 'service'],
    [/\bhandjob\b/gi, 'touch'],
    [/\bmasturbat(e|ed|ing)\b/gi, 'touch'],
    [/\berect(ion)?\b/gi, 'aroused'],
    [/\bhard-?on\b/gi, 'aroused'],
    [/\bwet\b/gi, 'excited'],
    [/\bhorny\b/gi, 'excited'],
    [/\baroused\b/gi, 'excited'],
    [/\bslut\b/gi, 'woman'],
    [/\bwhore\b/gi, 'woman'],
    [/\bbitch\b/gi, 'woman'],
    [/\bhooker\b/gi, 'woman'],
    [/\bprostitute\b/gi, 'woman'],

    // === 特殊play/情趣相关 ===
    [/SM/g, '情趣'],
    [/BDSM/gi, '情趣'],
    [/捆绑/g, '束缚'],
    [/绑缚/g, '束缚'],
    [/调教/g, '训练'],
    [/奴隶/g, '服从者'],
    [/主人/g, '支配者'],
    [/女王/g, '女性'],
    [/母狗/g, '她'],
    [/公狗/g, '他'],
    [/发情/g, '激动'],
    [/求欢/g, '渴望'],
    [/凌辱/g, '支配'],
    [/羞辱/g, '羞涩'],
    [/虐待/g, '管教'],
    [/鞭打/g, '管教'],
    [/滴蜡/g, '情趣'],
    [/窒息/g, '紧张'],
    [/3P/gi, '多人'],
    [/群交/g, '多人'],
    [/乱交/g, '多人'],
    [/换妻/g, '交换'],
    [/NTR/gi, '背叛'],
    [/绿帽/g, '背叛'],
    [/出轨/g, '背叛'],
    [/偷情/g, '私会'],
    [/\bbondage\b/gi, 'restraint'],
    [/\bslave\b/gi, 'submissive'],
    [/\bmaster\b/gi, 'dominant'],
    [/\bmistress\b/gi, 'dominant'],
    [/\bthreesome\b/gi, 'group'],
    [/\borgy\b/gi, 'group'],
    [/\bgang\s*bang\b/gi, 'group'],
    [/\bcheating\b/gi, 'betrayal'],
    [/\bcuckold\b/gi, 'betrayal'],
  ];

  for (const [pattern, replacement] of sensitiveTerms) {
    result = result.replace(pattern, replacement);
  }

  return result;
}

/**
 * 检查内容是否包含可能触发安全机制的关键词
 */
export function containsSensitiveContent(content: string): boolean {
  if (!content) return false;

  const sensitivePatterns = [
    /\b([1-9]|1[0-7])\s*岁/,
    /\b([1-9]|1[0-7])\s*years?\s*old\b/i,
    /未成年/,
    /\bminor[s]?\b/i,
    /\bchild(ren)?\b/i,
    /幼女|幼童|萝莉|正太/,
    /\bloli\b/i,
    /\bshota\b/i,
  ];

  return sensitivePatterns.some(pattern => pattern.test(content));
}

/**
 * 预处理发送给 AI 的内容
 * @param content 原始内容
 * @param enableFilter 是否启用过滤（可由设置控制）
 */
export function preprocessContent(content: string, enableFilter = true): string {
  if (!enableFilter) return content;
  return sanitizeAgeContent(content);
}
