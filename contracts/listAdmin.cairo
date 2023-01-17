// listAdmin.cairo
// Manage a list of address
%lang starknet
%builtins pedersen range_check

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.starknet.common.syscalls import get_tx_signature
from starkware.cairo.common.math import assert_lt, assert_le, assert_not_zero, assert_not_equal
from starkware.cairo.common.alloc import alloc

// ****** storages *******

@storage_var
func admin_addr(admin_ID: felt) -> (admin_address: felt) {
}

@storage_var
func admin_ID(admin_address: felt) -> (admin_ID: felt) {
}

@storage_var
func nb_admin() -> (nb_admin: felt) {
}

// ********* constructor ********
@constructor
func constructor{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() {
    add_admin(1234);  // add address of super-administrator as admin[1]
    return ();
}

// ***** getters ************
@view
func get_nb_admin{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (
    nb_admin: felt
) {
    let (nb_administrator) = nb_admin.read();
    return (nb_admin=nb_administrator);
}

@view
func get_admin_id{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    admin_address: felt
) -> (id: felt) {
    let (id) = admin_ID.read(admin_address);
    return (id=id);
}

// ***** VIEW *****
@view
func get_list_admin{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (
    admin_array_len: felt, admin_array: felt*
) {
    alloc_locals;
    let (nbre_admin) = nb_admin.read();
    let (list_admin) = alloc();
    _get_admins(0, nbre_admin, list_admin);
    return (admin_array_len=nbre_admin, admin_array=list_admin);
}

// **** external *******

@external
func add_admin{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    admin_address: felt
) {
    let (exists) = admin_ID.read(admin_address);
    with_attr error_message("***error_add_admin: address already registered.") {
        assert exists = 0;
    }
    let (pos) = nb_admin.read();
    nb_admin.write(pos + 1);
    admin_addr.write(pos + 1, admin_address);
    admin_ID.write(admin_address, pos + 1);
    return ();
}

@external
func remove_admin_id{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    admin_id: felt
) {
    alloc_locals;
    let (max) = nb_admin.read();
    with_attr error_message("***error_remove_admin: ID out of range.") {
        assert_le(admin_id, max);  // id must exists
        assert_not_zero(admin_id);  // not used
        assert_not_equal(admin_id, 1);  // reserved for super-administrator
    }
    let (addr) = admin_addr.read(admin_id);
    admin_ID.write(addr, 0);
    _del_admin(max - 1, admin_id);
    admin_addr.write(max, 0);
    nb_admin.write(max - 1);
    return ();
}

@external
func remove_admin_addr{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    admin_addr: felt
) {
    let (id) = admin_ID.read(admin_addr);
    remove_admin_id(id);
    return ();
}

// **** internal ***********
func _get_admins{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    admin_id: felt, admin_array_len: felt, admin_array: felt*
) {
    if (admin_id == admin_array_len) {
        return ();
    }
    let (administrator) = admin_addr.read(admin_id + 1);
    assert admin_array[admin_id] = administrator;
    _get_admins(admin_id + 1, admin_array_len, admin_array);
    return ();
}

func _del_admin{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    pos: felt, admin_id: felt
) {
    if (pos == admin_id - 1) {
        return ();
    }
    _del_admin(pos - 1, admin_id);
    let (addr) = admin_addr.read(pos + 1);
    admin_addr.write(pos, addr);
    admin_ID.write(addr, pos);
    return ();
}
