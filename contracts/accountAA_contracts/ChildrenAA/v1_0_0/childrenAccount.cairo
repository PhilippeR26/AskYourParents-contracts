// SPDX-License-Identifier: MIT
// ChildrenAccount.cairo v1.0.0
// Based on OpenZeppelin Contracts for Cairo v0.5.0 (account/presets/Account.cairo)

%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin, SignatureBuiltin, BitwiseBuiltin
from starkware.starknet.common.syscalls import get_tx_info

from accountAA_contracts.ChildrenAA.v1_0_0.library import Account, AccountCallArray
from accountAA_contracts.ChildrenAA.v1_0_0.WalletAdministration import (
    CAadmin,
    children_account_super_admin_storage,
)

//
// Constructor
//

@constructor
func constructor{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    super_admin_address: felt, publicKey: felt
) {
    Account.initializer(super_admin_address, publicKey);
    return ();
}

//
// Getters
//

@view
func getPublicKey{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (
    publicKey: felt
) {
    let (publicKey: felt) = Account.get_public_key();
    return (publicKey=publicKey);
}

@view
func supportsInterface{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    interfaceId: felt
) -> (success: felt) {
    return Account.supports_interface(interfaceId);
}

// get super-administrator address
@view
func getSuperAdmin{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (
    super_admin_addr: felt
) {
    let sa_address: felt = CAadmin.get_super_admin();
    return (super_admin_addr=sa_address);
}

// is an administrator address ?
@view
func isAdmin{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    user_address: felt
) -> (is_admin: felt) {
    let (isadmin) = CAadmin.get_is_admin(user_address);
    return (is_admin=isadmin);
}

//
// Setters
//

@external
func setPublicKey{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    newPublicKey: felt
) {
    Account.set_public_key(newPublicKey);
    return ();
}

@external
func addAdmin{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(address: felt) {
    CAadmin.add_admin(address);
    return ();
}

//
// Business logic
//

@view
func isValidSignature{
    syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, ecdsa_ptr: SignatureBuiltin*, range_check_ptr
}(hash: felt, signature_len: felt, signature: felt*) -> (isValid: felt) {
    let (isValid: felt) = Account.is_valid_signature(hash, signature_len, signature);
    return (isValid=isValid);
}

// get list of administrators
@view
func getListAdmin{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (
    array_len: felt, array: felt*
) {
    let (array_len, array) = CAadmin.get_list_admin();
    return (array_len=array_len, array=array);
}

@external
func __validate__{
    syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, ecdsa_ptr: SignatureBuiltin*, range_check_ptr
}(call_array_len: felt, call_array: AccountCallArray*, calldata_len: felt, calldata: felt*) {
    let (tx_info) = get_tx_info();
    Account.is_valid_signature(tx_info.transaction_hash, tx_info.signature_len, tx_info.signature);
    return ();
}

@external
func __validate_declare__{
    syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, ecdsa_ptr: SignatureBuiltin*, range_check_ptr
}(class_hash: felt) {
    let (tx_info) = get_tx_info();
    %{ print(f"***** __validate_declare__:tx_info.transaction_hash =  {ids.tx_info.transaction_hash}") %}
    %{ print(f"***** __validate_declare__:tx_info.signature[0] =  {ids.tx_info.signature[0]}") %}
    %{ print(f"***** __validate_declare__:tx_info.signature[1] =  {ids.tx_info.signature[1]}") %}

    Account.is_valid_signature(tx_info.transaction_hash, tx_info.signature_len, tx_info.signature);
    return ();
}

@external
func __validate_deploy__{
    syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, ecdsa_ptr: SignatureBuiltin*, range_check_ptr
}(class_hash: felt, contract_address_salt: felt, super_admin_address: felt, publicKey: felt) {
    let (tx_info) = get_tx_info();
    Account.is_valid_signature(tx_info.transaction_hash, tx_info.signature_len, tx_info.signature);
    return ();
}
@external
func __execute__{
    syscall_ptr: felt*,
    pedersen_ptr: HashBuiltin*,
    ecdsa_ptr: SignatureBuiltin*,
    bitwise_ptr: BitwiseBuiltin*,
    range_check_ptr,
}(call_array_len: felt, call_array: AccountCallArray*, calldata_len: felt, calldata: felt*) -> (
    response_len: felt, response: felt*
) {
    let (response_len, response) = Account.execute(
        call_array_len, call_array, calldata_len, calldata
    );
    return (response_len, response);
}

// remove self as administrator
@external
func removeSelfAdmin{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() {
    CAadmin.remove_self_admin();
    return ();
}

// remove administrator (only for superadmin)
@external
func removeAdmin{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(address: felt) {
    CAadmin.remove_admin_addr(address);
    return ();
}
