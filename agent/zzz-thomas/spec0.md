# User story

As a user, I want to deposit a specific token into the contract and have my balance tracked. As the contract owner, I want to be able to initiate withdrawals for users, ensuring they have enough balance before proceeding. Users should also be able to view their balances.

# Technical Specification

## State Variables

- `token`: The address of the token that the contract will accept.
- `balances`: A mapping from user addresses to their respective balances.

## Functions

### 1. deposit

**Goal**

Allow users to deposit a specified amount of the token into the contract.

**Solidity signature**

`function deposit(uint amt) external`

**State accesses**

- Updates the `balances` mapping to increase the user's balance by `amt`.

**External contract accesses**

- Transfers `amt` of the token from the user to the contract.

**User scenarios**

1. **Nominal case**: User deposits 100 tokens.
   - User's balance increases by 100 tokens.
   - Example: User calls `deposit(100)`.
2. **Edge case**: User deposits 0 tokens.
   - User's balance remains unchanged.
   - Example: User calls `deposit(0)`.

### 2. withdraw

**Goal**

Allow the contract owner to initiate a withdrawal for a user, transferring the specified amount of tokens to the user.

**Solidity signature**

`function withdraw(address user, uint amt) external`

**State accesses**

- Checks the `balances` mapping to ensure the user has enough balance.
- Updates the `balances` mapping to decrease the user's balance by `amt`.

**External contract accesses**

- Transfers `amt` of the token from the contract to the user.

**User scenarios**

1. **Nominal case**: Contract owner withdraws 50 tokens for a user with a balance of 100 tokens.
   - User's balance decreases by 50 tokens.
   - Example: Owner calls `withdraw(userAddress, 50)`.
2. **Edge case**: Contract owner attempts to withdraw 150 tokens for a user with a balance of 100 tokens.
   - Transaction reverts due to insufficient balance.
   - Example: Owner calls `withdraw(userAddress, 150)`.

### 3. viewBalance

**Goal**

Allow users to view their current balance.

**Solidity signature**

`function viewBalance(address user) external view returns (uint)`

**State accesses**

- Reads the `balances` mapping to return the user's balance.

**User scenarios**

1. **Nominal case**: User checks their balance.
   - Returns the user's current balance.
   - Example: User calls `viewBalance(userAddress)`.
2. **Edge case**: User with no balance checks their balance.
   - Returns 0.
   - Example: User calls `viewBalance(userAddress)`.

