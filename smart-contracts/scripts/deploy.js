const { ethers } = require("hardhat");

async function main() {
  try {
    console.log("Starting deployment process...");

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    // Get deployer balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "POL");

    // Deploy OmniCommentPayment contract
    console.log("\nDeploying OmniCommentPayment contract...");
    const OmniCommentPayment = await ethers.getContractFactory("OmniCommentPayment");
    const omniComment = await OmniCommentPayment.deploy();
    await omniComment.waitForDeployment();

    console.log("OmniCommentPayment deployed to:", omniComment.target);

    // Wait for additional block confirmations
    console.log("\nWaiting for block confirmations...");
    await omniComment.deploymentTransaction().wait(5);
    console.log("Additional blocks confirmed");

    // Verify contract if on Polygon Amoy network
    if (network.name === "amoy" && process.env.POLYGONSCAN_API_KEY) {
      console.log("\nVerifying contract on Polygon Amoy...");
      try {
        await hre.run("verify:verify", {
          address: omniComment.target,
          constructorArguments: []
        });
        console.log("Contract verification successful");
      } catch (error) {
        console.log("Verification failed:", error);
      }
    }

    // Log deployment details
    console.log("\nDeployment completed successfully!");
    console.log("Contract address:", omniComment.target);
    console.log("Network:", network.name);
    console.log("Block number:", await ethers.provider.getBlockNumber());
    
    // Save deployment info to a file
    const fs = require("fs");
    const deploymentInfo = {
      network: network.name,
      contractAddress: omniComment.target,
      deploymentTime: new Date().toISOString(),
      deployer: deployer.address
    };
    
    fs.writeFileSync(
      "deployment-info.json",
      JSON.stringify(deploymentInfo, null, 2)
    );
    console.log("\nDeployment info saved to deployment-info.json");

  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });