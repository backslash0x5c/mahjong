#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
麻雀理牌ゲーム
ランダム配牌をユーザーが各牌種にまとめてソートする
スコア = 手数 × 時間（秒）で評価（低いほど良い）
"""

import random
import time


def generate_random_tiles(n=13):
    """
    ランダムに n 枚の麻雀牌を生成
    麻雀牌は各4枚ずつ存在
    """
    all_tiles = []

    # 萬子 1m～9m
    for i in range(1, 10):
        all_tiles.extend([f"{i}m"] * 4)

    # 筒子 1p～9p
    for i in range(1, 10):
        all_tiles.extend([f"{i}p"] * 4)

    # 索子 1s～9s
    for i in range(1, 10):
        all_tiles.extend([f"{i}s"] * 4)

    # 字牌 1z～7z（東南西北白発中）
    for i in range(1, 8):
        all_tiles.extend([f"{i}z"] * 4)

    # ランダムに n 枚を選択
    return random.sample(all_tiles, n)


def display_tile(tile):
    """牌を日本語表記で表示"""
    num = tile[0]
    suit = tile[1]

    if suit == 'z':
        names = {'1': '東', '2': '南', '3': '西', '4': '北',
                 '5': '白', '6': '發', '7': '中'}
        return names[num]
    else:
        suit_names = {'m': '萬', 'p': '筒', 's': '索'}
        kanji_nums = {'1': '一', '2': '二', '3': '三', '4': '四', '5': '五',
                      '6': '六', '7': '七', '8': '八', '9': '九'}
        return kanji_nums[num] + suit_names[suit]


def get_tile_sort_key(tile):
    """
    牌のソートキーを返す
    順序：萬子(m) < 筒子(p) < 索子(s) < 字牌(z)
    各牌種内は数字順
    """
    suit = tile[1]
    num = int(tile[0])

    suit_order = {'m': 0, 'p': 1, 's': 2, 'z': 3}
    return (suit_order[suit], num)


def is_sorted(tiles):
    """牌が正しくソートされているかチェック"""
    for i in range(len(tiles) - 1):
        if get_tile_sort_key(tiles[i]) > get_tile_sort_key(tiles[i + 1]):
            return False
    return True


def display_tiles_with_index(tiles):
    """インデックス付きで牌を表示"""
    print("\n位置:", " ".join([f"{i:2d}" for i in range(len(tiles))]))
    print("牌  :", " ".join([f"{t:3s}" for t in tiles]))
    print("表記:", " ".join([f"{display_tile(t):>3s}" for t in tiles]))


def get_move_input():
    """ユーザーから移動入力を取得"""
    while True:
        try:
            user_input = input("\n移動する牌の位置と移動先を入力（例: 5 2）または 'q' で終了: ").strip()

            if user_input.lower() == 'q':
                return None, None, True

            parts = user_input.split()
            if len(parts) != 2:
                print("エラー: 2つの数字を入力してください（例: 5 2）")
                continue

            from_pos = int(parts[0])
            to_pos = int(parts[1])

            return from_pos, to_pos, False

        except ValueError:
            print("エラー: 有効な数字を入力してください")
        except KeyboardInterrupt:
            print("\n")
            return None, None, True


def move_tile(tiles, from_pos, to_pos):
    """牌を移動する"""
    if from_pos < 0 or from_pos >= len(tiles):
        print(f"エラー: 移動元の位置 {from_pos} が範囲外です（0～{len(tiles)-1}）")
        return False

    if to_pos < 0 or to_pos >= len(tiles):
        print(f"エラー: 移動先の位置 {to_pos} が範囲外です（0～{len(tiles)-1}）")
        return False

    if from_pos == to_pos:
        print("エラー: 移動元と移動先が同じです")
        return False

    # 牌を移動
    moved_tile = tiles.pop(from_pos)
    tiles.insert(to_pos, moved_tile)

    return True


def calculate_score(moves, elapsed_time):
    """スコアを計算（手数 × 時間）"""
    return moves * elapsed_time


def main():
    print("=" * 70)
    print("麻雀理牌ゲーム")
    print("=" * 70)
    print("\nルール:")
    print("  - ランダムに配られた13枚の牌を、各牌種ごとにソートしてください")
    print("  - 牌種の順序: 萬子(m) → 筒子(p) → 索子(s) → 字牌(z)")
    print("  - 各牌種内は数字順（1～9、字牌は東南西北白發中）")
    print("  - スコア = 手数 × 時間（秒）で計算されます")
    print("  - スコアが低いほど優秀です！")
    print()

    # ランダムに13牌を生成
    tiles = generate_random_tiles(13)

    print("【初期配牌】")
    display_tiles_with_index(tiles)
    print()

    # 目標配列を表示
    sorted_tiles = sorted(tiles, key=get_tile_sort_key)
    print("【目標配列（参考）】")
    print("牌  :", " ".join([f"{t:3s}" for t in sorted_tiles]))
    print("表記:", " ".join([f"{display_tile(t):>3s}" for t in sorted_tiles]))
    print()

    input("Enterキーを押してゲームを開始...")

    # ゲーム開始
    start_time = time.time()
    moves = 0
    quit_game = False

    while not is_sorted(tiles):
        print("\n" + "-" * 70)
        print(f"手数: {moves}")
        display_tiles_with_index(tiles)

        from_pos, to_pos, quit_game = get_move_input()

        if quit_game:
            print("\nゲームを終了します")
            break

        if move_tile(tiles, from_pos, to_pos):
            moves += 1
            moved_tile = tiles[to_pos]
            print(f"\n✓ 位置 {from_pos} の {moved_tile}({display_tile(moved_tile)}) を位置 {to_pos} に移動しました")

            # 終了判定
            if is_sorted(tiles):
                end_time = time.time()
                elapsed_time = end_time - start_time
                score = calculate_score(moves, elapsed_time)

                print("\n" + "=" * 70)
                print("🎉 おめでとうございます！理牌完成！")
                print("=" * 70)
                display_tiles_with_index(tiles)
                print()
                print(f"手数: {moves}手")
                print(f"時間: {elapsed_time:.2f}秒")
                print(f"スコア: {score:.2f} （手数 × 時間）")
                print("=" * 70)
                break

    if quit_game and not is_sorted(tiles):
        print("\n未完了のままゲームを終了しました")


if __name__ == "__main__":
    main()
