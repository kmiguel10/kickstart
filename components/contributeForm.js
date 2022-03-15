import React, { Component } from "react";
import { Button, Form, Input, Message } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import Campaign from "../ethereum/campaign";
import web3 from "../ethereum/web3";
import { Router } from "../routes";

class ContributeForm extends Component {
  state = {
    value: "",
    errorMessage: "",
    loading: false,
  };

  onSubmit = async (event) => {
    event.preventDefault(); //keep the browser from attempting to submit the form
    const campaign = Campaign(this.props.address); //points to the current address

    this.setState({ loading: true, errorMessage: "" });

    try {
      const accounts = await web3.eth.getAccounts();
      await campaign.methods.contribute().send({
        from: accounts[0],
        value: web3.utils.toWei(this.state.value, "ether"),
      });
      //Refresh the page after contributing to reflect latest data
      Router.replaceRoute(`/campaigns/${this.props.address}`);
    } catch (err) {
      //handles error in sending min contribution
      this.setState({ errorMessage: err.message });
    }
    this.setState({ loading: false, value: "" });
  };
  render() {
    return (
      <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
        <Form.Field>
          <label>Amount to Contribute</label>
          <Input
            value={this.state.value}
            onChange={(event) => this.setState({ value: event.target.value })}
            label="ether"
            labelPosition="right"
          />
        </Form.Field>
        <Message
          error
          header="Oops!"
          content={this.state.errorMessage}
        ></Message>
        <Button loading={this.state.loading} primary>
          Contribute!
        </Button>
      </Form>
    );
  }
}

export default ContributeForm;
