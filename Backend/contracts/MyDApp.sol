// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyDApp {
    event Transfer(address indexed from, address indexed to, uint256 value, string message);

    function sendCrypto(address payable _to, uint256 _amount, string memory _message) public payable {
        require(msg.value == _amount, "Amount mismatch");
        _to.transfer(_amount);
        emit Transfer(msg.sender, _to, _amount, _message);
    }
}
