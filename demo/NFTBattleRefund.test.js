const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTBattle - Bets Refund", function () {
  let NFTBattle;
  let nftBattle;
  let owner, addr1, addr2, bettor1;
  const battleCreationFee = ethers.parseEther("0.001");

  before(async () => {
    [owner, addr1, addr2, bettor1] = await ethers.getSigners();
    NFTBattle = await ethers.getContractFactory("NFTBattle");
    nftBattle = await NFTBattle.deploy();
    await nftBattle.waitForDeployment();

    await nftBattle.createBattle(addr1.address, 1, addr2.address, 2, { value: battleCreationFee });
    const betAmount1 = ethers.parseEther("1");
    await nftBattle.connect(bettor1).placeBet(1, addr1.address, 1, betAmount1, { value: betAmount1 });
  });

  it("should refund all bets for a valid battle", async function () {
    const initialBettor1Balance = await ethers.provider.getBalance(bettor1.address);

    const tx = await nftBattle.refundBets(1);
    await expect(tx).to.emit(nftBattle, "BetsRefunded").withArgs(1);

    const finalBettor1Balance = await ethers.provider.getBalance(bettor1.address);
    const refund = finalBettor1Balance - initialBettor1Balance;
    expect(ethers.formatEther(refund)).to.equal("1.0");
  });

  it("should revert if trying to refund bets for a settled battle", async function () {
    await nftBattle.settleBattle(1, addr1.address, 1);
    await expect(
      nftBattle.refundBets(1)
    ).to.be.revertedWith("Cannot refund bets after settlement");
  });

  it("should revert if trying to refund bets for a non-existing battle", async function () {
    await expect(
      nftBattle.refundBets(999)
    ).to.be.revertedWith("Battle does not exist");
  });
});