function picSelector(num) {
	for (var i = 0; i < 5; i++) {
		if ($('#p'+i).checked != "") {
			$('#pic'+i).css('background', 'rgb(68, 67, 89)');	
		}
		$('#pic'+num).css('background', '#b63b4d');
		$('#profilePicSelector').fadeIn();
		$('#profilePicSelector').css('display', 'block');
		$('#profilePicDeletor').fadeIn();
		$('#profilePicDeletor').css('display', 'block');
	}
};