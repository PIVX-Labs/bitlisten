/** 
 *  @constructor
 *  @extends Floatable
 */
 function Transaction(bitcoins, highlight, currency, currencyName) {
	Floatable.call(this);

	this.area = bitcoins * 100 + 3000;
	this.width = this.height = Math.sqrt(this.area / Math.PI) * 2;
	this.addImage(bubbleImage, this.width, this.height);

	const strPIV = bitcoins.toFixed(2);
	let strPIVDisplay = "";
	
	if (strPIV === "0.00") {
	    strPIVDisplay = "&lt;0.01<span class='bitcoinsymbol'>PIV</span>";
	} else {
	    strPIVDisplay = strPIV + "<span class='bitcoinsymbol'>PIV</span>" ;
	}

	if (!highlight) {
		this.addText(strPIVDisplay);
	} else {
		this.addText('<span style="color: yellow;">' + strPIVDisplay + '</span><br /><span style="color: cyan;">Donation</span><br /><span style="color: lime;">Thanks!</span>');
	}
	if (currency && currencyName) {
		this.addText('<br />' + currency.toFixed(2) + ' ' + currencyName);
	}
	this.initPosition();
	
	// Sound
	const maxBitcoins = 1000;
	const minVolume = 0.3;
	const maxVolume = 0.7;
	var volume = bitcoins / (maxBitcoins / (maxVolume - minVolume)) + minVolume;
	if (volume > maxVolume)
	    volume = maxVolume;

	const maxPitch = 100.0;
	// We need to use a log that makes it so that maxBitcoins reaches the maximum pitch.
	// Well, the opposite of the maximum pitch. Anyway. So we solve:
	// maxPitch = log(maxBitcoins + logUsed) / log(logUsed)
	// For maxPitch = 100 (for 100%) and maxBitcoins = 1000, that gives us...
	const logUsed = 1.0715307808111486871978099;
	// So we find the smallest value between log(bitcoins + logUsed) / log(logUsed) and our max pitch...
	let pitch = Math.min(maxPitch, Math.log(bitcoins + logUsed) / Math.log(logUsed));
	// ...we invert it so that a bigger transaction = a deeper noise...
	pitch = maxPitch - pitch;
	// ...and we play the sound!
	if (globalScalePitch) {
	    Sound.playPitchAtVolume(volume, pitch);
	} else {
	    Sound.playRandomAtVolume(volume);
	}
}

extend(Floatable, Transaction);
