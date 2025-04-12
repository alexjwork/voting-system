// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    // Candidate structure
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    // Voter structure
    struct Voter {
        bool authorized;
        bool voted;
        uint vote;
    }

    address public owner;
    string public electionName;
    
    mapping(address => Voter) public voters;
    Candidate[] public candidates;
    uint public totalVotes;

    // Modifier to check if caller is owner
    modifier ownerOnly() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    // Constructor
    constructor(string memory _name) {
        owner = msg.sender;
        electionName = _name;
    }

    // Add a candidate
    function addCandidate(string memory _name) public ownerOnly {
        candidates.push(Candidate({
            id: candidates.length,
            name: _name,
            voteCount: 0
        }));
    }

    // Authorize a voter
    function authorizeVoter(address _voter) public ownerOnly {
        voters[_voter].authorized = true;
    }

    // Vote for a candidate
    function vote(uint _candidateId) public {
        require(voters[msg.sender].authorized, "You are not authorized to vote");
        require(!voters[msg.sender].voted, "You have already voted");
        require(_candidateId < candidates.length, "Invalid candidate ID");

        voters[msg.sender].voted = true;
        voters[msg.sender].vote = _candidateId;
        candidates[_candidateId].voteCount++;
        totalVotes++;
    }

    // Get candidate count
    function getCandidateCount() public view returns (uint) {
        return candidates.length;
    }

    // Get election results
    function getResults() public view returns (Candidate[] memory) {
        return candidates;
    }
}
