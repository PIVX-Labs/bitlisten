// The TX offset for coinbase transactions, avoids including them in 'output' or TX count calcs
const COINBASE_OFFSET = 2;

/** @constructor */
function TransactionSocket() {

}

const arrFoundTXs = [];
let strLastBlock = "";

let checkInterval = null;

// Process an individual TX's properties and push it to the frontend
function processTx(txReq) {
	if (txReq.status == 200) {
		// Parse mempool from request
		const cTx = JSON.parse(txReq.responseText);
		StatusBox.connected();

		// Remember this TX
		arrFoundTXs.push(cTx.txid);

		// Calculate TX traits
		const nValue = cTx.vout.reduce((a, b) => a + Number(b.value), 0) / COIN;

		// If it has a value, send it!
		if (nValue) {
			// Check if a donation highlight is needed
			const fHighlight = cTx.vout.some(a => a.addresses.includes(DONATION_ADDRESS));

			new Transaction(nValue, fHighlight);
		}
	} else {
		console.error('Tx Error!');
		console.error(txReq.responseText);
	}
}

// Process a block's properties and push it to the frontend
function processBlock(blockReq) {
	if (blockReq.status === 200) {
		// Parse block from request
		const cBlock = JSON.parse(blockReq.responseText);
		StatusBox.connected();

		// Do we have a next block yet? And don't check the same block twice!
		if (cBlock.nextBlockHash) return checkForNewTxOrBlock(true, cBlock.nextBlockHash);
		else if (cBlock.hash === strLastBlock) return;

		// Remember this block
		strLastBlock = cBlock.hash;

		// Calculate money movement (excluding coinbase)
		const nMoved = cBlock.txs.slice(COINBASE_OFFSET, cBlock.txCount).reduce((a, b) => a + b.vout.reduce((c, d) => c + Number(d.value), 0), 0) / COIN;

		// Push block to frontend handler
		new Block(cBlock.height, cBlock.txCount - COINBASE_OFFSET, nMoved, cBlock.size);
	} else {
		console.error('Block Error!');
		console.error(blockReq.responseText);
	}
}

// Fetch an individual raw TX and process it
function getTx(strHash) {
	// Skip TXs we've already seen (saves a ton of bandwidth!)
	if (arrFoundTXs.includes(strHash)) return;

	const txReq = new XMLHttpRequest();
	txReq.onload = function () { processTx(txReq) };
	txReq.open('GET', 'https://zkbitcoin.com/api/v2/tx/' + strHash);
	txReq.send();
}

// Check for either new mempool changes or new blocks
function checkForNewTxOrBlock(fBlockOnly = false, strBlockHash = strLastBlock) {
	// Check the mempool
	if (!fBlockOnly) {
		const mempoolReq = new XMLHttpRequest();
		mempoolReq.onload = function () {
			// Parse the mempool and fetch each raw TX for processing
			const arrMempool = JSON.parse(mempoolReq.responseText).mempool;
			arrMempool.forEach(cTx => getTx(cTx.txid));
		};
		mempoolReq.open('GET', 'https://zkbitcoin.com/api/v2/mempool/');
		mempoolReq.send();
	}

	// Grab our current block hash, if none exist
	if (!strLastBlock) {
		const initBlockReq = new XMLHttpRequest();
		initBlockReq.onload = function () {
			strLastBlock = JSON.parse(initBlockReq.responseText).backend.bestBlockHash;
			checkForNewTxOrBlock(true);
		};
		initBlockReq.open('GET', 'https://zkbitcoin.com/api/v2/api');
		initBlockReq.send();
	} else {
		// Otherwise, fetch the current block (or next block if available)
		const blockReq = new XMLHttpRequest();
		blockReq.onload = function () { processBlock(blockReq) };
		blockReq.open('GET', 'https://zkbitcoin.com/api/v2/block/' + strBlockHash);
		blockReq.send();
	}
}

TransactionSocket.init = function() {
	// Terminate previous connection, if any
	clearInterval(checkInterval);
	StatusBox.reconnecting();

	checkInterval = setInterval(checkForNewTxOrBlock, 5000);
};

TransactionSocket.close = function() {
	clearInterval(checkInterval);
	StatusBox.closed();
};
