import hre from "hardhat";
import { arrayify, computeAddress, defaultAbiCoder, hexlify, randomBytes, SigningKey } from "ethers/lib/utils";
import { submitClaim, ClaimCode } from "@shibboleth/shibboleth-js";
import { ValidatorRegistry } from "../typechain";

const { ethers } = hre;

async function main() {
    const [deployer] = await ethers.getSigners();

    const code = process.env.SCRIPTS_CLAIM_CODE
    if (!code) {
        throw new Error("Claim code is not configured. Set SCRIPTS_CLAIM_CODE in .env file.")
    }

    const claimCode = ClaimCode.fromString(code);
    const issuer = claimCode.issuer;

    const validatoraddress = claimCode.validator;
    const validator = (await ethers.getContractAt(
        "ValidatorRegistry",
        validatoraddress,
    )) as ValidatorRegistry;

    // get beneficiary from config or generate a random address 
    const beneficiary: string = process.env.SCRIPTS_BENEFICIARY || computeAddress(new SigningKey(randomBytes(32)).privateKey);
    console.log(`Beneficiary: ${beneficiary}`)

    // get metadata
    const metadata = await validator.metadata(issuer, claimCode.claimant, hexlify(claimCode.data));
    console.log(metadata);

    // submit claim
    const tx = await submitClaim(deployer, beneficiary, claimCode);
    console.log(tx)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
