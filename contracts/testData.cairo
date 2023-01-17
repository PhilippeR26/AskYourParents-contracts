%lang starknet
%builtins pedersen range_check

from starkware.cairo.common.cairo_builtins import HashBuiltin

// Define a storage variable.

struct Uint256 {
    low: felt,
    high: felt,
}

struct c3D {
    x0: felt,
    y0: felt,
    z0: felt,
}

@storage_var
func balance() -> (res: felt) {
}
@constructor
func constructor{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    initial_balance: felt, list_len: felt, list: Uint256*
) {
    balance.write(initial_balance);
    return ();
}

@view
func get_balance1{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    amount1: felt,
    amount2: felt,
    amount3: felt,
    amount4: felt,
    number: felt,
    my_uint: Uint256,
    coord: c3D,
    title: felt,
) -> (
    amount1: felt,
    amount2: felt,
    amount3: felt,
    amount4: felt,
    number: felt,
    my_uint: Uint256,
    coord: c3D,
    title: felt,
) {
    let (res) = balance.read();
    return (
        amount1=amount1,
        amount2=amount2,
        amount3=amount3,
        amount4=amount4,
        number=number,
        my_uint=my_uint,
        coord=coord,
        title=title,
    );
}

@view
func get_arr{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    BN_len: felt, BN: felt*, number_len: felt, number: Uint256*, title_len: felt, title: felt*
) -> (BN_len: felt, BN: felt*, number_len: felt, number: Uint256*, title_len: felt, title: felt*) {
    let (res) = balance.read();
    return (
        BN_len=BN_len, BN=BN, number_len=number_len, number=number, title_len=title_len, title=title
    );
}

@external
func set_balance{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    amount1: felt, amount2: felt, amount3: felt
) {
    balance.write(amount1 - amount2 + amount3);
    return ();
}

// Returns the current balance.
@view
func get_balance{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (res: felt) {
    let (res) = balance.read();
    return (res=res);
}
