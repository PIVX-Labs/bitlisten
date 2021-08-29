var satoshi = 100000000;
var DELAY_CAP = 20000;
var lastBlockHeight = 0;

var provider_name = "mypivxwallet.org";

var transactionSocketDelay = 1000;

/** @constructor */
function TransactionSocket() {

}

var arrFoundTXs = [];
var arrFoundBlocks = [];

var checkInterval = null;
var mempoolReq;
var blockReq;

function processMempool() {
	if (mempoolReq.status == 200) {
		var arrTXs = JSON.parse(mempoolReq.responseText);
		StatusBox.connected("blockchain");
		// Loop all TXs in the mempool
		for (var i=0; i<arrTXs.length; i++) {
			// Skip TXs we've already seen
			if (arrFoundTXs.find(function (a) { return a === arrTXs[i].txid })) continue;
			console.log('New mempool TX! ' + arrTXs[i].txid);
			arrFoundTXs.push(arrTXs[i].txid);
			// Calculate TX traits
			var nValue = 0;
			for (var n=0; n<arrTXs[i].vout.length; n++) {
				nValue += arrTXs[i].vout[n].value;
			}
			// If it has a value, send it!
			if (nValue > 0)
				new Transaction(nValue);
		}
	} else {
		console.error('Mempool Error!');
		console.error(mempoolReq.responseText);
	}
}

function processBlock() {
	if (blockReq.status === 200) {
		var cBlock = JSON.parse(blockReq.responseText);
		StatusBox.connected("blockchain");
		if (arrFoundBlocks.find(function (a) { return a === cBlock.hash })) return;
		arrFoundBlocks.push(cBlock.hash);
		// Skip the first block (page load)
		if (arrFoundBlocks.length > 1)
			new Block(cBlock.height, cBlock.tx.length, 0, cBlock.size);
	} else {
		console.error('Block Error!');
		console.error(blockReq.responseText);
	}
}

function checkForNewTxOrBlock() {
	// Check the mempool
	mempoolReq = null;
	mempoolReq = new XMLHttpRequest();
	mempoolReq.onload = processMempool;
	mempoolReq.open('GET', 'https://stakecubecoin.net/pivx/mempool');
	mempoolReq.send();
	// Check for a new block
	blockReq = null;
	blockReq = new XMLHttpRequest();
	blockReq.onload = processBlock;
	blockReq.open('GET', 'https://stakecubecoin.net/pivx/bestblock');
	blockReq.send();
}

TransactionSocket.init = function() {
	// Terminate previous connection, if any
	if (checkInterval !== null) {
		clearInterval(checkInterval);
		checkInterval = null;
	} else {
		StatusBox.reconnecting("blockchain");
	}

	checkInterval = setInterval(checkForNewTxOrBlock, 2500);
};

TransactionSocket.close = function() {
	if (checkInterval !== null) {
		clearInterval(checkInterval);
		checkInterval = null;
		StatusBox.closed("blockchain");
	}
};
