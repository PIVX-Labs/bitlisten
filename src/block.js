/** 
 *  @constructor
 *  @extends Floatable
 */
 function Block(height, numTransactions, outputTotal, blockSize) {
	if (document.visibilityState === "visible") {
		Floatable.call(this);

		var outputBTC = outputTotal.toLocaleString('en-GB', { maximumFractionDigits: 2 }) + " PIV";
		var blockSizeKB = (blockSize / 1000).toLocaleString('en-GB', { maximumFractionDigits: 2 }) + " KB";

		this.width = this.height = 500;

		this.addImage(blockImage, this.width, this.height);
		this.addText("Block #" + height.toLocaleString('en-GB') + "<br />Number of Transactions: " + numTransactions + /*"<br />Transaction Volume: " + outputBTC +*/ "<br />Block Size: " + blockSizeKB);
		this.initPosition();
	
        // Sound
        Sound.playRandomSwell();
	}
}

extend(Floatable, Block);
