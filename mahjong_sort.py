#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Mahjong Tile Sorting - Minimum Moves Calculator
"""

import random
from itertools import permutations
from bisect import bisect_left


def generate_random_tiles(n=13):
    """
    Generate n random mahjong tiles
    Each tile type has 4 copies
    """
    all_tiles = []

    # Character tiles (Man) 1m~9m
    for i in range(1, 10):
        all_tiles.extend([f"{i}m"] * 4)

    # Circle tiles (Pin) 1p~9p
    for i in range(1, 10):
        all_tiles.extend([f"{i}p"] * 4)

    # Bamboo tiles (Sou) 1s~9s
    for i in range(1, 10):
        all_tiles.extend([f"{i}s"] * 4)

    # Honor tiles 1z~7z (East, South, West, North, White, Green, Red)
    for i in range(1, 8):
        all_tiles.extend([f"{i}z"] * 4)

    # Randomly select n tiles
    return random.sample(all_tiles, n)


def create_rank_map(suit_order):
    """
    Assign rank to each tile based on suit order
    suit_order: e.g., ('m', 'p', 's', 'z')
    Honor tiles are fixed in order: East, South, West, North, White, Green, Red
    """
    rank_map = {}
    rank = 1

    for suit in suit_order:
        if suit == 'z':
            # Honor tiles: 1z~7z (East, South, West, North, White, Green, Red)
            for i in range(1, 8):
                rank_map[f"{i}{suit}"] = rank
                rank += 1
        else:
            # Number tiles: 1~9
            for i in range(1, 10):
                rank_map[f"{i}{suit}"] = rank
                rank += 1

    return rank_map


def longest_increasing_subsequence(arr):
    """
    Find the length of Longest Increasing Subsequence (LIS) and indices in O(n log n)
    Returns: (LIS length, list of indices in LIS)
    """
    if not arr:
        return 0, []

    n = len(arr)
    tails = []  # tails[i] = minimum tail value of LIS with length i+1
    tails_idx = []  # tails_idx[i] = index of that element
    parent = [-1] * n  # parent[i] = index of previous element for element at index i
    lis_end = [-1] * n  # lis_end[i] = index of tail of LIS with length i+1

    for i, num in enumerate(arr):
        pos = bisect_left(tails, num)

        if pos == len(tails):
            tails.append(num)
            tails_idx.append(i)
        else:
            tails[pos] = num
            tails_idx[pos] = i

        # Record parent
        if pos > 0:
            parent[i] = tails_idx[pos - 1]

        lis_end[pos] = i

    # Backtrack to restore LIS
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
    Search all 24 suit orderings and find the minimum number of moves
    """
    min_moves = len(tiles)
    best_order = None
    best_lis_length = 0
    best_rank_array = None
    best_lis_indices = None

    # All permutations of 4 suits (24 patterns)
    for suit_order in permutations(['m', 'p', 's', 'z']):
        # Create rank map
        rank_map = create_rank_map(suit_order)

        # Convert current array to rank array
        rank_array = [rank_map[tile] for tile in tiles]

        # Calculate LIS length and indices
        lis_length, lis_indices = longest_increasing_subsequence(rank_array)

        # Update minimum moves
        moves = len(tiles) - lis_length
        if moves < min_moves:
            min_moves = moves
            best_order = suit_order
            best_lis_length = lis_length
            best_rank_array = rank_array
            best_lis_indices = lis_indices

    return min_moves, best_order, best_lis_length, best_rank_array, best_lis_indices


def get_suit_name(suit):
    """Get suit name in English"""
    names = {'m': 'Man', 'p': 'Pin', 's': 'Sou', 'z': 'Honor'}
    return names[suit]


def display_tile(tile):
    """Display tile as emoji"""
    num = tile[0]
    suit = tile[1]

    # Mahjong tile emojis mapping
    if suit == 'm':
        # Character tiles (Manzu): 🀇-🀏
        emoji_map = {
            '1': '🀇', '2': '🀈', '3': '🀉', '4': '🀊', '5': '🀋',
            '6': '🀌', '7': '🀍', '8': '🀎', '9': '🀏'
        }
        return emoji_map[num]
    elif suit == 'p':
        # Circle tiles (Pinzu): 🀙-🀡
        emoji_map = {
            '1': '🀙', '2': '🀚', '3': '🀛', '4': '🀜', '5': '🀝',
            '6': '🀞', '7': '🀟', '8': '🀠', '9': '🀡'
        }
        return emoji_map[num]
    elif suit == 's':
        # Bamboo tiles (Souzu): 🀐-🀘
        emoji_map = {
            '1': '🀐', '2': '🀑', '3': '🀒', '4': '🀓', '5': '🀔',
            '6': '🀕', '7': '🀖', '8': '🀗', '9': '🀘'
        }
        return emoji_map[num]
    elif suit == 'z':
        # Honor tiles: 🀀🀁🀂🀃🀆🀅🀄
        emoji_map = {
            '1': '🀀',  # East
            '2': '🀁',  # South
            '3': '🀂',  # West
            '4': '🀃',  # North
            '5': '🀆',  # White
            '6': '🀅',  # Green
            '7': '🀄'   # Red
        }
        return emoji_map[num]

    return tile


def simulate_sorting_steps(tiles, lis_indices, rank_map):
    """
    Simulate the sorting process step by step
    Shows a sequence that reaches the target array (not necessarily the theoretical minimum)
    """
    steps = []

    # Generate target array
    target = sorted([(tile, i) for i, tile in enumerate(tiles)],
                   key=lambda x: (rank_map[x[0]], x[1]))
    target_tiles = [t for t, _ in target]

    # Current array
    current = list(tiles)

    # Record initial state
    steps.append({
        'step': 0,
        'tiles': current.copy(),
        'message': 'Initial hand',
        'move_from': None,
        'move_to': None,
        'moved_tile': None
    })

    step_num = 0

    # Fill each position with the correct tile from left to right
    for target_pos in range(len(current)):
        # Tile that should be placed at target_pos
        target_tile = target_tiles[target_pos]

        # Skip if correct tile is already placed
        if current[target_pos] == target_tile:
            continue

        # Find the correct tile in current array (from positions after target_pos)
        from_pos = None
        for i in range(target_pos + 1, len(current)):
            if current[i] == target_tile:
                from_pos = i
                break

        if from_pos is None:
            # Search forward if not found (shouldn't happen, but just in case)
            for i in range(target_pos):
                if current[i] == target_tile:
                    from_pos = i
                    break

        if from_pos is None or from_pos == target_pos:
            continue

        # Move tile
        moved_tile = current.pop(from_pos)
        current.insert(target_pos, moved_tile)

        step_num += 1

        # Record step
        steps.append({
            'step': step_num,
            'tiles': current.copy(),
            'message': f'Move {step_num}',
            'move_from': from_pos,
            'move_to': target_pos,
            'moved_tile': moved_tile
        })

    return steps


def main():
    print("=" * 70)
    print("Mahjong Tile Sorting - Minimum Moves Calculator")
    print("=" * 70)
    print()

    # Generate random 13 tiles
    tiles = generate_random_tiles(13)

    # Calculate minimum moves
    min_moves, best_order, lis_length, rank_array, lis_indices = calculate_min_moves(tiles)

    print("[CALCULATION RESULT]")
    print(f"Explored all 24 suit orderings")
    print()
    print(f"Minimum moves required: {min_moves}")
    print(f"Longest Increasing Subsequence (LIS): {lis_length} tiles (don't need to move)")
    print(f"Optimal suit order: {' → '.join([get_suit_name(s) for s in best_order])}")
    print(f"                    ({'-'.join(best_order)})")
    print()

    # Display initial hand with * marking tiles to move
    lis_indices_set = set(lis_indices)
    print("[INITIAL HAND (* = tiles to move)]")
    marked_tiles_emoji = []
    for i, tile in enumerate(tiles):
        emoji = display_tile(tile)
        if i not in lis_indices_set:
            marked_tiles_emoji.append(emoji + "*")
        else:
            marked_tiles_emoji.append(emoji + " ")

    print("  " + " ".join(marked_tiles_emoji))
    print("  " + " ".join(tiles))
    print()

    # Display step-by-step sorting process
    rank_map = create_rank_map(best_order)
    steps = simulate_sorting_steps(tiles, lis_indices, rank_map)

    print("[SORTING STEPS]")
    print()
    for step_info in steps:
        step_num = step_info['step']
        step_tiles = step_info['tiles']
        message = step_info['message']

        if step_num == 0:
            # Initial hand
            print(f"Step {step_num}: Initial hand")
        else:
            # After operation
            moved_tile = step_info['moved_tile']
            from_pos = step_info['move_from']
            to_pos = step_info['move_to']
            emoji = display_tile(moved_tile)
            print(f"Step {step_num}: Move {emoji}({moved_tile}) from position {from_pos} to position {to_pos}")

        print("  " + " ".join([display_tile(t) for t in step_tiles]))
        print("  " + " ".join(step_tiles))
        print()

    # Display target arrangement
    sorted_tiles = sorted(tiles, key=lambda t: rank_map[t])
    print("[TARGET ARRANGEMENT (Final state)]")
    print("  " + " ".join([display_tile(t) for t in sorted_tiles]))
    print("  " + " ".join(sorted_tiles))
    print()
    print("=" * 70)
    print()

    # Detailed information (optional)
    print("[DETAILED INFORMATION]")
    print()

    # Display tiles in LIS
    print("Tiles that don't need to move (LIS):")
    print(f"  Positions: {lis_indices}")
    lis_tiles = [tiles[i] for i in lis_indices]
    print(f"  Tiles: {' '.join([display_tile(t) for t in lis_tiles])}")
    print(f"         {' '.join(lis_tiles)}")
    print()

    # Display tiles that need to move
    move_indices = [i for i in range(len(tiles)) if i not in lis_indices_set]
    print("Tiles that need to move:")
    print(f"  Positions: {move_indices}")
    move_tiles = [tiles[i] for i in move_indices]
    print(f"  Tiles: {' '.join([display_tile(t) for t in move_tiles])}")
    print(f"         {' '.join(move_tiles)}")
    print()

    # Display rank for each tile in optimal order
    print("Rank of each tile in optimal order:")
    for i, tile in enumerate(tiles):
        marker = " ○" if i in lis_indices_set else " ×"
        status = "Keep" if i in lis_indices_set else "Move"
        emoji = display_tile(tile)
        print(f"  Pos {i:2d}: {emoji} {tile:3s} → Rank {rank_map[tile]:2d} {marker} [{status}]")

    print()
    print("Rank array:", rank_array)
    print()
    print("=" * 70)


if __name__ == "__main__":
    main()
