// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {Test} from "forge-std/Test.sol";
contract HistoryEpochTest is Test {
    function test_epoch_0001() public { uint256 x = 1; assertEq(x, 1); }
}
