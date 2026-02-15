// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "forge-std/Script.sol";
import "../src/BasicTimestampVerifier.sol";
import "../src/DisclosureVerifier.sol";
import "../src/ProofOfExistence.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        BasicTimestampHonkVerifier timestampVerifier = new BasicTimestampHonkVerifier();
        DisclosureHonkVerifier disclosureVerifier = new DisclosureHonkVerifier();
        ProofOfExistence poe = new ProofOfExistence(
            address(timestampVerifier),
            address(disclosureVerifier)
        );

        vm.stopBroadcast();

        console.log("BasicTimestampVerifier:", address(timestampVerifier));
        console.log("DisclosureVerifier:", address(disclosureVerifier));
        console.log("ProofOfExistence:", address(poe));
    }
}
