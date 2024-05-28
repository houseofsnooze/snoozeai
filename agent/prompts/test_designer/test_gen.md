You are an expert Solidity tester, and I need your help to write comprehensive and creative tests for a smart contract based on the following specification. Please ensure the tests cover various scenarios, including edge cases, normal cases, and failure cases. Use a combination of unit tests and integration tests where applicable. 

Below is an example for you to reference when writing tests after the client gave you a specification.

# Input: example specification

- **Smart Contract Name:** MyToken
- **Purpose:** An ERC-20 token with additional features like minting and burning.
- **Key Functions:**
  - `totalSupply()`: Returns the total supply of tokens.
  - `balanceOf(address account)`: Returns the balance of the specified account.
  - `transfer(address recipient, uint256 amount)`: Transfers tokens from the caller to the recipient.
  - `approve(address spender, uint256 amount)`: Approves the spender to spend the specified amount on behalf of the caller.
  - `transferFrom(address sender, address recipient, uint256 amount)`: Transfers tokens from the sender to the recipient using the allowance mechanism.
  - `mint(address account, uint256 amount)`: Mints new tokens to the specified account. Only the owner can call this function.
  - `burn(uint256 amount)`: Burns the specified amount of tokens from the caller's account.

# Output

## Output: example test scenarios

1. **Initialization Tests:**
   - Verify that the contract initializes with the correct total supply and owner address.

2. **Functionality Tests:**
   - Test `totalSupply` to ensure it returns the correct supply after minting and burning.
   - Test `balanceOf` to check correct balances for various accounts.
   - Test `transfer` to verify successful transfers and edge cases like transferring to oneself or to a zero address.
   - Test `approve` and `transferFrom` to check proper handling of allowances.
   - Test `mint` to ensure only the owner can mint tokens and the total supply updates correctly.
   - Test `burn` to verify token burning functionality and its impact on the total supply and caller’s balance.

3. **Edge Case Tests:**
   - Attempt to transfer more tokens than available in the balance.
   - Test the effect of transferring, minting, and burning zero tokens.
   - Check for proper handling of maximum token values.

4. **Security Tests:**
   - Ensure no unauthorized accounts can call `mint` or `burn`.
   - Verify that `approve` and `transferFrom` respect allowance limits.

5. **Event Tests:**
   - Ensure events are emitted correctly for `Transfer`, `Approval`, `Mint`, and `Burn`.

## Output: example output Format

Please provide the tests in Solidity using a framework like Hardhat v6. The tests should be well-organized, commented, and include assertions to check for expected outcomes. Here’s a small template to get you started:

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyToken", function () {
  let MyToken;
  let myToken;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    MyToken = await ethers.getContractFactory("MyToken");
    [owner, addr1, addr2, _] = await ethers.getSigners();
    myToken = await MyToken.deploy();
    await myToken.deployed();
  });

  it("Should initialize with correct total supply", async function () {
    const totalSupply = await myToken.totalSupply();
    expect(totalSupply).to.equal(1000000);
  });

  // More tests here...

});
```

# Output: example Completion

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyToken", function () {
  let MyToken;
  let myToken;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    MyToken = await ethers.getContractFactory("MyToken");
    [owner, addr1, addr2, _] = await ethers.getSigners();
    myToken = await MyToken.deploy();
    await myToken.deployed();
  });

  it("Should initialize with correct total supply", async function () {
    const totalSupply = await myToken.totalSupply();
    expect(totalSupply).to.equal(1000000);
  });

  it("Should return correct balance of owner", async function () {
    const balance = await myToken.balanceOf(owner.address);
    expect(balance).to.equal(1000000);
  });

  it("Should transfer tokens correctly", async function () {
    await myToken.transfer(addr1.address, 100);
    const recipientBalance = await myToken.balanceOf(addr1.address);
    expect(recipientBalance).to.equal(100);
  });

  it("Should not allow transfer of more tokens than balance", async function () {
    await expect(
      myToken.transfer(addr1.address, 2000000)
    ).to.be.revertedWith("revert");
  });

  it("Should mint tokens correctly", async function () {
    await myToken.mint(owner.address, 1000);
    const totalSupply = await myToken.totalSupply();
    expect(totalSupply).to.equal(1001000);
  });

  it("Should burn tokens correctly", async function () {
    await myToken.burn(1000);
    const totalSupply = await myToken.totalSupply();
    expect(totalSupply).to.equal(999000);
  });

  it("Should approve tokens for delegated transfer", async function () {
    await myToken.approve(addr1.address, 100);
    const allowance = await myToken.allowance(owner.address, addr1.address);
    expect(allowance).to.equal(100);
  });

  it("Should handle delegated token transfers correctly", async function () {
    await myToken.approve(addr1.address, 100);
    await myToken.transferFrom(owner.address, addr2.address, 100, { from: addr1.address });
    const recipientBalance = await myToken.balanceOf(addr2.address);
    expect(recipientBalance).to.equal(100);
  });

  // Additional tests for events and edge cases...
});
```