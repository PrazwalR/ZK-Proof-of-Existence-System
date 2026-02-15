use std::hash::pedersen_hash;

fn main(document_hash: Field, salt: Field) -> pub Field {
    pedersen_hash([document_hash, salt])
}
