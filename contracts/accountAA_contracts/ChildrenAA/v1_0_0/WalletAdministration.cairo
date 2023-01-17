// SPDX-License-Identifier: MIT
// Childre Contract for Cairo  (account/WalletAdmninistration.cairo)

%lang starknet

from starkware.cairo.common.registers import get_fp_and_pc
from starkware.cairo.common.signature import verify_ecdsa_signature
from starkware.cairo.common.cairo_builtins import HashBuiltin, SignatureBuiltin, BitwiseBuiltin
from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.uint256 import Uint256
from starkware.cairo.common.memcpy import memcpy
from starkware.cairo.common.math import split_felt, assert_not_zero, assert_not_equal, assert_le
from starkware.cairo.common.math_cmp import is_le_felt
from starkware.cairo.common.bool import TRUE, FALSE
from starkware.starknet.common.syscalls import (
    call_contract,
    get_caller_address,
    get_contract_address,
    get_tx_info,
)
from starkware.cairo.common.cairo_secp.signature import verify_eth_signature_uint256
from openzeppelin.utils.constants.library import IACCOUNT_ID, IERC165_ID, TRANSACTION_VERSION

//
// Events
//

@event
func AddAdmin(admin_requester: felt, new_requester: felt) {
}
@event
func RemoveAdmin(admin_requester: felt, old_requester: felt) {
}

//
// Storage
//

@storage_var
func children_account_super_admin_storage() -> (super_admin_addr: felt) {
}

@storage_var
func children_account_admin_addr_storage(admin_ID: felt) -> (admin_addr: felt) {
}

@storage_var
func children_account_admin_ID_storage(admin_addr: felt) -> (admin_ID: felt) {
}

@storage_var
func children_account_nb_admin_storage() -> (nb_admin: felt) {
}

// /////////////////////////////////////////
namespace CAadmin {
    //
    // Initializer
    //

    //
    // Guards
    //

    // revert if not administrator or super admin
    func assert_only_admin{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() {
        alloc_locals;
        let (caller_address) = get_caller_address();
        // %{ print(f"***** assert_only_admin:caller_address =  {ids.caller_address}") %}
        // super admin is also adminstrator
        let (addr_super_admin) = get_super_admin();
        if (caller_address == addr_super_admin) {
            return ();
        }
        let (is_admin) = get_is_admin(caller_address);
        with_attr error_message("***error_assert_only_admin:_caller_is_not_administrator") {
            assert is_admin = TRUE;
        }
        return ();
    }

    // revert if not super administrator
    func assert_only_super_admin{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
        ) {
        alloc_locals;
        let (caller_address) = get_caller_address();
        // %{ print(f"***** assert_only_super_admin:caller_address =  {ids.caller_address}") %}
        let (addr_super_admin) = get_super_admin();
        with_attr error_message(
                "***error_assert_only_super_admin:caller_is_not_super_administrator.") {
            assert caller_address = addr_super_admin;
        }
        return ();
    }

    //
    // Getters
    //

    // provide super admin address
    func get_super_admin{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (
        super_admin_address: felt
    ) {
        let (address) = children_account_super_admin_storage.read();
        return (super_admin_address=address);
    }

    // Ask if an address is listed as administrator
    func get_is_admin{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
        user_address: felt
    ) -> (is_admin: felt) {
        let (id) = children_account_admin_ID_storage.read(user_address);
        if (id == 0) {
            return (is_admin=FALSE);
        } else {
            return (is_admin=TRUE);
        }
    }

    // get the number of admins.
    @view
    func get_nb_admin{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (
        nb_admin: felt
    ) {
        let (nb_administrator) = children_account_nb_admin_storage.read();
        return (nb_admin=nb_administrator);
    }

    // Provide the ID storage of an administrator address.
    // 0 if not registered.
    @view
    func get_admin_id{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
        admin_address: felt
    ) -> (id: felt) {
        let (id) = children_account_admin_ID_storage.read(admin_address);
        return (id=id);
    }

    //
    // ******** VIEW ***********
    //

    // get an array of the list of admin addresses.
    @view
    func get_list_admin{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (
        admin_array_len: felt, admin_array: felt*
    ) {
        alloc_locals;
        let (nbre_admin) = children_account_nb_admin_storage.read();
        let (list_admin) = alloc();
        _get_admins(0, nbre_admin, list_admin);
        return (admin_array_len=nbre_admin, admin_array=list_admin);
    }

    //
    // ****** Setters ********
    //

    // Add an administror (only for super admnistrator)
    func add_admin{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
        admin_address: felt
    ) {
        with_attr error_message("***error_add_admin:_Only_for_super_administrator") {
            assert_only_super_admin();
        }

        with_attr error_message("***error_add_admin:_new_admin_is_the_zero_address.") {
            assert_not_zero(admin_address);
        }
        let (exists) = children_account_admin_ID_storage.read(admin_address);
        with_attr error_message("***error_add_admin:_address_already_registered.") {
            assert exists = 0;
        }
        let (pos) = children_account_nb_admin_storage.read();
        children_account_nb_admin_storage.write(pos + 1);
        children_account_admin_addr_storage.write(pos + 1, admin_address);
        children_account_admin_ID_storage.write(admin_address, pos + 1);
        let (caller_address) = get_caller_address();
        AddAdmin.emit(caller_address, admin_address);
        return ();
    }
    //
    // **** Business logic *****
    //

    // super admin remove an administrator (by id)
    @external
    func remove_admin_id{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
        admin_id: felt
    ) {
        alloc_locals;

        with_attr error_message(
                "***error_remove_admin_id : requester_is_not_super-administrator.") {
            assert_only_super_admin();
        }
        _remove_admin_id(admin_id);
        return ();
    }

    // super admin remove an administrator (by address)
    @external
    func remove_admin_addr{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
        admin_addr: felt
    ) {
        let (id) = children_account_admin_ID_storage.read(admin_addr);
        remove_admin_id(id);
        return ();
    }

    // self remove of an administror (not for super administrator)
    func remove_self_admin{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() {
        alloc_locals;
        let (caller_address) = get_caller_address();
        with_attr error_message(
                "***error_remove_self_admin:_can't_remove_admin_with_the_zero_address.") {
            assert_not_zero(caller_address);
        }
        let (is_admin) = get_is_admin(caller_address);
        with_attr error_message("***error_remove_self_admin:_caller_is_not_admin.") {
            assert is_admin = TRUE;
        }
        let (caller_id) = children_account_admin_ID_storage.read(caller_address);
        _remove_admin_id(caller_id);
        // %{ print(f"***** remove_self_admin:caller_address =  {ids.caller_address}") %}
        RemoveAdmin.emit(caller_address, caller_address);
        return ();
    }

    // ************ INTERNALS ****************

    // remove an admin (by ID)
    func _remove_admin_id{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
        admin_id: felt
    ) {
        alloc_locals;
        let (addr) = children_account_admin_addr_storage.read(admin_id);
        with_attr error_message("***error_remove_admin_id : addr_to_remove_is_not administrator.") {
            let (is_admin) = get_is_admin(addr);
            assert is_admin = TRUE;
        }
        let (max) = children_account_nb_admin_storage.read();
        with_attr error_message("***error_remove_admin: ID out of range.") {
            assert_le(admin_id, max);  // id must exists
            assert_not_zero(admin_id);  // not used
            assert_not_equal(admin_id, 1);  // reserved for super-administrator
        }
        children_account_admin_ID_storage.write(addr, 0);
        _del_admin(max - 1, admin_id);
        children_account_admin_addr_storage.write(max, 0);
        children_account_nb_admin_storage.write(max - 1);

        let (caller_address) = get_caller_address();
        RemoveAdmin.emit(caller_address, addr);
        return ();
    }

    // recursive for list of admins
    func _get_admins{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
        admin_id: felt, admin_array_len: felt, admin_array: felt*
    ) {
        if (admin_id == admin_array_len) {
            return ();
        }
        let (administrator) = children_account_admin_addr_storage.read(admin_id + 1);
        assert admin_array[admin_id] = administrator;
        _get_admins(admin_id + 1, admin_array_len, admin_array);
        return ();
    }

    // recursive for delete of an admin
    func _del_admin{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
        pos: felt, admin_id: felt
    ) {
        if (pos == admin_id - 1) {
            return ();
        }
        _del_admin(pos - 1, admin_id);
        let (addr) = children_account_admin_addr_storage.read(pos + 1);
        children_account_admin_addr_storage.write(pos, addr);
        children_account_admin_ID_storage.write(addr, pos);
        return ();
    }
    //
}
