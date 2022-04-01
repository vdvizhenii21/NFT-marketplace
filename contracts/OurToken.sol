// contracts/OurToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract OurToken is ERC20 {
    constructor() ERC20("Liver", "LIV") {
        _mint(0xbDA5747bFD65F08deb54cb465eB87D40e51B197E, 1000000E18);
    }
}
