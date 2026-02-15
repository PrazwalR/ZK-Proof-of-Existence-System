Getting Started
Foundry is a fast, portable, and modular toolkit for Ethereum development. After installing Foundry, you have access to four tools:

Tool	Purpose	Reference
forge	Build, test, debug, deploy, and verify smart contracts	Reference
cast	Interact with contracts, send transactions, and query chain data	Reference
anvil	Run a local Ethereum node with forking capabilities	Reference
chisel	Solidity REPL for rapid prototyping	Reference
Run any command with --help for detailed usage information.

See the CLI reference for every command and flag.

Quick start with Forge
Create and test a smart contract in under 30 seconds:

Create a new project
forge init hello_foundry
cd hello_foundry
Build contracts
forge build
Run tests
forge test
The generated project includes a Counter contract and test:

forge test
Compiling...
No files changed, compilation skipped
Ran 2 tests for test/Counter.t.sol:CounterTest
[PASS] testFuzz_SetNumber(uint256) (runs: 256, μ: 26879, ~: 29289)
[PASS] test_Increment() (gas: 28783)
Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 5.39ms (5.16ms CPU time)
Ran 1 test suite in 9.40ms (5.39ms CPU time): 2 tests passed, 0 failed, 0 skipped (2 total tests)

Deploy using a Forge script:

forge script script/Counter.s.sol
Local development with Anvil
Start a local Ethereum node:

anvil
This creates 10 pre-funded test accounts. Fork mainnet state for realistic testing:

anvil --fork-url https://eth.merkle.io
Interact with chains using Cast
Query blockchain data:

Check an address balance
cast balance vitalik.eth --ether --rpc-url https://eth.merkle.io
Get the latest block number
cast block-number --rpc-url https://eth.merkle.io
Call a contract function
cast call 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2 "totalSupply()" --rpc-url https://eth.merkle.io
Send transactions to your local Anvil node:

Send ETH using an Anvil test account
cast send 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 \
    --value 1ether \
    --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Prototype with Chisel
Start the Solidity REPL:

chisel
Write and execute Solidity interactively:

➜ uint256 x = 42;
➜ x * 2
Type: uint256
├ Hex: 0x54
└ Decimal: 84
 
➜ function double(uint256 n) public pure returns (uint256) { return n * 2; }
➜ double(21)
Type: uint256
└ Decimal: 42

Type !help to see available commands.

Next steps
Write your first tests
Test against mainnet state
Deploy and verify a contract
Track gas usage
Project Setup
Foundry projects are initialized with forge init and follow a standard layout that works out of the box.

Creating a project
Initialize a new project
forge init my_project
cd my_project
Or initialize in an existing directory
cd existing_directory
forge init
The --force flag initializes in non-empty directories:

forge init --force
Initialization options
Flag	Description
--template <url>	Use a custom template repository
--no-git	Skip git repository initialization
--no-commit	Skip initial commit
--shallow	Perform shallow clone for template
--offline	Skip dependency installation
--vscode	Generate VS Code settings
Create from template
forge init --template https://github.com/PaulRBerg/foundry-template my_project
Initialize without git
forge init --no-git my_project
What gets created
A new project includes:


my_project/
foundry.toml
Project configuration

src/
Counter.sol
Example contract

test/
Counter.t.sol
Example test

script/
Counter.s.sol
Example script

lib/

forge-std/
Standard library
Learn more
Project layout — Directory structure and conventions
Dependencies — Managing external libraries
Soldeer — Alternative package manager
Project Layout
Foundry uses a conventional directory structure. Configure paths in foundry.toml or use the defaults.

Default structure

project/
foundry.toml
Project configuration

src/
Contract source files

test/
Test files (*.t.sol)

script/
Script files (*.s.sol)

lib/
Git submodule dependencies

out/
Compilation artifacts

cache/
Compiler cache

broadcast/
Deployment logs
Source directories
Directory	Purpose	Config key
src/	Production contracts	src
test/	Test contracts	test
script/	Deployment scripts	script
lib/	Dependencies	libs
Customize in foundry.toml:

[profile.default]
src = "contracts"
test = "tests"
script = "scripts"
libs = ["lib", "node_modules"]

Output directories
Directory	Purpose	Config key
out/	Compiled artifacts (ABI, bytecode)	out
cache/	Compiler cache for incremental builds	cache_path
broadcast/	Transaction logs from script broadcasts	broadcast
Add out/, cache/, and broadcast/ to .gitignore. The default template does this automatically.

File naming conventions
Foundry identifies file types by suffix:

Suffix	Type	Example
.sol	Contract	Token.sol
.t.sol	Test	Token.t.sol
.s.sol	Script	Deploy.s.sol
Tests must also inherit from Test:

import {Test} from "forge-std/Test.sol";
 
contract TokenTest is Test {
    // ...
}

Scripts must inherit from Script:

import {Script} from "forge-std/Script.sol";
 
contract DeployScript is Script {
    // ...
}

Monorepo setup
For monorepos with multiple Foundry projects, use a root foundry.toml or per-project configs.

Share dependencies with a root lib/ directory:

[profile.default]
libs = ["lib", "../lib"]

Or use workspaces:


monorepo/
foundry.toml
Root config (optional)

lib/
Shared dependencies

packages/

token/
foundry.toml

src/

governance/
foundry.toml

src/
Remappings
Control import paths with remappings. Foundry auto-detects them from lib/, but you can customize:

[profile.default]
remappings = [
    "@openzeppelin/=lib/openzeppelin-contracts/",
    "@uniswap/=lib/v3-core/contracts/",
]

Or use a remappings.txt file:

@openzeppelin/=lib/openzeppelin-contracts/
@uniswap/=lib/v3-core/contracts/

See Dependencies for more on managing imports.

Dependencies
Foundry uses git submodules to manage dependencies. Libraries are stored in lib/ and imported via remappings.

Installing dependencies
Basic
Specific version
No commit
forge install OpenZeppelin/openzeppelin-contracts
The library is cloned to lib/openzeppelin-contracts/.

Using dependencies
Import installed libraries in your contracts:

import {ERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

Foundry automatically creates remappings for libraries in lib/. The remapping openzeppelin-contracts/ points to lib/openzeppelin-contracts/.

Remappings
Customize import paths with remappings in foundry.toml:

[profile.default]
remappings = [
    "@openzeppelin/=lib/openzeppelin-contracts/",
]

Now you can import with the prefix:

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

Generate remappings automatically:

forge remappings
forge-std/=lib/forge-std/src/
solady/=lib/solady/src/

Save to a file for IDE support:

forge remappings > remappings.txt

Updating dependencies
All
Specific
forge update
Removing dependencies
forge remove openzeppelin-contracts

This removes the submodule from lib/ and .gitmodules.

Resolving conflicts
When two dependencies require different versions of the same library, you'll encounter conflicts.

Diagnosing conflicts
Check dependency trees with:

forge tree
Example output
Resolution strategies
1. Use a compatible version

Find a version that works for both dependencies:

cd lib/conflicting-library
git checkout v2.0.0
cd ../..
git add lib/conflicting-library
git commit -m "Pin conflicting-library to v2.0.0"
2. Create separate remappings

If dependencies need different versions, install both under different names:

forge install org/library@v1.0.0 --no-commit
mv lib/library lib/library-v1
 
forge install org/library@v2.0.0 --no-commit
mv lib/library lib/library-v2
Add remappings:

[profile.default]
remappings = [
    "library-v1/=lib/library-v1/",
    "library-v2/=lib/library-v2/",
]

3. Patch the dependency

Fork and modify the dependency to use a compatible version:

In lib/problematic-dependency
git remote add fork https://github.com/you/fork
git fetch fork
git checkout fork/compatible-branch
Using npm packages
Foundry can use packages from node_modules:

[profile.default]
libs = ["lib", "node_modules"]

Install with your preferred package manager:

npm install @openzeppelin/contracts
Import directly:

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

npm packages may not be designed for Foundry. Prefer git submodules for Solidity libraries.

Hardhat compatibility
For projects migrating from Hardhat or using Hardhat-style imports:

[profile.default]
libs = ["lib", "node_modules"]
remappings = [
    "@openzeppelin/=node_modules/@openzeppelin/",
    "hardhat/=node_modules/hardhat/",
]

Soldeer
Soldeer is a Solidity-native package manager that provides an alternative to git submodules. It offers versioned dependencies, a package registry, and simpler dependency management.

Installation
Soldeer comes bundled with Foundry. Initialize it in your project:

forge soldeer init
This creates a soldeer.toml configuration file.

Installing packages
Install from registry
Install from git
forge soldeer install @openzeppelin-contracts~5.0.0
Packages are stored in dependencies/ by default.

Configuration
Configure Soldeer in soldeer.toml:

[soldeer]
remappings_generate = true
remappings_regenerate = false
remappings_version = true
remappings_prefix = "@"
remappings_location = "config"
 
[dependencies]
"@openzeppelin-contracts" = "5.0.0"
"@solmate" = "6.7.0"

Key options:

Option	Description
remappings_generate	Auto-generate remappings
remappings_prefix	Prefix for remappings (e.g., @)
remappings_location	Where to store remappings (config or txt)
Using packages
Import installed packages:

import {ERC20} from "@openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

When remappings_location = "config", remappings are added to foundry.toml. Otherwise, they go to remappings.txt.

Updating packages
Update all packages
Update a specific package
forge soldeer update
Publishing packages
Publish your own packages to the Soldeer registry:

Login to Soldeer
Login to your Soldeer account.

forge soldeer login
Prepare your package
Add metadata to soldeer.toml:

[package]
name = "my-library"
version = "1.0.0"
description = "My awesome Solidity library"

Publish
Publish your package.

forge soldeer push my-library~1.0.0
Git submodules vs Soldeer
Feature	Git submodules	Soldeer
Version pinning	Commit hash	Semantic versions
Registry	GitHub	Soldeer registry + git
Lock file	No	Yes (soldeer.lock)
Transitive deps	Manual	Automatic
IDE support	Via remappings	Via remappings
Use git submodules when:

You need a specific commit
The library isn't on the Soldeer registry
Your team is familiar with git submodules
Use Soldeer when:

You want semantic versioning
You need reproducible builds (lock file)
You prefer npm-style dependency management
Migrating from git submodules
Convert existing submodule dependencies to Soldeer:

Remove the submodule
forge remove openzeppelin-contracts
 
Install via Soldeer
forge soldeer install @openzeppelin-contracts~5.0.0
Update your imports to use the new remapping prefix:

Before
After
import {ERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

Installation
Foundry is installed using foundryup, the official installer and version manager.

Install foundryup
curl -L https://foundry.paradigm.xyz | bash
Restart your terminal
Or run source ~/.bashrc / source ~/.zshrc.

Install Foundry
foundryup
This installs the latest stable versions of forge, cast, anvil, and chisel.

Windows

Foundryup requires Git Bash or WSL. PowerShell and Command Prompt are not supported.

If installation fails, see Troubleshooting for common fixes.

Updating
Run foundryup anytime to update to the latest stable release:

foundryup
Installing specific versions
Install the nightly build
foundryup --install nightly
Install a specific version
foundryup --install 1.0.0

Install from a specific commit
foundryup --install abc1234
Install from a branch
foundryup --branch master
Installing forks
To install binaries from Tempo's fork:

foundryup -n tempo

Binary verification
Foundry binaries are attested using GitHub artifact attestations. When installing via foundryup, binary hashes are automatically verified against the GitHub attestation.

To manually verify an installed binary:

gh attestation verify --owner foundry-rs $(which forge)
Use foundryup --force to skip verification and force a fresh install.

Alternative installation methods
Precompiled binaries
Download binaries directly from the GitHub releases page. Extract and add them to your PATH.

Building from source
Requires Rust (latest stable). On Windows, also requires Visual Studio with the "Desktop Development With C++" workload.

Update Rust
rustup update stable
Install from GitHub
cargo install --git https://github.com/foundry-rs/foundry --profile release --locked forge cast chisel anvil
Or build from a local clone:

git clone https://github.com/foundry-rs/foundry.git
cd foundry
cargo install --path ./crates/forge --profile release --locked
cargo install --path ./crates/cast --profile release --locked
cargo install --path ./crates/anvil --profile release --locked
cargo install --path ./crates/chisel --profile release --locked
You can also use foundryup to build from source:

foundryup --branch master
foundryup --path /path/to/foundry
Docker
docker pull ghcr.io/foundry-rs/foundry:latest
Or build locally from the repository:

docker build -t foundry .
Some systems (including Apple Silicon) may have issues building the Docker image locally.

CI/CD
See the CI integration guide for GitHub Actions and other CI platforms.

Uninstalling
Foundry stores all files in ~/.foundry. To uninstall:

Back up keystores
The .foundry directory may contain keystores with private keys.

Remove the directory
rm -rf ~/.foundry
Remove PATH entry
Edit your shell config (.bashrc, .zshrc, etc.) and remove the Foundry PATH line.

Building contracts
Forge compiles all Solidity files in your src/ directory and outputs artifacts to out/.

forge build
Solc 0.8.33 finished in 1.07s
Compiler run successful!

Compiler versions
Forge auto-detects the required Solidity version from your contracts' pragma statements and downloads the compiler automatically.

To pin a specific version:

foundry.toml
[profile.default]
solc_version = "0.8.28"

Or use a version range:

foundry.toml
[profile.default]
solc = ">=0.8.0 <0.9.0"
Optimization
Enable the optimizer for production deployments:

foundry.toml
[profile.default]
optimizer = true
optimizer_runs = 200

Higher optimizer_runs values optimize for frequent function calls at the cost of larger bytecode. Use lower values (like 1) for contracts deployed once and rarely called.

For maximum optimization with via-IR:

foundry.toml
[profile.default]
optimizer = true
optimizer_runs = 200
via_ir = true

via-IR compilation is slower but can produce more optimized bytecode. Enable it only when needed.

Build profiles
Define separate profiles for development and production:

foundry.toml
[profile.default]
optimizer = false
 
[profile.production]
optimizer = true
optimizer_runs = 200
via_ir = true

Build with a specific profile:

FOUNDRY_PROFILE=production forge build
Inspecting artifacts
View contract ABI:

forge inspect Counter abi
View deployed bytecode:

forge inspect Counter bytecode
View storage layout:

forge inspect Counter storage-layout
View all available fields:

forge inspect Counter --help
Build cache
Forge caches compilation results. To force a full rebuild:

forge build --force
Clear the cache entirely:

forge clean
Watching for changes
Rebuild automatically when files change:

forge build --watch
Testing
Forge runs tests written in Solidity. Test files live in test/ and test functions are prefixed with test.

forge test
Compiling...
No files changed, compilation skipped
Ran 2 tests for test/Counter.t.sol:CounterTest
[PASS] testFuzz_SetNumber(uint256) (runs: 256, μ: 26879, ~: 29289)
[PASS] test_Increment() (gas: 28783)
Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 5.39ms (5.16ms CPU time)
Ran 1 test suite in 9.40ms (5.39ms CPU time): 2 tests passed, 0 failed, 0 skipped (2 total tests)

Writing tests
Create a test contract that inherits from Test:

test/Counter.t.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
 
import {Test} from "forge-std/Test.sol";
import {Counter} from "../src/Counter.sol";
 
contract CounterTest is Test {
    Counter counter;
 
    function setUp() public {
        counter = new Counter();
    }
 
    function test_Increment() public {
        counter.increment();
        assertEq(counter.number(), 1);
    }
 
    function test_SetNumber() public {
        counter.setNumber(42);
        assertEq(counter.number(), 42);
    }
}

Key conventions:

Test files end with .t.sol
Test contracts inherit from forge-std/Test.sol
Test functions start with test_ or test
setUp() runs before each test
Traces
Traces show a tree of all calls made during a test, helping you understand execution flow and debug failures.

Stack traces
When a test fails, use -vvv to see a stack trace showing exactly where the revert occurred. This is the most common way to debug test failures.

forge test -vvv
Solc 0.8.10 finished in 639.54ms
Compiler run successful!
Ran 1 test for test/FailingTest.t.sol:VaultTest
[FAIL: Unauthorized()] test_WithdrawAsNotOwner() (gas: 8418)
Traces:
  [8418] VaultTest::test_WithdrawAsNotOwner()
    ├─ [0] VM::prank(ECRecover: [0x0000000000000000000000000000000000000001])
    │   └─ ← [Return]
    ├─ [191] Vault::withdraw() [staticcall]
    │   └─ ← [Revert] Unauthorized()
    └─ ← [Revert] Unauthorized()
Backtrace:
  at Vault.withdraw
  at VaultTest.test_WithdrawAsNotOwner
Suite result: FAILED. 0 passed; 1 failed; 0 skipped; finished in 249.96µs (51.51µs CPU time)
Ran 1 test suite in 8.72ms (249.96µs CPU time): 0 tests passed, 1 failed, 0 skipped (1 total tests)

The trace shows the call hierarchy with the revert bubbling up, and the Backtrace pinpoints the exact location in your code.

Full traces
Use -vvvv to see traces for all tests, including passing ones. This helps you understand execution flow, verify call order, and check gas usage for individual operations.

forge test -vvvv
Compiling...
No files changed, compilation skipped
Ran 1 test for test/OwnerUpOnly.t.sol:OwnerUpOnlyTest
[PASS] test_IncrementAsOwner() (gas: 29808)
Traces:
  [29808] OwnerUpOnlyTest::test_IncrementAsOwner()
    ├─ [2407] OwnerUpOnly::count() [staticcall]
    │   └─ ← [Return] 0
    ├─ [20460] OwnerUpOnly::increment()
    │   └─ ← [Stop]
    ├─ [407] OwnerUpOnly::count() [staticcall]
    │   └─ ← [Return] 1
    └─ ← [Stop]
Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 288.76µs (54.88µs CPU time)
Ran 1 test suite in 7.73ms (288.76µs CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)

Reading traces
Gas costs appear in brackets: [29808]
Contract and function names are color-coded
Call types are annotated: [staticcall] for view/pure functions
Return values show what each call returned: ← [Return] 0 for a value, ← [Stop] for void
Indentation shows the call hierarchy—nested calls are indented under their parent
Verbosity levels
Control how much detail Forge outputs with -v flags:

Flag	Shows
(none)	Pass/fail summary only
-v	Test names
-vv	Logs emitted during tests
-vvv	Traces for failing tests
-vvvv	Traces for all tests, including setup
-vvvvv	Traces with storage changes
Use -vvv for debugging failures, -vvvv when you need to see successful test execution, and -vvvvv when tracking state changes.

Filtering tests
Run specific tests:

By name:

forge test --match-test test_DepositETH
Solc 0.8.10 finished in 684.88ms
Compiler run successful!
Ran 1 test for test/ComplicatedContract.t.sol:ComplicatedContractTest
[PASS] test_DepositETH() (gas: 107628)
Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 643.01µs (490.55µs CPU time)
Ran 1 test suite in 7.37ms (643.01µs CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)

By contract:

forge test --match-contract ComplicatedContractTest
Compiling...
No files changed, compilation skipped
Ran 2 tests for test/ComplicatedContract.t.sol:ComplicatedContractTest
[PASS] test_DepositERC20() (gas: 179207)
[PASS] test_DepositETH() (gas: 107628)
Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 1.40ms (1.69ms CPU time)
Ran 1 test suite in 8.41ms (1.40ms CPU time): 2 tests passed, 0 failed, 0 skipped (2 total tests)

By path:

forge test --match-path test/ContractB.t.sol
Solc 0.8.10 finished in 631.45ms
Compiler run successful!
Ran 1 test for test/ContractB.t.sol:ContractBTest
[PASS] testExample() (gas: 257)
Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 198.32µs (35.39µs CPU time)
Ran 1 test suite in 7.78ms (198.32µs CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)

Combine filters:

forge test --match-contract ComplicatedContractTest --match-test test_Deposit
Compiling...
No files changed, compilation skipped
Ran 2 tests for test/ComplicatedContract.t.sol:ComplicatedContractTest
[PASS] test_DepositERC20() (gas: 179207)
[PASS] test_DepositETH() (gas: 107628)
Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 1.29ms (1.75ms CPU time)
Ran 1 test suite in 8.26ms (1.29ms CPU time): 2 tests passed, 0 failed, 0 skipped (2 total tests)

Exclude tests with --no-match-* variants:

forge test --no-match-test test_Skip
Fuzz testing
Forge automatically fuzzes test functions that take parameters:

function testFuzz_SetNumber(uint256 x) public {
    counter.setNumber(x);
    assertEq(counter.number(), x);
}
Forge generates random inputs and runs the test multiple times (256 by default):

forge test
Solc 0.8.10 finished in 642.58ms
Compiler run successful!
Ran 1 test for test/Safe.t.sol:SafeTest
[PASS] testFuzz_Withdraw(uint96) (runs: 256, μ: 19608, ~: 19923)
Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 4.23ms (4.04ms CPU time)
Ran 1 test suite in 8.69ms (4.23ms CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)

Configure fuzzing:

foundry.toml
[fuzz]
runs = 1000
max_test_rejects = 65536
seed = "0x1234"

Constrain inputs with vm.assume():

function testFuzz_Transfer(uint256 amount) public {
    vm.assume(amount > 0 && amount <= 1000 ether);
    // Test with constrained amount
}

Or use bound() to clamp values:

function testFuzz_Transfer(uint256 amount) public {
    amount = bound(amount, 1, 1000 ether);
    // Test with bounded amount
}

Table testing
Foundry v1.3.0 comes with support for table testing, which enables the definition of a dataset (the "table") and the execution of a test function for each entry in that dataset. This approach helps ensure that certain combinations of inputs and conditions are tested.

In forge, table tests are functions named with table prefix that accepts datasets as one or multiple arguments:

function tableSumsTest(TestCase memory sums) public

function tableSumsTest(TestCase memory sums, bool enable) public

The datasets are defined as forge fixtures which can be:

storage arrays prefixed with fixture prefix and followed by dataset name
functions named with fixture prefix, followed by dataset name. Function should return an (fixed size or dynamic) array of values.
Single dataset
In following example, tableSumsTest test will be executed twice, with inputs from fixtureSums dataset: once with TestCase(1, 2, 3) and once with TestCase(4, 5, 9).

struct TestCase {
    uint256 a;
    uint256 b;
    uint256 expected;
}
 
function fixtureSums() public returns (TestCase[] memory) {
    TestCase[] memory entries = new TestCase[](2);
    entries[0] = TestCase(1, 2, 3);
    entries[1] = TestCase(4, 5, 9);
    return entries;
}
 
function tableSumsTest(TestCase memory sums) public pure {
    require(sums.a + sums.b == sums.expected, "wrong sum");
}

It is required to name the tableSumsTest's TestCase parameter sums as the parameter name is resolved against the available fixtures (fixtureSums). In this example, if the parameter is not named sums the following error is raised: [FAIL: Table test should have fixtures defined].

Multiple datasets
tableSwapTest test will be executed twice, by using values at the same position from fixtureWallet and fixtureSwap datasets.

struct Wallet {
    address owner;
    uint256 amount;
}
 
struct Swap {
    bool swap;
    uint256 amount;
}
 
Wallet[] public fixtureWallet;
Swap[] public fixtureSwap;
 
function setUp() public {
    // first table test input
    fixtureWallet.push(Wallet(address(11), 11));
    fixtureSwap.push(Swap(true, 11));
 
    // second table test input
    fixtureWallet.push(Wallet(address(12), 12));
    fixtureSwap.push(Swap(false, 12));
}
 
function tableSwapTest(Wallet memory wallet, Swap memory swap) public pure {
    require(
        (wallet.owner == address(11) && swap.swap) || (wallet.owner == address(12) && !swap.swap), "not allowed"
    );
}

The same naming requirement mentioned above is relevant here.

Testing reverts
Use vm.expectRevert() to test that a call reverts:

function test_RevertWhen_Unauthorized() public {
    vm.expectRevert("Not authorized");
    restricted.doSomething();
}

Match a custom error:

function test_RevertWhen_InsufficientBalance() public {
    vm.expectRevert(Token.InsufficientBalance.selector);
    token.transfer(address(0), 1000);
}

forge test --match-test "test_IncrementAsOwner|test_RevertWhen_CallerIsNotOwner" --match-path test/OwnerUpOnly.t.sol
Solc 0.8.10 finished in 680.39ms
Compiler run successful!
Ran 2 tests for test/OwnerUpOnly.t.sol:OwnerUpOnlyTest
[PASS] test_IncrementAsOwner() (gas: 29808)
[PASS] test_RevertWhen_CallerIsNotOwner() (gas: 8923)
Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 420.42µs (176.63µs CPU time)
Ran 1 test suite in 8.04ms (420.42µs CPU time): 2 tests passed, 0 failed, 0 skipped (2 total tests)

Testing events
Use vm.expectEmit() to verify events are emitted:

function test_EmitsTransfer() public {
    vm.expectEmit(true, true, false, true);
    emit Transfer(alice, bob, 100);
    
    token.transfer(bob, 100);
}

The four booleans specify which topics and data to check.

Forking
Test against live chain state:

forge test --fork-url https://ethereum.reth.rs/rpc
Or configure in foundry.toml:

foundry.toml
[profile.default]
eth_rpc_url = "https://ethereum.reth.rs/rpc"

Pin to a specific block for reproducible tests:

forge test --fork-url https://ethereum.reth.rs/rpc --fork-block-number 18000000
Cheatcodes
Forge provides cheatcodes via the vm object to manipulate the test environment:

// Set block timestamp
vm.warp(1700000000);
 
// Set block number
vm.roll(18000000);
 
// Impersonate an address
vm.prank(alice);
contract.doSomething();
 
// Give ETH to an address
vm.deal(alice, 100 ether);
 
// Modify storage
vm.store(address(token), bytes32(0), bytes32(uint256(1000)));

See the cheatcodes reference for the full list.

Watch mode
Re-run tests when files change:

forge test --watch
Scripting
Forge scripts are Solidity files that deploy contracts and execute transactions on-chain. They replace deployment scripts traditionally written in JavaScript.

Script structure
Scripts inherit from Script and implement a run() function:

script/Deploy.s.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
 
import {Script} from "forge-std/Script.sol";
import {Counter} from "../src/Counter.sol";
 
contract DeployScript is Script {
    function run() public {
        vm.startBroadcast();
        
        Counter counter = new Counter();
        counter.setNumber(42);
        
        vm.stopBroadcast();
    }
}

Key elements:

Inherit from forge-std/Script.sol
Script files end with .s.sol
Wrap deployment logic in vm.startBroadcast() / vm.stopBroadcast()
Running scripts
Simulate a deployment (no transactions sent):

forge script script/Deploy.s.sol
Broadcast transactions to a network:

forge script script/Deploy.s.sol --broadcast --rpc-url $RPC_URL
Providing a private key
Keystore (recommended)
Hardware wallet
Raw key (not recommended)
forge script script/Deploy.s.sol --broadcast --rpc-url $RPC_URL --account deployer
Broadcasting from a specific address
To broadcast from a specific address:

vm.startBroadcast(deployerAddress);

Or use the key at a specific index from a mnemonic:

uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
vm.startBroadcast(deployerPrivateKey);

Verifying deployed contracts
Verify on Etherscan during deployment:

forge script script/Deploy.s.sol \
    --broadcast \
    --rpc-url $RPC_URL \
    --verify \
    --etherscan-api-key $ETHERSCAN_API_KEY
Resuming failed broadcasts
If a broadcast fails partway through, resume from where it left off:

forge script script/Deploy.s.sol --broadcast --rpc-url $RPC_URL --resume
Multi-chain deployments
Deploy to multiple chains by running the script with different RPC URLs:

forge script script/Deploy.s.sol --broadcast --rpc-url $MAINNET_RPC
forge script script/Deploy.s.sol --broadcast --rpc-url $ARBITRUM_RPC
forge script script/Deploy.s.sol --broadcast --rpc-url $OPTIMISM_RPC
Reading deployment artifacts
Scripts write transaction receipts to broadcast/. Access deployed addresses in subsequent scripts:

function run() public {
    string memory json = vm.readFile("broadcast/Deploy.s.sol/1/run-latest.json");
    address counter = vm.parseJsonAddress(json, ".transactions[0].contractAddress");
}

Script cheatcodes
Scripts have access to all cheatcodes. Common ones for scripting:

// Read environment variables
string memory rpcUrl = vm.envString("RPC_URL");
uint256 privateKey = vm.envUint("PRIVATE_KEY");
 
// Read/write files
string memory config = vm.readFile("config.json");
vm.writeFile("output.txt", "deployed");
 
// Parse JSON
address addr = vm.parseJsonAddress(json, ".address");
 
// Console logging
console.log("Deploying to:", block.chainid);

Dry run
Test a script without sending transactions:

forge script script/Deploy.s.sol --rpc-url $RPC_URL
This simulates against the live chain state and shows what would happen.

Debugging
Forge provides detailed traces and an interactive debugger to understand contract execution.

Traces
Run tests with -vvvv to see full execution traces:

forge test -vvvv
Compiling...
No files changed, compilation skipped
Ran 1 test for test/OwnerUpOnly.t.sol:OwnerUpOnlyTest
[PASS] test_IncrementAsOwner() (gas: 29808)
Traces:
  [29808] OwnerUpOnlyTest::test_IncrementAsOwner()
    ├─ [2407] OwnerUpOnly::count() [staticcall]
    │   └─ ← [Return] 0
    ├─ [20460] OwnerUpOnly::increment()
    │   └─ ← [Stop]
    ├─ [407] OwnerUpOnly::count() [staticcall]
    │   └─ ← [Return] 1
    └─ ← [Stop]
Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 288.76µs (54.88µs CPU time)
Ran 1 test suite in 7.73ms (288.76µs CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)

The trace shows every call, its inputs, outputs, and gas usage.

Understanding trace output
Each line shows:

Gas used in brackets
Contract::function being called
Call type (staticcall, delegatecall, etc.)
Return value or revert reason
Indentation indicates call depth.

Tracing a failed transaction
Debug a transaction that failed on-chain:

cast run 0x<txhash> --rpc-url $RPC_URL
This replays the transaction and shows the execution trace.

Interactive debugger
Launch the debugger for a specific test:

forge test --debug test_Increment

The debugger shows:

Source code with current line highlighted
Stack contents
Memory contents
Storage changes
Call stack
Debugger commands
Key	Action
n	Step to next opcode
s	Step into call
o	Step out of call
g	Go to start
G	Go to end
c	Continue to next breakpoint
q	Quit
h	Show help
Debugging scripts
Debug a script:

forge script script/Deploy.s.sol --debug
Console logging
Add logs to your contracts for debugging:

import {console} from "forge-std/console.sol";
 
function transfer(address to, uint256 amount) public {
    console.log("Transfer from:", msg.sender);
    console.log("Transfer to:", to);
    console.log("Amount:", amount);
    // ...
}

View logs with -vv or higher:

forge test -vv
Labeling addresses
Make traces more readable by labeling addresses:

function setUp() public {
    alice = makeAddr("alice");
    bob = makeAddr("bob");
    
    vm.label(address(token), "Token");
    vm.label(address(pool), "Pool");
}

Traces will show Token::transfer() instead of 0x1234...::transfer().

Stack traces
When a test fails, use -vvv to see a stack trace showing exactly where the revert occurred:

forge test -vvv
Solc 0.8.10 finished in 639.54ms
Compiler run successful!
Ran 1 test for test/FailingTest.t.sol:VaultTest
[FAIL: Unauthorized()] test_WithdrawAsNotOwner() (gas: 8418)
Traces:
  [8418] VaultTest::test_WithdrawAsNotOwner()
    ├─ [0] VM::prank(ECRecover: [0x0000000000000000000000000000000000000001])
    │   └─ ← [Return]
    ├─ [191] Vault::withdraw() [staticcall]
    │   └─ ← [Revert] Unauthorized()
    └─ ← [Revert] Unauthorized()
Backtrace:
  at Vault.withdraw
  at VaultTest.test_WithdrawAsNotOwner
Suite result: FAILED. 0 passed; 1 failed; 0 skipped; finished in 249.96µs (51.51µs CPU time)
Ran 1 test suite in 8.72ms (249.96µs CPU time): 0 tests passed, 1 failed, 0 skipped (1 total tests)

The trace shows the call hierarchy with the revert bubbling up, and the Backtrace pinpoints the exact location in your code.

