// listwhitelist.cairo
// Manage a list of address
%lang starknet
%builtins pedersen range_check

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.starknet.common.syscalls import get_tx_signature
from starkware.cairo.common.math import assert_lt, assert_le, assert_not_zero, assert_not_equal
from starkware.cairo.common.alloc import alloc

// storages

@storage_var
func whitelist_addr(whitelist_ID: felt) -> (whitelist_address: felt) {
}

@storage_var
func whitelist_ID(whitelist_address: felt) -> (whitelist_ID: felt) {
}

@storage_var
func nb_whitelist() -> (nb_whitelist: felt) {
}

// constructor
@constructor
func constructor{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() {
    add_whitelist(1234);  // add address of super-whitelististrator as whitelist[1]
    return ();
}

// getters
@view
func get_nb_whitelist{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (
    nb_whitelist: felt
) {
    let (nb_whitelististrator) = nb_whitelist.read();
    return (nb_whitelist=nb_whitelististrator);
}

@view
func get_whitelist_id{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    whitelist_address: felt
) -> (id: felt) {
    let (id) = whitelist_ID.read(whitelist_address);
    return (id=id);
}

@view
func get_list_whitelist{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (
    whitelist_array_len: felt, whitelist_array: felt*
) {
    alloc_locals;
    let (nbre_whitelist) = nb_whitelist.read();
    let (list_whitelist) = alloc();
    _get_whitelists(0, nbre_whitelist, list_whitelist);
    return (whitelist_array_len=nbre_whitelist, whitelist_array=list_whitelist);
}

// internal
func _get_whitelists{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    whitelist_id: felt, whitelist_array_len: felt, whitelist_array: felt*
) {
    if (whitelist_id == whitelist_array_len) {
        return ();
    }
    let (whitelististrator) = whitelist_addr.read(whitelist_id + 1);
    assert whitelist_array[whitelist_id] = whitelististrator;
    _get_whitelists(whitelist_id + 1, whitelist_array_len, whitelist_array);
    return ();
}

func _del_whitelist{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    pos: felt, whitelist_id: felt
) {
    // let (max) = nb_whitelist.read();
    if (pos == whitelist_id - 1) {
        return ();
    }
    _del_whitelist(pos - 1, whitelist_id);
    let (addr) = whitelist_addr.read(pos + 1);
    whitelist_addr.write(pos, addr);
    whitelist_ID.write(addr, pos);
    return ();
}

// external

@external
func add_whitelist{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    whitelist_address: felt
) {
    let (exists) = whitelist_ID.read(whitelist_address);
    with_attr error_message("***error_add_whitelist: address already registered.") {
        assert exists = 0;
    }
    let (pos) = nb_whitelist.read();
    nb_whitelist.write(pos + 1);
    whitelist_addr.write(pos + 1, whitelist_address);
    whitelist_ID.write(whitelist_address, pos + 1);
    return ();
}

@external
func remove_whitelist_id{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    whitelist_id: felt
) {
    alloc_locals;
    let (max) = nb_whitelist.read();
    with_attr error_message("***error_remove_whitelist: ID out of range.") {
        assert_le(whitelist_id, max);  // id must exists
        assert_not_zero(whitelist_id);  // not used
        assert_not_equal(whitelist_id, 1);  // reserved for super-whitelististrator
    }
    let (addr) = whitelist_addr.read(whitelist_id);
    whitelist_ID.write(addr, 0);
    _del_whitelist(max - 1, whitelist_id);
    whitelist_addr.write(max, 0);
    nb_whitelist.write(max - 1);
    return ();
}

@external
func remove_whitelist_addr{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    whitelist_addr: felt
) {
    let (id) = whitelist_ID.read(whitelist_addr);
    remove_whitelist_id(id);
    return ();
}
