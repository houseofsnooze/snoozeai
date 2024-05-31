const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('DepositContract', function () {
  let depositContract, owner, depositor, otherAccount, usdc, weth;

  beforeEach(async function () {
    const DepositContract = await ethers.getContractFactory('DepositContract');
    depositContract = await DepositContract.deploy();
    await depositContract.waitForDeployment();

    const Usdc = await ethers.getContractFactory('MockERC20');
    usdc = await Usdc.deploy("USD Coin", "usdc", ethers.parseUnits('10000', 6));
    await usdc.waitForDeployment();

    const Weth = await ethers.getContractFactory('MockERC20');
    weth = await Weth.deploy("Wrapped ETH", "weth", ethers.parseUnits('10000', 18));
    await weth.waitForDeployment();

    [owner, depositor, otherAccount] = await ethers.getSigners();

    await depositContract.connect(owner).approveToken(usdc.target);
    await depositContract.connect(owner).approveToken(weth.target);

    await usdc.transfer(depositor.address, ethers.parseUnits('1000', 6));
    await weth.transfer(depositor.address, ethers.parseUnits('1000', 18));
    
    await usdc.connect(depositor).approve(depositContract.target, ethers.parseUnits('1000', 6));
    await weth.connect(depositor).approve(depositContract.target, ethers.parseUnits('1000', 18));

  });

  describe('deposit', function () {
    it('should revert if a user tries to deposit an unapproved token', async function () {
      await expect(depositContract.connect(depositor).deposit(otherAccount.address, 100)).to.be.revertedWith('Token is not approved for deposit');
    });

    it('should revert if the deposit amount is zero', async function () {
      await expect(depositContract.connect(depositor).deposit(usdc.target, 0)).to.be.revertedWith('Deposit amount must be greater than zero');
    });
  });

  describe('approveWithdrawal', function () {
    it('should revert if a non-owner tries to approve a withdrawal', async function () {
      const depositAmount = ethers.parseUnits('200', 6); // 200 USDC
      await depositContract.connect(depositor).deposit(usdc.target, depositAmount);
      await expect(depositContract.connect(otherAccount).approveWithdrawal(0)).to.be.reverted;
    });
  });

  describe('withdraw', function () {
    it('should allow a depositor to withdraw their funds after approval', async function () {
      const depositAmount = ethers.parseUnits('200', 6); // 200 USDC
      await depositContract.connect(depositor).deposit(usdc.target, depositAmount);
      await depositContract.connect(owner).approveWithdrawal(0);
      const usdcBefore = await usdc.balanceOf(depositor.address)
      await depositContract.connect(depositor).withdraw(0);
      const usdcAfter = await usdc.balanceOf(depositor.address)
      expect(usdcAfter).to.equal(usdcBefore + depositAmount);
    });

    it('should revert if the withdrawal is not approved', async function () {
      const depositAmount = ethers.parseUnits('200', 6); // 200 USDC
      await depositContract.connect(depositor).deposit(usdc.target, depositAmount);
      await expect(depositContract.connect(depositor).withdraw(0)).to.be.revertedWith('Withdrawal has not been approved');
    });

    it('should revert if there are no funds to withdraw', async function () {
      await depositContract.connect(depositor).deposit(usdc.target, 1); // 1 USDC
      await depositContract.connect(owner).approveWithdrawal(0);
      await depositContract.connect(depositor).withdraw(0);
      await expect(depositContract.connect(depositor).withdraw(0)).to.be.revertedWith('No funds to withdraw');
    });
  });
});
