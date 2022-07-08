import { expect } from "./chai";
import { ethers, deployments, getNamedAccounts } from "hardhat";
// eslint-disable-next-line node/no-missing-import
import { VWorld } from "../../typechain";

describe("VWorld", function () {
  let vworldContract: VWorld;
  let accounts: any[];
  let owner: any;

  this.beforeEach(async function () {
    accounts = await ethers.getSigners();
    await deployments.fixture(["VWorld"]);
    const { deployer } = await getNamedAccounts();
    owner = deployer;
    vworldContract = await ethers.getContract("VWorld");
  });

  it("Should be able to purchase more than one land", async function () {
    await vworldContract.purchaseLand([1, 2]);
    await vworldContract.purchaseLand([3, 4]);
    const userLand = await vworldContract.getUserLands(accounts[0].address);
    expect(userLand.length).to.eq(2);
  });
  it("should not purchase a land that does not exist", async function () {
    async function inexistentPurchase() {
      await vworldContract.purchaseLand([18, 82]);
    }
    expect(inexistentPurchase).to.be.reverted("invalid argument");
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
    const userLand = await vworldContract.getUserLands(accounts[0].address);
    expect(userLand.toString()).to.eq("1,2");
  });
  it("Should not allow transfer of land not owned", async function () {
    await vworldContract.purchaseLand([3, 4]);
    await vworldContract.transferLandOwnership(accounts[1].address, [1, 2]);
    const userLand = await vworldContract.getUserLands(accounts[1].address);
    expect(userLand.length).to.eq(0);
  });
  it("Should not allow transfer of land that does not exist", async function () {
    await vworldContract.transferLandOwnership(accounts[3].address, [10, 28]);
    const userLand = await vworldContract.getUserLands(accounts[3].address);
    expect(userLand.length).to.eq(0);
  });
  it("Should not allow transfer of land not purchased", async function () {
    await vworldContract.transferLandOwnership(accounts[2].address, [1, 2]);
    const userLand = await vworldContract.getUserLands(accounts[2].address);
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
