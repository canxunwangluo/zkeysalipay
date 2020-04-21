<?php


namespace ApiNotify\Controller;

class QingNotifyController extends \Common\Controller\ApiNotifyController
{
    public function Notify()
    {
        vendor('f2fpay.AlipayService');
        $aliPay = new \AlipayService();
        $arr = explode('|', C('recharge.alipayPrivateKey'));
        if(count($arr)!=2){
            exit('fail');
        }
        $aliPay->setAliPayPublicKey($arr[1]);
        $result = $aliPay->rsaCheck($_POST);
        if($result===true){
            if($_POST['trade_status'] == 'TRADE_SUCCESS'){
                $out_trade_no = $_POST['out_trade_no'];
                $trade_no = $_POST['trade_no'];
                $total_fee = $_POST['total_amount'];
                $userID = $_POST['body'];
                $buyer_logon_id = $_POST['buyer_logon_id'];
                $parameter = array(
                    'userID' => $userID,
                    'type' => 'alipay',
                    'orderNo' => $out_trade_no,
                    'trade_no' => $trade_no,
                    'total_fee' => $total_fee,
                    'buyer_email' => $buyer_logon_id
                );
                M()->startTrans();
                if (!checkOrderStatus($out_trade_no)) {
                    $orderHandleResult = orderHandle($parameter);
                    if ($orderHandleResult) {
                        M()->commit();
                    }
                }
            }

            echo 'success';
        } else {
            echo 'fail';

        }
    }

}