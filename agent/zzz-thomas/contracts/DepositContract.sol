// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract DepositContract is Ownable {
    using SafeERC20 for IERC20;

    // Address of the token that the contract will accept
    IERC20 public token;

    // Mapping from user addresses to their respective balances
    mapping(address => uint256) private balances;

    // Event emitted when a deposit is made
    event Deposit(address indexed user, uint256 amount);

    // Event emitted when a withdrawal is made
    event Withdrawal(address indexed user, uint256 amount);

    // Constructor to set the token address and the contract owner
    constructor(IERC20 _token) Ownable(msg.sender) {
        token = _token;
    }

    // Function to allow users to deposit a specified amount of the token into the contract
    function deposit(uint256 amt) external {
        // Transfer the specified amount of tokens from the user to the contract
        token.safeTransferFrom(msg.sender, address(this), amt);

        // Update the user's balance
        balances[msg.sender] += amt;

        // Emit the deposit event
        emit Deposit(msg.sender, amt);
    }

    // Function to allow the contract owner to initiate a withdrawal for a user
    function withdraw(address user, uint256 amt) external onlyOwner {
        require(user != address(0), "Invalid user address");
        require(balances[user] >= amt, "Insufficient balance");

        // Update the user's balance
        balances[user] -= amt;

        // Transfer the specified amount of tokens from the contract to the user
        token.safeTransfer(user, amt);

        // Emit the withdrawal event
        emit Withdrawal(user, amt);
    }

    // Function to allow users to view their current balance
    function viewBalance(address user) public view returns (uint256) {
        return balances[user];
    }
}
