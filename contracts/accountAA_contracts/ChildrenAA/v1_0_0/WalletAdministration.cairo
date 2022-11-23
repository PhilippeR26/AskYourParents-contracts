// SPDX-License-Identifier: MIT
// Childre Contract for Cairo  (account/WalletAdmninistration.cairo)

%lang starknet

from starkware.cairo.common.registers import get_fp_and_pc
from starkware.cairo.common.signature import verify_ecdsa_signature
from starkware.cairo.common.cairo_builtins import HashBuiltin, SignatureBuiltin, BitwiseBuiltin
from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.uint256 import Uint256
from starkware.cairo.common.memcpy import memcpy
from starkware.cairo.common.math import split_felt, assert_not_zero, assert_not_equal
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
func children_account_admin_list_storage(admin_addr: felt) -> (is_admin: felt) {
}

@storage_var
func children_account_addr_whitelist_storage(adr: felt) -> (is_whitelisted: felt) {
}

//
// Structs
//

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
        %{ print(f"***** assert_only_admin:caller_address =  {ids.caller_address}") %}
        // super admin is also adminstrator
        let (addr_super_admin) = get_super_admin();
        if (caller_address == addr_super_admin) {
            return ();
        }
        let (is_admin) = get_is_admin(caller_address);
        with_attr error_message("***error assert_only_admin: caller is not administrator") {
            assert is_admin = TRUE;
        }
        return ();
    }

    // revert if not super administrator
    func assert_only_super_admin{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
        ) {
        alloc_locals;
        let (caller_address) = get_caller_address();
        %{ print(f"***** assert_only_super_admin:caller_address =  {ids.caller_address}") %}
        let (addr_super_admin) = get_super_admin();
        with_attr error_message(
                "***error assert_only_super_admin: caller is not super administrator.") {
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
        return children_account_admin_list_storage.read(user_address);
    }

    //
    // Setters
    //

    // Add an administror (only for super admnistrator)
    func set_admin{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
        addr_admin: felt
    ) {
        with_attr error_message("***error set_admin: Only for super administrator") {
            assert_only_super_admin();
        }
        // with_attr error_message("***error set_admin:requester is not administrator.") {
        //     assert_only_admin();
        // }
        with_attr error_message("***error set_admin: new admin is the zero address.") {
            assert_not_zero(addr_admin);
        }
        children_account_admin_list_storage.write(addr_admin, TRUE);
        let (caller_address) = get_caller_address();
        AddAdmin.emit(caller_address, addr_admin);
        return ();
    }
    //
    // Business logic
    //

    // Remove an administror (only for super admnistrator)
    func remove_admin{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
        addr_admin: felt
    ) {
        with_attr error_message("***error set_admin:requester is not super-administrator.") {
            assert_only_super_admin();
        }
        with_attr error_message("***error set_admin:addr to remove is not administrator.") {
            let (is_admin) = get_is_admin(addr_admin);
            assert is_admin = TRUE;
        }
        // with_attr error_message(
        //         "***error set_admin:requester is self removing its administrator right.") {
        let (caller_address) = get_caller_address();
        // assert_not_equal(caller, addr_admin);
        // }
        children_account_admin_list_storage.write(addr_admin, FALSE);
        RemoveAdmin.emit(caller_address, addr_admin);
        return ();
    }

    // self remove of an administror (not for super administrator)
    func _remove_self_admin{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() {
        let (caller_address) = get_caller_address();
        with_attr error_message(
                "***error remove_self_admin: can't remove admin with the zero address.") {
            assert_not_zero(caller_address);
        }
        let (is_admin) = get_is_admin(caller_address);
        with_attr error_message("***error remove_self_admin: caller is not admin.") {
            assert is_admin = TRUE;
        }
        children_account_admin_list_storage.write(caller_address, FALSE);
        %{ print(f"***** remove_self_admin:caller_address =  {ids.caller_address}") %}
        RemoveAdmin.emit(caller_address, caller_address);
        return ();
    }

    //
}
