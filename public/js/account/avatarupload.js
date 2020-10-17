$(document).ready(function() {
	var $uploadCrop;

	function readFile(input) {
		if (input.files && input.files[0]) {
			var reader = new FileReader();
			reader.onload = function (e) {
				$('#upload-cropper').addClass('ready');
				$uploadCrop.croppie('bind', {
					url: e.target.result
				}).catch(function(err) {
					console.log(err);
				});
			}
			reader.readAsDataURL(input.files[0]);
		}
		else {
			swal('Sorry!', 'Your browser doesn\'t support the FileReader API', 'error');
		}
	}

	$uploadCrop = $('#upload-cropper').croppie({
		viewport: {
			width: 300,
			height: 300,
			type: 'square'
		}
	});

	$('#upload-btn').on('change', function () { 
        $('#upload-cropper').show();
        $('#upload-result').show();
        $('#upload-cancel').show();
        $('html, body').scrollTop( $(document).height() );
        readFile(this); 
    });
	$('#upload-result').on('click', createCrop);
    $('#upload-cancel').on('click', hideCropper);

	function createCrop(ev) {
		$uploadCrop.croppie('result', {
			type: 'blob',
			size: 'viewport'
		}).then(postCropResult);
	}
	
	function postCropResult(blob) {
		console.log(blob);
		var fd = new FormData();
		fd.append('avatar', blob);
		$.ajax({
			type: 'POST',
			url: 'avatar',
			data: fd,
			processData: false,
			contentType: false
		}).done(function(data) {
            console.log(data);
            hideCropper();
            if (data.success) {
                swal({
                    title: "Upload successful!",
                    text: "Reload page?",
                    type: "success",
                    showCancelButton: true,
                    confirmButtonColor: "#6B8A99",
                    confirmButtonText: "Reload",
                    cancelButtonText: "Cancel",
                    closeOnConfirm: false
                }, function() {
                    location.reload()
                });
            } else {
                swal('Oops...', data.error.message, 'error');
            }
		});
	}

    function hideCropper() {
        $('#upload-cropper').hide();
        $('#upload-result').hide();
        $('#upload-cancel').hide();
    }
	
    
	function popupResult(result) {
		var html;
		if (result.html) {
			html = result.html;
		}
		if (result.src) {
			html = '<img src="' + result.src + '" />';
		}
		swal({
			title: '',
			html: true,
			text: html,
			allowOutsideClick: true
		});
		setTimeout(function(){
			$('.sweet-alert').css('margin', function() {
				var top = -1 * ($(this).height() / 2),
					left = -1 * ($(this).width() / 2);

				return top + 'px 0 0 ' + left + 'px';
			});
		}, 1);
	}
});