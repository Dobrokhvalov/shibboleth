import hre from "hardhat";
const { ethers } = hre;

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    const ValidatorRegistry = await ethers.getContractFactory("ValidatorRegistry");
    const validatorRegistry = await ValidatorRegistry.deploy();

    console.log("Validator Registry address:", validatorRegistry.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
