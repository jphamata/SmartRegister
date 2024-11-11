const hre = require("hardhat");

async function main() {
  // Get the deployer's signer object
  const [deployer] = await hre.ethers.getSigners();
  
  // Get the current balance of the deployer
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance));

  // Get the contract factory
  const ContractFactory = await hre.ethers.getContractFactory("SmartRegister");
  
  // Deploy the contract
  console.log("Deploying contract...");
  const contract = await ContractFactory.deploy();
  
  // Wait for deployment to finish
  await contract.waitForDeployment();
  
  // Get the deployed contract address
  const deployedAddress = await contract.getAddress();
  console.log("Contract deployed to:", deployedAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
