//
// SPDX-License-Identifier: MIT
// Forked from OpenZeppelin Contracts for Cairo v0.4.0 (account/IChildrenAccount.cairo)

%lang starknet

from ChildrenAccount.library import AccountCallArray

@contract_interface
namespace IChildrenAccount {
    func supportsInterface(interfaceId: felt) -> (success: felt) {
    }

    func isValidSignature(hash: felt, signature_len: felt, signature: felt*) -> (isValid: felt) {
    }

    func __validate__(
        call_array_len: felt, call_array: AccountCallArray*, calldata_len: felt, calldata: felt*
    ) {
    }

    // Parameter temporarily named `cls_hash` instead of `class_hash` (expected).
    // See https://github.com/starkware-libs/cairo-lang/issues/100 for details.
    func __validate_declare__(cls_hash: felt) {
    }

    func __execute__(
        call_array_len: felt, call_array: AccountCallArray*, calldata_len: felt, calldata: felt*
    ) -> (response_len: felt, response: felt*) {
    }
}
