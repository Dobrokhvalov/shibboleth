import hre from "hardhat";
import { arrayify, computeAddress, defaultAbiCoder, hexlify, randomBytes, SigningKey } from "ethers/lib/utils";
import { NonceIssuer } from "@shibboleth/shibboleth-js";
import { ValidatorRegistry } from "../typechain";

const { ethers } = hre;


async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Connecting account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());
    const validatorAddress = process.env.SCRIPTS_VALIDATOR_REGISTRY
    if (!validatorAddress) {
        throw new Error("Validator address is not configured. Set SCRIPTS_VALIDATOR_REGISTRY in .env file.")
    }
    const validator = (await ethers.getContractAt(
        "ValidatorRegistry",
        `${validatorAddress}`,
    )) as ValidatorRegistry;
    console.log("Validator Registry address:", validator.address);

    const issuerkey: SigningKey = new SigningKey(process.env.SCRIPTS_ISSUER_KEY || randomBytes(32));
    console.log("Issuer key is:", issuerkey.privateKey);

    const issueraddress: string = computeAddress(issuerkey.privateKey);
    console.log("Issuer address is:", issueraddress);

    const issuer: NonceIssuer = new NonceIssuer(validator.address, issuerkey, 0);
    const configCode = issuer.makeConfigCode();
    console.log(`Config code: ${configCode.toString()}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
