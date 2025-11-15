let currentPano = null;
let loadTimeout = null;
const selectPage = document.getElementById('selectPage');
const panoPage = document.getElementById('panoPage');
const panoContainer = document.getElementById('pano-container');
const loading = document.getElementById('loading');

// 选择全景类型
document.querySelectorAll('.select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-type');
        loadPano(type);
        selectPage.style.display = 'none';
        panoPage.style.display = 'block';
    });
});

// 加载全景（核心优化）
function loadPano(type) {
    loading.style.display = 'flex';
    if (loadTimeout) clearTimeout(loadTimeout);

     // 加载前先清理所有音频
    if (currentPano && currentPano.call) {
        currentPano.call("stopallsounds();");
        currentPano.call("unloadpano();");
    }
    const clickSound = document.getElementById('clickSound');
    if (clickSound) {
        clickSound.pause();
        clickSound.currentTime = 0;
    }
    // 1. 彻底清空容器（关键修复：清除所有旧DOM）
    panoContainer.innerHTML = ''; 
    currentPano = null;

    // 2. 全景配置路径（确保新/旧全景XML独立）
    const [xmlPath, resourcePrefix] = type === 'new' 
        ? ['new_pano/tour.xml', 'new_pano/']  // 新全景资源前缀
        : ['old_pano/tour.xml', 'old_pano/']; // 旧全景资源前缀

    // 3. 生成唯一ID，避免冲突
    const panoId = `pano-${type}-${Date.now()}`;

    // 4. 加载全景时传入资源前缀（供XML中动态引用）
    currentPano = embedpano({
        swf: `${resourcePrefix}tour.swf`,
        xml: xmlPath,
        target: panoContainer,
        width: "100%",
        height: "100%",
        id: panoId,
        vars: { 
            debugmode: false,
            resourcePrefix: resourcePrefix  // 传递资源前缀到XML
        },
        onready: () => {
            clearTimeout(loadTimeout);
            loading.style.display = 'none';
        }
    });

    // 超时容错
    loadTimeout = setTimeout(() => {
        console.warn('加载超时');
        loading.style.display = 'none';
    }, 10000);
}

// 退出全景（确保彻底清除）
document.getElementById('exitBtn').addEventListener('click', () => {
    if (loadTimeout) clearTimeout(loadTimeout);

    // 1. 停止krpano内部所有音频（核心修复）
    if (currentPano && currentPano.call) {
        // 停止所有krpano管理的音频（包括背景音、热点音等）
        currentPano.call("stopallsounds();");
        // 强制卸载全景资源
        currentPano.call("unloadpano();");
    }

    // 2. 停止页面独立的点击音效
    const clickSound = document.getElementById('clickSound');
    if (clickSound) {
        clickSound.pause();
        clickSound.currentTime = 0; // 重置播放位置
    }

    // 3. 清除DOM并释放引用
    panoContainer.innerHTML = '';
    currentPano = null;

    // 4. 页面切换
    panoPage.style.display = 'none';
    selectPage.style.display = 'flex';
});
