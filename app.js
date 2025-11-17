// 麻雀理牌ゲーム - PWA版（ドラッグ&ドロップ対応・画像使用）

// ゲーム状態
let gameState = {
    tiles: [],
    moves: 0,
    startTime: null,
    timerInterval: null,
    draggedIndex: null,
    draggedElement: null,
    dropIndicator: null, // ドロップインジケーター（デスクトップ・モバイル共通）
};

// 牌コードから画像ファイル名への変換
function getTileImagePath(tileCode) {
    const num = tileCode[0];
    const suit = tileCode[1];

    const suitMap = {
        'm': 'man',
        'p': 'pin',
        's': 'sou',
        'z': 'ji'
    };

    const fileName = `${suitMap[suit]}${num}-66-90-l.png`;
    return `image/${fileName}`;
}

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

// ドロップインジケーターを作成（デスクトップ・モバイル共通）
function createDropIndicator() {
    if (!gameState.dropIndicator) {
        gameState.dropIndicator = document.createElement('div');
        gameState.dropIndicator.className = 'drop-indicator';
        document.body.appendChild(gameState.dropIndicator);
    }
}

// ドロップインジケーターを表示
function showDropIndicator(targetElement, dropIndex, draggedIndex) {
    if (!gameState.dropIndicator) {
        createDropIndicator();
    }

    const targetRect = targetElement.getBoundingClientRect();

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
    gameState.dropIndicator.style.display = 'block';
    gameState.dropIndicator.style.left = indicatorX + 'px';
    gameState.dropIndicator.style.top = targetRect.top + 'px';
    gameState.dropIndicator.style.height = targetRect.height + 'px';
}

// ドロップインジケーターを非表示
function hideDropIndicator() {
    if (gameState.dropIndicator) {
        gameState.dropIndicator.style.display = 'none';
    }
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

    // 最大サイズのみ設定（最小サイズ制限なし）
    const maxWidth = 60;
    const finalWidth = Math.min(maxWidth, tileWidth);
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
        tileImg.src = getTileImagePath(tile);
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

    // モバイル用：コンテナのスタイルを調整（横一列に収める）
    if (isMobileDevice()) {
        container.style.flexWrap = 'nowrap';
        container.style.gap = '8px';
        container.style.overflowX = 'visible'; // スクロールを無効化
        container.style.justifyContent = 'center';
    } else {
        container.style.flexWrap = 'wrap';
        container.style.gap = '0.5rem';
        container.style.justifyContent = 'center';
    }
}

// ドラッグ開始（デスクトップ）
function handleDragStart(e) {
    gameState.draggedElement = e.currentTarget;
    gameState.draggedIndex = parseInt(e.currentTarget.dataset.index);
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);

    // ドロップインジケーターを作成
    createDropIndicator();
}

// ドラッグ終了（デスクトップ）
function handleDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    // インジケーターを非表示
    hideDropIndicator();
}

// ドラッグオーバー（デスクトップ）
function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';

    // ドロップインジケーターを表示
    const targetWrapper = e.currentTarget;
    if (targetWrapper !== gameState.draggedElement && targetWrapper.classList.contains('tile-wrapper')) {
        const dropIndex = parseInt(targetWrapper.dataset.index);
        showDropIndicator(targetWrapper, dropIndex, gameState.draggedIndex);
    }

    return false;
}

// ドラッグ進入（デスクトップ）
function handleDragEnter(e) {
    // インジケーターで表示するため、drag-overクラスは不要
}

// ドラッグ離脱（デスクトップ）
function handleDragLeave(e) {
    // インジケーターで表示するため、何もしない
}

// ドロップ（デスクトップ）
function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    const dropIndex = parseInt(e.currentTarget.dataset.index);

    // インジケーターを非表示
    hideDropIndicator();

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

    return false;
}

// タッチイベント処理（モバイル対応）
let touchState = {
    startX: 0,
    startY: 0,
    element: null,
    clone: null,
    currentDropTarget: null,
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
    createDropIndicator();
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
            const dropIndex = parseInt(tileWrapper.dataset.index);
            showDropIndicator(tileWrapper, dropIndex, gameState.draggedIndex);
            touchState.currentDropTarget = tileWrapper;
        } else {
            hideDropIndicator();
        }
    } else {
        hideDropIndicator();
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
    hideDropIndicator();

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

// =========================================
// ゲーム結果の保存・取得
// =========================================

const STORAGE_KEY = 'mahjong-game-results';
const MAX_RESULTS = 50; // 最大保存件数

// ゲーム結果を保存
function saveGameResult(result) {
    try {
        let results = getGameResults();

        // 新しい結果を先頭に追加
        results.unshift({
            id: Date.now(),
            moves: result.moves,
            time: result.time,
            score: result.score,
            tiles: result.tiles,
            date: new Date().toISOString()
        });

        // 最大件数を超えた場合は古いものを削除
        if (results.length > MAX_RESULTS) {
            results = results.slice(0, MAX_RESULTS);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
        return true;
    } catch (e) {
        console.error('結果の保存に失敗しました:', e);
        return false;
    }
}

// 全ゲーム結果を取得
function getGameResults() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('結果の取得に失敗しました:', e);
        return [];
    }
}

// ベストスコアを取得
function getBestScore() {
    const results = getGameResults();
    if (results.length === 0) return null;
    return results.reduce((best, current) =>
        !best || current.score < best.score ? current : best
    , null);
}

// 統計情報を取得
function getStatistics() {
    const results = getGameResults();
    if (results.length === 0) {
        return {
            totalGames: 0,
            bestScore: null,
            avgMoves: 0,
            avgTime: 0
        };
    }

    const totalMoves = results.reduce((sum, r) => sum + r.moves, 0);
    const totalTime = results.reduce((sum, r) => sum + r.time, 0);
    const bestScore = results.reduce((best, r) =>
        !best || r.score < best.score ? r.score : best
    , null);

    return {
        totalGames: results.length,
        bestScore: bestScore,
        avgMoves: (totalMoves / results.length).toFixed(1),
        avgTime: (totalTime / results.length).toFixed(1)
    };
}

// 結果をクリア
function clearGameResults() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (e) {
        console.error('結果のクリアに失敗しました:', e);
        return false;
    }
}

// =========================================
// SNSシェア機能
// =========================================

// シェアテキストを生成
function generateShareText(moves, time, score) {
    const stats = getStatistics();
    let text = `🀄 麻雀理牌ゲーム\n\n`;
    text += `手数: ${moves}手\n`;
    text += `時間: ${time.toFixed(2)}秒\n`;
    text += `スコア: ${score.toFixed(2)}\n\n`;

    if (stats.bestScore && score <= stats.bestScore) {
        text += `🎉 自己ベスト更新！\n\n`;
    }

    text += `#麻雀理牌ゲーム`;
    return text;
}

// Web Share APIで共有
async function shareResult(moves, time, score) {
    const text = generateShareText(moves, time, score);
    const url = window.location.href;

    // Web Share API が利用可能な場合
    if (navigator.share) {
        try {
            await navigator.share({
                title: '麻雀理牌ゲーム',
                text: text,
                url: url
            });
            return true;
        } catch (err) {
            // ユーザーがキャンセルした場合はエラーにしない
            if (err.name !== 'AbortError') {
                console.error('共有に失敗しました:', err);
            }
            return false;
        }
    }

    // Web Share API が利用できない場合はTwitterにフォールバック
    return shareToTwitter(moves, time, score);
}

// Twitter (X) で共有
function shareToTwitter(moves, time, score) {
    const text = generateShareText(moves, time, score);
    const url = window.location.href;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

    window.open(twitterUrl, '_blank', 'width=550,height=420');
    return true;
}

// LINEで共有
function shareToLine(moves, time, score) {
    const text = generateShareText(moves, time, score);
    const url = window.location.href;
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;

    window.open(lineUrl, '_blank', 'width=550,height=420');
    return true;
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

    // 結果をデータベースに保存
    const result = {
        moves: gameState.moves,
        time: elapsedTime,
        score: score,
        tiles: [...gameState.tiles]
    };
    saveGameResult(result);

    // 結果を表示
    document.getElementById('result-moves').textContent = gameState.moves;
    document.getElementById('result-time').textContent = elapsedTime.toFixed(2) + 's';
    document.getElementById('result-score').textContent = score.toFixed(2);

    // ベストスコアを表示
    const bestScore = getBestScore();
    const bestScoreElement = document.getElementById('best-score');
    if (bestScoreElement && bestScore) {
        bestScoreElement.textContent = bestScore.score.toFixed(2);
    }

    // 最終的な牌配列を表示
    const finalTilesContainer = document.getElementById('final-tiles');
    finalTilesContainer.innerHTML = '';
    gameState.tiles.forEach(tile => {
        const tileImg = document.createElement('img');
        tileImg.src = getTileImagePath(tile);
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

// 履歴画面を表示
function showHistory() {
    displayStatistics();
    displayHistoryList();
    showScreen('history-screen');
}

// 統計情報を表示
function displayStatistics() {
    const stats = getStatistics();
    const statsContainer = document.getElementById('statistics');

    if (stats.totalGames === 0) {
        statsContainer.innerHTML = '<p style="text-align: center; opacity: 0.7;">まだプレイ履歴がありません</p>';
        return;
    }

    statsContainer.innerHTML = `
        <div class="result-item">
            <span class="result-label">総プレイ回数</span>
            <span class="result-value">${stats.totalGames}</span>
        </div>
        <div class="result-item">
            <span class="result-label">ベストスコア</span>
            <span class="result-value">${stats.bestScore ? stats.bestScore.toFixed(2) : '-'}</span>
        </div>
        <div class="result-item">
            <span class="result-label">平均手数</span>
            <span class="result-value">${stats.avgMoves}</span>
        </div>
        <div class="result-item">
            <span class="result-label">平均時間</span>
            <span class="result-value">${stats.avgTime}s</span>
        </div>
    `;
}

// 履歴リストを表示
function displayHistoryList() {
    const results = getGameResults();
    const historyList = document.getElementById('history-list');

    if (results.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; opacity: 0.7;">プレイ履歴がありません</p>';
        return;
    }

    historyList.innerHTML = results.map((result, index) => {
        const date = new Date(result.date);
        const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
        const isBest = result.score === getStatistics().bestScore;

        return `
            <div class="history-item" style="
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                padding: 1rem;
                margin-bottom: 0.5rem;
                ${isBest ? 'border: 2px solid #ffd700;' : ''}
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <span style="opacity: 0.8;">${dateStr}</span>
                    ${isBest ? '<span style="color: #ffd700;">🏆 ベスト</span>' : ''}
                </div>
                <div style="display: flex; justify-content: space-around; font-size: 0.9rem;">
                    <div>手数: <strong>${result.moves}</strong></div>
                    <div>時間: <strong>${result.time.toFixed(2)}s</strong></div>
                    <div>スコア: <strong style="color: #ffd700;">${result.score.toFixed(2)}</strong></div>
                </div>
            </div>
        `;
    }).join('');
}

// 履歴をクリア
function clearHistory() {
    if (confirm('本当に履歴をすべて削除しますか？')) {
        clearGameResults();
        showHistory();
    }
}

// 結果をシェア
function handleShare() {
    const moves = gameState.moves;
    const time = getElapsedTime();
    const score = calculateScore(moves, time);
    shareResult(moves, time, score);
}

// イベントリスナー設定
document.addEventListener('DOMContentLoaded', () => {
    // スタートボタン
    document.getElementById('start-btn').addEventListener('click', startGame);

    // 終了ボタン
    document.getElementById('quit-btn').addEventListener('click', quitGame);

    // リスタートボタン
    document.getElementById('restart-btn').addEventListener('click', startGame);

    // 履歴ボタン
    document.getElementById('history-btn').addEventListener('click', showHistory);

    // シェアボタン
    document.getElementById('share-btn').addEventListener('click', handleShare);

    // 履歴画面から戻るボタン
    document.getElementById('back-to-start-btn').addEventListener('click', () => {
        showScreen('start-screen');
    });

    // 履歴クリアボタン
    document.getElementById('clear-history-btn').addEventListener('click', clearHistory);

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
