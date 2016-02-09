// ==UserScript==
// @name        FLOAT INSPECTOR
// @include     http://steamcommunity.com/market/listings/730/*
// @require		http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js
// @require		https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant    	GM_addStyle
// @grant		GM_xmlhttpRequest
// ==/UserScript==

waitForKeyElements (
    "#searchResultsRows div.market_listing_table_header",
    showMarketID
);

function showMarketID(){	
	$(".market_listing_seller").after("<span style='width:140px' class='market_listing_right_cell market_listing_action_buttons market_listing_wear'>WEAR</span>");
	
	$('.market_listing_row').each( function(e) {				
		$(this).find('.market_listing_wear').empty();
		$(this).find('.market_listing_wear').append("<div style='width:140px' class='myButton market_listing_right_cell market_listing_action_buttons' title='" + $(this).attr('id') + "'><a class='btn_green_white_innerfade btn_small'><span>Get Wear Value (Float)</span></a></div>");
	});
	
	$(".myButton").click (LoadFloatValue);
}

function LoadFloatValue(){
	$(this).find('span').text('Loading..');
	$(".myButton").off();
	
	var rowid = $(this).attr('title');
	var listingid = rowid.replace('listing_', '');
	var assetid = unsafeWindow.g_rgListingInfo[listingid].asset.id;
	var hashid = unsafeWindow.g_rgListingInfo[listingid].asset.market_actions[0].link;
	hashid = hashid.replace('steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20M%listingid%A%assetid%D', '');
	
	var message = "";
	var url = "http://csgo.exchange/item/floatapi/" + listingid + "/" + assetid + "/" + hashid;
	GM_xmlhttpRequest ({
		method:     "GET",
		url:        url,		
		headers:    {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		onload:     function (response) {
			results = jQuery.parseJSON(response.responseText);
			if(results['status'] == 1) message = results['exterior'];
			else if(results['status'] == 0) message = "Bad Parameters";
			else if(results['status'] == 4) message = "Miss Parameter";
			else if(results['status'] == 2) message = "Click Again";
			else if(results['status'] == 3) message = "Not Access Pass";
			else if(results['status'] == 6) message = "Login on csgo.exchange";
			else if(results['status'] == 9) message = "Quota Limit";			
				
			$("#" + rowid + " .market_listing_wear span").text(message);
			$(".myButton").click (LoadFloatValue);
		}
	});
}
