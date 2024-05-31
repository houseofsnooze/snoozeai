// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DepositContract is Ownable {
    using SafeERC20 for IERC20;

    struct Deposit {
        uint amount;
        address token;
        bool approved;
        address depositor;
    }

    mapping(uint => Deposit) public deposits;
    uint private _nextDepositId;
    mapping(address => bool) public approvedTokens;

    event DepositMade(address indexed depositor, uint depositId, uint amount, address token);
    event WithdrawalApproved(uint depositId, uint amount, address token);
    event TokenApproved(address token);
    event TokenRevoked(address token);

    constructor() Ownable(msg.sender) {}

    function approveToken(address token) public onlyOwner {
        approvedTokens[token] = true;
        emit TokenApproved(token);
    }
    function revokeToken(address token) public onlyOwner {
        approvedTokens[token] = false;
        emit TokenRevoked(token);
    }

    function deposit(address token, uint amount) public returns (uint depositId) {
        require(approvedTokens[token], "Token is not approved for deposit");
        require(amount > 0, "Deposit amount must be greater than zero");
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        deposits[_nextDepositId++] = Deposit(amount, token, false, msg.sender);
        emit DepositMade(msg.sender, depositId, amount, token);
        return depositId;
    }

    function approveWithdrawal(uint depositId) public onlyOwner {
        require(deposits[depositId].amount > 0, "No deposit found with this ID");
        deposits[depositId].approved = true;
        emit WithdrawalApproved(depositId, deposits[depositId].amount, deposits[depositId].token);
    }

    function withdraw(uint depositId) public {
        Deposit storage deposit = deposits[depositId];
        require(deposit.approved, "Withdrawal has not been approved");
        require(deposit.amount > 0, "No funds to withdraw");
        require(deposit.depositor == msg.sender, "Caller is not depositor");
        IERC20(deposit.token).safeTransfer(msg.sender, deposit.amount);
        deposit.amount = 0; // Mark as withdrawn
    }
}
