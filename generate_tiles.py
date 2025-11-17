#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
麻雀牌のSVG画像を生成
"""

import os

# 画像出力ディレクトリ
OUTPUT_DIR = "image"

# SVGテンプレート
def create_tile_svg(tile_code, content):
    """麻雀牌のSVGを生成"""
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 80" width="60" height="80">
  <!-- 背景 -->
  <rect width="60" height="80" rx="4" fill="#f5f5dc" stroke="#333" stroke-width="2"/>
  <!-- 内容 -->
  {content}
</svg>'''
    return svg

# 萬子
def create_man(num):
    """萬子を生成"""
    kanji = ['一', '二', '三', '四', '五', '六', '七', '八', '九']
    color = '#d32f2f' if num == 5 else '#000'
    content = f'''<text x="30" y="35" text-anchor="middle" font-size="24" font-weight="bold" fill="{color}" font-family="serif">{kanji[num-1]}</text>
  <text x="30" y="58" text-anchor="middle" font-size="20" font-weight="bold" fill="{color}" font-family="serif">萬</text>'''
    return create_tile_svg(f"{num}m", content)

# 筒子
def create_pin(num):
    """筒子を生成（点で表現）"""
    positions = {
        1: [(30, 40)],
        2: [(20, 25), (40, 55)],
        3: [(20, 25), (30, 40), (40, 55)],
        4: [(20, 25), (40, 25), (20, 55), (40, 55)],
        5: [(20, 25), (40, 25), (30, 40), (20, 55), (40, 55)],
        6: [(20, 25), (40, 25), (20, 40), (40, 40), (20, 55), (40, 55)],
        7: [(20, 22), (40, 22), (20, 37), (30, 40), (40, 37), (20, 58), (40, 58)],
        8: [(20, 20), (40, 20), (20, 33), (40, 33), (20, 47), (40, 47), (20, 60), (40, 60)],
        9: [(20, 20), (30, 20), (40, 20), (20, 40), (30, 40), (40, 40), (20, 60), (30, 60), (40, 60)],
    }

    dots = positions[num]
    radius = 4 if num > 6 else 5
    circles = '\n  '.join([f'<circle cx="{x}" cy="{y}" r="{radius}" fill="#d32f2f"/>' for x, y in dots])

    return create_tile_svg(f"{num}p", circles)

# 索子
def create_sou(num):
    """索子を生成（竹で表現）"""
    rects = []
    spacing = 10 if num > 5 else 12
    start_y = 15

    for i in range(num):
        y = start_y + i * spacing
        rects.append(f'<rect x="27" y="{y}" width="6" height="8" fill="#2e7d32" rx="1"/>')

    content = '\n  '.join(rects)
    content += f'\n  <text x="30" y="72" text-anchor="middle" font-size="12" font-weight="bold" fill="#2e7d32">{num}</text>'

    return create_tile_svg(f"{num}s", content)

# 字牌
def create_honor(num):
    """字牌を生成"""
    honors = {
        1: ('東', '#000'),
        2: ('南', '#000'),
        3: ('西', '#000'),
        4: ('北', '#000'),
        5: ('白', '#1976d2'),
        6: ('發', '#2e7d32'),
        7: ('中', '#d32f2f'),
    }

    text, color = honors[num]

    if num == 5:  # 白
        content = f'<text x="30" y="50" text-anchor="middle" font-size="28" font-weight="bold" fill="none" stroke="{color}" stroke-width="2" font-family="serif">{text}</text>'
    else:
        content = f'<text x="30" y="50" text-anchor="middle" font-size="28" font-weight="bold" fill="{color}" font-family="serif">{text}</text>'

    return create_tile_svg(f"{num}z", content)

def main():
    """すべての麻雀牌のSVG画像を生成"""
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("麻雀牌のSVG画像を生成中...")

    # 萬子 1m～9m
    for i in range(1, 10):
        svg = create_man(i)
        with open(f"{OUTPUT_DIR}/{i}m.svg", 'w', encoding='utf-8') as f:
            f.write(svg)
        print(f"  {i}m.svg 作成")

    # 筒子 1p～9p
    for i in range(1, 10):
        svg = create_pin(i)
        with open(f"{OUTPUT_DIR}/{i}p.svg", 'w', encoding='utf-8') as f:
            f.write(svg)
        print(f"  {i}p.svg 作成")

    # 索子 1s～9s
    for i in range(1, 10):
        svg = create_sou(i)
        with open(f"{OUTPUT_DIR}/{i}s.svg", 'w', encoding='utf-8') as f:
            f.write(svg)
        print(f"  {i}s.svg 作成")

    # 字牌 1z～7z
    for i in range(1, 8):
        svg = create_honor(i)
        with open(f"{OUTPUT_DIR}/{i}z.svg", 'w', encoding='utf-8') as f:
            f.write(svg)
        print(f"  {i}z.svg 作成")

    print(f"\n完了！{OUTPUT_DIR}/ に34種類の麻雀牌画像を生成しました。")

if __name__ == "__main__":
    main()
