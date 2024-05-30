I want an app that allows someone to deposit WETH or USDC and puts their funds into an Aave lending pool. The contract owner can then determine when the person can withdraw their principal which should take it out of Aave and return to the depositor.

Depositor calls `deposit(address token, uint amt)` which returns the deposit ID. Depositor deposits one asset at a time for the deposit. depositors call `withdraw(uint depositID)` after the contract owner sets deposit as withdrawable. The deposits are identified as by deposit IDs.

Contract owner decides when the depositor can withdraw their deposit at the owner's discretion. Upon approval, depositor can take out all of the deposit. 

