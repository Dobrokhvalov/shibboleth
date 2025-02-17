//SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "../BaseValidator.sol";
import "@openzeppelin/contracts/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/contracts/utils/structs/BitMaps.sol";

/**
 * @dev An implementation of a Validator that requires each claim to have a unique nonce,
 *      encoded as a uint256 in the first 32 bytes of the data field.
 */
abstract contract UniqueNonceDedup is BaseValidator {
    using BitMaps for BitMaps.BitMap;

    mapping(address=>BitMaps.BitMap) nonces;

    error NonceAlreadyUsed(uint256 nonce);

    function claim(address beneficiary, bytes calldata data, bytes calldata authsig, bytes calldata claimsig) public override virtual returns(address issuer, address claimant) {
        (issuer, claimant) = super.claim(beneficiary, data, authsig, claimsig);
        uint256 claimNonce = abi.decode(data, (uint256));
        if(nonces[issuer].get(claimNonce)) {
            revert NonceAlreadyUsed(claimNonce);
        }
        nonces[issuer].set(claimNonce);
    }

    function nonce(address issuer, uint256 _nonce) public view returns(bool) {
        return nonces[issuer].get(_nonce);
    }

    function metadata(address issuer, address claimant, bytes calldata claimData) public override virtual view returns(string memory) {
        string memory ret = super.metadata(issuer, claimant, claimData);
        if(bytes(ret).length > 0) {
            return ret;
        }

        uint256 claimNonce = abi.decode(claimData, (uint256));
        if(nonces[issuer].get(claimNonce)) {
            return string(abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode("{\"valid\":false,\"error\":\"Nonce already used.\"}")
            ));
        }
        return "";
    }
}
