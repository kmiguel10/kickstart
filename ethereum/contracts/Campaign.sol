pragma solidity ^0.4.17;

//Will contain all of the deoployed campaigns
contract Factory {
    address[] public deployedCampaigns;

    function createCampaign(uint256 minimum) public {
        address newCampaign = new Campaign(minimum, msg.sender); //create a new campaign contract - returns address of newly created campaign
        deployedCampaigns.push(newCampaign);
    }

    //return all campaigns that have been created
    function getDeployedCampaign() public view returns (address[]) {
        return deployedCampaigns;
    }
}

contract Campaign {
    //struct is a def therefore we cannot create an instance
    struct Request {
        string description;
        uint256 value;
        address recipient;
        bool complete;
        uint256 approvalCount;
        mapping(address => bool) approvals; //keeps track of who already approved this request
    }

    //declare variables - when declaring variable, type goes first
    Request[] public requests;
    address public manager; //will be set in the constructor
    uint256 public minimumContribution;
    mapping(address => bool) public approvers;
    uint256 public approversCount;

    //Modifier- retrisct access to only the manager
    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    //Constructor
    function Campaign(uint256 minimum, address creator) public {
        manager = creator; //msg is a global variable - no need to define, sender is the one attempting to make the contract
        minimumContribution = minimum;
    }

    //Will be called when someone wants to send money to our contract
    //Payable allows contract to receive money
    function contribute() public payable {
        //check if sender is sending min eth (in wei)
        require(msg.value > minimumContribution);

        approvers[msg.sender] = true; //add contributor to approvers - mapping , address(key) does not get stored in mapping -- only the value (boolean)
        approversCount++; //keep tract of how many people has joined in our contract
    }

    //Add Request to request[]
    function createRequest(
        string description,
        uint256 value,
        address recipient
    ) public restricted {
        //Initialize Request based on args
        Request memory newRequest = Request({
            description: description,
            value: value,
            recipient: recipient,
            complete: false,
            approvalCount: 0
        });

        //add new Request to Request[]
        requests.push(newRequest);
    }

    //pass index of the request we are trying to approve
    function approveRequest(uint256 index) public {
        Request storage request = requests[index];

        //checks
        require(approvers[msg.sender]); //the person must have already donated
        require(!request.approvals[msg.sender]); //the person must NOT have already approved on this request

        request.approvals[msg.sender] = true;
        request.approvalCount++;
    }

    //Only manager can call
    //specific the index of the request the manager is trying to finalize
    //make sure that the request is not yet complete
    function finalizeRequest(uint256 index) public restricted {
        Request storage request = requests[index]; //'storage' because this specific copy of the request already exists in the storage

        require(request.approvalCount > (approversCount / 2)); //evaluate if majority of voters approved
        require(!request.complete); //is it complete? then flip to false so require fails
        request.recipient.transfer(request.value); //since recipient is an address type, we can call transfer()
        request.complete = true; //mark as complete
    }

    //Gets details about a certain campaign
    function getSummary()
        public
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256,
            address
        )
    {
        return (
            minimumContribution,
            this.balance,
            requests.length,
            approversCount,
            manager
        );
    }

    //Gets request count
    function getRequestCount() public view returns (uint256) {
        return requests.length;
    }
}
