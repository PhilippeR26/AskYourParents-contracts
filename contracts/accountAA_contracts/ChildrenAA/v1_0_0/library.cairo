// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts for Cairo v0.5.0 (account/library.cairo)

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
func children_account_public_key_storage() -> (public_key: felt) {
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

struct Call {
    to: felt,
    selector: felt,
    calldata_len: felt,
    calldata: felt*,
}

// Tmp struct introduced while we wait for Cairo
// to support passing `[AccountCall]` to __execute__
struct AccountCallArray {
    to: felt,
    selector: felt,
    data_offset: felt,
    data_len: felt,
}

// /////////////////////////////////////////
namespace ChildrenAccount {
    //
    // Initializer
    //

    func initializer{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
        _public_key: felt
    ) {
        children_account_public_key_storage.write(_public_key);
        let (caller_address) = get_caller_address();
        children_account_admin_list_storage.write(caller_address, TRUE);
        return ();
    }

    //
    // Guards
    //

    func assert_only_self{syscall_ptr: felt*}() {
        let (self) = get_contract_address();
        let (caller) = get_caller_address();
        with_attr error_message("Account: caller is not this account") {
            assert self = caller;
        }
        return ();
    }

    // revert if not administrator
    func assert_only_admin{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() {
        let (caller) = get_caller_address();
        let (is_admin) = get_is_admin(caller);
        with_attr error_message("Account: caller is not administrator") {
            assert is_admin = TRUE;
        }
        return ();
    }

    //
    // Getters
    //

    func get_public_key{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (
        public_key: felt
    ) {
        return children_account_public_key_storage.read();
    }

    func supports_interface{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
        interface_id: felt
    ) -> (success: felt) {
        if (interface_id == IERC165_ID) {
            return (success=TRUE);
        }
        if (interface_id == IACCOUNT_ID) {
            return (success=TRUE);
        }
        return (success=FALSE);
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

    func set_public_key{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
        new_public_key: felt
    ) {
        assert_only_self();
        children_account_public_key_storage.write(new_public_key);
        return ();
    }

    // Add an administror (allowed only by an already recorded admin)
    func set_admin{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
        addr_admin: felt
    ) {
        with_attr error_message("set_admin:requester is not administrator.") {
            assert_only_admin();
        }
        with_attr error_message("set_admin: new admin is the zero address.") {
            assert_not_zero(addr_admin);
        }
        children_account_admin_list_storage.write(addr_admin, TRUE);
        let (caller) = get_caller_address();
        AddAdmin.emit(caller, addr_admin);
        return ();
    }
    // Remove an administror (allowed only by an already recorded admin)
    // Self remove not allowed
    func remove_admin{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
        addr_admin: felt
    ) {
        with_attr error_message("set_admin:requester is not administrator.") {
            assert_only_admin();
        }
        with_attr error_message("set_admin:addr to remove is not administrator.") {
            let (is_admin) = get_is_admin(addr_admin);
            assert is_admin = TRUE;
        }
        with_attr error_message("set_admin:requester is self removing its administrator right.") {
            let (caller) = get_caller_address();
            assert_not_equal(caller, addr_admin);
        }
        children_account_admin_list_storage.write(addr_admin, FALSE);
        RemoveAdmin.emit(caller, addr_admin);
        return ();
    }

    //
    // Business logic
    //

    func is_valid_signature{
        syscall_ptr: felt*,
        pedersen_ptr: HashBuiltin*,
        ecdsa_ptr: SignatureBuiltin*,
        range_check_ptr,
    }(hash: felt, signature_len: felt, signature: felt*) -> (is_valid: felt) {
        let (_public_key) = children_account_public_key_storage.read();

        // This interface expects a signature pointer and length to make
        // no assumption about signature validation schemes.
        // But this implementation does, and it expects a (sig_r, sig_s) pair.
        let sig_r = signature[0];
        let sig_s = signature[1];

        verify_ecdsa_signature(
            message=hash, public_key=_public_key, signature_r=sig_r, signature_s=sig_s
        );

        return (is_valid=TRUE);
    }

    func is_valid_eth_signature{
        syscall_ptr: felt*,
        pedersen_ptr: HashBuiltin*,
        bitwise_ptr: BitwiseBuiltin*,
        range_check_ptr,
    }(hash: felt, signature_len: felt, signature: felt*) -> (is_valid: felt) {
        alloc_locals;
        let (_public_key) = get_public_key();
        let (__fp__, _) = get_fp_and_pc();

        // This interface expects a signature pointer and length to make
        // no assumption about signature validation schemes.
        // But this implementation does, and it expects a the sig_v, sig_r,
        // sig_s, and hash elements.
        let sig_v: felt = signature[0];
        let sig_r: Uint256 = Uint256(low=signature[1], high=signature[2]);
        let sig_s: Uint256 = Uint256(low=signature[3], high=signature[4]);
        let (high, low) = split_felt(hash);
        let msg_hash: Uint256 = Uint256(low=low, high=high);

        let (local keccak_ptr: felt*) = alloc();

        with keccak_ptr {
            verify_eth_signature_uint256(
                msg_hash=msg_hash, r=sig_r, s=sig_s, v=sig_v, eth_address=_public_key
            );
        }

        return (is_valid=TRUE);
    }

    func execute{
        syscall_ptr: felt*,
        pedersen_ptr: HashBuiltin*,
        ecdsa_ptr: SignatureBuiltin*,
        bitwise_ptr: BitwiseBuiltin*,
        range_check_ptr,
    }(call_array_len: felt, call_array: AccountCallArray*, calldata_len: felt, calldata: felt*) -> (
        response_len: felt, response: felt*
    ) {
        alloc_locals;

        let (tx_info) = get_tx_info();
        // Disallow deprecated tx versions
        with_attr error_message("Account: deprecated tx version") {
            assert is_le_felt(TRANSACTION_VERSION, tx_info.version) = TRUE;
        }

        // Assert not a reentrant call
        let (caller) = get_caller_address();
        with_attr error_message("Account: reentrant call") {
            assert caller = 0;
        }

        // TMP: Convert `AccountCallArray` to 'Call'.
        let (calls: Call*) = alloc();
        _from_call_array_to_call(call_array_len, call_array, calldata, calls);
        let calls_len = call_array_len;

        // Execute call
        let (response: felt*) = alloc();
        let (response_len) = _execute_list(calls_len, calls, response);

        return (response_len=response_len, response=response);
    }

    func _execute_list{syscall_ptr: felt*}(calls_len: felt, calls: Call*, response: felt*) -> (
        response_len: felt
    ) {
        alloc_locals;

        // if no more calls
        if (calls_len == 0) {
            return (response_len=0);
        }

        // do the current call
        let this_call: Call = [calls];
        let res = call_contract(
            contract_address=this_call.to,
            function_selector=this_call.selector,
            calldata_size=this_call.calldata_len,
            calldata=this_call.calldata,
        );
        // copy the result in response
        memcpy(response, res.retdata, res.retdata_size);
        // do the next calls recursively
        let (response_len) = _execute_list(
            calls_len - 1, calls + Call.SIZE, response + res.retdata_size
        );
        return (response_len=response_len + res.retdata_size);
    }

    func _from_call_array_to_call{syscall_ptr: felt*}(
        call_array_len: felt, call_array: AccountCallArray*, calldata: felt*, calls: Call*
    ) {
        // if no more calls
        if (call_array_len == 0) {
            return ();
        }

        // parse the current call
        assert [calls] = Call(
            to=[call_array].to,
            selector=[call_array].selector,
            calldata_len=[call_array].data_len,
            calldata=calldata + [call_array].data_offset
            );
        // parse the remaining calls recursively
        _from_call_array_to_call(
            call_array_len - 1, call_array + AccountCallArray.SIZE, calldata, calls + Call.SIZE
        );
        return ();
    }
    //
}
