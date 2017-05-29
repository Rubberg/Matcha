$(function() {
    var Accordion = function(el, multiple) {
		this.el = el || {};
		this.multiple = multiple || false;

		var links = this.el.find('.link');
		links.on('click', {el: this.el, multiple: this.multiple}, this.dropdown)
	}

	Accordion.prototype.dropdown = function(e) {
		var $el = e.data.el;
			$this = $(this),
			$next = $this.next();

		$next.slideToggle();
		$this.parent().toggleClass('open');

		if (!e.data.multiple) {
			$el.find('.submenu').not($next).slideUp().parent().removeClass('open');
		};
	}	

	var accordion = new Accordion($('.accordion'), false);
});


// Paramétrages des élements éditables

$(document).ready(function() {
    //toggle `popup` / `inline` mode
    $.fn.editable.defaults.mode = 'popup';     
    
    $('#birthdate').editable({
        format: 'YYYY-MM-DD',    
        viewformat: 'DD.MM.YYYY',    
        template: 'D / MMMM / YYYY',    
        combodate: {
                minYear: 1900,
                maxYear: 2016,
                minuteStep: 1
           }
        });

    $('#sex').editable({
        value: 2,    
        source: [
              {value: 'Homme', text: 'Homme'},
              {value: 'Femme', text: 'Femme'},
              {value: 'Trans', text: 'Trans'},
              {value: 'Indéfini', text: 'Indéfini'}
           ]
    });
    $('#orientation').editable({
        value: 2,    
        source: [
              {value: 'Homo', text: 'Homo'},
              {value: 'Hetero', text: 'Hetero'},
              {value: 'Bi', text: 'Bi'},
              {value: 'Asexuel', text: 'Asexuel'}
           ]
    });
    $('#bio').editable();
    $('#name').editable();
    $('#firstname').editable();
    $('#city').editable({
      placeholder: 'Renseignez ville et code postal!' 
    });
    $('#login').editable({
    	validate: function(value) {
    		var validPasswordRegex = /^(?=.*[A-Za-z\d])[A-Za-z\d]{5,10}$/;
    		if (!validPasswordRegex.test(value)) {
        		return 'Entre 5 et 10 caractères!';
        	}
        else {
          $('.username span:first-child').text(value);
        }
      }
    });
    $('#email').editable({
      type: 'text',
      title: 'Enter a valid Email address',
      validate: function(value) {
        var validEmailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!validEmailRegex.test(value)) {
          return 'Veuillez renseigner un email valide!';
        }
      }
    });
    $('#password').editable({
    	validate: function(value) {
    		var validPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,10}$/;
    		if (!validPasswordRegex.test(value)) {
        		return 'Entre 5 et 10 caractères dont 1 chiffre!';
        	}
        }
    });
    $('#hobbie').editable({
    });

});