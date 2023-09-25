```php
if($order_status == '0'){
    if (count($pesanCancel) < 1) {
        $pesan = "Halo kak {{NAMA_PEMBELI}}\nPesanan kakak telah kami batalkan yaa, dikarenakan telah melebihi batas waktu pembayaran setelah proses checkout.\n";
    } else {
        $pesan = $pesanCancel[0]['teks_follow_up'];        
    }
} else if($order_status == '1'){
    if (count($pesanPending) < 1) {                    
        $pesan = "Hi Kak {{NAMA_PEMBELI}}\nTerima kasih telah melakukan pembelian :\n\n{{DETAIL_PRODUK}}\n\nTotal Bayar : {{TOTAL_BAYAR}}\n\ndi {{NAMA_TOKO}}. \n\nKakak bisa segera melakukan pembayaran via transfer kepada :\n\n{{METODE_PEMBAYARAN}}\n\nagar pesanan bisa segera di proses. \n\nJika sudah melakukan pembayaran, Kakak bisa kirim bukti pembayaran disini. \n\nSalam Manis Dari {{NAMA_TOKO}}\n";
    } else {
        $pesan = $pesanPending[0]['teks_follow_up'];    
    }    
} else if($order_status == '4'){
    if (count($pesanSelesai) < 1) {
        $pesan = "Terima kasih kak {{NAMA_PEMBELI}} telah membeli di toko {{NAMA_TOKO}}";
    } else {
        $pesan = $pesanSelesai[0]['teks_follow_up'];       
    }
} 
$detailProduk = "";
$totalBayar = "Rp. " . number_format($orders[0]['totalbayar'],0,',','.');
$bank = $orders[0]['bank'];
for ($i=0; $i < count($orders); $i++) { 
    $harga_jual = "Rp. " . number_format($orders[$i]['harga_jual'],0,',','.');
    if($orders[$i]['jenis_produk'] == 'fisik'){
        $jenisProduk = "Fisik";
    } else {
        $jenisProduk = "Digital";
    }

    if ($orders[$i]['ukuran'] == '' || $orders[$i]['ukuran'] == '0') {
        $ukuran = '';
    } else {
        $ukuran = (substr($orders[$i]['ukuran'], -1) == ' ') ? "*\n*Ukuran : ".substr($orders[$i]['ukuran'], 0, strlen($orders[$i]['ukuran']) - 1) : "*\n*Ukuran : ".$orders[$i]['ukuran'];                        
    }

    if ($orders[$i]['varian'] == '' || $orders[$i]['varian'] == '0') {
        $varian = '';                    
    } else {
        $varian = (substr($orders[$i]['varian'], -1) == ' ') ? "*\n*Varian : ".substr($orders[$i]['varian'], 0, strlen($orders[$i]['varian']) - 1) : "*\n*Varian : ".$orders[$i]['varian'];                        
    }
    $beratFix = ($orders[$i]['berat'] == '' || $orders[$i]['berat'] == '0') ? "*" : "*\n*Berat : ".$orders[$i]['berat']." Gram*\n\n";
    $nmProduk = (substr($orders[$i]['nama_produk'], -1) == ' ') ? "*Nama Produk : ".substr($orders[$i]['nama_produk'], 0, strlen($orders[$i]['nama_produk']) - 1) : "*Nama Produk : ".$orders[$i]['nama_produk'];                        
    $detailProduk .= $nmProduk."*\n*Jenis Produk : ".$jenisProduk."*\n*Harga : ".$harga_jual.$varian.$ukuran."*\n*Qty : ".$orders[$i]['qty'].$beratFix;                    
}

if ($orders[0]['no_resi'] == 'null' || $orders[0]['no_resi'] == '' || $orders[0]['no_resi'] == '0') {
    $no_resi = '-';
} else {
    $no_resi = $orders[0]['no_resi'];
}

if ($orders[0]['expedisi'] == 'null' || $orders[0]['expedisi'] == '' || $orders[0]['expedisi'] == '0') {
    $expedisi = '-';
} else {
    $expedisi = $orders[0]['expedisi'];
}

if ($orders[0]['paket'] == 'null' || $orders[0]['paket'] == '' || $orders[0]['paket'] == '0') {
    $paket = '-';
} else {
    $paket = $orders[0]['paket'];
}

if ($orders[0]['ongkir'] == 'null' || $orders[0]['ongkir'] == '' || $orders[0]['ongkir'] == '0') {
    $ongkir = 'Rp. 0';
} else {
    $ongkir = "Rp. " . number_format($orders[0]['ongkir'],0,',','.');
}

if ($orders[0]['estimasi'] == 'null' || $orders[0]['estimasi'] == ' Hari' || $orders[0]['estimasi'] == '' || $orders[0]['estimasi'] == '0') {
    $estimasi = '-';
} else {
    $estimasi = $orders[0]['estimasi'];
}     

$fixEkspedisi = "*Ekspedisi : ".$expedisi."*\n"."*Estimasi : ".$estimasi."*\n"."*Paket : ".$paket."*\n"."*Ongkir : ".$ongkir."*\n\n";

if ($orders[0]['prov'] == 'null' || $orders[0]['prov'] == '' || $orders[0]['prov'] == '0') {
    $prov = '-';
} else {
    $prov = explode("=", $orders[0]['prov']);
    if (!$prov[1]) {
        $prov[1] = explode("=", $orders[0]['prov'])[0];
    }
}

if ($orders[0]['kab'] == 'null' || $orders[0]['kab'] == '' || $orders[0]['kab'] == '0') {
    $kab = '-';
} else {                    
    $kab = explode("=", $orders[0]['kab']);     
    if (!$kab[1]) {
        $kab[1] = explode("=", $orders[0]['kab'])[0];
    }               
}

if ($orders[0]['kec'] == 'null' || $orders[0]['kec'] == '' || $orders[0]['kec'] == '0') {
    $kec = '-';
} else {
    $kec = explode("=", $orders[0]['kec']);
}

$fixAlamat = $orders[0]['alamat_pembeli']."\n".$kec[1].", ".$kab[1].", ".$prov[1]."";

$cari = array();

array_push($cari, '{{ORDER_ID}}','{{DETAIL_PRODUK}}','{{TOTAL_BAYAR}}','{{METODE_PEMBAYARAN}}','{{NAMA_TOKO}}','{{NOMOR_RESI}}','{{EKSPEDISI}}','{{TANGGAL_ORDER}}','{{NAMA_PEMBELI}}','{{ALAMAT_PEMBELI}}','{{WHATSAPP_PEMBELI}}','{{EMAIL_PEMBELI}}');

$pengganti = array();
if ($orders[0]['payment'] == 'qris') {
    $bank = base_url().strtolower(str_replace(" ", "-", $toko['nama_toko']))."/qris/".$order_id;
    array_push($pengganti, $orders[0]['order_id'], $detailProduk, $totalBayar, $bank, $toko['nama_toko'], $no_resi, $fixEkspedisi, $orders[0]['tgl_order'], $orders[0]['nama_pembeli'], $fixAlamat, $orders[0]['no_hp_pembeli'], $orders[0]['email_pembeli']);
} else if ($orders[0]['payment'] == 'cod') {
    $bank = "COD";
    array_push($pengganti, $orders[0]['order_id'], $detailProduk, $totalBayar, $bank, $toko['nama_toko'], $no_resi, $fixEkspedisi, $orders[0]['tgl_order'], $orders[0]['nama_pembeli'], $fixAlamat, $orders[0]['no_hp_pembeli'], $orders[0]['email_pembeli']);
} else {
    $bank = $orders[0]['bank'];
    array_push($pengganti, $orders[0]['order_id'], $detailProduk, $totalBayar, $bank, $toko['nama_toko'], $no_resi, $fixEkspedisi, $orders[0]['tgl_order'], $orders[0]['nama_pembeli'], $fixAlamat, $orders[0]['no_hp_pembeli'], $orders[0]['email_pembeli']);
}

$fixPesan = str_replace($cari, $pengganti, $pesan);                                            
$removeChar = str_replace("&", "%26", $fixPesan);                    
$penerima = $orders[0]['nama_pembeli']."=".$orders[0]['no_hp_pembeli'];

$noHpIdx = substr($orders[0]['no_hp_pembeli'], 0, 1);
if ($noHpIdx != '6') {
    if ($noHpIdx == '0') {                        
        $noHp = '62'.substr($orders[0]['no_hp_pembeli'], 1);
    } else if ($noHpIdx == '8') {                        
        $noHp = '62'.$orders[0]['no_hp_pembeli'];
    }                    
} else {
    $noHp = $orders[0]['no_hp_pembeli'];
}
```