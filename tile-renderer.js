// 麻雀牌画像生成ユーティリティ

const TileRenderer = {
    // 牌の表示情報
    tileInfo: {
        // 萬子
        '1m': { text: '一萬', color: '#000' },
        '2m': { text: '二萬', color: '#000' },
        '3m': { text: '三萬', color: '#000' },
        '4m': { text: '四萬', color: '#000' },
        '5m': { text: '五萬', color: '#d32f2f' },
        '6m': { text: '六萬', color: '#000' },
        '7m': { text: '七萬', color: '#000' },
        '8m': { text: '八萬', color: '#000' },
        '9m': { text: '九萬', color: '#000' },
        // 筒子
        '1p': { dots: 1, color: '#d32f2f' },
        '2p': { dots: 2, color: '#d32f2f' },
        '3p': { dots: 3, color: '#d32f2f' },
        '4p': { dots: 4, color: '#d32f2f' },
        '5p': { dots: 5, color: '#d32f2f' },
        '6p': { dots: 6, color: '#d32f2f' },
        '7p': { dots: 7, color: '#d32f2f' },
        '8p': { dots: 8, color: '#d32f2f' },
        '9p': { dots: 9, color: '#d32f2f' },
        // 索子
        '1s': { bamboo: 1, color: '#2e7d32' },
        '2s': { bamboo: 2, color: '#2e7d32' },
        '3s': { bamboo: 3, color: '#2e7d32' },
        '4s': { bamboo: 4, color: '#2e7d32' },
        '5s': { bamboo: 5, color: '#2e7d32' },
        '6s': { bamboo: 6, color: '#2e7d32' },
        '7s': { bamboo: 7, color: '#2e7d32' },
        '8s': { bamboo: 8, color: '#2e7d32' },
        '9s': { bamboo: 9, color: '#2e7d32' },
        // 字牌
        '1z': { text: '東', color: '#000' },
        '2z': { text: '南', color: '#000' },
        '3z': { text: '西', color: '#000' },
        '4z': { text: '北', color: '#000' },
        '5z': { text: '白', color: '#1976d2', outline: true },
        '6z': { text: '發', color: '#2e7d32' },
        '7z': { text: '中', color: '#d32f2f' },
    },

    // SVG牌を生成
    generateTileSVG(tileCode, width = 60, height = 80) {
        const info = this.tileInfo[tileCode];
        if (!info) return '';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', '0 0 60 80');

        // 背景
        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bg.setAttribute('width', '60');
        bg.setAttribute('height', '80');
        bg.setAttribute('rx', '4');
        bg.setAttribute('fill', '#f5f5dc');
        bg.setAttribute('stroke', '#333');
        bg.setAttribute('stroke-width', '2');
        svg.appendChild(bg);

        // 内容描画
        if (info.text) {
            this.drawText(svg, info.text, info.color, info.outline);
        } else if (info.dots) {
            this.drawDots(svg, info.dots, info.color);
        } else if (info.bamboo) {
            this.drawBamboo(svg, info.bamboo, info.color);
        }

        return svg;
    },

    // テキスト描画
    drawText(svg, text, color, outline = false) {
        const textElem = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textElem.setAttribute('x', '30');
        textElem.setAttribute('y', '50');
        textElem.setAttribute('text-anchor', 'middle');
        textElem.setAttribute('dominant-baseline', 'middle');
        textElem.setAttribute('font-size', '28');
        textElem.setAttribute('font-weight', 'bold');
        textElem.setAttribute('fill', color);
        textElem.setAttribute('font-family', 'sans-serif');
        textElem.textContent = text;

        if (outline) {
            textElem.setAttribute('stroke', color);
            textElem.setAttribute('stroke-width', '1');
            textElem.setAttribute('fill', 'none');
        }

        svg.appendChild(textElem);
    },

    // 筒子の点描画
    drawDots(svg, count, color) {
        const positions = {
            1: [[30, 40]],
            2: [[20, 25], [40, 55]],
            3: [[20, 25], [30, 40], [40, 55]],
            4: [[20, 25], [40, 25], [20, 55], [40, 55]],
            5: [[20, 25], [40, 25], [30, 40], [20, 55], [40, 55]],
            6: [[20, 25], [40, 25], [20, 40], [40, 40], [20, 55], [40, 55]],
            7: [[20, 22], [40, 22], [20, 37], [30, 40], [40, 37], [20, 58], [40, 58]],
            8: [[20, 20], [40, 20], [20, 33], [40, 33], [20, 47], [40, 47], [20, 60], [40, 60]],
            9: [[20, 20], [30, 20], [40, 20], [20, 40], [30, 40], [40, 40], [20, 60], [30, 60], [40, 60]],
        };

        const dots = positions[count] || [];
        dots.forEach(([x, y]) => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', count > 6 ? '4' : '5');
            circle.setAttribute('fill', color);
            svg.appendChild(circle);
        });
    },

    // 索子の竹描画（簡略版）
    drawBamboo(svg, count, color) {
        const centerX = 30;
        const startY = 15;
        const spacing = count > 5 ? 10 : 12;

        for (let i = 0; i < count; i++) {
            const y = startY + i * spacing;

            // 竹の茎
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', centerX - 3);
            rect.setAttribute('y', y);
            rect.setAttribute('width', '6');
            rect.setAttribute('height', '8');
            rect.setAttribute('fill', color);
            rect.setAttribute('rx', '1');
            svg.appendChild(rect);
        }

        // 数字を小さく表示
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '30');
        text.setAttribute('y', '72');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '12');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('fill', color);
        text.textContent = count;
        svg.appendChild(text);
    }
};

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TileRenderer;
}
