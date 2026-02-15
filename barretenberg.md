Barretenberg
Barretenberg (or bb for short) is an optimized elliptic curve library for the bn128 curve, and a PLONK SNARK prover.

Although it is a standalone prover, Barretenberg is designed to be used with Noir. It is highly recommended to start by creating a Noir project with the Noir quickstart guide before this guide!

Installation
Inspired by rustup, noirup and similar tools, you can use the bbup installation script to quickly install and update Barretenberg's CLI tool:

curl -L https://raw.githubusercontent.com/AztecProtocol/aztec-packages/refs/heads/next/barretenberg/bbup/install | bash
bbup


Following these prompts, you should be able to see bb binary in $HOME/.bb/bb.

Usage
Assuming you have a Noir project, you can use bb straight-away to prove by giving it the compiled circuit and the witness (the outputs of nargo execute). Since we want to verify the proof later, we also want to write the verification key to a file. Let's do it:

bb prove -b ./target/hello_world.json -w ./target/hello_world.gz --write_vk -o target

This will prove your program and write both a proof and a vk file to the target folder. To verify the proof, you don't need the witness (that would defeat the purpose, wouldn't it?), just the proof and the vk:

bb verify -p ./target/proof -k ./target/vk

Congratulations! Using Noir and Barretenberg, your verifier could verify the correctness of a proof, without knowing the private inputs!

info
You may be asking yourself what happened to the public inputs? Barretenberg proofs usually append them to the beginning of the proof. This may or may not be useful, and the next guides will provide you with handy commands to split the proof and the public inputs whenever needed

Next steps
As cool as it is, proving and verifying on the same machine is not incredibly useful. You may want to do things like:

Generating programs that verify proofs in immutable, decentralized ledgers like blockchains
Verifying proofs within other proofs
Check out those specific guides in the sidebar.
Generate a Solidity Verifier
This guide shows how to generate a Solidity Verifier with Barretenberg and deploy it on the Remix IDE. It is assumed that:

You are comfortable with the Solidity programming language and understand how contracts are deployed on the Ethereum network
You have Noir installed and you have a Noir program. If you don't, get started with Nargo, then follow through the Barretenberg quick start
You are comfortable navigating RemixIDE. If you aren't or you need a refresher, you can find some video tutorials here that could help you.
Rundown
Generating a Solidity Verifier with Barretenberg contract is actually a one-command process. However, compiling it and deploying it can have some caveats. Here's the rundown of this guide:

How to generate a solidity smart contract
How to compile the smart contract in the RemixIDE
How to deploy it to a testnet
Step 1 - Generate a solidity contract
# Generate the verification key. You need to pass the `--oracle_hash keccak` flag when generating vkey and proving
# to instruct bb to use keccak as the hash function, which is more optimal in Solidity
bb write_vk -b ./target/<noir_artifact_name>.json -o ./target --oracle_hash keccak

# Generate the Solidity verifier from the vkey
bb write_solidity_verifier -k ./target/vk -o ./target/Verifier.sol


replacing <noir_artifact_name> with the name of your Noir project. A Verifier.sol contract is now in the target folder and can be deployed to any EVM blockchain acting as a verifier smart contract.

Step 2 - Compiling
We will mostly skip the details of RemixIDE, as the UI can change from version to version. For now, we can just open Remix and create a blank workspace.

Create Workspace

We will create a new file to contain the contract Nargo generated, and copy-paste its content.

warning
You'll likely see a warning advising you to not trust pasted code. While it is an important warning, it is irrelevant in the context of this guide and can be ignored. We will not be deploying anywhere near a mainnet.

To compile the verifier, we can navigate to the compilation tab:

Compilation Tab

Remix should automatically match a suitable compiler version. However, hitting the "Compile" button will most likely tell you the contract is too big to deploy on mainnet, or complain about a stack too deep:

Contract code too big Stack too deep

To avoid this, you can just use some optimization. Open the "Advanced Configurations" tab and enable optimization. The default 200 runs will suffice.

Compilation success

Step 3 - Deploying
At this point we should have a compiled contract ready to deploy. If we navigate to the deploy section in Remix, we will see many different environments we can deploy to. The steps to deploy on each environment would be out-of-scope for this guide, so we will just use the default Remix VM.

Looking closely, we will notice that our "Solidity Verifier" is composed on multiple contracts working together. Remix will take care of the dependencies for us so we can simply deploy the Verifier contract by selecting it and hitting "deploy":

Deploying HonkVerifier

A contract will show up in the "Deployed Contracts" section.

Step 4 - Verifying
To verify a proof using the Solidity verifier contract, we call the verify function:

function verify(bytes calldata _proof, bytes32[] calldata _publicInputs) external view returns (bool)


First generate a proof with bb. We need a Prover.toml file for our inputs. Run:

nargo check

This will generate a Prover.toml you can fill with the values you want to prove. We can now execute the circuit with nargo and then use the proving backend to prove:

nargo execute <witness-name>
bb prove -b ./target/<circuit-name>.json -w ./target/<witness-name> -o ./target --oracle_hash keccak


Binary Output Format

Barretenberg outputs proof and public_inputs files in binary format. The binary format is fields-compatible, meaning it can be split into 32-byte chunks where each chunk represents a field element.

This produces a proof file with the proof data and a public_inputs file with the public input values.

A programmatic example of how the verify function is called can be seen in the example zk voting application here:

function castVote(bytes calldata proof, uint proposalId, uint vote, bytes32 nullifierHash) public returns (bool) {
  // ...
  bytes32[] memory publicInputs = new bytes32[](4);
  publicInputs[0] = merkleRoot;
  publicInputs[1] = bytes32(proposalId);
  publicInputs[2] = bytes32(vote);
  publicInputs[3] = nullifierHash;
  require(verifier.verify(proof, publicInputs), "Invalid proof");


Return Values
A circuit doesn't have the concept of a return value. Return values are just syntactic sugar in Noir.

Under the hood, the return value is passed as an input to the circuit and is checked at the end of the circuit program.

For example, if you have Noir program like this:

fn main(
    // Public inputs
    pubkey_x: pub Field,
    pubkey_y: pub Field,
    // Private inputs
    priv_key: Field,
) -> pub Field

the verify function will expect the public inputs array (second function parameter) to be of length 3, the two inputs and the return value.

Passing only two inputs will result in an error such as PUBLIC_INPUT_COUNT_INVALID(3, 2).

In this case, the inputs parameter to verify would be an array ordered as [pubkey_x, pubkey_y, return].

Structs
You can pass structs to the verifier contract. They will be flattened so that the array of inputs is 1-dimensional array.

For example, consider the following program:

struct Type1 {
  val1: Field,
  val2: Field,
}

struct Nested {
  t1: Type1,
  is_true: bool,
}

fn main(x: pub Field, nested: pub Nested, y: pub Field) {
  //...
}

The order of these inputs would be flattened to: [x, nested.t1.val1, nested.t1.val2, nested.is_true, y]

The other function you can call is our entrypoint verify function, as defined above.

tip
It's worth noticing that the verify function is actually a view function. A view function does not alter the blockchain state, so it doesn't need to be distributed (i.e. it will run only on the executing node), and therefore doesn't cost any gas.

This can be particularly useful in some situations. If Alice generated a proof and wants Bob to verify its correctness, Bob doesn't need to run Nargo, NoirJS, or any Noir specific infrastructure. He can simply make a call to the blockchain with the proof and verify it is correct without paying any gas.

It would be incorrect to say that a Noir proof verification costs any gas at all. However, most of the time the result of verify is used to modify state (for example, to update a balance, a game state, etc). In that case the whole network needs to execute it, which does incur gas costs (calldata and execution, but not storage).

Compatibility with different EVM chains
Barretenberg proof verification requires the ecMul, ecAdd, ecPairing, and modexp EVM precompiles. You can deploy and use the verifier contract on all EVM chains that support the precompiles.

EVM Diff provides a great table of which EVM chains support which precompiles: https://www.evmdiff.com/features?feature=precompiles

Some EVM chains manually tested to work with the Barretenberg verifier include:

Optimism
Arbitrum
Polygon PoS
Scroll
Celo
BSC
Blast L2
Avalanche C-Chain
Mode
Linea
Moonbeam
Meanwhile, some EVM chains manually tested that failed to work with the Barretenberg verifier include:

zkSync ERA
Polygon zkEVM
Pull requests to update this section are welcome and appreciated if you have compatibility updates on existing / new chains to contribute: https://github.com/noir-lang/noir

What's next
Now that you know how to call a Noir Solidity Verifier on a smart contract using Remix, you should be comfortable with using it with some programmatic frameworks. You can find other tools, examples, boilerplates and libraries in the awesome-noir repository.

page link https://barretenberg.aztec.network/docs/how_to_guides/how-to-solidity-verifier
Barretenberg on the browser
bb.js is the TypeScript/JavaScript prover and verifier library for Barretenberg. It provides both a command-line interface and a programmatic API for generating and verifying zero-knowledge proofs in Node.js and browser environments.

Overview
bb.js supports multiple proof systems:

UltraHonk: The current recommended proof system with various hash function options
MegaHonk: Alternative Honk implementation
ClientIVC: For Aztec-specific client-side proving
Installation
As a Library
Install bb.js as a dependency in your project:

npm install @aztec/bb.js

or with yarn:

yarn add @aztec/bb.js

Proving and Verifying with UltraHonk
Using the UltraHonkBackend Class
The UltraHonkBackend class provides a high-level interface for proof generation and verification. You can import any specific backend (i.e. UltraHonk):

import { UltraHonkBackend} from '@aztec/bb.js';

Using a precompiled program and a witness from nargo execute, you can directly import it and initialize the backend:

// Load circuit bytecode (from Noir compiler output)
const circuitPath = path.join(__dirname, 'fixtures/main/target/program.json');
const circuitJson = JSON.parse(readFileSync(circuitPath, 'utf8'));
const bytecode = circuitJson.bytecode;

// Load witness data
const witnessPath = path.join(__dirname, 'fixtures/main/target/program.gz');
const witnessBuffer = readFileSync(witnessPath);

// Initialize backend
const backend = new UltraHonkBackend(bytecode);

And just prove it using the witness:

// Generate proof with Keccak for EVM verification
const proofData: ProofData = await backend.generateProof(witnessBuffer, {
  keccak: true
});

const provingTime = Date.now() - startTime;
console.log(`Proof generated in ${provingTime}ms`);
console.log(`Proof size: ${proofData.proof.length} bytes`);
console.log(`Public inputs: ${proofData.publicInputs.length}`);

Verification is similarly simple:

// Verify the proof
console.log('Verifying proof...');
const isValid = await backend.verifyProof(proofData, { keccak: true });
console.log(`Proof verification: ${isValid ? 'SUCCESS' : 'FAILED'}`);

Working with Different Hash Functions
UltraHonk supports different hash functions for different target verification environments:

// Standard UltraHonk (uses Poseidon)
const proof = await backend.generateProof(witnessBuffer);
expect(proof.proof).to.have.length.greaterThan(0);

// Keccak variant (for EVM verification)
const proofKeccak = await backend.generateProof(witnessBuffer, { keccak: true });
expect(proofKeccak.proof).to.have.length.greaterThan(0);

// ZK variants for recursive proofs
const proofKeccakZK = await backend.generateProof(witnessBuffer, { keccakZK: true });
expect(proofKeccakZK.proof).to.have.length.greaterThan(0);

Getting Verification Keys (VK)
// Get verification key
const vk = await backend.getVerificationKey();

// For a solidity verifier:
const vkKeccak = await backend.getVerificationKey({ keccak: true });

Getting Solidity Verifier
The solidity verifier is the VK, but with some logic that allows for non-interactive verification:

// Needs the keccak hash variant of the VK
const solidityContract = await backend.getSolidityVerifier(vkKeccak);

Using the Low-Level API
For more control, you can use the Barretenberg API directly:

const api = await Barretenberg.new({ threads: 1 });

// Blake2s hashing
const input = Buffer.from('hello world!');
const hash = await api.blake2s(input);

// Pedersen commitment
const left = Fr.random();
const right = Fr.random();
const commitment = await api.pedersenCommit([left, right], 0);

await api.destroy();

Browser Environment Considerations
Multithreading Support
To enable multithreading in browsers using some frameworks (ex. Next.js), you may need to set COOP and COEP headers:

// Next.js example configuration
{
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
    ];
  },
}

Performance Optimization
Thread Configuration
You can define specific thread counts in case you need the cores for other things in your app:

// Auto-detect optimal thread count (default)
const api = await Barretenberg.new();

// Manual thread configuration
const api = await Barretenberg.new({
  threads: Math.min(navigator.hardwareConcurrency || 1, 8)
});

// Single-threaded for compatibility
const api = await Barretenberg.new({ threads: 1 });

Memory Management
It can be useful to manage memory manually, specially if targeting specific memory-constrained environments (ex. Safari):

// Configure initial and maximum memory
const api = await Barretenberg.new({
  threads: 4,
  memory: {
    initial: 128 * 1024 * 1024,  // 128MB
    maximum: 512 * 1024 * 1024   // 512MB
  }
});
Recursive Aggregation
This guide shows you how to prove recursive programs using bb.js. We will be using Noir as the frontend language.

For the sake of clarity, it is assumed that:

You already have a NoirJS app. If you don't, please visit the NoirJS tutorial and the reference.
You are familiar with what are recursive proofs and you have read the recursion explainer
You already built a recursive circuit following the reference, and understand how it works.
It is also assumed that you're not using noir_wasm for compilation, and instead you've used nargo compile to generate the json you're now importing into your project.

Step 1: Setup
In a standard recursive app, you're dealing with at least two circuits:

main or inner: a circuit of type assert(x != y), which we want to embed in another circuit recursively.
recursive or outer: a circuit that verifies main.
First, let's import the necessary modules and set up our circuits:

import { UltraHonkBackend, ProofData, Barretenberg, RawBuffer, deflattenFields } from '@aztec/bb.js';
import { Noir } from '@noir-lang/noir_js';


Then we need to load our circuit bytecode and set up the Noir instances:

// Load main circuit bytecode
const mainCircuitPath = path.join(__dirname, 'fixtures/main/target/program.json');
const mainCircuitJson = JSON.parse(readFileSync(mainCircuitPath, 'utf8'));
const mainBytecode = mainCircuitJson.bytecode;

// Load recursive circuit bytecode
const recursiveCircuitPath = path.join(__dirname, 'fixtures/recursive/target/recursive.json');
const recursiveCircuitJson = JSON.parse(readFileSync(recursiveCircuitPath, 'utf8'));
const recursiveBytecode = recursiveCircuitJson.bytecode;

// Create Noir instances
mainNoir = new Noir(mainCircuitJson);
recursiveNoir = new Noir(recursiveCircuitJson);


The first program can be anything, so we should focus on the second one. The circuit could be something like so:

global HONK_VK_SIZE: u32 = 112;
global HONK_PROOF_SIZE: u32 = 507;
global HONK_IDENTIFIER: u32 = 1;

fn main(
    verification_key: [Field; HONK_VK_SIZE],
    proof: [Field; HONK_PROOF_SIZE],
    public_inputs: pub [Field; 1],
) {
    std::verify_proof_with_type(
        verification_key,
        proof,
        public_inputs,
        0x0,
        HONK_IDENTIFIER,
    );
}

A common scenario is one where you want to create a proof of multiple proof verifications, like a binary tree. Some projects and demos like billion zk voters and the 2023 progcrypto activation demo are examples of 2-in-1 circuits.

Proof Types
Different proof systems can have different proof and VK sizes and types. You need to plan this in advance depending on your proof.

In this case we're using the default HONK proof.

Step 2: Witness generation
As with every Noir program, you need to execute it and generate the witness. This is no different from a regular noir.js program, except you want to do it twice:

// Generate witness for main circuit
const { witness: mainWitness } = await mainNoir.execute({ x: 1, y: 2 });

// Note: recursiveWitness will be generated later after we have the proof inputs
// const { witness: recursiveWitness } = await recursiveNoir.execute(recursiveInputs);

warning
Noir will generate a witness which doesn't mean it is constrained or valid. The proving backend (in this case Barretenberg) is responsible for the generation of the proof.

This is why you should refer this technique as "recursive aggregation" instead of "recursion".

warning
Always keep in mind what is actually happening on your development process, otherwise you'll quickly become confused about what circuit we are actually running and why!

In this case, you can imagine that Alice (running the main circuit) is proving something to Bob (running the recursive circuit), and Bob is verifying her proof within his proof.

With this in mind, it becomes clear that our intermediate proof is the one meant to be verified within another circuit, so it must be Alice's. Actually, the only final proof in this theoretical scenario would be the last one, sent onchain.

Step 3 - Proving Backend
With the witness, we are now moving into actually proving. In this example, we will be using bb.js for generating the proof and the verification key of the inner circuit.

Since we're using Honk proofs, let's instantiate the UltraHonkBackend just as in the browser how-to-guide:

// Setup backend for main circuit (inner circuit)
mainBackend = new UltraHonkBackend(
  mainBytecode,
  { threads: 8 },
  { recursive: true }
);

// Setup backend for recursive circuit (outer circuit)
recursiveBackend = new UltraHonkBackend(
  recursiveBytecode,
  { threads: 8 },
  { recursive: false }
);

tip
We're setting 8 threads here, but you can use the os.cpus() object in nodejs or navigator.hardwareConcurrency on the browser to make the most out of those cpu cores

We can now generate the proof and the verification key (VK), for example:

// Generate proof for main circuit with keccakZK for recursive verification
const mainProofData = await mainBackend.generateProof(mainWitness, { keccakZK: true });

// Generate verification key for main circuit
const mainVerificationKey = await mainBackend.getVerificationKey({ keccakZK: true });

info
One common mistake is to forget who generates the verification key.

In a situation where Alice and Bob are playing a battleships game and Alice is proving to Bob that he shot an aircraft carrier, Bob should generate the verification key himself. If Bob just accepts the proof and the VK from Alice, this means Alice could prove any circuit (i.e. 1 != 2) instead of the actual "proof that Bob sank my ship"

We now need to prepare our inputs to be fed correctly into the recursive program. This means getting the VK and the proof as fields. We can use the default Barretenberg API for this:

// Convert proof and VK to fields for recursive circuit
const barretenbergAPI = await Barretenberg.new({ threads: 1 });
const proofAsFields = deflattenFields(new RawBuffer(mainProofData.proof));
const vkAsFields = (await barretenbergAPI.acirVkAsFieldsUltraHonk(new RawBuffer(mainVerificationKey)))
  .map(field => field.toString());

// Prepare inputs for recursive circuit
const recursiveInputs = {
  proof: proofAsFields,
  public_inputs: [2],
  verification_key: vkAsFields
};

await barretenbergAPI.destroy();


Step 4 - Recursive proof generation
Having the proof and the VK in the correct format, generating a recursive proof is no different from a normal proof. You simply use the backend (with the recursive circuit) to generate it:

// Generate witness for recursive circuit
const { witness: recursiveWitness } = await recursiveNoir.execute(recursiveInputs);

// Generate recursive proof
const recursiveProofData = await recursiveBackend.generateProof(recursiveWitness);

You can obviously chain this proof into another proof. In fact, if you're using recursive proofs, you're probably interested of using them this way!

Example
You can find a non-exhaustive example of recursive aggregation in the noir-examples repository.

Keep in mind that recursive proof aggregation is very much an experimental way of using Barretenberg, and you may need to tweak or downgrade versions.

Join the Noir discord for discussions, feedback and questions about anything regarding Noir and BB.
CHONK - Client-side Highly Optimized ploNK
CHONK Overview

Aztec's goal is to enable private verifiable execution of smart contracts. This motivates a proving system design where:

Proofs can be generated with relatively low memory, so that the prover can be run on a phone or browser.
Proofs can efficiently incorporate many layers of recursion - as the claims being proven are of a recursive nature - one contract function calls another which calls another etc.
The second goal indirectly supports the first - efficient recursion goes hand in hand with low memory proving, as statements can be decomposed via recursion into smaller statements that require less prover memory.

We call the proving system CHONK - Client-side Highly Optimized ploNK. As the name suggests, its starting point is the PlonK proving system.

As in the original PlonK system:

It is based on elliptic curves and pairings.
Circuit constraints are expressed via selector polynomials and copy constraints.
Its deviations from PlonK, detailed below, are motivated by the above goals.

Key Deviations from PlonK
1. Proving statements about a sequence of circuits
A statement about contract execution will translate to multiple circuits - representing the different contract functions called during the execution. Between each two of these circuits we need to run an Aztec constructed Kernel circuit to do "bookkeeping" - like making sure the correct arguments are passed from function to function. More details on this approach can be found in the Aztec documentation and the Stackproofs paper.

2. Replacing univariate quotienting by sumcheck
This eliminates FFT's and reduces prover time and memory at the expense of proof length. This approach is the main theme of the hyperplonk paper.

3. Using the protogalaxy (PG) folding scheme
Folding schemes enable cheaper recursion than standard recursive proofs. They work most smoothly with elliptic-curve based proofs systems like CHONK. We specifically work with protogalaxy which is convenient and efficient for folding non-uniform PlonK circuits (i.e. not a fixed repeating circuit).

4. Enhancing PG with "Goblin plonk"
Though PG (as do other folding schemes) already facilitates efficient recursion, it can still be a bit heavy client-side due to the non-native elliptic curve scalar multiplications performed by the folding verifier. For this reason, we use a "lazy" version of PG where the verifier doesn't perform these operations, but rather simply adds them to a queue of EC operations that need to be performed at the final proving stage. We call this deferral mechanism Goblin Plonk (GP) (see also this paper).

The advantage of GP is that at this final stage we transition to another elliptic curve called Grumpkin where these operations are more efficient. This curve-switch approach was initiated by BCTV, and a good example of it in the modern folding context is CycleFold. GP is arguably simpler than CycleFold where we switch back and forth between the curves at every iteration of the IVC. The approaches are however incomparable, and for example, CycleFold has the advantage of the final IPA verifier size not growing with the number of iterations. (Although this verifier can be run server-side once for all client proofs using the Halo/BCMS accumulation mechanism.)

Learn More
For a more colorful video presentation of the above check out this talk

Recursive proofs
In programming, we tend to think of recursion as something calling itself. A classic example would be the calculation of the factorial of a number:

function factorial(n) {
    if (n === 0 || n === 1) {
        return 1;
    } else {
        return n * factorial(n - 1);
    }
}

In this case, while n is not 1, this function will keep calling itself until it hits the base case, bubbling up the result on the call stack:

        Is `n` 1?  <---------
           /\               /
          /  \         n = n -1
         /    \           /
       Yes     No --------

In Zero-Knowledge, recursion has some similarities.

It is not a Noir function calling itself, but a proof being used as an input to another circuit. In short, you verify one proof inside another proof, returning the proof that both proofs are valid.

This means that, given enough computational resources, you can prove the correctness of any arbitrary number of proofs in a single proof. This could be useful to design state channels (for which a common example would be Bitcoin's Lightning Network), to save on gas costs by settling one proof onchain, or simply to make business logic less dependent on a consensus mechanism.

Examples
Let us look at some of these examples

Alice and Bob - Guessing game
Alice and Bob are friends, and they like guessing games. They want to play a guessing game online, but for that, they need a trusted third-party that knows both of their secrets and finishes the game once someone wins.

So, they use zero-knowledge proofs. Alice tries to guess Bob's number, and Bob will generate a ZK proof stating whether she succeeded or failed.

This ZK proof can go on a smart contract, revealing the winner and even giving prizes. However, this means every turn needs to be verified onchain. This incurs some cost and waiting time that may simply make the game too expensive or time-consuming to be worth it.

As a solution, Alice proposes the following: "what if Bob generates his proof, and instead of sending it onchain, I verify it within my own proof before playing my own turn?".

She can then generate a proof that she verified his proof, and so on.

      Did you fail?  <--------------------------
           / \                                  /
          /   \                             n = n -1
         /     \                              /
       Yes      No                           /
        |        |                          /
        |        |                         /
        |      You win                    /
        |                                /
        |                               /
Generate proof of that                 /
        +                             /
    my own guess     ----------------

Charlie - Recursive merkle tree
Charlie is a concerned citizen, and wants to be sure his vote in an election is accounted for. He votes with a ZK proof, but he has no way of knowing that his ZK proof was included in the total vote count!

If the vote collector puts all of the votes into a Merkle tree, everyone can prove the verification of two proofs within one proof, as such:

                    abcd
           __________|______________
          |                         |
         ab                         cd
     _____|_____              ______|______
    |           |            |             |
  alice        bob        charlie        daniel

Doing this recursively allows us to arrive on a final proof abcd which if true, verifies the correctness of all the votes.

Daniel - Reusable components
Daniel has a big circuit and a big headache. A part of his circuit is a setup phase that finishes with some assertions that need to be made. But that section alone takes most of the proving time, and is largely independent of the rest of the circuit.

He might find it more efficient to generate a proof for that setup phase separately, and verify that proof recursively in the actual business logic section of his circuit. This will allow for parallelization of both proofs, which results in a considerable speedup.

What params do I need
As you can see in the recursion reference, a simple recursive proof requires:

The proof to verify
The Verification Key of the circuit that generated the proof
The public inputs for the proof
info
Recursive zkSNARK schemes do not necessarily "verify a proof" in the sense that you expect a true or false to be spit out by the verifier. Rather an aggregation object is built over the public inputs.

So, taking the example of Alice and Bob and their guessing game:

Alice makes her guess. Her proof is not recursive: it doesn't verify any proof within it! It's just a standard assert(x != y) circuit
Bob verifies Alice's proof and makes his own guess. In this circuit, he doesn't exactly prove the verification of Alice's proof. Instead, he aggregates his proof to Alice's proof. The actual verification is done when the full proof is verified, for example when using nargo verify or through the verifier smart contract.
We can imagine recursive proofs a relay race. The first runner doesn't have to receive the baton from anyone else, as he/she already starts with it. But when his/her turn is over, the next runner needs to receive it, run a bit more, and pass it along. Even though every runner could theoretically verify the baton mid-run (why not? 🏃🔍), only at the end of the race does the referee verify that the whole race is valid.

Some architecture
As with everything in computer science, there's no one-size-fits all. But there are some patterns that could help understanding and implementing them. To give three examples:

Adding some logic to a proof verification
This would be an approach for something like our guessing game, where proofs are sent back and forth and are verified by each opponent. This circuit would be divided in two sections:

A recursive verification section, which would be just the call to std::verify_proof, and that would be skipped on the first move (since there's no proof to verify)
A guessing section, which is basically the logic part where the actual guessing happens
In such a situation, and assuming Alice is first, she would skip the first part and try to guess Bob's number. Bob would then verify her proof on the first section of his run, and try to guess Alice's number on the second part, and so on.

Aggregating proofs
In some one-way interaction situations, recursion would allow for aggregation of simple proofs that don't need to be immediately verified onchain or elsewhere.

To give a practical example, a barman wouldn't need to verify a "proof-of-age" onchain every time he serves alcohol to a customer. Instead, the architecture would comprise two circuits:

A main, non-recursive circuit with some logic
A recursive circuit meant to verify two proofs in one proof
The customer's proofs would be intermediate, and made on their phones, and the barman could just verify them locally. He would then aggregate them into a final proof sent onchain (or elsewhere) at the end of the day.

Recursively verifying different circuits
Nothing prevents you from verifying different circuits in a recursive proof, for example:

A circuit1 circuit
A circuit2 circuit
A recursive circuit
In this example, a regulator could verify that taxes were paid for a specific purchase by aggregating both a payer circuit (proving that a purchase was made and taxes were paid), and a receipt circuit (proving that the payment was received)

How fast is it
At the time of writing, verifying recursive proofs is surprisingly fast. This is because most of the time is spent on generating the verification key that will be used to generate the next proof. So you are able to cache the verification key and reuse it later.

Currently, Noir JS packages don't expose the functionality of loading proving and verification keys, but that feature exists in the underlying bb.js package.

How can I try it
Learn more about using recursion in Nargo and NoirJS in the how-to guide and see a full example in noir-examples.

Barretenberg CLI Reference
This documentation is auto-generated from the bb CLI help output.

Generated: Tue 13 Jan 2026 17:34:08 UTC

Command: bb

Table of Contents
bb
bb check
bb gates
bb prove
bb write_vk
bb verify
bb write_solidity_verifier
bb aztec_process
bb msgpack
bb msgpack schema
bb msgpack curve_constants
bb msgpack run
bb
Barretenberg Your favo(u)rite zkSNARK library written in C++, a perfectly good computer programming language. Aztec Virtual Machine (AVM): disabled AVM Transpiler: enabled Starknet Garaga Extensions: disabled

Usage:

bb [OPTIONS] [SUBCOMMAND]

Available Commands:

check - A debugging tool to quickly check whether a witness satisfies a circuit The function constructs the execution trace and iterates through it row by row, applying the polynomial relations defining the gate types. For Chonk, we check the VKs in the folding stack.
gates - Construct a circuit from the given bytecode (in particular, expand black box functions) and return the gate count information.
prove - Generate a proof.
write_vk - Write the verification key of a circuit. The circuit is constructed using quickly generated but invalid witnesses (which must be supplied in Barretenberg in order to expand ACIR black box opcodes), and no proof is constructed.
verify - Verify a proof.
write_solidity_verifier - Write a Solidity smart contract suitable for verifying proofs of circuit satisfiability for the circuit with verification key at vk_path. Not all hash types are implemented due to efficiency concerns.
aztec_process - Process Aztec contract artifacts: transpile and generate verification keys for all private functions. If input is a directory (and no output specified), recursively processes all artifacts found in the directory.
msgpack - Msgpack API interface.
Options:

-h,--help - Print this help message and exit
-v,--verbose,--verbose_logging - Output all logs to stderr.
-d,--debug_logging - Output debug logs to stderr.
-c,--crs_path - Path CRS directory. Missing CRS files will be retrieved from the internet.
--version - Print the version string.
Subcommands
bb check
A debugging tool to quickly check whether a witness satisfies a circuit The function constructs the execution trace and iterates through it row by row, applying the polynomial relations defining the gate types. For Chonk, we check the VKs in the folding stack.

Usage:

bb check [OPTIONS]

Options:

-h,--help - Print this help message and exit
-s,--scheme - The type of proof to be constructed. This can specify a proving system, an accumulation scheme, or a particular type of circuit to be constructed and proven for some implicit scheme. Options: {chonk, avm, ultra_honk} Environment: BB_SCHEME
-b,--bytecode_path - Path to ACIR bytecode generated by Noir.
-w,--witness_path - Path to partial witness generated by Noir.
--ivc_inputs_path - For IVC, path to input stack with bytecode and witnesses.
--update_inputs - Update inputs if vk check fails.
bb gates
Construct a circuit from the given bytecode (in particular, expand black box functions) and return the gate count information.

Usage:

bb gates [OPTIONS]

Options:

-h,--help - Print this help message and exit
-s,--scheme - The type of proof to be constructed. This can specify a proving system, an accumulation scheme, or a particular type of circuit to be constructed and proven for some implicit scheme. Options: {chonk, avm, ultra_honk} Environment: BB_SCHEME
-v,--verbose,--verbose_logging - Output all logs to stderr.
-b,--bytecode_path - Path to ACIR bytecode generated by Noir.
--include_gates_per_opcode - Include gates_per_opcode in the output of the gates command.
--oracle_hash - The hash function used by the prover as random oracle standing in for a verifier's challenge generation. Poseidon2 is to be used for proofs that are intended to be verified inside of a circuit. Keccak is optimized for verification in an Ethereum smart contract, where Keccak has a privileged position due to the existence of an EVM precompile. Starknet is optimized for verification in a Starknet smart contract, which can be generated using the Garaga library. Options: {poseidon2, keccak, starknet}
--ipa_accumulation - Accumulate/Aggregate IPA (Inner Product Argument) claims
bb prove
Generate a proof.

Usage:

bb prove [OPTIONS]

Options:

-h,--help - Print this help message and exit
-s,--scheme - The type of proof to be constructed. This can specify a proving system, an accumulation scheme, or a particular type of circuit to be constructed and proven for some implicit scheme. Options: {chonk, avm, ultra_honk} Environment: BB_SCHEME
-b,--bytecode_path - Path to ACIR bytecode generated by Noir.
-w,--witness_path - Path to partial witness generated by Noir.
-o,--output_path - Directory to write files or path of file to write, depending on subcommand.
--ivc_inputs_path - For IVC, path to input stack with bytecode and witnesses.
-k,--vk_path - Path to a verification key.
--vk_policy - Policy for handling verification keys during IVC accumulation. 'default' uses the provided VK as-is, 'check' verifies the provided VK matches the computed VK (throws error on mismatch), 'recompute' always ignores the provided VK and treats it as nullptr. Options: {default, check, recompute}
-v,--verbose,--verbose_logging - Output all logs to stderr.
-d,--debug_logging - Output debug logs to stderr.
-c,--crs_path - Path CRS directory. Missing CRS files will be retrieved from the internet.
--oracle_hash - The hash function used by the prover as random oracle standing in for a verifier's challenge generation. Poseidon2 is to be used for proofs that are intended to be verified inside of a circuit. Keccak is optimized for verification in an Ethereum smart contract, where Keccak has a privileged position due to the existence of an EVM precompile. Starknet is optimized for verification in a Starknet smart contract, which can be generated using the Garaga library. Options: {poseidon2, keccak, starknet}
--write_vk - Write the provided circuit's verification key
--ipa_accumulation - Accumulate/Aggregate IPA (Inner Product Argument) claims
--disable_zk - Use a non-zk version of --scheme. This flag is set to false by default.
--slow_low_memory - Enable low memory mode (can be 2x slower or more).
--print_bench - Pretty print op counts to standard error in a human-readable format.
--bench_out - Path to write the op counts in a json.
--bench_out_hierarchical - Path to write the hierarchical benchmark data (op counts and timings with parent-child relationships) as json.
--storage_budget - Storage budget for FileBackedMemory (e.g. '500m', '2g'). When exceeded, falls back to RAM (requires --slow_low_memory).
--verify - Verify the proof natively, resulting in a boolean output. Useful for testing.
bb write_vk
Write the verification key of a circuit. The circuit is constructed using quickly generated but invalid witnesses (which must be supplied in Barretenberg in order to expand ACIR black box opcodes), and no proof is constructed.

Usage:

bb write_vk [OPTIONS]

Options:

-h,--help - Print this help message and exit
-s,--scheme - The type of proof to be constructed. This can specify a proving system, an accumulation scheme, or a particular type of circuit to be constructed and proven for some implicit scheme. Options: {chonk, avm, ultra_honk} Environment: BB_SCHEME
-b,--bytecode_path - Path to ACIR bytecode generated by Noir.
-o,--output_path - Directory to write files or path of file to write, depending on subcommand.
--ivc_inputs_path - For IVC, path to input stack with bytecode and witnesses.
-v,--verbose,--verbose_logging - Output all logs to stderr.
-d,--debug_logging - Output debug logs to stderr.
-c,--crs_path - Path CRS directory. Missing CRS files will be retrieved from the internet.
--oracle_hash - The hash function used by the prover as random oracle standing in for a verifier's challenge generation. Poseidon2 is to be used for proofs that are intended to be verified inside of a circuit. Keccak is optimized for verification in an Ethereum smart contract, where Keccak has a privileged position due to the existence of an EVM precompile. Starknet is optimized for verification in a Starknet smart contract, which can be generated using the Garaga library. Options: {poseidon2, keccak, starknet}
--ipa_accumulation - Accumulate/Aggregate IPA (Inner Product Argument) claims
--verifier_type - Is a verification key for use a standalone single circuit verifier (e.g. a SNARK or folding recursive verifier) or is it for an ivc verifier? standalone produces a verification key is sufficient for verifying proofs about a single circuit (including the non-encapsulated use case where an IVC scheme is manually constructed via recursive UltraHonk proof verification). standalone_hiding is similar to standalone but is used for the last step where the structured trace is not utilized. ivc produces a verification key for verifying the stack of run though a dedicated ivc verifier class (currently the only option is the Chonk class) Options: {standalone, standalone_hiding, ivc}
--disable_zk - Use a non-zk version of --scheme. This flag is set to false by default.
bb verify
Verify a proof.

Usage:

bb verify [OPTIONS]

Options:

-h,--help - Print this help message and exit
-i,--public_inputs_path - Path to public inputs.
-p,--proof_path - Path to a proof.
-k,--vk_path - Path to a verification key.
-v,--verbose,--verbose_logging - Output all logs to stderr.
-d,--debug_logging - Output debug logs to stderr.
-s,--scheme - The type of proof to be constructed. This can specify a proving system, an accumulation scheme, or a particular type of circuit to be constructed and proven for some implicit scheme. Options: {chonk, avm, ultra_honk} Environment: BB_SCHEME
-c,--crs_path - Path CRS directory. Missing CRS files will be retrieved from the internet.
--oracle_hash - The hash function used by the prover as random oracle standing in for a verifier's challenge generation. Poseidon2 is to be used for proofs that are intended to be verified inside of a circuit. Keccak is optimized for verification in an Ethereum smart contract, where Keccak has a privileged position due to the existence of an EVM precompile. Starknet is optimized for verification in a Starknet smart contract, which can be generated using the Garaga library. Options: {poseidon2, keccak, starknet}
--disable_zk - Use a non-zk version of --scheme. This flag is set to false by default.
--ipa_accumulation - Accumulate/Aggregate IPA (Inner Product Argument) claims
bb write_solidity_verifier
Write a Solidity smart contract suitable for verifying proofs of circuit satisfiability for the circuit with verification key at vk_path. Not all hash types are implemented due to efficiency concerns.

Usage:

bb write_solidity_verifier [OPTIONS]

Options:

-h,--help - Print this help message and exit
-s,--scheme - The type of proof to be constructed. This can specify a proving system, an accumulation scheme, or a particular type of circuit to be constructed and proven for some implicit scheme. Options: {chonk, avm, ultra_honk} Environment: BB_SCHEME
-k,--vk_path - Path to a verification key.
-o,--output_path - Directory to write files or path of file to write, depending on subcommand.
-v,--verbose,--verbose_logging - Output all logs to stderr.
--disable_zk - Use a non-zk version of --scheme. This flag is set to false by default.
-c,--crs_path - Path CRS directory. Missing CRS files will be retrieved from the internet.
--optimized - Use the optimized Solidity verifier.
bb aztec_process
Process Aztec contract artifacts: transpile and generate verification keys for all private functions. If input is a directory (and no output specified), recursively processes all artifacts found in the directory.

Usage:

bb aztec_process [OPTIONS]

Options:

-h,--help - Print this help message and exit
-i,--input - Input artifact JSON path or directory to search (optional, defaults to current directory)
-o,--output - Output artifact JSON path (optional, same as input if not specified)
-f,--force - Force regeneration of verification keys
-v,--verbose,--verbose_logging - Output all logs to stderr.
-d,--debug_logging - Output debug logs to stderr.
bb msgpack
Msgpack API interface.

Usage:

bb msgpack [OPTIONS] [SUBCOMMAND]

Available Commands:

schema - Output a msgpack schema encoded as JSON to stdout.
curve_constants - Output curve constants as msgpack to stdout.
run - Execute msgpack API commands from stdin or file.
Options:

-h,--help - Print this help message and exit
Subcommands
bb msgpack schema
Output a msgpack schema encoded as JSON to stdout.

Usage:

bb msgpack schema [OPTIONS]

Options:

-h,--help - Print this help message and exit
-v,--verbose,--verbose_logging - Output all logs to stderr.
bb msgpack curve_constants
Output curve constants as msgpack to stdout.

Usage:

bb msgpack curve_constants [OPTIONS]

Options:

-h,--help - Print this help message and exit
-v,--verbose,--verbose_logging - Output all logs to stderr.
bb msgpack run
Execute msgpack API commands from stdin or file.

Usage:

bb msgpack run [OPTIONS]

Options:

-h,--help - Print this help message and exit
-v,--verbose,--verbose_logging - Output all logs to stderr.
-i,--input - Input file containing msgpack buffers (defaults to stdin)
--max-clients - Maximum concurrent clients for shared memory IPC server (default: 1)