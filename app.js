// 麻雀理牌ゲーム - PWA版

// 麻雀牌の絵文字マッピング
const TILE_EMOJI = {
    // 萬子 (1m-9m)
    '1m': '🀇', '2m': '🀈', '3m': '🀉', '4m': '🀊', '5m': '🀋',
    '6m': '🀌', '7m': '🀍', '8m': '🀎', '9m': '🀏',
    // 筒子 (1p-9p)
    '1p': '🀙', '2p': '🀚', '3p': '🀛', '4p': '🀜', '5p': '🀝',
    '6p': '🀞', '7p': '🀟', '8p': '🀠', '9p': '🀡',
    // 索子 (1s-9s)
    '1s': '🀐', '2s': '🀑', '3s': '🀒', '4s': '🀓', '5s': '🀔',
    '6s': '🀕', '7s': '🀖', '8s': '🀗', '9s': '🀘',
    // 字牌 (1z-7z: 東南西北白發中)
    '1z': '🀀', '2z': '🀁', '3z': '🀂', '4z': '🀃',
    '5z': '🀆', '6z': '🀅', '7z': '🀄',
};

// ゲーム状態
let gameState = {
    tiles: [],
    moves: 0,
    startTime: null,
    timerInterval: null,
    selectedTileIndex: null,
};

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

// 牌を表示
function displayTiles() {
    const container = document.getElementById('tiles-container');
    container.innerHTML = '';

    gameState.tiles.forEach((tile, index) => {
        const tileElement = document.createElement('div');
        tileElement.className = 'tile';
        tileElement.textContent = TILE_EMOJI[tile];
        tileElement.dataset.index = index;

        if (gameState.selectedTileIndex === index) {
            tileElement.classList.add('selected');
        }

        tileElement.addEventListener('click', () => handleTileClick(index));
        container.appendChild(tileElement);
    });
}

// 牌クリック処理
function handleTileClick(index) {
    if (gameState.selectedTileIndex === null) {
        // 牌を選択
        gameState.selectedTileIndex = index;
        displayTiles();
        updateInstruction('移動先の位置をタップ');
    } else if (gameState.selectedTileIndex === index) {
        // 同じ牌をクリック → 選択解除
        gameState.selectedTileIndex = null;
        displayTiles();
        updateInstruction('牌をタップして選択し、もう一度タップして移動');
    } else {
        // 牌を移動
        moveTile(gameState.selectedTileIndex, index);
        gameState.selectedTileIndex = null;
        gameState.moves++;
        updateStats();
        displayTiles();
        updateInstruction('牌をタップして選択し、もう一度タップして移動');

        // 完成チェック
        if (isSorted(gameState.tiles)) {
            setTimeout(() => {
                endGame();
            }, 500);
        }
    }
}

// 牌を移動
function moveTile(fromIndex, toIndex) {
    const tile = gameState.tiles.splice(fromIndex, 1)[0];
    gameState.tiles.splice(toIndex, 0, tile);
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
    gameState.selectedTileIndex = null;

    updateStats();
    displayTiles();
    showScreen('game-screen');
    startTimer();
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
        const tileElement = document.createElement('div');
        tileElement.className = 'tile';
        tileElement.textContent = TILE_EMOJI[tile];
        finalTilesContainer.appendChild(tileElement);
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
