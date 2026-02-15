use std::hash::pedersen_hash;

fn extract_domain_hash(email_bytes: [u8; 100]) -> Field {
    let mut domain_bytes: [u8; 50] = [0; 50];
    let mut found_at = false;
    let mut domain_idx: u32 = 0;

    for i in 0..100 {
        if found_at {
            if (email_bytes[i] != 0) & (domain_idx < 50) {
                domain_bytes[domain_idx] = email_bytes[i];
                domain_idx += 1;
            }
        }
        if email_bytes[i] == 64 {
            found_at = true;
        }
    }

    let mut hash_input: [Field; 50] = [0; 50];
    for i in 0..50 {
        hash_input[i] = domain_bytes[i] as Field;
    }
    pedersen_hash(hash_input)
}

fn compute_domain_hash(domain_bytes: [u8; 50]) -> Field {
    let mut hash_input: [Field; 50] = [0; 50];
    for i in 0..50 {
        hash_input[i] = domain_bytes[i] as Field;
    }
    pedersen_hash(hash_input)
}

fn main(
    document_hash: Field,
    salt: Field,
    author_email: [u8; 100],
    file_size: u64,
    file_type: [u8; 20],
    commitment: pub Field,
    reveal_email_domain: pub bool,
    reveal_size_range: pub bool,
    reveal_file_type: pub bool,
    claimed_domain_hash: pub Field,
    claimed_size_min: pub u64,
    claimed_size_max: pub u64,
    claimed_file_type: pub [u8; 20],
) {
    let computed_commitment = pedersen_hash([document_hash, salt]);
    assert(commitment == computed_commitment);

    if reveal_email_domain {
        let email_domain_hash = extract_domain_hash(author_email);
        assert(email_domain_hash == claimed_domain_hash);
    }

    if reveal_size_range {
        assert(file_size >= claimed_size_min);
        assert(file_size <= claimed_size_max);
    }

    if reveal_file_type {
        for i in 0..20 {
            assert(file_type[i] == claimed_file_type[i]);
        }
    }
}

fn make_email(s: str<100>) -> [u8; 100] {
    s.as_bytes()
}

fn make_file_type(s: str<20>) -> [u8; 20] {
    s.as_bytes()
}

fn make_domain(s: str<50>) -> [u8; 50] {
    s.as_bytes()
}

#[test]
fn test_no_disclosure() {
    let doc_hash = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef;
    let salt = 0x0abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456789;
    let commitment = pedersen_hash([doc_hash, salt]);
    let email = make_email(
        "alice@mit.edu\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0",
    );
    let ft = make_file_type("pdf\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0");
    let claimed_ft = make_file_type("\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0");

    main(
        doc_hash,
        salt,
        email,
        2097152,
        ft,
        commitment,
        false,
        false,
        false,
        0,
        0,
        0,
        claimed_ft,
    );
}

#[test]
fn test_reveal_file_type() {
    let doc_hash = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef;
    let salt = 0x0abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456789;
    let commitment = pedersen_hash([doc_hash, salt]);
    let email = make_email(
        "alice@mit.edu\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0",
    );
    let ft = make_file_type("pdf\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0");

    main(
        doc_hash,
        salt,
        email,
        2097152,
        ft,
        commitment,
        false,
        false,
        true,
        0,
        0,
        0,
        ft,
    );
}

#[test]
fn test_reveal_size_range() {
    let doc_hash = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef;
    let salt = 0x0abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456789;
    let commitment = pedersen_hash([doc_hash, salt]);
    let email = make_email(
        "alice@mit.edu\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0",
    );
    let ft = make_file_type("pdf\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0");
    let claimed_ft = make_file_type("\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0");

    main(
        doc_hash,
        salt,
        email,
        2097152,
        ft,
        commitment,
        false,
        true,
        false,
        0,
        1000000,
        3000000,
        claimed_ft,
    );
}

#[test]
fn test_reveal_email_domain() {
    let doc_hash = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef;
    let salt = 0x0abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456789;
    let commitment = pedersen_hash([doc_hash, salt]);
    let email = make_email(
        "alice@mit.edu\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0",
    );
    let ft = make_file_type("pdf\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0");
    let claimed_ft = make_file_type("\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0");

    let domain = make_domain(
        "mit.edu\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0",
    );
    let domain_hash = compute_domain_hash(domain);

    main(
        doc_hash,
        salt,
        email,
        2097152,
        ft,
        commitment,
        true,
        false,
        false,
        domain_hash,
        0,
        0,
        claimed_ft,
    );
}

#[test]
fn test_reveal_all() {
    let doc_hash = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef;
    let salt = 0x0abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456789;
    let commitment = pedersen_hash([doc_hash, salt]);
    let email = make_email(
        "alice@mit.edu\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0",
    );
    let ft = make_file_type("pdf\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0");

    let domain = make_domain(
        "mit.edu\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0",
    );
    let domain_hash = compute_domain_hash(domain);

    main(
        doc_hash,
        salt,
        email,
        2097152,
        ft,
        commitment,
        true,
        true,
        true,
        domain_hash,
        1000000,
        3000000,
        ft,
    );
}

#[test(should_fail)]
fn test_invalid_commitment_fails() {
    let doc_hash = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef;
    let salt = 0x0abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456789;
    let wrong_commitment = 0x0000000000000000000000000000000000000000000000000000000000000001;
    let email = make_email(
        "alice@mit.edu\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0",
    );
    let ft = make_file_type("pdf\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0");
    let claimed_ft = make_file_type("\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0");

    main(
        doc_hash,
        salt,
        email,
        2097152,
        ft,
        wrong_commitment,
        false,
        false,
        false,
        0,
        0,
        0,
        claimed_ft,
    );
}

#[test(should_fail)]
fn test_wrong_file_type_fails() {
    let doc_hash = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef;
    let salt = 0x0abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456789;
    let commitment = pedersen_hash([doc_hash, salt]);
    let email = make_email(
        "alice@mit.edu\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0",
    );
    let ft = make_file_type("pdf\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0");
    let wrong_ft = make_file_type("doc\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0");

    main(
        doc_hash,
        salt,
        email,
        2097152,
        ft,
        commitment,
        false,
        false,
        true,
        0,
        0,
        0,
        wrong_ft,
    );
}

#[test(should_fail)]
fn test_size_out_of_range_fails() {
    let doc_hash = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef;
    let salt = 0x0abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456789;
    let commitment = pedersen_hash([doc_hash, salt]);
    let email = make_email(
        "alice@mit.edu\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0",
    );
    let ft = make_file_type("pdf\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0");
    let claimed_ft = make_file_type("\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0");

    main(
        doc_hash,
        salt,
        email,
        5000000,
        ft,
        commitment,
        false,
        true,
        false,
        0,
        1000000,
        3000000,
        claimed_ft,
    );
}

#[test(should_fail)]
fn test_wrong_email_domain_fails() {
    let doc_hash = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef;
    let salt = 0x0abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456789;
    let commitment = pedersen_hash([doc_hash, salt]);
    let email = make_email(
        "alice@mit.edu\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0",
    );
    let ft = make_file_type("pdf\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0");
    let claimed_ft = make_file_type("\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0");

    let wrong_domain = make_domain(
        "harvard.edu\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0",
    );
    let wrong_domain_hash = compute_domain_hash(wrong_domain);

    main(
        doc_hash,
        salt,
        email,
        2097152,
        ft,
        commitment,
        true,
        false,
        false,
        wrong_domain_hash,
        0,
        0,
        claimed_ft,
    );
}
