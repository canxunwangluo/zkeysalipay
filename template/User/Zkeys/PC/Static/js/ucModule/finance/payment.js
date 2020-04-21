$(function () {
		// 初始化限制输入数字方法
//	NY.event.inputNumberLimit("#rechargeInput", {
//		min: nyData.payment.payMin,
//		max: 999999
//	});
//
//	// 充值提交
//	var $_rechargeAmount = $("#rechargeInput");
//	$_rechargeAmount.on('blur', function() {
//		var $_that = $(this);
//		var value = $_that.val();
//		$_that.val( Math.floor(value) );
//	});

	$(".payment-item").on('click', 'label', function() {
		var $_this = $(this);
		$(".payment-item label").removeClass('pay-select');
		$_this.addClass('pay-select');
	});

	$("#rechargeButton").click(function () {
		var $_paymentForm = $("#paymentForm");
		var $_checkedRadio = $("input[name=payType]:checked");
		var $_rechargeAmount = $("#rechargeInput");
		var payMinValue = $("#payMinInput").val();
		var isPayAmountFilled = true;
		var reg = /^[1-9]\d{0,5}(\.0{1,2})?$/;
		// 表单验证
		NY.validater.clearValidateError($_paymentForm);
		if(!reg.test($_rechargeAmount.val())) {
			NY.validater.validateShowError($_rechargeAmount, "金额为数字且为整数，一次充值不超过1000000", $_paymentForm);
			isPayAmountFilled = false;
		}
		if (!$_rechargeAmount.val()) {
			NY.validater.validateShowError($_rechargeAmount, "该项不能为空", $_paymentForm);
			isPayAmountFilled = false;
		}

		if (parseFloat($_rechargeAmount.val()) < parseFloat(payMinValue)) {
			NY.validater.validateShowError($_rechargeAmount, "最低起充金额为 " + payMinValue + " 元", $_paymentForm);
			isPayAmountFilled = false;
		}

		if (isPayAmountFilled) {
			// 如果选择微信支付则弹窗让用户扫描二维码，其他支付方式则打开新窗口同步提交表单
			if ($_checkedRadio.val() == "weixin") {
				var url ="/user/payment/wxpay/?total_fee=";
				var title = "微信扫码支付";
			} else {
				var url ="/user/payment/pay/?WIDtotal_fee=";
				var title = "支付宝扫码支付";
			}
				var checkWeixinPayed = null;
				$.dialog.open(url + $_rechargeAmount.val(), {
					title: title,
					width: 600,
					height: 430,
					// 弹窗后执行函数
					init: function(){
						var $_iframeDocument = $(this.iframe.contentWindow.document);
						var orderNum = $_iframeDocument.find("#orderNo").val();
						// 定时检测是否支付成功
						checkWeixinPayed = setInterval(function() {
							$.ajax({
								url: "/user/payment/ajaxCheck?orderNo=" + orderNum,
								dataType: "json",
								success: function(responseData) {
									if (responseData.status == 1) {
										clearInterval(checkWeixinPayed);
										$_iframeDocument.find("#status").html('<span class="text-finished">支付成功</span>');
										NY.success("支付成功！", 3, function () {
											if (responseData.url && responseData.url.length > 0) {
												window.location.href = responseData.url;
											}
											else {
												window.location.reload();
											}
										});
									}
								},
								error: function () {
									NY.showBusy();
								}
							});
						}, 2000);
					},
					ok:false,
					cancel:true,
					cancelVal:"取消支付",
					close: function () {
						// 关闭窗口后清除轮询
						clearInterval(checkWeixinPayed);
					}
				});
			
			
		}
	});
});