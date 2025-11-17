#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
麻雀の理牌最小手数計算プログラム
"""

import random
from itertools import permutations
from bisect import bisect_left


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
    
    # ランダムに13枚を選択
    return random.sample(all_tiles, n)


def create_rank_map(suit_order):
    """
    牌種順序に基づいて、各牌に順位を割り当てる
    suit_order: 例 ('m', 'p', 's', 'z')
    字牌内順序は東南西北-白発中に固定
    """
    rank_map = {}
    rank = 1
    
    for suit in suit_order:
        if suit == 'z':
            # 字牌：1z～7z（東南西北白発中）
            for i in range(1, 8):
                rank_map[f"{i}{suit}"] = rank
                rank += 1
        else:
            # 数牌：1～9
            for i in range(1, 10):
                rank_map[f"{i}{suit}"] = rank
                rank += 1
    
    return rank_map


def longest_increasing_subsequence(arr):
    """
    最長増加部分列（LIS）の長さと実際の要素のインデックスを O(n log n) で求める
    戻り値: (LISの長さ, LISの要素のインデックスリスト)
    """
    if not arr:
        return 0, []
    
    n = len(arr)
    tails = []  # tails[i] = 長さ i+1 の LIS の末尾要素の最小値
    tails_idx = []  # tails_idx[i] = その要素のインデックス
    parent = [-1] * n  # parent[i] = インデックスiの要素の前の要素のインデックス
    lis_end = [-1] * n  # lis_end[i] = 長さi+1のLISの末尾のインデックス
    
    for i, num in enumerate(arr):
        pos = bisect_left(tails, num)
        
        if pos == len(tails):
            tails.append(num)
            tails_idx.append(i)
        else:
            tails[pos] = num
            tails_idx[pos] = i
        
        # 親を記録
        if pos > 0:
            parent[i] = tails_idx[pos - 1]
        
        lis_end[pos] = i
    
    # バックトラックでLISを復元
    lis_length = len(tails)
    lis_indices = []
    current = tails_idx[-1]
    
    while current != -1:
        lis_indices.append(current)
        current = parent[current]
    
    lis_indices.reverse()
    
    return lis_length, lis_indices


def calculate_min_moves(tiles):
    """
    24通りの牌種順序を全探索し、最小手数を求める
    """
    min_moves = len(tiles)
    best_order = None
    best_lis_length = 0
    best_rank_array = None
    best_lis_indices = None
    
    # 4種類の牌種の全順列（24通り）
    for suit_order in permutations(['m', 'p', 's', 'z']):
        # 順位マップを作成
        rank_map = create_rank_map(suit_order)
        
        # 現在の配列を順位配列に変換
        rank_array = [rank_map[tile] for tile in tiles]
        
        # LIS の長さとインデックスを計算
        lis_length, lis_indices = longest_increasing_subsequence(rank_array)
        
        # 最小手数を更新
        moves = len(tiles) - lis_length
        if moves < min_moves:
            min_moves = moves
            best_order = suit_order
            best_lis_length = lis_length
            best_rank_array = rank_array
            best_lis_indices = lis_indices
    
    return min_moves, best_order, best_lis_length, best_rank_array, best_lis_indices


def get_suit_name(suit):
    """牌種コードから名前を取得"""
    names = {'m': '萬子', 'p': '筒子', 's': '索子', 'z': '字牌'}
    return names[suit]


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


def simulate_sorting_steps(tiles, lis_indices, rank_map):
    """
    1手ずつの操作過程をシミュレートして返す
    確実に目標配列に到達する手順を示す（理論的最小手数とは限らない）
    """
    steps = []
    
    # 目標配列を生成
    target = sorted([(tile, i) for i, tile in enumerate(tiles)],
                   key=lambda x: (rank_map[x[0]], x[1]))
    target_tiles = [t for t, _ in target]
    
    # 現在の配列
    current = list(tiles)
    
    # 初期状態を記録
    steps.append({
        'step': 0,
        'tiles': current.copy(),
        'message': '初期配牌',
        'move_from': None,
        'move_to': None,
        'moved_tile': None
    })
    
    step_num = 0
    
    # 左から順に、各位置を正しい牌で埋めていく
    for target_pos in range(len(current)):
        # target_posに配置されるべき牌
        target_tile = target_tiles[target_pos]
        
        # すでに正しい牌が配置されていればスキップ
        if current[target_pos] == target_tile:
            continue
        
        # 正しい牌を現在の配列から探す（target_posより後ろから）
        from_pos = None
        for i in range(target_pos + 1, len(current)):
            if current[i] == target_tile:
                from_pos = i
                break
        
        if from_pos is None:
            # 見つからない場合は前方を探す（通常はあり得ないが念のため）
            for i in range(target_pos):
                if current[i] == target_tile:
                    from_pos = i
                    break
        
        if from_pos is None or from_pos == target_pos:
            continue
        
        # 牌を移動
        moved_tile = current.pop(from_pos)
        current.insert(target_pos, moved_tile)
        
        step_num += 1
        
        # ステップを記録
        steps.append({
            'step': step_num,
            'tiles': current.copy(),
            'message': f'{step_num}手目',
            'move_from': from_pos,
            'move_to': target_pos,
            'moved_tile': moved_tile
        })
    
    return steps


def main():
    print("=" * 60)
    print("麻雀理牌最小手数計算プログラム")
    print("=" * 60)
    print()
    
    # ランダムに13牌を生成
    tiles = generate_random_tiles(13)
    
    print("【生成された配牌】")
    print("表記形式:", " ".join(tiles))
    print("日本語表記:", " ".join([display_tile(t) for t in tiles]))
    print()
    
    # 最小手数を計算
    min_moves, best_order, lis_length, rank_array, lis_indices = calculate_min_moves(tiles)
    
    print("【計算結果】")
    print(f"24通りの牌種順序を全探索しました")
    print()
    print(f"最小手数: {min_moves}手")
    print(f"最長増加部分列（LIS）の長さ: {lis_length}枚（動かさなくて良い牌）")
    print(f"最適な牌種順序: {' → '.join([get_suit_name(s) for s in best_order])}")
    print(f"                ({'-'.join(best_order)})")
    print()
    
    # 生成配牌に*印をつけて表示（動かすべき牌に*）
    lis_indices_set = set(lis_indices)
    print("【生成配牌（*印は動かすべき牌）】")
    marked_tiles = []
    marked_tiles_jp = []
    for i, tile in enumerate(tiles):
        if i not in lis_indices_set:
            marked_tiles.append(tile + "*")
            marked_tiles_jp.append(display_tile(tile) + "*")
        else:
            marked_tiles.append(tile)
            marked_tiles_jp.append(display_tile(tile))
    
    print("表記形式:", " ".join(marked_tiles))
    print("日本語表記:", " ".join(marked_tiles_jp))
    print()
    
    # 1手ずつの操作過程を表示
    rank_map = create_rank_map(best_order)
    steps = simulate_sorting_steps(tiles, lis_indices, rank_map)
    
    print("【操作過程】")
    print()
    for step_info in steps:
        step_num = step_info['step']
        step_tiles = step_info['tiles']
        message = step_info['message']
        
        if step_num == 0:
            # 初期配牌
            print(f"■ {message}")
        else:
            # 操作後
            moved_tile = step_info['moved_tile']
            from_pos = step_info['move_from']
            to_pos = step_info['move_to']
            print(f"■ {message}: 位置{from_pos}の{moved_tile}({display_tile(moved_tile)})を位置{to_pos}に移動")
        
        print(f"   表記形式: {' '.join(step_tiles)}")
        print(f"   日本語表記: {' '.join([display_tile(t) for t in step_tiles])}")
        print()
    
    # 最終確認
    sorted_tiles = sorted(tiles, key=lambda t: rank_map[t])
    print("【目標配列（最終状態）】")
    print("表記形式:", " ".join(sorted_tiles))
    print("日本語表記:", " ".join([display_tile(t) for t in sorted_tiles]))
    print()
    print("=" * 60)
    print()
    
    # 詳細情報（オプション）
    print("【詳細情報】")
    print()
    
    # LISを構成する牌を表示
    print("動かさなくて良い牌（LIS）:")
    print(f"  位置: {lis_indices}")
    lis_tiles = [tiles[i] for i in lis_indices]
    print(f"  表記形式: {' '.join(lis_tiles)}")
    print(f"  日本語表記: {' '.join([display_tile(t) for t in lis_tiles])}")
    print()
    
    # 動かす必要がある牌を表示
    move_indices = [i for i in range(len(tiles)) if i not in lis_indices_set]
    print("動かす必要がある牌:")
    print(f"  位置: {move_indices}")
    move_tiles = [tiles[i] for i in move_indices]
    print(f"  表記形式: {' '.join(move_tiles)}")
    print(f"  日本語表記: {' '.join([display_tile(t) for t in move_tiles])}")
    print()
    
    # 最適順序での順位配列を表示
    print("最適順序での各牌の順位:")
    for i, tile in enumerate(tiles):
        marker = " ○" if i in lis_indices_set else " ×"
        status = "残す" if i in lis_indices_set else "動かす"
        print(f"  位置{i:2d}: {tile:3s} ({display_tile(tile):2s}) → 順位 {rank_map[tile]:2d} {marker} [{status}]")
    
    print()
    print("順位配列:", rank_array)
    print()
    print("=" * 60)


if __name__ == "__main__":
    main()
