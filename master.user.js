// ==UserScript==
// @name        FLOAT INSPECTOR
// @include     http://steamcommunity.com/market/listings/730/*
// @require		http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js
// @require		https://raw.githubusercontent.com/LeonSK/WearMarketInspector/master/waitForKeyElements.js
// @grant    	GM_addStyle
// @grant		GM_xmlhttpRequest
// @version		2.0.0
// ==/UserScript==
waitForKeyElements ("#searchResultsRows div.market_listing_table_header", showMarketID);

$("#searchResultsTable").before('<div class="market_listing_filter_contents"><span class="market_listing_filter_searchhint">Search for float value <= </span><span style="position: relative; display: inline-block;"><input class="filter_search_box market_search_filter_search_box" id="market_listing_filter_float" value="" placeholder="0.XXXXXXXXXXX" name="filter" autocomplete="off" type="text"> <a class="btn_green_white_innerfade btn_small btn_searchall"><span>Get All Wears (Float Value)</span></a></span></div>');
$(".btn_searchall").click (LoadAll);

$("#BG_bottom").css("width", "1200px");
$(".market_page_fullwidth").css("max-width", "1200px");

function showMarketID(){	
	$(".market_listing_seller").after("<span style='width:140px' class='market_listing_right_cell market_listing_action_buttons market_listing_wear'>WEAR (FLOAT VALUE)</span><span style='width:340px' class='market_listing_right_cell market_listing_stickers market_listing_action_buttons'>Stickers</span>");
	$('.market_listing_row').each( function(e) {				
		$(this).find('.market_listing_wear').empty();
		$(this).find('.market_listing_wear').append("<div style='width:135px' class='myButton market_listing_right_cell market_listing_action_buttons' title='" + $(this).attr('id') + "'><a class='btn_green_white_innerfade btn_small'><span>Get Wear Value (Float)</span></a></div>");
		$(this).find('.market_listing_stickers').empty();
		
		var Stickers = "";
		var Srowid = $(this).attr('id');	
		var Slistingid = Srowid.replace('listing_', '');		
		if(!isNaN(Slistingid)){
			var Sassetid = unsafeWindow.g_rgListingInfo[Slistingid].asset.id;			
			
			for(var x=0; x < unsafeWindow.g_rgAssets[730][2][Sassetid].descriptions.length; x++){
				var descp = unsafeWindow.g_rgAssets[730][2][Sassetid].descriptions[x].value;
				if (descp.indexOf("Sticker:") >= 0){
					valStickers = $.parseHTML( descp );
					htmlStickers = valStickers[1];
					Stickers = $('img', htmlStickers);
				}
			}			
		}						
		
		if(Stickers){
			$(this).find('.market_listing_stickers').append("<div style='width:335px' class='market_listing_right_cell item_listing_stickers market_listing_action_buttons'></div>");
			$(this).find('.item_listing_stickers').html(Stickers);
		}
		else $(this).find('.market_listing_stickers').append("<div style='width:335px' class='market_listing_right_cell item_listing_stickers market_listing_action_buttons'>" + Stickers + "</div>");
	});	
	$(".myButton").click (LoadFloatValue);
}

function LoadAll(){			
	$(".btn_searchall span").text('Checking...');
	$(".market_paging_controls").hide();
	$(".btn_searchall").off();
	$(".myButton").off();
	
	var def = [];
	$('.market_listing_row').each( function(e){		
		$myButton = $('.myButton', $(this));		
		var rowid = $myButton.attr('title');
		if(typeof rowid !== 'undefined' && !$myButton.hasClass('wearDone')) def.push(LoadOne($myButton));
	});
	
	$(".btn_searchall span").text('Get All Wears (Float Value)');
	$(".market_paging_controls").show();	
	$(".btn_searchall").click (LoadAll);
	$(".myButton").click (LoadFloatValue);
}

function LoadOne($obj){
	var dfd=$.Deferred();	
	
	$obj.find('span').text('Loading...');	
	
	var rowid = $obj.attr('title');	
	var listingid = rowid.replace('listing_', '');
	var assetid = unsafeWindow.g_rgListingInfo[listingid].asset.id;
	var hashid = unsafeWindow.g_rgListingInfo[listingid].asset.market_actions[0].link;
	hashid = hashid.replace('steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20M%listingid%A%assetid%D', '');
	
	var message = "";
	var url = "http://csgo.exchange/item/floatapi/" + listingid + "/" + assetid + "/" + hashid;
	GM_xmlhttpRequest ({
		method:     "GET",
		url:        url,		
		headers:    {"Content-Type": "application/x-www-form-urlencoded"},
		synchronous: true,
		onload:     function (response) {
			console.log(response.responseText);
			results = jQuery.parseJSON(response.responseText);
			if(results['status'] == 1) message = results['exterior'];
			else if(results['status'] == 0) message = "Bad Parameters";
            else if(results['status'] == 2) message = "Click Again";
            else if(results['status'] == 3) message = "Not Access Pass";
			else if(results['status'] == 4) message = "Miss Parameter";				
			else if(results['status'] == 6) message = "Login on csgo.exchange";
            else if(results['status'] == 7) message = "System On Maintenance";
            else if(results['status'] == 8) message = "Inspect Link Down";
			else if(results['status'] == 9) message = "Quota Limit";						
			$("#" + rowid + " .market_listing_wear span").text(message);
			if($("#" + rowid + " .market_listing_pattern").length == 0){
				
				if(results['exterior'] <= $("#market_listing_filter_float").val()) $obj.find('a').css('border', '2px solid red');
				
				var doppler = "";
				if(typeof results['doppler'] !== 'undefined') doppler = " (Doppler " + results['doppler'] + ")";
				if(typeof results['pattern'] !== 'undefined') $("#" + rowid + " .market_listing_item_name_block").append("<br><span class='market_listing_game_name market_listing_pattern'>Pattern Index: " + results['pattern'] + doppler + "</span>");
				if(typeof results['stickers'] !== 'undefined'){
					var stickers = "";
					for (var i = 0; i < 5; i++) {
						if(typeof results['stickers'][i] !== 'undefined'){
							stickers += " ~ Slot " + results['stickers'][i]['slot'] + " = " + results['stickers'][i]['name'];
							if(results['stickers'][i]['scratch'] > 0) stickers += " <b>(Scratch " + results['stickers'][i]['scratch'] + "%)</b>";
						}
					}
					$("#" + rowid).append("<span class='market_listing_game_name market_listing_stickers' style='white-space: normal'>Stickers: " + stickers + "</span>");
				}
				$obj.addClass("wearDone");
				dfd.resolve();
			}								
		}
	});
	
	return dfd.promise();
}

function LoadFloatValue(){	
	$(this).find('span').text('Loading..');
	$(".myButton").off();
	
	var rowid = $(this).attr('title');
	var listingid = rowid.replace('listing_', '');
	var assetid = unsafeWindow.g_rgListingInfo[listingid].asset.id;
	var hashid = unsafeWindow.g_rgListingInfo[listingid].asset.market_actions[0].link;
	hashid = hashid.replace('steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20M%listingid%A%assetid%D', '');
	
	var bttn = $(this);
	
	var message = "";
	var url = "http://csgo.exchange/item/floatapi/" + listingid + "/" + assetid + "/" + hashid;
	GM_xmlhttpRequest ({
		method:     "GET",
		url:        url,		
		headers:    {"Content-Type": "application/x-www-form-urlencoded"},		
		onload:     function (response) {
			console.log(response.responseText);
			results = jQuery.parseJSON(response.responseText);
			if(results['status'] == 1) message = results['exterior'];
			else if(results['status'] == 0) message = "Bad Parameters";
            else if(results['status'] == 2) message = "Click Again";
            else if(results['status'] == 3) message = "Not Access Pass";
			else if(results['status'] == 4) message = "Miss Parameter";				
			else if(results['status'] == 6) message = "Login on csgo.exchange";
            else if(results['status'] == 7) message = "System On Maintenance";
            else if(results['status'] == 8) message = "Inspect Link Down";
			else if(results['status'] == 9) message = "Quota Limit";						
			$("#" + rowid + " .market_listing_wear span").text(message);
			if($("#" + rowid + " .market_listing_pattern").length == 0){
				
				if(results['exterior'] <= $("#market_listing_filter_float").val()) bttn.find('a').css('border', '2px solid red');
				
				var doppler = "";
				if(typeof results['doppler'] !== 'undefined') doppler = " (Doppler " + results['doppler'] + ")";
				if(typeof results['pattern'] !== 'undefined') $("#" + rowid + " .market_listing_item_name_block").append("<br><span class='market_listing_game_name market_listing_pattern'>Pattern Index: " + results['pattern'] + doppler + "</span>");
				if(typeof results['stickers'] !== 'undefined'){
					var stickers = "";
					for (var i = 0; i < 5; i++) {
						if(typeof results['stickers'][i] !== 'undefined'){
							stickers += " ~ Slot " + results['stickers'][i]['slot'] + " = " + results['stickers'][i]['name'];
							if(results['stickers'][i]['scratch'] > 0) stickers += " <b>(Scratch " + results['stickers'][i]['scratch'] + "%)</b>";
						}
					}
					$("#" + rowid).append("<span class='market_listing_game_name market_listing_stickers' style='white-space: normal'>Stickers: " + stickers + "</span>");
				}
				bttn.addClass("wearDone");				
			}
			$(".myButton").click (LoadFloatValue);						
		}
	});	
}
