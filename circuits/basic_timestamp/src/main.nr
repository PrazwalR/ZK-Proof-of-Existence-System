use std::hash::pedersen_hash;

fn main(document_hash: Field, salt: Field, commitment: pub Field, current_timestamp: pub u64) {
    let computed_commitment = pedersen_hash([document_hash, salt]);
    assert(commitment == computed_commitment);

    let min_timestamp: u64 = 1704067200;
    assert(current_timestamp >= min_timestamp);

    let max_reasonable: u64 = 1893456000;
    assert(current_timestamp <= max_reasonable);
}

#[test]
fn test_valid_proof() {
    let doc_hash = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef;
    let salt = 0x0abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456789;
    let commitment = pedersen_hash([doc_hash, salt]);
    main(doc_hash, salt, commitment, 1704067200);
}

#[test]
fn test_different_documents_different_commitments() {
    let doc1 = 0x1111111111111111111111111111111111111111111111111111111111111111;
    let doc2 = 0x2222222222222222222222222222222222222222222222222222222222222222;
    let salt = 0x0abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456789;
    let c1 = pedersen_hash([doc1, salt]);
    let c2 = pedersen_hash([doc2, salt]);
    assert(c1 != c2);
}

#[test]
fn test_different_salts_different_commitments() {
    let doc_hash = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef;
    let salt1 = 0x0000000000000000000000000000000000000000000000000000000000000001;
    let salt2 = 0x0000000000000000000000000000000000000000000000000000000000000002;
    let c1 = pedersen_hash([doc_hash, salt1]);
    let c2 = pedersen_hash([doc_hash, salt2]);
    assert(c1 != c2);
}

#[test]
fn test_min_timestamp_boundary() {
    let doc_hash = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef;
    let salt = 0x0abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456789;
    let commitment = pedersen_hash([doc_hash, salt]);
    main(doc_hash, salt, commitment, 1704067200);
}

#[test]
fn test_current_timestamp() {
    let doc_hash = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef;
    let salt = 0x0abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456789;
    let commitment = pedersen_hash([doc_hash, salt]);
    main(doc_hash, salt, commitment, 1739577600);
}

#[test(should_fail)]
fn test_invalid_commitment_fails() {
    let doc_hash = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef;
    let salt = 0x0abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456789;
    let wrong_commitment = 0x0000000000000000000000000000000000000000000000000000000000000001;
    main(doc_hash, salt, wrong_commitment, 1704067200);
}

#[test(should_fail)]
fn test_timestamp_before_epoch_fails() {
    let doc_hash = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef;
    let salt = 0x0abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456789;
    let commitment = pedersen_hash([doc_hash, salt]);
    main(doc_hash, salt, commitment, 1000000000);
}

#[test(should_fail)]
fn test_timestamp_too_far_future_fails() {
    let doc_hash = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef;
    let salt = 0x0abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456789;
    let commitment = pedersen_hash([doc_hash, salt]);
    main(doc_hash, salt, commitment, 2000000000);
}

#[test]
fn test_zero_document_hash() {
    let doc_hash = 0x0000000000000000000000000000000000000000000000000000000000000000;
    let salt = 0x0abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456789;
    let commitment = pedersen_hash([doc_hash, salt]);
    main(doc_hash, salt, commitment, 1739577600);
}

#[test]
fn test_max_valid_timestamp() {
    let doc_hash = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef;
    let salt = 0x0abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456789;
    let commitment = pedersen_hash([doc_hash, salt]);
    main(doc_hash, salt, commitment, 1893456000);
}
