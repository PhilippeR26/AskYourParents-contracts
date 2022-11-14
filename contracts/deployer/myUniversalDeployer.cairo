%lang starknet
// myUniversalDeployer.cairo
// deployer contract, to deploy instances of any class contract, with automatic management of Salt (to not have the same adress for 2 instances).

from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.starknet.common.syscalls import deploy
from starkware.cairo.common.bool import TRUE

// Define a storage variable for the salt.
@storage_var
func salt(classHash: felt) -> (value: felt) {
}

@event
func contract_deployed(contract_address: felt) {
}

@view
func view_salt{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    clash_hash: felt
) -> (salt: felt) {
    let (_salt) = salt.read(clash_hash);
    return (salt=_salt);
}

@external
func deploy_contract{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    class_hash: felt, params_len: felt, params: felt*
) {
    alloc_locals;

    let (ch_exist) = salt.read(class_hash);
    local _salt;
    if (ch_exist == 0) {
        _salt = 1;
    } else {
        _salt = ch_exist;
    }
    let (contract_address) = deploy(
        class_hash=class_hash,
        contract_address_salt=_salt,
        constructor_calldata_size=params_len,
        constructor_calldata=params,
        deploy_from_zero=TRUE,
    );
    salt.write(class_hash, _salt + 1);
    // %{
    //     print(f"*****_salt =  {ids._salt}")
    //     print(f"**** contract_address = {ids.contract_address}")
    // %}
    contract_deployed.emit(contract_address=contract_address);
    return ();
}
