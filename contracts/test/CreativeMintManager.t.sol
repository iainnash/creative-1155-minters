// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/CreativeMintManager.sol";

contract CreativeMintManagerTest is Test {
    CreativeMintManager public creativeMintManager;

    address admin = address(0x234);
    address factory = address(0x0);

    function setUp() public {
        creativeMintManager = new CreativeMintManager(admin, factory);
    }
}
