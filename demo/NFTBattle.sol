// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTBattle is Ownable {
    struct Battle {
        address nft1;
        uint256 id1;
        address nft2;
        uint256 id2;
        uint256 startTime;
        bool isSettled;
        bool isRefund;
    }

    struct Bet {
        address bettor;
        address nft;
        uint256 nftId;
        uint256 amount;
    }

    uint256 public battleCount;
    mapping(uint256 => Battle) public battles;
    mapping(uint256 => Bet[]) public bets;
    
    event BattleCreated(uint256 indexed battleId, address indexed nft1, uint256 indexed id1, address nft2, uint256 id2);
    event BetPlaced(uint256 indexed battleId, address indexed bettor, address indexed nft, uint256 nftId, uint256 amount);
    event BattleSettled(uint256 indexed battleId, address indexed winnerNft, uint256 winnerNftId);
    event BetsRefunded(uint256 indexed battleId);

    // Initializer
    constructor() Ownable(msg.sender) {}

    function createBattle(address nft1, uint256 id1, address nft2, uint256 id2) external payable {
        require(msg.value == 0.001 ether, "Battle creation fee is 0.001 ETH");
        require(nft1 != nft2 || id1 != id2, "Cannot battle the same NFT with the same ID");

        battleCount++;
        battles[battleCount] = Battle({
            nft1: nft1,
            id1: id1,
            nft2: nft2,
            id2: id2,
            startTime: block.timestamp,
            isSettled: false,
            isRefund: false
        });

        emit BattleCreated(battleCount, nft1, id1, nft2, id2);
    }

    function placeBet(uint256 battleId, address nft, uint256 nftId, uint256 amount) external payable {
        require(battles[battleId].startTime > 0, "Battle does not exist");
        require(isBettingPeriodOpen(battleId), "Betting period is closed");
        require(amount > 0, "Bet amount must be non-zero");
        require(!battles[battleId].isSettled, "Battle has been settled");
        require(msg.value == amount, "Incorrect ETH sent with bet");

        bets[battleId].push(Bet({
            bettor: msg.sender,
            nft: nft,
            nftId: nftId,
            amount: amount
        }));

        emit BetPlaced(battleId, msg.sender, nft, nftId, amount);
    }

    function settleBattle(uint256 battleId, address winnerNft, uint256 winnerNftId) external onlyOwner {
        Battle storage battle = battles[battleId];
        require(battle.startTime > 0, "Battle does not exist");
        require(!battle.isSettled, "Battle already settled");

        (uint256 totalBetsOnWinner, uint256 totalAmountOnWinner, uint256 totalBetsOnLoser, uint256 totalAmountOnLoser) = findBetSums(battleId, winnerNft, winnerNftId);

        // Determine reward distribution
        if (totalBetsOnWinner == 0) {
            // No bets on the winner, refund all bets
            refundBets(battleId);
        } else {
            uint256 totalReward = totalAmountOnLoser;
            uint256 winnerReward = (totalReward * 20) / 100; // 20% to the winning NFT holder
            uint256 bettorRewardPool = totalReward - winnerReward; // 80% to be distributed among winning bettors

            // Transfer 20% to the owner of the winning NFT
            payable(owner()).transfer(winnerReward);

            // Distribute the remaining 80% proportionally among bettors who bet on the winner
            for (uint256 i = 0; i < bets[battleId].length; i++) {
                Bet storage bet = bets[battleId][i];
                if (bet.nft == winnerNft && bet.nftId == winnerNftId) {
                    uint256 bettorShare = (bet.amount * bettorRewardPool) / totalAmountOnWinner;
                    payable(bet.bettor).transfer(bettorShare);
                }
            }

            battle.isSettled = true;
            emit BattleSettled(battleId, winnerNft, winnerNftId);
        }
    }

    function refundBets(uint256 battleId) public onlyOwner {
        Battle storage battle = battles[battleId];
        require(battle.startTime > 0, "Battle does not exist");
        require(!battle.isSettled, "Cannot refund bets after settlement");

        for (uint256 i = 0; i < bets[battleId].length; i++) {
            payable(bets[battleId][i].bettor).transfer(bets[battleId][i].amount);
        }

        battle.isRefund = true;
        emit BetsRefunded(battleId);
    }

    function isActiveBattle(uint256 battleId) public view returns (bool) {
        return battles[battleId].startTime > 0 && !battles[battleId].isSettled && !battles[battleId].isRefund;
    }

    function isBettingPeriodOpen(uint256 battleId) public view returns (bool) {
        return isActiveBattle(battleId) && block.timestamp <= battles[battleId].startTime + 1 hours;
    }

    function getBattleBets(uint256 battleId) public view returns (uint256 betsOnNFT1, uint256 amountOnNFT1, uint256 betsOnNFT2, uint256 amountOnNFT2) {
        Bet[] memory battleBets = bets[battleId];
        for (uint256 i = 0; i < battleBets.length; i++) {
            if (battleBets[i].nft == battles[battleId].nft1 && battleBets[i].nftId == battles[battleId].id1) {
                betsOnNFT1++;
                amountOnNFT1 += battleBets[i].amount;
            } else if (battleBets[i].nft == battles[battleId].nft2 && battleBets[i].nftId == battles[battleId].id2) {
                betsOnNFT2++;
                amountOnNFT2 += battleBets[i].amount;
            }
        }
    }

    function getBattleCount() public view returns (uint256) {
        return battleCount;
    }

    function findBetSums(uint256 battleId, address nft, uint256 nftId) internal view returns (uint256 totalBetsWinner, uint256 totalAmountWinner, uint256 totalBetsLoser, uint256 totalAmountLoser) {
        Bet[] memory battleBets = bets[battleId];
        for (uint256 i = 0; i < battleBets.length; i++) {
            if (battleBets[i].nft == nft && battleBets[i].nftId == nftId) {
                totalBetsWinner++;
                totalAmountWinner += battleBets[i].amount;
            } else {
                totalBetsLoser++;
                totalAmountLoser += battleBets[i].amount;
            }
        }
    }
}
