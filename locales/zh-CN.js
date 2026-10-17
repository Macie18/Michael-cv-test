// Interface copy is separate from shared asset paths and publication identifiers.
export default {
  brand: {name: '马乃东', subtitle: 'NAIDONG MA'},
  common: {
    phoneCopied: '电话 / 微信号码已复制',
    copyFailed: '浏览器未允许自动复制，可长按或选中号码。',
  },
  nav: {
    home: '首页', profile: '个人履历', team: '团队成员', practice: '专业领域',
    publications: '文章作品集', global: '跨境网络',
    menu: '菜单', contact: '联系', label: '主导航',
  },
  footer: {
    eyebrow: 'A CONVERSATION IN CONFIDENCE',
    heading: ['关于家族的下一步，', '从一次审慎的交流开始。'],
    position: '马乃东 · 高级合伙人', firm: '北京大成（上海）律师事务所',
    languages: '工作语言：中文、英文', officialProfile: '大成官方个人介绍',
    copyright: 'NAIDONG MA · 马乃东律师', practices: '家族争议 · 跨境继承 · 私人财富',
    disclaimer: '本站文章供专业交流，不构成对具体事项的法律意见。',
  },
  categories: {
    equity: '股权继承', cross: '跨境继承', family: '婚姻家事',
    tax: '财富与税务', litigation: '争议解决', english: '英文著述',
  },
  coverWords: {
    equity: '股权\n与继承', cross: '跨境\n与传承', family: '婚姻\n与家族',
    tax: '财富\n与税务', litigation: '争议\n与规则', english: 'Law &\nPerspective',
  },
  publications: {
    searchPublic: '检索公开版本 ↗', browserResults: '浏览器检索结果',
    readDacheng: '阅读大成版本', readOriginal: '阅读原文 ↗', original: '原文',
    record: '文献详情', updated: '更新', newWindow: '新窗口',
    dialogClose: '关闭文献信息', recordEyebrow: 'PUBLICATION RECORD',
    platforms: '发表平台', published: '发表日期', series: '所属系列', updatedEdition: '更新版',
    searchHint: '可通过浏览器检索文章标题及作者，查找发表记录或公开转载版本。',
    browserSearch: '浏览器检索', articles: 'ARTICLES', loadError: '文章目录暂时无法加载，请刷新页面重试。',
    emptyTitle: '暂无符合条件的文章', emptyBody: '可以尝试其他关键词或清除筛选。',
    clear: '清除筛选', works: '篇作品', total: '共', unit: '篇',
  },
  honors: {
    dataFile: '/data/honors.json', nominationKind: '奖项提名',
    linkLabel: (publisher, year) => `查看 ${publisher} ${year} 榜单`,
    loadError: '荣誉记录暂时无法加载，请刷新重试。',
  },
  network: {
    dataFile: '/data/network.json', hub: '上海', mapAction: '查看专业联络',
    imageSuffix: '相关专业交流资料', imageAction: '，点击查看完整图片',
    loadingError: '专业联络信息暂时无法加载，请刷新重试。',
    mapFallback: '上海 · 连接英国、加拿大、新加坡、澳大利亚与阿联酋的专业交流。<br>地图暂时不可用，可通过下方法域选项浏览。',
    caption: 'SHANGHAI & THE WORLD', dialogLabel: '查看完整图片', dialogClose: '关闭完整图片',
  },
};
