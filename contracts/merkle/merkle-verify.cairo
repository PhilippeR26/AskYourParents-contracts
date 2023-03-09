// verification of MerkleTree proof from Starknet.js V5
//
%lang starknet
%builtins pedersen range_check

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.hash import hash2
from starkware.cairo.common.math_cmp import is_le_felt
from starkware.cairo.common.bool import TRUE, FALSE

// Define a storage variable.
@storage_var
func merkle_root_storage() -> (felt,) {
}

@constructor
func constructor{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    merkle_root: felt
) {
    merkle_root_storage.write(merkle_root);
    return ();
}
// provide root value
@view
func get_root{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (root: felt) {
    let (root) = merkle_root_storage.read();
    return (root=root);
}

// get pedersen hash of 2 values.
@view
func get_hash_pedersen{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    value1: felt, value2: felt
) -> (hash: felt) {
    let (hash) = hash2{hash_ptr=pedersen_ptr}(value1, value2);
    return (hash=hash);
}

// verify that a proof relates to the stored root
//
// @param :
// - leaf : felt : the pedersen hash of the leaf to verify. Result of
//          StarknetMerkleTree.leafHash(leaf) from starknet.js V5.
//          In Cairo, h(h(h(p1,p2),p3)...,p_len).
// - proof : array of felt : the proof of the leaf. Result of
//           myTree.getProof(numOfDatas|datas[numsOfDatas]) from starknet.js V5.
// @returns :
// - res : boolean : TRUE = leaf is part of the Merkle tree
//
@view
func verify_proof{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    leaf: felt, proof_len: felt, proof: felt*
) -> (res: felt) {
    let (hash) = hash_proof(leaf, proof_len, proof);
    let (root) = get_root();
    if (hash == root) {
        return (res=TRUE);
    }
    return (res=FALSE);
}

// calculate proof hash
func hash_proof{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    leaf: felt, proof_len: felt, proof: felt*
) -> (res: felt) {
    if (proof_len == 0) {
        // %{ print(f"***** hash_proof:proof_len == 0:leaf =  {hex(ids.leaf)}") %}
        return (res=leaf);
    }
    let pr = proof[0];
    if (is_le_felt(leaf, proof[0]) == TRUE) {
        let (hash) = hash2{hash_ptr=pedersen_ptr}(leaf, proof[0]);
    } else {
        let (hash) = hash2{hash_ptr=pedersen_ptr}(proof[0], leaf);
    }
    let (result) = hash_proof(hash, proof_len=proof_len - 1, proof=proof + 1);

    return (res=result);
}

@external
func request_airdrop{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    address: felt, amount: felt, proof_len: felt, proof: felt*
) -> () {
    let (h0) = get_hash_pedersen(0, address);
    let (h1) = get_hash_pedersen(h0, amount);
     let (hashed_leaf) = get_hash_pedersen(h1, 2);  // 2= length of data (address & amount)
    let (is_valid_request) = verify_proof(hashed_leaf, proof_len, proof);
    assert is_valid_request = TRUE;  // revert if not valid
    // Airdop
    // Do not forget to first store this address in a storage of addresses already airdropped,
    // to be sure to perform the airdrop only once per address.
    // Perform here your transfer of ERC20 or ERC721, using address & amount.
    return ();
}
