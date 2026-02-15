Quick Start
Installation
The easiest way to develop with Noir is using Nargo the CLI tool. It provides you the ability to start new projects, compile, execute and test Noir programs from the terminal.

You can use noirup the installation script to quickly install and update Nargo:

curl -L https://raw.githubusercontent.com/noir-lang/noirup/refs/heads/main/install | bash
noirup

Once installed, you can set up shell completions for the nargo command.

Nargo
Nargo provides the ability to initiate and execute Noir projects. Let's initialize the traditional hello_world:

nargo new hello_world

Two files will be created.

src/main.nr contains a simple boilerplate circuit
Nargo.toml contains environmental options, such as name, author, dependencies, and others.
Glancing at main.nr , we can see that inputs in Noir are private by default, but can be labeled public using the keyword pub. This means that we will assert that we know a value x which is different from y without revealing x:

fn main(x : Field, y : pub Field) {
    assert(x != y);
}

To learn more about private and public values, check the Data Types section.

Compiling and executing
We can now use nargo to generate a Prover.toml file, where our input values will be specified:

cd hello_world
nargo check

Let's feed some valid values into this file:

x = "1"
y = "2"

We're now ready to compile and execute our Noir program. By default the nargo execute command will do both, and generate the witness that we need to feed to our proving backend:

nargo execute

The witness corresponding to this execution will then be written to the file ./target/witness-name.gz.

The command also automatically compiles your Noir program if it was not already / was edited, which you may notice the compiled artifacts being written to the file ./target/hello_world.json.

With circuit compiled and witness generated, we're ready to prove.

Next Steps - Proving backend
Noir is a high-level programming language for zero-knowledge proofs, which compiles your code into ACIR and generates witnesses for further proof generations and verifications. In order to prove and verify your Noir programs, you'll need a proving backend.

Proving backends provide you multiple tools. The most common backend for Noir is Barretenberg. It allows you to:

Generate proofs and verify them
Prove the verification of another proof (recursive aggregation)
Generate a solidity contract that verifies your proof non-interactively
Check and compare circuit size
Read Barretenberg's Getting Started guide to install and start using Noir with Barretenberg.

Visit Awesome Noir for a comprehensive list of proving backends that work with Noir.

Project Breakdown
This section breaks down our hello world program from the previous section.

Anatomy of a Nargo Project
Upon creating a new project with nargo new and building the in/output files with nargo check commands, you would get a minimal Nargo project of the following structure:

- src
- Prover.toml
- Nargo.toml

The source directory src holds the source code for your Noir program. By default only a main.nr file will be generated within it.

Prover.toml
Prover.toml is used for specifying the input values for executing and proving the program. You can specify toml files with different names by using the --prover-name or -p flags, see the Prover section below. Optionally you may specify expected output values for prove-time checking as well.

Nargo.toml
Nargo.toml contains the environmental options of your project. It contains a "package" section and a "dependencies" section.

Example Nargo.toml:

[package]
name = "noir_starter"
type = "bin"
authors = ["Alice"]
compiler_version = "0.9.0"
description = "Getting started with Noir"
entry = "circuit/main.nr"
license = "MIT"

[dependencies]
ecrecover = {tag = "v0.9.0", git = "https://github.com/colinnielsen/ecrecover-noir.git"}

Nargo.toml for a workspace will look a bit different. For example:

[workspace]
members = ["crates/a", "crates/b"]
default-member = "crates/a"

Package section
The package section defines a number of fields including:

name (required) - the name of the package
type (required) - can be "bin", "lib", or "contract" to specify whether its a binary, library or Aztec contract
authors (optional) - authors of the project
compiler_version - specifies the version of the compiler to use. This is enforced by the compiler and follow's Rust's versioning, so a compiler_version = 0.18.0 will enforce Nargo version 0.18.0, compiler_version = ^0.18.0 will enforce anything above 0.18.0 but below 0.19.0, etc. For more information, see how Rust handles these operators
compiler_unstable_features (optional) - A list of unstable features required by this package to compile.
description (optional)
entry (optional) - a relative filepath to use as the entry point into your package (overrides the default of src/lib.nr or src/main.nr)
backend (optional)
license (optional)
expression_width (optional) - Sets the default backend expression width. This field will override the default backend expression width specified by the Noir compiler (currently set to width 4).
Dependencies section
This is where you will specify any dependencies for your project. See the Dependencies page for more info.

./proofs/ and ./contract/ directories will not be immediately visible until you create a proof or verifier contract respectively.

main.nr
The main.nr file contains a main method, this method is the entry point into your Noir program.

In our sample program, main.nr looks like this:

fn main(x : Field, y : Field) {
    assert(x != y);
}

The parameters x and y can be seen as the API for the program and must be supplied by the prover. Since neither x nor y is marked as public, the verifier does not supply any inputs, when verifying the proof.

The prover supplies the values for x and y in the Prover.toml file.

As for the program body, assert ensures that the condition to be satisfied (e.g. x != y) is constrained by the proof of the execution of said program (i.e. if the condition was not met, the verifier would reject the proof as an invalid proof).

Prover.toml
The Prover.toml file is a file which the prover uses to supply the inputs to the Noir program (both private and public).

In our hello world program the Prover.toml file looks like this:

x = "1"
y = "2"

When the command nargo execute is executed, nargo will execute the Noir program using the inputs specified in Prover.toml, aborting if it finds that these do not satisfy the constraints defined by main. In this example, x and y must satisfy the inequality constraint assert(x != y).

If an output name is specified such as nargo execute foo, the witness generated by this execution will be written to ./target/foo.gz. This can then be used to generate a proof of the execution.

Arrays of Structs
The following code shows how to pass an array of structs to a Noir program to generate a proof.

// main.nr
struct Foo {
    bar: Field,
    baz: Field,
}

fn main(foos: [Foo; 3]) -> pub Field {
    foos[2].bar + foos[2].baz
}

Prover.toml:

[[foos]] # foos[0]
bar = 0
baz = 0

[[foos]] # foos[1]
bar = 0
baz = 0

[[foos]] # foos[2]
bar = 1
baz = 2

Custom toml files
You can specify a toml file with a different name to use for execution by using the --prover-name or -p flags.

This command looks for proof inputs in the default Prover.toml and generates the witness and saves it at ./target/foo.gz:

nargo execute foo

This command looks for proof inputs in the custom OtherProver.toml and generates the witness and saves it at ./target/bar.gz:

nargo execute -p OtherProver bar

Now that you understand the concepts, you'll probably want some editor feedback while you are writing more complex code.


Standalone Noir Installation
Noirup is the endorsed method for installing Nargo, streamlining the process of fetching binaries or compiling from source. It supports a range of options to cater to your specific needs, from nightly builds and specific versions to compiling from various sources.

Installing Noirup
First, ensure you have noirup installed:

curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash

Fetching Binaries
With noirup, you can easily switch between different Nargo versions, including nightly builds:

Nightly Version: Install the latest nightly build.

noirup --version nightly

Specific Version: Install a specific version of Nargo.

noirup --version <version>

Compiling from Source
noirup also enables compiling Nargo from various sources:

From a Specific Branch: Install from the latest commit on a branch.

noirup --branch <branch-name>

From a Fork: Install from the main branch of a fork.

noirup --repo <username/repo>

From a Specific Branch in a Fork: Install from a specific branch in a fork.

noirup --repo <username/repo> --branch <branch-name>

From a Specific Pull Request: Install from a specific PR.

noirup --pr <pr-number>

From a Specific Commit: Install from a specific commit.

noirup -C <commit-hash>

From Local Source: Compile and install from a local directory.

noirup --path ./path/to/local/source

Installation on Windows
The default backend for Noir (Barretenberg) doesn't provide Windows binaries at this time. For that reason, Noir cannot be installed natively. However, it is available by using Windows Subsystem for Linux (WSL).

Step 1: Follow the instructions here to install and run WSL.

step 2: Follow the Noirup instructions.

Setting up shell completions
Once nargo is installed, you can set up shell completions for it.

Uninstalling Nargo
If you installed Nargo with noirup, you can uninstall Nargo by removing the files in ~/.nargo, ~/nargo, and ~/noir_cache. This ensures that all installed binaries, configurations, and cache related to Nargo are fully removed from your system.

rm -r ~/.nargo
rm -r ~/nargo
rm -r ~/noir_cache

Fields
The field type corresponds to the native field type of the proving backend.

The size of a Noir field depends on the elliptic curve's finite field for the proving backend adopted. For example, a field would be a 254-bit integer when paired with the default backend that spans the Grumpkin curve.

Fields support integer arithmetic:

fn main(x : Field, y : Field)  {
    let z = x + y;
}

x, y and z are all private fields in this example. Using the let keyword we defined a new private value z constrained to be equal to x + y.

If proving efficiency is of priority, fields should be used as a default for solving problems. Smaller integer types (e.g. u64) incur extra range constraints.

Methods
After declaring a Field, you can use these common methods on it:

to_le_bits
Transforms the field into an array of bits, Little Endian.

to_le_bits
pub fn to_le_bits<let N: u32>(self: Self) -> [u1; N] {


Source code: noir_stdlib/src/field/mod.nr#L29-L31

example:

to_le_bits_example
fn test_to_le_bits() {
        let field = 2;
        let bits: [u1; 8] = field.to_le_bits();
        assert_eq(bits, [0, 1, 0, 0, 0, 0, 0, 0]);
    }


Source code: noir_stdlib/src/field/mod.nr#L356-L362

to_be_bits
Transforms the field into an array of bits, Big Endian.

to_be_bits
pub fn to_be_bits<let N: u32>(self: Self) -> [u1; N] {


Source code: noir_stdlib/src/field/mod.nr#L61-L63

example:

to_be_bits_example
fn test_to_be_bits() {
        let field = 2;
        let bits: [u1; 8] = field.to_be_bits();
        assert_eq(bits, [0, 0, 0, 0, 0, 0, 1, 0]);
    }


Source code: noir_stdlib/src/field/mod.nr#L347-L353

to_le_bytes
Transforms into an array of bytes, Little Endian

to_le_bytes
pub fn to_le_bytes<let N: u32>(self: Self) -> [u8; N] {


Source code: noir_stdlib/src/field/mod.nr#L93-L95

example:

to_le_bytes_example
fn test_to_le_bytes() {
        let field = 2;
        let bytes: [u8; 8] = field.to_le_bytes();
        assert_eq(bytes, [2, 0, 0, 0, 0, 0, 0, 0]);
        assert_eq(Field::from_le_bytes::<8>(bytes), field);
    }


Source code: noir_stdlib/src/field/mod.nr#L375-L382

to_be_bytes
Transforms into an array of bytes, Big Endian

to_be_bytes
pub fn to_be_bytes<let N: u32>(self: Self) -> [u8; N] {


Source code: noir_stdlib/src/field/mod.nr#L130-L132

example:

to_be_bytes_example
fn test_to_be_bytes() {
        let field = 2;
        let bytes: [u8; 8] = field.to_be_bytes();
        assert_eq(bytes, [0, 0, 0, 0, 0, 0, 0, 2]);
        assert_eq(Field::from_be_bytes::<8>(bytes), field);
    }


Source code: noir_stdlib/src/field/mod.nr#L365-L372

pow_32
Returns the value to the power of the specified exponent

fn pow_32(self, exponent: Field) -> Field

example:

fn main() {
    let field = 2
    let pow = field.pow_32(4);
    assert(pow == 16);
}

assert_max_bit_size
Adds a constraint to specify that the field can be represented with bit_size number of bits

assert_max_bit_size
pub fn assert_max_bit_size<let BIT_SIZE: u32>(self) {


Source code: noir_stdlib/src/field/mod.nr#L10-L12

example:

fn main() {
    let field = 2
    field.assert_max_bit_size::<32>();
}

sgn0
Parity of (prime) Field element, i.e. sgn0(x mod p) = 0 if x ∈ {0, ..., p-1} is even, otherwise sgn0(x mod p) = 1.

fn sgn0(self) -> u1

lt
Returns true if the field is less than the other field

pub fn lt(self, another: Field) -> bool
Integers
An integer type is a range constrained field type. The Noir frontend supports both unsigned and signed integer types. The allowed sizes are 1, 8, 16, 32, 64 and 128 bits. (currently only unsigned integers for 128 bits)

info
When an integer is defined in Noir without a specific type, it will default to Field unless another type is expected at its position.

The one exception is for loop indices which default to u32 since comparisons on Fields are not possible.

You can add a type suffix such as u32 or Field to the end of an integer literal to explicitly specify the type.

Unsigned Integers
An unsigned integer type is specified first with the letter u (indicating its unsigned nature) followed by its bit size (e.g. 8):

fn main() {
    let x: u8 = 1;
    let y = 1_u8;
    let z = x + y;
    assert (z == 2);
}

The bit size determines the maximum value the integer type can store. For example, a u8 variable can store a value in the range of 0 to 255 (i.e. 
2
8
−
1
).

Signed Integers
A signed integer type is specified first with the letter i (which stands for integer) followed by its bit size (e.g. 8):

fn main() {
    let x: i8 = -1;
    let y = -1i8;
    let z = x + y;
    assert (z == -2);
}

The bit size determines the maximum and minimum range of value the integer type can store. For example, an i8 variable can store a value in the range of -128 to 127 (i.e. 
−
2
7
 to 
2
7
−
1
).

fn main(x: i16, y: i16) {
    // modulo
    let c = x % y;
    let c = x % -13;
}

Modulo operation is defined for negative integers thanks to integer division, so that the equality x = (x/y)*y + (x%y) holds.

Overflows
Computations that exceed the type boundaries will result in overflow errors. This happens with both signed and unsigned integers. For example, attempting to prove:

fn main(x: u8, y: u8) -> pub u8 {
    let z = x + y;
    z
}

With:

x = "255"
y = "1"

Would result in:

$ nargo execute
error: Assertion failed: 'attempt to add with overflow'
┌─ ~/src/main.nr:9:13
│
│     let z = x + y;
│             -----
│
= Call stack:
  ...

A similar error would happen with signed integers:

fn main() -> i8 {
    let x: i8 = -118;
    let y = -11;
    let z = x + y;
    z
}

Note that if a computation ends up being unused the compiler might remove it and it won't end up producing an overflow:

fn main() {
    // "255 + 1" would overflow, but `z` is unused so no computation happens
    let z: u8 = 255 + 1;
}

Wrapping methods
Although integer overflow is expected to error, some use-cases rely on wrapping. For these use-cases, the standard library provides wrapping variants of certain common operations via Wrapping traits in std::ops

fn wrapping_add(self, y: Self) -> Self;
fn wrapping_sub(self, y: Self) -> Self;
fn wrapping_mul(self, y: Self) -> Self;

Example of how it is used:

use std::ops::WrappingAdd
fn main(x: u8, y: u8) -> pub u8 {
    x.wrapping_add(y)
}
Booleans
The bool type in Noir has two possible values: true and false:

fn main() {
    let t = true;
    let f: bool = false;
}

The boolean type is most commonly used in conditionals like if expressions and assert statements. More about conditionals is covered in the Control Flow and Assert Function sections.
Strings
The string type is a fixed length value defined with str<N>.

You can use strings in assert() functions or print them with println(). See more about Logging.


fn main(message : pub str<11>, hex_as_string : str<4>) {
    println(message);
    assert(message == "hello world");
    assert(hex_as_string == "0x41");
}

You can convert a str<N> to a byte array by calling as_bytes() or a vector by calling as_bytes_vec().

fn main() {
    let message = "hello world";
    let message_bytes = message.as_bytes();
    let mut message_vec = message.as_bytes_vec();
    assert(message_bytes.len() == 11);
    assert(message_bytes[0] == 104);
    assert(message_bytes[0] == message_vec.get(0));
}

Escape characters
You can use escape characters for your strings:

Escape Sequence	Description
\r	Carriage Return
\n	Newline
\t	Tab
\0	Null Character
\"	Double Quote
\\	Backslash
Example:

let s = "Hello \"world" // prints "Hello "world"
let s = "hey \tyou"; // prints "hey   you"

Raw strings
A raw string begins with the letter r and is optionally delimited by a number of hashes #.

Escape characters are not processed within raw strings. All contents are interpreted literally.

Example:

let s = r"Hello world";
let s = r#"Simon says "hello world""#;

// Any number of hashes may be used (>= 1) as long as the string also terminates with the same number of hashes
let s = r#####"One "#, Two "##, Three "###, Four "####, Five will end the string."#####; 


Format strings
A format string begins with the letter f and allows inserting the value of local and global variables in it.

Example:

let four = 2 + 2;
let s = f"Two plus two is: {four}";
println(s);

The output of the above program is:

Two plus two is: 4

To insert the value of a local or global variable, put it inside {...} in the string.

If you need to write the { or } characters, use {{ and }} respectively:

let four = 2 + 2;

// Prints "This is not expanded: {four}"
println(f"This is not expanded: {{four}}");

More complex expressions are not allowed inside {...}:

let s = f"Two plus two is: {2 + 2}" // Error: invalid format string
Arrays
An array is one way of grouping together values into one compound type. Array types can be inferred or explicitly specified via the syntax [<Type>; <Size>]:

fn main(x : u64, y : u64) {
    let my_arr = [x, y];
    let your_arr: [u64; 2] = [x, y];
}

Here, both my_arr and your_arr are instantiated as an array containing two Field elements.

Array elements can be accessed using indexing:

fn main() {
    let a = [1, 2, 3, 4, 5];

    let first = a[0];
    let second = a[1];
}

All elements in an array must be of the same type (i.e. homogeneous). That is, an array cannot group a Field value and a u8 value together for example.

You can write mutable arrays, like:

fn main() {
    let mut arr = [1, 2, 3, 4, 5];
    assert(arr[0] == 1);

    arr[0] = 42;
    assert(arr[0] == 42);
}

You can instantiate a new array of a fixed size with the same value repeated for each element. The following example instantiates an array of length 32 where each element is of type Field and has the value 0.

let array: [Field; 32] = [0; 32];

Like in Rust, arrays in Noir are a fixed size. However, if you wish to convert an array to a vector, you can just call as_vector on your array:

let array: [Field; 32] = [0; 32];
let sl = array.as_vector()

You can define multidimensional arrays:

let array : [[Field; 2]; 2];
let element = array[0][0];

However, multidimensional vectors are not supported. For example, the following code will error at compile time:

let vector : [[Field]] = &[];

Dynamic Indexing
Using constant indices of arrays will often be more efficient at runtime in constrained code. Indexing an array with non-constant indices (indices derived from the inputs to the program, or returned from unconstrained functions) is also called "dynamic indexing" and incurs a slight runtime cost:

fn main(x: u32) {
    let array = [1, 2, 3, 4];

    // This is a constant index, after inlining the compiler sees that this
    // will always be `array[2]`
    let _a = array[double(1)];

    // This is a non-constant index, there is no way to know which u32 value
    // will be used as an index here
    let _b = array[double(x)];
}

fn double(y: u32) -> u32 {
    y * 2
}

There is another restriction with dynamic indices: they cannot be used on arrays with elements which contain a reference type:

fn main(x: u32) {
    let array = [&mut 1, &mut 2, &mut 3, &mut 4];

    // error! Only constant indices may be used here since `array` contains references internally!
    let _c = array[x];
}


Types
You can create arrays of primitive types or structs. There is not yet support for nested arrays (arrays of arrays) or arrays of structs that contain arrays.

Methods
For convenience, the STD provides some ready-to-use, common methods for arrays. Each of these functions are located within the generic impl impl<T, N> [T; N] {. So anywhere self appears, it refers to the variable self: [T; N].

len
Returns the length of an array

fn len(self) -> Field

example

fn main() {
    let array = [42, 42];
    assert(array.len() == 2);
}

sort
Returns a new sorted array. The original array remains untouched. Notice that this function will only work for arrays of fields or integers, not for any arbitrary type. This is because the sorting logic it uses internally is optimized specifically for these values. If you need a sort function to sort any type, you should use the function sort_via described below.

fn sort(self) -> [T; N]

example

fn main() {
    let arr = [42, 32];
    let sorted = arr.sort();
    assert(sorted == [32, 42]);
}

sort_via
Sorts the array with a custom comparison function. The ordering function must return true if the first argument should be sorted to be before the second argument or is equal to the second argument.

Using this method with an operator like < that does not return true for equal values will result in an assertion failure for arrays with equal elements.

fn sort_via(self, ordering: fn(T, T) -> bool) -> [T; N]

example

fn main() {
    let arr = [42, 32]
    let sorted_ascending = arr.sort_via(|a, b| a <= b);
    assert(sorted_ascending == [32, 42]); // verifies

    let sorted_descending = arr.sort_via(|a, b| a >= b);
    assert(sorted_descending == [32, 42]); // does not verify
}

map
Applies a function to each element of the array, returning a new array containing the mapped elements.

fn map<U>(self, f: fn(T) -> U) -> [U; N]

example

let a = [1, 2, 3];
let b = a.map(|a| a * 2); // b is now [2, 4, 6]

mapi
Applies a function to each element of the array, along with its index in the array, returning a new array containing the mapped elements.

fn mapi<U, Env>(self, f: fn[Env](u32, T) -> U) -> [U; N]

example

let a = [1, 2, 3];
let b = a.mapi(|i, a| i + a * 2); // b is now [2, 5, 8]

for_each
Applies a function to each element of the array.

fn for_each<Env>(self, f: fn[Env](T) -> ())

example

let a = [1, 2, 3];
a.for_each(|x| {
    println(f"{x}");
});
// prints:
// 1
// 2
// 3

for_eachi
Applies a function to each element of the array, along with its index in the array.

fn for_eachi<Env>(self, f: fn[Env](u32, T) -> ())

example

let a = [1, 2, 3];
a.for_eachi(|i, x| {
    println(f"{i}, {x}");
});
// prints:
// 0, 1
// 1, 2
// 2, 3

fold
Applies a function to each element of the array, returning the final accumulated value. The first parameter is the initial value.

fn fold<U>(self, mut accumulator: U, f: fn(U, T) -> U) -> U

This is a left fold, so the given function will be applied to the accumulator and first element of the array, then the second, and so on. For a given call the expected result would be equivalent to:

let a1 = [1];
let a2 = [1, 2];
let a3 = [1, 2, 3];

let f = |a, b| a - b;
a1.fold(10, f)  //=> f(10, 1)
a2.fold(10, f)  //=> f(f(10, 1), 2)
a3.fold(10, f)  //=> f(f(f(10, 1), 2), 3)

example:


fn main() {
    let arr = [2, 2, 2, 2, 2];
    let folded = arr.fold(0, |a, b| a + b);
    assert(folded == 10);
}


reduce
Same as fold, but uses the first element as the starting element.

Requires self to be non-empty.

fn reduce(self, f: fn(T, T) -> T) -> T

example:

fn main() {
    let arr = [2, 2, 2, 2, 2];
    let reduced = arr.reduce(|a, b| a + b);
    assert(reduced == 10);
}

all
Returns true if all the elements satisfy the given predicate

fn all(self, predicate: fn(T) -> bool) -> bool

example:

fn main() {
    let arr = [2, 2, 2, 2, 2];
    let all = arr.all(|a| a == 2);
    assert(all);
}

any
Returns true if any of the elements satisfy the given predicate

fn any(self, predicate: fn(T) -> bool) -> bool

example:

fn main() {
    let arr = [2, 2, 2, 2, 5];
    let any = arr.any(|a| a == 5);
    assert(any);
}

concat
Concatenates this array with another array.

fn concat<let M: u32>(self, array2: [T; M]) -> [T; N + M]

fn main() {
    let arr1 = [1, 2, 3, 4];
    let arr2 = [6, 7, 8, 9, 10, 11];
    let concatenated_arr = arr1.concat(arr2);
    assert(concatenated_arr == [1, 2, 3, 4, 6, 7, 8, 9, 10, 11]);
}

as_str_unchecked
Converts a byte array of type [u8; N] to a string. Note that this performs no UTF-8 validation - the given array is interpreted as-is as a string.

impl<let N: u32> [u8; N] {
    pub fn as_str_unchecked(self) -> str<N>
}

example:

fn main() {
    let hi = [104, 105].as_str_unchecked();
    assert_eq(hi, "hi");
}
Vectors
Experimental Feature
This feature is experimental. The documentation may be incomplete or out of date, which means it could change in future versions, potentially causing unexpected behavior or not working as expected.

Contributions Welcome: If you notice any inaccuracies or potential improvements, please consider contributing. Visit our GitHub repository to make your contributions: Contribute Here.

A vector is a dynamically-sized view into a sequence of elements. They can be resized at runtime, but because they don't own the data, they cannot be returned from a circuit. You can treat vectors as arrays without a constrained size.

fn main() -> pub u32 {
    let mut vector: [Field] = &[0; 2];

    let mut new_vector = vector.push_back(6);
    new_vector.len()
}

To write a vector literal, use a preceding ampersand as in: &[0; 2] or &[1, 2, 3].

It is important to note that vectors are not references to arrays. In Noir, &[..] is more similar to an immutable, growable vector.

View the corresponding test file here.

Methods
For convenience, the STD provides some ready-to-use, common methods for vectors:

push_back
Pushes a new element to the end of the vector, returning a new vector with a length one greater than the original unmodified vector.

fn push_back<T>(_self: [T], _elem: T) -> [T]

example:

fn main() -> pub Field {
    let mut vector: [Field] = &[0; 2];

    let mut new_vector = vector.push_back(6);
    new_vector.len()
}

View the corresponding test file here.

push_front
Returns a new vector with the specified element inserted at index 0. The existing elements indexes are incremented by 1.

fn push_front(_self: Self, _elem: T) -> Self

Example:

let mut new_vector: [Field] = &[];
new_vector = new_vector.push_front(20);
assert(new_vector[0] == 20); // returns true

View the corresponding test file here.

pop_front
Returns a tuple of two items, the first element of the vector and the rest of the vector.

fn pop_front(_self: Self) -> (T, Self)

Example:

let (first_elem, rest_of_vector) = vector.pop_front();

View the corresponding test file here.

pop_back
Returns a tuple of two items, the beginning of the vector with the last element omitted and the last element.

fn pop_back(_self: Self) -> (Self, T)

Example:

let (popped_vector, last_elem) = vector.pop_back();

View the corresponding test file here.

append
Loops over a vector and adds it to the end of another.

fn append(mut self, other: Self) -> Self

Example:

let append = &[1, 2].append(&[3, 4, 5]);

insert
Inserts an element at a specified index and shifts all following elements by 1.

fn insert(_self: Self, _index: u32, _elem: T) -> Self

Example:

new_vector = rest_of_vector.insert(2, 100);
assert(new_vector[2] == 100);

View the corresponding test file here.

remove
Remove an element at a specified index, shifting all elements after it to the left, returning the altered vector and the removed element.

fn remove(_self: Self, _index: u32) -> (Self, T)

Example:

let (remove_vector, removed_elem) = vector.remove(3);

len
Returns the length of a vector

fn len(self) -> Field

Example:

fn main() {
    let vector = &[42, 42];
    assert(vector.len() == 2);
}

as_array
Converts this vector into an array.

Make sure to specify the size of the resulting array. Panics if the resulting array length is different than the vector's length.

fn as_array<let N: u32>(self) -> [T; N]

Example:

fn main() {
    let vector = &[5, 6];

    // Always specify the length of the resulting array!
    let array: [Field; 2] = vector.as_array();

    assert(array[0] == vector[0]);
    assert(array[1] == vector[1]);
}

map
Applies a function to each element of the vector, returning a new vector containing the mapped elements.

fn map<U, Env>(self, f: fn[Env](T) -> U) -> [U]

example

let a = &[1, 2, 3];
let b = a.map(|a| a * 2); // b is now &[2, 4, 6]

mapi
Applies a function to each element of the vector, along with its index in the vector, returning a new vector containing the mapped elements.

fn mapi<U, Env>(self, f: fn[Env](u32, T) -> U) -> [U]

example

let a = &[1, 2, 3];
let b = a.mapi(|i, a| i + a * 2); // b is now &[2, 5, 8]

for_each
Applies a function to each element of the vector.

fn for_each<Env>(self, f: fn[Env](T) -> ())

example

let a = &[1, 2, 3];
a.for_each(|x| {
    println(f"{x}");
});
// prints:
// 1
// 2
// 3

for_eachi
Applies a function to each element of the vector, along with its index in the vector.

fn for_eachi<Env>(self, f: fn[Env](u32, T) -> ())

example

let a = &[1, 2, 3];
a.for_eachi(|i, x| {
    println(f"{i}, {x}");
});
// prints:
// 0, 1
// 1, 2
// 2, 3

fold
Applies a function to each element of the vector, returning the final accumulated value. The first parameter is the initial value.

fn fold<U, Env>(self, mut accumulator: U, f: fn[Env](U, T) -> U) -> U

This is a left fold, so the given function will be applied to the accumulator and first element of the vector, then the second, and so on. For a given call the expected result would be equivalent to:

let a1 = &[1];
let a2 = &[1, 2];
let a3 = &[1, 2, 3];

let f = |a, b| a - b;
a1.fold(10, f)  //=> f(10, 1)
a2.fold(10, f)  //=> f(f(10, 1), 2)
a3.fold(10, f)  //=> f(f(f(10, 1), 2), 3)

example:


fn main() {
    let vector = &[2, 2, 2, 2, 2];
    let folded = vector.fold(0, |a, b| a + b);
    assert(folded == 10);
}


reduce
Same as fold, but uses the first element as the starting element.

fn reduce<Env>(self, f: fn[Env](T, T) -> T) -> T

example:

fn main() {
    let vector = &[2, 2, 2, 2, 2];
    let reduced = vector.reduce(|a, b| a + b);
    assert(reduced == 10);
}

filter
Returns a new vector containing only elements for which the given predicate returns true.

fn filter<Env>(self, f: fn[Env](T) -> bool) -> Self

example:

fn main() {
    let vector = &[1, 2, 3, 4, 5];
    let odds = vector.filter(|x| x % 2 == 1);
    assert_eq(odds, &[1, 3, 5]);
}

join
Flatten each element in the vector into one value, separated by separator.

Note that although vectors implement Append, join cannot be used on vector elements since nested vectors are prohibited.

fn join(self, separator: T) -> T where T: Append

example:

struct Accumulator {
    total: Field,
}

// "Append" two accumulators by adding them
impl Append for Accumulator {
    fn empty() -> Self {
        Self { total: 0 }
    }

    fn append(self, other: Self) -> Self {
        Self { total: self.total + other.total }
    }
}

fn main() {
    let vector = &[1, 2, 3, 4, 5].map(|total| Accumulator { total });

    let result = vector.join(Accumulator::empty());
    assert_eq(result, Accumulator { total: 15 });

    // We can use a non-empty separator to insert additional elements to sum:
    let separator = Accumulator { total: 10 };
    let result = vector.join(separator);
    assert_eq(result, Accumulator { total: 55 });
}

all
Returns true if all the elements satisfy the given predicate

fn all<Env>(self, predicate: fn[Env](T) -> bool) -> bool

example:

fn main() {
    let vector = &[2, 2, 2, 2, 2];
    let all = vector.all(|a| a == 2);
    assert(all);
}

any
Returns true if any of the elements satisfy the given predicate

fn any<Env>(self, predicate: fn[Env](T) -> bool) -> bool

example:

fn main() {
    let vector = &[2, 2, 2, 2, 5];
    let any = vector.any(|a| a == 5);
    assert(any);
}
Tuples
A tuple collects multiple values like an array, but with the added ability to collect values of different types:

fn main() {
    let tup: (u8, u64, Field) = (255, 500, 1000);
}

One way to access tuple elements is via destructuring using pattern matching:

fn main() {
    let tup = (1, 2);

    let (one, two) = tup;

    let three = one + two;
}

Another way to access tuple elements is via direct member access, using a period (.) followed by the index of the element we want to access. Index 0 corresponds to the first tuple element, 1 to the second and so on:

fn main() {
    let tup = (5, 6, 7, 8);

    let five = tup.0;
    let eight = tup.3;
}

Structs
A struct also allows for grouping multiple values of different types. Unlike tuples, we can also name each field.

Note: The usage of field here refers to each element of the struct and is unrelated to the field type of Noir.

Defining a struct requires giving it a name and listing each field within as <Key>: <Type> pairs:

struct Animal {
    hands: Field,
    legs: Field,
    eyes: u8,
}

An instance of a struct can then be created with actual values in <Key>: <Value> pairs in any order. Struct fields are accessible using their given names:

fn main() {
    let legs = 4;

    let dog = Animal {
        eyes: 2,
        hands: 0,
        legs,
    };

    let zero = dog.hands;
}

Structs can also be destructured in a pattern, binding each field to a new variable:

fn main() {
    let Animal { hands, legs: feet, eyes } = get_octopus();

    let ten = hands + feet + eyes as Field;
}

fn get_octopus() -> Animal {
    let octopus = Animal {
        hands: 0,
        legs: 8,
        eyes: 2,
    };

    octopus
}

The new variables can be bound with names different from the original struct field names, as showcased in the legs --> feet binding in the example above.

Visibility
By default, like functions, structs are private to the module they exist in. You can use pub to make the struct public or pub(crate) to make it public to just its crate:

// This struct is now public
pub struct Animal {
    hands: Field,
    legs: Field,
    eyes: u8,
}

The same applies to struct fields: by default they are private to the module they exist in, but they can be made pub or pub(crate):

// This struct is now public
pub struct Animal {
    hands: Field,           // private to its module
    pub(crate) legs: Field, // accessible from the entire crate
    pub eyes: u8,           // accessible from anywhere
}
References
Noir supports first-class references. References are a bit like pointers: they point to a specific address that can be followed to access the data stored at that address. You can use Rust-like syntax to use pointers in Noir: the & operator references the variable, the * operator dereferences it.

Example:

fn main() {
    let mut x = 2;

    // you can reference x as &mut and pass it to multiplyBy2
    multiplyBy2(&mut x);
}

// you can access &mut here
fn multiplyBy2(x: &mut Field) {
    // and dereference it with *
    *x = *x * 2;
}

References do have limitations. Mutable references to array elements are not supported.

For example, the following code snippet:

fn foo(x: &mut u32) {
    *x += 1;
}
fn main() {
    let mut state: [u32; 4] = [1, 2, 3, 4];
    foo(&mut state[0]);
    assert_eq(state[0], 2); // expect:2 got:1
}

Will error with the following:

error: Mutable references to array elements are currently unsupported
  ┌─ src/main.nr:6:18
  │
6 │         foo(&mut state[0]);
  │                  -------- Try storing the element in a fresh variable first
  │


Function types
Noir supports higher-order functions. The syntax for a function type is as follows:

fn(arg1_type, arg2_type, ...) -> return_type

Example:

fn assert_returns_100(f: fn() -> Field) { // f takes no args and returns a Field
    assert(f() == 100);
}

fn main() {
    assert_returns_100(|| 100); // ok
    assert_returns_100(|| 150); // fails
}

A function type also has an optional capture environment - this is necessary to support closures. See Lambdas for more details.

Edit this page
Type Coercions
When one type is required in Noir code but a different type is given, the compiler will typically issue a type error. There are a few cases however where the compiler will instead automatically perform a type coercion. These are typically limited to a few type pairs where converting from one to the other will not sacrifice performance or correctness. Currently, Noir will will try to perform the following type coercions:

Actual Type	Expected Type
[T; N]	[T]
fn(..) -> R	unconstrained fn(..) -> R
str<N>	CtString
fmtstr<N, T>	CtString
&mut T	&T
Note that:

Conversions are only from the actual type to the expected type, never the other way around.
Conversions are only performed on the outermost type, they're never performed within a nested type.
CtString is a compile-time only type, so this conversion is only valid in comptime code.
&T requires the experimental -Zownership flag to be enabled.
Examples:

fn requires_vector(_vector: [Field]) {}
comptime fn requires_ct_string(_s: CtString) {}

fn main() {
    let array: [Field; 4] = [1, 2, 3, 4];

    // Ok - array is converted to a vector
    requires_vector(array);
    // equivalent to:
    requires_vector(array.as_vector());

    // coerce a constrained function to an unconstrained one:
    let f: unconstrained fn([Field]) = requires_vector;

    comptime {
        // Passing a str<6> where a CtString is expected
        requires_ct_string("hello!")
    }
}

Functions
Functions in Noir follow the same semantics of Rust, though Noir does not support early returns.

To declare a function the fn keyword is used.

fn foo() {}

By default, functions are visible only within the package they are defined. To make them visible outside of that package (for example, as part of a library), you should mark them as pub:

pub fn foo() {}

You can also restrict the visibility of the function to only the crate it was defined in, by specifying pub(crate):

pub(crate) fn foo() {}  //foo can only be called within its crate

All parameters in a function must have a type and all types are known at compile time. The parameter is prepended with a colon and the parameter type. Multiple parameters are separated using a comma.

fn foo(x : Field, y : Field){}

You can use an underscore _ as a parameter name when you don't need to use the parameter in the function body. This is useful when you need to satisfy a function signature but don't need to use all the parameters:

fn foo(_ : Field, y : Field) {
    // Only using y parameter
}

Alternatively, you can prefix a parameter name with an underscore (e.g. _x), which also indicates that the parameter is unused. This approach is often preferred as it preserves the parameter name for documentation purposes:

fn foo(_x : Field, y : Field) -> Field {
    // Only using y parameter
    y
}

The return type of a function can be stated by using the -> arrow notation. The function below states that the foo function must return a Field. If the function returns no value, then the arrow is omitted.

fn foo(x : Field, y : Field) -> Field {
    x + y
}

Note that a return keyword is unneeded in this case - the last expression in a function's body is returned.

Main function
If you're writing a binary, the main function is the starting point of your program. You can pass all types of expressions to it, as long as they have a fixed size at compile time:

fn main(x : Field) // this is fine: passing a Field
fn main(x : [Field; 2]) // this is also fine: passing a Field with known size at compile-time
fn main(x : (Field, bool)) // 👌: passing a (Field, bool) tuple means size 2
fn main(x : str<5>) // this is fine, as long as you pass a string of size 5

fn main(x : Vec<Field>) // can't compile, has variable size
fn main(x : [Field]) // can't compile, has variable size
fn main(....// i think you got it by now


Keep in mind tests don't differentiate between main and any other function. The following snippet passes tests, but won't compile or prove:

fn main(x : [Field]) {
    assert(x[0] == 1);
}

#[test]
fn test_one() {
    main(&[1, 2]);
}

$ nargo test
[testing] Running 1 test functions
[testing] Testing test_one... ok
[testing] All tests passed

$ nargo check
The application panicked (crashed).
Message:  Cannot have variable sized arrays as a parameter to main

Call Expressions
Calling a function in Noir is executed by using the function name and passing in the necessary arguments.

Below we show how to call the foo function from the main function using a call expression:

fn main(x : Field, y : Field) {
    let z = foo(x);
}

fn foo(x : Field) -> Field {
    x + x
}

Methods
You can define methods in Noir on any struct type in scope.

struct MyStruct {
    foo: Field,
    bar: Field,
}

impl MyStruct {
    fn new(foo: Field) -> MyStruct {
        MyStruct {
            foo,
            bar: 2,
        }
    }

    fn sum(self) -> Field {
        self.foo + self.bar
    }
}

fn main() {
    let s = MyStruct::new(40);
    assert(s.sum() == 42);
}

Methods are just syntactic sugar for functions, so if we wanted to we could also call sum as follows:

assert(MyStruct::sum(s) == 42);

It is also possible to specialize which method is chosen depending on the generic type that is used. In this example, the foo function returns different values depending on its type:

struct Foo<T> {}

impl Foo<u32> {
    fn foo(self) -> Field { 1 }
}

impl Foo<u64> {
    fn foo(self) -> Field { 2 }
}

fn main() {
    let f1: Foo<u32> = Foo{};
    let f2: Foo<u64> = Foo{};
    assert(f1.foo() + f2.foo() == 3);
}

Also note that impls with the same method name defined in them cannot overlap. For example, if we already have foo defined for Foo<u32> and Foo<u64> like we do above, we cannot also define foo in an impl<T> Foo<T> since it would be ambiguous which version of foo to choose.

// Including this impl in the same project as the above snippet would
// cause an overlapping impls error
impl<T> Foo<T> {
    fn foo(self) -> Field { 3 }
}

Lambdas
Lambdas are anonymous functions. They follow the syntax of Rust - |arg1, arg2, ..., argN| return_expression.

let add_50 = |val| val + 50;
assert(add_50(100) == 150);

See Lambdas for more details.

Attributes
Attributes are metadata that can be applied to a function, using the following syntax: #[attribute(value)].

See Attributes for more details.


Control Flow
If Expressions
Noir supports if-else statements. The syntax is most similar to Rust's where it is not required for the statement's conditional to be surrounded by parentheses.

let a = 0;
let mut x: u32 = 0;

if a == 0 {
    if a != 0 {
        x = 6;
    } else {
        x = 2;
    }
} else {
    x = 5;
    assert(x == 5);
}
assert(x == 2);

For loops
for loops allow you to repeat a block of code multiple times.

The following block of code between the braces is run 10 times.

for i in 0..10 {
    // do something
}

Alternatively, start..=end can be used for a range that is inclusive on both ends.

The index for loops is of type u64.

Break and Continue
In unconstrained code, break and continue are also allowed in for and loop loops. These are only allowed in unconstrained code since normal constrained code requires that Noir knows exactly how many iterations a loop may have. break and continue can be used like so:

for i in 0 .. 10 {
    println("Iteration start")

    if i == 2 {
        continue;
    }

    if i == 5 {
        break;
    }

    println(i);
}
println("Loop end")

When used, break will end the current loop early and jump to the statement after the for loop. In the example above, the break will stop the loop and jump to the println("Loop end").

continue will stop the current iteration of the loop, and jump to the start of the next iteration. In the example above, continue will jump to println("Iteration start") when used. Note that the loop continues as normal after this. The iteration variable i is still increased by one as normal when continue is used.

break and continue cannot currently be used to jump out of more than a single loop at a time.

Loops
In unconstrained code, loop is allowed for loops that end with a break. A loop must contain at least one break statement that is reachable during execution. This is only allowed in unconstrained code since normal constrained code requires that Noir knows exactly how many iterations a loop may have.

let mut i = 10;
loop {
    println(i);
    i -= 1;

    if i == 0 {
        break;
    }
}

While loops
In unconstrained code, while is allowed for loops that end when a given condition is met. This is only allowed in unconstrained code since normal constrained code requires that Noir knows exactly how many iterations a loop may have.

let mut i = 0
while i < 10 {
    println(i);
    i += 2;
}
Skip to main content
Noir Logo
v1.0.0-beta.18
GitHub
ACIR reference

Noir Lang
Getting Started
Quick Start
Project Breakdown
Standalone Noir Installation
The Noir Language
Concepts
Data Types

Functions
Control Flow
Logical Operations
Assert Function
Unconstrained Functions
Oracles
Generics
Global Variables
Mutability
Lambdas
Comments
Shadowing
Data Bus
Traits
Attributes
Compile-time Code & Metaprogramming
Standard Library
Modules, Packages and Crates
External Libraries
How To Guides
Generate a Solidity Verifier
Recursive Aggregation
Noir and Barretenberg on the Browser
How to use Oracles
Debugging
Explainers
Tutorials
Reference
Tooling
The Noir LanguageConceptsLogical Operations
Version: v1.0.0-beta.18
Operations
Table of Supported Operations
Operation	Description	Requirements
+	Adds two private input types together	Types must be private input
-	Subtracts two private input types together	Types must be private input
*	Multiplies two private input types together	Types must be private input
/	Divides two private input types together	Types must be private input
%	Modulo operation	Types must be integer
^	XOR two private input types together	Types must be integer
&	AND two private input types together	Types must be integer
|	OR two private input types together	Types must be integer
<<	Left shift an integer by another integer amount	Types must be integer
>>	Right shift an integer by another integer amount	Types must be integer
!	Bitwise not of a value	Type must be integer or boolean
<	returns a bool if one value is less than the other	Upper bound must have a known bit size
<=	returns a bool if one value is less than or equal to the other	Upper bound must have a known bit size
>	returns a bool if one value is more than the other	Upper bound must have a known bit size
>=	returns a bool if one value is more than or equal to the other	Upper bound must have a known bit size
==	returns a bool if one value is equal to the other	Both types must not be constants
!=	returns a bool if one value is not equal to the other	Both types must not be constants
The modulo operator % will give an error when the right-hand side operand is zero, and will return 0 when the right-hand side operand is 1, or -1.

Predicate Operators
<,<=, !=, == , >, >= are known as predicate/comparison operations because they compare two values. This differs from the operations such as + where the operands are used in computation.

Bitwise Operations Example
fn main(x: Field) {
    let y = x as u32;
    let z = y & y;
}

z is implicitly constrained to be the result of y & y. The & operand is used to denote bitwise &.

x & x would not compile as x is a Field and not an integer type.

Bit shifts left: <<, or right: >> require the right hand side operand to be less that the bit size s of the operands type: x << y or x >> y overflow if x,y are unsigned and y >= s x << y or x >> y overflow if x,y are signed and y >= s

Logical Operators
Noir has no support for the logical operators || and &&. This is because encoding the short-circuiting that these operators require can be inefficient for Noir's backend. Instead you can use the bitwise operators | and & which operate identically for booleans, just without the short-circuiting.

let my_val = 5;

let mut flag = 1;
if (my_val > 6) | (my_val == 0) {
    flag = 0;
}
assert(flag == 1);

if (my_val != 10) & (my_val < 50) {
    flag = 0;
}
assert(flag == 0);

Shorthand operators
Noir shorthand operators for most of the above operators, namely +=, -=, *=, /=, %=, &=, |=, ^=, <<=, and >>=. These allow for more concise syntax. For example:

let mut i = 0;
i = i + 1;

could be written as:

let mut i = 0;
i += 1;

Assert Function
Noir includes a special assert function which will explicitly constrain the predicate/comparison expression that follows to be true. If this expression is false at runtime, the program will fail to be proven. As of v1.0.0-beta.2, assert statements are expressions and can be used in value contexts.

Example:

fn main(x : Field, y : Field) {
    assert(x == y);
}

Assertions only work for predicate operations, such as ==. If there's any ambiguity on the operation, the program will fail to compile. For example, it is unclear if assert(x + y) would check for x + y == 0 or simply would return true.

You can optionally provide a message to be logged when the assertion fails:

assert(x == y, "x and y are not equal");

Aside string literals, the optional message can be a format string or any other type supported as input for Noir's print functions. This feature lets you incorporate runtime variables into your failed assertion logs:

assert(x == y, f"Expected x == y, but got {x} == {y}");

Using a variable as an assertion message directly:

struct myStruct {
  myField: Field
}

let s = myStruct { myField: y };
assert(s.myField == x, s);

There is also a special static_assert function that behaves like assert, but that runs at compile-time.

fn main(xs: [Field; 3]) {
    let x = 2;
    let y = 4;
    static_assert(x + x == y, "expected 2 + 2 to equal 4");

    // This passes since the length of `xs` is known at compile-time
    static_assert(xs.len() == 3, "expected the input to have 3 elements");
}

Like assert, the message can be a format string or any other type supported as input for Noir's print functions. This feature lets you incorporate runtime variables into your failed assertion logs:

static_assert(x + x == y, f"Expected 2 + 2 to equal 4 but got: {x} + {x} == {y}");

This function fails when passed a dynamic (run-time) argument:

fn main(x : Field, y : Field) {
    // this fails because `x` is not known at compile-time
    static_assert(x == 2, "expected x to be known at compile-time and equal to 2");

    let mut example_vector = &[];
    if y == 4 {
        example_vector = example_vector.push_back(0);
    }

    // This fails because the length of `example_vector` is not known at
    // compile-time
    let error_message = "expected an empty vector, known at compile-time";
    static_assert(example_vector.len() == 0, error_message);
}


Unconstrained Functions
Unconstrained functions are functions which do not constrain any of the included computation and allow for non-deterministic computation.

Why?
Zero-knowledge (ZK) domain-specific languages (DSL) enable developers to generate ZK proofs from their programs by compiling code down to the constraints of an NP complete language (such as R1CS or PLONKish languages). However, the hard bounds of a constraint system can be very limiting to the functionality of a ZK DSL.

Enabling a circuit language to perform unconstrained execution is a powerful tool. Said another way, unconstrained execution lets developers generate witnesses from code that does not generate any constraints. Being able to execute logic outside of a circuit is critical for both circuit performance and constructing proofs on information that is external to a circuit.

Fetching information from somewhere external to a circuit can also be used to enable developers to improve circuit efficiency.

A ZK DSL does not just prove computation, but proves that some computation was handled correctly. Thus, it is necessary that when we switch from performing some operation directly inside of a circuit to inside of an unconstrained environment that the appropriate constraints are still laid down elsewhere in the circuit.

Example
An in depth example might help drive the point home. Let's look at how we can optimize a function to turn a u64 into an array of u8s.

fn main(num: u64) -> pub [u8; 8] {
    let mut out: [u8; 8] = [0; 8];
    for i in 0..8 {
        out[i] = (num >> (56 - (i * 8)) as u64 & 0xff) as u8;
    }

    out
}

Total ACIR opcodes generated for language PLONKCSat { width: 3 }: 91
Backend circuit size: 3619

A lot of the operations in this function are optimized away by the compiler (all the bit-shifts turn into divisions by constants). However we can save a bunch of gates by casting to u8 a bit earlier. This automatically truncates the bit-shifted value to fit in a u8 which allows us to remove the AND against 0xff. This saves us ~480 gates in total.

fn main(num: u72) -> pub [u8; 8] {
    let mut out: [u8; 8] = [0; 8];
    for i in 0..8 {
        out[i] = (num >> (56 - (i * 8)) as u8;
    }

    out
}

Total ACIR opcodes generated for language PLONKCSat { width: 3 }: 75
Backend circuit size: 3143

Those are some nice savings already but we can do better. This code is all constrained so we're proving every step of calculating out using num, but we don't actually care about how we calculate this, just that it's correct. This is where brillig comes in.

It turns out that truncating a u72 into a u8 is hard to do inside a snark, each time we do as u8 we lay down 4 ACIR opcodes which get converted into multiple gates. It's actually much easier to calculate num from out than the other way around. All we need to do is multiply each element of out by a constant and add them all together, both relatively easy operations inside a snark.

We can then run u72_to_u8 as unconstrained brillig code in order to calculate out, then use that result in our constrained function and assert that if we were to do the reverse calculation we'd get back num. This looks a little like the below:

fn main(num: u72) -> pub [u8; 8] {
    // Safety: 'out' is properly constrained below in 'assert(num == reconstructed_num);'
    let out = unsafe { u72_to_u8(num) };

    let mut reconstructed_num: u72 = 0;
    for i in 0..8 {
        reconstructed_num += (out[i] as u72 << (56 - (8 * i)));
    }
    assert(num == reconstructed_num);
    out
}

unconstrained fn u72_to_u8(num: u72) -> [u8; 8] {
    let mut out: [u8; 8] = [0; 8];
    for i in 0..8 {
        out[i] = (num >> (56 - (i * 8))) as u8;
    }
    out
}

Total ACIR opcodes generated for language PLONKCSat { width: 3 }: 78
Backend circuit size: 2902

This ends up taking off another ~250 gates from our circuit! We've ended up with more ACIR opcodes than before but they're easier for the backend to prove (resulting in fewer gates).

Note that in order to invoke unconstrained functions we need to wrap them in an unsafe block, to make it clear that the call is unconstrained. Furthermore, a warning is emitted unless the unsafe block is commented with a // Safety: ... comment explaining why it is fine to call the unconstrained function. Note that either the unsafe block can be commented this way or the statement it exists in (like in the let example above).

Generally we want to use brillig whenever there's something that's easy to verify but hard to compute within the circuit. For example, if you wanted to calculate a square root of a number it'll be a much better idea to calculate this in brillig and then assert that if you square the result you get back your number.

Break and Continue
In addition to loops over runtime bounds, break and continue are also available in unconstrained code. See break and continue

Security checks
Two compilation security passes exist currently to ensure soundness of compiled code. Problems they catch are reported as "bugs" (as opposed to errors) in the compiler output. For example:

**bug**: Brillig function call isn't properly covered by a manual constraint

Independent subgraph detection
This pass examines the instruction flow graph to see if the final function would involve values that don't come from any provided inputs and don't result in the outputs. That would mean there are no constraints ensuring the required continuity.

This check is enabled by default and can be disabled by passing the --skip-underconstrained-check option to nargo.

Brillig manual constraint coverage
The results of a Brillig function call must be constrained to ensure security, adhering to these rules: every resulting value (including every array element of a resulting array) has to be involved in a later constraint (i.e. assert, range check) against either one of the arguments of the call, or a constant. In this context, involvement means that a descendant value (e.g. a result of a chain of operations over the value) of a result has to be checked against a descendant value of an argument. For example:

unconstrained fn factor(v0: Field) -> [Field; 2] {
    ...
}

fn main f0 (foo: Field) -> [Field; 2] {
    let factored = unsafe { factor(foo) };
    assert(factored[0] * factored[1] == foo);
    return factored
}

Here, the results of factor are two elements of the returned array. The value factored[0] * factored[1] is a descendant of both of them, so both are involved in a constraint against the argument value in the assert. Hence, the call to an unconstrained function is properly covered.

This pass checks if the constraint coverage of Brillig calls is sufficient in these terms.

The check is enabled by default and can be disabled by passing the --skip-brillig-constraints-check option to nargo.

Lookback option
Certain false positives of this check can be avoided by providing the --enable-brillig-constraints-check-lookback option to nargo, which can be slower at compile-time but additionally ensures that descendants of call argument values coming from operations preceding the call itself would be followed. For example, consider this case:

unconstrained fn unconstrained_add(v0: Field, v1: Field) -> Field {
    v0 + v1
}

fn main f0 (v0: Field, v1: Field) {
    let foo = v0 + v1;
    let bar = unsafe { unconstrained_add(v0, v1) };
    assert(foo == bar);
    return bar
}

Normally, the addition operation over v0 and v1 happening before the call itself would prevent the call from being (correctly) considered properly constrained. With this option enabled, the false positive goes away at the cost of the check becoming somewhat less performant on large unrolled loops.

Global Variables
Globals
Noir supports global variables. The global's type must be specified by the user:

global N: Field = 5;

global TUPLE: (Field, Field) = (3, 2);

fn main() {
    assert(N == 5);
    assert(N == TUPLE.0 + TUPLE.1);
}

info
Globals can be defined as any expression, so long as they don't depend on themselves - otherwise there would be a dependency cycle! For example:

global T: u32 = foo(T); // dependency error

If they are initialized to a literal integer, globals can be used to specify an array's length:

global N: u32 = 2;

fn main(y : [Field; N]) {
    assert(y[0] == y[1])
}

A global from another module can be imported or referenced externally like any other name:

global N: Field = 20;

fn main() {
    assert(my_submodule::N != N);
}

mod my_submodule {
    global N: Field = 10;
}

When a global is used, Noir replaces the name with its definition on each occurrence. This means globals defined using function calls will repeat the call each time they're used:

global RESULT: [Field; 100] = foo();

fn foo() -> [Field; 100] { ... }

This is usually fine since Noir will generally optimize any function call that does not refer to a program input into a constant. It should be kept in mind however, if the called function performs side-effects like println, as these will still occur on each use.

Visibility
By default, like functions, globals are private to the module they exist in. You can use pub to make the global public or pub(crate) to make it public to just its crate:

// This global is now public
pub global N: u32 = 5;



Ciphers
aes128
Given a plaintext as an array of bytes, returns the corresponding aes128 ciphertext (CBC mode). Input padding is automatically performed using PKCS#7, so that the output length is input.len() + (16 - input.len() % 16).

aes128
pub fn aes128_encrypt<let N: u32>(
    input: [u8; N],
    iv: [u8; 16],
    key: [u8; 16],
) -> [u8; N + 16 - N % 16] {}


Source code: noir_stdlib/src/aes128.nr#L2-L8
fn main() {
    let input: [u8; 4] = [0, 12, 3, 15]; // Random bytes, will be padded to 16 bytes.
    let iv: [u8; 16] = [0; 16]; // Initialization vector
    let key: [u8; 16] = [0; 16]; // AES key
    let ciphertext = std::aes128::aes128_encrypt(input, iv, key); // In this case, the output length will be 16 bytes.
}


This is a black box function. Read this section to learn more about black box functions in Noir.

Edit this page


