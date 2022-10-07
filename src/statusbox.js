const CONNECTED = "Connected.";
const CONNECTING = "Connecting...";
const NO_SUPPORT = "No browser support.";
const CLOSED = "Click to connect.";

function StatusBox() {

}

StatusBox.init = function(debugmode) {
	StatusBox.blockchain = $("#blockchainStatus");

	if (debugmode) StatusBox.blockchain.html("");

	if ($("#blockchainCheckBox").is(":checked"))
		StatusBox.reconnecting();
	else
		StatusBox.closed();
};

StatusBox.connected = function() {
	StatusBox.blockchain.html('Transactions (' + provider_name + '): <span style="color: green;">' + CONNECTED + '</span>');
};

StatusBox.reconnecting = function() {
	StatusBox.blockchain.html('Transactions (' + provider_name + '): <span style="color: yellow;">' + CONNECTING + '</span>');
};

StatusBox.closed = function() {
	StatusBox.blockchain.html('Transactions (' + provider_name + '): <span style="color: gray;">' + CLOSED + '</span>');
};
