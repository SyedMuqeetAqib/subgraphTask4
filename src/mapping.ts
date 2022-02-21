import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  DaoStakeContract,
  BaseInterestUpdated,
  OwnershipTransferred,
  Paused,
  StakeCompleted,
  Unpaused,
  Unstake,
} from "../generated/DaoStakeContract/DaoStakeContract";
import { Transaction, User, StakeDetail } from "../generated/schema";

export function handleBaseInterestUpdated(event: BaseInterestUpdated): void {
  let transaction = new Transaction(event.transaction.hash.toHex());
  transaction.from = event.address;
  transaction.method = "HandleBaseInterestUpdate";
  transaction.time = event.block.timestamp;
  transaction.blockNumber = event.block.number;
  transaction.save();

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.getTotalrewardTokens(...)
  // - contract.maxStakedQuantity(...)
  // - contract.owner(...)
  // - contract.paused(...)
  // - contract.phnxContractAddress(...)
  // - contract.ratio(...)
  // - contract.stakeALT(...)
  // - contract.stakeDays(...)
  // - contract.stakerBalance(...)
  // - contract.stakerData(...)
  // - contract.totalStakedTokens(...)
  // - contract.unstakeALT(...)
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  let transaction = new Transaction(event.transaction.hash.toHex());
  transaction.from = event.params.newOwner;
  transaction.method = "OwnershipTransferred";
  transaction.time = event.block.timestamp;
  transaction.blockNumber = event.block.number;
  transaction.save();
}

export function handlePaused(event: Paused): void {
  let transaction = new Transaction(event.transaction.hash.toHex());
  transaction.from = event.params.account;
  transaction.method = "Pause";
  transaction.time = event.block.timestamp;
  transaction.blockNumber = event.block.number;
  transaction.save();
}

export function handleStakeCompleted(event: StakeCompleted): void {
  let transaction = new Transaction(event.transaction.hash.toHex());
  transaction.from = event.params.staker;
  transaction.method = "StakeComplete";
  transaction.amount = event.params.rewardAmount;
  transaction.time = event.block.timestamp;
  transaction.blockNumber = event.block.number;
  transaction.save();

  let id = event.params.staker.toHexString();
  let user = User.load(id);
  if (!user) {
    user = new User(id);
    user.address = event.params.staker;
    user.stakedAmount = event.params.rewardAmount;
    user.save();
  } else {
    user.stakedAmount = user.stakedAmount.plus(event.params.rewardAmount);
    user.save();
  }
  let stakeDetails = StakeDetail.load(
    Address.fromString(
      "0xFa70F492D9f4fc28C8D6b9e65eac0B0AA363AF7F"
    ).toHexString()
  );
  if (!stakeDetails) {
    stakeDetails = new StakeDetail(
      Address.fromString(
        "0xFa70F492D9f4fc28C8D6b9e65eac0B0AA363AF7F"
      ).toHexString()
    );
    stakeDetails.totalStakedAmount = event.params.altQuantity;
    stakeDetails.totalRewardAmount = event.params.rewardAmount;
    stakeDetails.save();
  } else {
    stakeDetails.totalStakedAmount = stakeDetails.totalStakedAmount.plus(
      event.params.altQuantity
    );
    stakeDetails.totalRewardAmount = stakeDetails.totalRewardAmount.plus(event.params.rewardAmount);
    stakeDetails.save();
  }
}

export function handleUnpaused(event: Unpaused): void {
  let transaction = new Transaction(event.transaction.hash.toHex());
  transaction.from = event.params.account;
  transaction.method = "UnPause";
  transaction.time = event.block.timestamp;
  transaction.blockNumber = event.block.number;
  transaction.save();
}

export function handleUnstake(event: Unstake): void {
  let transaction = new Transaction(event.transaction.hash.toHex());
  transaction.from = event.params.staker;
  transaction.method = "UnStake";
  transaction.amount = event.params.altQuantity;
  transaction.time = event.block.timestamp;
  transaction.blockNumber = event.block.number;
  transaction.save();

  let id = event.params.staker.toHexString();
  let user = User.load(id);

  if (user) {
    user.stakedAmount = event.params.altQuantity;
    user.save();
  }

  let stakeDetails = StakeDetail.load(
    Address.fromString(
      "0xFa70F492D9f4fc28C8D6b9e65eac0B0AA363AF7F"
    ).toHexString()
  );
  if (stakeDetails) {
    // stakeDetails = new StakeDetail(
    //   Address.fromString(
    //     "0xFa70F492D9f4fc28C8D6b9e65eac0B0AA363AF7F"
    //   ).toHexString()
    // );
    // stakeDetails.totalStakedAmount = event.params.altQuantity;
    // stakeDetails.totalRewardAmount = BigInt.fromI64(0);
    // stakeDetails.save();
    stakeDetails.totalStakedAmount = stakeDetails.totalStakedAmount.minus(event.params.altQuantity);
    stakeDetails.totalRewardAmount = stakeDetails.totalRewardAmount;
    stakeDetails.save();
  }
}
