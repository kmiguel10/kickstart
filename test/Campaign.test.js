const assert = require('assert');
const ganache = require('ganache-cli'); //provider
const Web3 = require('web3'); //constructor
const web3 = new Web3(ganache.provider()); //instance of web3 with provider

const compiledFactory = require('../ethereum/build/Factory.json'); //pull entire file
const compiledCampaign = require('../ethereum/build/Campaign.json'); //pull entire file

//reusable variables
let accounts; 
let factory; //reference to the deployed instance 
let campaignAddress;
let campaign;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
        .deploy({ data: compiledFactory.bytecode })
        .send({ from: accounts[0], gas: '1000000'})

    //create instance of a campaign using factory with min cotribution of 100 wei
    await factory.methods.createCampaign('100').send({
        from: accounts[0],
        gas: '1000000'
    })

    const deployedCampaigns = await factory.methods.getDeployedCampaign().call();
    campaignAddress = deployedCampaigns[0]; //holds the address of where the campaign is deployed 

    //access the deployed campaign to create an object we can interact with in js
    campaign = await new web3.eth.Contract(
        JSON.parse(compiledCampaign.interface), campaignAddress
    );

});
 
describe('Campaigns', () => {
    it('deploys a factory and a campaign', () => {
        assert.ok(factory.options.address);
        assert.ok(campaign.options.address);
    });

    it('marks caller as campaign manager', async () => {
        const manager = await campaign.methods.manager().call();
        assert.equal(accounts[0], manager);
    });

    it('allows people to contribute oney and marks them ass approvers', async () => {
        await campaign.methods.contribute().send({
            value: '200',
            from: accounts[1]
        });
        const isContributer = await campaign.methods.approvers(accounts[1]).call();

        assert(isContributer);
    });

    it('required a minimum contribution', async () => {
        try {
            await campaign.methods.contribute().send({
                value: '5',
                from: accounts[1]
            });
            assert(false);
        } catch (err) {
            assert(err);
         }
    });

    it('it allows a manager to make a payment request', async () => {
        await campaign.methods
            .createRequest('Buy batteries', '100', accounts[1])
            .send({
                from: accounts[0], 
                gas: '1000000'
            })
        
        const createdRequest = await campaign.methods.requests(0).call();

        assert.equal('Buy batteries', createdRequest.description)
    })

    //end to end test
    //at the end the a certain party must have received payment
    it('it processes requests', async () => {
        //Step 1: contribute money to the campaign
        await campaign.methods.contribute().send({
            from: accounts[0],
            value: web3.utils.toWei('10', 'ether')
        });

        //Step 2: create request
        await campaign.methods.createRequest(
            'A',
            web3.utils.toWei('5', 'ether'),
            accounts[1]
        ).send({
            from: accounts[0], gas: '1000000'
        });

        //step 3: Vote on requests
        await campaign.methods.approveRequest(0).send({
            from: accounts[0], gas: '1000000'
        });

        //step 4: finalize
        await campaign.methods.finalizeRequest(0).send({
            from: accounts[0], gas: '1000000'
        });

        //Step 5: Retrieve balance of receipient accounts
        let balance = await web3.eth.getBalance(accounts[1]);
        balance = web3.utils.fromWei(balance, 'ether');
        balance = parseFloat(balance); //takes a string and turns into a decimal number
        console.log(balance);
        assert(balance > 104);
    });
});