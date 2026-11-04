/**
 * Official Tamil Nadu Operational Geo-Data Module
 * 38 Revenue Districts + 147 Cities/Taluks + 221 City/Village Sub-Zones
 * Powered directly by official Survey of India boundary GeoJSON.
 * Pure ES Module - Zero React or Leaflet dependencies (prevents circular imports).
 */

export const TAMIL_NADU_DISTRICTS = [
  {
    "name": "Ariyalur",
    "code": "ARL",
    "lat": 11.1401,
    "lng": 79.0786,
    "center": [
      11.2171,
      79.238
    ],
    "bbox": [
      78.9422,
      10.8865,
      79.5101,
      11.4196
    ],
    "dtcode": "610",
    "shape_area": "1957309655.542329",
    "shape_length": "259928.49727816155"
  },
  {
    "name": "Chengalpattu",
    "code": "CGL",
    "lat": 12.682,
    "lng": 79.9804,
    "center": [
      12.6044,
      79.916
    ],
    "bbox": [
      79.6403,
      12.2288,
      80.2678,
      13.0297
    ],
    "dtcode": "730",
    "shape_area": "2741231745.652062",
    "shape_length": "327608.5214727299"
  },
  {
    "name": "Chennai",
    "code": "MAA",
    "lat": 13.0827,
    "lng": 80.2707,
    "center": [
      13.0832,
      80.2576
    ],
    "bbox": [
      80.1839,
      12.965,
      80.3108,
      13.1459
    ],
    "dtcode": "568",
    "shape_area": "168108043.00313458",
    "shape_length": "74830.90714893154"
  },
  {
    "name": "Coimbatore",
    "code": "CBE",
    "lat": 11.0168,
    "lng": 76.9558,
    "center": [
      10.8889,
      76.9772
    ],
    "bbox": [
      76.6557,
      10.2196,
      77.2975,
      11.4053
    ],
    "dtcode": "569",
    "shape_area": "4782748245.666942",
    "shape_length": "540285.8259907645"
  },
  {
    "name": "Cuddalore",
    "code": "CUD",
    "lat": 11.748,
    "lng": 79.7714,
    "center": [
      11.6085,
      79.4583
    ],
    "bbox": [
      78.8775,
      11.1505,
      79.8122,
      11.9049
    ],
    "dtcode": "570",
    "shape_area": "3734422511.101331",
    "shape_length": "526635.545530309"
  },
  {
    "name": "Dharmapuri",
    "code": "DPI",
    "lat": 12.1211,
    "lng": 78.1582,
    "center": [
      12.1285,
      78.2265
    ],
    "bbox": [
      77.6746,
      11.776,
      78.7451,
      12.5137
    ],
    "dtcode": "571",
    "shape_area": "4507545325.15904",
    "shape_length": "523973.5707371826"
  },
  {
    "name": "Dindigul",
    "code": "DGL",
    "lat": 10.3673,
    "lng": 77.9803,
    "center": [
      10.3772,
      77.8247
    ],
    "bbox": [
      77.2666,
      10.0182,
      78.3397,
      10.8351
    ],
    "dtcode": "572",
    "shape_area": "6141976426.850322",
    "shape_length": "641963.7389153152"
  },
  {
    "name": "Erode",
    "code": "ERD",
    "lat": 11.341,
    "lng": 77.7172,
    "center": [
      11.483,
      77.3552
    ],
    "bbox": [
      76.8337,
      11.0234,
      77.933,
      11.9548
    ],
    "dtcode": "573",
    "shape_area": "5801484230.723343",
    "shape_length": "626990.7493468005"
  },
  {
    "name": "Kallakurichi",
    "code": "KLK",
    "lat": 11.7383,
    "lng": 78.9639,
    "center": [
      11.8052,
      79.082
    ],
    "bbox": [
      78.6276,
      11.5053,
      79.4826,
      12.0901
    ],
    "dtcode": "729",
    "shape_area": "3807771509.2464",
    "shape_length": "430193.5234869507"
  },
  {
    "name": "Kanchipuram",
    "code": "KPM",
    "lat": 12.8342,
    "lng": 79.7036,
    "center": [
      12.8512,
      79.8712
    ],
    "bbox": [
      79.5562,
      12.5328,
      80.1872,
      13.0547
    ],
    "dtcode": "574",
    "shape_area": "1717066974.3715217",
    "shape_length": "357252.6211594132"
  },
  {
    "name": "Kanyakumari",
    "code": "KNY",
    "lat": 8.0883,
    "lng": 77.5385,
    "center": [
      8.0883,
      77.5385
    ],
    "bbox": [
      77.1385,
      7.6883,
      77.9385,
      8.4883
    ],
    "dtcode": "KNY",
    "shape_area": null,
    "shape_length": null
  },
  {
    "name": "Karur",
    "code": "KRR",
    "lat": 10.9601,
    "lng": 78.0766,
    "center": [
      10.8094,
      78.0999
    ],
    "bbox": [
      77.7501,
      10.5468,
      78.5877,
      11.0962
    ],
    "dtcode": "576",
    "shape_area": "2937228962.4771824",
    "shape_length": "461737.0751245065"
  },
  {
    "name": "Krishnagiri",
    "code": "KGI",
    "lat": 12.5186,
    "lng": 78.2137,
    "center": [
      12.4912,
      78.0631
    ],
    "bbox": [
      77.471,
      12.1392,
      78.6715,
      12.8901
    ],
    "dtcode": "577",
    "shape_area": "5127190183.127263",
    "shape_length": "630917.0443285478"
  },
  {
    "name": "Madurai",
    "code": "MDU",
    "lat": 9.9252,
    "lng": 78.1198,
    "center": [
      9.9296,
      78.0589
    ],
    "bbox": [
      77.464,
      9.5631,
      78.4734,
      10.3103
    ],
    "dtcode": "578",
    "shape_area": "3780919833.65961",
    "shape_length": "553333.6125703148"
  },
  {
    "name": "Mayiladuthurai",
    "code": "MYD",
    "lat": 11.1018,
    "lng": 79.6522,
    "center": [
      11.1018,
      79.6522
    ],
    "bbox": [
      79.25219999999999,
      10.7018,
      80.0522,
      11.501800000000001
    ],
    "dtcode": "MYD",
    "shape_area": null,
    "shape_length": null
  },
  {
    "name": "Nagapattinam",
    "code": "NAG",
    "lat": 10.7656,
    "lng": 79.8424,
    "center": [
      10.8816,
      79.6842
    ],
    "bbox": [
      79.5084,
      10.2718,
      79.8827,
      11.4233
    ],
    "dtcode": "579",
    "shape_area": "2620819460.551117",
    "shape_length": "517899.642372811"
  },
  {
    "name": "Namakkal",
    "code": "NKL",
    "lat": 11.2189,
    "lng": 78.1674,
    "center": [
      11.3656,
      78.1578
    ],
    "bbox": [
      77.6829,
      11.0131,
      78.4898,
      11.5975
    ],
    "dtcode": "580",
    "shape_area": "3444991744.8909774",
    "shape_length": "429232.33361028763"
  },
  {
    "name": "Nilgiris",
    "code": "NLG",
    "lat": 11.4102,
    "lng": 76.695,
    "center": [
      11.4102,
      76.695
    ],
    "bbox": [
      76.29499999999999,
      11.0102,
      77.095,
      11.8102
    ],
    "dtcode": "NLG",
    "shape_area": null,
    "shape_length": null
  },
  {
    "name": "Perambalur",
    "code": "PEB",
    "lat": 11.2342,
    "lng": 78.8821,
    "center": [
      11.2699,
      78.8809
    ],
    "bbox": [
      78.6341,
      11.0556,
      79.168,
      11.5231
    ],
    "dtcode": "581",
    "shape_area": "1771137718.6781652",
    "shape_length": "293141.2218884119"
  },
  {
    "name": "Pudukkottai",
    "code": "PDK",
    "lat": 10.3797,
    "lng": 78.8208,
    "center": [
      10.381,
      78.8952
    ],
    "bbox": [
      78.4237,
      9.8488,
      79.2968,
      10.7346
    ],
    "dtcode": "582",
    "shape_area": "4750806933.325329",
    "shape_length": "723561.1888860812"
  },
  {
    "name": "Ramanathapuram",
    "code": "RMD",
    "lat": 9.3639,
    "lng": 78.8395,
    "center": [
      9.439,
      78.7881
    ],
    "bbox": [
      78.2149,
      9.0867,
      79.4976,
      9.9426
    ],
    "dtcode": "583",
    "shape_area": "4272385544.1185164",
    "shape_length": "736956.5738006597"
  },
  {
    "name": "Ranipet",
    "code": "RNP",
    "lat": 12.9272,
    "lng": 79.3331,
    "center": [
      12.946,
      79.4705
    ],
    "bbox": [
      79.1789,
      12.6282,
      79.7919,
      13.2105
    ],
    "dtcode": "731",
    "shape_area": "1842415502.897802",
    "shape_length": "363309.3456335871"
  },
  {
    "name": "Salem",
    "code": "SLM",
    "lat": 11.6643,
    "lng": 78.146,
    "center": [
      11.6396,
      78.2561
    ],
    "bbox": [
      77.6467,
      11.3152,
      78.8429,
      11.9792
    ],
    "dtcode": "584",
    "shape_area": "5266709175.4510355",
    "shape_length": "701688.7008410897"
  },
  {
    "name": "Sivaganga",
    "code": "SVG",
    "lat": 9.8433,
    "lng": 78.4809,
    "center": [
      9.9421,
      78.5816
    ],
    "bbox": [
      78.1231,
      9.52,
      79.0138,
      10.4082
    ],
    "dtcode": "585",
    "shape_area": "4302586722.134969",
    "shape_length": "704187.7010128465"
  },
  {
    "name": "Tenkasi",
    "code": "TSI",
    "lat": 8.9593,
    "lng": 77.3148,
    "center": [
      9.0905,
      77.4821
    ],
    "bbox": [
      77.1469,
      8.766,
      77.7435,
      9.4202
    ],
    "dtcode": "733",
    "shape_area": "2877743457.477795",
    "shape_length": "362633.62915546"
  },
  {
    "name": "Thanjavur",
    "code": "TNJ",
    "lat": 10.787,
    "lng": 79.1378,
    "center": [
      10.6571,
      79.2589
    ],
    "bbox": [
      78.7756,
      10.1367,
      79.5726,
      11.1837
    ],
    "dtcode": "586",
    "shape_area": "3464308501.7912273",
    "shape_length": "669079.0081258556"
  },
  {
    "name": "Theni",
    "code": "THN",
    "lat": 10.0104,
    "lng": 77.4768,
    "center": [
      9.9321,
      77.4422
    ],
    "bbox": [
      77.1657,
      9.5192,
      77.729,
      10.2188
    ],
    "dtcode": "588",
    "shape_area": "2921917230.156715",
    "shape_length": "343728.72869514377"
  },
  {
    "name": "Thoothukudi",
    "code": "TCN",
    "lat": 8.7642,
    "lng": 78.1348,
    "center": [
      8.7642,
      78.1348
    ],
    "bbox": [
      77.73479999999999,
      8.3642,
      78.5348,
      9.164200000000001
    ],
    "dtcode": "TCN",
    "shape_area": null,
    "shape_length": null
  },
  {
    "name": "Tiruchirappalli",
    "code": "TPJ",
    "lat": 10.7905,
    "lng": 78.7047,
    "center": [
      10.8291,
      78.5556
    ],
    "bbox": [
      78.1625,
      10.2937,
      79.0122,
      11.4089
    ],
    "dtcode": "591",
    "shape_area": "4549561040.171747",
    "shape_length": "819534.6663504126"
  },
  {
    "name": "Tirunelveli",
    "code": "TEN",
    "lat": 8.7139,
    "lng": 77.7567,
    "center": [
      8.5796,
      77.5862
    ],
    "bbox": [
      77.17,
      8.1411,
      77.9734,
      8.9571
    ],
    "dtcode": "592",
    "shape_area": "4008188735.4426675",
    "shape_length": "459678.3958893345"
  },
  {
    "name": "Tirupathur",
    "code": "TPT",
    "lat": 12.495,
    "lng": 78.5678,
    "center": [
      12.6323,
      78.6528
    ],
    "bbox": [
      78.4067,
      12.259,
      78.9169,
      12.9109
    ],
    "dtcode": "732",
    "shape_area": "2085180677.7114506",
    "shape_length": "332781.39526605565"
  },
  {
    "name": "Tiruppur",
    "code": "TPR",
    "lat": 11.1085,
    "lng": 77.3411,
    "center": [
      10.8794,
      77.3882
    ],
    "bbox": [
      77.0412,
      10.2304,
      77.8929,
      11.3519
    ],
    "dtcode": "634",
    "shape_area": "5241066643.081378",
    "shape_length": "678686.7911406385"
  },
  {
    "name": "Tiruvallur",
    "code": "TLR",
    "lat": 13.1438,
    "lng": 79.9083,
    "center": [
      13.1438,
      79.9083
    ],
    "bbox": [
      79.50829999999999,
      12.7438,
      80.3083,
      13.543800000000001
    ],
    "dtcode": "TLR",
    "shape_area": null,
    "shape_length": null
  },
  {
    "name": "Tiruvannamalai",
    "code": "TVM",
    "lat": 12.2253,
    "lng": 79.0747,
    "center": [
      12.4554,
      79.2602
    ],
    "bbox": [
      78.6308,
      11.984,
      79.7561,
      12.8743
    ],
    "dtcode": "593",
    "shape_area": "6191479427.605586",
    "shape_length": "713718.5843886391"
  },
  {
    "name": "Tiruvarur",
    "code": "TVR",
    "lat": 10.7725,
    "lng": 79.6365,
    "center": [
      10.7725,
      79.6365
    ],
    "bbox": [
      79.23649999999999,
      10.3725,
      80.0365,
      11.172500000000001
    ],
    "dtcode": "TVR",
    "shape_area": null,
    "shape_length": null
  },
  {
    "name": "Vellore",
    "code": "VLR",
    "lat": 12.9165,
    "lng": 79.1325,
    "center": [
      12.9117,
      79.0041
    ],
    "bbox": [
      78.6015,
      12.6316,
      79.2947,
      13.1719
    ],
    "dtcode": "595",
    "shape_area": "2132274793.0525372",
    "shape_length": "428438.4070710159"
  },
  {
    "name": "Viluppuram",
    "code": "VPM",
    "lat": 11.9401,
    "lng": 79.4861,
    "center": [
      12.1413,
      79.5337
    ],
    "bbox": [
      79.1981,
      11.7985,
      80.0086,
      12.4507
    ],
    "dtcode": "596",
    "shape_area": "3407379705.561508",
    "shape_length": "555725.1942441267"
  },
  {
    "name": "Virudhunagar",
    "code": "VNR",
    "lat": 9.585,
    "lng": 77.96,
    "center": [
      9.5045,
      77.9742
    ],
    "bbox": [
      77.3392,
      9.2001,
      78.4287,
      9.7864
    ],
    "dtcode": "597",
    "shape_area": "4341514879.234571",
    "shape_length": "571407.9971414804"
  }
];

export const TAMIL_NADU_CITIES = [
  {
    "name": "Ariyalur",
    "code": "ARL",
    "district": "Ariyalur",
    "lat": 11.1401,
    "lng": 79.0786
  },
  {
    "name": "Jayankondam",
    "code": "JYM",
    "district": "Ariyalur",
    "lat": 11.2178,
    "lng": 79.3475
  },
  {
    "name": "Sendurai",
    "code": "SDR",
    "district": "Ariyalur",
    "lat": 11.2667,
    "lng": 79.1667
  },
  {
    "name": "Chengalpattu",
    "code": "CGL",
    "district": "Chengalpattu",
    "lat": 12.682,
    "lng": 79.9804
  },
  {
    "name": "Tambaram",
    "code": "TBM",
    "district": "Chengalpattu",
    "lat": 12.9249,
    "lng": 80.1
  },
  {
    "name": "Pallavaram",
    "code": "PLV",
    "district": "Chengalpattu",
    "lat": 12.9675,
    "lng": 80.1491
  },
  {
    "name": "Madurantakam",
    "code": "MDK",
    "district": "Chengalpattu",
    "lat": 12.5097,
    "lng": 79.8833
  },
  {
    "name": "Maraimalai Nagar",
    "code": "MMN",
    "district": "Chengalpattu",
    "lat": 12.795,
    "lng": 80.0244
  },
  {
    "name": "Chennai",
    "code": "MAA",
    "district": "Chennai",
    "lat": 13.0827,
    "lng": 80.2707
  },
  {
    "name": "Chennai Central",
    "code": "MAA-C",
    "district": "Chennai",
    "lat": 13.0827,
    "lng": 80.2707
  },
  {
    "name": "Chennai North",
    "code": "MAA-N",
    "district": "Chennai",
    "lat": 13.13,
    "lng": 80.25
  },
  {
    "name": "Chennai South",
    "code": "MAA-S",
    "district": "Chennai",
    "lat": 12.98,
    "lng": 80.22
  },
  {
    "name": "Anna Nagar",
    "code": "ANN",
    "district": "Chennai",
    "lat": 13.085,
    "lng": 80.2101
  },
  {
    "name": "T. Nagar",
    "code": "TNR",
    "district": "Chennai",
    "lat": 13.0418,
    "lng": 80.2341
  },
  {
    "name": "Guindy",
    "code": "GNY",
    "district": "Chennai",
    "lat": 13.0067,
    "lng": 80.203
  },
  {
    "name": "Velachery",
    "code": "VLC",
    "district": "Chennai",
    "lat": 12.9815,
    "lng": 80.218
  },
  {
    "name": "Adyar",
    "code": "ADY",
    "district": "Chennai",
    "lat": 13.0012,
    "lng": 80.2565
  },
  {
    "name": "Coimbatore",
    "code": "CBE",
    "district": "Coimbatore",
    "lat": 11.0168,
    "lng": 76.9558
  },
  {
    "name": "Pollachi",
    "code": "PLC",
    "district": "Coimbatore",
    "lat": 10.6586,
    "lng": 77.0084
  },
  {
    "name": "Mettupalayam",
    "code": "MTP",
    "district": "Coimbatore",
    "lat": 11.2994,
    "lng": 76.9427
  },
  {
    "name": "Sulur",
    "code": "SLR",
    "district": "Coimbatore",
    "lat": 11.0261,
    "lng": 77.1264
  },
  {
    "name": "Valparai",
    "code": "VLP",
    "district": "Coimbatore",
    "lat": 10.3242,
    "lng": 76.9558
  },
  {
    "name": "Cuddalore",
    "code": "CUD",
    "district": "Cuddalore",
    "lat": 11.748,
    "lng": 79.7714
  },
  {
    "name": "Chidambaram",
    "code": "CDM",
    "district": "Cuddalore",
    "lat": 11.3992,
    "lng": 79.6936
  },
  {
    "name": "Panruti",
    "code": "PNR",
    "district": "Cuddalore",
    "lat": 11.7758,
    "lng": 79.5539
  },
  {
    "name": "Neyveli",
    "code": "NVL",
    "district": "Cuddalore",
    "lat": 11.5369,
    "lng": 79.4842
  },
  {
    "name": "Vridhachalam",
    "code": "VDC",
    "district": "Cuddalore",
    "lat": 11.52,
    "lng": 79.33
  },
  {
    "name": "Dharmapuri",
    "code": "DPI",
    "district": "Dharmapuri",
    "lat": 12.1211,
    "lng": 78.1582
  },
  {
    "name": "Harur",
    "code": "HRR",
    "district": "Dharmapuri",
    "lat": 12.06,
    "lng": 78.49
  },
  {
    "name": "Palacode",
    "code": "PLC",
    "district": "Dharmapuri",
    "lat": 12.3,
    "lng": 78.08
  },
  {
    "name": "Pennagaram",
    "code": "PNG",
    "district": "Dharmapuri",
    "lat": 12.13,
    "lng": 77.9
  },
  {
    "name": "Dindigul",
    "code": "DG",
    "district": "Dindigul",
    "lat": 10.3673,
    "lng": 77.9803
  },
  {
    "name": "Palani",
    "code": "PLN",
    "district": "Dindigul",
    "lat": 10.45,
    "lng": 77.52
  },
  {
    "name": "Kodaikanal",
    "code": "KDK",
    "district": "Dindigul",
    "lat": 10.2381,
    "lng": 77.4892
  },
  {
    "name": "Oddanchatram",
    "code": "ODC",
    "district": "Dindigul",
    "lat": 10.48,
    "lng": 77.75
  },
  {
    "name": "Erode",
    "code": "ERD",
    "district": "Erode",
    "lat": 11.341,
    "lng": 77.7172
  },
  {
    "name": "Bhavani",
    "code": "BHV",
    "district": "Erode",
    "lat": 11.4468,
    "lng": 77.683
  },
  {
    "name": "Gobichettipalayam",
    "code": "GOBI",
    "district": "Erode",
    "lat": 11.4542,
    "lng": 77.442
  },
  {
    "name": "Perundurai",
    "code": "PDR",
    "district": "Erode",
    "lat": 11.275,
    "lng": 77.585
  },
  {
    "name": "Sathyamangalam",
    "code": "STM",
    "district": "Erode",
    "lat": 11.5042,
    "lng": 77.2386
  },
  {
    "name": "Kallakurichi",
    "code": "KLK",
    "district": "Kallakurichi",
    "lat": 11.7383,
    "lng": 78.9639
  },
  {
    "name": "Sankarapuram",
    "code": "SKP",
    "district": "Kallakurichi",
    "lat": 11.89,
    "lng": 78.91
  },
  {
    "name": "Ulundurpet",
    "code": "ULP",
    "district": "Kallakurichi",
    "lat": 11.69,
    "lng": 79.29
  },
  {
    "name": "Kanchipuram",
    "code": "KPM",
    "district": "Kanchipuram",
    "lat": 12.8342,
    "lng": 79.7036
  },
  {
    "name": "Sriperumbudur",
    "code": "SPB",
    "district": "Kanchipuram",
    "lat": 12.9734,
    "lng": 79.9431
  },
  {
    "name": "Walajabad",
    "code": "WJB",
    "district": "Kanchipuram",
    "lat": 12.7981,
    "lng": 79.8242
  },
  {
    "name": "Kanniyakumari",
    "code": "KNY",
    "district": "Kanyakumari",
    "lat": 8.0883,
    "lng": 77.5385
  },
  {
    "name": "Nagercoil",
    "code": "KK",
    "district": "Kanyakumari",
    "lat": 8.1833,
    "lng": 77.4119
  },
  {
    "name": "Colachel",
    "code": "CLC",
    "district": "Kanyakumari",
    "lat": 8.1772,
    "lng": 77.2589
  },
  {
    "name": "Padmanabhapuram",
    "code": "PNB",
    "district": "Kanyakumari",
    "lat": 8.24,
    "lng": 77.33
  },
  {
    "name": "Karur",
    "code": "KRR",
    "district": "Karur",
    "lat": 10.9601,
    "lng": 78.0766
  },
  {
    "name": "Kulithalai",
    "code": "KTL",
    "district": "Karur",
    "lat": 10.93,
    "lng": 78.42
  },
  {
    "name": "Aravakurichi",
    "code": "ARK",
    "district": "Karur",
    "lat": 10.77,
    "lng": 77.91
  },
  {
    "name": "Krishnagiri",
    "code": "KGI",
    "district": "Krishnagiri",
    "lat": 12.5186,
    "lng": 78.2137
  },
  {
    "name": "Hosur",
    "code": "HSR",
    "district": "Krishnagiri",
    "lat": 12.7409,
    "lng": 77.8253
  },
  {
    "name": "Denkanikottai",
    "code": "DNK",
    "district": "Krishnagiri",
    "lat": 12.52,
    "lng": 77.78
  },
  {
    "name": "Bargur",
    "code": "BGR",
    "district": "Krishnagiri",
    "lat": 12.54,
    "lng": 78.36
  },
  {
    "name": "Madurai",
    "code": "MDU",
    "district": "Madurai",
    "lat": 9.9252,
    "lng": 78.1198
  },
  {
    "name": "Thirumangalam",
    "code": "TMG",
    "district": "Madurai",
    "lat": 9.8247,
    "lng": 77.9864
  },
  {
    "name": "Melur",
    "code": "MLR",
    "district": "Madurai",
    "lat": 10.03,
    "lng": 78.33
  },
  {
    "name": "Usilampatti",
    "code": "USP",
    "district": "Madurai",
    "lat": 9.97,
    "lng": 77.79
  },
  {
    "name": "Mayiladuthurai",
    "code": "MYD",
    "district": "Mayiladuthurai",
    "lat": 11.1018,
    "lng": 79.6522
  },
  {
    "name": "Sirkazhi",
    "code": "SKZ",
    "district": "Mayiladuthurai",
    "lat": 11.2333,
    "lng": 79.7333
  },
  {
    "name": "Tharangambadi",
    "code": "TRG",
    "district": "Mayiladuthurai",
    "lat": 11.03,
    "lng": 79.85
  },
  {
    "name": "Nagapattinam",
    "code": "NAG",
    "district": "Nagapattinam",
    "lat": 10.7656,
    "lng": 79.8424
  },
  {
    "name": "Velankanni",
    "code": "VLK",
    "district": "Nagapattinam",
    "lat": 10.6811,
    "lng": 79.8447
  },
  {
    "name": "Vedaranyam",
    "code": "VDY",
    "district": "Nagapattinam",
    "lat": 10.37,
    "lng": 79.85
  },
  {
    "name": "Namakkal",
    "code": "NKL",
    "district": "Namakkal",
    "lat": 11.2189,
    "lng": 78.1674
  },
  {
    "name": "Rasipuram",
    "code": "RPM",
    "district": "Namakkal",
    "lat": 11.4632,
    "lng": 78.1747
  },
  {
    "name": "Tiruchengode",
    "code": "TGD",
    "district": "Namakkal",
    "lat": 11.3789,
    "lng": 77.8967
  },
  {
    "name": "Paramathi Velur",
    "code": "PMV",
    "district": "Namakkal",
    "lat": 11.11,
    "lng": 78.01
  },
  {
    "name": "The Nilgiris",
    "code": "NLG",
    "district": "Nilgiris",
    "lat": 11.4102,
    "lng": 76.695
  },
  {
    "name": "Ooty",
    "code": "UAM",
    "district": "Nilgiris",
    "lat": 11.41,
    "lng": 76.695
  },
  {
    "name": "Coonoor",
    "code": "CNR",
    "district": "Nilgiris",
    "lat": 11.353,
    "lng": 76.7959
  },
  {
    "name": "Kotagiri",
    "code": "KTG",
    "district": "Nilgiris",
    "lat": 11.42,
    "lng": 76.88
  },
  {
    "name": "Perambalur",
    "code": "PEB",
    "district": "Perambalur",
    "lat": 11.2342,
    "lng": 78.8821
  },
  {
    "name": "Veppanthattai",
    "code": "VPT",
    "district": "Perambalur",
    "lat": 11.33,
    "lng": 78.83
  },
  {
    "name": "Pudukkottai",
    "code": "PDK",
    "district": "Pudukkottai",
    "lat": 10.3797,
    "lng": 78.8208
  },
  {
    "name": "Aranthangi",
    "code": "ATG",
    "district": "Pudukkottai",
    "lat": 10.16,
    "lng": 78.99
  },
  {
    "name": "Viralimalai",
    "code": "VRM",
    "district": "Pudukkottai",
    "lat": 10.6,
    "lng": 78.54
  },
  {
    "name": "Ramanathapuram",
    "code": "RMD",
    "district": "Ramanathapuram",
    "lat": 9.3639,
    "lng": 78.8395
  },
  {
    "name": "Rameswaram",
    "code": "RSM",
    "district": "Ramanathapuram",
    "lat": 9.2876,
    "lng": 79.3129
  },
  {
    "name": "Paramakudi",
    "code": "PMK",
    "district": "Ramanathapuram",
    "lat": 9.54,
    "lng": 78.59
  },
  {
    "name": "Ranipet",
    "code": "RNP",
    "district": "Ranipet",
    "lat": 12.9272,
    "lng": 79.3331
  },
  {
    "name": "Arakkonam",
    "code": "AKM",
    "district": "Ranipet",
    "lat": 13.08,
    "lng": 79.67
  },
  {
    "name": "Arcot",
    "code": "ARC",
    "district": "Ranipet",
    "lat": 12.9,
    "lng": 79.33
  },
  {
    "name": "Walajah",
    "code": "WLJ",
    "district": "Ranipet",
    "lat": 12.93,
    "lng": 79.36
  },
  {
    "name": "Salem",
    "code": "SLM",
    "district": "Salem",
    "lat": 11.6643,
    "lng": 78.146
  },
  {
    "name": "Attur",
    "code": "ATT",
    "district": "Salem",
    "lat": 11.5976,
    "lng": 78.5971
  },
  {
    "name": "Edappadi",
    "code": "EDP",
    "district": "Salem",
    "lat": 11.5833,
    "lng": 77.85
  },
  {
    "name": "Mettur",
    "code": "MTR",
    "district": "Salem",
    "lat": 11.7862,
    "lng": 77.8008
  },
  {
    "name": "Sankari",
    "code": "SNK",
    "district": "Salem",
    "lat": 11.4795,
    "lng": 77.869
  },
  {
    "name": "Omalur",
    "code": "OML",
    "district": "Salem",
    "lat": 11.74,
    "lng": 78.04
  },
  {
    "name": "Yercaud",
    "code": "YCD",
    "district": "Salem",
    "lat": 11.7753,
    "lng": 78.2093
  },
  {
    "name": "Sivaganga",
    "code": "SVG",
    "district": "Sivaganga",
    "lat": 9.8433,
    "lng": 78.4809
  },
  {
    "name": "Karaikudi",
    "code": "KKD",
    "district": "Sivaganga",
    "lat": 10.0735,
    "lng": 78.7732
  },
  {
    "name": "Devakottai",
    "code": "DVK",
    "district": "Sivaganga",
    "lat": 9.95,
    "lng": 78.82
  },
  {
    "name": "Tenkasi",
    "code": "TSI",
    "district": "Tenkasi",
    "lat": 8.9593,
    "lng": 77.3148
  },
  {
    "name": "Sankarankovil",
    "code": "SKL",
    "district": "Tenkasi",
    "lat": 9.17,
    "lng": 77.53
  },
  {
    "name": "Kadayanallur",
    "code": "KDN",
    "district": "Tenkasi",
    "lat": 9.07,
    "lng": 77.34
  },
  {
    "name": "Thanjavur",
    "code": "TNJ",
    "district": "Thanjavur",
    "lat": 10.787,
    "lng": 79.1378
  },
  {
    "name": "Kumbakonam",
    "code": "KMU",
    "district": "Thanjavur",
    "lat": 10.9602,
    "lng": 79.3845
  },
  {
    "name": "Pattukkottai",
    "code": "PTK",
    "district": "Thanjavur",
    "lat": 10.43,
    "lng": 79.32
  },
  {
    "name": "Theni",
    "code": "THN",
    "district": "Theni",
    "lat": 10.0104,
    "lng": 77.4768
  },
  {
    "name": "Bodinayakanur",
    "code": "BDN",
    "district": "Theni",
    "lat": 10.01,
    "lng": 77.35
  },
  {
    "name": "Periyakulam",
    "code": "PKM",
    "district": "Theni",
    "lat": 10.12,
    "lng": 77.55
  },
  {
    "name": "Thoothukudi",
    "code": "TCN",
    "district": "Thoothukudi",
    "lat": 8.7642,
    "lng": 78.1348
  },
  {
    "name": "Kovilpatti",
    "code": "KVP",
    "district": "Thoothukudi",
    "lat": 9.17,
    "lng": 77.87
  },
  {
    "name": "Tiruchendur",
    "code": "TCD",
    "district": "Thoothukudi",
    "lat": 8.49,
    "lng": 78.12
  },
  {
    "name": "Tiruchirappalli",
    "code": "TPJ",
    "district": "Tiruchirappalli",
    "lat": 10.7905,
    "lng": 78.7047
  },
  {
    "name": "Trichy",
    "code": "TPJ",
    "district": "Tiruchirappalli",
    "lat": 10.7905,
    "lng": 78.7047
  },
  {
    "name": "Srirangam",
    "code": "SRG",
    "district": "Tiruchirappalli",
    "lat": 10.8622,
    "lng": 78.6948
  },
  {
    "name": "Manapparai",
    "code": "MNP",
    "district": "Tiruchirappalli",
    "lat": 10.6075,
    "lng": 78.4192
  },
  {
    "name": "Thuraiyur",
    "code": "TRY",
    "district": "Tiruchirappalli",
    "lat": 11.14,
    "lng": 78.6
  },
  {
    "name": "Tirunelveli",
    "code": "TEN",
    "district": "Tirunelveli",
    "lat": 8.7139,
    "lng": 77.7567
  },
  {
    "name": "Ambasamudram",
    "code": "ASD",
    "district": "Tirunelveli",
    "lat": 8.7061,
    "lng": 77.4578
  },
  {
    "name": "Palayamkottai",
    "code": "PKT",
    "district": "Tirunelveli",
    "lat": 8.72,
    "lng": 77.73
  },
  {
    "name": "Vallioor",
    "code": "VLR",
    "district": "Tirunelveli",
    "lat": 8.38,
    "lng": 77.61
  },
  {
    "name": "Tirupathur",
    "code": "TPT",
    "district": "Tirupathur",
    "lat": 12.495,
    "lng": 78.5678
  },
  {
    "name": "Ambur",
    "code": "AMB",
    "district": "Tirupathur",
    "lat": 12.7907,
    "lng": 78.7166
  },
  {
    "name": "Vaniyambadi",
    "code": "VNB",
    "district": "Tirupathur",
    "lat": 12.6825,
    "lng": 78.6186
  },
  {
    "name": "Jolarpet",
    "code": "JPT",
    "district": "Tirupathur",
    "lat": 12.57,
    "lng": 78.58
  },
  {
    "name": "Tirupur",
    "code": "TPR",
    "district": "Tiruppur",
    "lat": 11.1085,
    "lng": 77.3411
  },
  {
    "name": "Dharapuram",
    "code": "DPM",
    "district": "Tiruppur",
    "lat": 10.73,
    "lng": 77.53
  },
  {
    "name": "Kangeyam",
    "code": "KGM",
    "district": "Tiruppur",
    "lat": 11.005,
    "lng": 77.56
  },
  {
    "name": "Udumalaipettai",
    "code": "UDM",
    "district": "Tiruppur",
    "lat": 10.5847,
    "lng": 77.2486
  },
  {
    "name": "Avinashi",
    "code": "AVS",
    "district": "Tiruppur",
    "lat": 11.19,
    "lng": 77.27
  },
  {
    "name": "Palladam",
    "code": "PLD",
    "district": "Tiruppur",
    "lat": 11,
    "lng": 77.28
  },
  {
    "name": "Tiruvallur",
    "code": "TLR",
    "district": "Tiruvallur",
    "lat": 13.1438,
    "lng": 79.9083
  },
  {
    "name": "Avadi",
    "code": "AVD",
    "district": "Tiruvallur",
    "lat": 13.1147,
    "lng": 80.1098
  },
  {
    "name": "Ambattur",
    "code": "AMB",
    "district": "Tiruvallur",
    "lat": 13.1143,
    "lng": 80.1548
  },
  {
    "name": "Poonamallee",
    "code": "PNM",
    "district": "Tiruvallur",
    "lat": 13.0489,
    "lng": 80.0911
  },
  {
    "name": "Tiruvannamalai",
    "code": "TVM",
    "district": "Tiruvannamalai",
    "lat": 12.2253,
    "lng": 79.0747
  },
  {
    "name": "Arani",
    "code": "ARN",
    "district": "Tiruvannamalai",
    "lat": 12.6681,
    "lng": 79.2842
  },
  {
    "name": "Cheyyar",
    "code": "CYR",
    "district": "Tiruvannamalai",
    "lat": 12.66,
    "lng": 79.54
  },
  {
    "name": "Tiruvarur",
    "code": "TVR",
    "district": "Tiruvarur",
    "lat": 10.7725,
    "lng": 79.6365
  },
  {
    "name": "Mannargudi",
    "code": "MND",
    "district": "Tiruvarur",
    "lat": 10.66,
    "lng": 79.45
  },
  {
    "name": "Vellore",
    "code": "VLR",
    "district": "Vellore",
    "lat": 12.9165,
    "lng": 79.1325
  },
  {
    "name": "Katpadi",
    "code": "KPD",
    "district": "Vellore",
    "lat": 12.98,
    "lng": 79.13
  },
  {
    "name": "Gudiyatham",
    "code": "GYM",
    "district": "Vellore",
    "lat": 12.94,
    "lng": 78.87
  },
  {
    "name": "Villupuram",
    "code": "VPM",
    "district": "Viluppuram",
    "lat": 11.9401,
    "lng": 79.4861
  },
  {
    "name": "Tindivanam",
    "code": "TND",
    "district": "Viluppuram",
    "lat": 12.23,
    "lng": 79.65
  },
  {
    "name": "Gingee",
    "code": "GNG",
    "district": "Viluppuram",
    "lat": 12.25,
    "lng": 79.42
  },
  {
    "name": "Virudhunagar",
    "code": "VNR",
    "district": "Virudhunagar",
    "lat": 9.585,
    "lng": 77.96
  },
  {
    "name": "Rajapalayam",
    "code": "RJP",
    "district": "Virudhunagar",
    "lat": 9.45,
    "lng": 77.55
  },
  {
    "name": "Sivakasi",
    "code": "SVK",
    "district": "Virudhunagar",
    "lat": 9.4533,
    "lng": 77.7972
  },
  {
    "name": "Aruppukkottai",
    "code": "APK",
    "district": "Virudhunagar",
    "lat": 9.51,
    "lng": 78.1
  }
];

export const TAMIL_NADU_SUBZONES = [
  {
    "id": "TN-CHE-01",
    "name": "Chennai Central / Parry's",
    "district": "Chennai",
    "state": "Tamil Nadu",
    "type": "City Core",
    "pincode": "600001",
    "lat": 13.0883,
    "lng": 80.2858,
    "radius_km": 6,
    "approx_area_sqkm": 113.1,
    "plus_code": "7M5237QP+88",
    "admin_code": "TN-GEO-0001",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.3413,
            13.0883
          ],
          [
            80.33707,
            13.10899
          ],
          [
            80.32504,
            13.12652
          ],
          [
            80.30704,
            13.13824
          ],
          [
            80.2858,
            13.14235
          ],
          [
            80.26456,
            13.13824
          ],
          [
            80.24656,
            13.12652
          ],
          [
            80.23453,
            13.10899
          ],
          [
            80.2303,
            13.0883
          ],
          [
            80.23453,
            13.06761
          ],
          [
            80.24656,
            13.05008
          ],
          [
            80.26456,
            13.03836
          ],
          [
            80.2858,
            13.03425
          ],
          [
            80.30704,
            13.03836
          ],
          [
            80.32504,
            13.05008
          ],
          [
            80.33707,
            13.06761
          ],
          [
            80.3413,
            13.0883
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-CHE-02",
    "name": "T. Nagar / Teynampet",
    "district": "Chennai",
    "state": "Tamil Nadu",
    "type": "Commercial City Zone",
    "pincode": "600017",
    "lat": 13.0418,
    "lng": 80.2341,
    "radius_km": 5.5,
    "approx_area_sqkm": 95,
    "plus_code": "7M5226RM+PJ",
    "admin_code": "TN-GEO-0002",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.28496,
            13.0418
          ],
          [
            80.28109,
            13.06076
          ],
          [
            80.27006,
            13.07684
          ],
          [
            80.25356,
            13.08758
          ],
          [
            80.2341,
            13.09135
          ],
          [
            80.21464,
            13.08758
          ],
          [
            80.19814,
            13.07684
          ],
          [
            80.18711,
            13.06076
          ],
          [
            80.18324,
            13.0418
          ],
          [
            80.18711,
            13.02284
          ],
          [
            80.19814,
            13.00676
          ],
          [
            80.21464,
            12.99602
          ],
          [
            80.2341,
            12.99225
          ],
          [
            80.25356,
            12.99602
          ],
          [
            80.27006,
            13.00676
          ],
          [
            80.28109,
            13.02284
          ],
          [
            80.28496,
            13.0418
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-CHE-03",
    "name": "Mylapore / Santhome",
    "district": "Chennai",
    "state": "Tamil Nadu",
    "type": "Heritage City Hub",
    "pincode": "600004",
    "lat": 13.0339,
    "lng": 80.2677,
    "radius_km": 5,
    "approx_area_sqkm": 78.5,
    "plus_code": "7M5227M9+H3",
    "admin_code": "TN-GEO-0003",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.31394,
            13.0339
          ],
          [
            80.31042,
            13.05114
          ],
          [
            80.30039,
            13.06575
          ],
          [
            80.28539,
            13.07552
          ],
          [
            80.2677,
            13.07895
          ],
          [
            80.25001,
            13.07552
          ],
          [
            80.23501,
            13.06575
          ],
          [
            80.22498,
            13.05114
          ],
          [
            80.22146,
            13.0339
          ],
          [
            80.22498,
            13.01666
          ],
          [
            80.23501,
            13.00205
          ],
          [
            80.25001,
            12.99228
          ],
          [
            80.2677,
            12.98885
          ],
          [
            80.28539,
            12.99228
          ],
          [
            80.30039,
            13.00205
          ],
          [
            80.31042,
            13.01666
          ],
          [
            80.31394,
            13.0339
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-CHE-04",
    "name": "Adyar / Besant Nagar",
    "district": "Chennai",
    "state": "Tamil Nadu",
    "type": "South Coastal Hub",
    "pincode": "600020",
    "lat": 13.0012,
    "lng": 80.2565,
    "radius_km": 6,
    "approx_area_sqkm": 113.1,
    "plus_code": "7M522724+FJ",
    "admin_code": "TN-GEO-0004",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.31198,
            13.0012
          ],
          [
            80.30775,
            13.02189
          ],
          [
            80.29573,
            13.03942
          ],
          [
            80.27773,
            13.05114
          ],
          [
            80.2565,
            13.05525
          ],
          [
            80.23527,
            13.05114
          ],
          [
            80.21727,
            13.03942
          ],
          [
            80.20525,
            13.02189
          ],
          [
            80.20102,
            13.0012
          ],
          [
            80.20525,
            12.98051
          ],
          [
            80.21727,
            12.96298
          ],
          [
            80.23527,
            12.95126
          ],
          [
            80.2565,
            12.94715
          ],
          [
            80.27773,
            12.95126
          ],
          [
            80.29573,
            12.96298
          ],
          [
            80.30775,
            12.98051
          ],
          [
            80.31198,
            13.0012
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-CHE-05",
    "name": "Velachery / OMR Gateway",
    "district": "Chennai",
    "state": "Tamil Nadu",
    "type": "Tech & Urban Hub",
    "pincode": "600042",
    "lat": 12.9815,
    "lng": 80.218,
    "radius_km": 6.5,
    "approx_area_sqkm": 132.7,
    "plus_code": "7M42X6J9+H6",
    "admin_code": "TN-GEO-0005",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.27809,
            12.9815
          ],
          [
            80.27352,
            13.00391
          ],
          [
            80.26049,
            13.02291
          ],
          [
            80.241,
            13.0356
          ],
          [
            80.218,
            13.04006
          ],
          [
            80.195,
            13.0356
          ],
          [
            80.17551,
            13.02291
          ],
          [
            80.16248,
            13.00391
          ],
          [
            80.15791,
            12.9815
          ],
          [
            80.16248,
            12.95909
          ],
          [
            80.17551,
            12.94009
          ],
          [
            80.195,
            12.9274
          ],
          [
            80.218,
            12.92294
          ],
          [
            80.241,
            12.9274
          ],
          [
            80.26049,
            12.94009
          ],
          [
            80.27352,
            12.95909
          ],
          [
            80.27809,
            12.9815
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-CHE-06",
    "name": "Anna Nagar / Kilpauk",
    "district": "Chennai",
    "state": "Tamil Nadu",
    "type": "Residential City Zone",
    "pincode": "600040",
    "lat": 13.085,
    "lng": 80.2101,
    "radius_km": 6.5,
    "approx_area_sqkm": 132.7,
    "plus_code": "7M5236P6+22",
    "admin_code": "TN-GEO-0006",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.27022,
            13.085
          ],
          [
            80.26564,
            13.10741
          ],
          [
            80.25261,
            13.12641
          ],
          [
            80.23311,
            13.1391
          ],
          [
            80.2101,
            13.14356
          ],
          [
            80.18709,
            13.1391
          ],
          [
            80.16759,
            13.12641
          ],
          [
            80.15456,
            13.10741
          ],
          [
            80.14998,
            13.085
          ],
          [
            80.15456,
            13.06259
          ],
          [
            80.16759,
            13.04359
          ],
          [
            80.18709,
            13.0309
          ],
          [
            80.2101,
            13.02644
          ],
          [
            80.23311,
            13.0309
          ],
          [
            80.25261,
            13.04359
          ],
          [
            80.26564,
            13.06259
          ],
          [
            80.27022,
            13.085
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-CHE-07",
    "name": "Guindy / Alandur",
    "district": "Chennai",
    "state": "Tamil Nadu",
    "type": "Industrial & Tech Zone",
    "pincode": "600032",
    "lat": 13.0067,
    "lng": 80.2025,
    "radius_km": 5.5,
    "approx_area_sqkm": 95,
    "plus_code": "7M522642+MX",
    "admin_code": "TN-GEO-0007",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.25335,
            13.0067
          ],
          [
            80.24948,
            13.02566
          ],
          [
            80.23846,
            13.04174
          ],
          [
            80.22196,
            13.05248
          ],
          [
            80.2025,
            13.05625
          ],
          [
            80.18304,
            13.05248
          ],
          [
            80.16654,
            13.04174
          ],
          [
            80.15552,
            13.02566
          ],
          [
            80.15165,
            13.0067
          ],
          [
            80.15552,
            12.98774
          ],
          [
            80.16654,
            12.97166
          ],
          [
            80.18304,
            12.96092
          ],
          [
            80.2025,
            12.95715
          ],
          [
            80.22196,
            12.96092
          ],
          [
            80.23846,
            12.97166
          ],
          [
            80.24948,
            12.98774
          ],
          [
            80.25335,
            13.0067
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-CHE-08",
    "name": "Royapuram / Harbour",
    "district": "Chennai",
    "state": "Tamil Nadu",
    "type": "Port & Coastal Zone",
    "pincode": "600013",
    "lat": 13.1137,
    "lng": 80.2954,
    "radius_km": 6,
    "approx_area_sqkm": 113.1,
    "plus_code": "7M52477W+F5",
    "admin_code": "TN-GEO-0008",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.3509,
            13.1137
          ],
          [
            80.34668,
            13.13439
          ],
          [
            80.33465,
            13.15192
          ],
          [
            80.31664,
            13.16364
          ],
          [
            80.2954,
            13.16775
          ],
          [
            80.27416,
            13.16364
          ],
          [
            80.25615,
            13.15192
          ],
          [
            80.24412,
            13.13439
          ],
          [
            80.2399,
            13.1137
          ],
          [
            80.24412,
            13.09301
          ],
          [
            80.25615,
            13.07548
          ],
          [
            80.27416,
            13.06376
          ],
          [
            80.2954,
            13.05965
          ],
          [
            80.31664,
            13.06376
          ],
          [
            80.33465,
            13.07548
          ],
          [
            80.34668,
            13.09301
          ],
          [
            80.3509,
            13.1137
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-CHE-01",
    "name": "Tambaram South / Chromepet",
    "district": "Chengalpattu",
    "state": "Tamil Nadu",
    "type": "Urban City Hub",
    "pincode": "600045",
    "lat": 12.9249,
    "lng": 80.1,
    "radius_km": 7,
    "approx_area_sqkm": 153.9,
    "plus_code": "7M42W4F2+X2",
    "admin_code": "TN-GEO-0009",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.1647,
            12.9249
          ],
          [
            80.15978,
            12.94903
          ],
          [
            80.14575,
            12.96949
          ],
          [
            80.12476,
            12.98316
          ],
          [
            80.1,
            12.98796
          ],
          [
            80.07524,
            12.98316
          ],
          [
            80.05425,
            12.96949
          ],
          [
            80.04022,
            12.94903
          ],
          [
            80.0353,
            12.9249
          ],
          [
            80.04022,
            12.90077
          ],
          [
            80.05425,
            12.88031
          ],
          [
            80.07524,
            12.86664
          ],
          [
            80.1,
            12.86184
          ],
          [
            80.12476,
            12.86664
          ],
          [
            80.14575,
            12.88031
          ],
          [
            80.15978,
            12.90077
          ],
          [
            80.1647,
            12.9249
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-CHE-02",
    "name": "Chengalpattu Town & HQ",
    "district": "Chengalpattu",
    "state": "Tamil Nadu",
    "type": "District HQ Town",
    "pincode": "603001",
    "lat": 12.6841,
    "lng": 79.9836,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J4XMXMM+JC",
    "admin_code": "TN-GEO-0010",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.06209,
            12.6841
          ],
          [
            80.05612,
            12.7134
          ],
          [
            80.0391,
            12.73825
          ],
          [
            80.01364,
            12.75485
          ],
          [
            79.9836,
            12.76068
          ],
          [
            79.95356,
            12.75485
          ],
          [
            79.9281,
            12.73825
          ],
          [
            79.91108,
            12.7134
          ],
          [
            79.90511,
            12.6841
          ],
          [
            79.91108,
            12.6548
          ],
          [
            79.9281,
            12.62995
          ],
          [
            79.95356,
            12.61335
          ],
          [
            79.9836,
            12.60752
          ],
          [
            80.01364,
            12.61335
          ],
          [
            80.0391,
            12.62995
          ],
          [
            80.05612,
            12.6548
          ],
          [
            80.06209,
            12.6841
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-CHE-03",
    "name": "Maraimalai Nagar / MWC",
    "district": "Chengalpattu",
    "state": "Tamil Nadu",
    "type": "Tech Industrial Zone",
    "pincode": "603209",
    "lat": 12.7961,
    "lng": 80.0233,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7M42Q2WF+C8",
    "admin_code": "TN-GEO-0011",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.09721,
            12.7961
          ],
          [
            80.09158,
            12.82368
          ],
          [
            80.07556,
            12.84706
          ],
          [
            80.05158,
            12.86269
          ],
          [
            80.0233,
            12.86817
          ],
          [
            79.99502,
            12.86269
          ],
          [
            79.97104,
            12.84706
          ],
          [
            79.95502,
            12.82368
          ],
          [
            79.94939,
            12.7961
          ],
          [
            79.95502,
            12.76852
          ],
          [
            79.97104,
            12.74514
          ],
          [
            79.99502,
            12.72951
          ],
          [
            80.0233,
            12.72403
          ],
          [
            80.05158,
            12.72951
          ],
          [
            80.07556,
            12.74514
          ],
          [
            80.09158,
            12.76852
          ],
          [
            80.09721,
            12.7961
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-CHE-04",
    "name": "Mahabalipuram / ECR",
    "district": "Chengalpattu",
    "state": "Tamil Nadu",
    "type": "Coastal Village Cluster",
    "pincode": "603104",
    "lat": 12.6269,
    "lng": 80.1927,
    "radius_km": 9,
    "approx_area_sqkm": 254.5,
    "plus_code": "7M42J5GV+Q3",
    "admin_code": "TN-GEO-0012",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.27579,
            12.6269
          ],
          [
            80.26947,
            12.65793
          ],
          [
            80.25145,
            12.68423
          ],
          [
            80.2245,
            12.70181
          ],
          [
            80.1927,
            12.70798
          ],
          [
            80.1609,
            12.70181
          ],
          [
            80.13395,
            12.68423
          ],
          [
            80.11593,
            12.65793
          ],
          [
            80.10961,
            12.6269
          ],
          [
            80.11593,
            12.59587
          ],
          [
            80.13395,
            12.56957
          ],
          [
            80.1609,
            12.55199
          ],
          [
            80.1927,
            12.54582
          ],
          [
            80.2245,
            12.55199
          ],
          [
            80.25145,
            12.56957
          ],
          [
            80.26947,
            12.59587
          ],
          [
            80.27579,
            12.6269
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-CHE-05",
    "name": "Maduranthakam & Padalam",
    "district": "Chengalpattu",
    "state": "Tamil Nadu",
    "type": "Agricultural Village Zone",
    "pincode": "603306",
    "lat": 12.5083,
    "lng": 79.8833,
    "radius_km": 11,
    "approx_area_sqkm": 380.1,
    "plus_code": "7J4XGV5M+88",
    "admin_code": "TN-GEO-0013",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.98481,
            12.5083
          ],
          [
            79.97708,
            12.54622
          ],
          [
            79.95508,
            12.57837
          ],
          [
            79.92215,
            12.59986
          ],
          [
            79.8833,
            12.6074
          ],
          [
            79.84445,
            12.59986
          ],
          [
            79.81152,
            12.57837
          ],
          [
            79.78952,
            12.54622
          ],
          [
            79.78179,
            12.5083
          ],
          [
            79.78952,
            12.47038
          ],
          [
            79.81152,
            12.43823
          ],
          [
            79.84445,
            12.41674
          ],
          [
            79.8833,
            12.4092
          ],
          [
            79.92215,
            12.41674
          ],
          [
            79.95508,
            12.43823
          ],
          [
            79.97708,
            12.47038
          ],
          [
            79.98481,
            12.5083
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-CHE-06",
    "name": "Cheyyur / Lathur",
    "district": "Chengalpattu",
    "state": "Tamil Nadu",
    "type": "Rural Village Panchayat",
    "pincode": "603302",
    "lat": 12.35,
    "lng": 80,
    "radius_km": 10,
    "approx_area_sqkm": 314.2,
    "plus_code": "7M4282X2+X2",
    "admin_code": "TN-GEO-0014",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.09222,
            12.35
          ],
          [
            80.0852,
            12.38448
          ],
          [
            80.06521,
            12.4137
          ],
          [
            80.03529,
            12.43323
          ],
          [
            80,
            12.44009
          ],
          [
            79.96471,
            12.43323
          ],
          [
            79.93479,
            12.4137
          ],
          [
            79.9148,
            12.38448
          ],
          [
            79.90778,
            12.35
          ],
          [
            79.9148,
            12.31552
          ],
          [
            79.93479,
            12.2863
          ],
          [
            79.96471,
            12.26677
          ],
          [
            80,
            12.25991
          ],
          [
            80.03529,
            12.26677
          ],
          [
            80.06521,
            12.2863
          ],
          [
            80.0852,
            12.31552
          ],
          [
            80.09222,
            12.35
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-KAN-01",
    "name": "Kanchipuram Temple City",
    "district": "Kanchipuram",
    "state": "Tamil Nadu",
    "type": "Silk City Core",
    "pincode": "631501",
    "lat": 12.8342,
    "lng": 79.7036,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J4XRPM3+MC",
    "admin_code": "TN-GEO-0015",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.77752,
            12.8342
          ],
          [
            79.77189,
            12.86178
          ],
          [
            79.75587,
            12.88516
          ],
          [
            79.73189,
            12.90079
          ],
          [
            79.7036,
            12.90627
          ],
          [
            79.67531,
            12.90079
          ],
          [
            79.65133,
            12.88516
          ],
          [
            79.63531,
            12.86178
          ],
          [
            79.62968,
            12.8342
          ],
          [
            79.63531,
            12.80662
          ],
          [
            79.65133,
            12.78324
          ],
          [
            79.67531,
            12.76761
          ],
          [
            79.7036,
            12.76213
          ],
          [
            79.73189,
            12.76761
          ],
          [
            79.75587,
            12.78324
          ],
          [
            79.77189,
            12.80662
          ],
          [
            79.77752,
            12.8342
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-KAN-02",
    "name": "Sriperumbudur Auto Hub",
    "district": "Kanchipuram",
    "state": "Tamil Nadu",
    "type": "Global Industrial City",
    "pincode": "602105",
    "lat": 12.9675,
    "lng": 79.9431,
    "radius_km": 9.5,
    "approx_area_sqkm": 283.5,
    "plus_code": "7J4XXW9V+26",
    "admin_code": "TN-GEO-0016",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.03093,
            12.9675
          ],
          [
            80.02424,
            13.00025
          ],
          [
            80.0052,
            13.02802
          ],
          [
            79.97671,
            13.04657
          ],
          [
            79.9431,
            13.05309
          ],
          [
            79.90949,
            13.04657
          ],
          [
            79.881,
            13.02802
          ],
          [
            79.86196,
            13.00025
          ],
          [
            79.85527,
            12.9675
          ],
          [
            79.86196,
            12.93475
          ],
          [
            79.881,
            12.90698
          ],
          [
            79.90949,
            12.88843
          ],
          [
            79.9431,
            12.88191
          ],
          [
            79.97671,
            12.88843
          ],
          [
            80.0052,
            12.90698
          ],
          [
            80.02424,
            12.93475
          ],
          [
            80.03093,
            12.9675
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-KAN-03",
    "name": "Walajabad Town & Weavers",
    "district": "Kanchipuram",
    "state": "Tamil Nadu",
    "type": "Town & Handloom Hub",
    "pincode": "631605",
    "lat": 12.8167,
    "lng": 79.8167,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J4XRR88+MM",
    "admin_code": "TN-GEO-0017",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.89061,
            12.8167
          ],
          [
            79.88499,
            12.84428
          ],
          [
            79.86896,
            12.86766
          ],
          [
            79.84499,
            12.88329
          ],
          [
            79.8167,
            12.88877
          ],
          [
            79.78841,
            12.88329
          ],
          [
            79.76444,
            12.86766
          ],
          [
            79.74841,
            12.84428
          ],
          [
            79.74279,
            12.8167
          ],
          [
            79.74841,
            12.78912
          ],
          [
            79.76444,
            12.76574
          ],
          [
            79.78841,
            12.75011
          ],
          [
            79.8167,
            12.74463
          ],
          [
            79.84499,
            12.75011
          ],
          [
            79.86896,
            12.76574
          ],
          [
            79.88499,
            12.78912
          ],
          [
            79.89061,
            12.8167
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-KAN-04",
    "name": "Uthiramerur Historic Zone",
    "district": "Kanchipuram",
    "state": "Tamil Nadu",
    "type": "Heritage Village Cluster",
    "pincode": "603406",
    "lat": 12.6167,
    "lng": 79.7667,
    "radius_km": 9,
    "approx_area_sqkm": 254.5,
    "plus_code": "7J4XJQ88+MM",
    "admin_code": "TN-GEO-0018",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.84979,
            12.6167
          ],
          [
            79.84346,
            12.64773
          ],
          [
            79.82545,
            12.67403
          ],
          [
            79.7985,
            12.69161
          ],
          [
            79.7667,
            12.69778
          ],
          [
            79.7349,
            12.69161
          ],
          [
            79.70795,
            12.67403
          ],
          [
            79.68994,
            12.64773
          ],
          [
            79.68361,
            12.6167
          ],
          [
            79.68994,
            12.58567
          ],
          [
            79.70795,
            12.55937
          ],
          [
            79.7349,
            12.54179
          ],
          [
            79.7667,
            12.53562
          ],
          [
            79.7985,
            12.54179
          ],
          [
            79.82545,
            12.55937
          ],
          [
            79.84346,
            12.58567
          ],
          [
            79.84979,
            12.6167
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-KAN-05",
    "name": "Kundrathur / Mangadu",
    "district": "Kanchipuram",
    "state": "Tamil Nadu",
    "type": "Peri-Urban Suburb",
    "pincode": "600069",
    "lat": 12.9967,
    "lng": 80.0967,
    "radius_km": 7,
    "approx_area_sqkm": 153.9,
    "plus_code": "7M42X3WW+MM",
    "admin_code": "TN-GEO-0019",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.16142,
            12.9967
          ],
          [
            80.15649,
            13.02083
          ],
          [
            80.14246,
            13.04129
          ],
          [
            80.12147,
            13.05496
          ],
          [
            80.0967,
            13.05976
          ],
          [
            80.07193,
            13.05496
          ],
          [
            80.05094,
            13.04129
          ],
          [
            80.03691,
            13.02083
          ],
          [
            80.03198,
            12.9967
          ],
          [
            80.03691,
            12.97257
          ],
          [
            80.05094,
            12.95211
          ],
          [
            80.07193,
            12.93844
          ],
          [
            80.0967,
            12.93364
          ],
          [
            80.12147,
            12.93844
          ],
          [
            80.14246,
            12.95211
          ],
          [
            80.15649,
            12.97257
          ],
          [
            80.16142,
            12.9967
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-THI-01",
    "name": "Thiruvallur Town Core",
    "district": "Thiruvallur",
    "state": "Tamil Nadu",
    "type": "District HQ Town",
    "pincode": "602001",
    "lat": 13.1439,
    "lng": 79.9083,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J5X4WV5+H8",
    "admin_code": "TN-GEO-0020",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.98694,
            13.1439
          ],
          [
            79.98095,
            13.1732
          ],
          [
            79.9639,
            13.19805
          ],
          [
            79.93839,
            13.21465
          ],
          [
            79.9083,
            13.22048
          ],
          [
            79.87821,
            13.21465
          ],
          [
            79.8527,
            13.19805
          ],
          [
            79.83565,
            13.1732
          ],
          [
            79.82966,
            13.1439
          ],
          [
            79.83565,
            13.1146
          ],
          [
            79.8527,
            13.08975
          ],
          [
            79.87821,
            13.07315
          ],
          [
            79.9083,
            13.06732
          ],
          [
            79.93839,
            13.07315
          ],
          [
            79.9639,
            13.08975
          ],
          [
            79.98095,
            13.1146
          ],
          [
            79.98694,
            13.1439
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-THI-02",
    "name": "Ambattur / Avadi Industrial",
    "district": "Thiruvallur",
    "state": "Tamil Nadu",
    "type": "Metro Industrial Zone",
    "pincode": "600053",
    "lat": 13.1143,
    "lng": 80.1548,
    "radius_km": 7.5,
    "approx_area_sqkm": 176.7,
    "plus_code": "7M524573+PW",
    "admin_code": "TN-GEO-0021",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.22418,
            13.1143
          ],
          [
            80.2189,
            13.14016
          ],
          [
            80.20386,
            13.16208
          ],
          [
            80.18135,
            13.17672
          ],
          [
            80.1548,
            13.18187
          ],
          [
            80.12825,
            13.17672
          ],
          [
            80.10574,
            13.16208
          ],
          [
            80.0907,
            13.14016
          ],
          [
            80.08542,
            13.1143
          ],
          [
            80.0907,
            13.08844
          ],
          [
            80.10574,
            13.06652
          ],
          [
            80.12825,
            13.05188
          ],
          [
            80.1548,
            13.04673
          ],
          [
            80.18135,
            13.05188
          ],
          [
            80.20386,
            13.06652
          ],
          [
            80.2189,
            13.08844
          ],
          [
            80.22418,
            13.1143
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-THI-03",
    "name": "Ponneri / Minjur Port",
    "district": "Thiruvallur",
    "state": "Tamil Nadu",
    "type": "Coastal Port Hub",
    "pincode": "601204",
    "lat": 13.3333,
    "lng": 80.2,
    "radius_km": 10,
    "approx_area_sqkm": 314.2,
    "plus_code": "7M5285MX+8X",
    "admin_code": "TN-GEO-0022",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.29259,
            13.3333
          ],
          [
            80.28554,
            13.36778
          ],
          [
            80.26547,
            13.397
          ],
          [
            80.23543,
            13.41653
          ],
          [
            80.2,
            13.42339
          ],
          [
            80.16457,
            13.41653
          ],
          [
            80.13453,
            13.397
          ],
          [
            80.11446,
            13.36778
          ],
          [
            80.10741,
            13.3333
          ],
          [
            80.11446,
            13.29882
          ],
          [
            80.13453,
            13.2696
          ],
          [
            80.16457,
            13.25007
          ],
          [
            80.2,
            13.24321
          ],
          [
            80.23543,
            13.25007
          ],
          [
            80.26547,
            13.2696
          ],
          [
            80.28554,
            13.29882
          ],
          [
            80.29259,
            13.3333
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-THI-04",
    "name": "Gummidipoondi Border Zone",
    "district": "Thiruvallur",
    "state": "Tamil Nadu",
    "type": "Industrial Town Zone",
    "pincode": "601201",
    "lat": 13.4,
    "lng": 80.1333,
    "radius_km": 9.5,
    "approx_area_sqkm": 283.5,
    "plus_code": "7M52C42M+28",
    "admin_code": "TN-GEO-0023",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.22128,
            13.4
          ],
          [
            80.21458,
            13.43275
          ],
          [
            80.19551,
            13.46052
          ],
          [
            80.16697,
            13.47907
          ],
          [
            80.1333,
            13.48559
          ],
          [
            80.09963,
            13.47907
          ],
          [
            80.07109,
            13.46052
          ],
          [
            80.05202,
            13.43275
          ],
          [
            80.04532,
            13.4
          ],
          [
            80.05202,
            13.36725
          ],
          [
            80.07109,
            13.33948
          ],
          [
            80.09963,
            13.32093
          ],
          [
            80.1333,
            13.31441
          ],
          [
            80.16697,
            13.32093
          ],
          [
            80.19551,
            13.33948
          ],
          [
            80.21458,
            13.36725
          ],
          [
            80.22128,
            13.4
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-THI-05",
    "name": "Tiruttani Temple Town",
    "district": "Thiruvallur",
    "state": "Tamil Nadu",
    "type": "Pilgrim Town & Cluster",
    "pincode": "631209",
    "lat": 13.1833,
    "lng": 79.6167,
    "radius_km": 9,
    "approx_area_sqkm": 254.5,
    "plus_code": "7J5X5JM8+8M",
    "admin_code": "TN-GEO-0024",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.69998,
            13.1833
          ],
          [
            79.69364,
            13.21433
          ],
          [
            79.67558,
            13.24063
          ],
          [
            79.64857,
            13.25821
          ],
          [
            79.6167,
            13.26438
          ],
          [
            79.58483,
            13.25821
          ],
          [
            79.55782,
            13.24063
          ],
          [
            79.53976,
            13.21433
          ],
          [
            79.53342,
            13.1833
          ],
          [
            79.53976,
            13.15227
          ],
          [
            79.55782,
            13.12597
          ],
          [
            79.58483,
            13.10839
          ],
          [
            79.6167,
            13.10222
          ],
          [
            79.64857,
            13.10839
          ],
          [
            79.67558,
            13.12597
          ],
          [
            79.69364,
            13.15227
          ],
          [
            79.69998,
            13.1833
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-THI-06",
    "name": "Uthukkottai Border Villages",
    "district": "Thiruvallur",
    "state": "Tamil Nadu",
    "type": "Rural Agro Village Zone",
    "pincode": "602026",
    "lat": 13.3167,
    "lng": 79.9,
    "radius_km": 10.5,
    "approx_area_sqkm": 346.4,
    "plus_code": "7J5X8V8X+MX",
    "admin_code": "TN-GEO-0025",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.99721,
            13.3167
          ],
          [
            79.98981,
            13.3529
          ],
          [
            79.96874,
            13.38359
          ],
          [
            79.9372,
            13.40409
          ],
          [
            79.9,
            13.41129
          ],
          [
            79.8628,
            13.40409
          ],
          [
            79.83126,
            13.38359
          ],
          [
            79.81019,
            13.3529
          ],
          [
            79.80279,
            13.3167
          ],
          [
            79.81019,
            13.2805
          ],
          [
            79.83126,
            13.24981
          ],
          [
            79.8628,
            13.22931
          ],
          [
            79.9,
            13.22211
          ],
          [
            79.9372,
            13.22931
          ],
          [
            79.96874,
            13.24981
          ],
          [
            79.98981,
            13.2805
          ],
          [
            79.99721,
            13.3167
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-COI-01",
    "name": "Gandhipuram / RS Puram",
    "district": "Coimbatore",
    "state": "Tamil Nadu",
    "type": "City Commercial Core",
    "pincode": "641012",
    "lat": 11.0168,
    "lng": 76.9558,
    "radius_km": 6.5,
    "approx_area_sqkm": 132.7,
    "plus_code": "7J3R2X84+P8",
    "admin_code": "TN-GEO-0026",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.01546,
            11.0168
          ],
          [
            77.01092,
            11.03921
          ],
          [
            76.99798,
            11.05821
          ],
          [
            76.97863,
            11.0709
          ],
          [
            76.9558,
            11.07536
          ],
          [
            76.93297,
            11.0709
          ],
          [
            76.91362,
            11.05821
          ],
          [
            76.90068,
            11.03921
          ],
          [
            76.89614,
            11.0168
          ],
          [
            76.90068,
            10.99439
          ],
          [
            76.91362,
            10.97539
          ],
          [
            76.93297,
            10.9627
          ],
          [
            76.9558,
            10.95824
          ],
          [
            76.97863,
            10.9627
          ],
          [
            76.99798,
            10.97539
          ],
          [
            77.01092,
            10.99439
          ],
          [
            77.01546,
            11.0168
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-COI-02",
    "name": "Peelamedu / Airport Hub",
    "district": "Coimbatore",
    "state": "Tamil Nadu",
    "type": "Tech & Aviation City Zone",
    "pincode": "641004",
    "lat": 11.0311,
    "lng": 77.0177,
    "radius_km": 7,
    "approx_area_sqkm": 153.9,
    "plus_code": "7J3V22J9+C3",
    "admin_code": "TN-GEO-0027",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.08195,
            11.0311
          ],
          [
            77.07706,
            11.05523
          ],
          [
            77.06313,
            11.07569
          ],
          [
            77.04229,
            11.08936
          ],
          [
            77.0177,
            11.09416
          ],
          [
            76.99311,
            11.08936
          ],
          [
            76.97227,
            11.07569
          ],
          [
            76.95834,
            11.05523
          ],
          [
            76.95345,
            11.0311
          ],
          [
            76.95834,
            11.00697
          ],
          [
            76.97227,
            10.98651
          ],
          [
            76.99311,
            10.97284
          ],
          [
            77.0177,
            10.96804
          ],
          [
            77.04229,
            10.97284
          ],
          [
            77.06313,
            10.98651
          ],
          [
            77.07706,
            11.00697
          ],
          [
            77.08195,
            11.0311
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-COI-03",
    "name": "Pollachi Coconut Hub",
    "district": "Coimbatore",
    "state": "Tamil Nadu",
    "type": "Agricultural Town Hub",
    "pincode": "642001",
    "lat": 10.6609,
    "lng": 77.0048,
    "radius_km": 9.5,
    "approx_area_sqkm": 283.5,
    "plus_code": "7J2VM263+9W",
    "admin_code": "TN-GEO-0028",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.09189,
            10.6609
          ],
          [
            77.08526,
            10.69365
          ],
          [
            77.06638,
            10.72142
          ],
          [
            77.03813,
            10.73997
          ],
          [
            77.0048,
            10.74649
          ],
          [
            76.97147,
            10.73997
          ],
          [
            76.94322,
            10.72142
          ],
          [
            76.92434,
            10.69365
          ],
          [
            76.91771,
            10.6609
          ],
          [
            76.92434,
            10.62815
          ],
          [
            76.94322,
            10.60038
          ],
          [
            76.97147,
            10.58183
          ],
          [
            77.0048,
            10.57531
          ],
          [
            77.03813,
            10.58183
          ],
          [
            77.06638,
            10.60038
          ],
          [
            77.08526,
            10.62815
          ],
          [
            77.09189,
            10.6609
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-COI-04",
    "name": "Mettupalayam Foothills",
    "district": "Coimbatore",
    "state": "Tamil Nadu",
    "type": "Hill Gateway Town",
    "pincode": "641301",
    "lat": 11.3,
    "lng": 76.95,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J3R7WXX+XX",
    "admin_code": "TN-GEO-0029",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.02809,
            11.3
          ],
          [
            77.02215,
            11.3293
          ],
          [
            77.00522,
            11.35415
          ],
          [
            76.97988,
            11.37075
          ],
          [
            76.95,
            11.37658
          ],
          [
            76.92012,
            11.37075
          ],
          [
            76.89478,
            11.35415
          ],
          [
            76.87785,
            11.3293
          ],
          [
            76.87191,
            11.3
          ],
          [
            76.87785,
            11.2707
          ],
          [
            76.89478,
            11.24585
          ],
          [
            76.92012,
            11.22925
          ],
          [
            76.95,
            11.22342
          ],
          [
            76.97988,
            11.22925
          ],
          [
            77.00522,
            11.24585
          ],
          [
            77.02215,
            11.2707
          ],
          [
            77.02809,
            11.3
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-COI-05",
    "name": "Sulur Air Force & Industry",
    "district": "Coimbatore",
    "state": "Tamil Nadu",
    "type": "Aerospace Town Zone",
    "pincode": "641402",
    "lat": 11.0264,
    "lng": 77.1264,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J3V24GG+HH",
    "admin_code": "TN-GEO-0030",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.19983,
            11.0264
          ],
          [
            77.19424,
            11.05398
          ],
          [
            77.17832,
            11.07736
          ],
          [
            77.1545,
            11.09299
          ],
          [
            77.1264,
            11.09847
          ],
          [
            77.0983,
            11.09299
          ],
          [
            77.07448,
            11.07736
          ],
          [
            77.05856,
            11.05398
          ],
          [
            77.05297,
            11.0264
          ],
          [
            77.05856,
            10.99882
          ],
          [
            77.07448,
            10.97544
          ],
          [
            77.0983,
            10.95981
          ],
          [
            77.1264,
            10.95433
          ],
          [
            77.1545,
            10.95981
          ],
          [
            77.17832,
            10.97544
          ],
          [
            77.19424,
            10.99882
          ],
          [
            77.19983,
            11.0264
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-COI-06",
    "name": "Annur Rural Cluster",
    "district": "Coimbatore",
    "state": "Tamil Nadu",
    "type": "Agricultural Village Zone",
    "pincode": "641653",
    "lat": 11.2333,
    "lng": 77.1333,
    "radius_km": 9,
    "approx_area_sqkm": 254.5,
    "plus_code": "7J3V64MM+88",
    "admin_code": "TN-GEO-0031",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.21596,
            11.2333
          ],
          [
            77.20967,
            11.26433
          ],
          [
            77.19175,
            11.29063
          ],
          [
            77.16493,
            11.30821
          ],
          [
            77.1333,
            11.31438
          ],
          [
            77.10167,
            11.30821
          ],
          [
            77.07485,
            11.29063
          ],
          [
            77.05693,
            11.26433
          ],
          [
            77.05064,
            11.2333
          ],
          [
            77.05693,
            11.20227
          ],
          [
            77.07485,
            11.17597
          ],
          [
            77.10167,
            11.15839
          ],
          [
            77.1333,
            11.15222
          ],
          [
            77.16493,
            11.15839
          ],
          [
            77.19175,
            11.17597
          ],
          [
            77.20967,
            11.20227
          ],
          [
            77.21596,
            11.2333
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-COI-07",
    "name": "Thondamuthur Western Ghats",
    "district": "Coimbatore",
    "state": "Tamil Nadu",
    "type": "Ecological Village Cluster",
    "pincode": "641109",
    "lat": 10.9984,
    "lng": 76.8378,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J2RXRXQ+94",
    "admin_code": "TN-GEO-0032",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            76.91581,
            10.9984
          ],
          [
            76.90987,
            11.0277
          ],
          [
            76.89296,
            11.05255
          ],
          [
            76.86765,
            11.06915
          ],
          [
            76.8378,
            11.07498
          ],
          [
            76.80795,
            11.06915
          ],
          [
            76.78264,
            11.05255
          ],
          [
            76.76573,
            11.0277
          ],
          [
            76.75979,
            10.9984
          ],
          [
            76.76573,
            10.9691
          ],
          [
            76.78264,
            10.94425
          ],
          [
            76.80795,
            10.92765
          ],
          [
            76.8378,
            10.92182
          ],
          [
            76.86765,
            10.92765
          ],
          [
            76.89296,
            10.94425
          ],
          [
            76.90987,
            10.9691
          ],
          [
            76.91581,
            10.9984
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-COI-08",
    "name": "Kinathukadavu Farming Hub",
    "district": "Coimbatore",
    "state": "Tamil Nadu",
    "type": "Rural Village Hub",
    "pincode": "642109",
    "lat": 10.8167,
    "lng": 77.0167,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J2VR288+MM",
    "admin_code": "TN-GEO-0033",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.09466,
            10.8167
          ],
          [
            77.08873,
            10.846
          ],
          [
            77.07183,
            10.87085
          ],
          [
            77.04653,
            10.88745
          ],
          [
            77.0167,
            10.89328
          ],
          [
            76.98687,
            10.88745
          ],
          [
            76.96157,
            10.87085
          ],
          [
            76.94467,
            10.846
          ],
          [
            76.93874,
            10.8167
          ],
          [
            76.94467,
            10.7874
          ],
          [
            76.96157,
            10.76255
          ],
          [
            76.98687,
            10.74595
          ],
          [
            77.0167,
            10.74012
          ],
          [
            77.04653,
            10.74595
          ],
          [
            77.07183,
            10.76255
          ],
          [
            77.08873,
            10.7874
          ],
          [
            77.09466,
            10.8167
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TIR-01",
    "name": "Tiruppur City Central",
    "district": "Tiruppur",
    "state": "Tamil Nadu",
    "type": "Knitwear Capital Core",
    "pincode": "641604",
    "lat": 11.1085,
    "lng": 77.3411,
    "radius_km": 7.5,
    "approx_area_sqkm": 176.7,
    "plus_code": "7J3V485R+9C",
    "admin_code": "TN-GEO-0034",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.40996,
            11.1085
          ],
          [
            77.40472,
            11.13436
          ],
          [
            77.38979,
            11.15628
          ],
          [
            77.36745,
            11.17092
          ],
          [
            77.3411,
            11.17607
          ],
          [
            77.31475,
            11.17092
          ],
          [
            77.29241,
            11.15628
          ],
          [
            77.27748,
            11.13436
          ],
          [
            77.27224,
            11.1085
          ],
          [
            77.27748,
            11.08264
          ],
          [
            77.29241,
            11.06072
          ],
          [
            77.31475,
            11.04608
          ],
          [
            77.3411,
            11.04093
          ],
          [
            77.36745,
            11.04608
          ],
          [
            77.38979,
            11.06072
          ],
          [
            77.40472,
            11.08264
          ],
          [
            77.40996,
            11.1085
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TIR-02",
    "name": "Avinashi Historic Hub",
    "district": "Tiruppur",
    "state": "Tamil Nadu",
    "type": "Industrial Town Zone",
    "pincode": "641654",
    "lat": 11.1939,
    "lng": 77.2694,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J3V57V9+HQ",
    "admin_code": "TN-GEO-0035",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.34287,
            11.1939
          ],
          [
            77.33728,
            11.22148
          ],
          [
            77.32135,
            11.24486
          ],
          [
            77.29752,
            11.26049
          ],
          [
            77.2694,
            11.26597
          ],
          [
            77.24128,
            11.26049
          ],
          [
            77.21745,
            11.24486
          ],
          [
            77.20152,
            11.22148
          ],
          [
            77.19593,
            11.1939
          ],
          [
            77.20152,
            11.16632
          ],
          [
            77.21745,
            11.14294
          ],
          [
            77.24128,
            11.12731
          ],
          [
            77.2694,
            11.12183
          ],
          [
            77.29752,
            11.12731
          ],
          [
            77.32135,
            11.14294
          ],
          [
            77.33728,
            11.16632
          ],
          [
            77.34287,
            11.1939
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TIR-03",
    "name": "Palladam Poultry & Powerloom",
    "district": "Tiruppur",
    "state": "Tamil Nadu",
    "type": "High-Growth Town Hub",
    "pincode": "641664",
    "lat": 10.9983,
    "lng": 77.2917,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J2VX7XR+8M",
    "admin_code": "TN-GEO-0036",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.36971,
            10.9983
          ],
          [
            77.36377,
            11.0276
          ],
          [
            77.34686,
            11.05245
          ],
          [
            77.32155,
            11.06905
          ],
          [
            77.2917,
            11.07488
          ],
          [
            77.26185,
            11.06905
          ],
          [
            77.23654,
            11.05245
          ],
          [
            77.21963,
            11.0276
          ],
          [
            77.21369,
            10.9983
          ],
          [
            77.21963,
            10.969
          ],
          [
            77.23654,
            10.94415
          ],
          [
            77.26185,
            10.92755
          ],
          [
            77.2917,
            10.92172
          ],
          [
            77.32155,
            10.92755
          ],
          [
            77.34686,
            10.94415
          ],
          [
            77.36377,
            10.969
          ],
          [
            77.36971,
            10.9983
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TIR-04",
    "name": "Dharapuram Temple Zone",
    "district": "Tiruppur",
    "state": "Tamil Nadu",
    "type": "Heritage Town Zone",
    "pincode": "638656",
    "lat": 10.73,
    "lng": 77.53,
    "radius_km": 9.5,
    "approx_area_sqkm": 283.5,
    "plus_code": "7J2VPGJH+2X",
    "admin_code": "TN-GEO-0037",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.61711,
            10.73
          ],
          [
            77.61048,
            10.76275
          ],
          [
            77.5916,
            10.79052
          ],
          [
            77.56334,
            10.80907
          ],
          [
            77.53,
            10.81559
          ],
          [
            77.49666,
            10.80907
          ],
          [
            77.4684,
            10.79052
          ],
          [
            77.44952,
            10.76275
          ],
          [
            77.44289,
            10.73
          ],
          [
            77.44952,
            10.69725
          ],
          [
            77.4684,
            10.66948
          ],
          [
            77.49666,
            10.65093
          ],
          [
            77.53,
            10.64441
          ],
          [
            77.56334,
            10.65093
          ],
          [
            77.5916,
            10.66948
          ],
          [
            77.61048,
            10.69725
          ],
          [
            77.61711,
            10.73
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TIR-05",
    "name": "Kangeyam Agro & Cattle",
    "district": "Tiruppur",
    "state": "Tamil Nadu",
    "type": "Oil & Agro Town Hub",
    "pincode": "638701",
    "lat": 11,
    "lng": 77.56,
    "radius_km": 9,
    "approx_area_sqkm": 254.5,
    "plus_code": "7J3V2H26+22",
    "admin_code": "TN-GEO-0038",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.6426,
            11
          ],
          [
            77.63631,
            11.03103
          ],
          [
            77.61841,
            11.05733
          ],
          [
            77.59161,
            11.07491
          ],
          [
            77.56,
            11.08108
          ],
          [
            77.52839,
            11.07491
          ],
          [
            77.50159,
            11.05733
          ],
          [
            77.48369,
            11.03103
          ],
          [
            77.4774,
            11
          ],
          [
            77.48369,
            10.96897
          ],
          [
            77.50159,
            10.94267
          ],
          [
            77.52839,
            10.92509
          ],
          [
            77.56,
            10.91892
          ],
          [
            77.59161,
            10.92509
          ],
          [
            77.61841,
            10.94267
          ],
          [
            77.63631,
            10.96897
          ],
          [
            77.6426,
            11
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TIR-06",
    "name": "Udumalaipettai Windmill Hub",
    "district": "Tiruppur",
    "state": "Tamil Nadu",
    "type": "Green Energy Town Zone",
    "pincode": "642126",
    "lat": 10.5847,
    "lng": 77.2483,
    "radius_km": 9.5,
    "approx_area_sqkm": 283.5,
    "plus_code": "7J2VH6MX+V8",
    "admin_code": "TN-GEO-0039",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.33537,
            10.5847
          ],
          [
            77.32874,
            10.61745
          ],
          [
            77.30987,
            10.64522
          ],
          [
            77.28162,
            10.66377
          ],
          [
            77.2483,
            10.67029
          ],
          [
            77.21498,
            10.66377
          ],
          [
            77.18673,
            10.64522
          ],
          [
            77.16786,
            10.61745
          ],
          [
            77.16123,
            10.5847
          ],
          [
            77.16786,
            10.55195
          ],
          [
            77.18673,
            10.52418
          ],
          [
            77.21498,
            10.50563
          ],
          [
            77.2483,
            10.49911
          ],
          [
            77.28162,
            10.50563
          ],
          [
            77.30987,
            10.52418
          ],
          [
            77.32874,
            10.55195
          ],
          [
            77.33537,
            10.5847
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TIR-07",
    "name": "Madathukulam Canals",
    "district": "Tiruppur",
    "state": "Tamil Nadu",
    "type": "Irrigated Village Zone",
    "pincode": "642113",
    "lat": 10.5667,
    "lng": 77.3833,
    "radius_km": 9,
    "approx_area_sqkm": 254.5,
    "plus_code": "7J2VH98M+M8",
    "admin_code": "TN-GEO-0040",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.46578,
            10.5667
          ],
          [
            77.4595,
            10.59773
          ],
          [
            77.44162,
            10.62403
          ],
          [
            77.41486,
            10.64161
          ],
          [
            77.3833,
            10.64778
          ],
          [
            77.35174,
            10.64161
          ],
          [
            77.32498,
            10.62403
          ],
          [
            77.3071,
            10.59773
          ],
          [
            77.30082,
            10.5667
          ],
          [
            77.3071,
            10.53567
          ],
          [
            77.32498,
            10.50937
          ],
          [
            77.35174,
            10.49179
          ],
          [
            77.3833,
            10.48562
          ],
          [
            77.41486,
            10.49179
          ],
          [
            77.44162,
            10.50937
          ],
          [
            77.4595,
            10.53567
          ],
          [
            77.46578,
            10.5667
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-MAD-01",
    "name": "Madurai City Core (Meenakshi)",
    "district": "Madurai",
    "state": "Tamil Nadu",
    "type": "City Heritage Core",
    "pincode": "625001",
    "lat": 9.9195,
    "lng": 78.1194,
    "radius_km": 7,
    "approx_area_sqkm": 153.9,
    "plus_code": "6JXWW499+QQ",
    "admin_code": "TN-GEO-0041",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.18342,
            9.9195
          ],
          [
            78.17855,
            9.94363
          ],
          [
            78.16467,
            9.96409
          ],
          [
            78.1439,
            9.97776
          ],
          [
            78.1194,
            9.98256
          ],
          [
            78.0949,
            9.97776
          ],
          [
            78.07413,
            9.96409
          ],
          [
            78.06025,
            9.94363
          ],
          [
            78.05538,
            9.9195
          ],
          [
            78.06025,
            9.89537
          ],
          [
            78.07413,
            9.87491
          ],
          [
            78.0949,
            9.86124
          ],
          [
            78.1194,
            9.85644
          ],
          [
            78.1439,
            9.86124
          ],
          [
            78.16467,
            9.87491
          ],
          [
            78.17855,
            9.89537
          ],
          [
            78.18342,
            9.9195
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-MAD-02",
    "name": "Melur Granite & Agri",
    "district": "Madurai",
    "state": "Tamil Nadu",
    "type": "Trade Town Zone",
    "pincode": "625106",
    "lat": 10.05,
    "lng": 78.3333,
    "radius_km": 9.5,
    "approx_area_sqkm": 283.5,
    "plus_code": "7J2W28XM+X8",
    "admin_code": "TN-GEO-0042",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.42022,
            10.05
          ],
          [
            78.4136,
            10.08275
          ],
          [
            78.39476,
            10.11052
          ],
          [
            78.36656,
            10.12907
          ],
          [
            78.3333,
            10.13559
          ],
          [
            78.30004,
            10.12907
          ],
          [
            78.27184,
            10.11052
          ],
          [
            78.253,
            10.08275
          ],
          [
            78.24638,
            10.05
          ],
          [
            78.253,
            10.01725
          ],
          [
            78.27184,
            9.98948
          ],
          [
            78.30004,
            9.97093
          ],
          [
            78.3333,
            9.96441
          ],
          [
            78.36656,
            9.97093
          ],
          [
            78.39476,
            9.98948
          ],
          [
            78.4136,
            10.01725
          ],
          [
            78.42022,
            10.05
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-MAD-03",
    "name": "Thirumangalam Gateway",
    "district": "Madurai",
    "state": "Tamil Nadu",
    "type": "Logistics Town Hub",
    "pincode": "625706",
    "lat": 9.8228,
    "lng": 77.9869,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "6JXVRXFP+4Q",
    "admin_code": "TN-GEO-0043",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.06462,
            9.8228
          ],
          [
            78.0587,
            9.8521
          ],
          [
            78.04185,
            9.87695
          ],
          [
            78.01664,
            9.89355
          ],
          [
            77.9869,
            9.89938
          ],
          [
            77.95716,
            9.89355
          ],
          [
            77.93195,
            9.87695
          ],
          [
            77.9151,
            9.8521
          ],
          [
            77.90918,
            9.8228
          ],
          [
            77.9151,
            9.7935
          ],
          [
            77.93195,
            9.76865
          ],
          [
            77.95716,
            9.75205
          ],
          [
            77.9869,
            9.74622
          ],
          [
            78.01664,
            9.75205
          ],
          [
            78.04185,
            9.76865
          ],
          [
            78.0587,
            9.7935
          ],
          [
            78.06462,
            9.8228
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-MAD-04",
    "name": "Usilampatti Foothills",
    "district": "Madurai",
    "state": "Tamil Nadu",
    "type": "Rural Town Zone",
    "pincode": "625532",
    "lat": 9.9667,
    "lng": 77.7833,
    "radius_km": 9.5,
    "approx_area_sqkm": 283.5,
    "plus_code": "6JXVXQ8M+M8",
    "admin_code": "TN-GEO-0044",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.8702,
            9.9667
          ],
          [
            77.86358,
            9.99945
          ],
          [
            77.84475,
            10.02722
          ],
          [
            77.81655,
            10.04577
          ],
          [
            77.7833,
            10.05229
          ],
          [
            77.75005,
            10.04577
          ],
          [
            77.72185,
            10.02722
          ],
          [
            77.70302,
            9.99945
          ],
          [
            77.6964,
            9.9667
          ],
          [
            77.70302,
            9.93395
          ],
          [
            77.72185,
            9.90618
          ],
          [
            77.75005,
            9.88763
          ],
          [
            77.7833,
            9.88111
          ],
          [
            77.81655,
            9.88763
          ],
          [
            77.84475,
            9.90618
          ],
          [
            77.86358,
            9.93395
          ],
          [
            77.8702,
            9.9667
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-MAD-05",
    "name": "Vadipatti Fertile Belt",
    "district": "Madurai",
    "state": "Tamil Nadu",
    "type": "Canal Agro Town",
    "pincode": "625218",
    "lat": 10.0833,
    "lng": 78.0333,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J2W32MM+88",
    "admin_code": "TN-GEO-0045",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.11108,
            10.0833
          ],
          [
            78.10516,
            10.1126
          ],
          [
            78.0883,
            10.13745
          ],
          [
            78.06306,
            10.15405
          ],
          [
            78.0333,
            10.15988
          ],
          [
            78.00354,
            10.15405
          ],
          [
            77.9783,
            10.13745
          ],
          [
            77.96144,
            10.1126
          ],
          [
            77.95552,
            10.0833
          ],
          [
            77.96144,
            10.054
          ],
          [
            77.9783,
            10.02915
          ],
          [
            78.00354,
            10.01255
          ],
          [
            78.0333,
            10.00672
          ],
          [
            78.06306,
            10.01255
          ],
          [
            78.0883,
            10.02915
          ],
          [
            78.10516,
            10.054
          ],
          [
            78.11108,
            10.0833
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-MAD-06",
    "name": "Sholavandan Vaigai Belt",
    "district": "Madurai",
    "state": "Tamil Nadu",
    "type": "Agricultural Village Hub",
    "pincode": "625214",
    "lat": 10.0219,
    "lng": 78.0142,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J2W22C7+QM",
    "admin_code": "TN-GEO-0046",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.08739,
            10.0219
          ],
          [
            78.08182,
            10.04948
          ],
          [
            78.06595,
            10.07286
          ],
          [
            78.04221,
            10.08849
          ],
          [
            78.0142,
            10.09397
          ],
          [
            77.98619,
            10.08849
          ],
          [
            77.96245,
            10.07286
          ],
          [
            77.94658,
            10.04948
          ],
          [
            77.94101,
            10.0219
          ],
          [
            77.94658,
            9.99432
          ],
          [
            77.96245,
            9.97094
          ],
          [
            77.98619,
            9.95531
          ],
          [
            78.0142,
            9.94983
          ],
          [
            78.04221,
            9.95531
          ],
          [
            78.06595,
            9.97094
          ],
          [
            78.08182,
            9.99432
          ],
          [
            78.08739,
            10.0219
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-MAD-07",
    "name": "Alanganallur Cultural Hub",
    "district": "Madurai",
    "state": "Tamil Nadu",
    "type": "Heritage Village Cluster",
    "pincode": "625501",
    "lat": 10.0467,
    "lng": 78.15,
    "radius_km": 7.5,
    "approx_area_sqkm": 176.7,
    "plus_code": "7J2W24WX+MX",
    "admin_code": "TN-GEO-0047",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.21862,
            10.0467
          ],
          [
            78.2134,
            10.07256
          ],
          [
            78.19852,
            10.09448
          ],
          [
            78.17626,
            10.10912
          ],
          [
            78.15,
            10.11427
          ],
          [
            78.12374,
            10.10912
          ],
          [
            78.10148,
            10.09448
          ],
          [
            78.0866,
            10.07256
          ],
          [
            78.08138,
            10.0467
          ],
          [
            78.0866,
            10.02084
          ],
          [
            78.10148,
            9.99892
          ],
          [
            78.12374,
            9.98428
          ],
          [
            78.15,
            9.97913
          ],
          [
            78.17626,
            9.98428
          ],
          [
            78.19852,
            9.99892
          ],
          [
            78.2134,
            10.02084
          ],
          [
            78.21862,
            10.0467
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-MAD-08",
    "name": "Peraiyur Dryland Belt",
    "district": "Madurai",
    "state": "Tamil Nadu",
    "type": "Rural Village Panchayat",
    "pincode": "625703",
    "lat": 9.7167,
    "lng": 77.7833,
    "radius_km": 10,
    "approx_area_sqkm": 314.2,
    "plus_code": "6JXVPQ8M+M8",
    "admin_code": "TN-GEO-0048",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.8747,
            9.7167
          ],
          [
            77.86774,
            9.75118
          ],
          [
            77.84793,
            9.7804
          ],
          [
            77.81828,
            9.79993
          ],
          [
            77.7833,
            9.80679
          ],
          [
            77.74832,
            9.79993
          ],
          [
            77.71867,
            9.7804
          ],
          [
            77.69886,
            9.75118
          ],
          [
            77.6919,
            9.7167
          ],
          [
            77.69886,
            9.68222
          ],
          [
            77.71867,
            9.653
          ],
          [
            77.74832,
            9.63347
          ],
          [
            77.7833,
            9.62661
          ],
          [
            77.81828,
            9.63347
          ],
          [
            77.84793,
            9.653
          ],
          [
            77.86774,
            9.68222
          ],
          [
            77.8747,
            9.7167
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TIR-01",
    "name": "Srirangam Temple Island",
    "district": "Tiruchirappalli",
    "state": "Tamil Nadu",
    "type": "Temple City Zone",
    "pincode": "620006",
    "lat": 10.8622,
    "lng": 78.6947,
    "radius_km": 6.5,
    "approx_area_sqkm": 132.7,
    "plus_code": "7J2WVM6V+VV",
    "admin_code": "TN-GEO-0049",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.75433,
            10.8622
          ],
          [
            78.74979,
            10.88461
          ],
          [
            78.73686,
            10.90361
          ],
          [
            78.71752,
            10.9163
          ],
          [
            78.6947,
            10.92076
          ],
          [
            78.67188,
            10.9163
          ],
          [
            78.65254,
            10.90361
          ],
          [
            78.63961,
            10.88461
          ],
          [
            78.63507,
            10.8622
          ],
          [
            78.63961,
            10.83979
          ],
          [
            78.65254,
            10.82079
          ],
          [
            78.67188,
            10.8081
          ],
          [
            78.6947,
            10.80364
          ],
          [
            78.71752,
            10.8081
          ],
          [
            78.73686,
            10.82079
          ],
          [
            78.74979,
            10.83979
          ],
          [
            78.75433,
            10.8622
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TIR-02",
    "name": "Thillai Nagar / Cantonment",
    "district": "Tiruchirappalli",
    "state": "Tamil Nadu",
    "type": "City Commercial Core",
    "pincode": "620018",
    "lat": 10.8167,
    "lng": 78.6833,
    "radius_km": 6,
    "approx_area_sqkm": 113.1,
    "plus_code": "7J2WRM8M+M8",
    "admin_code": "TN-GEO-0050",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.73833,
            10.8167
          ],
          [
            78.73414,
            10.83739
          ],
          [
            78.72221,
            10.85492
          ],
          [
            78.70436,
            10.86664
          ],
          [
            78.6833,
            10.87075
          ],
          [
            78.66224,
            10.86664
          ],
          [
            78.64439,
            10.85492
          ],
          [
            78.63246,
            10.83739
          ],
          [
            78.62827,
            10.8167
          ],
          [
            78.63246,
            10.79601
          ],
          [
            78.64439,
            10.77848
          ],
          [
            78.66224,
            10.76676
          ],
          [
            78.6833,
            10.76265
          ],
          [
            78.70436,
            10.76676
          ],
          [
            78.72221,
            10.77848
          ],
          [
            78.73414,
            10.79601
          ],
          [
            78.73833,
            10.8167
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TIR-03",
    "name": "Thiruverumbur / BHEL Hub",
    "district": "Tiruchirappalli",
    "state": "Tamil Nadu",
    "type": "Industrial Mega City Zone",
    "pincode": "620014",
    "lat": 10.7833,
    "lng": 78.7833,
    "radius_km": 7.5,
    "approx_area_sqkm": 176.7,
    "plus_code": "7J2WQQMM+88",
    "admin_code": "TN-GEO-0051",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.85208,
            10.7833
          ],
          [
            78.84685,
            10.80916
          ],
          [
            78.83194,
            10.83108
          ],
          [
            78.80962,
            10.84572
          ],
          [
            78.7833,
            10.85087
          ],
          [
            78.75698,
            10.84572
          ],
          [
            78.73466,
            10.83108
          ],
          [
            78.71975,
            10.80916
          ],
          [
            78.71452,
            10.7833
          ],
          [
            78.71975,
            10.75744
          ],
          [
            78.73466,
            10.73552
          ],
          [
            78.75698,
            10.72088
          ],
          [
            78.7833,
            10.71573
          ],
          [
            78.80962,
            10.72088
          ],
          [
            78.83194,
            10.73552
          ],
          [
            78.84685,
            10.75744
          ],
          [
            78.85208,
            10.7833
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TIR-04",
    "name": "Manapparai Cattle & Murukku",
    "district": "Tiruchirappalli",
    "state": "Tamil Nadu",
    "type": "Trade Town Hub",
    "pincode": "621306",
    "lat": 10.6072,
    "lng": 78.4144,
    "radius_km": 9,
    "approx_area_sqkm": 254.5,
    "plus_code": "7J2WJC47+VQ",
    "admin_code": "TN-GEO-0052",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.49689,
            10.6072
          ],
          [
            78.49061,
            10.63823
          ],
          [
            78.47273,
            10.66453
          ],
          [
            78.44597,
            10.68211
          ],
          [
            78.4144,
            10.68828
          ],
          [
            78.38283,
            10.68211
          ],
          [
            78.35607,
            10.66453
          ],
          [
            78.33819,
            10.63823
          ],
          [
            78.33191,
            10.6072
          ],
          [
            78.33819,
            10.57617
          ],
          [
            78.35607,
            10.54987
          ],
          [
            78.38283,
            10.53229
          ],
          [
            78.4144,
            10.52612
          ],
          [
            78.44597,
            10.53229
          ],
          [
            78.47273,
            10.54987
          ],
          [
            78.49061,
            10.57617
          ],
          [
            78.49689,
            10.6072
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TIR-05",
    "name": "Musiri Cauvery Banks",
    "district": "Tiruchirappalli",
    "state": "Tamil Nadu",
    "type": "River Town Zone",
    "pincode": "621211",
    "lat": 10.94,
    "lng": 78.45,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J2WWCQX+XX",
    "admin_code": "TN-GEO-0053",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.52799,
            10.94
          ],
          [
            78.52206,
            10.9693
          ],
          [
            78.50515,
            10.99415
          ],
          [
            78.47985,
            11.01075
          ],
          [
            78.45,
            11.01658
          ],
          [
            78.42015,
            11.01075
          ],
          [
            78.39485,
            10.99415
          ],
          [
            78.37794,
            10.9693
          ],
          [
            78.37201,
            10.94
          ],
          [
            78.37794,
            10.9107
          ],
          [
            78.39485,
            10.88585
          ],
          [
            78.42015,
            10.86925
          ],
          [
            78.45,
            10.86342
          ],
          [
            78.47985,
            10.86925
          ],
          [
            78.50515,
            10.88585
          ],
          [
            78.52206,
            10.9107
          ],
          [
            78.52799,
            10.94
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TIR-06",
    "name": "Thuraiyur Foothills",
    "district": "Tiruchirappalli",
    "state": "Tamil Nadu",
    "type": "Foothill Village Cluster",
    "pincode": "621010",
    "lat": 11.1444,
    "lng": 78.5969,
    "radius_km": 9.5,
    "approx_area_sqkm": 283.5,
    "plus_code": "7J3W4HVW+QQ",
    "admin_code": "TN-GEO-0054",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.68413,
            11.1444
          ],
          [
            78.67749,
            11.17715
          ],
          [
            78.65858,
            11.20492
          ],
          [
            78.63028,
            11.22347
          ],
          [
            78.5969,
            11.22999
          ],
          [
            78.56352,
            11.22347
          ],
          [
            78.53522,
            11.20492
          ],
          [
            78.51631,
            11.17715
          ],
          [
            78.50967,
            11.1444
          ],
          [
            78.51631,
            11.11165
          ],
          [
            78.53522,
            11.08388
          ],
          [
            78.56352,
            11.06533
          ],
          [
            78.5969,
            11.05881
          ],
          [
            78.63028,
            11.06533
          ],
          [
            78.65858,
            11.08388
          ],
          [
            78.67749,
            11.11165
          ],
          [
            78.68413,
            11.1444
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TIR-07",
    "name": "Lalgudi Delta Farms",
    "district": "Tiruchirappalli",
    "state": "Tamil Nadu",
    "type": "Paddy Village Zone",
    "pincode": "621601",
    "lat": 10.8667,
    "lng": 78.8167,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J2WVR88+MM",
    "admin_code": "TN-GEO-0055",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.89467,
            10.8667
          ],
          [
            78.88874,
            10.896
          ],
          [
            78.87184,
            10.92085
          ],
          [
            78.84654,
            10.93745
          ],
          [
            78.8167,
            10.94328
          ],
          [
            78.78686,
            10.93745
          ],
          [
            78.76156,
            10.92085
          ],
          [
            78.74466,
            10.896
          ],
          [
            78.73873,
            10.8667
          ],
          [
            78.74466,
            10.8374
          ],
          [
            78.76156,
            10.81255
          ],
          [
            78.78686,
            10.79595
          ],
          [
            78.8167,
            10.79012
          ],
          [
            78.84654,
            10.79595
          ],
          [
            78.87184,
            10.81255
          ],
          [
            78.88874,
            10.8374
          ],
          [
            78.89467,
            10.8667
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-SAL-01",
    "name": "Salem City Core / Shevapet",
    "district": "Salem",
    "state": "Tamil Nadu",
    "type": "Steel & Trade City Core",
    "pincode": "636001",
    "lat": 11.6643,
    "lng": 78.146,
    "radius_km": 7,
    "approx_area_sqkm": 153.9,
    "plus_code": "7J3WM47W+PC",
    "admin_code": "TN-GEO-0056",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.21039,
            11.6643
          ],
          [
            78.20549,
            11.68843
          ],
          [
            78.19153,
            11.70889
          ],
          [
            78.17064,
            11.72256
          ],
          [
            78.146,
            11.72736
          ],
          [
            78.12136,
            11.72256
          ],
          [
            78.10047,
            11.70889
          ],
          [
            78.08651,
            11.68843
          ],
          [
            78.08161,
            11.6643
          ],
          [
            78.08651,
            11.64017
          ],
          [
            78.10047,
            11.61971
          ],
          [
            78.12136,
            11.60604
          ],
          [
            78.146,
            11.60124
          ],
          [
            78.17064,
            11.60604
          ],
          [
            78.19153,
            11.61971
          ],
          [
            78.20549,
            11.64017
          ],
          [
            78.21039,
            11.6643
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-SAL-02",
    "name": "Attur Sago & Tapioca Hub",
    "district": "Salem",
    "state": "Tamil Nadu",
    "type": "Agro Industry Town Hub",
    "pincode": "636102",
    "lat": 11.5975,
    "lng": 78.6017,
    "radius_km": 9,
    "approx_area_sqkm": 254.5,
    "plus_code": "7J3WHJW2+XM",
    "admin_code": "TN-GEO-0057",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.68447,
            11.5975
          ],
          [
            78.67817,
            11.62853
          ],
          [
            78.66023,
            11.65483
          ],
          [
            78.63338,
            11.67241
          ],
          [
            78.6017,
            11.67858
          ],
          [
            78.57002,
            11.67241
          ],
          [
            78.54317,
            11.65483
          ],
          [
            78.52523,
            11.62853
          ],
          [
            78.51893,
            11.5975
          ],
          [
            78.52523,
            11.56647
          ],
          [
            78.54317,
            11.54017
          ],
          [
            78.57002,
            11.52259
          ],
          [
            78.6017,
            11.51642
          ],
          [
            78.63338,
            11.52259
          ],
          [
            78.66023,
            11.54017
          ],
          [
            78.67817,
            11.56647
          ],
          [
            78.68447,
            11.5975
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-SAL-03",
    "name": "Mettur Dam & Power Plant",
    "district": "Salem",
    "state": "Tamil Nadu",
    "type": "Hydropower City Zone",
    "pincode": "636401",
    "lat": 11.7964,
    "lng": 77.8011,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J3VQRW2+HC",
    "admin_code": "TN-GEO-0058",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.87933,
            11.7964
          ],
          [
            77.87337,
            11.8257
          ],
          [
            77.85642,
            11.85055
          ],
          [
            77.83104,
            11.86715
          ],
          [
            77.8011,
            11.87298
          ],
          [
            77.77116,
            11.86715
          ],
          [
            77.74578,
            11.85055
          ],
          [
            77.72883,
            11.8257
          ],
          [
            77.72287,
            11.7964
          ],
          [
            77.72883,
            11.7671
          ],
          [
            77.74578,
            11.74225
          ],
          [
            77.77116,
            11.72565
          ],
          [
            77.8011,
            11.71982
          ],
          [
            77.83104,
            11.72565
          ],
          [
            77.85642,
            11.74225
          ],
          [
            77.87337,
            11.7671
          ],
          [
            77.87933,
            11.7964
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-SAL-04",
    "name": "Omalur Airport Zone",
    "district": "Salem",
    "state": "Tamil Nadu",
    "type": "Aviation & Agro Town Zone",
    "pincode": "636455",
    "lat": 11.7408,
    "lng": 78.0417,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J3WP2RR+8M",
    "admin_code": "TN-GEO-0059",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.11531,
            11.7408
          ],
          [
            78.10971,
            11.76838
          ],
          [
            78.09375,
            11.79176
          ],
          [
            78.06987,
            11.80739
          ],
          [
            78.0417,
            11.81287
          ],
          [
            78.01353,
            11.80739
          ],
          [
            77.98965,
            11.79176
          ],
          [
            77.97369,
            11.76838
          ],
          [
            77.96809,
            11.7408
          ],
          [
            77.97369,
            11.71322
          ],
          [
            77.98965,
            11.68984
          ],
          [
            78.01353,
            11.67421
          ],
          [
            78.0417,
            11.66873
          ],
          [
            78.06987,
            11.67421
          ],
          [
            78.09375,
            11.68984
          ],
          [
            78.10971,
            11.71322
          ],
          [
            78.11531,
            11.7408
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-SAL-05",
    "name": "Sankagiri Transport Hub",
    "district": "Salem",
    "state": "Tamil Nadu",
    "type": "Logistics Town Hub",
    "pincode": "637301",
    "lat": 11.4833,
    "lng": 77.8667,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J3VFVM8+8M",
    "admin_code": "TN-GEO-0060",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.94024,
            11.4833
          ],
          [
            77.93465,
            11.51088
          ],
          [
            77.9187,
            11.53426
          ],
          [
            77.89484,
            11.54989
          ],
          [
            77.8667,
            11.55537
          ],
          [
            77.83856,
            11.54989
          ],
          [
            77.8147,
            11.53426
          ],
          [
            77.79875,
            11.51088
          ],
          [
            77.79316,
            11.4833
          ],
          [
            77.79875,
            11.45572
          ],
          [
            77.8147,
            11.43234
          ],
          [
            77.83856,
            11.41671
          ],
          [
            77.8667,
            11.41123
          ],
          [
            77.89484,
            11.41671
          ],
          [
            77.9187,
            11.43234
          ],
          [
            77.93465,
            11.45572
          ],
          [
            77.94024,
            11.4833
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-SAL-06",
    "name": "Edappadi Handloom Town",
    "district": "Salem",
    "state": "Tamil Nadu",
    "type": "Weaving Town Zone",
    "pincode": "637101",
    "lat": 11.5833,
    "lng": 77.85,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J3VHVM2+82",
    "admin_code": "TN-GEO-0061",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.92357,
            11.5833
          ],
          [
            77.91797,
            11.61088
          ],
          [
            77.90202,
            11.63426
          ],
          [
            77.87815,
            11.64989
          ],
          [
            77.85,
            11.65537
          ],
          [
            77.82185,
            11.64989
          ],
          [
            77.79798,
            11.63426
          ],
          [
            77.78203,
            11.61088
          ],
          [
            77.77643,
            11.5833
          ],
          [
            77.78203,
            11.55572
          ],
          [
            77.79798,
            11.53234
          ],
          [
            77.82185,
            11.51671
          ],
          [
            77.85,
            11.51123
          ],
          [
            77.87815,
            11.51671
          ],
          [
            77.90202,
            11.53234
          ],
          [
            77.91797,
            11.55572
          ],
          [
            77.92357,
            11.5833
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-SAL-07",
    "name": "Yercaud Hill Resort & Coffee",
    "district": "Salem",
    "state": "Tamil Nadu",
    "type": "Hill Station & Tribal Cluster",
    "pincode": "636601",
    "lat": 11.7753,
    "lng": 78.2093,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J3WQ6G5+4P",
    "admin_code": "TN-GEO-0062",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.28752,
            11.7753
          ],
          [
            78.28157,
            11.8046
          ],
          [
            78.26461,
            11.82945
          ],
          [
            78.23923,
            11.84605
          ],
          [
            78.2093,
            11.85188
          ],
          [
            78.17937,
            11.84605
          ],
          [
            78.15399,
            11.82945
          ],
          [
            78.13703,
            11.8046
          ],
          [
            78.13108,
            11.7753
          ],
          [
            78.13703,
            11.746
          ],
          [
            78.15399,
            11.72115
          ],
          [
            78.17937,
            11.70455
          ],
          [
            78.2093,
            11.69872
          ],
          [
            78.23923,
            11.70455
          ],
          [
            78.26461,
            11.72115
          ],
          [
            78.28157,
            11.746
          ],
          [
            78.28752,
            11.7753
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-ERO-01",
    "name": "Erode City Central Hub",
    "district": "Erode",
    "state": "Tamil Nadu",
    "type": "Turmeric City Core",
    "pincode": "638001",
    "lat": 11.341,
    "lng": 77.7172,
    "radius_km": 7,
    "approx_area_sqkm": 153.9,
    "plus_code": "7J3V8PR8+9V",
    "admin_code": "TN-GEO-0063",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.78152,
            11.341
          ],
          [
            77.77662,
            11.36513
          ],
          [
            77.76268,
            11.38559
          ],
          [
            77.74181,
            11.39926
          ],
          [
            77.7172,
            11.40406
          ],
          [
            77.69259,
            11.39926
          ],
          [
            77.67172,
            11.38559
          ],
          [
            77.65778,
            11.36513
          ],
          [
            77.65288,
            11.341
          ],
          [
            77.65778,
            11.31687
          ],
          [
            77.67172,
            11.29641
          ],
          [
            77.69259,
            11.28274
          ],
          [
            77.7172,
            11.27794
          ],
          [
            77.74181,
            11.28274
          ],
          [
            77.76268,
            11.29641
          ],
          [
            77.77662,
            11.31687
          ],
          [
            77.78152,
            11.341
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-ERO-02",
    "name": "Perundurai SIPCOT Park",
    "district": "Erode",
    "state": "Tamil Nadu",
    "type": "Industrial Hub",
    "pincode": "638052",
    "lat": 11.2764,
    "lng": 77.5833,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J3V7HGM+H8",
    "admin_code": "TN-GEO-0064",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.65679,
            11.2764
          ],
          [
            77.6512,
            11.30398
          ],
          [
            77.63527,
            11.32736
          ],
          [
            77.61142,
            11.34299
          ],
          [
            77.5833,
            11.34847
          ],
          [
            77.55518,
            11.34299
          ],
          [
            77.53133,
            11.32736
          ],
          [
            77.5154,
            11.30398
          ],
          [
            77.50981,
            11.2764
          ],
          [
            77.5154,
            11.24882
          ],
          [
            77.53133,
            11.22544
          ],
          [
            77.55518,
            11.20981
          ],
          [
            77.5833,
            11.20433
          ],
          [
            77.61142,
            11.20981
          ],
          [
            77.63527,
            11.22544
          ],
          [
            77.6512,
            11.24882
          ],
          [
            77.65679,
            11.2764
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-ERO-03",
    "name": "Gobichettipalayam Green Hub",
    "district": "Erode",
    "state": "Tamil Nadu",
    "type": "Agriculture Town Zone",
    "pincode": "638452",
    "lat": 11.4542,
    "lng": 77.4358,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J3VFC3P+M8",
    "admin_code": "TN-GEO-0065",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.51393,
            11.4542
          ],
          [
            77.50799,
            11.4835
          ],
          [
            77.49105,
            11.50835
          ],
          [
            77.4657,
            11.52495
          ],
          [
            77.4358,
            11.53078
          ],
          [
            77.4059,
            11.52495
          ],
          [
            77.38055,
            11.50835
          ],
          [
            77.36361,
            11.4835
          ],
          [
            77.35767,
            11.4542
          ],
          [
            77.36361,
            11.4249
          ],
          [
            77.38055,
            11.40005
          ],
          [
            77.4059,
            11.38345
          ],
          [
            77.4358,
            11.37762
          ],
          [
            77.4657,
            11.38345
          ],
          [
            77.49105,
            11.40005
          ],
          [
            77.50799,
            11.4249
          ],
          [
            77.51393,
            11.4542
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-ERO-04",
    "name": "Bhavani River Confluence",
    "district": "Erode",
    "state": "Tamil Nadu",
    "type": "Carpet Town Hub",
    "pincode": "638301",
    "lat": 11.4464,
    "lng": 77.6833,
    "radius_km": 7.5,
    "approx_area_sqkm": 176.7,
    "plus_code": "7J3VCMWM+H8",
    "admin_code": "TN-GEO-0066",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.75224,
            11.4464
          ],
          [
            77.74699,
            11.47226
          ],
          [
            77.73205,
            11.49418
          ],
          [
            77.70968,
            11.50882
          ],
          [
            77.6833,
            11.51397
          ],
          [
            77.65692,
            11.50882
          ],
          [
            77.63455,
            11.49418
          ],
          [
            77.61961,
            11.47226
          ],
          [
            77.61436,
            11.4464
          ],
          [
            77.61961,
            11.42054
          ],
          [
            77.63455,
            11.39862
          ],
          [
            77.65692,
            11.38398
          ],
          [
            77.6833,
            11.37883
          ],
          [
            77.70968,
            11.38398
          ],
          [
            77.73205,
            11.39862
          ],
          [
            77.74699,
            11.42054
          ],
          [
            77.75224,
            11.4464
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-ERO-05",
    "name": "Sathyamangalam Foothills",
    "district": "Erode",
    "state": "Tamil Nadu",
    "type": "Forest Gateway Town",
    "pincode": "638401",
    "lat": 11.5033,
    "lng": 77.2383,
    "radius_km": 9.5,
    "approx_area_sqkm": 283.5,
    "plus_code": "7J3VG63Q+88",
    "admin_code": "TN-GEO-0067",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.32564,
            11.5033
          ],
          [
            77.31899,
            11.53605
          ],
          [
            77.30006,
            11.56382
          ],
          [
            77.27172,
            11.58237
          ],
          [
            77.2383,
            11.58889
          ],
          [
            77.20488,
            11.58237
          ],
          [
            77.17654,
            11.56382
          ],
          [
            77.15761,
            11.53605
          ],
          [
            77.15096,
            11.5033
          ],
          [
            77.15761,
            11.47055
          ],
          [
            77.17654,
            11.44278
          ],
          [
            77.20488,
            11.42423
          ],
          [
            77.2383,
            11.41771
          ],
          [
            77.27172,
            11.42423
          ],
          [
            77.30006,
            11.44278
          ],
          [
            77.31899,
            11.47055
          ],
          [
            77.32564,
            11.5033
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-ERO-06",
    "name": "Kodumudi Pilgrim Village",
    "district": "Erode",
    "state": "Tamil Nadu",
    "type": "Cauvery Village Zone",
    "pincode": "638151",
    "lat": 11.0789,
    "lng": 77.8872,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J3V3VHP+HV",
    "admin_code": "TN-GEO-0068",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.96064,
            11.0789
          ],
          [
            77.95505,
            11.10648
          ],
          [
            77.93913,
            11.12986
          ],
          [
            77.9153,
            11.14549
          ],
          [
            77.8872,
            11.15097
          ],
          [
            77.8591,
            11.14549
          ],
          [
            77.83527,
            11.12986
          ],
          [
            77.81935,
            11.10648
          ],
          [
            77.81376,
            11.0789
          ],
          [
            77.81935,
            11.05132
          ],
          [
            77.83527,
            11.02794
          ],
          [
            77.8591,
            11.01231
          ],
          [
            77.8872,
            11.00683
          ],
          [
            77.9153,
            11.01231
          ],
          [
            77.93913,
            11.02794
          ],
          [
            77.95505,
            11.05132
          ],
          [
            77.96064,
            11.0789
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-VEL-01",
    "name": "Vellore Fort / CMC Hub",
    "district": "Vellore",
    "state": "Tamil Nadu",
    "type": "Medical & Edu City Core",
    "pincode": "632004",
    "lat": 12.9165,
    "lng": 79.1325,
    "radius_km": 6.5,
    "approx_area_sqkm": 132.7,
    "plus_code": "7J4XW48J+HX",
    "admin_code": "TN-GEO-0069",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.19258,
            12.9165
          ],
          [
            79.18801,
            12.93891
          ],
          [
            79.17498,
            12.95791
          ],
          [
            79.15549,
            12.9706
          ],
          [
            79.1325,
            12.97506
          ],
          [
            79.10951,
            12.9706
          ],
          [
            79.09002,
            12.95791
          ],
          [
            79.07699,
            12.93891
          ],
          [
            79.07242,
            12.9165
          ],
          [
            79.07699,
            12.89409
          ],
          [
            79.09002,
            12.87509
          ],
          [
            79.10951,
            12.8624
          ],
          [
            79.1325,
            12.85794
          ],
          [
            79.15549,
            12.8624
          ],
          [
            79.17498,
            12.87509
          ],
          [
            79.18801,
            12.89409
          ],
          [
            79.19258,
            12.9165
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-VEL-02",
    "name": "Katpadi Railway City Zone",
    "district": "Vellore",
    "state": "Tamil Nadu",
    "type": "University & Transit Hub",
    "pincode": "632007",
    "lat": 12.9833,
    "lng": 79.1333,
    "radius_km": 6.5,
    "approx_area_sqkm": 132.7,
    "plus_code": "7J4XX4MM+88",
    "admin_code": "TN-GEO-0070",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.19339,
            12.9833
          ],
          [
            79.18882,
            13.00571
          ],
          [
            79.17579,
            13.02471
          ],
          [
            79.1563,
            13.0374
          ],
          [
            79.1333,
            13.04186
          ],
          [
            79.1103,
            13.0374
          ],
          [
            79.09081,
            13.02471
          ],
          [
            79.07778,
            13.00571
          ],
          [
            79.07321,
            12.9833
          ],
          [
            79.07778,
            12.96089
          ],
          [
            79.09081,
            12.94189
          ],
          [
            79.1103,
            12.9292
          ],
          [
            79.1333,
            12.92474
          ],
          [
            79.1563,
            12.9292
          ],
          [
            79.17579,
            12.94189
          ],
          [
            79.18882,
            12.96089
          ],
          [
            79.19339,
            12.9833
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-VEL-03",
    "name": "Anaicut Valley Zone",
    "district": "Vellore",
    "state": "Tamil Nadu",
    "type": "Agricultural Village Cluster",
    "pincode": "632101",
    "lat": 12.8667,
    "lng": 78.9833,
    "radius_km": 9,
    "approx_area_sqkm": 254.5,
    "plus_code": "7J4WVX8M+M8",
    "admin_code": "TN-GEO-0071",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.06647,
            12.8667
          ],
          [
            79.06014,
            12.89773
          ],
          [
            79.04211,
            12.92403
          ],
          [
            79.01513,
            12.94161
          ],
          [
            78.9833,
            12.94778
          ],
          [
            78.95147,
            12.94161
          ],
          [
            78.92449,
            12.92403
          ],
          [
            78.90646,
            12.89773
          ],
          [
            78.90013,
            12.8667
          ],
          [
            78.90646,
            12.83567
          ],
          [
            78.92449,
            12.80937
          ],
          [
            78.95147,
            12.79179
          ],
          [
            78.9833,
            12.78562
          ],
          [
            79.01513,
            12.79179
          ],
          [
            79.04211,
            12.80937
          ],
          [
            79.06014,
            12.83567
          ],
          [
            79.06647,
            12.8667
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-VEL-04",
    "name": "Kaniyambadi Hillside",
    "district": "Vellore",
    "state": "Tamil Nadu",
    "type": "Rural Village Panchayat",
    "pincode": "632102",
    "lat": 12.8333,
    "lng": 79.1333,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J4XR4MM+88",
    "admin_code": "TN-GEO-0072",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.21184,
            12.8333
          ],
          [
            79.20586,
            12.8626
          ],
          [
            79.18884,
            12.88745
          ],
          [
            79.16336,
            12.90405
          ],
          [
            79.1333,
            12.90988
          ],
          [
            79.10324,
            12.90405
          ],
          [
            79.07776,
            12.88745
          ],
          [
            79.06074,
            12.8626
          ],
          [
            79.05476,
            12.8333
          ],
          [
            79.06074,
            12.804
          ],
          [
            79.07776,
            12.77915
          ],
          [
            79.10324,
            12.76255
          ],
          [
            79.1333,
            12.75672
          ],
          [
            79.16336,
            12.76255
          ],
          [
            79.18884,
            12.77915
          ],
          [
            79.20586,
            12.804
          ],
          [
            79.21184,
            12.8333
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-RAN-01",
    "name": "Ranipet / Walaja Industrial",
    "district": "Ranipet",
    "state": "Tamil Nadu",
    "type": "BHEL & Leather Core",
    "pincode": "632401",
    "lat": 12.9229,
    "lng": 79.3329,
    "radius_km": 7.5,
    "approx_area_sqkm": 176.7,
    "plus_code": "7J4XW8FM+55",
    "admin_code": "TN-GEO-0073",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.40222,
            12.9229
          ],
          [
            79.39695,
            12.94876
          ],
          [
            79.38192,
            12.97068
          ],
          [
            79.35943,
            12.98532
          ],
          [
            79.3329,
            12.99047
          ],
          [
            79.30637,
            12.98532
          ],
          [
            79.28388,
            12.97068
          ],
          [
            79.26885,
            12.94876
          ],
          [
            79.26358,
            12.9229
          ],
          [
            79.26885,
            12.89704
          ],
          [
            79.28388,
            12.87512
          ],
          [
            79.30637,
            12.86048
          ],
          [
            79.3329,
            12.85533
          ],
          [
            79.35943,
            12.86048
          ],
          [
            79.38192,
            12.87512
          ],
          [
            79.39695,
            12.89704
          ],
          [
            79.40222,
            12.9229
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-RAN-02",
    "name": "Arcot Nawabi Town",
    "district": "Ranipet",
    "state": "Tamil Nadu",
    "type": "Historic Town Zone",
    "pincode": "632503",
    "lat": 12.9042,
    "lng": 79.3333,
    "radius_km": 6.5,
    "approx_area_sqkm": 132.7,
    "plus_code": "7J4XW83M+M8",
    "admin_code": "TN-GEO-0074",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.39338,
            12.9042
          ],
          [
            79.3888,
            12.92661
          ],
          [
            79.37578,
            12.94561
          ],
          [
            79.35629,
            12.9583
          ],
          [
            79.3333,
            12.96276
          ],
          [
            79.31031,
            12.9583
          ],
          [
            79.29082,
            12.94561
          ],
          [
            79.2778,
            12.92661
          ],
          [
            79.27322,
            12.9042
          ],
          [
            79.2778,
            12.88179
          ],
          [
            79.29082,
            12.86279
          ],
          [
            79.31031,
            12.8501
          ],
          [
            79.3333,
            12.84564
          ],
          [
            79.35629,
            12.8501
          ],
          [
            79.37578,
            12.86279
          ],
          [
            79.3888,
            12.88179
          ],
          [
            79.39338,
            12.9042
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-RAN-03",
    "name": "Arakkonam Junction",
    "district": "Ranipet",
    "state": "Tamil Nadu",
    "type": "Railway & Naval City Zone",
    "pincode": "631001",
    "lat": 13.0789,
    "lng": 79.6689,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J5X3MH9+HH",
    "admin_code": "TN-GEO-0075",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.74289,
            13.0789
          ],
          [
            79.73726,
            13.10648
          ],
          [
            79.72122,
            13.12986
          ],
          [
            79.69722,
            13.14549
          ],
          [
            79.6689,
            13.15097
          ],
          [
            79.64058,
            13.14549
          ],
          [
            79.61658,
            13.12986
          ],
          [
            79.60054,
            13.10648
          ],
          [
            79.59491,
            13.0789
          ],
          [
            79.60054,
            13.05132
          ],
          [
            79.61658,
            13.02794
          ],
          [
            79.64058,
            13.01231
          ],
          [
            79.6689,
            13.00683
          ],
          [
            79.69722,
            13.01231
          ],
          [
            79.72122,
            13.02794
          ],
          [
            79.73726,
            13.05132
          ],
          [
            79.74289,
            13.0789
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-RAN-04",
    "name": "Sholinghur Hill Temple",
    "district": "Ranipet",
    "state": "Tamil Nadu",
    "type": "Pilgrim Town & Cluster",
    "pincode": "631102",
    "lat": 13.1128,
    "lng": 79.4264,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J5X4C7G+4H",
    "admin_code": "TN-GEO-0076",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.50503,
            13.1128
          ],
          [
            79.49904,
            13.1421
          ],
          [
            79.482,
            13.16695
          ],
          [
            79.45649,
            13.18355
          ],
          [
            79.4264,
            13.18938
          ],
          [
            79.39631,
            13.18355
          ],
          [
            79.3708,
            13.16695
          ],
          [
            79.35376,
            13.1421
          ],
          [
            79.34777,
            13.1128
          ],
          [
            79.35376,
            13.0835
          ],
          [
            79.3708,
            13.05865
          ],
          [
            79.39631,
            13.04205
          ],
          [
            79.4264,
            13.03622
          ],
          [
            79.45649,
            13.04205
          ],
          [
            79.482,
            13.05865
          ],
          [
            79.49904,
            13.0835
          ],
          [
            79.50503,
            13.1128
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-RAN-05",
    "name": "Nemili Rural Belt",
    "district": "Ranipet",
    "state": "Tamil Nadu",
    "type": "Farming Village Zone",
    "pincode": "631051",
    "lat": 13.0167,
    "lng": 79.6167,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J5X2J88+MM",
    "admin_code": "TN-GEO-0077",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.6953,
            13.0167
          ],
          [
            79.68931,
            13.046
          ],
          [
            79.67228,
            13.07085
          ],
          [
            79.64678,
            13.08745
          ],
          [
            79.6167,
            13.09328
          ],
          [
            79.58662,
            13.08745
          ],
          [
            79.56112,
            13.07085
          ],
          [
            79.54409,
            13.046
          ],
          [
            79.5381,
            13.0167
          ],
          [
            79.54409,
            12.9874
          ],
          [
            79.56112,
            12.96255
          ],
          [
            79.58662,
            12.94595
          ],
          [
            79.6167,
            12.94012
          ],
          [
            79.64678,
            12.94595
          ],
          [
            79.67228,
            12.96255
          ],
          [
            79.68931,
            12.9874
          ],
          [
            79.6953,
            13.0167
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TIR-01",
    "name": "Tirupathur Town Core",
    "district": "Tirupathur",
    "state": "Tamil Nadu",
    "type": "District HQ Town",
    "pincode": "635601",
    "lat": 12.4925,
    "lng": 78.5678,
    "radius_km": 7.5,
    "approx_area_sqkm": 176.7,
    "plus_code": "7J4WFHV9+24",
    "admin_code": "TN-GEO-0078",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.63701,
            12.4925
          ],
          [
            78.63174,
            12.51836
          ],
          [
            78.61674,
            12.54028
          ],
          [
            78.59428,
            12.55492
          ],
          [
            78.5678,
            12.56007
          ],
          [
            78.54132,
            12.55492
          ],
          [
            78.51886,
            12.54028
          ],
          [
            78.50386,
            12.51836
          ],
          [
            78.49859,
            12.4925
          ],
          [
            78.50386,
            12.46664
          ],
          [
            78.51886,
            12.44472
          ],
          [
            78.54132,
            12.43008
          ],
          [
            78.5678,
            12.42493
          ],
          [
            78.59428,
            12.43008
          ],
          [
            78.61674,
            12.44472
          ],
          [
            78.63174,
            12.46664
          ],
          [
            78.63701,
            12.4925
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TIR-02",
    "name": "Vaniyambadi Leather Hub",
    "district": "Tirupathur",
    "state": "Tamil Nadu",
    "type": "Export City Zone",
    "pincode": "635751",
    "lat": 12.6828,
    "lng": 78.6189,
    "radius_km": 7.5,
    "approx_area_sqkm": 176.7,
    "plus_code": "7J4WMJM9+4H",
    "admin_code": "TN-GEO-0079",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.68816,
            12.6828
          ],
          [
            78.68289,
            12.70866
          ],
          [
            78.66787,
            12.73058
          ],
          [
            78.6454,
            12.74522
          ],
          [
            78.6189,
            12.75037
          ],
          [
            78.5924,
            12.74522
          ],
          [
            78.56993,
            12.73058
          ],
          [
            78.55491,
            12.70866
          ],
          [
            78.54964,
            12.6828
          ],
          [
            78.55491,
            12.65694
          ],
          [
            78.56993,
            12.63502
          ],
          [
            78.5924,
            12.62038
          ],
          [
            78.6189,
            12.61523
          ],
          [
            78.6454,
            12.62038
          ],
          [
            78.66787,
            12.63502
          ],
          [
            78.68289,
            12.65694
          ],
          [
            78.68816,
            12.6828
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TIR-03",
    "name": "Ambur Footwear Capital",
    "district": "Tirupathur",
    "state": "Tamil Nadu",
    "type": "Leather Town Zone",
    "pincode": "635802",
    "lat": 12.7906,
    "lng": 78.7167,
    "radius_km": 7.5,
    "approx_area_sqkm": 176.7,
    "plus_code": "7J4WQPR8+6M",
    "admin_code": "TN-GEO-0080",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.78599,
            12.7906
          ],
          [
            78.78071,
            12.81646
          ],
          [
            78.76569,
            12.83838
          ],
          [
            78.74321,
            12.85302
          ],
          [
            78.7167,
            12.85817
          ],
          [
            78.69019,
            12.85302
          ],
          [
            78.66771,
            12.83838
          ],
          [
            78.65269,
            12.81646
          ],
          [
            78.64741,
            12.7906
          ],
          [
            78.65269,
            12.76474
          ],
          [
            78.66771,
            12.74282
          ],
          [
            78.69019,
            12.72818
          ],
          [
            78.7167,
            12.72303
          ],
          [
            78.74321,
            12.72818
          ],
          [
            78.76569,
            12.74282
          ],
          [
            78.78071,
            12.76474
          ],
          [
            78.78599,
            12.7906
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TIR-04",
    "name": "Natrampalli Highway Zone",
    "district": "Tirupathur",
    "state": "Tamil Nadu",
    "type": "Rural Town Cluster",
    "pincode": "635852",
    "lat": 12.5667,
    "lng": 78.5167,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J4WHG88+MM",
    "admin_code": "TN-GEO-0081",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.59054,
            12.5667
          ],
          [
            78.58492,
            12.59428
          ],
          [
            78.56891,
            12.61766
          ],
          [
            78.54496,
            12.63329
          ],
          [
            78.5167,
            12.63877
          ],
          [
            78.48844,
            12.63329
          ],
          [
            78.46449,
            12.61766
          ],
          [
            78.44848,
            12.59428
          ],
          [
            78.44286,
            12.5667
          ],
          [
            78.44848,
            12.53912
          ],
          [
            78.46449,
            12.51574
          ],
          [
            78.48844,
            12.50011
          ],
          [
            78.5167,
            12.49463
          ],
          [
            78.54496,
            12.50011
          ],
          [
            78.56891,
            12.51574
          ],
          [
            78.58492,
            12.53912
          ],
          [
            78.59054,
            12.5667
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TIR-05",
    "name": "Yelagiri Hills Resort",
    "district": "Tirupathur",
    "state": "Tamil Nadu",
    "type": "Hill Village Cluster",
    "pincode": "635853",
    "lat": 12.5789,
    "lng": 78.6389,
    "radius_km": 7.5,
    "approx_area_sqkm": 176.7,
    "plus_code": "7J4WHJHQ+HH",
    "admin_code": "TN-GEO-0082",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.70813,
            12.5789
          ],
          [
            78.70286,
            12.60476
          ],
          [
            78.68785,
            12.62668
          ],
          [
            78.66539,
            12.64132
          ],
          [
            78.6389,
            12.64647
          ],
          [
            78.61241,
            12.64132
          ],
          [
            78.58995,
            12.62668
          ],
          [
            78.57494,
            12.60476
          ],
          [
            78.56967,
            12.5789
          ],
          [
            78.57494,
            12.55304
          ],
          [
            78.58995,
            12.53112
          ],
          [
            78.61241,
            12.51648
          ],
          [
            78.6389,
            12.51133
          ],
          [
            78.66539,
            12.51648
          ],
          [
            78.68785,
            12.53112
          ],
          [
            78.70286,
            12.55304
          ],
          [
            78.70813,
            12.5789
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-DHA-01",
    "name": "Dharmapuri Town Central",
    "district": "Dharmapuri",
    "state": "Tamil Nadu",
    "type": "Sericulture Core",
    "pincode": "636701",
    "lat": 12.1211,
    "lng": 78.1582,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J4W45C5+C7",
    "admin_code": "TN-GEO-0083",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.23192,
            12.1211
          ],
          [
            78.2263,
            12.14868
          ],
          [
            78.21032,
            12.17206
          ],
          [
            78.18641,
            12.18769
          ],
          [
            78.1582,
            12.19317
          ],
          [
            78.12999,
            12.18769
          ],
          [
            78.10608,
            12.17206
          ],
          [
            78.0901,
            12.14868
          ],
          [
            78.08448,
            12.1211
          ],
          [
            78.0901,
            12.09352
          ],
          [
            78.10608,
            12.07014
          ],
          [
            78.12999,
            12.05451
          ],
          [
            78.1582,
            12.04903
          ],
          [
            78.18641,
            12.05451
          ],
          [
            78.21032,
            12.07014
          ],
          [
            78.2263,
            12.09352
          ],
          [
            78.23192,
            12.1211
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-DHA-02",
    "name": "Harur Hill Foot Town",
    "district": "Dharmapuri",
    "state": "Tamil Nadu",
    "type": "Spice & Agro Town",
    "pincode": "636903",
    "lat": 12.06,
    "lng": 78.49,
    "radius_km": 9.5,
    "approx_area_sqkm": 283.5,
    "plus_code": "7J4W3F6R+22",
    "admin_code": "TN-GEO-0084",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.57752,
            12.06
          ],
          [
            78.57086,
            12.09275
          ],
          [
            78.55188,
            12.12052
          ],
          [
            78.52349,
            12.13907
          ],
          [
            78.49,
            12.14559
          ],
          [
            78.45651,
            12.13907
          ],
          [
            78.42812,
            12.12052
          ],
          [
            78.40914,
            12.09275
          ],
          [
            78.40248,
            12.06
          ],
          [
            78.40914,
            12.02725
          ],
          [
            78.42812,
            11.99948
          ],
          [
            78.45651,
            11.98093
          ],
          [
            78.49,
            11.97441
          ],
          [
            78.52349,
            11.98093
          ],
          [
            78.55188,
            11.99948
          ],
          [
            78.57086,
            12.02725
          ],
          [
            78.57752,
            12.06
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-DHA-03",
    "name": "Palakkodu Tomato Market",
    "district": "Dharmapuri",
    "state": "Tamil Nadu",
    "type": "Horticulture Town Zone",
    "pincode": "636808",
    "lat": 12.3083,
    "lng": 78.0833,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J4W835M+88",
    "admin_code": "TN-GEO-0085",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.16168,
            12.3083
          ],
          [
            78.15571,
            12.3376
          ],
          [
            78.13872,
            12.36245
          ],
          [
            78.11329,
            12.37905
          ],
          [
            78.0833,
            12.38488
          ],
          [
            78.05331,
            12.37905
          ],
          [
            78.02788,
            12.36245
          ],
          [
            78.01089,
            12.3376
          ],
          [
            78.00492,
            12.3083
          ],
          [
            78.01089,
            12.279
          ],
          [
            78.02788,
            12.25415
          ],
          [
            78.05331,
            12.23755
          ],
          [
            78.0833,
            12.23172
          ],
          [
            78.11329,
            12.23755
          ],
          [
            78.13872,
            12.25415
          ],
          [
            78.15571,
            12.279
          ],
          [
            78.16168,
            12.3083
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-DHA-04",
    "name": "Pennagaram Hogenakkal",
    "district": "Dharmapuri",
    "state": "Tamil Nadu",
    "type": "River Village Cluster",
    "pincode": "636810",
    "lat": 12.1333,
    "lng": 77.9,
    "radius_km": 9.5,
    "approx_area_sqkm": 283.5,
    "plus_code": "7J4V4VMX+8X",
    "admin_code": "TN-GEO-0086",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.98754,
            12.1333
          ],
          [
            77.98088,
            12.16605
          ],
          [
            77.9619,
            12.19382
          ],
          [
            77.9335,
            12.21237
          ],
          [
            77.9,
            12.21889
          ],
          [
            77.8665,
            12.21237
          ],
          [
            77.8381,
            12.19382
          ],
          [
            77.81912,
            12.16605
          ],
          [
            77.81246,
            12.1333
          ],
          [
            77.81912,
            12.10055
          ],
          [
            77.8381,
            12.07278
          ],
          [
            77.8665,
            12.05423
          ],
          [
            77.9,
            12.04771
          ],
          [
            77.9335,
            12.05423
          ],
          [
            77.9619,
            12.07278
          ],
          [
            77.98088,
            12.10055
          ],
          [
            77.98754,
            12.1333
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-DHA-05",
    "name": "Pappireddipatti Valley",
    "district": "Dharmapuri",
    "state": "Tamil Nadu",
    "type": "Farming Village Zone",
    "pincode": "636905",
    "lat": 11.9167,
    "lng": 78.3667,
    "radius_km": 9,
    "approx_area_sqkm": 254.5,
    "plus_code": "7J3WW988+MM",
    "admin_code": "TN-GEO-0087",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.44957,
            11.9167
          ],
          [
            78.44326,
            11.94773
          ],
          [
            78.4253,
            11.97403
          ],
          [
            78.39841,
            11.99161
          ],
          [
            78.3667,
            11.99778
          ],
          [
            78.33499,
            11.99161
          ],
          [
            78.3081,
            11.97403
          ],
          [
            78.29014,
            11.94773
          ],
          [
            78.28383,
            11.9167
          ],
          [
            78.29014,
            11.88567
          ],
          [
            78.3081,
            11.85937
          ],
          [
            78.33499,
            11.84179
          ],
          [
            78.3667,
            11.83562
          ],
          [
            78.39841,
            11.84179
          ],
          [
            78.4253,
            11.85937
          ],
          [
            78.44326,
            11.88567
          ],
          [
            78.44957,
            11.9167
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-KRI-01",
    "name": "Krishnagiri Mango City",
    "district": "Krishnagiri",
    "state": "Tamil Nadu",
    "type": "District HQ Core",
    "pincode": "635001",
    "lat": 12.5186,
    "lng": 78.2137,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J4WG697+CF",
    "admin_code": "TN-GEO-0088",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.28753,
            12.5186
          ],
          [
            78.28191,
            12.54618
          ],
          [
            78.2659,
            12.56956
          ],
          [
            78.24195,
            12.58519
          ],
          [
            78.2137,
            12.59067
          ],
          [
            78.18545,
            12.58519
          ],
          [
            78.1615,
            12.56956
          ],
          [
            78.14549,
            12.54618
          ],
          [
            78.13987,
            12.5186
          ],
          [
            78.14549,
            12.49102
          ],
          [
            78.1615,
            12.46764
          ],
          [
            78.18545,
            12.45201
          ],
          [
            78.2137,
            12.44653
          ],
          [
            78.24195,
            12.45201
          ],
          [
            78.2659,
            12.46764
          ],
          [
            78.28191,
            12.49102
          ],
          [
            78.28753,
            12.5186
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-KRI-02",
    "name": "Hosur Electronic City Mega Hub",
    "district": "Krishnagiri",
    "state": "Tamil Nadu",
    "type": "Industrial City Hub",
    "pincode": "635109",
    "lat": 12.7409,
    "lng": 77.8253,
    "radius_km": 9.5,
    "approx_area_sqkm": 283.5,
    "plus_code": "7J4VPRRG+94",
    "admin_code": "TN-GEO-0089",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.91305,
            12.7409
          ],
          [
            77.90637,
            12.77365
          ],
          [
            77.88735,
            12.80142
          ],
          [
            77.85888,
            12.81997
          ],
          [
            77.8253,
            12.82649
          ],
          [
            77.79172,
            12.81997
          ],
          [
            77.76325,
            12.80142
          ],
          [
            77.74423,
            12.77365
          ],
          [
            77.73755,
            12.7409
          ],
          [
            77.74423,
            12.70815
          ],
          [
            77.76325,
            12.68038
          ],
          [
            77.79172,
            12.66183
          ],
          [
            77.8253,
            12.65531
          ],
          [
            77.85888,
            12.66183
          ],
          [
            77.88735,
            12.68038
          ],
          [
            77.90637,
            12.70815
          ],
          [
            77.91305,
            12.7409
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-KRI-03",
    "name": "Pochampalli SIPCOT Park",
    "district": "Krishnagiri",
    "state": "Tamil Nadu",
    "type": "Industrial Town Zone",
    "pincode": "635206",
    "lat": 12.3333,
    "lng": 78.3667,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J4W89M8+8M",
    "admin_code": "TN-GEO-0090",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.44509,
            12.3333
          ],
          [
            78.43912,
            12.3626
          ],
          [
            78.42213,
            12.38745
          ],
          [
            78.3967,
            12.40405
          ],
          [
            78.3667,
            12.40988
          ],
          [
            78.3367,
            12.40405
          ],
          [
            78.31127,
            12.38745
          ],
          [
            78.29428,
            12.3626
          ],
          [
            78.28831,
            12.3333
          ],
          [
            78.29428,
            12.304
          ],
          [
            78.31127,
            12.27915
          ],
          [
            78.3367,
            12.26255
          ],
          [
            78.3667,
            12.25672
          ],
          [
            78.3967,
            12.26255
          ],
          [
            78.42213,
            12.27915
          ],
          [
            78.43912,
            12.304
          ],
          [
            78.44509,
            12.3333
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-KRI-04",
    "name": "Denkanikottai Hills",
    "district": "Krishnagiri",
    "state": "Tamil Nadu",
    "type": "Horticulture Town Zone",
    "pincode": "635107",
    "lat": 12.5333,
    "lng": 77.7833,
    "radius_km": 9,
    "approx_area_sqkm": 254.5,
    "plus_code": "7J4VGQMM+88",
    "admin_code": "TN-GEO-0091",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.86636,
            12.5333
          ],
          [
            77.86004,
            12.56433
          ],
          [
            77.84203,
            12.59063
          ],
          [
            77.81509,
            12.60821
          ],
          [
            77.7833,
            12.61438
          ],
          [
            77.75151,
            12.60821
          ],
          [
            77.72457,
            12.59063
          ],
          [
            77.70656,
            12.56433
          ],
          [
            77.70024,
            12.5333
          ],
          [
            77.70656,
            12.50227
          ],
          [
            77.72457,
            12.47597
          ],
          [
            77.75151,
            12.45839
          ],
          [
            77.7833,
            12.45222
          ],
          [
            77.81509,
            12.45839
          ],
          [
            77.84203,
            12.47597
          ],
          [
            77.86004,
            12.50227
          ],
          [
            77.86636,
            12.5333
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-KRI-05",
    "name": "Uthangarai Agricultural Hub",
    "district": "Krishnagiri",
    "state": "Tamil Nadu",
    "type": "Rural Agro Hub",
    "pincode": "635207",
    "lat": 12.2667,
    "lng": 78.5333,
    "radius_km": 9.5,
    "approx_area_sqkm": 283.5,
    "plus_code": "7J4W7G8M+M8",
    "admin_code": "TN-GEO-0092",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.62089,
            12.2667
          ],
          [
            78.61422,
            12.29945
          ],
          [
            78.59523,
            12.32722
          ],
          [
            78.56682,
            12.34577
          ],
          [
            78.5333,
            12.35229
          ],
          [
            78.49978,
            12.34577
          ],
          [
            78.47137,
            12.32722
          ],
          [
            78.45238,
            12.29945
          ],
          [
            78.44571,
            12.2667
          ],
          [
            78.45238,
            12.23395
          ],
          [
            78.47137,
            12.20618
          ],
          [
            78.49978,
            12.18763
          ],
          [
            78.5333,
            12.18111
          ],
          [
            78.56682,
            12.18763
          ],
          [
            78.59523,
            12.20618
          ],
          [
            78.61422,
            12.23395
          ],
          [
            78.62089,
            12.2667
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-KRI-06",
    "name": "Shoolagiri Highway Hub",
    "district": "Krishnagiri",
    "state": "Tamil Nadu",
    "type": "Logistics Village Zone",
    "pincode": "635117",
    "lat": 12.6667,
    "lng": 78.0167,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J4WM288+MM",
    "admin_code": "TN-GEO-0093",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.09519,
            12.6667
          ],
          [
            78.08921,
            12.696
          ],
          [
            78.0722,
            12.72085
          ],
          [
            78.04674,
            12.73745
          ],
          [
            78.0167,
            12.74328
          ],
          [
            77.98666,
            12.73745
          ],
          [
            77.9612,
            12.72085
          ],
          [
            77.94419,
            12.696
          ],
          [
            77.93821,
            12.6667
          ],
          [
            77.94419,
            12.6374
          ],
          [
            77.9612,
            12.61255
          ],
          [
            77.98666,
            12.59595
          ],
          [
            78.0167,
            12.59012
          ],
          [
            78.04674,
            12.59595
          ],
          [
            78.0722,
            12.61255
          ],
          [
            78.08921,
            12.6374
          ],
          [
            78.09519,
            12.6667
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-THE-01",
    "name": "Udhagamandalam (Ooty) Core",
    "district": "The Nilgiris",
    "state": "Tamil Nadu",
    "type": "Queen of Hills City",
    "pincode": "643001",
    "lat": 11.4102,
    "lng": 76.695,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J3RCM6V+3X",
    "admin_code": "TN-GEO-0094",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            76.76853,
            11.4102
          ],
          [
            76.76293,
            11.43778
          ],
          [
            76.74699,
            11.46116
          ],
          [
            76.72314,
            11.47679
          ],
          [
            76.695,
            11.48227
          ],
          [
            76.66686,
            11.47679
          ],
          [
            76.64301,
            11.46116
          ],
          [
            76.62707,
            11.43778
          ],
          [
            76.62147,
            11.4102
          ],
          [
            76.62707,
            11.38262
          ],
          [
            76.64301,
            11.35924
          ],
          [
            76.66686,
            11.34361
          ],
          [
            76.695,
            11.33813
          ],
          [
            76.72314,
            11.34361
          ],
          [
            76.74699,
            11.35924
          ],
          [
            76.76293,
            11.38262
          ],
          [
            76.76853,
            11.4102
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-THE-02",
    "name": "Coonoor Tea Estates",
    "district": "The Nilgiris",
    "state": "Tamil Nadu",
    "type": "Tea Plantation City Zone",
    "pincode": "643102",
    "lat": 11.353,
    "lng": 76.7959,
    "radius_km": 7.5,
    "approx_area_sqkm": 176.7,
    "plus_code": "7J3R9Q3W+59",
    "admin_code": "TN-GEO-0095",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            76.86482,
            11.353
          ],
          [
            76.85957,
            11.37886
          ],
          [
            76.84463,
            11.40078
          ],
          [
            76.82227,
            11.41542
          ],
          [
            76.7959,
            11.42057
          ],
          [
            76.76953,
            11.41542
          ],
          [
            76.74717,
            11.40078
          ],
          [
            76.73223,
            11.37886
          ],
          [
            76.72698,
            11.353
          ],
          [
            76.73223,
            11.32714
          ],
          [
            76.74717,
            11.30522
          ],
          [
            76.76953,
            11.29058
          ],
          [
            76.7959,
            11.28543
          ],
          [
            76.82227,
            11.29058
          ],
          [
            76.84463,
            11.30522
          ],
          [
            76.85957,
            11.32714
          ],
          [
            76.86482,
            11.353
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-THE-03",
    "name": "Kotagiri Green Valley",
    "district": "The Nilgiris",
    "state": "Tamil Nadu",
    "type": "Hill Village Cluster",
    "pincode": "643217",
    "lat": 11.4333,
    "lng": 76.8667,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J3RCVM8+8M",
    "admin_code": "TN-GEO-0096",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            76.94023,
            11.4333
          ],
          [
            76.93463,
            11.46088
          ],
          [
            76.91869,
            11.48426
          ],
          [
            76.89484,
            11.49989
          ],
          [
            76.8667,
            11.50537
          ],
          [
            76.83856,
            11.49989
          ],
          [
            76.81471,
            11.48426
          ],
          [
            76.79877,
            11.46088
          ],
          [
            76.79317,
            11.4333
          ],
          [
            76.79877,
            11.40572
          ],
          [
            76.81471,
            11.38234
          ],
          [
            76.83856,
            11.36671
          ],
          [
            76.8667,
            11.36123
          ],
          [
            76.89484,
            11.36671
          ],
          [
            76.91869,
            11.38234
          ],
          [
            76.93463,
            11.40572
          ],
          [
            76.94023,
            11.4333
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-THE-04",
    "name": "Gudalur Border Plantations",
    "district": "The Nilgiris",
    "state": "Tamil Nadu",
    "type": "Valley Town Zone",
    "pincode": "643212",
    "lat": 11.5,
    "lng": 76.5,
    "radius_km": 9,
    "approx_area_sqkm": 254.5,
    "plus_code": "7J3RGG22+22",
    "admin_code": "TN-GEO-0097",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            76.58274,
            11.5
          ],
          [
            76.57644,
            11.53103
          ],
          [
            76.55851,
            11.55733
          ],
          [
            76.53166,
            11.57491
          ],
          [
            76.5,
            11.58108
          ],
          [
            76.46834,
            11.57491
          ],
          [
            76.44149,
            11.55733
          ],
          [
            76.42356,
            11.53103
          ],
          [
            76.41726,
            11.5
          ],
          [
            76.42356,
            11.46897
          ],
          [
            76.44149,
            11.44267
          ],
          [
            76.46834,
            11.42509
          ],
          [
            76.5,
            11.41892
          ],
          [
            76.53166,
            11.42509
          ],
          [
            76.55851,
            11.44267
          ],
          [
            76.57644,
            11.46897
          ],
          [
            76.58274,
            11.5
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-THE-05",
    "name": "Kundah Forest & Hydro",
    "district": "The Nilgiris",
    "state": "Tamil Nadu",
    "type": "Mountain Village Zone",
    "pincode": "643219",
    "lat": 11.2833,
    "lng": 76.6833,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J3R7MMM+88",
    "admin_code": "TN-GEO-0098",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            76.76139,
            11.2833
          ],
          [
            76.75544,
            11.3126
          ],
          [
            76.73852,
            11.33745
          ],
          [
            76.71318,
            11.35405
          ],
          [
            76.6833,
            11.35988
          ],
          [
            76.65342,
            11.35405
          ],
          [
            76.62808,
            11.33745
          ],
          [
            76.61116,
            11.3126
          ],
          [
            76.60521,
            11.2833
          ],
          [
            76.61116,
            11.254
          ],
          [
            76.62808,
            11.22915
          ],
          [
            76.65342,
            11.21255
          ],
          [
            76.6833,
            11.20672
          ],
          [
            76.71318,
            11.21255
          ],
          [
            76.73852,
            11.22915
          ],
          [
            76.75544,
            11.254
          ],
          [
            76.76139,
            11.2833
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-NAM-01",
    "name": "Namakkal Transport & Egg City",
    "district": "Namakkal",
    "state": "Tamil Nadu",
    "type": "Poultry City Core",
    "pincode": "637001",
    "lat": 11.2189,
    "lng": 78.1674,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J3W6598+HX",
    "admin_code": "TN-GEO-0099",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.24088,
            11.2189
          ],
          [
            78.23528,
            11.24648
          ],
          [
            78.21936,
            11.26986
          ],
          [
            78.19552,
            11.28549
          ],
          [
            78.1674,
            11.29097
          ],
          [
            78.13928,
            11.28549
          ],
          [
            78.11544,
            11.26986
          ],
          [
            78.09952,
            11.24648
          ],
          [
            78.09392,
            11.2189
          ],
          [
            78.09952,
            11.19132
          ],
          [
            78.11544,
            11.16794
          ],
          [
            78.13928,
            11.15231
          ],
          [
            78.1674,
            11.14683
          ],
          [
            78.19552,
            11.15231
          ],
          [
            78.21936,
            11.16794
          ],
          [
            78.23528,
            11.19132
          ],
          [
            78.24088,
            11.2189
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-NAM-02",
    "name": "Tiruchengode Rig City",
    "district": "Namakkal",
    "state": "Tamil Nadu",
    "type": "Borewell & Textile Town",
    "pincode": "637211",
    "lat": 11.3783,
    "lng": 77.8944,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J3V9VHV+8Q",
    "admin_code": "TN-GEO-0100",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.97251,
            11.3783
          ],
          [
            77.96657,
            11.4076
          ],
          [
            77.94963,
            11.43245
          ],
          [
            77.92429,
            11.44905
          ],
          [
            77.8944,
            11.45488
          ],
          [
            77.86451,
            11.44905
          ],
          [
            77.83917,
            11.43245
          ],
          [
            77.82223,
            11.4076
          ],
          [
            77.81629,
            11.3783
          ],
          [
            77.82223,
            11.349
          ],
          [
            77.83917,
            11.32415
          ],
          [
            77.86451,
            11.30755
          ],
          [
            77.8944,
            11.30172
          ],
          [
            77.92429,
            11.30755
          ],
          [
            77.94963,
            11.32415
          ],
          [
            77.96657,
            11.349
          ],
          [
            77.97251,
            11.3783
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-NAM-03",
    "name": "Rasipuram Ghee & Weaving",
    "district": "Namakkal",
    "state": "Tamil Nadu",
    "type": "Silk Town Zone",
    "pincode": "637408",
    "lat": 11.4667,
    "lng": 78.1667,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J3WF588+MM",
    "admin_code": "TN-GEO-0101",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.24024,
            11.4667
          ],
          [
            78.23464,
            11.49428
          ],
          [
            78.2187,
            11.51766
          ],
          [
            78.19484,
            11.53329
          ],
          [
            78.1667,
            11.53877
          ],
          [
            78.13856,
            11.53329
          ],
          [
            78.1147,
            11.51766
          ],
          [
            78.09876,
            11.49428
          ],
          [
            78.09316,
            11.4667
          ],
          [
            78.09876,
            11.43912
          ],
          [
            78.1147,
            11.41574
          ],
          [
            78.13856,
            11.40011
          ],
          [
            78.1667,
            11.39463
          ],
          [
            78.19484,
            11.40011
          ],
          [
            78.2187,
            11.41574
          ],
          [
            78.23464,
            11.43912
          ],
          [
            78.24024,
            11.4667
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-NAM-04",
    "name": "Paramathi Velur Cauvery",
    "district": "Namakkal",
    "state": "Tamil Nadu",
    "type": "Betel Vine Town Zone",
    "pincode": "637207",
    "lat": 11.045,
    "lng": 78.0167,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J3W22W8+2M",
    "admin_code": "TN-GEO-0102",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.09472,
            11.045
          ],
          [
            78.08878,
            11.0743
          ],
          [
            78.07187,
            11.09915
          ],
          [
            78.04656,
            11.11575
          ],
          [
            78.0167,
            11.12158
          ],
          [
            77.98684,
            11.11575
          ],
          [
            77.96153,
            11.09915
          ],
          [
            77.94462,
            11.0743
          ],
          [
            77.93868,
            11.045
          ],
          [
            77.94462,
            11.0157
          ],
          [
            77.96153,
            10.99085
          ],
          [
            77.98684,
            10.97425
          ],
          [
            78.0167,
            10.96842
          ],
          [
            78.04656,
            10.97425
          ],
          [
            78.07187,
            10.99085
          ],
          [
            78.08878,
            11.0157
          ],
          [
            78.09472,
            11.045
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-NAM-05",
    "name": "Kolli Hills Herbal Cluster",
    "district": "Namakkal",
    "state": "Tamil Nadu",
    "type": "Tribal Hill Village Hub",
    "pincode": "637411",
    "lat": 11.25,
    "lng": 78.3333,
    "radius_km": 9,
    "approx_area_sqkm": 254.5,
    "plus_code": "7J3W782M+28",
    "admin_code": "TN-GEO-0103",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.41597,
            11.25
          ],
          [
            78.40968,
            11.28103
          ],
          [
            78.39176,
            11.30733
          ],
          [
            78.36494,
            11.32491
          ],
          [
            78.3333,
            11.33108
          ],
          [
            78.30166,
            11.32491
          ],
          [
            78.27484,
            11.30733
          ],
          [
            78.25692,
            11.28103
          ],
          [
            78.25063,
            11.25
          ],
          [
            78.25692,
            11.21897
          ],
          [
            78.27484,
            11.19267
          ],
          [
            78.30166,
            11.17509
          ],
          [
            78.3333,
            11.16892
          ],
          [
            78.36494,
            11.17509
          ],
          [
            78.39176,
            11.19267
          ],
          [
            78.40968,
            11.21897
          ],
          [
            78.41597,
            11.25
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-KAR-01",
    "name": "Karur Textile Capital",
    "district": "Karur",
    "state": "Tamil Nadu",
    "type": "Export City Core",
    "pincode": "639001",
    "lat": 10.9601,
    "lng": 78.0766,
    "radius_km": 7.5,
    "approx_area_sqkm": 176.7,
    "plus_code": "7J2WX36G+2J",
    "admin_code": "TN-GEO-0104",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.14542,
            10.9601
          ],
          [
            78.14018,
            10.98596
          ],
          [
            78.12527,
            11.00788
          ],
          [
            78.10294,
            11.02252
          ],
          [
            78.0766,
            11.02767
          ],
          [
            78.05026,
            11.02252
          ],
          [
            78.02793,
            11.00788
          ],
          [
            78.01302,
            10.98596
          ],
          [
            78.00778,
            10.9601
          ],
          [
            78.01302,
            10.93424
          ],
          [
            78.02793,
            10.91232
          ],
          [
            78.05026,
            10.89768
          ],
          [
            78.0766,
            10.89253
          ],
          [
            78.10294,
            10.89768
          ],
          [
            78.12527,
            10.91232
          ],
          [
            78.14018,
            10.93424
          ],
          [
            78.14542,
            10.9601
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-KAR-02",
    "name": "Kulithalai Cauvery Bank",
    "district": "Karur",
    "state": "Tamil Nadu",
    "type": "Temple Town Zone",
    "pincode": "639107",
    "lat": 10.9333,
    "lng": 78.4167,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J2WWCM8+8M",
    "admin_code": "TN-GEO-0105",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.49469,
            10.9333
          ],
          [
            78.48876,
            10.9626
          ],
          [
            78.47185,
            10.98745
          ],
          [
            78.44655,
            11.00405
          ],
          [
            78.4167,
            11.00988
          ],
          [
            78.38685,
            11.00405
          ],
          [
            78.36155,
            10.98745
          ],
          [
            78.34464,
            10.9626
          ],
          [
            78.33871,
            10.9333
          ],
          [
            78.34464,
            10.904
          ],
          [
            78.36155,
            10.87915
          ],
          [
            78.38685,
            10.86255
          ],
          [
            78.4167,
            10.85672
          ],
          [
            78.44655,
            10.86255
          ],
          [
            78.47185,
            10.87915
          ],
          [
            78.48876,
            10.904
          ],
          [
            78.49469,
            10.9333
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-KAR-03",
    "name": "Aravakurichi Drumstick Hub",
    "district": "Karur",
    "state": "Tamil Nadu",
    "type": "Agro Market Town",
    "pincode": "639201",
    "lat": 10.7667,
    "lng": 77.9167,
    "radius_km": 9.5,
    "approx_area_sqkm": 283.5,
    "plus_code": "7J2VQW88+MM",
    "admin_code": "TN-GEO-0106",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.00382,
            10.7667
          ],
          [
            77.99719,
            10.79945
          ],
          [
            77.9783,
            10.82722
          ],
          [
            77.95004,
            10.84577
          ],
          [
            77.9167,
            10.85229
          ],
          [
            77.88336,
            10.84577
          ],
          [
            77.8551,
            10.82722
          ],
          [
            77.83621,
            10.79945
          ],
          [
            77.82958,
            10.7667
          ],
          [
            77.83621,
            10.73395
          ],
          [
            77.8551,
            10.70618
          ],
          [
            77.88336,
            10.68763
          ],
          [
            77.9167,
            10.68111
          ],
          [
            77.95004,
            10.68763
          ],
          [
            77.9783,
            10.70618
          ],
          [
            77.99719,
            10.73395
          ],
          [
            78.00382,
            10.7667
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-KAR-04",
    "name": "Krishnarayapuram Village Hub",
    "district": "Karur",
    "state": "Tamil Nadu",
    "type": "Delta Farming Village",
    "pincode": "639102",
    "lat": 10.95,
    "lng": 78.2667,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J2WX728+2M",
    "admin_code": "TN-GEO-0107",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.34011,
            10.95
          ],
          [
            78.33452,
            10.97758
          ],
          [
            78.31861,
            11.00096
          ],
          [
            78.29479,
            11.01659
          ],
          [
            78.2667,
            11.02207
          ],
          [
            78.23861,
            11.01659
          ],
          [
            78.21479,
            11.00096
          ],
          [
            78.19888,
            10.97758
          ],
          [
            78.19329,
            10.95
          ],
          [
            78.19888,
            10.92242
          ],
          [
            78.21479,
            10.89904
          ],
          [
            78.23861,
            10.88341
          ],
          [
            78.2667,
            10.87793
          ],
          [
            78.29479,
            10.88341
          ],
          [
            78.31861,
            10.89904
          ],
          [
            78.33452,
            10.92242
          ],
          [
            78.34011,
            10.95
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-DIN-01",
    "name": "Dindigul Lock City & Biryani",
    "district": "Dindigul",
    "state": "Tamil Nadu",
    "type": "Commercial City Core",
    "pincode": "624001",
    "lat": 10.3673,
    "lng": 77.9803,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J2V9X8J+W4",
    "admin_code": "TN-GEO-0108",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.05357,
            10.3673
          ],
          [
            78.04799,
            10.39488
          ],
          [
            78.03211,
            10.41826
          ],
          [
            78.00834,
            10.43389
          ],
          [
            77.9803,
            10.43937
          ],
          [
            77.95226,
            10.43389
          ],
          [
            77.92849,
            10.41826
          ],
          [
            77.91261,
            10.39488
          ],
          [
            77.90703,
            10.3673
          ],
          [
            77.91261,
            10.33972
          ],
          [
            77.92849,
            10.31634
          ],
          [
            77.95226,
            10.30071
          ],
          [
            77.9803,
            10.29523
          ],
          [
            78.00834,
            10.30071
          ],
          [
            78.03211,
            10.31634
          ],
          [
            78.04799,
            10.33972
          ],
          [
            78.05357,
            10.3673
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-DIN-02",
    "name": "Kodaikanal Hill Resort",
    "district": "Dindigul",
    "state": "Tamil Nadu",
    "type": "Hill Station City Zone",
    "pincode": "624101",
    "lat": 10.2381,
    "lng": 77.4892,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J2V6FQQ+6M",
    "admin_code": "TN-GEO-0109",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.56702,
            10.2381
          ],
          [
            77.56109,
            10.2674
          ],
          [
            77.54422,
            10.29225
          ],
          [
            77.51898,
            10.30885
          ],
          [
            77.4892,
            10.31468
          ],
          [
            77.45942,
            10.30885
          ],
          [
            77.43418,
            10.29225
          ],
          [
            77.41731,
            10.2674
          ],
          [
            77.41138,
            10.2381
          ],
          [
            77.41731,
            10.2088
          ],
          [
            77.43418,
            10.18395
          ],
          [
            77.45942,
            10.16735
          ],
          [
            77.4892,
            10.16152
          ],
          [
            77.51898,
            10.16735
          ],
          [
            77.54422,
            10.18395
          ],
          [
            77.56109,
            10.2088
          ],
          [
            77.56702,
            10.2381
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-DIN-03",
    "name": "Palani Murugan Foothills",
    "district": "Dindigul",
    "state": "Tamil Nadu",
    "type": "Pilgrim City Hub",
    "pincode": "624601",
    "lat": 10.45,
    "lng": 77.5167,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J2VFG28+2M",
    "admin_code": "TN-GEO-0110",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.59457,
            10.45
          ],
          [
            77.58864,
            10.4793
          ],
          [
            77.57176,
            10.50415
          ],
          [
            77.5465,
            10.52075
          ],
          [
            77.5167,
            10.52658
          ],
          [
            77.4869,
            10.52075
          ],
          [
            77.46164,
            10.50415
          ],
          [
            77.44476,
            10.4793
          ],
          [
            77.43883,
            10.45
          ],
          [
            77.44476,
            10.4207
          ],
          [
            77.46164,
            10.39585
          ],
          [
            77.4869,
            10.37925
          ],
          [
            77.5167,
            10.37342
          ],
          [
            77.5465,
            10.37925
          ],
          [
            77.57176,
            10.39585
          ],
          [
            77.58864,
            10.4207
          ],
          [
            77.59457,
            10.45
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-DIN-04",
    "name": "Oddanchatram Market Hub",
    "district": "Dindigul",
    "state": "Tamil Nadu",
    "type": "Vegetable Mega Market",
    "pincode": "624619",
    "lat": 10.4833,
    "lng": 77.75,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J2VFQM2+82",
    "admin_code": "TN-GEO-0111",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.82788,
            10.4833
          ],
          [
            77.82195,
            10.5126
          ],
          [
            77.80507,
            10.53745
          ],
          [
            77.7798,
            10.55405
          ],
          [
            77.75,
            10.55988
          ],
          [
            77.7202,
            10.55405
          ],
          [
            77.69493,
            10.53745
          ],
          [
            77.67805,
            10.5126
          ],
          [
            77.67212,
            10.4833
          ],
          [
            77.67805,
            10.454
          ],
          [
            77.69493,
            10.42915
          ],
          [
            77.7202,
            10.41255
          ],
          [
            77.75,
            10.40672
          ],
          [
            77.7798,
            10.41255
          ],
          [
            77.80507,
            10.42915
          ],
          [
            77.82195,
            10.454
          ],
          [
            77.82788,
            10.4833
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-DIN-05",
    "name": "Natham Tamarind Belt",
    "district": "Dindigul",
    "state": "Tamil Nadu",
    "type": "Hill Village Cluster",
    "pincode": "624401",
    "lat": 10.2333,
    "lng": 78.2333,
    "radius_km": 9,
    "approx_area_sqkm": 254.5,
    "plus_code": "7J2W66MM+88",
    "admin_code": "TN-GEO-0112",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.31569,
            10.2333
          ],
          [
            78.30942,
            10.26433
          ],
          [
            78.29156,
            10.29063
          ],
          [
            78.26483,
            10.30821
          ],
          [
            78.2333,
            10.31438
          ],
          [
            78.20177,
            10.30821
          ],
          [
            78.17504,
            10.29063
          ],
          [
            78.15718,
            10.26433
          ],
          [
            78.15091,
            10.2333
          ],
          [
            78.15718,
            10.20227
          ],
          [
            78.17504,
            10.17597
          ],
          [
            78.20177,
            10.15839
          ],
          [
            78.2333,
            10.15222
          ],
          [
            78.26483,
            10.15839
          ],
          [
            78.29156,
            10.17597
          ],
          [
            78.30942,
            10.20227
          ],
          [
            78.31569,
            10.2333
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-DIN-06",
    "name": "Vedasandur Tobacco Zone",
    "district": "Dindigul",
    "state": "Tamil Nadu",
    "type": "Rural Agricultural Zone",
    "pincode": "624710",
    "lat": 10.5333,
    "lng": 77.95,
    "radius_km": 9,
    "approx_area_sqkm": 254.5,
    "plus_code": "7J2VGWMX+8X",
    "admin_code": "TN-GEO-0113",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.03247,
            10.5333
          ],
          [
            78.02619,
            10.56433
          ],
          [
            78.00832,
            10.59063
          ],
          [
            77.98156,
            10.60821
          ],
          [
            77.95,
            10.61438
          ],
          [
            77.91844,
            10.60821
          ],
          [
            77.89168,
            10.59063
          ],
          [
            77.87381,
            10.56433
          ],
          [
            77.86753,
            10.5333
          ],
          [
            77.87381,
            10.50227
          ],
          [
            77.89168,
            10.47597
          ],
          [
            77.91844,
            10.45839
          ],
          [
            77.95,
            10.45222
          ],
          [
            77.98156,
            10.45839
          ],
          [
            78.00832,
            10.47597
          ],
          [
            78.02619,
            10.50227
          ],
          [
            78.03247,
            10.5333
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-THE-01",
    "name": "Theni Allinagaram Core",
    "district": "Theni",
    "state": "Tamil Nadu",
    "type": "Cardamom & Trade Core",
    "pincode": "625531",
    "lat": 10.0104,
    "lng": 77.4768,
    "radius_km": 7.5,
    "approx_area_sqkm": 176.7,
    "plus_code": "7J2V2F6G+5P",
    "admin_code": "TN-GEO-0114",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.54541,
            10.0104
          ],
          [
            77.54019,
            10.03626
          ],
          [
            77.52532,
            10.05818
          ],
          [
            77.50306,
            10.07282
          ],
          [
            77.4768,
            10.07797
          ],
          [
            77.45054,
            10.07282
          ],
          [
            77.42828,
            10.05818
          ],
          [
            77.41341,
            10.03626
          ],
          [
            77.40819,
            10.0104
          ],
          [
            77.41341,
            9.98454
          ],
          [
            77.42828,
            9.96262
          ],
          [
            77.45054,
            9.94798
          ],
          [
            77.4768,
            9.94283
          ],
          [
            77.50306,
            9.94798
          ],
          [
            77.52532,
            9.96262
          ],
          [
            77.54019,
            9.98454
          ],
          [
            77.54541,
            10.0104
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-THE-02",
    "name": "Periyakulam Mango Valley",
    "district": "Theni",
    "state": "Tamil Nadu",
    "type": "Orchard Town Zone",
    "pincode": "625601",
    "lat": 10.1167,
    "lng": 77.55,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J2V4H82+M2",
    "admin_code": "TN-GEO-0115",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.62321,
            10.1167
          ],
          [
            77.61764,
            10.14428
          ],
          [
            77.60177,
            10.16766
          ],
          [
            77.57802,
            10.18329
          ],
          [
            77.55,
            10.18877
          ],
          [
            77.52198,
            10.18329
          ],
          [
            77.49823,
            10.16766
          ],
          [
            77.48236,
            10.14428
          ],
          [
            77.47679,
            10.1167
          ],
          [
            77.48236,
            10.08912
          ],
          [
            77.49823,
            10.06574
          ],
          [
            77.52198,
            10.05011
          ],
          [
            77.55,
            10.04463
          ],
          [
            77.57802,
            10.05011
          ],
          [
            77.60177,
            10.06574
          ],
          [
            77.61764,
            10.08912
          ],
          [
            77.62321,
            10.1167
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-THE-03",
    "name": "Bodinayakanur Cardamom Hub",
    "district": "Theni",
    "state": "Tamil Nadu",
    "type": "Spices Capital Town",
    "pincode": "625513",
    "lat": 10.0167,
    "lng": 77.35,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J2V2982+M2",
    "admin_code": "TN-GEO-0116",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.42776,
            10.0167
          ],
          [
            77.42184,
            10.046
          ],
          [
            77.40499,
            10.07085
          ],
          [
            77.37976,
            10.08745
          ],
          [
            77.35,
            10.09328
          ],
          [
            77.32024,
            10.08745
          ],
          [
            77.29501,
            10.07085
          ],
          [
            77.27816,
            10.046
          ],
          [
            77.27224,
            10.0167
          ],
          [
            77.27816,
            9.9874
          ],
          [
            77.29501,
            9.96255
          ],
          [
            77.32024,
            9.94595
          ],
          [
            77.35,
            9.94012
          ],
          [
            77.37976,
            9.94595
          ],
          [
            77.40499,
            9.96255
          ],
          [
            77.42184,
            9.9874
          ],
          [
            77.42776,
            10.0167
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-THE-04",
    "name": "Cumbum Grapes Valley",
    "district": "Theni",
    "state": "Tamil Nadu",
    "type": "Agro Valley Town",
    "pincode": "625516",
    "lat": 9.7333,
    "lng": 77.2833,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "6JXVP7MM+88",
    "admin_code": "TN-GEO-0117",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.36099,
            9.7333
          ],
          [
            77.35508,
            9.7626
          ],
          [
            77.33824,
            9.78745
          ],
          [
            77.31303,
            9.80405
          ],
          [
            77.2833,
            9.80988
          ],
          [
            77.25357,
            9.80405
          ],
          [
            77.22836,
            9.78745
          ],
          [
            77.21152,
            9.7626
          ],
          [
            77.20561,
            9.7333
          ],
          [
            77.21152,
            9.704
          ],
          [
            77.22836,
            9.67915
          ],
          [
            77.25357,
            9.66255
          ],
          [
            77.2833,
            9.65672
          ],
          [
            77.31303,
            9.66255
          ],
          [
            77.33824,
            9.67915
          ],
          [
            77.35508,
            9.704
          ],
          [
            77.36099,
            9.7333
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-THE-05",
    "name": "Uthamapalayam Canal Zone",
    "district": "Theni",
    "state": "Tamil Nadu",
    "type": "Fertile Farming Town",
    "pincode": "625533",
    "lat": 9.8,
    "lng": 77.3333,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "6JXVQ8XM+X8",
    "admin_code": "TN-GEO-0118",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.40644,
            9.8
          ],
          [
            77.40087,
            9.82758
          ],
          [
            77.38502,
            9.85096
          ],
          [
            77.36129,
            9.86659
          ],
          [
            77.3333,
            9.87207
          ],
          [
            77.30531,
            9.86659
          ],
          [
            77.28158,
            9.85096
          ],
          [
            77.26573,
            9.82758
          ],
          [
            77.26016,
            9.8
          ],
          [
            77.26573,
            9.77242
          ],
          [
            77.28158,
            9.74904
          ],
          [
            77.30531,
            9.73341
          ],
          [
            77.3333,
            9.72793
          ],
          [
            77.36129,
            9.73341
          ],
          [
            77.38502,
            9.74904
          ],
          [
            77.40087,
            9.77242
          ],
          [
            77.40644,
            9.8
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-THE-06",
    "name": "Andipatti Vaigai Dam Belt",
    "district": "Theni",
    "state": "Tamil Nadu",
    "type": "Handloom Village Zone",
    "pincode": "625512",
    "lat": 9.9833,
    "lng": 77.6167,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "6JXVXJM8+8M",
    "admin_code": "TN-GEO-0119",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.69445,
            9.9833
          ],
          [
            77.68854,
            10.0126
          ],
          [
            77.67168,
            10.03745
          ],
          [
            77.64646,
            10.05405
          ],
          [
            77.6167,
            10.05988
          ],
          [
            77.58694,
            10.05405
          ],
          [
            77.56172,
            10.03745
          ],
          [
            77.54486,
            10.0126
          ],
          [
            77.53895,
            9.9833
          ],
          [
            77.54486,
            9.954
          ],
          [
            77.56172,
            9.92915
          ],
          [
            77.58694,
            9.91255
          ],
          [
            77.6167,
            9.90672
          ],
          [
            77.64646,
            9.91255
          ],
          [
            77.67168,
            9.92915
          ],
          [
            77.68854,
            9.954
          ],
          [
            77.69445,
            9.9833
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TIR-01",
    "name": "Tirunelveli City / Palayamkottai",
    "district": "Tirunelveli",
    "state": "Tamil Nadu",
    "type": "City Heritage Core",
    "pincode": "627001",
    "lat": 8.7139,
    "lng": 77.7567,
    "radius_km": 7.5,
    "approx_area_sqkm": 176.7,
    "plus_code": "6JWVPQ74+HM",
    "admin_code": "TN-GEO-0120",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.82506,
            8.7139
          ],
          [
            77.81985,
            8.73976
          ],
          [
            77.80504,
            8.76168
          ],
          [
            77.78286,
            8.77632
          ],
          [
            77.7567,
            8.78147
          ],
          [
            77.73054,
            8.77632
          ],
          [
            77.70836,
            8.76168
          ],
          [
            77.69355,
            8.73976
          ],
          [
            77.68834,
            8.7139
          ],
          [
            77.69355,
            8.68804
          ],
          [
            77.70836,
            8.66612
          ],
          [
            77.73054,
            8.65148
          ],
          [
            77.7567,
            8.64633
          ],
          [
            77.78286,
            8.65148
          ],
          [
            77.80504,
            8.66612
          ],
          [
            77.81985,
            8.68804
          ],
          [
            77.82506,
            8.7139
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TIR-02",
    "name": "Ambasamudram Thamirabarani",
    "district": "Tirunelveli",
    "state": "Tamil Nadu",
    "type": "River Valley Town Zone",
    "pincode": "627401",
    "lat": 8.7,
    "lng": 77.45,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "6JWVPC2X+2X",
    "admin_code": "TN-GEO-0121",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.52747,
            8.7
          ],
          [
            77.52157,
            8.7293
          ],
          [
            77.50478,
            8.75415
          ],
          [
            77.47965,
            8.77075
          ],
          [
            77.45,
            8.77658
          ],
          [
            77.42035,
            8.77075
          ],
          [
            77.39522,
            8.75415
          ],
          [
            77.37843,
            8.7293
          ],
          [
            77.37253,
            8.7
          ],
          [
            77.37843,
            8.6707
          ],
          [
            77.39522,
            8.64585
          ],
          [
            77.42035,
            8.62925
          ],
          [
            77.45,
            8.62342
          ],
          [
            77.47965,
            8.62925
          ],
          [
            77.50478,
            8.64585
          ],
          [
            77.52157,
            8.6707
          ],
          [
            77.52747,
            8.7
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TIR-03",
    "name": "Nanguneri High-Tech SEZ",
    "district": "Tirunelveli",
    "state": "Tamil Nadu",
    "type": "Industrial Town Hub",
    "pincode": "627108",
    "lat": 8.4833,
    "lng": 77.6667,
    "radius_km": 9,
    "approx_area_sqkm": 254.5,
    "plus_code": "6JWVFMM8+8M",
    "admin_code": "TN-GEO-0122",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.74868,
            8.4833
          ],
          [
            77.74244,
            8.51433
          ],
          [
            77.72467,
            8.54063
          ],
          [
            77.69807,
            8.55821
          ],
          [
            77.6667,
            8.56438
          ],
          [
            77.63533,
            8.55821
          ],
          [
            77.60873,
            8.54063
          ],
          [
            77.59096,
            8.51433
          ],
          [
            77.58472,
            8.4833
          ],
          [
            77.59096,
            8.45227
          ],
          [
            77.60873,
            8.42597
          ],
          [
            77.63533,
            8.40839
          ],
          [
            77.6667,
            8.40222
          ],
          [
            77.69807,
            8.40839
          ],
          [
            77.72467,
            8.42597
          ],
          [
            77.74244,
            8.45227
          ],
          [
            77.74868,
            8.4833
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TIR-04",
    "name": "Radhapuram Windmill Coast",
    "district": "Tirunelveli",
    "state": "Tamil Nadu",
    "type": "Coastal Village Zone",
    "pincode": "627111",
    "lat": 8.3,
    "lng": 77.6833,
    "radius_km": 9.5,
    "approx_area_sqkm": 283.5,
    "plus_code": "6JWV7MXM+X8",
    "admin_code": "TN-GEO-0123",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.76979,
            8.3
          ],
          [
            77.76321,
            8.33275
          ],
          [
            77.74446,
            8.36052
          ],
          [
            77.7164,
            8.37907
          ],
          [
            77.6833,
            8.38559
          ],
          [
            77.6502,
            8.37907
          ],
          [
            77.62214,
            8.36052
          ],
          [
            77.60339,
            8.33275
          ],
          [
            77.59681,
            8.3
          ],
          [
            77.60339,
            8.26725
          ],
          [
            77.62214,
            8.23948
          ],
          [
            77.6502,
            8.22093
          ],
          [
            77.6833,
            8.21441
          ],
          [
            77.7164,
            8.22093
          ],
          [
            77.74446,
            8.23948
          ],
          [
            77.76321,
            8.26725
          ],
          [
            77.76979,
            8.3
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TIR-05",
    "name": "Cheranmahadevi Canal Belt",
    "district": "Tirunelveli",
    "state": "Tamil Nadu",
    "type": "Temple Village Cluster",
    "pincode": "627414",
    "lat": 8.6833,
    "lng": 77.5667,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "6JWVMHM8+8M",
    "admin_code": "TN-GEO-0124",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.63961,
            8.6833
          ],
          [
            77.63406,
            8.71088
          ],
          [
            77.61825,
            8.73426
          ],
          [
            77.5946,
            8.74989
          ],
          [
            77.5667,
            8.75537
          ],
          [
            77.5388,
            8.74989
          ],
          [
            77.51515,
            8.73426
          ],
          [
            77.49934,
            8.71088
          ],
          [
            77.49379,
            8.6833
          ],
          [
            77.49934,
            8.65572
          ],
          [
            77.51515,
            8.63234
          ],
          [
            77.5388,
            8.61671
          ],
          [
            77.5667,
            8.61123
          ],
          [
            77.5946,
            8.61671
          ],
          [
            77.61825,
            8.63234
          ],
          [
            77.63406,
            8.65572
          ],
          [
            77.63961,
            8.6833
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TEN-01",
    "name": "Tenkasi Temple City Core",
    "district": "Tenkasi",
    "state": "Tamil Nadu",
    "type": "Heritage City Core",
    "pincode": "627811",
    "lat": 8.9592,
    "lng": 77.3134,
    "radius_km": 7.5,
    "approx_area_sqkm": 176.7,
    "plus_code": "6JWVX857+M9",
    "admin_code": "TN-GEO-0125",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.3818,
            8.9592
          ],
          [
            77.3766,
            8.98506
          ],
          [
            77.36177,
            9.00698
          ],
          [
            77.33958,
            9.02162
          ],
          [
            77.3134,
            9.02677
          ],
          [
            77.28722,
            9.02162
          ],
          [
            77.26503,
            9.00698
          ],
          [
            77.2502,
            8.98506
          ],
          [
            77.245,
            8.9592
          ],
          [
            77.2502,
            8.93334
          ],
          [
            77.26503,
            8.91142
          ],
          [
            77.28722,
            8.89678
          ],
          [
            77.3134,
            8.89163
          ],
          [
            77.33958,
            8.89678
          ],
          [
            77.36177,
            8.91142
          ],
          [
            77.3766,
            8.93334
          ],
          [
            77.3818,
            8.9592
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TEN-02",
    "name": "Courtallam Spa of South",
    "district": "Tenkasi",
    "state": "Tamil Nadu",
    "type": "Waterfalls Town Hub",
    "pincode": "627802",
    "lat": 8.9333,
    "lng": 77.2667,
    "radius_km": 7,
    "approx_area_sqkm": 153.9,
    "plus_code": "6JWVW7M8+8M",
    "admin_code": "TN-GEO-0126",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.33054,
            8.9333
          ],
          [
            77.32568,
            8.95743
          ],
          [
            77.31184,
            8.97789
          ],
          [
            77.29113,
            8.99156
          ],
          [
            77.2667,
            8.99636
          ],
          [
            77.24227,
            8.99156
          ],
          [
            77.22156,
            8.97789
          ],
          [
            77.20772,
            8.95743
          ],
          [
            77.20286,
            8.9333
          ],
          [
            77.20772,
            8.90917
          ],
          [
            77.22156,
            8.88871
          ],
          [
            77.24227,
            8.87504
          ],
          [
            77.2667,
            8.87024
          ],
          [
            77.29113,
            8.87504
          ],
          [
            77.31184,
            8.88871
          ],
          [
            77.32568,
            8.90917
          ],
          [
            77.33054,
            8.9333
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TEN-03",
    "name": "Sankarankovil Textile Hub",
    "district": "Tenkasi",
    "state": "Tamil Nadu",
    "type": "Gomathi Amman Town",
    "pincode": "627756",
    "lat": 9.1667,
    "lng": 77.5333,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "6JXV5G8M+M8",
    "admin_code": "TN-GEO-0127",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.61087,
            9.1667
          ],
          [
            77.60496,
            9.196
          ],
          [
            77.58815,
            9.22085
          ],
          [
            77.56298,
            9.23745
          ],
          [
            77.5333,
            9.24328
          ],
          [
            77.50362,
            9.23745
          ],
          [
            77.47845,
            9.22085
          ],
          [
            77.46164,
            9.196
          ],
          [
            77.45573,
            9.1667
          ],
          [
            77.46164,
            9.1374
          ],
          [
            77.47845,
            9.11255
          ],
          [
            77.50362,
            9.09595
          ],
          [
            77.5333,
            9.09012
          ],
          [
            77.56298,
            9.09595
          ],
          [
            77.58815,
            9.11255
          ],
          [
            77.60496,
            9.1374
          ],
          [
            77.61087,
            9.1667
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TEN-04",
    "name": "Kadayanallur Weaving Belt",
    "district": "Tenkasi",
    "state": "Tamil Nadu",
    "type": "Industrial Town Zone",
    "pincode": "627751",
    "lat": 9.0833,
    "lng": 77.35,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "6JXV39M2+82",
    "admin_code": "TN-GEO-0128",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.42299,
            9.0833
          ],
          [
            77.41743,
            9.11088
          ],
          [
            77.40161,
            9.13426
          ],
          [
            77.37793,
            9.14989
          ],
          [
            77.35,
            9.15537
          ],
          [
            77.32207,
            9.14989
          ],
          [
            77.29839,
            9.13426
          ],
          [
            77.28257,
            9.11088
          ],
          [
            77.27701,
            9.0833
          ],
          [
            77.28257,
            9.05572
          ],
          [
            77.29839,
            9.03234
          ],
          [
            77.32207,
            9.01671
          ],
          [
            77.35,
            9.01123
          ],
          [
            77.37793,
            9.01671
          ],
          [
            77.40161,
            9.03234
          ],
          [
            77.41743,
            9.05572
          ],
          [
            77.42299,
            9.0833
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TEN-05",
    "name": "Alangulam Trading Hub",
    "district": "Tenkasi",
    "state": "Tamil Nadu",
    "type": "Agro Village Cluster",
    "pincode": "627851",
    "lat": 8.8667,
    "lng": 77.5,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "6JWVVG82+M2",
    "admin_code": "TN-GEO-0129",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.5775,
            8.8667
          ],
          [
            77.5716,
            8.896
          ],
          [
            77.5548,
            8.92085
          ],
          [
            77.52966,
            8.93745
          ],
          [
            77.5,
            8.94328
          ],
          [
            77.47034,
            8.93745
          ],
          [
            77.4452,
            8.92085
          ],
          [
            77.4284,
            8.896
          ],
          [
            77.4225,
            8.8667
          ],
          [
            77.4284,
            8.8374
          ],
          [
            77.4452,
            8.81255
          ],
          [
            77.47034,
            8.79595
          ],
          [
            77.5,
            8.79012
          ],
          [
            77.52966,
            8.79595
          ],
          [
            77.5548,
            8.81255
          ],
          [
            77.5716,
            8.8374
          ],
          [
            77.5775,
            8.8667
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TEN-06",
    "name": "Shenkottai Mountain Pass",
    "district": "Tenkasi",
    "state": "Tamil Nadu",
    "type": "Western Ghats Border Town",
    "pincode": "627809",
    "lat": 8.9833,
    "lng": 77.25,
    "radius_km": 7.5,
    "approx_area_sqkm": 176.7,
    "plus_code": "6JWVX7M2+82",
    "admin_code": "TN-GEO-0130",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.31841,
            8.9833
          ],
          [
            77.3132,
            9.00916
          ],
          [
            77.29837,
            9.03108
          ],
          [
            77.27618,
            9.04572
          ],
          [
            77.25,
            9.05087
          ],
          [
            77.22382,
            9.04572
          ],
          [
            77.20163,
            9.03108
          ],
          [
            77.1868,
            9.00916
          ],
          [
            77.18159,
            8.9833
          ],
          [
            77.1868,
            8.95744
          ],
          [
            77.20163,
            8.93552
          ],
          [
            77.22382,
            8.92088
          ],
          [
            77.25,
            8.91573
          ],
          [
            77.27618,
            8.92088
          ],
          [
            77.29837,
            8.93552
          ],
          [
            77.3132,
            8.95744
          ],
          [
            77.31841,
            8.9833
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TUT-01",
    "name": "Thoothukudi Port & City Core",
    "district": "Tuticorin",
    "state": "Tamil Nadu",
    "type": "Pearl Sea Port Core",
    "pincode": "628001",
    "lat": 8.7642,
    "lng": 78.1348,
    "radius_km": 7.5,
    "approx_area_sqkm": 176.7,
    "plus_code": "6JWWQ47M+MW",
    "admin_code": "TN-GEO-0131",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.20317,
            8.7642
          ],
          [
            78.19796,
            8.79006
          ],
          [
            78.18314,
            8.81198
          ],
          [
            78.16096,
            8.82662
          ],
          [
            78.1348,
            8.83177
          ],
          [
            78.10864,
            8.82662
          ],
          [
            78.08646,
            8.81198
          ],
          [
            78.07164,
            8.79006
          ],
          [
            78.06643,
            8.7642
          ],
          [
            78.07164,
            8.73834
          ],
          [
            78.08646,
            8.71642
          ],
          [
            78.10864,
            8.70178
          ],
          [
            78.1348,
            8.69663
          ],
          [
            78.16096,
            8.70178
          ],
          [
            78.18314,
            8.71642
          ],
          [
            78.19796,
            8.73834
          ],
          [
            78.20317,
            8.7642
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TUT-02",
    "name": "Kovilpatti Candy & Match City",
    "district": "Tuticorin",
    "state": "Tamil Nadu",
    "type": "Industrial Town Hub",
    "pincode": "628501",
    "lat": 9.17,
    "lng": 77.87,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "6JXV5VCC+22",
    "admin_code": "TN-GEO-0132",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.94757,
            9.17
          ],
          [
            77.94166,
            9.1993
          ],
          [
            77.92485,
            9.22415
          ],
          [
            77.89968,
            9.24075
          ],
          [
            77.87,
            9.24658
          ],
          [
            77.84032,
            9.24075
          ],
          [
            77.81515,
            9.22415
          ],
          [
            77.79834,
            9.1993
          ],
          [
            77.79243,
            9.17
          ],
          [
            77.79834,
            9.1407
          ],
          [
            77.81515,
            9.11585
          ],
          [
            77.84032,
            9.09925
          ],
          [
            77.87,
            9.09342
          ],
          [
            77.89968,
            9.09925
          ],
          [
            77.92485,
            9.11585
          ],
          [
            77.94166,
            9.1407
          ],
          [
            77.94757,
            9.17
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TUT-03",
    "name": "Tiruchendur Seashore Shrine",
    "district": "Tuticorin",
    "state": "Tamil Nadu",
    "type": "Coastal Pilgrim Town",
    "pincode": "628215",
    "lat": 8.495,
    "lng": 78.125,
    "radius_km": 7.5,
    "approx_area_sqkm": 176.7,
    "plus_code": "6JWWF4WF+2X",
    "admin_code": "TN-GEO-0133",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.19332,
            8.495
          ],
          [
            78.18812,
            8.52086
          ],
          [
            78.17331,
            8.54278
          ],
          [
            78.15114,
            8.55742
          ],
          [
            78.125,
            8.56257
          ],
          [
            78.09886,
            8.55742
          ],
          [
            78.07669,
            8.54278
          ],
          [
            78.06188,
            8.52086
          ],
          [
            78.05668,
            8.495
          ],
          [
            78.06188,
            8.46914
          ],
          [
            78.07669,
            8.44722
          ],
          [
            78.09886,
            8.43258
          ],
          [
            78.125,
            8.42743
          ],
          [
            78.15114,
            8.43258
          ],
          [
            78.17331,
            8.44722
          ],
          [
            78.18812,
            8.46914
          ],
          [
            78.19332,
            8.495
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TUT-04",
    "name": "Srivaikuntam Banana Belt",
    "district": "Tuticorin",
    "state": "Tamil Nadu",
    "type": "Thamirabarani Agro Town",
    "pincode": "628601",
    "lat": 8.625,
    "lng": 77.9083,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "6JWVJWF5+X8",
    "admin_code": "TN-GEO-0134",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.9812,
            8.625
          ],
          [
            77.97565,
            8.65258
          ],
          [
            77.95985,
            8.67596
          ],
          [
            77.9362,
            8.69159
          ],
          [
            77.9083,
            8.69707
          ],
          [
            77.8804,
            8.69159
          ],
          [
            77.85675,
            8.67596
          ],
          [
            77.84095,
            8.65258
          ],
          [
            77.8354,
            8.625
          ],
          [
            77.84095,
            8.59742
          ],
          [
            77.85675,
            8.57404
          ],
          [
            77.8804,
            8.55841
          ],
          [
            77.9083,
            8.55293
          ],
          [
            77.9362,
            8.55841
          ],
          [
            77.95985,
            8.57404
          ],
          [
            77.97565,
            8.59742
          ],
          [
            77.9812,
            8.625
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TUT-05",
    "name": "Ettayapuram Cultural Zone",
    "district": "Tuticorin",
    "state": "Tamil Nadu",
    "type": "Heritage Village Cluster",
    "pincode": "628902",
    "lat": 9.15,
    "lng": 78,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "6JXW5222+22",
    "admin_code": "TN-GEO-0135",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.07756,
            9.15
          ],
          [
            78.07166,
            9.1793
          ],
          [
            78.05485,
            9.20415
          ],
          [
            78.02968,
            9.22075
          ],
          [
            78,
            9.22658
          ],
          [
            77.97032,
            9.22075
          ],
          [
            77.94515,
            9.20415
          ],
          [
            77.92834,
            9.1793
          ],
          [
            77.92244,
            9.15
          ],
          [
            77.92834,
            9.1207
          ],
          [
            77.94515,
            9.09585
          ],
          [
            77.97032,
            9.07925
          ],
          [
            78,
            9.07342
          ],
          [
            78.02968,
            9.07925
          ],
          [
            78.05485,
            9.09585
          ],
          [
            78.07166,
            9.1207
          ],
          [
            78.07756,
            9.15
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TUT-06",
    "name": "Vilathikulam Chilly Fields",
    "district": "Tuticorin",
    "state": "Tamil Nadu",
    "type": "Dry Farming Village Zone",
    "pincode": "628907",
    "lat": 9.1333,
    "lng": 78.1667,
    "radius_km": 9.5,
    "approx_area_sqkm": 283.5,
    "plus_code": "6JXW45M8+8M",
    "admin_code": "TN-GEO-0136",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.25338,
            9.1333
          ],
          [
            78.24679,
            9.16605
          ],
          [
            78.228,
            9.19382
          ],
          [
            78.19987,
            9.21237
          ],
          [
            78.1667,
            9.21889
          ],
          [
            78.13353,
            9.21237
          ],
          [
            78.1054,
            9.19382
          ],
          [
            78.08661,
            9.16605
          ],
          [
            78.08002,
            9.1333
          ],
          [
            78.08661,
            9.10055
          ],
          [
            78.1054,
            9.07278
          ],
          [
            78.13353,
            9.05423
          ],
          [
            78.1667,
            9.04771
          ],
          [
            78.19987,
            9.05423
          ],
          [
            78.228,
            9.07278
          ],
          [
            78.24679,
            9.10055
          ],
          [
            78.25338,
            9.1333
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TUT-07",
    "name": "Kayalpattinam Maritime Heritage",
    "district": "Tuticorin",
    "state": "Tamil Nadu",
    "type": "Coastal Village Town",
    "pincode": "628204",
    "lat": 8.5667,
    "lng": 78.1333,
    "radius_km": 7,
    "approx_area_sqkm": 153.9,
    "plus_code": "6JWWH48M+M8",
    "admin_code": "TN-GEO-0137",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.19707,
            8.5667
          ],
          [
            78.19222,
            8.59083
          ],
          [
            78.1784,
            8.61129
          ],
          [
            78.15771,
            8.62496
          ],
          [
            78.1333,
            8.62976
          ],
          [
            78.10889,
            8.62496
          ],
          [
            78.0882,
            8.61129
          ],
          [
            78.07438,
            8.59083
          ],
          [
            78.06953,
            8.5667
          ],
          [
            78.07438,
            8.54257
          ],
          [
            78.0882,
            8.52211
          ],
          [
            78.10889,
            8.50844
          ],
          [
            78.1333,
            8.50364
          ],
          [
            78.15771,
            8.50844
          ],
          [
            78.1784,
            8.52211
          ],
          [
            78.19222,
            8.54257
          ],
          [
            78.19707,
            8.5667
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-KAN-01",
    "name": "Nagercoil City Central",
    "district": "Kanniyakumari",
    "state": "Tamil Nadu",
    "type": "District HQ Core",
    "pincode": "629001",
    "lat": 8.1833,
    "lng": 77.4119,
    "radius_km": 7,
    "approx_area_sqkm": 153.9,
    "plus_code": "6JWV5CM6+8Q",
    "admin_code": "TN-GEO-0138",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.47561,
            8.1833
          ],
          [
            77.47076,
            8.20743
          ],
          [
            77.45695,
            8.22789
          ],
          [
            77.43628,
            8.24156
          ],
          [
            77.4119,
            8.24636
          ],
          [
            77.38752,
            8.24156
          ],
          [
            77.36685,
            8.22789
          ],
          [
            77.35304,
            8.20743
          ],
          [
            77.34819,
            8.1833
          ],
          [
            77.35304,
            8.15917
          ],
          [
            77.36685,
            8.13871
          ],
          [
            77.38752,
            8.12504
          ],
          [
            77.4119,
            8.12024
          ],
          [
            77.43628,
            8.12504
          ],
          [
            77.45695,
            8.13871
          ],
          [
            77.47076,
            8.15917
          ],
          [
            77.47561,
            8.1833
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-KAN-02",
    "name": "Kanniyakumari Cape Land's End",
    "district": "Kanniyakumari",
    "state": "Tamil Nadu",
    "type": "Triple Sea Heritage Hub",
    "pincode": "629702",
    "lat": 8.0883,
    "lng": 77.5385,
    "radius_km": 7,
    "approx_area_sqkm": 153.9,
    "plus_code": "6JWV3GQQ+89",
    "admin_code": "TN-GEO-0139",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.6022,
            8.0883
          ],
          [
            77.59735,
            8.11243
          ],
          [
            77.58354,
            8.13289
          ],
          [
            77.56288,
            8.14656
          ],
          [
            77.5385,
            8.15136
          ],
          [
            77.51412,
            8.14656
          ],
          [
            77.49346,
            8.13289
          ],
          [
            77.47965,
            8.11243
          ],
          [
            77.4748,
            8.0883
          ],
          [
            77.47965,
            8.06417
          ],
          [
            77.49346,
            8.04371
          ],
          [
            77.51412,
            8.03004
          ],
          [
            77.5385,
            8.02524
          ],
          [
            77.56288,
            8.03004
          ],
          [
            77.58354,
            8.04371
          ],
          [
            77.59735,
            8.06417
          ],
          [
            77.6022,
            8.0883
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-KAN-03",
    "name": "Padmanabhapuram Palace Zone",
    "district": "Kanniyakumari",
    "state": "Tamil Nadu",
    "type": "Heritage Town Zone",
    "pincode": "629175",
    "lat": 8.25,
    "lng": 77.3167,
    "radius_km": 7.5,
    "approx_area_sqkm": 176.7,
    "plus_code": "6JWV7828+2M",
    "admin_code": "TN-GEO-0140",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.38497,
            8.25
          ],
          [
            77.37978,
            8.27586
          ],
          [
            77.36498,
            8.29778
          ],
          [
            77.34283,
            8.31242
          ],
          [
            77.3167,
            8.31757
          ],
          [
            77.29057,
            8.31242
          ],
          [
            77.26842,
            8.29778
          ],
          [
            77.25362,
            8.27586
          ],
          [
            77.24843,
            8.25
          ],
          [
            77.25362,
            8.22414
          ],
          [
            77.26842,
            8.20222
          ],
          [
            77.29057,
            8.18758
          ],
          [
            77.3167,
            8.18243
          ],
          [
            77.34283,
            8.18758
          ],
          [
            77.36498,
            8.20222
          ],
          [
            77.37978,
            8.22414
          ],
          [
            77.38497,
            8.25
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-KAN-04",
    "name": "Colachel Deep Sea Coast",
    "district": "Kanniyakumari",
    "state": "Tamil Nadu",
    "type": "Fishing Port Town",
    "pincode": "629251",
    "lat": 8.1833,
    "lng": 77.25,
    "radius_km": 7.5,
    "approx_area_sqkm": 176.7,
    "plus_code": "6JWV57M2+82",
    "admin_code": "TN-GEO-0141",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.31826,
            8.1833
          ],
          [
            77.31307,
            8.20916
          ],
          [
            77.29827,
            8.23108
          ],
          [
            77.27612,
            8.24572
          ],
          [
            77.25,
            8.25087
          ],
          [
            77.22388,
            8.24572
          ],
          [
            77.20173,
            8.23108
          ],
          [
            77.18693,
            8.20916
          ],
          [
            77.18174,
            8.1833
          ],
          [
            77.18693,
            8.15744
          ],
          [
            77.20173,
            8.13552
          ],
          [
            77.22388,
            8.12088
          ],
          [
            77.25,
            8.11573
          ],
          [
            77.27612,
            8.12088
          ],
          [
            77.29827,
            8.13552
          ],
          [
            77.31307,
            8.15744
          ],
          [
            77.31826,
            8.1833
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-KAN-05",
    "name": "Marthandam Cashew & Honey",
    "district": "Kanniyakumari",
    "state": "Tamil Nadu",
    "type": "Commerce Town Hub",
    "pincode": "629165",
    "lat": 8.3167,
    "lng": 77.1833,
    "radius_km": 7.5,
    "approx_area_sqkm": 176.7,
    "plus_code": "6JWV858M+M8",
    "admin_code": "TN-GEO-0142",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.25159,
            8.3167
          ],
          [
            77.24639,
            8.34256
          ],
          [
            77.23159,
            8.36448
          ],
          [
            77.20943,
            8.37912
          ],
          [
            77.1833,
            8.38427
          ],
          [
            77.15717,
            8.37912
          ],
          [
            77.13501,
            8.36448
          ],
          [
            77.12021,
            8.34256
          ],
          [
            77.11501,
            8.3167
          ],
          [
            77.12021,
            8.29084
          ],
          [
            77.13501,
            8.26892
          ],
          [
            77.15717,
            8.25428
          ],
          [
            77.1833,
            8.24913
          ],
          [
            77.20943,
            8.25428
          ],
          [
            77.23159,
            8.26892
          ],
          [
            77.24639,
            8.29084
          ],
          [
            77.25159,
            8.3167
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-KAN-06",
    "name": "Agastheeswaram Coastal Salt",
    "district": "Kanniyakumari",
    "state": "Tamil Nadu",
    "type": "Farming & Salt Village",
    "pincode": "629701",
    "lat": 8.1333,
    "lng": 77.5167,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "6JWV4GM8+8M",
    "admin_code": "TN-GEO-0143",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.5895,
            8.1333
          ],
          [
            77.58396,
            8.16088
          ],
          [
            77.56818,
            8.18426
          ],
          [
            77.54456,
            8.19989
          ],
          [
            77.5167,
            8.20537
          ],
          [
            77.48884,
            8.19989
          ],
          [
            77.46522,
            8.18426
          ],
          [
            77.44944,
            8.16088
          ],
          [
            77.4439,
            8.1333
          ],
          [
            77.44944,
            8.10572
          ],
          [
            77.46522,
            8.08234
          ],
          [
            77.48884,
            8.06671
          ],
          [
            77.5167,
            8.06123
          ],
          [
            77.54456,
            8.06671
          ],
          [
            77.56818,
            8.08234
          ],
          [
            77.58396,
            8.10572
          ],
          [
            77.5895,
            8.1333
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-THA-01",
    "name": "Thanjavur Big Temple Core",
    "district": "Thanjavur",
    "state": "Tamil Nadu",
    "type": "Chola Heritage Core",
    "pincode": "613001",
    "lat": 10.787,
    "lng": 79.1378,
    "radius_km": 7.5,
    "approx_area_sqkm": 176.7,
    "plus_code": "7J2XQ4PQ+R4",
    "admin_code": "TN-GEO-0144",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.20658,
            10.787
          ],
          [
            79.20135,
            10.81286
          ],
          [
            79.18644,
            10.83478
          ],
          [
            79.16412,
            10.84942
          ],
          [
            79.1378,
            10.85457
          ],
          [
            79.11148,
            10.84942
          ],
          [
            79.08916,
            10.83478
          ],
          [
            79.07425,
            10.81286
          ],
          [
            79.06902,
            10.787
          ],
          [
            79.07425,
            10.76114
          ],
          [
            79.08916,
            10.73922
          ],
          [
            79.11148,
            10.72458
          ],
          [
            79.1378,
            10.71943
          ],
          [
            79.16412,
            10.72458
          ],
          [
            79.18644,
            10.73922
          ],
          [
            79.20135,
            10.76114
          ],
          [
            79.20658,
            10.787
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-THA-02",
    "name": "Kumbakonam City of Temples",
    "district": "Thanjavur",
    "state": "Tamil Nadu",
    "type": "Brassware & Pilgrim City",
    "pincode": "612001",
    "lat": 10.9602,
    "lng": 79.3845,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J2XX96M+3R",
    "admin_code": "TN-GEO-0145",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.45791,
            10.9602
          ],
          [
            79.45232,
            10.98778
          ],
          [
            79.43641,
            11.01116
          ],
          [
            79.41259,
            11.02679
          ],
          [
            79.3845,
            11.03227
          ],
          [
            79.35641,
            11.02679
          ],
          [
            79.33259,
            11.01116
          ],
          [
            79.31668,
            10.98778
          ],
          [
            79.31109,
            10.9602
          ],
          [
            79.31668,
            10.93262
          ],
          [
            79.33259,
            10.90924
          ],
          [
            79.35641,
            10.89361
          ],
          [
            79.3845,
            10.88813
          ],
          [
            79.41259,
            10.89361
          ],
          [
            79.43641,
            10.90924
          ],
          [
            79.45232,
            10.93262
          ],
          [
            79.45791,
            10.9602
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-THA-03",
    "name": "Pattukkottai Coconut Coast",
    "district": "Thanjavur",
    "state": "Tamil Nadu",
    "type": "Coir & Agro Town Zone",
    "pincode": "614601",
    "lat": 10.4333,
    "lng": 79.3167,
    "radius_km": 9,
    "approx_area_sqkm": 254.5,
    "plus_code": "7J2XC8M8+8M",
    "admin_code": "TN-GEO-0146",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.39914,
            10.4333
          ],
          [
            79.39287,
            10.46433
          ],
          [
            79.375,
            10.49063
          ],
          [
            79.34825,
            10.50821
          ],
          [
            79.3167,
            10.51438
          ],
          [
            79.28515,
            10.50821
          ],
          [
            79.2584,
            10.49063
          ],
          [
            79.24053,
            10.46433
          ],
          [
            79.23426,
            10.4333
          ],
          [
            79.24053,
            10.40227
          ],
          [
            79.2584,
            10.37597
          ],
          [
            79.28515,
            10.35839
          ],
          [
            79.3167,
            10.35222
          ],
          [
            79.34825,
            10.35839
          ],
          [
            79.375,
            10.37597
          ],
          [
            79.39287,
            10.40227
          ],
          [
            79.39914,
            10.4333
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-THA-04",
    "name": "Thiruvaiyaru Music Capital",
    "district": "Thanjavur",
    "state": "Tamil Nadu",
    "type": "Cauvery Cultural Village",
    "pincode": "613204",
    "lat": 10.8833,
    "lng": 79.1,
    "radius_km": 7.5,
    "approx_area_sqkm": 176.7,
    "plus_code": "7J2XV4M2+82",
    "admin_code": "TN-GEO-0147",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.16881,
            10.8833
          ],
          [
            79.16357,
            10.90916
          ],
          [
            79.14865,
            10.93108
          ],
          [
            79.12633,
            10.94572
          ],
          [
            79.1,
            10.95087
          ],
          [
            79.07367,
            10.94572
          ],
          [
            79.05135,
            10.93108
          ],
          [
            79.03643,
            10.90916
          ],
          [
            79.03119,
            10.8833
          ],
          [
            79.03643,
            10.85744
          ],
          [
            79.05135,
            10.83552
          ],
          [
            79.07367,
            10.82088
          ],
          [
            79.1,
            10.81573
          ],
          [
            79.12633,
            10.82088
          ],
          [
            79.14865,
            10.83552
          ],
          [
            79.16357,
            10.85744
          ],
          [
            79.16881,
            10.8833
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-THA-05",
    "name": "Orathanadu Paddy Hub",
    "district": "Thanjavur",
    "state": "Tamil Nadu",
    "type": "Delta Farming Village Hub",
    "pincode": "614625",
    "lat": 10.6333,
    "lng": 79.25,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J2XJ7M2+82",
    "admin_code": "TN-GEO-0148",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.32791,
            10.6333
          ],
          [
            79.32198,
            10.6626
          ],
          [
            79.30509,
            10.68745
          ],
          [
            79.27982,
            10.70405
          ],
          [
            79.25,
            10.70988
          ],
          [
            79.22018,
            10.70405
          ],
          [
            79.19491,
            10.68745
          ],
          [
            79.17802,
            10.6626
          ],
          [
            79.17209,
            10.6333
          ],
          [
            79.17802,
            10.604
          ],
          [
            79.19491,
            10.57915
          ],
          [
            79.22018,
            10.56255
          ],
          [
            79.25,
            10.55672
          ],
          [
            79.27982,
            10.56255
          ],
          [
            79.30509,
            10.57915
          ],
          [
            79.32198,
            10.604
          ],
          [
            79.32791,
            10.6333
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-THA-06",
    "name": "Peravurani Coastal Farms",
    "district": "Thanjavur",
    "state": "Tamil Nadu",
    "type": "Agricultural Village Zone",
    "pincode": "614804",
    "lat": 10.3,
    "lng": 79.1667,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J2X75X8+XM",
    "admin_code": "TN-GEO-0149",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.24453,
            10.3
          ],
          [
            79.23861,
            10.3293
          ],
          [
            79.22173,
            10.35415
          ],
          [
            79.19648,
            10.37075
          ],
          [
            79.1667,
            10.37658
          ],
          [
            79.13692,
            10.37075
          ],
          [
            79.11167,
            10.35415
          ],
          [
            79.09479,
            10.3293
          ],
          [
            79.08887,
            10.3
          ],
          [
            79.09479,
            10.2707
          ],
          [
            79.11167,
            10.24585
          ],
          [
            79.13692,
            10.22925
          ],
          [
            79.1667,
            10.22342
          ],
          [
            79.19648,
            10.22925
          ],
          [
            79.22173,
            10.24585
          ],
          [
            79.23861,
            10.2707
          ],
          [
            79.24453,
            10.3
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TIR-01",
    "name": "Tiruvarur Chariot City Core",
    "district": "Tiruvarur",
    "state": "Tamil Nadu",
    "type": "Temple City Core",
    "pincode": "610001",
    "lat": 10.7719,
    "lng": 79.6368,
    "radius_km": 7.5,
    "approx_area_sqkm": 176.7,
    "plus_code": "7J2XQJCP+QP",
    "admin_code": "TN-GEO-0150",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.70558,
            10.7719
          ],
          [
            79.70034,
            10.79776
          ],
          [
            79.68543,
            10.81968
          ],
          [
            79.66312,
            10.83432
          ],
          [
            79.6368,
            10.83947
          ],
          [
            79.61048,
            10.83432
          ],
          [
            79.58817,
            10.81968
          ],
          [
            79.57326,
            10.79776
          ],
          [
            79.56802,
            10.7719
          ],
          [
            79.57326,
            10.74604
          ],
          [
            79.58817,
            10.72412
          ],
          [
            79.61048,
            10.70948
          ],
          [
            79.6368,
            10.70433
          ],
          [
            79.66312,
            10.70948
          ],
          [
            79.68543,
            10.72412
          ],
          [
            79.70034,
            10.74604
          ],
          [
            79.70558,
            10.7719
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TIR-02",
    "name": "Mannargudi Rajagopalan Hub",
    "district": "Tiruvarur",
    "state": "Tamil Nadu",
    "type": "Delta Town Zone",
    "pincode": "614001",
    "lat": 10.6667,
    "lng": 79.45,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J2XMC8X+MX",
    "admin_code": "TN-GEO-0151",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.52792,
            10.6667
          ],
          [
            79.52199,
            10.696
          ],
          [
            79.5051,
            10.72085
          ],
          [
            79.47982,
            10.73745
          ],
          [
            79.45,
            10.74328
          ],
          [
            79.42018,
            10.73745
          ],
          [
            79.3949,
            10.72085
          ],
          [
            79.37801,
            10.696
          ],
          [
            79.37208,
            10.6667
          ],
          [
            79.37801,
            10.6374
          ],
          [
            79.3949,
            10.61255
          ],
          [
            79.42018,
            10.59595
          ],
          [
            79.45,
            10.59012
          ],
          [
            79.47982,
            10.59595
          ],
          [
            79.5051,
            10.61255
          ],
          [
            79.52199,
            10.6374
          ],
          [
            79.52792,
            10.6667
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TIR-03",
    "name": "Thiruthuraipoondi Coastal Belt",
    "district": "Tiruvarur",
    "state": "Tamil Nadu",
    "type": "Paddy & Port Town",
    "pincode": "614713",
    "lat": 10.5333,
    "lng": 79.65,
    "radius_km": 9,
    "approx_area_sqkm": 254.5,
    "plus_code": "7J2XGJMX+8X",
    "admin_code": "TN-GEO-0152",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.73247,
            10.5333
          ],
          [
            79.72619,
            10.56433
          ],
          [
            79.70832,
            10.59063
          ],
          [
            79.68156,
            10.60821
          ],
          [
            79.65,
            10.61438
          ],
          [
            79.61844,
            10.60821
          ],
          [
            79.59168,
            10.59063
          ],
          [
            79.57381,
            10.56433
          ],
          [
            79.56753,
            10.5333
          ],
          [
            79.57381,
            10.50227
          ],
          [
            79.59168,
            10.47597
          ],
          [
            79.61844,
            10.45839
          ],
          [
            79.65,
            10.45222
          ],
          [
            79.68156,
            10.45839
          ],
          [
            79.70832,
            10.47597
          ],
          [
            79.72619,
            10.50227
          ],
          [
            79.73247,
            10.5333
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TIR-04",
    "name": "Kudavasal Handloom Village",
    "district": "Tiruvarur",
    "state": "Tamil Nadu",
    "type": "Delta Village Hub",
    "pincode": "612601",
    "lat": 10.8667,
    "lng": 79.4833,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J2XVF8M+M8",
    "admin_code": "TN-GEO-0153",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.55669,
            10.8667
          ],
          [
            79.5511,
            10.89428
          ],
          [
            79.53519,
            10.91766
          ],
          [
            79.51138,
            10.93329
          ],
          [
            79.4833,
            10.93877
          ],
          [
            79.45522,
            10.93329
          ],
          [
            79.43141,
            10.91766
          ],
          [
            79.4155,
            10.89428
          ],
          [
            79.40991,
            10.8667
          ],
          [
            79.4155,
            10.83912
          ],
          [
            79.43141,
            10.81574
          ],
          [
            79.45522,
            10.80011
          ],
          [
            79.4833,
            10.79463
          ],
          [
            79.51138,
            10.80011
          ],
          [
            79.53519,
            10.81574
          ],
          [
            79.5511,
            10.83912
          ],
          [
            79.55669,
            10.8667
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TIR-05",
    "name": "Muthupet Mangrove Lagoon",
    "district": "Tiruvarur",
    "state": "Tamil Nadu",
    "type": "Eco Wetland Village Zone",
    "pincode": "614704",
    "lat": 10.4,
    "lng": 79.5,
    "radius_km": 9.5,
    "approx_area_sqkm": 283.5,
    "plus_code": "7J2XCG22+22",
    "admin_code": "TN-GEO-0154",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.58702,
            10.4
          ],
          [
            79.58039,
            10.43275
          ],
          [
            79.56153,
            10.46052
          ],
          [
            79.5333,
            10.47907
          ],
          [
            79.5,
            10.48559
          ],
          [
            79.4667,
            10.47907
          ],
          [
            79.43847,
            10.46052
          ],
          [
            79.41961,
            10.43275
          ],
          [
            79.41298,
            10.4
          ],
          [
            79.41961,
            10.36725
          ],
          [
            79.43847,
            10.33948
          ],
          [
            79.4667,
            10.32093
          ],
          [
            79.5,
            10.31441
          ],
          [
            79.5333,
            10.32093
          ],
          [
            79.56153,
            10.33948
          ],
          [
            79.58039,
            10.36725
          ],
          [
            79.58702,
            10.4
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-NAG-01",
    "name": "Nagapattinam Port City Core",
    "district": "Nagapattinam",
    "state": "Tamil Nadu",
    "type": "Harbor City Core",
    "pincode": "611001",
    "lat": 10.7656,
    "lng": 79.8424,
    "radius_km": 7.5,
    "approx_area_sqkm": 176.7,
    "plus_code": "7J2XQR8R+6X",
    "admin_code": "TN-GEO-0155",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.91118,
            10.7656
          ],
          [
            79.90594,
            10.79146
          ],
          [
            79.89103,
            10.81338
          ],
          [
            79.86872,
            10.82802
          ],
          [
            79.8424,
            10.83317
          ],
          [
            79.81608,
            10.82802
          ],
          [
            79.79377,
            10.81338
          ],
          [
            79.77886,
            10.79146
          ],
          [
            79.77362,
            10.7656
          ],
          [
            79.77886,
            10.73974
          ],
          [
            79.79377,
            10.71782
          ],
          [
            79.81608,
            10.70318
          ],
          [
            79.8424,
            10.69803
          ],
          [
            79.86872,
            10.70318
          ],
          [
            79.89103,
            10.71782
          ],
          [
            79.90594,
            10.73974
          ],
          [
            79.91118,
            10.7656
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-NAG-02",
    "name": "Velankanni Basilica Coastal Hub",
    "district": "Nagapattinam",
    "state": "Tamil Nadu",
    "type": "International Pilgrim Town",
    "pincode": "611111",
    "lat": 10.6811,
    "lng": 79.8492,
    "radius_km": 7,
    "approx_area_sqkm": 153.9,
    "plus_code": "7J2XMRJX+CM",
    "admin_code": "TN-GEO-0156",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.91337,
            10.6811
          ],
          [
            79.90849,
            10.70523
          ],
          [
            79.89458,
            10.72569
          ],
          [
            79.87376,
            10.73936
          ],
          [
            79.8492,
            10.74416
          ],
          [
            79.82464,
            10.73936
          ],
          [
            79.80382,
            10.72569
          ],
          [
            79.78991,
            10.70523
          ],
          [
            79.78503,
            10.6811
          ],
          [
            79.78991,
            10.65697
          ],
          [
            79.80382,
            10.63651
          ],
          [
            79.82464,
            10.62284
          ],
          [
            79.8492,
            10.61804
          ],
          [
            79.87376,
            10.62284
          ],
          [
            79.89458,
            10.63651
          ],
          [
            79.90849,
            10.65697
          ],
          [
            79.91337,
            10.6811
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-NAG-03",
    "name": "Vedaranyam Salt & Sanctuary",
    "district": "Nagapattinam",
    "state": "Tamil Nadu",
    "type": "Coastal Salt Town Zone",
    "pincode": "614810",
    "lat": 10.37,
    "lng": 79.85,
    "radius_km": 9.5,
    "approx_area_sqkm": 283.5,
    "plus_code": "7J2X9VC2+22",
    "admin_code": "TN-GEO-0157",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.93701,
            10.37
          ],
          [
            79.93038,
            10.40275
          ],
          [
            79.91152,
            10.43052
          ],
          [
            79.8833,
            10.44907
          ],
          [
            79.85,
            10.45559
          ],
          [
            79.8167,
            10.44907
          ],
          [
            79.78848,
            10.43052
          ],
          [
            79.76962,
            10.40275
          ],
          [
            79.76299,
            10.37
          ],
          [
            79.76962,
            10.33725
          ],
          [
            79.78848,
            10.30948
          ],
          [
            79.8167,
            10.29093
          ],
          [
            79.85,
            10.28441
          ],
          [
            79.8833,
            10.29093
          ],
          [
            79.91152,
            10.30948
          ],
          [
            79.93038,
            10.33725
          ],
          [
            79.93701,
            10.37
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-NAG-04",
    "name": "Kilvelur Delta Fields",
    "district": "Nagapattinam",
    "state": "Tamil Nadu",
    "type": "Agro Farming Village Zone",
    "pincode": "611104",
    "lat": 10.7,
    "lng": 79.7333,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J2XPP2M+28",
    "admin_code": "TN-GEO-0158",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.81123,
            10.7
          ],
          [
            79.8053,
            10.7293
          ],
          [
            79.78841,
            10.75415
          ],
          [
            79.76312,
            10.77075
          ],
          [
            79.7333,
            10.77658
          ],
          [
            79.70348,
            10.77075
          ],
          [
            79.67819,
            10.75415
          ],
          [
            79.6613,
            10.7293
          ],
          [
            79.65537,
            10.7
          ],
          [
            79.6613,
            10.6707
          ],
          [
            79.67819,
            10.64585
          ],
          [
            79.70348,
            10.62925
          ],
          [
            79.7333,
            10.62342
          ],
          [
            79.76312,
            10.62925
          ],
          [
            79.78841,
            10.64585
          ],
          [
            79.8053,
            10.6707
          ],
          [
            79.81123,
            10.7
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-NAG-05",
    "name": "Thirukuvalai Historical Village",
    "district": "Nagapattinam",
    "state": "Tamil Nadu",
    "type": "Rural Village Cluster",
    "pincode": "610205",
    "lat": 10.6167,
    "lng": 79.7167,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J2XJP88+MM",
    "admin_code": "TN-GEO-0159",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.79003,
            10.6167
          ],
          [
            79.78445,
            10.64428
          ],
          [
            79.76855,
            10.66766
          ],
          [
            79.74476,
            10.68329
          ],
          [
            79.7167,
            10.68877
          ],
          [
            79.68864,
            10.68329
          ],
          [
            79.66485,
            10.66766
          ],
          [
            79.64895,
            10.64428
          ],
          [
            79.64337,
            10.6167
          ],
          [
            79.64895,
            10.58912
          ],
          [
            79.66485,
            10.56574
          ],
          [
            79.68864,
            10.55011
          ],
          [
            79.7167,
            10.54463
          ],
          [
            79.74476,
            10.55011
          ],
          [
            79.76855,
            10.56574
          ],
          [
            79.78445,
            10.58912
          ],
          [
            79.79003,
            10.6167
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-PUD-01",
    "name": "Pudukkottai Princely Heritage",
    "district": "Pudukkottai",
    "state": "Tamil Nadu",
    "type": "District HQ Core",
    "pincode": "622001",
    "lat": 10.3833,
    "lng": 78.8001,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J2W9RM2+82",
    "admin_code": "TN-GEO-0160",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.87337,
            10.3833
          ],
          [
            78.86779,
            10.41088
          ],
          [
            78.85191,
            10.43426
          ],
          [
            78.82814,
            10.44989
          ],
          [
            78.8001,
            10.45537
          ],
          [
            78.77206,
            10.44989
          ],
          [
            78.74829,
            10.43426
          ],
          [
            78.73241,
            10.41088
          ],
          [
            78.72683,
            10.3833
          ],
          [
            78.73241,
            10.35572
          ],
          [
            78.74829,
            10.33234
          ],
          [
            78.77206,
            10.31671
          ],
          [
            78.8001,
            10.31123
          ],
          [
            78.82814,
            10.31671
          ],
          [
            78.85191,
            10.33234
          ],
          [
            78.86779,
            10.35572
          ],
          [
            78.87337,
            10.3833
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-PUD-02",
    "name": "Aranthangi Coastal Market",
    "district": "Pudukkottai",
    "state": "Tamil Nadu",
    "type": "Commercial Town Hub",
    "pincode": "614616",
    "lat": 10.1667,
    "lng": 78.9833,
    "radius_km": 9,
    "approx_area_sqkm": 254.5,
    "plus_code": "7J2W5X8M+M8",
    "admin_code": "TN-GEO-0161",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.06567,
            10.1667
          ],
          [
            79.0594,
            10.19773
          ],
          [
            79.04155,
            10.22403
          ],
          [
            79.01482,
            10.24161
          ],
          [
            78.9833,
            10.24778
          ],
          [
            78.95178,
            10.24161
          ],
          [
            78.92505,
            10.22403
          ],
          [
            78.9072,
            10.19773
          ],
          [
            78.90093,
            10.1667
          ],
          [
            78.9072,
            10.13567
          ],
          [
            78.92505,
            10.10937
          ],
          [
            78.95178,
            10.09179
          ],
          [
            78.9833,
            10.08562
          ],
          [
            79.01482,
            10.09179
          ],
          [
            79.04155,
            10.10937
          ],
          [
            79.0594,
            10.13567
          ],
          [
            79.06567,
            10.1667
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-PUD-03",
    "name": "Viralimalai Peacock & Auto Hub",
    "district": "Pudukkottai",
    "state": "Tamil Nadu",
    "type": "Industrial Town Zone",
    "pincode": "621316",
    "lat": 10.6,
    "lng": 78.5333,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J2WHGXM+X8",
    "admin_code": "TN-GEO-0162",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.61121,
            10.6
          ],
          [
            78.60528,
            10.6293
          ],
          [
            78.58839,
            10.65415
          ],
          [
            78.56311,
            10.67075
          ],
          [
            78.5333,
            10.67658
          ],
          [
            78.50349,
            10.67075
          ],
          [
            78.47821,
            10.65415
          ],
          [
            78.46132,
            10.6293
          ],
          [
            78.45539,
            10.6
          ],
          [
            78.46132,
            10.5707
          ],
          [
            78.47821,
            10.54585
          ],
          [
            78.50349,
            10.52925
          ],
          [
            78.5333,
            10.52342
          ],
          [
            78.56311,
            10.52925
          ],
          [
            78.58839,
            10.54585
          ],
          [
            78.60528,
            10.5707
          ],
          [
            78.61121,
            10.6
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-PUD-04",
    "name": "Alangudi Jasmine & Groundnut",
    "district": "Pudukkottai",
    "state": "Tamil Nadu",
    "type": "Agro Village Hub",
    "pincode": "622301",
    "lat": 10.3667,
    "lng": 78.9833,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J2W9X8M+M8",
    "admin_code": "TN-GEO-0163",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.06115,
            10.3667
          ],
          [
            79.05522,
            10.396
          ],
          [
            79.03835,
            10.42085
          ],
          [
            79.01309,
            10.43745
          ],
          [
            78.9833,
            10.44328
          ],
          [
            78.95351,
            10.43745
          ],
          [
            78.92825,
            10.42085
          ],
          [
            78.91138,
            10.396
          ],
          [
            78.90545,
            10.3667
          ],
          [
            78.91138,
            10.3374
          ],
          [
            78.92825,
            10.31255
          ],
          [
            78.95351,
            10.29595
          ],
          [
            78.9833,
            10.29012
          ],
          [
            79.01309,
            10.29595
          ],
          [
            79.03835,
            10.31255
          ],
          [
            79.05522,
            10.3374
          ],
          [
            79.06115,
            10.3667
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-PUD-05",
    "name": "Gandarvakottai Cashew Belt",
    "district": "Pudukkottai",
    "state": "Tamil Nadu",
    "type": "Plantation Village Zone",
    "pincode": "613301",
    "lat": 10.5833,
    "lng": 79.0167,
    "radius_km": 9,
    "approx_area_sqkm": 254.5,
    "plus_code": "7J2XH2M8+8M",
    "admin_code": "TN-GEO-0164",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.09918,
            10.5833
          ],
          [
            79.09291,
            10.61433
          ],
          [
            79.07503,
            10.64063
          ],
          [
            79.04827,
            10.65821
          ],
          [
            79.0167,
            10.66438
          ],
          [
            78.98513,
            10.65821
          ],
          [
            78.95837,
            10.64063
          ],
          [
            78.94049,
            10.61433
          ],
          [
            78.93422,
            10.5833
          ],
          [
            78.94049,
            10.55227
          ],
          [
            78.95837,
            10.52597
          ],
          [
            78.98513,
            10.50839
          ],
          [
            79.0167,
            10.50222
          ],
          [
            79.04827,
            10.50839
          ],
          [
            79.07503,
            10.52597
          ],
          [
            79.09291,
            10.55227
          ],
          [
            79.09918,
            10.5833
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-PUD-06",
    "name": "Avudaiyarkoil Ancient Temple",
    "district": "Pudukkottai",
    "state": "Tamil Nadu",
    "type": "Heritage Village Cluster",
    "pincode": "614618",
    "lat": 10.0667,
    "lng": 79.0333,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J2X328M+M8",
    "admin_code": "TN-GEO-0165",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.11107,
            10.0667
          ],
          [
            79.10515,
            10.096
          ],
          [
            79.08829,
            10.12085
          ],
          [
            79.06306,
            10.13745
          ],
          [
            79.0333,
            10.14328
          ],
          [
            79.00354,
            10.13745
          ],
          [
            78.97831,
            10.12085
          ],
          [
            78.96145,
            10.096
          ],
          [
            78.95553,
            10.0667
          ],
          [
            78.96145,
            10.0374
          ],
          [
            78.97831,
            10.01255
          ],
          [
            79.00354,
            9.99595
          ],
          [
            79.0333,
            9.99012
          ],
          [
            79.06306,
            9.99595
          ],
          [
            79.08829,
            10.01255
          ],
          [
            79.10515,
            10.0374
          ],
          [
            79.11107,
            10.0667
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-CUD-01",
    "name": "Cuddalore Port & Old Town",
    "district": "Cuddalore",
    "state": "Tamil Nadu",
    "type": "Coastal Industrial Core",
    "pincode": "607001",
    "lat": 11.748,
    "lng": 79.7714,
    "radius_km": 7.5,
    "approx_area_sqkm": 176.7,
    "plus_code": "7J3XPQXC+6H",
    "admin_code": "TN-GEO-0166",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.84041,
            11.748
          ],
          [
            79.83516,
            11.77386
          ],
          [
            79.8202,
            11.79578
          ],
          [
            79.79781,
            11.81042
          ],
          [
            79.7714,
            11.81557
          ],
          [
            79.74499,
            11.81042
          ],
          [
            79.7226,
            11.79578
          ],
          [
            79.70764,
            11.77386
          ],
          [
            79.70239,
            11.748
          ],
          [
            79.70764,
            11.72214
          ],
          [
            79.7226,
            11.70022
          ],
          [
            79.74499,
            11.68558
          ],
          [
            79.7714,
            11.68043
          ],
          [
            79.79781,
            11.68558
          ],
          [
            79.8202,
            11.70022
          ],
          [
            79.83516,
            11.72214
          ],
          [
            79.84041,
            11.748
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-CUD-02",
    "name": "Chidambaram Nataraja City",
    "district": "Cuddalore",
    "state": "Tamil Nadu",
    "type": "Golden Temple City Hub",
    "pincode": "608001",
    "lat": 11.3992,
    "lng": 79.6936,
    "radius_km": 7.5,
    "approx_area_sqkm": 176.7,
    "plus_code": "7J3X9MXV+MC",
    "admin_code": "TN-GEO-0167",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.76253,
            11.3992
          ],
          [
            79.75728,
            11.42506
          ],
          [
            79.74234,
            11.44698
          ],
          [
            79.71998,
            11.46162
          ],
          [
            79.6936,
            11.46677
          ],
          [
            79.66722,
            11.46162
          ],
          [
            79.64486,
            11.44698
          ],
          [
            79.62992,
            11.42506
          ],
          [
            79.62467,
            11.3992
          ],
          [
            79.62992,
            11.37334
          ],
          [
            79.64486,
            11.35142
          ],
          [
            79.66722,
            11.33678
          ],
          [
            79.6936,
            11.33163
          ],
          [
            79.71998,
            11.33678
          ],
          [
            79.74234,
            11.35142
          ],
          [
            79.75728,
            11.37334
          ],
          [
            79.76253,
            11.3992
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-CUD-03",
    "name": "Panruti Jackfruit & Cashew Hub",
    "district": "Cuddalore",
    "state": "Tamil Nadu",
    "type": "Trading Town Zone",
    "pincode": "607106",
    "lat": 11.7667,
    "lng": 79.55,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J3XQH82+M2",
    "admin_code": "TN-GEO-0168",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.62362,
            11.7667
          ],
          [
            79.61802,
            11.79428
          ],
          [
            79.60206,
            11.81766
          ],
          [
            79.57817,
            11.83329
          ],
          [
            79.55,
            11.83877
          ],
          [
            79.52183,
            11.83329
          ],
          [
            79.49794,
            11.81766
          ],
          [
            79.48198,
            11.79428
          ],
          [
            79.47638,
            11.7667
          ],
          [
            79.48198,
            11.73912
          ],
          [
            79.49794,
            11.71574
          ],
          [
            79.52183,
            11.70011
          ],
          [
            79.55,
            11.69463
          ],
          [
            79.57817,
            11.70011
          ],
          [
            79.60206,
            11.71574
          ],
          [
            79.61802,
            11.73912
          ],
          [
            79.62362,
            11.7667
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-CUD-04",
    "name": "Neyveli Lignite Power City",
    "district": "Cuddalore",
    "state": "Tamil Nadu",
    "type": "Mega Industrial Township",
    "pincode": "607801",
    "lat": 11.5975,
    "lng": 79.4864,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J3XHFWP+XH",
    "admin_code": "TN-GEO-0169",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.56457,
            11.5975
          ],
          [
            79.55862,
            11.6268
          ],
          [
            79.54168,
            11.65165
          ],
          [
            79.51632,
            11.66825
          ],
          [
            79.4864,
            11.67408
          ],
          [
            79.45648,
            11.66825
          ],
          [
            79.43112,
            11.65165
          ],
          [
            79.41418,
            11.6268
          ],
          [
            79.40823,
            11.5975
          ],
          [
            79.41418,
            11.5682
          ],
          [
            79.43112,
            11.54335
          ],
          [
            79.45648,
            11.52675
          ],
          [
            79.4864,
            11.52092
          ],
          [
            79.51632,
            11.52675
          ],
          [
            79.54168,
            11.54335
          ],
          [
            79.55862,
            11.5682
          ],
          [
            79.56457,
            11.5975
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-CUD-05",
    "name": "Virudhachalam Ceramic City",
    "district": "Cuddalore",
    "state": "Tamil Nadu",
    "type": "Railway & Craft Town Zone",
    "pincode": "606001",
    "lat": 11.5,
    "lng": 79.3333,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J3XG82M+28",
    "admin_code": "TN-GEO-0170",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.41145,
            11.5
          ],
          [
            79.4055,
            11.5293
          ],
          [
            79.38856,
            11.55415
          ],
          [
            79.3632,
            11.57075
          ],
          [
            79.3333,
            11.57658
          ],
          [
            79.3034,
            11.57075
          ],
          [
            79.27804,
            11.55415
          ],
          [
            79.2611,
            11.5293
          ],
          [
            79.25515,
            11.5
          ],
          [
            79.2611,
            11.4707
          ],
          [
            79.27804,
            11.44585
          ],
          [
            79.3034,
            11.42925
          ],
          [
            79.3333,
            11.42342
          ],
          [
            79.3632,
            11.42925
          ],
          [
            79.38856,
            11.44585
          ],
          [
            79.4055,
            11.4707
          ],
          [
            79.41145,
            11.5
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-CUD-06",
    "name": "Kattumannarkoil Lake Belt",
    "district": "Cuddalore",
    "state": "Tamil Nadu",
    "type": "Veeranam Basin Village Zone",
    "pincode": "608301",
    "lat": 11.2667,
    "lng": 79.55,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J3X7H82+M2",
    "admin_code": "TN-GEO-0171",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.62808,
            11.2667
          ],
          [
            79.62214,
            11.296
          ],
          [
            79.60521,
            11.32085
          ],
          [
            79.57988,
            11.33745
          ],
          [
            79.55,
            11.34328
          ],
          [
            79.52012,
            11.33745
          ],
          [
            79.49479,
            11.32085
          ],
          [
            79.47786,
            11.296
          ],
          [
            79.47192,
            11.2667
          ],
          [
            79.47786,
            11.2374
          ],
          [
            79.49479,
            11.21255
          ],
          [
            79.52012,
            11.19595
          ],
          [
            79.55,
            11.19012
          ],
          [
            79.57988,
            11.19595
          ],
          [
            79.60521,
            11.21255
          ],
          [
            79.62214,
            11.2374
          ],
          [
            79.62808,
            11.2667
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-CUD-07",
    "name": "Tittakudi River Belt",
    "district": "Cuddalore",
    "state": "Tamil Nadu",
    "type": "Farming Village Cluster",
    "pincode": "606106",
    "lat": 11.4167,
    "lng": 78.9833,
    "radius_km": 9,
    "approx_area_sqkm": 254.5,
    "plus_code": "7J3WCX8M+M8",
    "admin_code": "TN-GEO-0172",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.06602,
            11.4167
          ],
          [
            79.05972,
            11.44773
          ],
          [
            79.04179,
            11.47403
          ],
          [
            79.01495,
            11.49161
          ],
          [
            78.9833,
            11.49778
          ],
          [
            78.95165,
            11.49161
          ],
          [
            78.92481,
            11.47403
          ],
          [
            78.90688,
            11.44773
          ],
          [
            78.90058,
            11.4167
          ],
          [
            78.90688,
            11.38567
          ],
          [
            78.92481,
            11.35937
          ],
          [
            78.95165,
            11.34179
          ],
          [
            78.9833,
            11.33562
          ],
          [
            79.01495,
            11.34179
          ],
          [
            79.04179,
            11.35937
          ],
          [
            79.05972,
            11.38567
          ],
          [
            79.06602,
            11.4167
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-VIL-01",
    "name": "Villupuram Railway Junction",
    "district": "Villupuram",
    "state": "Tamil Nadu",
    "type": "Transit City Core",
    "pincode": "605602",
    "lat": 11.9401,
    "lng": 79.4861,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J3XWFRP+2C",
    "admin_code": "TN-GEO-0173",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.55977,
            11.9401
          ],
          [
            79.55416,
            11.96768
          ],
          [
            79.53819,
            11.99106
          ],
          [
            79.51429,
            12.00669
          ],
          [
            79.4861,
            12.01217
          ],
          [
            79.45791,
            12.00669
          ],
          [
            79.43401,
            11.99106
          ],
          [
            79.41804,
            11.96768
          ],
          [
            79.41243,
            11.9401
          ],
          [
            79.41804,
            11.91252
          ],
          [
            79.43401,
            11.88914
          ],
          [
            79.45791,
            11.87351
          ],
          [
            79.4861,
            11.86803
          ],
          [
            79.51429,
            11.87351
          ],
          [
            79.53819,
            11.88914
          ],
          [
            79.55416,
            11.91252
          ],
          [
            79.55977,
            11.9401
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-VIL-02",
    "name": "Tindivanam Highway Hub",
    "district": "Villupuram",
    "state": "Tamil Nadu",
    "type": "Cashew & Transit Town",
    "pincode": "604001",
    "lat": 12.2333,
    "lng": 79.65,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J4X6JMX+8X",
    "admin_code": "TN-GEO-0174",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.72836,
            12.2333
          ],
          [
            79.72239,
            12.2626
          ],
          [
            79.70541,
            12.28745
          ],
          [
            79.67999,
            12.30405
          ],
          [
            79.65,
            12.30988
          ],
          [
            79.62001,
            12.30405
          ],
          [
            79.59459,
            12.28745
          ],
          [
            79.57761,
            12.2626
          ],
          [
            79.57164,
            12.2333
          ],
          [
            79.57761,
            12.204
          ],
          [
            79.59459,
            12.17915
          ],
          [
            79.62001,
            12.16255
          ],
          [
            79.65,
            12.15672
          ],
          [
            79.67999,
            12.16255
          ],
          [
            79.70541,
            12.17915
          ],
          [
            79.72239,
            12.204
          ],
          [
            79.72836,
            12.2333
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-VIL-03",
    "name": "Gingee Fort of Troy",
    "district": "Villupuram",
    "state": "Tamil Nadu",
    "type": "Heritage Fortress Town",
    "pincode": "604202",
    "lat": 12.25,
    "lng": 79.4167,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J4X7C28+2M",
    "admin_code": "TN-GEO-0175",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.49506,
            12.25
          ],
          [
            79.4891,
            12.2793
          ],
          [
            79.47211,
            12.30415
          ],
          [
            79.44669,
            12.32075
          ],
          [
            79.4167,
            12.32658
          ],
          [
            79.38671,
            12.32075
          ],
          [
            79.36129,
            12.30415
          ],
          [
            79.3443,
            12.2793
          ],
          [
            79.33834,
            12.25
          ],
          [
            79.3443,
            12.2207
          ],
          [
            79.36129,
            12.19585
          ],
          [
            79.38671,
            12.17925
          ],
          [
            79.4167,
            12.17342
          ],
          [
            79.44669,
            12.17925
          ],
          [
            79.47211,
            12.19585
          ],
          [
            79.4891,
            12.2207
          ],
          [
            79.49506,
            12.25
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-VIL-04",
    "name": "Vanur / Auroville Peri-Urban",
    "district": "Villupuram",
    "state": "Tamil Nadu",
    "type": "Ecological Village Zone",
    "pincode": "605109",
    "lat": 12.0167,
    "lng": 79.7333,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J4X2P8M+M8",
    "admin_code": "TN-GEO-0176",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.80699,
            12.0167
          ],
          [
            79.80138,
            12.04428
          ],
          [
            79.7854,
            12.06766
          ],
          [
            79.7615,
            12.08329
          ],
          [
            79.7333,
            12.08877
          ],
          [
            79.7051,
            12.08329
          ],
          [
            79.6812,
            12.06766
          ],
          [
            79.66522,
            12.04428
          ],
          [
            79.65961,
            12.0167
          ],
          [
            79.66522,
            11.98912
          ],
          [
            79.6812,
            11.96574
          ],
          [
            79.7051,
            11.95011
          ],
          [
            79.7333,
            11.94463
          ],
          [
            79.7615,
            11.95011
          ],
          [
            79.7854,
            11.96574
          ],
          [
            79.80138,
            11.98912
          ],
          [
            79.80699,
            12.0167
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-VIL-05",
    "name": "Vikravandi Toll & Logistics",
    "district": "Villupuram",
    "state": "Tamil Nadu",
    "type": "Logistics Village Hub",
    "pincode": "605652",
    "lat": 12.0333,
    "lng": 79.55,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J4X2HM2+82",
    "admin_code": "TN-GEO-0177",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.62369,
            12.0333
          ],
          [
            79.61808,
            12.06088
          ],
          [
            79.60211,
            12.08426
          ],
          [
            79.5782,
            12.09989
          ],
          [
            79.55,
            12.10537
          ],
          [
            79.5218,
            12.09989
          ],
          [
            79.49789,
            12.08426
          ],
          [
            79.48192,
            12.06088
          ],
          [
            79.47631,
            12.0333
          ],
          [
            79.48192,
            12.00572
          ],
          [
            79.49789,
            11.98234
          ],
          [
            79.5218,
            11.96671
          ],
          [
            79.55,
            11.96123
          ],
          [
            79.5782,
            11.96671
          ],
          [
            79.60211,
            11.98234
          ],
          [
            79.61808,
            12.00572
          ],
          [
            79.62369,
            12.0333
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-VIL-06",
    "name": "Marakkanam Salt Coast",
    "district": "Villupuram",
    "state": "Tamil Nadu",
    "type": "Salt & Fishery Village Zone",
    "pincode": "604303",
    "lat": 12.2,
    "lng": 79.95,
    "radius_km": 9,
    "approx_area_sqkm": 254.5,
    "plus_code": "7J4X6W2X+2X",
    "admin_code": "TN-GEO-0178",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.03295,
            12.2
          ],
          [
            80.02664,
            12.23103
          ],
          [
            80.00866,
            12.25733
          ],
          [
            79.98175,
            12.27491
          ],
          [
            79.95,
            12.28108
          ],
          [
            79.91825,
            12.27491
          ],
          [
            79.89134,
            12.25733
          ],
          [
            79.87336,
            12.23103
          ],
          [
            79.86705,
            12.2
          ],
          [
            79.87336,
            12.16897
          ],
          [
            79.89134,
            12.14267
          ],
          [
            79.91825,
            12.12509
          ],
          [
            79.95,
            12.11892
          ],
          [
            79.98175,
            12.12509
          ],
          [
            80.00866,
            12.14267
          ],
          [
            80.02664,
            12.16897
          ],
          [
            80.03295,
            12.2
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-KAL-01",
    "name": "Kallakurichi Rice Bowl City",
    "district": "Kallakurichi",
    "state": "Tamil Nadu",
    "type": "District HQ Core",
    "pincode": "606202",
    "lat": 11.7381,
    "lng": 78.9639,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J3WPXQ7+6H",
    "admin_code": "TN-GEO-0179",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.03751,
            11.7381
          ],
          [
            79.03191,
            11.76568
          ],
          [
            79.01595,
            11.78906
          ],
          [
            78.99207,
            11.80469
          ],
          [
            78.9639,
            11.81017
          ],
          [
            78.93573,
            11.80469
          ],
          [
            78.91185,
            11.78906
          ],
          [
            78.89589,
            11.76568
          ],
          [
            78.89029,
            11.7381
          ],
          [
            78.89589,
            11.71052
          ],
          [
            78.91185,
            11.68714
          ],
          [
            78.93573,
            11.67151
          ],
          [
            78.9639,
            11.66603
          ],
          [
            78.99207,
            11.67151
          ],
          [
            79.01595,
            11.68714
          ],
          [
            79.03191,
            11.71052
          ],
          [
            79.03751,
            11.7381
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-KAL-02",
    "name": "Ulundurpet Tollway Junction",
    "district": "Kallakurichi",
    "state": "Tamil Nadu",
    "type": "Transit Mega Town Zone",
    "pincode": "606107",
    "lat": 11.6833,
    "lng": 79.2833,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J3XM7MM+88",
    "admin_code": "TN-GEO-0180",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.3569,
            11.6833
          ],
          [
            79.35129,
            11.71088
          ],
          [
            79.33534,
            11.73426
          ],
          [
            79.31146,
            11.74989
          ],
          [
            79.2833,
            11.75537
          ],
          [
            79.25514,
            11.74989
          ],
          [
            79.23126,
            11.73426
          ],
          [
            79.21531,
            11.71088
          ],
          [
            79.2097,
            11.6833
          ],
          [
            79.21531,
            11.65572
          ],
          [
            79.23126,
            11.63234
          ],
          [
            79.25514,
            11.61671
          ],
          [
            79.2833,
            11.61123
          ],
          [
            79.31146,
            11.61671
          ],
          [
            79.33534,
            11.63234
          ],
          [
            79.35129,
            11.65572
          ],
          [
            79.3569,
            11.6833
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-KAL-03",
    "name": "Sankarapuram Foothills",
    "district": "Kallakurichi",
    "state": "Tamil Nadu",
    "type": "Agricultural Town Hub",
    "pincode": "606401",
    "lat": 11.8833,
    "lng": 78.9167,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J3WVWM8+8M",
    "admin_code": "TN-GEO-0181",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.99495,
            11.8833
          ],
          [
            78.989,
            11.9126
          ],
          [
            78.97203,
            11.93745
          ],
          [
            78.94665,
            11.95405
          ],
          [
            78.9167,
            11.95988
          ],
          [
            78.88675,
            11.95405
          ],
          [
            78.86137,
            11.93745
          ],
          [
            78.8444,
            11.9126
          ],
          [
            78.83845,
            11.8833
          ],
          [
            78.8444,
            11.854
          ],
          [
            78.86137,
            11.82915
          ],
          [
            78.88675,
            11.81255
          ],
          [
            78.9167,
            11.80672
          ],
          [
            78.94665,
            11.81255
          ],
          [
            78.97203,
            11.82915
          ],
          [
            78.989,
            11.854
          ],
          [
            78.99495,
            11.8833
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-KAL-04",
    "name": "Chinnasalem Modern Rice Mills",
    "district": "Kallakurichi",
    "state": "Tamil Nadu",
    "type": "Grain Processing Town",
    "pincode": "606201",
    "lat": 11.65,
    "lng": 78.8833,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J3WMV2M+28",
    "admin_code": "TN-GEO-0182",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.95689,
            11.65
          ],
          [
            78.95129,
            11.67758
          ],
          [
            78.93533,
            11.70096
          ],
          [
            78.91146,
            11.71659
          ],
          [
            78.8833,
            11.72207
          ],
          [
            78.85514,
            11.71659
          ],
          [
            78.83127,
            11.70096
          ],
          [
            78.81531,
            11.67758
          ],
          [
            78.80971,
            11.65
          ],
          [
            78.81531,
            11.62242
          ],
          [
            78.83127,
            11.59904
          ],
          [
            78.85514,
            11.58341
          ],
          [
            78.8833,
            11.57793
          ],
          [
            78.91146,
            11.58341
          ],
          [
            78.93533,
            11.59904
          ],
          [
            78.95129,
            11.62242
          ],
          [
            78.95689,
            11.65
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-KAL-05",
    "name": "Kalvarayan Hills Waterfalls",
    "district": "Kallakurichi",
    "state": "Tamil Nadu",
    "type": "Tribal Mountain Village Zone",
    "pincode": "606207",
    "lat": 11.8333,
    "lng": 78.7167,
    "radius_km": 9.5,
    "approx_area_sqkm": 283.5,
    "plus_code": "7J3WRPM8+8M",
    "admin_code": "TN-GEO-0183",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.80414,
            11.8333
          ],
          [
            78.79749,
            11.86605
          ],
          [
            78.77853,
            11.89382
          ],
          [
            78.75016,
            11.91237
          ],
          [
            78.7167,
            11.91889
          ],
          [
            78.68324,
            11.91237
          ],
          [
            78.65487,
            11.89382
          ],
          [
            78.63591,
            11.86605
          ],
          [
            78.62926,
            11.8333
          ],
          [
            78.63591,
            11.80055
          ],
          [
            78.65487,
            11.77278
          ],
          [
            78.68324,
            11.75423
          ],
          [
            78.7167,
            11.74771
          ],
          [
            78.75016,
            11.75423
          ],
          [
            78.77853,
            11.77278
          ],
          [
            78.79749,
            11.80055
          ],
          [
            78.80414,
            11.8333
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-KAL-06",
    "name": "Tirukkoyilur Historic Shrines",
    "district": "Kallakurichi",
    "state": "Tamil Nadu",
    "type": "Temple Town Cluster",
    "pincode": "605757",
    "lat": 11.9667,
    "lng": 79.2,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J3XX58X+MX",
    "admin_code": "TN-GEO-0184",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.27367,
            11.9667
          ],
          [
            79.26807,
            11.99428
          ],
          [
            79.25209,
            12.01766
          ],
          [
            79.22819,
            12.03329
          ],
          [
            79.2,
            12.03877
          ],
          [
            79.17181,
            12.03329
          ],
          [
            79.14791,
            12.01766
          ],
          [
            79.13193,
            11.99428
          ],
          [
            79.12633,
            11.9667
          ],
          [
            79.13193,
            11.93912
          ],
          [
            79.14791,
            11.91574
          ],
          [
            79.17181,
            11.90011
          ],
          [
            79.2,
            11.89463
          ],
          [
            79.22819,
            11.90011
          ],
          [
            79.25209,
            11.91574
          ],
          [
            79.26807,
            11.93912
          ],
          [
            79.27367,
            11.9667
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TIR-01",
    "name": "Tiruvannamalai Girivalam City",
    "district": "Tiruvannamalai",
    "state": "Tamil Nadu",
    "type": "Sacred Mountain City Core",
    "pincode": "606601",
    "lat": 12.2253,
    "lng": 79.0747,
    "radius_km": 7.5,
    "approx_area_sqkm": 176.7,
    "plus_code": "7J4X63GF+4V",
    "admin_code": "TN-GEO-0185",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.14384,
            12.2253
          ],
          [
            79.13857,
            12.25116
          ],
          [
            79.12359,
            12.27308
          ],
          [
            79.10116,
            12.28772
          ],
          [
            79.0747,
            12.29287
          ],
          [
            79.04824,
            12.28772
          ],
          [
            79.02581,
            12.27308
          ],
          [
            79.01083,
            12.25116
          ],
          [
            79.00556,
            12.2253
          ],
          [
            79.01083,
            12.19944
          ],
          [
            79.02581,
            12.17752
          ],
          [
            79.04824,
            12.16288
          ],
          [
            79.0747,
            12.15773
          ],
          [
            79.10116,
            12.16288
          ],
          [
            79.12359,
            12.17752
          ],
          [
            79.13857,
            12.19944
          ],
          [
            79.14384,
            12.2253
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TIR-02",
    "name": "Arani Silk Saree Capital",
    "district": "Tiruvannamalai",
    "state": "Tamil Nadu",
    "type": "Silk & Rice Town Hub",
    "pincode": "632301",
    "lat": 12.6667,
    "lng": 79.2833,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J4XM78M+M8",
    "admin_code": "TN-GEO-0186",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.35717,
            12.6667
          ],
          [
            79.35155,
            12.69428
          ],
          [
            79.33553,
            12.71766
          ],
          [
            79.31157,
            12.73329
          ],
          [
            79.2833,
            12.73877
          ],
          [
            79.25503,
            12.73329
          ],
          [
            79.23107,
            12.71766
          ],
          [
            79.21505,
            12.69428
          ],
          [
            79.20943,
            12.6667
          ],
          [
            79.21505,
            12.63912
          ],
          [
            79.23107,
            12.61574
          ],
          [
            79.25503,
            12.60011
          ],
          [
            79.2833,
            12.59463
          ],
          [
            79.31157,
            12.60011
          ],
          [
            79.33553,
            12.61574
          ],
          [
            79.35155,
            12.63912
          ],
          [
            79.35717,
            12.6667
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TIR-03",
    "name": "Polur Foothill Town",
    "district": "Tiruvannamalai",
    "state": "Tamil Nadu",
    "type": "Farming Town Zone",
    "pincode": "606803",
    "lat": 12.5,
    "lng": 79.1333,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J4XG42M+28",
    "admin_code": "TN-GEO-0187",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.21174,
            12.5
          ],
          [
            79.20577,
            12.5293
          ],
          [
            79.18876,
            12.55415
          ],
          [
            79.16332,
            12.57075
          ],
          [
            79.1333,
            12.57658
          ],
          [
            79.10328,
            12.57075
          ],
          [
            79.07784,
            12.55415
          ],
          [
            79.06083,
            12.5293
          ],
          [
            79.05486,
            12.5
          ],
          [
            79.06083,
            12.4707
          ],
          [
            79.07784,
            12.44585
          ],
          [
            79.10328,
            12.42925
          ],
          [
            79.1333,
            12.42342
          ],
          [
            79.16332,
            12.42925
          ],
          [
            79.18876,
            12.44585
          ],
          [
            79.20577,
            12.4707
          ],
          [
            79.21174,
            12.5
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TIR-04",
    "name": "Cheyyar Auto Industrial SIPCOT",
    "district": "Tiruvannamalai",
    "state": "Tamil Nadu",
    "type": "Manufacturing Mega Hub",
    "pincode": "604407",
    "lat": 12.6583,
    "lng": 79.5417,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J4XMG5R+8M",
    "admin_code": "TN-GEO-0188",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.62018,
            12.6583
          ],
          [
            79.61421,
            12.6876
          ],
          [
            79.5972,
            12.71245
          ],
          [
            79.57173,
            12.72905
          ],
          [
            79.5417,
            12.73488
          ],
          [
            79.51167,
            12.72905
          ],
          [
            79.4862,
            12.71245
          ],
          [
            79.46919,
            12.6876
          ],
          [
            79.46322,
            12.6583
          ],
          [
            79.46919,
            12.629
          ],
          [
            79.4862,
            12.60415
          ],
          [
            79.51167,
            12.58755
          ],
          [
            79.5417,
            12.58172
          ],
          [
            79.57173,
            12.58755
          ],
          [
            79.5972,
            12.60415
          ],
          [
            79.61421,
            12.629
          ],
          [
            79.62018,
            12.6583
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TIR-05",
    "name": "Chengam Sathanur Basin",
    "district": "Tiruvannamalai",
    "state": "Tamil Nadu",
    "type": "Dam & Canal Village Zone",
    "pincode": "606701",
    "lat": 12.3,
    "lng": 78.8,
    "radius_km": 9,
    "approx_area_sqkm": 254.5,
    "plus_code": "7J4W7RX2+X2",
    "admin_code": "TN-GEO-0189",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.88299,
            12.3
          ],
          [
            78.87667,
            12.33103
          ],
          [
            78.85868,
            12.35733
          ],
          [
            78.83176,
            12.37491
          ],
          [
            78.8,
            12.38108
          ],
          [
            78.76824,
            12.37491
          ],
          [
            78.74132,
            12.35733
          ],
          [
            78.72333,
            12.33103
          ],
          [
            78.71701,
            12.3
          ],
          [
            78.72333,
            12.26897
          ],
          [
            78.74132,
            12.24267
          ],
          [
            78.76824,
            12.22509
          ],
          [
            78.8,
            12.21892
          ],
          [
            78.83176,
            12.22509
          ],
          [
            78.85868,
            12.24267
          ],
          [
            78.87667,
            12.26897
          ],
          [
            78.88299,
            12.3
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TIR-06",
    "name": "Vandavasi Historic Town",
    "district": "Tiruvannamalai",
    "state": "Tamil Nadu",
    "type": "Weaving Village Zone",
    "pincode": "604408",
    "lat": 12.5,
    "lng": 79.6167,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J4XGJ28+2M",
    "admin_code": "TN-GEO-0190",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.69052,
            12.5
          ],
          [
            79.6849,
            12.52758
          ],
          [
            79.6689,
            12.55096
          ],
          [
            79.64495,
            12.56659
          ],
          [
            79.6167,
            12.57207
          ],
          [
            79.58845,
            12.56659
          ],
          [
            79.5645,
            12.55096
          ],
          [
            79.5485,
            12.52758
          ],
          [
            79.54288,
            12.5
          ],
          [
            79.5485,
            12.47242
          ],
          [
            79.5645,
            12.44904
          ],
          [
            79.58845,
            12.43341
          ],
          [
            79.6167,
            12.42793
          ],
          [
            79.64495,
            12.43341
          ],
          [
            79.6689,
            12.44904
          ],
          [
            79.6849,
            12.47242
          ],
          [
            79.69052,
            12.5
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-TIR-07",
    "name": "Jamunamarathur Javadi Hills",
    "district": "Tiruvannamalai",
    "state": "Tamil Nadu",
    "type": "Tribal Mountain Village Hub",
    "pincode": "635703",
    "lat": 12.5833,
    "lng": 78.9,
    "radius_km": 9,
    "approx_area_sqkm": 254.5,
    "plus_code": "7J4WHVMX+8X",
    "admin_code": "TN-GEO-0191",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.98308,
            12.5833
          ],
          [
            78.97675,
            12.61433
          ],
          [
            78.95874,
            12.64063
          ],
          [
            78.93179,
            12.65821
          ],
          [
            78.9,
            12.66438
          ],
          [
            78.86821,
            12.65821
          ],
          [
            78.84126,
            12.64063
          ],
          [
            78.82325,
            12.61433
          ],
          [
            78.81692,
            12.5833
          ],
          [
            78.82325,
            12.55227
          ],
          [
            78.84126,
            12.52597
          ],
          [
            78.86821,
            12.50839
          ],
          [
            78.9,
            12.50222
          ],
          [
            78.93179,
            12.50839
          ],
          [
            78.95874,
            12.52597
          ],
          [
            78.97675,
            12.55227
          ],
          [
            78.98308,
            12.5833
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-ARI-01",
    "name": "Ariyalur Cement Capital",
    "district": "Ariyalur",
    "state": "Tamil Nadu",
    "type": "Mining & Cement City Core",
    "pincode": "621704",
    "lat": 11.1401,
    "lng": 79.0786,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J3X43RH+2C",
    "admin_code": "TN-GEO-0192",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.15206,
            11.1401
          ],
          [
            79.14646,
            11.16768
          ],
          [
            79.13054,
            11.19106
          ],
          [
            79.10671,
            11.20669
          ],
          [
            79.0786,
            11.21217
          ],
          [
            79.05049,
            11.20669
          ],
          [
            79.02666,
            11.19106
          ],
          [
            79.01074,
            11.16768
          ],
          [
            79.00514,
            11.1401
          ],
          [
            79.01074,
            11.11252
          ],
          [
            79.02666,
            11.08914
          ],
          [
            79.05049,
            11.07351
          ],
          [
            79.0786,
            11.06803
          ],
          [
            79.10671,
            11.07351
          ],
          [
            79.13054,
            11.08914
          ],
          [
            79.14646,
            11.11252
          ],
          [
            79.15206,
            11.1401
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-ARI-02",
    "name": "Jayankondam Lignite Town",
    "district": "Ariyalur",
    "state": "Tamil Nadu",
    "type": "Commercial Town Hub",
    "pincode": "621802",
    "lat": 11.2167,
    "lng": 79.35,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J3X6982+M2",
    "admin_code": "TN-GEO-0193",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.42807,
            11.2167
          ],
          [
            79.42213,
            11.246
          ],
          [
            79.4052,
            11.27085
          ],
          [
            79.37988,
            11.28745
          ],
          [
            79.35,
            11.29328
          ],
          [
            79.32012,
            11.28745
          ],
          [
            79.2948,
            11.27085
          ],
          [
            79.27787,
            11.246
          ],
          [
            79.27193,
            11.2167
          ],
          [
            79.27787,
            11.1874
          ],
          [
            79.2948,
            11.16255
          ],
          [
            79.32012,
            11.14595
          ],
          [
            79.35,
            11.14012
          ],
          [
            79.37988,
            11.14595
          ],
          [
            79.4052,
            11.16255
          ],
          [
            79.42213,
            11.1874
          ],
          [
            79.42807,
            11.2167
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-ARI-03",
    "name": "Gangaikonda Cholapuram UNESCO",
    "district": "Ariyalur",
    "state": "Tamil Nadu",
    "type": "Chola Emperor Capital Village",
    "pincode": "612901",
    "lat": 11.2067,
    "lng": 79.4517,
    "radius_km": 7.5,
    "approx_area_sqkm": 176.7,
    "plus_code": "7J3X6F42+MM",
    "admin_code": "TN-GEO-0194",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.52058,
            11.2067
          ],
          [
            79.51534,
            11.23256
          ],
          [
            79.50041,
            11.25448
          ],
          [
            79.47806,
            11.26912
          ],
          [
            79.4517,
            11.27427
          ],
          [
            79.42534,
            11.26912
          ],
          [
            79.40299,
            11.25448
          ],
          [
            79.38806,
            11.23256
          ],
          [
            79.38282,
            11.2067
          ],
          [
            79.38806,
            11.18084
          ],
          [
            79.40299,
            11.15892
          ],
          [
            79.42534,
            11.14428
          ],
          [
            79.4517,
            11.13913
          ],
          [
            79.47806,
            11.14428
          ],
          [
            79.50041,
            11.15892
          ],
          [
            79.51534,
            11.18084
          ],
          [
            79.52058,
            11.2067
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-ARI-04",
    "name": "Sendurai Fossil Quarry Belt",
    "district": "Ariyalur",
    "state": "Tamil Nadu",
    "type": "Industrial Village Zone",
    "pincode": "621714",
    "lat": 11.2833,
    "lng": 79.1833,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J3X75MM+88",
    "admin_code": "TN-GEO-0195",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.26139,
            11.2833
          ],
          [
            79.25544,
            11.3126
          ],
          [
            79.23852,
            11.33745
          ],
          [
            79.21318,
            11.35405
          ],
          [
            79.1833,
            11.35988
          ],
          [
            79.15342,
            11.35405
          ],
          [
            79.12808,
            11.33745
          ],
          [
            79.11116,
            11.3126
          ],
          [
            79.10521,
            11.2833
          ],
          [
            79.11116,
            11.254
          ],
          [
            79.12808,
            11.22915
          ],
          [
            79.15342,
            11.21255
          ],
          [
            79.1833,
            11.20672
          ],
          [
            79.21318,
            11.21255
          ],
          [
            79.23852,
            11.22915
          ],
          [
            79.25544,
            11.254
          ],
          [
            79.26139,
            11.2833
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-ARI-05",
    "name": "Udayarpalayam Historic Palayam",
    "district": "Ariyalur",
    "state": "Tamil Nadu",
    "type": "Rural Heritage Village",
    "pincode": "621804",
    "lat": 11.1833,
    "lng": 79.3,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J3X58M2+82",
    "admin_code": "TN-GEO-0196",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.37347,
            11.1833
          ],
          [
            79.36787,
            11.21088
          ],
          [
            79.35195,
            11.23426
          ],
          [
            79.32811,
            11.24989
          ],
          [
            79.3,
            11.25537
          ],
          [
            79.27189,
            11.24989
          ],
          [
            79.24805,
            11.23426
          ],
          [
            79.23213,
            11.21088
          ],
          [
            79.22653,
            11.1833
          ],
          [
            79.23213,
            11.15572
          ],
          [
            79.24805,
            11.13234
          ],
          [
            79.27189,
            11.11671
          ],
          [
            79.3,
            11.11123
          ],
          [
            79.32811,
            11.11671
          ],
          [
            79.35195,
            11.13234
          ],
          [
            79.36787,
            11.15572
          ],
          [
            79.37347,
            11.1833
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-PER-01",
    "name": "Perambalur Town Central",
    "district": "Perambalur",
    "state": "Tamil Nadu",
    "type": "District HQ Core",
    "pincode": "621212",
    "lat": 11.2333,
    "lng": 78.8833,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J3W6VMM+88",
    "admin_code": "TN-GEO-0197",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.95678,
            11.2333
          ],
          [
            78.95119,
            11.26088
          ],
          [
            78.93526,
            11.28426
          ],
          [
            78.91142,
            11.29989
          ],
          [
            78.8833,
            11.30537
          ],
          [
            78.85518,
            11.29989
          ],
          [
            78.83134,
            11.28426
          ],
          [
            78.81541,
            11.26088
          ],
          [
            78.80982,
            11.2333
          ],
          [
            78.81541,
            11.20572
          ],
          [
            78.83134,
            11.18234
          ],
          [
            78.85518,
            11.16671
          ],
          [
            78.8833,
            11.16123
          ],
          [
            78.91142,
            11.16671
          ],
          [
            78.93526,
            11.18234
          ],
          [
            78.95119,
            11.20572
          ],
          [
            78.95678,
            11.2333
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-PER-02",
    "name": "Veppanthattai Cotton Farms",
    "district": "Perambalur",
    "state": "Tamil Nadu",
    "type": "Cash Crop Village Hub",
    "pincode": "621116",
    "lat": 11.3167,
    "lng": 78.8333,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J3W8R8M+M8",
    "admin_code": "TN-GEO-0198",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.91139,
            11.3167
          ],
          [
            78.90545,
            11.346
          ],
          [
            78.88852,
            11.37085
          ],
          [
            78.86319,
            11.38745
          ],
          [
            78.8333,
            11.39328
          ],
          [
            78.80341,
            11.38745
          ],
          [
            78.77808,
            11.37085
          ],
          [
            78.76115,
            11.346
          ],
          [
            78.75521,
            11.3167
          ],
          [
            78.76115,
            11.2874
          ],
          [
            78.77808,
            11.26255
          ],
          [
            78.80341,
            11.24595
          ],
          [
            78.8333,
            11.24012
          ],
          [
            78.86319,
            11.24595
          ],
          [
            78.88852,
            11.26255
          ],
          [
            78.90545,
            11.2874
          ],
          [
            78.91139,
            11.3167
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-PER-03",
    "name": "Kunnam Marine Fossil Beds",
    "district": "Perambalur",
    "state": "Tamil Nadu",
    "type": "Geological Village Cluster",
    "pincode": "621708",
    "lat": 11.2333,
    "lng": 79.0167,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J3X62M8+8M",
    "admin_code": "TN-GEO-0199",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.09477,
            11.2333
          ],
          [
            79.08883,
            11.2626
          ],
          [
            79.07191,
            11.28745
          ],
          [
            79.04658,
            11.30405
          ],
          [
            79.0167,
            11.30988
          ],
          [
            78.98682,
            11.30405
          ],
          [
            78.96149,
            11.28745
          ],
          [
            78.94457,
            11.2626
          ],
          [
            78.93863,
            11.2333
          ],
          [
            78.94457,
            11.204
          ],
          [
            78.96149,
            11.17915
          ],
          [
            78.98682,
            11.16255
          ],
          [
            79.0167,
            11.15672
          ],
          [
            79.04658,
            11.16255
          ],
          [
            79.07191,
            11.17915
          ],
          [
            79.08883,
            11.204
          ],
          [
            79.09477,
            11.2333
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-PER-04",
    "name": "Alathur Pharma SEZ",
    "district": "Perambalur",
    "state": "Tamil Nadu",
    "type": "Pharma Industrial Village",
    "pincode": "621301",
    "lat": 11.15,
    "lng": 78.85,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J3W5V22+22",
    "admin_code": "TN-GEO-0200",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.92346,
            11.15
          ],
          [
            78.91787,
            11.17758
          ],
          [
            78.90194,
            11.20096
          ],
          [
            78.87811,
            11.21659
          ],
          [
            78.85,
            11.22207
          ],
          [
            78.82189,
            11.21659
          ],
          [
            78.79806,
            11.20096
          ],
          [
            78.78213,
            11.17758
          ],
          [
            78.77654,
            11.15
          ],
          [
            78.78213,
            11.12242
          ],
          [
            78.79806,
            11.09904
          ],
          [
            78.82189,
            11.08341
          ],
          [
            78.85,
            11.07793
          ],
          [
            78.87811,
            11.08341
          ],
          [
            78.90194,
            11.09904
          ],
          [
            78.91787,
            11.12242
          ],
          [
            78.92346,
            11.15
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-SIV-01",
    "name": "Sivaganga Historic Town Core",
    "district": "Sivaganga",
    "state": "Tamil Nadu",
    "type": "Queen Velu Nachiyar Core",
    "pincode": "630561",
    "lat": 9.8433,
    "lng": 78.4809,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "6JXWRFVJ+89",
    "admin_code": "TN-GEO-0201",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.55405,
            9.8433
          ],
          [
            78.54848,
            9.87088
          ],
          [
            78.53262,
            9.89426
          ],
          [
            78.50889,
            9.90989
          ],
          [
            78.4809,
            9.91537
          ],
          [
            78.45291,
            9.90989
          ],
          [
            78.42918,
            9.89426
          ],
          [
            78.41332,
            9.87088
          ],
          [
            78.40775,
            9.8433
          ],
          [
            78.41332,
            9.81572
          ],
          [
            78.42918,
            9.79234
          ],
          [
            78.45291,
            9.77671
          ],
          [
            78.4809,
            9.77123
          ],
          [
            78.50889,
            9.77671
          ],
          [
            78.53262,
            9.79234
          ],
          [
            78.54848,
            9.81572
          ],
          [
            78.55405,
            9.8433
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-SIV-02",
    "name": "Karaikudi Chettinad Capital",
    "district": "Sivaganga",
    "state": "Tamil Nadu",
    "type": "Mansion & Edu City Core",
    "pincode": "630001",
    "lat": 10.0734,
    "lng": 78.7732,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "7J2W3QFF+97",
    "admin_code": "TN-GEO-0202",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.8464,
            10.0734
          ],
          [
            78.84083,
            10.10098
          ],
          [
            78.82496,
            10.12436
          ],
          [
            78.80121,
            10.13999
          ],
          [
            78.7732,
            10.14547
          ],
          [
            78.74519,
            10.13999
          ],
          [
            78.72144,
            10.12436
          ],
          [
            78.70557,
            10.10098
          ],
          [
            78.7,
            10.0734
          ],
          [
            78.70557,
            10.04582
          ],
          [
            78.72144,
            10.02244
          ],
          [
            78.74519,
            10.00681
          ],
          [
            78.7732,
            10.00133
          ],
          [
            78.80121,
            10.00681
          ],
          [
            78.82496,
            10.02244
          ],
          [
            78.84083,
            10.04582
          ],
          [
            78.8464,
            10.0734
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-SIV-03",
    "name": "Devakottai Chettiar Mansions",
    "district": "Sivaganga",
    "state": "Tamil Nadu",
    "type": "Heritage Town Zone",
    "pincode": "630302",
    "lat": 9.95,
    "lng": 78.8167,
    "radius_km": 7.5,
    "approx_area_sqkm": 176.7,
    "plus_code": "6JXWXR28+2M",
    "admin_code": "TN-GEO-0203",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.8853,
            9.95
          ],
          [
            78.88008,
            9.97586
          ],
          [
            78.86521,
            9.99778
          ],
          [
            78.84295,
            10.01242
          ],
          [
            78.8167,
            10.01757
          ],
          [
            78.79045,
            10.01242
          ],
          [
            78.76819,
            9.99778
          ],
          [
            78.75332,
            9.97586
          ],
          [
            78.7481,
            9.95
          ],
          [
            78.75332,
            9.92414
          ],
          [
            78.76819,
            9.90222
          ],
          [
            78.79045,
            9.88758
          ],
          [
            78.8167,
            9.88243
          ],
          [
            78.84295,
            9.88758
          ],
          [
            78.86521,
            9.90222
          ],
          [
            78.88008,
            9.92414
          ],
          [
            78.8853,
            9.95
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-SIV-04",
    "name": "Manamadurai Clay Pottery Hub",
    "district": "Sivaganga",
    "state": "Tamil Nadu",
    "type": "Terracotta Craft Town Zone",
    "pincode": "630606",
    "lat": 9.7,
    "lng": 78.45,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "6JXWPC2X+2X",
    "admin_code": "TN-GEO-0204",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.52312,
            9.7
          ],
          [
            78.51755,
            9.72758
          ],
          [
            78.5017,
            9.75096
          ],
          [
            78.47798,
            9.76659
          ],
          [
            78.45,
            9.77207
          ],
          [
            78.42202,
            9.76659
          ],
          [
            78.3983,
            9.75096
          ],
          [
            78.38245,
            9.72758
          ],
          [
            78.37688,
            9.7
          ],
          [
            78.38245,
            9.67242
          ],
          [
            78.3983,
            9.64904
          ],
          [
            78.42202,
            9.63341
          ],
          [
            78.45,
            9.62793
          ],
          [
            78.47798,
            9.63341
          ],
          [
            78.5017,
            9.64904
          ],
          [
            78.51755,
            9.67242
          ],
          [
            78.52312,
            9.7
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-SIV-05",
    "name": "Tiruppuvanam / Keeladi Excavation",
    "district": "Sivaganga",
    "state": "Tamil Nadu",
    "type": "Ancient Vaigai Heritage Village",
    "pincode": "630611",
    "lat": 9.8667,
    "lng": 78.2833,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "6JXWV78M+M8",
    "admin_code": "TN-GEO-0205",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.35645,
            9.8667
          ],
          [
            78.35089,
            9.89428
          ],
          [
            78.33503,
            9.91766
          ],
          [
            78.31129,
            9.93329
          ],
          [
            78.2833,
            9.93877
          ],
          [
            78.25531,
            9.93329
          ],
          [
            78.23157,
            9.91766
          ],
          [
            78.21571,
            9.89428
          ],
          [
            78.21015,
            9.8667
          ],
          [
            78.21571,
            9.83912
          ],
          [
            78.23157,
            9.81574
          ],
          [
            78.25531,
            9.80011
          ],
          [
            78.2833,
            9.79463
          ],
          [
            78.31129,
            9.80011
          ],
          [
            78.33503,
            9.81574
          ],
          [
            78.35089,
            9.83912
          ],
          [
            78.35645,
            9.8667
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-SIV-06",
    "name": "Kalayarkoil Temple Village",
    "district": "Sivaganga",
    "state": "Tamil Nadu",
    "type": "Historic Village Panchayat",
    "pincode": "630551",
    "lat": 9.85,
    "lng": 78.65,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "6JXWRJXX+XX",
    "admin_code": "TN-GEO-0206",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.72772,
            9.85
          ],
          [
            78.72181,
            9.8793
          ],
          [
            78.70496,
            9.90415
          ],
          [
            78.67974,
            9.92075
          ],
          [
            78.65,
            9.92658
          ],
          [
            78.62026,
            9.92075
          ],
          [
            78.59504,
            9.90415
          ],
          [
            78.57819,
            9.8793
          ],
          [
            78.57228,
            9.85
          ],
          [
            78.57819,
            9.8207
          ],
          [
            78.59504,
            9.79585
          ],
          [
            78.62026,
            9.77925
          ],
          [
            78.65,
            9.77342
          ],
          [
            78.67974,
            9.77925
          ],
          [
            78.70496,
            9.79585
          ],
          [
            78.72181,
            9.8207
          ],
          [
            78.72772,
            9.85
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-SIV-07",
    "name": "Singampunari Coir Hub",
    "district": "Sivaganga",
    "state": "Tamil Nadu",
    "type": "Coir & Cattle Village Cluster",
    "pincode": "630502",
    "lat": 10.1833,
    "lng": 78.4167,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "7J2W5CM8+8M",
    "admin_code": "TN-GEO-0207",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.4945,
            10.1833
          ],
          [
            78.48858,
            10.2126
          ],
          [
            78.47171,
            10.23745
          ],
          [
            78.44647,
            10.25405
          ],
          [
            78.4167,
            10.25988
          ],
          [
            78.38693,
            10.25405
          ],
          [
            78.36169,
            10.23745
          ],
          [
            78.34482,
            10.2126
          ],
          [
            78.3389,
            10.1833
          ],
          [
            78.34482,
            10.154
          ],
          [
            78.36169,
            10.12915
          ],
          [
            78.38693,
            10.11255
          ],
          [
            78.4167,
            10.10672
          ],
          [
            78.44647,
            10.11255
          ],
          [
            78.47171,
            10.12915
          ],
          [
            78.48858,
            10.154
          ],
          [
            78.4945,
            10.1833
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-RAM-01",
    "name": "Ramanathapuram Palace Core",
    "district": "Ramanathapuram",
    "state": "Tamil Nadu",
    "type": "Sethupathi Heritage Core",
    "pincode": "623501",
    "lat": 9.3639,
    "lng": 78.8395,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "6JXW9R7Q+HQ",
    "admin_code": "TN-GEO-0208",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.91255,
            9.3639
          ],
          [
            78.90699,
            9.39148
          ],
          [
            78.89115,
            9.41486
          ],
          [
            78.86745,
            9.43049
          ],
          [
            78.8395,
            9.43597
          ],
          [
            78.81155,
            9.43049
          ],
          [
            78.78785,
            9.41486
          ],
          [
            78.77201,
            9.39148
          ],
          [
            78.76645,
            9.3639
          ],
          [
            78.77201,
            9.33632
          ],
          [
            78.78785,
            9.31294
          ],
          [
            78.81155,
            9.29731
          ],
          [
            78.8395,
            9.29183
          ],
          [
            78.86745,
            9.29731
          ],
          [
            78.89115,
            9.31294
          ],
          [
            78.90699,
            9.33632
          ],
          [
            78.91255,
            9.3639
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-RAM-02",
    "name": "Rameswaram Island & Pamban",
    "district": "Ramanathapuram",
    "state": "Tamil Nadu",
    "type": "Holy Island City Zone",
    "pincode": "623526",
    "lat": 9.2876,
    "lng": 79.3129,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "6JXX78Q7+25",
    "admin_code": "TN-GEO-0209",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.39049,
            9.2876
          ],
          [
            79.38459,
            9.3169
          ],
          [
            79.36777,
            9.34175
          ],
          [
            79.34259,
            9.35835
          ],
          [
            79.3129,
            9.36418
          ],
          [
            79.28321,
            9.35835
          ],
          [
            79.25803,
            9.34175
          ],
          [
            79.24121,
            9.3169
          ],
          [
            79.23531,
            9.2876
          ],
          [
            79.24121,
            9.2583
          ],
          [
            79.25803,
            9.23345
          ],
          [
            79.28321,
            9.21685
          ],
          [
            79.3129,
            9.21102
          ],
          [
            79.34259,
            9.21685
          ],
          [
            79.36777,
            9.23345
          ],
          [
            79.38459,
            9.2583
          ],
          [
            79.39049,
            9.2876
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-RAM-03",
    "name": "Paramakudi Vaigai Silk Hub",
    "district": "Ramanathapuram",
    "state": "Tamil Nadu",
    "type": "Silk Handloom Town Zone",
    "pincode": "623707",
    "lat": 9.5444,
    "lng": 78.5889,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "6JXWGHVQ+QH",
    "admin_code": "TN-GEO-0210",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.66198,
            9.5444
          ],
          [
            78.65642,
            9.57198
          ],
          [
            78.64058,
            9.59536
          ],
          [
            78.61687,
            9.61099
          ],
          [
            78.5889,
            9.61647
          ],
          [
            78.56093,
            9.61099
          ],
          [
            78.53722,
            9.59536
          ],
          [
            78.52138,
            9.57198
          ],
          [
            78.51582,
            9.5444
          ],
          [
            78.52138,
            9.51682
          ],
          [
            78.53722,
            9.49344
          ],
          [
            78.56093,
            9.47781
          ],
          [
            78.5889,
            9.47233
          ],
          [
            78.61687,
            9.47781
          ],
          [
            78.64058,
            9.49344
          ],
          [
            78.65642,
            9.51682
          ],
          [
            78.66198,
            9.5444
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-RAM-04",
    "name": "Kilakarai Marine Gem Trade",
    "district": "Ramanathapuram",
    "state": "Tamil Nadu",
    "type": "Seashore Trading Town",
    "pincode": "623517",
    "lat": 9.2333,
    "lng": 78.7833,
    "radius_km": 7.5,
    "approx_area_sqkm": 176.7,
    "plus_code": "6JXW6QMM+88",
    "admin_code": "TN-GEO-0211",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.85175,
            9.2333
          ],
          [
            78.84654,
            9.25916
          ],
          [
            78.8317,
            9.28108
          ],
          [
            78.8095,
            9.29572
          ],
          [
            78.7833,
            9.30087
          ],
          [
            78.7571,
            9.29572
          ],
          [
            78.7349,
            9.28108
          ],
          [
            78.72006,
            9.25916
          ],
          [
            78.71485,
            9.2333
          ],
          [
            78.72006,
            9.20744
          ],
          [
            78.7349,
            9.18552
          ],
          [
            78.7571,
            9.17088
          ],
          [
            78.7833,
            9.16573
          ],
          [
            78.8095,
            9.17088
          ],
          [
            78.8317,
            9.18552
          ],
          [
            78.84654,
            9.20744
          ],
          [
            78.85175,
            9.2333
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-RAM-05",
    "name": "Kamuthi Mega Solar Park",
    "district": "Ramanathapuram",
    "state": "Tamil Nadu",
    "type": "Green Energy Town Zone",
    "pincode": "623603",
    "lat": 9.4,
    "lng": 78.3667,
    "radius_km": 9.5,
    "approx_area_sqkm": 283.5,
    "plus_code": "6JXWC928+2M",
    "admin_code": "TN-GEO-0212",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.45345,
            9.4
          ],
          [
            78.44685,
            9.43275
          ],
          [
            78.42804,
            9.46052
          ],
          [
            78.3999,
            9.47907
          ],
          [
            78.3667,
            9.48559
          ],
          [
            78.3335,
            9.47907
          ],
          [
            78.30536,
            9.46052
          ],
          [
            78.28655,
            9.43275
          ],
          [
            78.27995,
            9.4
          ],
          [
            78.28655,
            9.36725
          ],
          [
            78.30536,
            9.33948
          ],
          [
            78.3335,
            9.32093
          ],
          [
            78.3667,
            9.31441
          ],
          [
            78.3999,
            9.32093
          ],
          [
            78.42804,
            9.33948
          ],
          [
            78.44685,
            9.36725
          ],
          [
            78.45345,
            9.4
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-RAM-06",
    "name": "Mudukulathur Agro Belt",
    "district": "Ramanathapuram",
    "state": "Tamil Nadu",
    "type": "Rural Dry Farming Village",
    "pincode": "623704",
    "lat": 9.3333,
    "lng": 78.5,
    "radius_km": 9,
    "approx_area_sqkm": 254.5,
    "plus_code": "6JXW8GM2+82",
    "admin_code": "TN-GEO-0213",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.58217,
            9.3333
          ],
          [
            78.57591,
            9.36433
          ],
          [
            78.5581,
            9.39063
          ],
          [
            78.53144,
            9.40821
          ],
          [
            78.5,
            9.41438
          ],
          [
            78.46856,
            9.40821
          ],
          [
            78.4419,
            9.39063
          ],
          [
            78.42409,
            9.36433
          ],
          [
            78.41783,
            9.3333
          ],
          [
            78.42409,
            9.30227
          ],
          [
            78.4419,
            9.27597
          ],
          [
            78.46856,
            9.25839
          ],
          [
            78.5,
            9.25222
          ],
          [
            78.53144,
            9.25839
          ],
          [
            78.5581,
            9.27597
          ],
          [
            78.57591,
            9.30227
          ],
          [
            78.58217,
            9.3333
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-RAM-07",
    "name": "Thiruvadanai Coastal Basin",
    "district": "Ramanathapuram",
    "state": "Tamil Nadu",
    "type": "Coastal Farming Village Cluster",
    "pincode": "623538",
    "lat": 9.7833,
    "lng": 78.9167,
    "radius_km": 9.5,
    "approx_area_sqkm": 283.5,
    "plus_code": "6JXWQWM8+8M",
    "admin_code": "TN-GEO-0214",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            79.00355,
            9.7833
          ],
          [
            78.99694,
            9.81605
          ],
          [
            78.97811,
            9.84382
          ],
          [
            78.94994,
            9.86237
          ],
          [
            78.9167,
            9.86889
          ],
          [
            78.88346,
            9.86237
          ],
          [
            78.85529,
            9.84382
          ],
          [
            78.83646,
            9.81605
          ],
          [
            78.82985,
            9.7833
          ],
          [
            78.83646,
            9.75055
          ],
          [
            78.85529,
            9.72278
          ],
          [
            78.88346,
            9.70423
          ],
          [
            78.9167,
            9.69771
          ],
          [
            78.94994,
            9.70423
          ],
          [
            78.97811,
            9.72278
          ],
          [
            78.99694,
            9.75055
          ],
          [
            79.00355,
            9.7833
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-VIR-01",
    "name": "Virudhunagar Trade City Core",
    "district": "Virudhunagar",
    "state": "Tamil Nadu",
    "type": "Wholesale Spice & Oil Core",
    "pincode": "626001",
    "lat": 9.5872,
    "lng": 77.9514,
    "radius_km": 7.5,
    "approx_area_sqkm": 176.7,
    "plus_code": "6JXVHXP2+VH",
    "admin_code": "TN-GEO-0215",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.01992,
            9.5872
          ],
          [
            78.01471,
            9.61306
          ],
          [
            77.99985,
            9.63498
          ],
          [
            77.97762,
            9.64962
          ],
          [
            77.9514,
            9.65477
          ],
          [
            77.92518,
            9.64962
          ],
          [
            77.90295,
            9.63498
          ],
          [
            77.88809,
            9.61306
          ],
          [
            77.88288,
            9.5872
          ],
          [
            77.88809,
            9.56134
          ],
          [
            77.90295,
            9.53942
          ],
          [
            77.92518,
            9.52478
          ],
          [
            77.9514,
            9.51963
          ],
          [
            77.97762,
            9.52478
          ],
          [
            77.99985,
            9.53942
          ],
          [
            78.01471,
            9.56134
          ],
          [
            78.01992,
            9.5872
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-VIR-02",
    "name": "Sivakasi Fireworks & Print Capital",
    "district": "Virudhunagar",
    "state": "Tamil Nadu",
    "type": "Industrial Global Town Zone",
    "pincode": "626123",
    "lat": 9.4533,
    "lng": 77.8028,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "6JXVFR33+84",
    "admin_code": "TN-GEO-0216",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.87586,
            9.4533
          ],
          [
            77.8703,
            9.48088
          ],
          [
            77.85446,
            9.50426
          ],
          [
            77.83076,
            9.51989
          ],
          [
            77.8028,
            9.52537
          ],
          [
            77.77484,
            9.51989
          ],
          [
            77.75114,
            9.50426
          ],
          [
            77.7353,
            9.48088
          ],
          [
            77.72974,
            9.4533
          ],
          [
            77.7353,
            9.42572
          ],
          [
            77.75114,
            9.40234
          ],
          [
            77.77484,
            9.38671
          ],
          [
            77.8028,
            9.38123
          ],
          [
            77.83076,
            9.38671
          ],
          [
            77.85446,
            9.40234
          ],
          [
            77.8703,
            9.42572
          ],
          [
            77.87586,
            9.4533
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-VIR-03",
    "name": "Srivilliputhur Andal Heritage",
    "district": "Virudhunagar",
    "state": "Tamil Nadu",
    "type": "Temple & Palkova City Zone",
    "pincode": "626125",
    "lat": 9.51,
    "lng": 77.63,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "6JXVGJ6H+2X",
    "admin_code": "TN-GEO-0217",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.70308,
            9.51
          ],
          [
            77.69751,
            9.53758
          ],
          [
            77.68167,
            9.56096
          ],
          [
            77.65797,
            9.57659
          ],
          [
            77.63,
            9.58207
          ],
          [
            77.60203,
            9.57659
          ],
          [
            77.57833,
            9.56096
          ],
          [
            77.56249,
            9.53758
          ],
          [
            77.55692,
            9.51
          ],
          [
            77.56249,
            9.48242
          ],
          [
            77.57833,
            9.45904
          ],
          [
            77.60203,
            9.44341
          ],
          [
            77.63,
            9.43793
          ],
          [
            77.65797,
            9.44341
          ],
          [
            77.68167,
            9.45904
          ],
          [
            77.69751,
            9.48242
          ],
          [
            77.70308,
            9.51
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-VIR-04",
    "name": "Rajapalayam Handloom & Canine",
    "district": "Virudhunagar",
    "state": "Tamil Nadu",
    "type": "Textile Foothill Town",
    "pincode": "626117",
    "lat": 9.45,
    "lng": 77.55,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "6JXVFH22+22",
    "admin_code": "TN-GEO-0218",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.62306,
            9.45
          ],
          [
            77.6175,
            9.47758
          ],
          [
            77.60166,
            9.50096
          ],
          [
            77.57796,
            9.51659
          ],
          [
            77.55,
            9.52207
          ],
          [
            77.52204,
            9.51659
          ],
          [
            77.49834,
            9.50096
          ],
          [
            77.4825,
            9.47758
          ],
          [
            77.47694,
            9.45
          ],
          [
            77.4825,
            9.42242
          ],
          [
            77.49834,
            9.39904
          ],
          [
            77.52204,
            9.38341
          ],
          [
            77.55,
            9.37793
          ],
          [
            77.57796,
            9.38341
          ],
          [
            77.60166,
            9.39904
          ],
          [
            77.6175,
            9.42242
          ],
          [
            77.62306,
            9.45
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-VIR-05",
    "name": "Aruppukkottai Weaving Capital",
    "district": "Virudhunagar",
    "state": "Tamil Nadu",
    "type": "Handloom Town Hub",
    "pincode": "626101",
    "lat": 9.5167,
    "lng": 78.1,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "6JXWG482+M2",
    "admin_code": "TN-GEO-0219",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.17308,
            9.5167
          ],
          [
            78.16752,
            9.54428
          ],
          [
            78.15167,
            9.56766
          ],
          [
            78.12797,
            9.58329
          ],
          [
            78.1,
            9.58877
          ],
          [
            78.07203,
            9.58329
          ],
          [
            78.04833,
            9.56766
          ],
          [
            78.03248,
            9.54428
          ],
          [
            78.02692,
            9.5167
          ],
          [
            78.03248,
            9.48912
          ],
          [
            78.04833,
            9.46574
          ],
          [
            78.07203,
            9.45011
          ],
          [
            78.1,
            9.44463
          ],
          [
            78.12797,
            9.45011
          ],
          [
            78.15167,
            9.46574
          ],
          [
            78.16752,
            9.48912
          ],
          [
            78.17308,
            9.5167
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-VIR-06",
    "name": "Sattur Spicy Sev & Nibs Hub",
    "district": "Virudhunagar",
    "state": "Tamil Nadu",
    "type": "Agro Industry Town",
    "pincode": "626203",
    "lat": 9.3667,
    "lng": 77.9333,
    "radius_km": 8,
    "approx_area_sqkm": 201.1,
    "plus_code": "6JXV9W8M+M8",
    "admin_code": "TN-GEO-0220",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            78.00635,
            9.3667
          ],
          [
            78.00079,
            9.39428
          ],
          [
            77.98495,
            9.41766
          ],
          [
            77.96125,
            9.43329
          ],
          [
            77.9333,
            9.43877
          ],
          [
            77.90535,
            9.43329
          ],
          [
            77.88165,
            9.41766
          ],
          [
            77.86581,
            9.39428
          ],
          [
            77.86025,
            9.3667
          ],
          [
            77.86581,
            9.33912
          ],
          [
            77.88165,
            9.31574
          ],
          [
            77.90535,
            9.30011
          ],
          [
            77.9333,
            9.29463
          ],
          [
            77.96125,
            9.30011
          ],
          [
            77.98495,
            9.31574
          ],
          [
            78.00079,
            9.33912
          ],
          [
            78.00635,
            9.3667
          ]
        ]
      ]
    }
  },
  {
    "id": "TN-VIR-07",
    "name": "Watrap Wildlife Sanctuary Gateway",
    "district": "Virudhunagar",
    "state": "Tamil Nadu",
    "type": "Forest Foothill Village Hub",
    "pincode": "626132",
    "lat": 9.6333,
    "lng": 77.6333,
    "radius_km": 8.5,
    "approx_area_sqkm": 227,
    "plus_code": "6JXVJJMM+88",
    "admin_code": "TN-GEO-0221",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            77.71097,
            9.6333
          ],
          [
            77.70506,
            9.6626
          ],
          [
            77.68822,
            9.68745
          ],
          [
            77.66302,
            9.70405
          ],
          [
            77.6333,
            9.70988
          ],
          [
            77.60358,
            9.70405
          ],
          [
            77.57838,
            9.68745
          ],
          [
            77.56154,
            9.6626
          ],
          [
            77.55563,
            9.6333
          ],
          [
            77.56154,
            9.604
          ],
          [
            77.57838,
            9.57915
          ],
          [
            77.60358,
            9.56255
          ],
          [
            77.6333,
            9.55672
          ],
          [
            77.66302,
            9.56255
          ],
          [
            77.68822,
            9.57915
          ],
          [
            77.70506,
            9.604
          ],
          [
            77.71097,
            9.6333
          ]
        ]
      ]
    }
  }
];

export const CITY_LOOKUP = {};
TAMIL_NADU_CITIES.forEach((c) => {
  CITY_LOOKUP[c.name.toLowerCase().trim()] = [c.lat, c.lng];
  const shortName = c.name.split("(")[0].trim().toLowerCase();
  CITY_LOOKUP[shortName] = [c.lat, c.lng];
});
TAMIL_NADU_SUBZONES.forEach((s) => {
  if (s.lat && s.lng) {
    const key = s.name.toLowerCase().trim();
    if (!CITY_LOOKUP[key]) {
      CITY_LOOKUP[key] = [s.lat, s.lng];
    }
  }
});

/**
 * Filter operational cities/taluks for a given district name or query
 */
export const getCitiesByDistrict = (districtNameOrCity) => {
  if (!districtNameOrCity) return TAMIL_NADU_CITIES;
  const q = String(districtNameOrCity).toLowerCase().trim();
  const cleanQ = q.replace(/operational range|district|revenue|range|hub|zone/gi, "").trim();

  const matched = TAMIL_NADU_CITIES.filter((c) => {
    const dist = (c.district || "").toLowerCase().trim();
    const name = c.name.toLowerCase().trim();
    return (
      dist === cleanQ ||
      cleanQ.includes(dist) ||
      dist.includes(cleanQ) ||
      name === cleanQ ||
      dist === q ||
      q.includes(dist)
    );
  });
  return matched.length > 0 ? matched : TAMIL_NADU_CITIES;
};

/**
 * Get sub-zones & villages for a district
 */
export const getSubzonesByDistrict = (districtName) => {
  if (!districtName) return TAMIL_NADU_SUBZONES;
  const q = String(districtName).toLowerCase().replace(/operational range|district|revenue|range|hub|zone/gi, "").trim();
  return TAMIL_NADU_SUBZONES.filter((s) => {
    const dist = (s.district || "").toLowerCase().trim();
    return dist === q || dist.includes(q) || q.includes(dist);
  });
};

/**
 * Generate circular GeoJSON polygon coordinates (closed ring)
 */
export const generateCircularGeoJSON = (lat, lng, radiusKm = 10, numPoints = 32) => {
  const points = [];
  const kmInDegLat = 1 / 110.574;
  const kmInDegLng = 1 / (111.32 * Math.cos((lat * Math.PI) / 180));

  for (let i = 0; i < numPoints; i++) {
    const angle = (i * 360) / numPoints;
    const rad = (angle * Math.PI) / 180;
    const pLat = lat + radiusKm * kmInDegLat * Math.sin(rad);
    const pLng = lng + radiusKm * kmInDegLng * Math.cos(rad);
    points.push([parseFloat(pLng.toFixed(6)), parseFloat(pLat.toFixed(6))]);
  }
  // Close the ring
  if (points.length > 0) {
    points.push([points[0][0], points[0][1]]);
  }

  return {
    type: "Polygon",
    coordinates: [points],
  };
};

/**
 * Calculate polygon centroid [lat, lng]
 */
export function calculatePolygonCentroid(pts) {
  if (!pts || pts.length === 0) return [11.1085, 77.3411];
  let sumLat = 0;
  let sumLng = 0;
  const count = pts.length;
  pts.forEach((p) => {
    sumLng += p[0];
    sumLat += p[1];
  });
  return [parseFloat((sumLat / count).toFixed(5)), parseFloat((sumLng / count).toFixed(5))];
}

/**
 * Ray-casting point-in-polygon algorithm
 */
export function isPointInPolygon(pt, ring) {
  const [x, y] = pt;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersect = (yi > y !== yj > y) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Open Location Code (Plus Code) generator for any Tamil Nadu coordinate
 */
export function computePlusCode(lat, lon) {
  const alphabet = "23456789CFGHJMPQRVWX";
  const boundedLat = Math.min(90.0, Math.max(-90.0, Number(lat))) + 90.0;
  const boundedLon = Math.min(180.0, Math.max(-180.0, Number(lon))) + 180.0;
  const code = [];
  let vLat = boundedLat;
  let vLon = boundedLon;
  const resolutions = [20.0, 1.0, 0.05, 0.0025, 0.000125];
  for (const r of resolutions) {
    const dLat = Math.floor(vLat / r);
    const dLon = Math.floor(vLon / r);
    vLat -= dLat * r;
    vLon -= dLon * r;
    code.push(alphabet[dLat] || "2");
    code.push(alphabet[dLon] || "2");
  }
  const s = code.join("");
  return s.slice(0, 8) + "+" + s.slice(8);
}
