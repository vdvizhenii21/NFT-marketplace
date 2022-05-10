// contracts/OurToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract OurToken is ERC20 {
    constructor() ERC20("Liver", "LIV") {
        _mint(0x84FC865C43825c40f1558CDF58AB0f9707f0040c, 10000E18);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
