import { expect } from "./chai";
import {
  ethers,
  deployments,
  getNamedAccounts,
  getUnnamedAccounts,
} from "hardhat";
// eslint-disable-next-line node/no-missing-import
import { VWorld } from "../../typechain";

describe("VWorld", function () {
  let vworldContract: VWorld;
  let accounts: any[];
  let owner: any;

  this.beforeEach(async function () {
    const nonDeployers = await getUnnamedAccounts();
    accounts = nonDeployers;
    const { deployer } = await getNamedAccounts();
    owner = deployer;
    await deployments.fixture(["VWorld"]);
    vworldContract = await ethers.getContract("VWorld");
  });

  it("Should be able to purchase more than one land", async function () {
    await vworldContract.purchaseLand([1, 2]);
    await vworldContract.purchaseLand([3, 4]);
    const userLand = await vworldContract.getUserLands(owner);
    expect(userLand.length).to.eq(2);
  });
  it("should not purchase a land that does not exist", async function () {
    const tx = await vworldContract.purchaseLand([18, 82]);
    expect(tx.wait()).to.be.reverted;
  });
  it("Should not allow repurchase of owned land", async function () {
    await vworldContract.purchaseLand([1, 2]);
    async function rePurchase() {
      await vworldContract.purchaseLand([1, 2]);
    }
    expect(rePurchase()).to.be.revertedWith("unavailable");
  });
  it("Should increment noOfPurchased land after purchase", async function () {
    await vworldContract.purchaseLand([1, 2]);
    const noOfPurchased = await vworldContract.noOfLandsSold();
    expect(noOfPurchased.toString()).to.eq("1");
  });
  it("Should return the lands owned by a user", async function () {
    await vworldContract.purchaseLand([1, 2]);
    const userLand = await vworldContract.getUserLands(owner);
    expect(userLand.toString()).to.eq("1,2");
  });
  it("Should not allow transfer of land not owned", async function () {
    await vworldContract.purchaseLand([3, 4]);
    await vworldContract.transferLandOwnership(accounts[1], [1, 2]);
    const userLand = await vworldContract.getUserLands(accounts[1]);
    expect(userLand.length).to.eq(0);
  });
  it("Should not allow transfer of land that does not exist", async function () {
    await vworldContract.transferLandOwnership(accounts[3], [10, 28]);
    const userLand = await vworldContract.getUserLands(accounts[3]);
    expect(userLand.length).to.eq(0);
  });
  it("Should not allow transfer of land not purchased", async function () {
    await vworldContract.transferLandOwnership(accounts[2], [1, 2]);
    const userLand = await vworldContract.getUserLands(accounts[2]);
    expect(userLand.length).to.eq(0);
  });
  it("Should return the total no lands", async function () {
    const landTotal = await vworldContract.getAllLands();
    expect(landTotal.length).to.eq(3);
  });
  it("Should not allow external person to withdraw money from contract", async function () {
    async function withdraw() {
      const tx = await vworldContract.withdraw();
      await tx.wait();
    }
    expect(withdraw()).to.not.be.revertedWith("failed to widthraw funds");
  });
});
