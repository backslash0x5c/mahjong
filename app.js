// 麻雀理牌ゲーム - PWA版（ドラッグ&ドロップ対応・画像使用）

// ゲーム状態
let gameState = {
    tiles: [],
    moves: 0,
    startTime: null,
    timerInterval: null,
    draggedIndex: null,
    draggedElement: null,
};

// デバイス検出
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
}

// ランダムに牌を生成
function generateRandomTiles(n = 13) {
    const allTiles = [];

    // 萬子 1m～9m
    for (let i = 1; i <= 9; i++) {
        for (let j = 0; j < 4; j++) {
            allTiles.push(`${i}m`);
        }
    }

    // 筒子 1p～9p
    for (let i = 1; i <= 9; i++) {
        for (let j = 0; j < 4; j++) {
            allTiles.push(`${i}p`);
        }
    }

    // 索子 1s～9s
    for (let i = 1; i <= 9; i++) {
        for (let j = 0; j < 4; j++) {
            allTiles.push(`${i}s`);
        }
    }

    // 字牌 1z～7z
    for (let i = 1; i <= 7; i++) {
        for (let j = 0; j < 4; j++) {
            allTiles.push(`${i}z`);
        }
    }

    // ランダムに n 枚を選択
    const shuffled = allTiles.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, n);
}

// 牌が正しくソートされているかチェック
function isSorted(tiles) {
    if (!tiles || tiles.length === 0) return true;

    // 連続する同じ種類の牌をグループ化
    const groups = [];
    let currentGroup = [tiles[0]];

    for (let i = 1; i < tiles.length; i++) {
        const currentSuit = tiles[i][1];
        const prevSuit = tiles[i - 1][1];

        if (currentSuit === prevSuit) {
            currentGroup.push(tiles[i]);
        } else {
            groups.push(currentGroup);
            currentGroup = [tiles[i]];
        }
    }
    groups.push(currentGroup);

    // 各グループ内がソートされているかチェック
    const seenSuits = new Set();
    for (const group of groups) {
        const suit = group[0][1];

        // 同じ種類が既に出現していたらNG
        if (seenSuits.has(suit)) {
            return false;
        }
        seenSuits.add(suit);

        // グループ内で数字が増加順になっているかチェック
        for (let i = 0; i < group.length - 1; i++) {
            const numCurrent = parseInt(group[i][0]);
            const numNext = parseInt(group[i + 1][0]);

            if (numCurrent > numNext) {
                return false;
            }
        }
    }

    return true;
}

// 牌のサイズを計算（モバイルで横一列に収まるように）
function calculateTileSize() {
    if (!isMobileDevice()) {
        return { width: 60, height: 80 }; // デスクトップは固定サイズ
    }

    const container = document.getElementById('tiles-container');
    const containerWidth = container.clientWidth;
    const tileCount = gameState.tiles.length;
    const gap = 8; // gap between tiles
    const padding = 32; // container padding

    // 利用可能な幅を計算
    const availableWidth = containerWidth - padding - (gap * (tileCount - 1));
    const tileWidth = Math.floor(availableWidth / tileCount);

    // 最大サイズと最小サイズを設定
    const maxWidth = 60;
    const minWidth = 35;
    const finalWidth = Math.max(minWidth, Math.min(maxWidth, tileWidth));
    const finalHeight = Math.floor(finalWidth * 4 / 3); // アスペクト比 3:4

    return { width: finalWidth, height: finalHeight };
}

// 牌を表示
function displayTiles() {
    const container = document.getElementById('tiles-container');
    container.innerHTML = '';

    const tileSize = calculateTileSize();

    gameState.tiles.forEach((tile, index) => {
        const tileWrapper = document.createElement('div');
        tileWrapper.className = 'tile-wrapper';
        tileWrapper.dataset.index = index;

        // 画像を使用
        const tileImg = document.createElement('img');
        tileImg.src = `image/${tile}.svg`;
        tileImg.alt = tile;
        tileImg.className = 'tile';
        tileImg.style.width = `${tileSize.width}px`;
        tileImg.style.height = `${tileSize.height}px`;
        tileImg.draggable = false; // 画像自体のドラッグを無効化

        tileWrapper.appendChild(tileImg);

        // デスクトップ: ドラッグ可能にする
        if (!isMobileDevice()) {
            tileWrapper.draggable = true;

            // マウスイベント
            tileWrapper.addEventListener('dragstart', handleDragStart);
            tileWrapper.addEventListener('dragend', handleDragEnd);
            tileWrapper.addEventListener('dragover', handleDragOver);
            tileWrapper.addEventListener('drop', handleDrop);
            tileWrapper.addEventListener('dragenter', handleDragEnter);
            tileWrapper.addEventListener('dragleave', handleDragLeave);
        } else {
            // モバイル: タッチイベント
            tileWrapper.addEventListener('touchstart', handleTouchStart, { passive: false });
            tileWrapper.addEventListener('touchmove', handleTouchMove, { passive: false });
            tileWrapper.addEventListener('touchend', handleTouchEnd, { passive: false });
        }

        container.appendChild(tileWrapper);
    });

    // モバイル用：コンテナのスタイルを調整
    if (isMobileDevice()) {
        container.style.flexWrap = 'nowrap';
        container.style.gap = '8px';
        container.style.overflowX = 'auto';
        container.style.justifyContent = 'flex-start';
    }
}

// ドラッグ開始（デスクトップ）
function handleDragStart(e) {
    gameState.draggedElement = e.currentTarget;
    gameState.draggedIndex = parseInt(e.currentTarget.dataset.index);
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
}

// ドラッグ終了（デスクトップ）
function handleDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    // すべてのドラッグオーバー表示をクリア
    document.querySelectorAll('.tile-wrapper').forEach(tile => {
        tile.classList.remove('drag-over');
    });
}

// ドラッグオーバー（デスクトップ）
function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

// ドラッグ進入（デスクトップ）
function handleDragEnter(e) {
    if (e.currentTarget !== gameState.draggedElement) {
        e.currentTarget.classList.add('drag-over');
    }
}

// ドラッグ離脱（デスクトップ）
function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

// ドロップ（デスクトップ）
function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    const dropIndex = parseInt(e.currentTarget.dataset.index);

    if (gameState.draggedIndex !== null && gameState.draggedIndex !== dropIndex) {
        // 牌を移動
        const draggedTile = gameState.tiles.splice(gameState.draggedIndex, 1)[0];
        gameState.tiles.splice(dropIndex, 0, draggedTile);

        gameState.moves++;
        updateStats();
        displayTiles();

        // 完成チェック
        if (isSorted(gameState.tiles)) {
            setTimeout(() => {
                endGame();
            }, 300);
        }
    }

    e.currentTarget.classList.remove('drag-over');
    return false;
}

// タッチイベント処理（モバイル対応）
let touchState = {
    startX: 0,
    startY: 0,
    element: null,
    clone: null,
    currentDropTarget: null,
    dropIndicator: null,
};

function handleTouchStart(e) {
    const touch = e.touches[0];
    const element = e.currentTarget;

    touchState.element = element;
    touchState.startX = touch.clientX;
    touchState.startY = touch.clientY;

    gameState.draggedIndex = parseInt(element.dataset.index);

    // ドラッグ中の視覚的フィードバック用のクローンを作成
    touchState.clone = element.cloneNode(true);
    touchState.clone.classList.add('dragging-touch');
    touchState.clone.style.position = 'fixed';
    touchState.clone.style.pointerEvents = 'none';
    touchState.clone.style.zIndex = '1000';
    touchState.clone.style.opacity = '0.8';
    const rect = element.getBoundingClientRect();
    touchState.clone.style.width = rect.width + 'px';
    touchState.clone.style.height = rect.height + 'px';
    updateClonePosition(touch.clientX, touch.clientY, rect.width, rect.height);
    document.body.appendChild(touchState.clone);

    element.classList.add('dragging');

    // ドロップインジケーターを作成
    if (!touchState.dropIndicator) {
        touchState.dropIndicator = document.createElement('div');
        touchState.dropIndicator.className = 'drop-indicator';
        document.body.appendChild(touchState.dropIndicator);
    }
}

function handleTouchMove(e) {
    e.preventDefault();

    if (!touchState.element) return;

    const touch = e.touches[0];
    const rect = touchState.element.getBoundingClientRect();
    updateClonePosition(touch.clientX, touch.clientY, rect.width, rect.height);

    // 現在のタッチ位置の下にある要素を取得
    touchState.clone.style.display = 'none';
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    touchState.clone.style.display = '';

    // ドロップ位置を特定
    if (elementBelow) {
        const tileWrapper = elementBelow.closest('.tile-wrapper');
        if (tileWrapper && tileWrapper !== touchState.element) {
            const targetRect = tileWrapper.getBoundingClientRect();
            const dropIndex = parseInt(tileWrapper.dataset.index);
            const draggedIndex = gameState.draggedIndex;

            // ドロップ位置を計算（左側か右側か）
            let indicatorX;
            if (dropIndex < draggedIndex) {
                // 左側に挿入
                indicatorX = targetRect.left;
            } else {
                // 右側に挿入
                indicatorX = targetRect.right;
            }

            // インジケーターを表示
            touchState.dropIndicator.style.display = 'block';
            touchState.dropIndicator.style.left = indicatorX + 'px';
            touchState.dropIndicator.style.top = targetRect.top + 'px';
            touchState.dropIndicator.style.height = targetRect.height + 'px';

            touchState.currentDropTarget = tileWrapper;
        } else {
            touchState.dropIndicator.style.display = 'none';
        }
    } else {
        touchState.dropIndicator.style.display = 'none';
    }
}

function handleTouchEnd(e) {
    if (!touchState.element) return;

    touchState.element.classList.remove('dragging');

    // クローンを削除
    if (touchState.clone && touchState.clone.parentNode) {
        touchState.clone.parentNode.removeChild(touchState.clone);
    }

    // インジケーターを非表示
    if (touchState.dropIndicator) {
        touchState.dropIndicator.style.display = 'none';
    }

    // ドロップ処理
    if (touchState.currentDropTarget) {
        const dropIndex = parseInt(touchState.currentDropTarget.dataset.index);

        if (gameState.draggedIndex !== dropIndex) {
            // 牌を移動
            const draggedTile = gameState.tiles.splice(gameState.draggedIndex, 1)[0];
            gameState.tiles.splice(dropIndex, 0, draggedTile);

            gameState.moves++;
            updateStats();
            displayTiles();

            // 完成チェック
            if (isSorted(gameState.tiles)) {
                setTimeout(() => {
                    endGame();
                }, 300);
            }
        }
    }

    // クリーンアップ
    touchState = {
        startX: 0,
        startY: 0,
        element: null,
        clone: null,
        currentDropTarget: null,
        dropIndicator: touchState.dropIndicator, // インジケーターは保持
    };
}

function updateClonePosition(x, y, width, height) {
    if (touchState.clone) {
        touchState.clone.style.left = (x - width / 2) + 'px';
        touchState.clone.style.top = (y - height / 2) + 'px';
    }
}

// 指示を更新
function updateInstruction(text) {
    const instruction = document.getElementById('instruction');
    instruction.textContent = text;
}

// 統計情報を更新
function updateStats() {
    document.getElementById('moves').textContent = gameState.moves;
}

// タイマー開始
function startTimer() {
    gameState.startTime = Date.now();
    gameState.timerInterval = setInterval(() => {
        const elapsed = (Date.now() - gameState.startTime) / 1000;
        document.getElementById('timer').textContent = elapsed.toFixed(1) + 's';
    }, 100);
}

// タイマー停止
function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

// 経過時間を取得
function getElapsedTime() {
    if (!gameState.startTime) return 0;
    return (Date.now() - gameState.startTime) / 1000;
}

// スコアを計算
function calculateScore(moves, time) {
    return moves * time;
}

// 画面切り替え
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// ゲーム開始
function startGame() {
    gameState.tiles = generateRandomTiles(13);
    gameState.moves = 0;

    updateStats();
    showScreen('game-screen');

    // 画面サイズが確定してから表示
    setTimeout(() => {
        displayTiles();
        startTimer();
    }, 50);

    const deviceType = isMobileDevice() ? 'タッチ' : 'マウス';
    updateInstruction(`牌を${deviceType}でドラッグ&ドロップして並び替え`);
}

// ゲーム終了
function endGame() {
    stopTimer();
    const elapsedTime = getElapsedTime();
    const score = calculateScore(gameState.moves, elapsedTime);

    // 結果を表示
    document.getElementById('result-moves').textContent = gameState.moves;
    document.getElementById('result-time').textContent = elapsedTime.toFixed(2) + 's';
    document.getElementById('result-score').textContent = score.toFixed(2);

    // 最終的な牌配列を表示
    const finalTilesContainer = document.getElementById('final-tiles');
    finalTilesContainer.innerHTML = '';
    gameState.tiles.forEach(tile => {
        const tileImg = document.createElement('img');
        tileImg.src = `image/${tile}.svg`;
        tileImg.alt = tile;
        tileImg.className = 'tile';
        finalTilesContainer.appendChild(tileImg);
    });

    showScreen('result-screen');
}

// ゲーム中断
function quitGame() {
    if (confirm('ゲームを終了しますか？')) {
        stopTimer();
        showScreen('start-screen');
    }
}

// イベントリスナー設定
document.addEventListener('DOMContentLoaded', () => {
    // スタートボタン
    document.getElementById('start-btn').addEventListener('click', startGame);

    // 終了ボタン
    document.getElementById('quit-btn').addEventListener('click', quitGame);

    // リスタートボタン
    document.getElementById('restart-btn').addEventListener('click', startGame);

    // リサイズイベント（モバイル）
    let resizeTimer;
    window.addEventListener('resize', () => {
        if (isMobileDevice() && gameState.tiles.length > 0) {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                displayTiles();
            }, 250);
        }
    });

    // Service Worker登録
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    }
});
