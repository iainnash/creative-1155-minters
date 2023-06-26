// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/CreativeMintManager.sol";

contract CreativeMintManagerTest is Test {
    CreativeMintManager public creativeMintManager;

    address admin = address(0x9444390c01Dd5b7249E53FAc31290F7dFF53450D);
    address factory = address(0x6a357139C1bcDcf0B3AB9bC447932dDdcb956703);

    function setUp() public {
        creativeMintManager = new CreativeMintManager(admin, factory);
        creativeMintManager.registerProject(
            "p5js",
            "data:application/json;charset=utf-8;base64,eyJ0aXRsZSI6ICJQNUpTIiwgImRlc2NyaXB0aW9uIjogIlRoZXNlIGFyZSBQNUpTIHNrZXRjaGVzIn0="
        );
    }
}
