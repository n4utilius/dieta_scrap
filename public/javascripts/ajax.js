$(function(){
	$("form#peticion").submit(function(e){
		e.preventDefault();
		$.get("/dietas", {}, function(data){
			$("div#categoria").html(data);
			console.log(data)
		})
	})
});