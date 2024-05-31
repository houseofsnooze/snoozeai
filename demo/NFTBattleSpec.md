# User Story

As a user, I want to create and participate in betting battles between two NFTs where I can bet on which NFT will win and potentially earn rewards based on the outcome of the battle.

# Technical Specification

## State Variables

1. `battles`: A mapping to store battle details including participants, bets, start time, and statuses.
2. `bets`: A nested mapping to store individual bets from users on a particular battle and NFT.
3. `battleCount`: A counter to keep track of the total number of battles created.

## Functions

### 1. createBattle

**Goal**
Create a new battle between two NFTs

**Solidity signature**
```solidity
function createBattle(address nft1, uint256 id1, address nft2, uint256 id2) external payable
```

**Parameters**
- `nft1`: Address of the first NFT contract
- `id1`: Token ID of the first NFT
- `nft2`: Address of the second NFT contract
- `id2`: Token ID of the second NFT

**State accesses**
- Read/Write: `battles`, `battleCount`

**Examples**
Creating a battle by paying 0.001 ETH

### 2. placeBet

**Goal**
Place a bet on one of the NFTs

**Solidity signature**
```solidity
function placeBet(uint256 battleId, address nft, uint256 nftId, uint256 amount) external payable
```

**Parameters**
- `battleId`: ID of the battle
- `nft`: Address of the NFT being bet on
- `nftId`: Token ID of the NFT being bet on
- `amount`: Amount of ETH being bet

**State accesses**
- Read/Write: `bets`

**Examples**
Placing a 0.01 ETH bet on NFT1 (token ID 123) in battle 1

### 3. settleBattle

**Goal**
Settle a battle and distribute rewards

**Solidity signature**
```solidity
function settleBattle(uint256 battleId, address winnerNft, uint256 winnerNftId) external
```

**Parameters**
- `battleId`: ID of the battle
- `winnerNft`: Address of the winning NFT
- `winnerNftId`: Token ID of the winning NFT

**State accesses**
- Read/Write: `battles`, `bets`

**Examples**
Settling battle 1 with NFT1 (token ID 123) as the winner

**Notes:**
- 20% of total bets on the losing NFT are awarded to the holder of the winning NFT.
- 80% of total bets on the losing NFT are distributed proportionally among the bettors on the winning NFT.
- If no bets were placed on the winning NFT, all bets are refunded.

### 4. refundBets

**Goal**
Refund all bets if no winner is determined

**Solidity signature**
```solidity
function refundBets(uint256 battleId) external
```

**Parameters**
- `battleId`: ID of the battle

**State accesses**
- Read/Write: `bets`

**Examples**
Refunding all bets in battle 1 when no one bet on the winner.

### 5. isActiveBattle

**Goal**
Check if a battle is active

**Solidity signature**
```solidity
function isActiveBattle(uint256 battleId) public view returns (bool)
```

**Parameters**
- `battleId`: ID of the battle

**State accesses**
- Read: `battles`

**Returns**
- `bool`: True if the battle is active, false otherwise

**Examples**
Checking if battle 1 is active

### 6. isBettingPeriodOpen

**Goal**
Check if the betting period is open for a battle

**Solidity signature**
```solidity
function isBettingPeriodOpen(uint256 battleId) public view returns (bool)
```

**Parameters**
- `battleId`: ID of the battle

**State accesses**
- Read: `battles`

**Returns**
- `bool`: True if the betting period is open, false otherwise

**Examples**
Checking if the betting period is open for battle 1

### 7. getBattleBets

**Goal**
Get the number and amount of bets for both NFTs in a battle

**Solidity signature**
```solidity
function getBattleBets(uint256 battleId) public view returns (uint256 betsOnNFT1, uint256 amountOnNFT1, uint256 betsOnNFT2, uint256 amountOnNFT2)
```

**Parameters**
- `battleId`: ID of the battle

**State accesses**
- Read: `bets`

**Returns**
- `betsOnNFT1`: Number of bets on the first NFT
- `amountOnNFT1`: Total amount of bets on the first NFT
- `betsOnNFT2`: Number of bets on the second NFT
- `amountOnNFT2`: Total amount of bets on the second NFT

**Examples**
Getting the number and amount of bets for battle 1

### 8. getBattleCount

**Goal**
Get the total number of battles created

**Solidity signature**
```solidity
function getBattleCount() public view returns (uint256)
```

**State accesses**
- Read: `battleCount`

**Returns**
- `uint256`: Total number of battles created

**Examples**
Retrieving the total number of battles created
