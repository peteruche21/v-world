import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployVWorld: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments } = hre;
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;
  log("deploying VWorld");
  const receipt = await deploy("VWorld", {
    from: deployer,
    args: [
      [
        [1, 2],
        [3, 4],
        [5, 6],
      ],
    ],
    log: true,
  });
  log("deployed land contract at " + receipt.address);
};
export default deployVWorld;
deployVWorld.tags = ["all", "VWorld"];
