// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SmartRegister {
    address public owner;
    uint256 private currentWorkId;

    struct Work {
        uint256 id;
        address owner;
        string title;
        string description;
        string fileHash;
        uint256 timestamp;
        bool isRegistered;
    }

    mapping(uint256 => Work) private works;
    mapping(string => bool) private hashExists;

    event WorkRegistered(
        uint256 indexed id,
        address indexed owner,
        string title,
        string fileHash,
        uint256 timestamp
    );

    constructor() {
        owner = msg.sender;
        currentWorkId = 0;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function registerWork(
        string memory title,
        string memory description,
        string memory fileHash
    ) public returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(fileHash).length > 0, "File hash cannot be empty");
        require(!hashExists[fileHash], "Work with this hash already exists");
        
        currentWorkId++;
        
        works[currentWorkId] = Work({
            id: currentWorkId,
            owner: msg.sender,
            title: title,
            description: description,
            fileHash: fileHash,
            timestamp: block.timestamp,
            isRegistered: true
        });
        
        hashExists[fileHash] = true;
        
        emit WorkRegistered(currentWorkId, msg.sender, title, fileHash, block.timestamp);
        
        return currentWorkId;
    }

    function getWork(uint256 workId) public view returns (
        uint256 id,
        address workOwner,
        string memory title,
        string memory description,
        string memory fileHash,
        uint256 timestamp,
        bool isRegistered
    ) {
        Work memory work = works[workId];
        require(work.isRegistered, "Work does not exist");
        
        return (
            work.id,
            work.owner,
            work.title,
            work.description,
            work.fileHash,
            work.timestamp,
            work.isRegistered
        );
    }

    function getWorksByOwner(address workOwner) public view returns (uint256[] memory) {
        uint256[] memory ownerWorks = new uint256[](currentWorkId);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= currentWorkId; i++) {
            if (works[i].owner == workOwner && works[i].isRegistered) {
                ownerWorks[count] = i;
                count++;
            }
        }
        
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = ownerWorks[i];
        }
        
        return result;
    }

    function getWorkByHash(string memory searchHash) public view returns (
        uint256 id,
        address workOwner,
        string memory title,
        string memory description,
        string memory fileHash,
        uint256 timestamp,
        bool isRegistered
    ) {
        require(hashExists[searchHash], "Work with this hash does not exist");

        uint256 workId = 0;
        for (uint256 i = 1; i <= currentWorkId; i++) {
            if (keccak256(bytes(works[i].fileHash)) == keccak256(bytes(searchHash))) {
                workId = i;
                break;
            }
        }
        
        Work memory work = works[workId];
        return (
            work.id,
            work.owner,
            work.title,
            work.description,
            work.fileHash,
            work.timestamp,
            work.isRegistered
        );
    }
}
