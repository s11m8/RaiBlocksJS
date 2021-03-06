/*
* RaiBlocks JavaScript RPC requests and basic functions
* https://github.com/SergiySW/RaiBlocksJS
*
* Released under the BSD 3-Clause License
*
*
* RPC commands full list
* https://github.com/clemahieu/raiblocks/wiki/RPC-protocol
*
*
* set 'request' as string. Samples
*	JSON.stringify({"action":"block_count"})
*	'{"action":"block_count"}'
*
* set 'url_base' as string. Mask protocol://host:port. Default value is http://localhost:7076. Samples
*	http://localhost:7076
*	https://skyhold.asuscomm.com:7077
*
* set 'async' as boolean. Default value is false
* Note: Now only sync requests are available. Async for future developments
*
* Request sample
*	var rai = new Rai();
*	var block_count = rai.rpc(JSON.stringify({"action":"block_count"}), 'http://localhost:7076', false);
*	
*/

var XRB = XRB || {};

XRB.error = function(error) {
	try { alert(error); }
	catch (e) { }
	console.error(error);
}

// Extended function, bignumber.js is required
XRB.unit = function(input, input_unit, output_unit) {
	
	var value = new BigNumber(input.toString());
	
	// Step 1: to RAW
	switch(input_unit) {
		case 'raw': value = value; break;
		case 'XRB': value = value.shift(30); break;
		case 'Trai': value = value.shift(36); break; // draft
		case 'Grai': value = value.shift(33); break;
		case 'Mrai': value = value.shift(30); break;
		case 'krai': value = value.shift(27); break;
		case 'rai': value = value.shift(24); break;
		case 'mrai': value = value.shift(21); break;
		case 'urai': value = value.shift(18); break;
		case 'prai': value = value.shift(15); break; // draft
		default: value = value;
	}
	
	// Step 2: to output
	switch(output_unit) {
		case 'raw': value = value; break;
		case 'XRB': value = value.shift(-30); break;
		case 'Trai': value = value.shift(-36); break; // draft
		case 'Grai': value = value.shift(-33); break;
		case 'Mrai': value = value.shift(-30); break;
		case 'krai': value = value.shift(-27); break;
		case 'rai': value = value.shift(-24); break;
		case 'mrai': value = value.shift(-21); break;
		case 'urai': value = value.shift(-18); break;
		case 'prai': value = value.shift(-15); break; // draft
		default: value = value;
	}
	
	value = value.toFixed(0);
	return value;
}

// Use for RAW
XRB.minus = function(base, minus) {
	var value = new BigNumber(base.toString());
	var big_minus = new BigNumber(minus.toString());
	if (big_minus.greaterThan(value)) {
		XRB.error('Incorrect amount');
		return false;
	}
	else {
		value = value.minus(big_minus);
		value = value.toFixed(0);
		return value;
	}
}

// Use for RAW
XRB.plus = function(base, plus) {
	var value = new BigNumber(base.toString());
	var big_plus = new BigNumber(plus.toString());
	value = value.plus(big_plus);
	value = value.toFixed(0);
	return value;
}

// Use for RAW
XRB.raw_to_hex = function(raw) {
	var value = new BigNumber(raw.toString());
	value = value.toString(16).toUpperCase();
	if (value.length < 32)	for (let n = value.length; n < 32; n++)	value = "0" + value;
	return value;
}


function Rai(url_base) {

this.error = function(error) {
	XRB.error(error);
}


this.rpc = function(request, async_callback) {
	try {
		var url = document.createElement('a');
		if (typeof url_base == 'undefined') { url.href = 'http://localhost'; } // if url is not set, use default to localhost
		else if (!url_base.startsWith('http')) { url.href = 'http://' + url_base.split('/').reverse()[0]; } // local files are not supported; default protocol = HTTP
		else { url.href = url_base; }
			
		if (url.port== "") { url.port = '7076'; } // default port 7076
	} catch (e) {
		if (e instanceof ReferenceError) {
			if (typeof url_base == 'undefined') { var url = 'http://localhost:7076'; }
			else { var url = url_base; }
		}
		else { console.error(e); }
	}
	
	try {
		// Asynchronous
		if (typeof async_callback == 'function') {
			let xhr;
			xhr = new XMLHttpRequest();
			xhr.onload = function (e) {
				if (xhr.readyState === 4 && xhr.status === 200) {
					let json = JSON.parse(xhr.responseText);
					// Errors as JSON
					let error = json.error;
					if (typeof error != 'undefined') {
						this.error(error);
					}
					async_callback(json);
				}
				else {
					console.error('XHR Failure');
				}
			};
			
			xhr.onerror = function (e) {
				console.error(xhr.statusText);
			};
			
			xhr.open("POST", url, true);
			xhr.send(request);
		}
		
		// Synchronous
		else {
			let xhr;
			xhr = new XMLHttpRequest();
			xhr.open("POST", url, false);
			xhr.send(request);
			
			if (xhr.readyState == 4 && xhr.status == 200) {
				let json = JSON.parse(xhr.responseText);
				// Errors as JSON
				let error = json.error;
				if (typeof error != 'undefined') {
					this.error(error);
					return false;
				}
				return json;
			}
			else {
				console.error('XHR Failure');
			}
		}
	}
	catch (ex) {
		this.error(ex.message);
	}
}


this.unit = function(input, input_unit, output_unit) {
	return XRB.unit(input, input_unit, output_unit);
}


// Object output
this.account_balance = function(account) {
	var account_balance = this.rpc(JSON.stringify({"action":"account_balance","account":account}));
	return account_balance;
}


// String output
this.account_block_count = function() {
	var account_block_count = this.rpc(JSON.stringify({"action":"account_block_count","account":account}));
	return account_block_count.block_count;
}


this.account_create = function(wallet) {
	var account_create = this.rpc(JSON.stringify({"action":"account_create","wallet":wallet}));
	return account_create.account;
}


this.account_history = function(account, count = '4096') {
	var account_history = this.rpc(JSON.stringify({"action":"account_history","account":account,"count":count}));
	return account_history.history;
}


this.account_get = function(key) {
	var account_get = this.rpc(JSON.stringify({"action":"account_get","key":key}));
	return account_get.account;
}


this.account_key = function(account) {
	var account_key = this.rpc(JSON.stringify({"action":"account_key","account":account}));
	return account_key.key;
}


this.account_list = function(wallet) {
	var account_list = this.rpc(JSON.stringify({"action":"account_list","wallet":wallet}));
	return account_list.accounts;
}


// accounts is array
this.account_move = function(wallet, source, accounts) {
	var account_move = this.rpc(JSON.stringify({"action":"account_move","wallet":wallet,"source":source,"accounts":accounts}));
	return account_move.moved;
}


this.account_remove = function(wallet, account) {
	var account_remove = this.rpc(JSON.stringify({"action":"account_remove","wallet":wallet,"account":account}));
	return account_remove.removed;
}


this.account_representative = function(account) {
	var account_representative = this.rpc(JSON.stringify({"action":"account_representative","account":account}));
	return account_representative.representative;
}


this.account_representative_set = function(wallet, account, representative) {
	var account_representative_set = this.rpc(JSON.stringify({"action":"account_representative_set","wallet":wallet,"account":account,"representative":representative}));
	return account_representative_set.block;
}


// String output
this.account_weight = function(account, unit = 'raw') {
	var rpc_account_weight = this.rpc(JSON.stringify({"action":"account_weight","account":account}));
	var account_weight = this.unit(rpc_account_weight.weight, 'raw', unit);
	return account_weight;
}

// Array input
this.accounts_balances = function(accounts) {
	var accounts_balances = this.rpc(JSON.stringify({"action":"accounts_balances","accounts":accounts}));
	return accounts_balances.balances;
}


// Array input
this.accounts_frontiers = function(accounts) {
	var accounts_frontiers = this.rpc(JSON.stringify({"action":"accounts_frontiers","accounts":accounts}));
	return accounts_frontiers.frontiers;
}


// Array input
this.accounts_pending = function(accounts, count = '4096') {
	var accounts_pending = this.rpc(JSON.stringify({"action":"accounts_pending","accounts":accounts,"count":count}));
	return accounts_pending.blocks;
}


// String output
this.available_supply = function(unit = 'raw') {
	var rpc_available_supply = this.rpc(JSON.stringify({"action":"available_supply"}));
	var available_supply = this.unit(rpc_available_supply.available, 'raw', unit);
	return available_supply;
}


this.block = function(hash) {
	var rpc_block = this.rpc(JSON.stringify({"action":"block","hash":hash}));
	var block = JSON.parse(rpc_block.contents);
	return block;
}


// Array input
this.blocks = function(hashes) {
	var rpc_blocks = this.rpc(JSON.stringify({"action":"blocks","hashes":hashes}));
	var blocks = rpc_blocks.blocks;
	for(let key in blocks){
		blocks[key] = JSON.parse(blocks[key]);
	}
	return blocks;
}


this.block_account = function(hash) {
	var block_account = this.rpc(JSON.stringify({"action":"block_account","hash":hash}));
	return block_account.account;
}


// Object output
this.block_count = function() {
	var block_count = this.rpc(JSON.stringify({"action":"block_count"}));
	return block_count;
}


// Empty output
this.bootstrap = function(address = '::ffff:138.201.94.249', port = '7075') {
	var bootstrap = this.rpc(JSON.stringify({"action":"bootstrap", "address":address, "port":port}));
	return bootstrap.success;
}


// Empty output
this.bootstrap_any = function() {
	var bootstrap_any = this.rpc(JSON.stringify({"action":"bootstrap_any"}));
	return bootstrap_any.success;
}


this.chain = function(block, count = '4096') {
	var chain = this.rpc(JSON.stringify({"action":"chain","block":block,"count":count}));
	return chain.blocks;
}


// Object output
this.deterministic_key = function(seed, index = 0) {
	var deterministic_key = this.rpc(JSON.stringify({"action":"deterministic_key","seed":seed, "index":index}));
	return deterministic_key;
}


this.frontiers = function(account = 'xrb_1111111111111111111111111111111111111111111111111117353trpda', count = '1048576') {
	var rpc_frontiers = this.rpc(JSON.stringify({"action":"frontiers","account":account,"count":count}));
	return rpc_frontiers.frontiers;
}


// String output
this.frontier_count = function() {
	var frontier_count = this.rpc(JSON.stringify({"action":"frontier_count"}));
	return frontier_count.count;
}


this.history = function(hash, count = '4096') {
	var rpc_history = this.rpc(JSON.stringify({"action":"history","hash":hash,"count":count}));
	return rpc_history.history;
}


// Use this.unit instead of this function
// String input and output
this.mrai_from_raw = function(amount) {
	var mrai_from_raw = this.rpc(JSON.stringify({"action":"mrai_from_raw","amount":amount}));
	return mrai_from_raw.amount;
}


// Use this.unit instead of this function
// String input and output
this.mrai_to_raw = function(amount) {
	var mrai_to_raw = this.rpc(JSON.stringify({"action":"mrai_to_raw","amount":amount}));
	return mrai_to_raw.amount;
}


// Use this.unit instead of this function
// String input and output
this.krai_from_raw = function(amount) {
	var krai_from_raw = this.rpc(JSON.stringify({"action":"krai_from_raw","amount":amount}));
	return krai_from_raw.amount;
}


// Use this.unit instead of this function
// String input and output
this.krai_to_raw = function(amount) {
	var krai_to_raw = this.rpc(JSON.stringify({"action":"krai_to_raw","amount":amount}));
	return krai_to_raw.amount;
}


// Use this.unit instead of this function
// String input and output
this.rai_from_raw = function(amount) {
	var rai_from_raw = this.rpc(JSON.stringify({"action":"rai_from_raw","amount":amount}));
	return rai_from_raw.amount;
}


// Use this.unit instead of this function
// String input and output
this.rai_to_raw = function(amount) {
	var rai_to_raw = this.rpc(JSON.stringify({"action":"rai_to_raw","amount":amount}));
	return rai_to_raw.amount;
}


this.keepalive = function(address = '::ffff:192.168.1.1', port = '7075') {
	var keepalive = this.rpc(JSON.stringify({"action":"keepalive","address":address,"port":port}));
	return keepalive;
}


// Object output
this.key_create = function() {
	var key_create = this.rpc(JSON.stringify({"action":"key_create"}));
	return key_create;
}


// Object output
this.key_expand = function(key) {
	var key_expand = this.rpc(JSON.stringify({"action":"key_expand","key":key}));
	return key_expand;
}


this.password_change = function(wallet, password) {
	var password_change = this.rpc(JSON.stringify({"action":"password_change","wallet":wallet,"password":password}));
	return password_change.changed;
}


this.password_enter = function(wallet, password) {
	var rpc_password_enter;
	if (typeof password == 'undefined') rpc_password_enter = this.rpc(JSON.stringify({"action":"password_enter","wallet":wallet,"password":""}));
	else password_enter = this.rpc(JSON.stringify({"action":"password_enter","wallet":wallet,"password":password}));
	return password_enter.valid;
}


this.password_valid = function(wallet) {
	var password_valid = this.rpc(JSON.stringify({"action":"password_valid","wallet":wallet}));
	return password_valid.valid;
}


this.payment_begin = function(wallet) {
	var payment_begin = this.rpc(JSON.stringify({"action":"payment_begin","wallet":wallet}));
	return payment_begin.account;
}


this.payment_init = function(wallet) {
	var payment_init = this.rpc(JSON.stringify({"action":"payment_init","wallet":wallet}));
	return payment_init.status;
}


this.payment_end = function(account, wallet) {
	var payment_end = this.rpc(JSON.stringify({"action":"payment_end","account":account,"wallet":wallet}));
	return payment_end;
}


// String input
this.payment_wait = function(account, amount, timeout) {
	var payment_wait = this.rpc(JSON.stringify({"action":"payment_wait","account":account,"amount":amount,"timeout":timeout}));
	return payment_wait.status;
}


// block as Object
this.process = function(block) {
	var process = this.rpc(JSON.stringify({"action":"process","block":block}));
	return process;
}


this.peers = function() {
	var rpc_peers = this.rpc(JSON.stringify({"action":"peers"}));
	return rpc_peers.peers;
}


this.pending = function(account, count = '4096') {
	var pending = this.rpc(JSON.stringify({"action":"pending","account":account,"count":count}));
	return pending.blocks;
}


this.receive = function(wallet, account, block) {
	var receive = this.rpc(JSON.stringify({"action":"receive","wallet":wallet,"account":account,"block":block}));
	return receive.block;
}


this.representatives = function() {
	var rpc_representatives = this.rpc(JSON.stringify({"action":"representatives"}));
	return rpc_representatives.representatives;
}


// Empty output
this.republish = function(hash) {
	var republish = this.rpc(JSON.stringify({"action":"republish", "hash":hash}));
	return republish.success;
}


this.search_pending = function(wallet) {
	var search_pending = this.rpc(JSON.stringify({"action":"search_pending","wallet":wallet}));
	return search_pending.started;
}


this.send = function(wallet, source, destination, amount, unit = 'raw') {
	var raw_amount = this.unit(amount, unit, 'raw');
	var send = this.rpc(JSON.stringify({"action":"send","wallet":wallet,"source":source,"destination":destination,"amount":raw_amount}));
	return send.block;
}


this.stop = function() {
	var stop = this.rpc(JSON.stringify({"action":"stop"}));
	return stop;
}


this.successors = function(block, count = '4096') {
	var successors = this.rpc(JSON.stringify({"action":"successors","block":block,"count":count}));
	return successors.blocks;
}


this.validate_account_number = function(account) {
	var validate_account_number = this.rpc(JSON.stringify({"action":"validate_account_number","account":account}));
	return validate_account_number.valid;
}


this.version = function() {
	var version = this.rpc(JSON.stringify({"action":"version"}));
	return version;
}


this.wallet_add = function(wallet, key) {
	var wallet_add = this.rpc(JSON.stringify({"action":"wallet_add","wallet":wallet,"key":key}));
	return wallet_add.account;
}


// Object output
this.wallet_balance_total = function(wallet) {
	var wallet_balance_total = this.rpc(JSON.stringify({"action":"wallet_balance_total","wallet":wallet}));
	return wallet_balance_total;
}


this.wallet_balances = function(wallet) {
	var wallet_balances = this.rpc(JSON.stringify({"action":"wallet_balances","wallet":wallet}));
	return wallet_balances.balances;
}


// Empty output
this.wallet_change_seed = function(wallet, seed) {
	var wallet_change_seed = this.rpc(JSON.stringify({"action":"wallet_change_seed", "wallet":wallet, "seed":seed}));
	return wallet_change_seed.success;
}


this.wallet_contains = function(wallet, account) {
	var wallet_contains = this.rpc(JSON.stringify({"action":"wallet_contains","wallet":wallet,"account":account}));
	return wallet_contains.exists;
}


this.wallet_create = function() {
	var wallet_create = this.rpc(JSON.stringify({"action":"wallet_create"}));
	return wallet_create.wallet;
}


this.wallet_destroy = function(wallet) {
	var wallet_destroy = this.rpc(JSON.stringify({"action":"wallet_destroy","wallet":wallet}));
	return wallet_destroy;
}


// Return as array or as JSON/Object?
this.wallet_export = function(wallet) {
	var wallet_export = this.rpc(JSON.stringify({"action":"wallet_export","wallet":wallet}));
	return wallet_export.json;
}


this.wallet_frontiers = function(wallet) {
	var wallet_frontiers = this.rpc(JSON.stringify({"action":"wallet_frontiers","wallet":wallet}));
	return wallet_frontiers.frontiers;
}


this.wallet_representative = function(wallet) {
	var wallet_representative = this.rpc(JSON.stringify({"action":"wallet_representative","wallet":wallet}));
	return wallet_representative.representative;
}


this.wallet_representative_set = function(wallet, representative) {
	var wallet_representative_set = this.rpc(JSON.stringify({"action":"wallet_representative_set","wallet":wallet,"representative":representative}));
	return wallet_representative_set.set;
}


this.work_cancel = function(hash) {
	var work_cancel = this.rpc(JSON.stringify({"action":"work_cancel","hash":hash}));
	return work_cancel;
}


this.work_generate = function(hash) {
	var work_generate = this.rpc(JSON.stringify({"action":"work_generate","hash":hash}));
	return work_generate.work;
}

this.work_validate = function(work, hash) {
	var work_validate = this.rpc(JSON.stringify({"action":"work_validate","work":work,"hash":hash}));
	return work_validate.valid;
}

};
