
const DS_THI =[
    {
        id: 1,
        name:'Nguyễn Văn A1',
        donvi: 'Quận 1'
    }, {
        id: 2,
        name:'Nguyễn Văn A2',
        donvi: 'Quận 2'
    }, {
        id: 3,
        name:'Nguyễn Văn A3',
        donvi: 'Quận 3'
    }
]

// Require library
const xl = require('excel4node');
const fs = require('fs');

const exportExcel =async (req, res)=>{
    const {body} = req
    console.log('body: ', body);
    // const param ={
    //     uu_tien: 0, // 0: là trên 1:là dưới
    //     noi_dung_thi: "Hạng Cân 45kg",
    //     gioi_tinh: "Nữ",
    //     danh_sach_thi: [
    //         {
    //             id: 1,
    //             name:'Nguyễn Văn A1',
    //             donvi: 'Quận 1',
    //             namsinh: '2000',
    //             gioitinh: 'Nữ',
    //             ghichu: 'Tiểu học',
    //             hangcan: '45Kg',
    //             vong_loai: 0,
    //             vong_trong: 0
        
    //         },{
    //             id: 2,
    //             name:'Nguyễn Văn A1',
    //             donvi: 'Quận 1',
    //             namsinh: '2000',
    //             gioitinh: 'Nữ',
    //             ghichu: 'Tiểu học',
    //             hangcan: '45Kg',
    //             vong_loai: 0,
    //             vong_trong: 0
    //         },{
    //             id: 3,
    //             name:'Nguyễn Văn A1',
    //             donvi: 'Quận 1',
    //             namsinh: '2000',
    //             gioitinh: 'Nữ',
    //             ghichu: 'Tiểu học',
    //             hangcan: '45Kg',
    //             vong_loai: 0,
    //             vong_trong: 0
    //         },
    //     ]
    // }
    const param = body
    const caidat_bull = thongtin_caidat(body.danh_sach_thi.length)
    // caidat_bul.vong_loai | caidat_bul.vong_trong
    // Create a new instance of a Workbook class
    var wb = new xl.Workbook({
        defaultFont: {
            size: 12,
            name: 'Times New Roman',
            color: 'FFFFFFFF',
          },
    });
    // Add Worksheets to the workbook
    var ws = wb.addWorksheet('Sheet 1');

    // Create a reusable style
    var styleBottom = wb.createStyle({
        font: {
            bold: true,
            color: '#000000',
            size: 12,
        },
        alignment: {
            wrapText: true,
            horizontal: 'center',
        },
        border:{
            bottom: {
                style: 'thick',
                color: 'black'
            },
        }
    });
    var styleRight = wb.createStyle({
        font: {
            color: '#000000',
            bold: true,
            size: 12,
        },
        alignment: {
            wrapText: true,
            horizontal: 'center',
        },
        border:{
            right: {
                style: 'thick',
                color: 'black'
            },
        }
    });
    var styleBottomRight = wb.createStyle({
        font: {
            color: '#000000',
            bold: true,
            size: 12,
        },
        alignment: {
            wrapText: true,
            horizontal: 'center',
        },
        border:{
            right: {
                style: 'thick',
                color: 'black'
            },
            bottom: {
                style: 'thick',
                color: 'black'
            },
        }
    });
    // Set value of cell A1 to 100 as a number type styled with paramaters of style
    for(let i = 0; i < DS_THI.length; i++){
        // khai báo bề ngang cột
        ws.column(1).setWidth(30);
        ws.column(2).setWidth(30);
        // ws.column(3).setWidth(20);
        // ws.column(4).setWidth(20);

        if(DS_THI.length == 3){
            //  danh sách >2 và <= 4: 3 cấp
            //  danh sách > 4 và <= 8 : 4 cấp bậc
            //  danh sách > 8 <= 16 : 5 cấp bậc
            //  danh sách > 16 <= 32 : 6 cấp bậc


            if(i==0){
                ws.cell(i*2 + 3, 1).string(DS_THI[i].name).style(styleBottom)
                ws.cell(i*2 + 3, 2).string(DS_THI[i].donvi).style(styleBottom)
                ws.cell(i*2 + 3, 3).style(styleBottom)
                ws.cell(i*2+1 + 3, 3).style(styleRight)
            }else  if(i == 1){ 
                ws.cell(i*2 + 4, 1).string(DS_THI[i].name).style(styleBottom)
                ws.cell(i*2 + 4, 2).string(DS_THI[i].donvi).style(styleBottom)
                ws.cell(i*2 + 1 + 4, 2).style(styleRight)
                ws.cell(i*2 + 3, 3).style(styleRight)
                ws.cell(i*2 + 3, 4).style(styleBottom) // chung kết
                ws.cell(i*2 + 4, 3).style(styleRight)
                ws.cell(i*2+1 + 4, 3).style(styleBottomRight)
            }else{
                ws.cell(i*2 + 4, 1).string(DS_THI[i].name).style(styleBottom)
                ws.cell(i*2 + 4, 2).string(DS_THI[i].donvi).style(styleBottomRight)
            }
        }
    }
    // xuất file excel
    wb.write('./exports/Excel.xlsx');
    let listImage =[]
    try {
        // Excel to PNG in Nodejs 
        var aspose = aspose || {};
        aspose.cells = require("aspose.cells");
        // Create a workbook object and load the source file 
        var workbook = new aspose.cells.Workbook("./exports/Excel.xlsx");
        // Instantiate an instance of the ImageOrPrintOptions class to access additional image creation options 
        var imgOptions = new aspose.cells.ImageOrPrintOptions();
        // Set the image type by calling setImageType method  
        imgOptions.setImageType(aspose.cells.ImageType.PNG);
        // Invoke the get(index) method to get the first worksheet. 
        var sheet = workbook.getWorksheets().get(0);
        // Create a SheetRender object for the target sheet  
        var sr = new aspose.cells.SheetRender(sheet, imgOptions);
        for (var j = 0; j < sr.getPageCount(); j++) {
            // Invoke the toImage method to generate an image for the worksheet 
            let linkfile = "./exports/WToImage-out" + j + ".png"
            let filename = "./exports/WToImage-out" + j + ".png"
            await sr.toImage(j, linkfile);
            const base64 = base64_encode(linkfile)
            listImage.push({ 
                name: body.noi_dung_thi + ".png",
                base64: base64
            })
        } 
        return listImage
    } catch (error) {
        console.log('error: ', error);
        return []
    }
}

// lấy hình ảnh sheet theo hạng cân


// function to encode file data to base64 encoded string
function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

// Tạo file excel mẫu
const thongtin_excel_mau = async (res,soluong, noidung, uutien, danhsach)=>{
    let uu_tien =uutien
    if(!soluong ||  soluong < 3 || soluong >32){
        return
    }
    if(!uu_tien ||  uu_tien < 0 || uu_tien >1){
        uu_tien = 0;
    }
    const caidat_bul = thongtin_caidat(soluong)
    // caidat_bul.vong_loai | caidat_bul.vong_trong

    // tạo file
    let filename = "noidung_"+soluong
    if(filename){
        filename = noidung + "_" + soluong 
    }
    // tạo file excel
    let wb = new xl.Workbook({
        defaultFont: {
            size: 12,
            name: 'Times New Roman',
            color: 'black',
          },
    });
    let ws = wb.addWorksheet(filename);
    // Create a reusable style
    let styleText = wb.createStyle({
        font: {
            bold: true,
            color: '#000000',
            size: 12,
        },
        alignment: {
            wrapText: true,
            horizontal: 'center',
        },
    });
    let styleBottom = wb.createStyle({
        font: {
            bold: true,
            color: '#000000',
            size: 12,
        },
        alignment: {
            wrapText: true,
            horizontal: 'center',
        },
        border:{
            bottom: {
                style: 'thick',
                color: 'black'
            },
        }
    });

    let styleRight = wb.createStyle({
        font: {
            color: '#000000',
            bold: true,
            size: 12,
        },
        alignment: {
            wrapText: true,
            horizontal: 'center',
        },
        border:{
            right: {
                style: 'thick',
                color: 'black'
            },
        }
    });

    let styleBottomRight = wb.createStyle({
        font: {
            color: '#000000',
            bold: true,
            size: 12,
        },
        alignment: {
            wrapText: true,
            horizontal: 'center',
        },
        border:{
            right: {
                style: 'thick',
                color: 'black'
            },
            bottom: {
                style: 'thick',
                color: 'black'
            },
        }
    });

    const vi_tri_bd = 5;
    for(let i = 1; i <= soluong; i++){
        // khai báo bề ngang cột
        ws.column(1).setWidth(5);
        ws.column(2).setWidth(30);
        ws.column(3).setWidth(30);

        if(soluong == 3){
            //  danh sách > 2 và <= 4: 3 cấp
            //  danh sách > 4 và <= 8 : 4 cấp bậc
            //  danh sách > 8 <= 16 : 5 cấp bậc
            //  danh sách > 16 <= 32 : 6 cấp bậc
            const item = danhsach[i-1] 
            if(item){
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                }
            }else{
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).style(styleBottom) 
                }
            }
            if (uutien ==0 ){
                ws.cell(6, 4).style(styleBottom)   
                ws.cell(9, 4).style(styleBottom)   
                ws.cell(8, 5).style(styleBottom)   
                // border 
                ws.cell(9, 3).style(styleRight) 
                ws.cell(10, 3).style(styleRight) 
                for(let j =7 ; j <10;j++){
                    ws.cell(j, 4).style(styleRight) 
                }
            }else{
                ws.cell(7, 4).style(styleBottom)   
                ws.cell(10, 4).style(styleBottom)   
                ws.cell(8, 5).style(styleBottom)   
                // border 
                ws.cell(8, 3).style(styleRight) 
                ws.cell(7, 3).style(styleRight) 
                for(let j =8 ; j <11;j++){
                    ws.cell(j, 4).style(styleRight) 
                }
            }
        } else if(soluong == 4){ 
            //khỏi tạo tên - đơn vị :
            const item = danhsach[i-1] 
            if(item){
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                }
            }else{
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).style(styleBottom) 
                }
            }
            // sắp xếp vòng bán kết
            ws.cell(7, 4).style(styleBottom)   
            ws.cell(11, 4).style(styleBottom)   
            ws.cell(9, 5).style(styleBottom)   

            // border 
            ws.cell(11, 3).style(styleRight) 
            ws.cell(12, 3).style(styleRight) 
            ws.cell(7, 3).style(styleRight) 
            ws.cell(8, 3).style(styleRight) 
            for(let j =8 ; j <12;j++){
                ws.cell(j, 4).style(styleRight) 
            }
        } else if(soluong == 5){
            //khỏi tạo tên - đơn vị :
            const item = danhsach[i-1] 
            if(item){
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                }
            }else{
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).style(styleBottom) 
                }
            }
            if(uu_tien == 0){

                // vào vòng trong 
                ws.cell(6, 4).style(styleBottom) 
                ws.cell(8, 4).style(styleBottom) 
                ws.cell(11, 4).style(styleBottom) 
                ws.cell(14, 4).style(styleBottom) 

                // sắp xếp vòng bán kết
                ws.cell(7, 5).style(styleBottom)   
                ws.cell(13, 5).style(styleBottom)   
                ws.cell(10, 6).style(styleBottom)   

                // border 
                ws.cell(11, 3).style(styleRight) 
                ws.cell(12, 3).style(styleRight) 
                ws.cell(7, 4).style(styleRight) 
                ws.cell(8, 4).style(styleRight) 

                ws.cell(12, 4).style(styleRight) 
                ws.cell(13, 4).style(styleRight) 
                ws.cell(14, 4).style(styleRight) 
                for(let j =8 ; j <14;j++){
                    ws.cell(j, 5).style(styleRight) 
                }
            }else{
                 // vào vòng trong 
                 ws.cell(6, 4).style(styleBottom) 
                 ws.cell(9, 4).style(styleBottom) 
                 ws.cell(12, 4).style(styleBottom) 
                 ws.cell(14, 4).style(styleBottom) 
 
                 
                // sắp xếp vòng bán kết
                ws.cell(7, 5).style(styleBottom)   
                ws.cell(13, 5).style(styleBottom)   
                ws.cell(10, 6).style(styleBottom)   


                // border 
                ws.cell(9, 3).style(styleRight) 
                ws.cell(10, 3).style(styleRight) 
                ws.cell(13, 4).style(styleRight) 
                ws.cell(14, 4).style(styleRight) 

                ws.cell(7, 4).style(styleRight) 
                ws.cell(8, 4).style(styleRight) 
                ws.cell(9, 4).style(styleRight) 
                for(let j =8 ; j <14;j++){
                    ws.cell(j, 5).style(styleRight) 
                }
            }
        } else if(soluong == 6){
            //khỏi tạo tên - đơn vị :
            const item = danhsach[i-1] 
            if(item){
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                }
            }else{
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).style(styleBottom) 
                }
            }
 
            // vào vòng trong 
            ws.cell(6, 4).style(styleBottom) 
            ws.cell(9, 4).style(styleBottom) 
            ws.cell(13, 4).style(styleBottom) 
            ws.cell(16, 4).style(styleBottom) 

            // vào bán kết
            ws.cell(8, 5).style(styleBottom) 
            ws.cell(15, 5).style(styleBottom) 

            // chung kết 
            ws.cell(7 + vi_tri_bd, 6).style(styleBottom) 


            // border
            ws.cell(10, 3).style(styleRight) 
            ws.cell(9, 3).style(styleRight) 
            ws.cell(14, 3).style(styleRight) 
            ws.cell(13, 3).style(styleRight) 

            for(let j =7 ; j < 10;j++){
                ws.cell(j, 4).style(styleRight) 
            }

            for(let j =14 ; j < 17;j++){
                ws.cell(j, 4).style(styleRight) 
            }

            for(let j =9 ; j <16;j++){
                ws.cell(j, 5).style(styleRight) 
            }

    
        } else if (soluong == 7){
            if(uu_tien == 0){
                //khỏi tạo tên - đơn vị :
                const item = danhsach[i-1] 
                if(item){
                    if(i == 1){
                        ws.cell(i + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                        ws.cell(i + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                        ws.cell(i + vi_tri_bd, 1).string(i+".")
                    } else{
                        ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                        ws.cell(i*2 -1 + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                        ws.cell(i*2 -1 + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                    }
                }else{
                    if(i == 1){
                        ws.cell(i + vi_tri_bd, 3).style(styleBottom) 
                        ws.cell(i + vi_tri_bd, 2).style(styleBottom) 
                        ws.cell(i + vi_tri_bd, 1).string(i+".")
                    } else{
                        ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                        ws.cell(i*2 -1 + vi_tri_bd, 2).style(styleBottom) 
                        ws.cell(i*2 -1 + vi_tri_bd, 3).style(styleBottom) 
                    }
                }

                // vòng trong
                ws.cell(6, 4).style(styleBottom) 
                ws.cell(9, 4).style(styleBottom) 
                ws.cell(13, 4).style(styleBottom) 
                ws.cell(17, 4).style(styleBottom) 

                //bán kết 
                ws.cell(8, 5).style(styleBottom) 
                ws.cell(16, 5).style(styleBottom) 
                // chung kết
                ws.cell(12, 6).style(styleBottom) 

                // border
                ws.cell(10, 3).style(styleRight) 
                ws.cell(9, 3).style(styleRight) 
                ws.cell(14, 3).style(styleRight) 
                ws.cell(13, 3).style(styleRight) 
                ws.cell(18, 3).style(styleRight) 
                ws.cell(17, 3).style(styleRight) 

                for(let j =7 ; j < 10;j++){
                    ws.cell(j, 4).style(styleRight) 
                }

                for(let j =14 ; j < 18;j++){
                    ws.cell(j, 4).style(styleRight) 
                }
    
                for(let j =9 ; j <17;j++){
                    ws.cell(j, 5).style(styleRight) 
                }


                 
            }else{
                //khỏi tạo tên - đơn vị :
                const item = danhsach[i-1] 
                if(item){
                    if(i == 1){
                        ws.cell(i + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                        ws.cell(i + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                        ws.cell(i + vi_tri_bd, 1).string(i+".")
                    } else{
                        ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                        ws.cell(i*2 -1 + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                        ws.cell(i*2 -1 + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                    }
                }else{
                    if(i == 1){
                        ws.cell(i + vi_tri_bd, 3).style(styleBottom) 
                        ws.cell(i + vi_tri_bd, 2).style(styleBottom) 
                        ws.cell(i + vi_tri_bd, 1).string(i+".")
                    } else{
                        ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                        ws.cell(i*2 -1 + vi_tri_bd, 2).style(styleBottom) 
                        ws.cell(i*2 -1 + vi_tri_bd, 3).style(styleBottom) 
                    }
                }
                // vòng trong
                ws.cell(7, 4).style(styleBottom) 
                ws.cell(11, 4).style(styleBottom) 
                ws.cell(15, 4).style(styleBottom) 
                ws.cell(18, 4).style(styleBottom) 

                //bán kết 
                ws.cell(9, 5).style(styleBottom) 
                ws.cell(17, 5).style(styleBottom) 
                // chung kết
                ws.cell(13, 6).style(styleBottom) 

                // border
                ws.cell(7, 3).style(styleRight) 
                ws.cell(8, 3).style(styleRight) 
                ws.cell(11, 3).style(styleRight) 
                ws.cell(12, 3).style(styleRight) 
                ws.cell(15, 3).style(styleRight) 
                ws.cell(16, 3).style(styleRight) 

                for(let j =8 ; j < 12;j++){
                    ws.cell(j, 4).style(styleRight) 
                }

                for(let j =16 ; j < 19;j++){
                    ws.cell(j, 4).style(styleRight) 
                }
    
                for(let j =10 ; j <18;j++){
                    ws.cell(j, 5).style(styleRight) 
                }

            }
        } else if (soluong == 8){
            //khỏi tạo tên - đơn vị :
            const item = danhsach[i-1] 
            if(item){
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                }
            }else{
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).style(styleBottom) 
                }
            }

            // bán kết
            ws.cell(7, 4).style(styleBottom) 
            ws.cell(11, 4).style(styleBottom) 
            ws.cell(15, 4).style(styleBottom) 
            ws.cell(19, 4).style(styleBottom) 

            // chung kết
            ws.cell(9, 5).style(styleBottom) 
            ws.cell(17, 5).style(styleBottom) 
            ws.cell(13, 6).style(styleBottom) 


            // border
            ws.cell(7, 3).style(styleRight) 
            ws.cell(8, 3).style(styleRight) 
            ws.cell(11, 3).style(styleRight) 
            ws.cell(12, 3).style(styleRight) 
            ws.cell(15, 3).style(styleRight) 
            ws.cell(16, 3).style(styleRight) 
            ws.cell(19, 3).style(styleRight) 
            ws.cell(20, 3).style(styleRight) 

            
            for(let j =8 ; j < 12;j++){
                ws.cell(j, 4).style(styleRight) 
            }
            for(let j =16 ; j < 20;j++){
                ws.cell(j, 4).style(styleRight) 
            }

            for(let j =10 ; j <18;j++){
                ws.cell(j, 5).style(styleRight) 
            }
        } else if (soluong == 9){
            if(uu_tien == 0){
                //khỏi tạo tên - đơn vị :
                const item = danhsach[i-1] 
                if(item){
                    if(i == 1){
                        ws.cell(i + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                        ws.cell(i + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                        ws.cell(i + vi_tri_bd, 1).string(i+".")
                    } else{
                        ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                        ws.cell(i*2 -1 + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                        ws.cell(i*2 -1 + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                    }
                }else{
                    if(i == 1){
                        ws.cell(i + vi_tri_bd, 3).style(styleBottom) 
                        ws.cell(i + vi_tri_bd, 2).style(styleBottom) 
                        ws.cell(i + vi_tri_bd, 1).string(i+".")
                    } else{
                        ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                        ws.cell(i*2 -1 + vi_tri_bd, 2).style(styleBottom) 
                        ws.cell(i*2 -1 + vi_tri_bd, 3).style(styleBottom) 
                    }
                }

                // vào vòng trong
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 4).style(styleBottom) 
                } else if(i < 6 || i > 7){
                    ws.cell(i*2 -1 + vi_tri_bd, 4).style(styleBottom) 
                } else if(i == 6){
                    ws.cell(i*2 + vi_tri_bd, 4).style(styleBottom) 
                }
                // bán kết
                ws.cell(7, 5).style(styleBottom) 
                ws.cell(11, 5).style(styleBottom) 
                ws.cell(15, 5).style(styleBottom) 
                ws.cell(21, 5 ).style(styleBottom) 

                // chung kết
                ws.cell(9, 6 ).style(styleBottom) 
                ws.cell(18, 6 ).style(styleBottom) 
                ws.cell(13, 7 ).style(styleBottom) 

                // border
                ws.cell(17, 3 ).style(styleRight) 
                ws.cell(18, 3 ).style(styleRight) 

                ws.cell(7, 4 ).style(styleRight) 
                ws.cell(8, 4 ).style(styleRight)                 
                ws.cell(11, 4 ).style(styleRight) 
                ws.cell(12, 4 ).style(styleRight) 
                ws.cell(15, 4 ).style(styleRight) 
                ws.cell(16, 4 ).style(styleRight) 
                ws.cell(17, 4 ).style(styleRight) 
                ws.cell(21, 4 ).style(styleRight) 
                ws.cell(22, 4 ).style(styleRight) 

                for(let j =8 ; j <12;j++){
                    ws.cell(j, 5).style(styleRight) 
                }
                for(let j =16 ; j <22;j++){
                    ws.cell(j, 5).style(styleRight) 
                }
                for(let j =10 ; j <19;j++){
                    ws.cell(j, 6).style(styleRight) 
                }

            }else{
                //khỏi tạo tên - đơn vị :
                const item = danhsach[i-1] 
                if(item){
                    if(i == 1){
                        ws.cell(i + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                        ws.cell(i + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                        ws.cell(i + vi_tri_bd, 1).string(i+".")
                    } else{
                        ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                        ws.cell(i*2 -1 + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                        ws.cell(i*2 -1 + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                    }
                }else{
                    if(i == 1){
                        ws.cell(i + vi_tri_bd, 3).style(styleBottom) 
                        ws.cell(i + vi_tri_bd, 2).style(styleBottom) 
                        ws.cell(i + vi_tri_bd, 1).string(i+".")
                    } else{
                        ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                        ws.cell(i*2 -1 + vi_tri_bd, 2).style(styleBottom) 
                        ws.cell(i*2 -1 + vi_tri_bd, 3).style(styleBottom) 
                    }
                }

                // vào vòng trong
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 4).style(styleBottom) 
                } else if(i < 3 || i > 4){
                    ws.cell(i*2 -1 + vi_tri_bd, 4).style(styleBottom) 
                } else if(i == 3){
                    ws.cell(i*2 + vi_tri_bd, 4).style(styleBottom) 
                }
                // bán kết
                ws.cell(7, 5).style(styleBottom) 
                ws.cell(12, 5).style(styleBottom) 
                ws.cell(17, 5).style(styleBottom) 
                ws.cell(21, 5 ).style(styleBottom) 


                // chung kết
                ws.cell(10, 6 ).style(styleBottom) 
                ws.cell(19, 6 ).style(styleBottom) 
                ws.cell(15, 7 ).style(styleBottom) 


                // border
                ws.cell(11, 3 ).style(styleRight) 
                ws.cell(12, 3 ).style(styleRight) 

                ws.cell(7, 4 ).style(styleRight) 
                ws.cell(8, 4 ).style(styleRight)                 
                ws.cell(17, 4 ).style(styleRight) 
                ws.cell(18, 4 ).style(styleRight) 

                ws.cell(12, 4 ).style(styleRight) 
                ws.cell(13, 4 ).style(styleRight) 
                ws.cell(14, 4 ).style(styleRight) 
                ws.cell(21, 4 ).style(styleRight) 
                ws.cell(22, 4 ).style(styleRight) 

                for(let j =8 ; j <13;j++){
                    ws.cell(j, 5).style(styleRight) 
                }
                for(let j =18 ; j <22;j++){
                    ws.cell(j, 5).style(styleRight) 
                }
                for(let j =11 ; j <20;j++){
                    ws.cell(j, 6).style(styleRight) 
                }
            }
        } else if ( soluong == 10 ){
            //khỏi tạo tên - đơn vị :
            const item = danhsach[i-1] 
            if(item){
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                }
            }else{
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).style(styleBottom) 
                }
            }

            // vào vòng trong
            if(i == 1){
                ws.cell(i + vi_tri_bd, 3).style(styleBottom) 
            }else{
                if([3,4,8,9].includes(i)){
                    if([3,8].includes(i)){
                        ws.cell(i*2 + vi_tri_bd, 3).style(styleBottom) 
                    }
                }else{
                    ws.cell(i*2 -1 + vi_tri_bd, 3).style(styleBottom) 
                }
            }

            // bán kết
            ws.cell(7, 4).style(styleBottom) 
            ws.cell(12, 4).style(styleBottom) 
            ws.cell(17, 4).style(styleBottom) 
            ws.cell(22, 4 ).style(styleBottom) 

            // chung kết
            ws.cell(9, 5 ).style(styleBottom) 
            ws.cell(20, 5 ).style(styleBottom) 
            ws.cell(15, 6 ).style(styleBottom) 

            // border
            ws.cell(11, 2 ).style(styleRight) 
            ws.cell(12, 2 ).style(styleRight) 
            ws.cell(21, 2 ).style(styleRight) 
            ws.cell(22, 2 ).style(styleRight) 
            

            ws.cell(7, 3 ).style(styleRight) 
            ws.cell(8, 3 ).style(styleRight) 

            ws.cell(12, 3 ).style(styleRight) 
            ws.cell(13, 3 ).style(styleRight) 
            ws.cell(14, 3 ).style(styleRight) 

            ws.cell(17, 3 ).style(styleRight) 
            ws.cell(18, 3 ).style(styleRight) 

            ws.cell(22, 3 ).style(styleRight) 
            ws.cell(23, 3 ).style(styleRight) 
            ws.cell(24, 3 ).style(styleRight) 

            for(let j =8 ; j <13;j++){
                ws.cell(j, 4).style(styleRight) 
            }
            for(let j =18 ; j <23;j++){
                ws.cell(j, 4).style(styleRight) 
            }
            for(let j =10 ; j <21;j++){
                ws.cell(j, 5).style(styleRight) 
            }
        } else if ( soluong == 11){
            if( uu_tien == 0 ){
                //khỏi tạo tên - đơn vị :
                const item = danhsach[i-1] 
                if(item){
                    if(i == 1){
                        ws.cell(i + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                        ws.cell(i + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                        ws.cell(i + vi_tri_bd, 1).string(i+".")
                    } else{
                        ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                        ws.cell(i*2 -1 + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                        ws.cell(i*2 -1 + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                    }
                }else{
                    if(i == 1){
                        ws.cell(i + vi_tri_bd, 3).style(styleBottom) 
                        ws.cell(i + vi_tri_bd, 2).style(styleBottom) 
                        ws.cell(i + vi_tri_bd, 1).string(i+".")
                    } else{
                        ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                        ws.cell(i*2 -1 + vi_tri_bd, 2).style(styleBottom) 
                        ws.cell(i*2 -1 + vi_tri_bd, 3).style(styleBottom) 
                    }
                }

                // vào vòng trong
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 4).style(styleBottom) 
                }else{
                    if([3,4,7,8,9,10].includes(i)){
                        if([3,7,9].includes(i)){
                            ws.cell(i*2 + vi_tri_bd, 4).style(styleBottom) 
                        }
                    }else{
                        ws.cell(i*2 -1 + vi_tri_bd, 4).style(styleBottom) 
                    }
                }
                 // bán kết
                ws.cell(7, 5).style(styleBottom) 
                ws.cell(12, 5).style(styleBottom) 
                ws.cell(17, 5).style(styleBottom) 
                ws.cell(24, 5 ).style(styleBottom) 

                // chung kết
                ws.cell(9, 6 ).style(styleBottom) 
                ws.cell(20, 6 ).style(styleBottom) 
                ws.cell(15, 7 ).style(styleBottom) 

                // tạo border 
                if([3,7,9].includes(i)){
                    ws.cell(i*2 + vi_tri_bd, 3 ).style(styleRight) 
                    ws.cell(i*2 + 1 + vi_tri_bd, 3 ).style(styleRight) 
                }

                if([4,10].includes(i)){
                    ws.cell(i*2 - 1 + vi_tri_bd, 4 ).style(styleRight) 
                    ws.cell(i*2 + vi_tri_bd, 4 ).style(styleRight) 
                    ws.cell(i*2 + 1 + vi_tri_bd, 4 ).style(styleRight) 
                }
                if([6].includes(i)){
                    ws.cell(i*2 + vi_tri_bd, 4 ).style(styleRight) 
                    ws.cell(i*2 + 1 + vi_tri_bd, 4 ).style(styleRight) 
                    ws.cell(i*2 + 2 + vi_tri_bd, 4 ).style(styleRight) 
                }
                if([1].includes(i)){
                    ws.cell(i*2 + vi_tri_bd, 4 ).style(styleRight) 
                    ws.cell(i*2 + 1 + vi_tri_bd, 4 ).style(styleRight) 
                }


                for(let j =8 ; j <13;j++){
                    ws.cell(j, 5).style(styleRight) 
                }
                for(let j =18 ; j <25;j++){
                    ws.cell(j, 5).style(styleRight) 
                }
                for(let j =10 ; j <21;j++){
                    ws.cell(j, 6).style(styleRight) 
                }

            }else{
                //khỏi tạo tên - đơn vị :
                const item = danhsach[i-1] 
                if(item){
                    if(i == 1){
                        ws.cell(i + vi_tri_bd, 1).string(i+".").style(styleText)
                        ws.cell(i + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                        ws.cell(i + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
    
                    } else{
                        ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".").style(styleText)
                        ws.cell(i*2 -1 + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                        ws.cell(i*2 -1 + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
    
                    }
                }else{
                    if(i == 1){
                        ws.cell(i + vi_tri_bd, 2).style(styleBottom) 
                        ws.cell(i + vi_tri_bd, 3).style(styleBottom) 
                        ws.cell(i + vi_tri_bd, 1).string(i+".").style(styleText)
    
                    } else{
                        ws.cell(i*2 -1 + vi_tri_bd, 2).style(styleBottom) 
                        ws.cell(i*2 -1 + vi_tri_bd, 3).style(styleBottom) 
                        ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".").style(styleText)
                    }
                }

                // vào vòng trong
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 4).style(styleBottom) 
                }else{
                    if([2,3,4,5,9,10].includes(i)){
                        if([2,4,9].includes(i)){
                            ws.cell(i*2 + vi_tri_bd, 4).style(styleBottom) 
                        }
                    }else{
                        ws.cell(i*2 -1 + vi_tri_bd, 4).style(styleBottom) 
                    }
                }
                 // bán kết
                ws.cell(7, 5).style(styleBottom) 
                ws.cell(14, 5).style(styleBottom) 
                ws.cell(19, 5).style(styleBottom) 
                ws.cell(24, 5 ).style(styleBottom) 

                // chung kết
                ws.cell(11, 6 ).style(styleBottom) 
                ws.cell(22, 6 ).style(styleBottom) 
                ws.cell(16, 7 ).style(styleBottom) 

                // tạo border 
                if([2,4,9].includes(i)){
                    ws.cell(i*2 + vi_tri_bd, 3 ).style(styleRight) 
                    ws.cell(i*2 + 1 + vi_tri_bd, 3 ).style(styleRight) 
                }

                if([5,10].includes(i)){
                    ws.cell(i*2 - 1 + vi_tri_bd, 4 ).style(styleRight) 
                    ws.cell(i*2 + vi_tri_bd, 4 ).style(styleRight) 
                    ws.cell(i*2 + 1 + vi_tri_bd, 4 ).style(styleRight) 
                }

                if([1].includes(i)){
                    ws.cell(i*2 + vi_tri_bd, 4 ).style(styleRight) 
                    ws.cell(i*2 + 1 + vi_tri_bd, 4 ).style(styleRight) 
                    ws.cell(i*2 + 2 + vi_tri_bd, 4 ).style(styleRight) 
                }
                if([7].includes(i)){
                    ws.cell(i*2 + vi_tri_bd, 4 ).style(styleRight) 
                    ws.cell(i*2 + 1 + vi_tri_bd, 4 ).style(styleRight) 
                }

                for(let j =8 ; j <15;j++){
                    ws.cell(j, 5).style(styleRight) 
                }
                for(let j =20 ; j <25;j++){
                    ws.cell(j, 5).style(styleRight) 
                }
                for(let j =12 ; j <23;j++){
                    ws.cell(j, 6).style(styleRight) 
                }

            }
        } else if ( soluong == 12){
             //khỏi tạo tên - đơn vị :
            const item = danhsach[i-1] 
            if(item){
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                }
            }else{
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).style(styleBottom) 
                }
            }
            
            // vào vòng trong
            if(i == 1){
                ws.cell(i + vi_tri_bd, 4).style(styleBottom) 
            }else{
                if([2,3,4,5,8,9,10,11].includes(i)){
                    if([2,4,8,10].includes(i)){
                        ws.cell(i*2 + vi_tri_bd, 4).style(styleBottom) 
                    }
                }else{
                    ws.cell(i*2 -1 + vi_tri_bd, 4).style(styleBottom) 
                }
            }
            // bán kết
            ws.cell(7, 5).style(styleBottom) 
            ws.cell(14, 5).style(styleBottom) 
            ws.cell(19, 5).style(styleBottom) 
            ws.cell(26, 5 ).style(styleBottom) 

            // chung kết
            ws.cell(11, 6 ).style(styleBottom) 
            ws.cell(23, 6 ).style(styleBottom) 
            ws.cell(17, 7 ).style(styleBottom) 

            // tạo border 
            if([2,4,8,10].includes(i)){
                ws.cell(i*2 + vi_tri_bd, 3 ).style(styleRight) 
                ws.cell(i*2 + 1 + vi_tri_bd, 3 ).style(styleRight) 
            }

            if([5,11].includes(i)){
                ws.cell(i*2 - 1 + vi_tri_bd, 4 ).style(styleRight) 
                ws.cell(i*2 + vi_tri_bd, 4 ).style(styleRight) 
                ws.cell(i*2 + 1 + vi_tri_bd, 4 ).style(styleRight) 
            }

            if([1,7].includes(i)){
                ws.cell(i*2 + vi_tri_bd, 4 ).style(styleRight) 
                ws.cell(i*2 + 1 + vi_tri_bd, 4 ).style(styleRight) 
                ws.cell(i*2 + 2 + vi_tri_bd, 4 ).style(styleRight) 
            }
            // if([7].includes(i)){
            //     ws.cell(i*2 + vi_tri_bd, 4 ).style(styleRight) 
            //     ws.cell(i*2 + 1 + vi_tri_bd, 4 ).style(styleRight) 
            // }

            for(let j =8 ; j <15;j++){
                ws.cell(j, 5).style(styleRight) 
            }
            for(let j =20 ; j <27;j++){
                ws.cell(j, 5).style(styleRight) 
            }
            for(let j =12 ; j <24;j++){
                ws.cell(j, 6).style(styleRight) 
            }

        } else if ( soluong == 13){
            
            //khỏi tạo tên - đơn vị :
            const item = danhsach[i-1] 
            if(item){
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                }
            }else{
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).style(styleBottom) 
                }
            }
            if(uu_tien ==0){
                // vào vòng trong
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 4).style(styleBottom) 
                }else{
                    if([2,3,4,5,7,8,9,10,11,12].includes(i)){
                        if([2,4,7,9,11].includes(i)){
                            ws.cell(i*2 + vi_tri_bd, 4).style(styleBottom) 
                        }
                    }else{
                        ws.cell(i*2 -1 + vi_tri_bd, 4).style(styleBottom) 
                    }
                }
                // bán kết
                ws.cell(7, 5).style(styleBottom) 
                ws.cell(14, 5).style(styleBottom) 
                ws.cell(21, 5).style(styleBottom) 
                ws.cell(28, 5 ).style(styleBottom) 

                // chung kết
                ws.cell(11, 6 ).style(styleBottom) 
                ws.cell(25, 6 ).style(styleBottom) 
                ws.cell(18, 7 ).style(styleBottom) 

                // tạo border 
                if([2,4,7,9,11].includes(i)){
                    ws.cell(i*2 + vi_tri_bd, 3 ).style(styleRight) 
                    ws.cell(i*2 + 1 + vi_tri_bd, 3 ).style(styleRight) 
                }

                // 3 ô dưới
                if([12,5].includes(i)){
                    ws.cell(i*2 - 1 + vi_tri_bd, 4 ).style(styleRight) 
                    ws.cell(i*2 + vi_tri_bd, 4 ).style(styleRight) 
                    ws.cell(i*2 + 1 + vi_tri_bd, 4 ).style(styleRight) 
                }
                
                // 3 ô trên 
                if([1].includes(i)){
                    ws.cell(i*2 + vi_tri_bd, 4 ).style(styleRight) 
                    ws.cell(i*2 + 1 + vi_tri_bd, 4 ).style(styleRight) 
                    ws.cell(i*2 + 2 + vi_tri_bd, 4 ).style(styleRight) 
                }

                // 4 ô 
                if([8].includes(i)){
                    ws.cell(i*2 - 1 + vi_tri_bd, 4 ).style(styleRight) 
                    ws.cell(i*2 + vi_tri_bd, 4 ).style(styleRight) 
                    ws.cell(i*2 + 1 + vi_tri_bd, 4 ).style(styleRight) 
                    ws.cell(i*2 + 2 + vi_tri_bd, 4 ).style(styleRight) 
                }

                for(let j =8 ; j <15;j++){
                    ws.cell(j, 5).style(styleRight) 
                }
                for(let j =22 ; j <29;j++){
                    ws.cell(j, 5).style(styleRight) 
                }
                for(let j =12 ; j <26;j++){
                    ws.cell(j, 6).style(styleRight) 
                }
            }else {
                // vào vòng trong
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 4).style(styleBottom) 
                }else{
                    if([2,3,4,5,6,7,9,10,11,12].includes(i)){
                        if([2,4,6,9,11].includes(i)){
                            ws.cell(i*2 + vi_tri_bd, 4).style(styleBottom) 
                        }
                    }else{
                        ws.cell(i*2 -1 + vi_tri_bd, 4).style(styleBottom) 
                    }
                }
                // bán kết
                ws.cell(7, 5).style(styleBottom) 
                ws.cell(15, 5).style(styleBottom) 
                ws.cell(21, 5).style(styleBottom) 
                ws.cell(28, 5 ).style(styleBottom) 

                // chung kết
                ws.cell(11, 6 ).style(styleBottom) 
                ws.cell(25, 6 ).style(styleBottom) 
                ws.cell(19, 7 ).style(styleBottom) 

                // tạo border 
                if([2,4,6,9,11].includes(i)){
                    ws.cell(i*2 + vi_tri_bd, 3 ).style(styleRight) 
                    ws.cell(i*2 + 1 + vi_tri_bd, 3 ).style(styleRight) 
                }
                // 3 ô dưới
                if([12].includes(i)){
                    ws.cell(i*2 - 1 + vi_tri_bd, 4 ).style(styleRight) 
                    ws.cell(i*2 + vi_tri_bd, 4 ).style(styleRight) 
                    ws.cell(i*2 + 1 + vi_tri_bd, 4 ).style(styleRight) 
                }
                
                // 3 ô trên 
                if([1,8].includes(i)){
                    ws.cell(i*2 + vi_tri_bd, 4 ).style(styleRight) 
                    ws.cell(i*2 + 1 + vi_tri_bd, 4 ).style(styleRight) 
                    ws.cell(i*2 + 2 + vi_tri_bd, 4 ).style(styleRight) 
                }

                // 4 ô 
                if([5].includes(i)){
                    ws.cell(i*2 - 1 + vi_tri_bd, 4 ).style(styleRight) 
                    ws.cell(i*2 + vi_tri_bd, 4 ).style(styleRight) 
                    ws.cell(i*2 + 1 + vi_tri_bd, 4 ).style(styleRight) 
                    ws.cell(i*2 + 2 + vi_tri_bd, 4 ).style(styleRight) 
                }

                for(let j =8 ; j <16;j++){
                    ws.cell(j, 5).style(styleRight) 
                }
                for(let j =22 ; j <29;j++){
                    ws.cell(j, 5).style(styleRight) 
                }
                for(let j =12 ; j <26;j++){
                    ws.cell(j, 6).style(styleRight) 
                }
            }

        } else if ( soluong == 14){
            //khỏi tạo tên - đơn vị :
            const item = danhsach[i-1] 
            if(item){
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                }
            }else{
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).style(styleBottom) 
                }
            }
            // vào vòng trong
            if(i == 1){
                ws.cell(i + vi_tri_bd, 4).style(styleBottom) 
            }else{
                if([2,3,4,5,6,7,8,9,10,11,12,13].includes(i)){
                    if([2,4,6,8,10,12].includes(i)){
                        ws.cell(i*2 + vi_tri_bd, 4).style(styleBottom) 
                    }
                }else{
                    ws.cell(i*2 -1 + vi_tri_bd, 4).style(styleBottom) 
                }
            }

            // bán kết
            ws.cell(7, 5).style(styleBottom) 
            ws.cell(15, 5).style(styleBottom) 
            ws.cell(23, 5).style(styleBottom) 
            ws.cell(30, 5 ).style(styleBottom) 
            // chung kết
            ws.cell(11, 6 ).style(styleBottom) 
            ws.cell(27, 6 ).style(styleBottom) 
            ws.cell(19, 7 ).style(styleBottom) 

            // tạo border 
            if([2,4,6,8,10,12].includes(i)){
                ws.cell(i*2 + vi_tri_bd, 3 ).style(styleRight) 
                ws.cell(i*2 + 1 + vi_tri_bd, 3 ).style(styleRight) 
            }
            // 3 ô dưới
            if([13].includes(i)){
                ws.cell(i*2 - 1 + vi_tri_bd, 4 ).style(styleRight) 
                ws.cell(i*2 + vi_tri_bd, 4 ).style(styleRight) 
                ws.cell(i*2 + 1 + vi_tri_bd, 4 ).style(styleRight) 
            }
            
            // 3 ô trên 
            if([1].includes(i)){
                ws.cell(i*2 + vi_tri_bd, 4 ).style(styleRight) 
                ws.cell(i*2 + 1 + vi_tri_bd, 4 ).style(styleRight) 
                ws.cell(i*2 + 2 + vi_tri_bd, 4 ).style(styleRight) 
            }

            // 4 ô 
            if([5,9].includes(i)){
                ws.cell(i*2 - 1 + vi_tri_bd, 4 ).style(styleRight) 
                ws.cell(i*2 + vi_tri_bd, 4 ).style(styleRight) 
                ws.cell(i*2 + 1 + vi_tri_bd, 4 ).style(styleRight) 
                ws.cell(i*2 + 2 + vi_tri_bd, 4 ).style(styleRight) 
            }

            for(let j =8 ; j <16;j++){
                ws.cell(j, 5).style(styleRight) 
            }
            for(let j =24 ; j <31;j++){
                ws.cell(j, 5).style(styleRight) 
            }
            for(let j =12 ; j <28;j++){
                ws.cell(j, 6).style(styleRight) 
            }

        } else if ( soluong == 15){
            //khỏi tạo tên - đơn vị :
            const item = danhsach[i-1] 
            if(item){
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                }
            }else{
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).style(styleBottom) 
                }
            }
            if(uu_tien == 0){
                // vào vòng trong
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 4).style(styleBottom) 
                }else{
                    if([2,3,4,5,6,7,8,9,10,11,12,13,14,15].includes(i)){
                        if([2,4,6,8,10,12,14].includes(i)){
                            ws.cell(i*2 + vi_tri_bd, 4).style(styleBottom) 
                        }
                    }else{
                        ws.cell(i*2 -1 + vi_tri_bd, 4).style(styleBottom) 
                    }
                }
                // bán kết
                ws.cell(7, 5).style(styleBottom) 
                ws.cell(15, 5).style(styleBottom) 
                ws.cell(23, 5).style(styleBottom) 
                ws.cell(31, 5 ).style(styleBottom) 
                // chung kết
                ws.cell(11, 6 ).style(styleBottom) 
                ws.cell(27, 6 ).style(styleBottom) 
                ws.cell(19, 7 ).style(styleBottom)

                // tạo border 
                if([2,4,6,8,10,12, 14].includes(i)){
                    ws.cell(i*2 + vi_tri_bd, 3 ).style(styleRight) 
                    ws.cell(i*2 + 1 + vi_tri_bd, 3 ).style(styleRight) 
                }
                // // 3 ô dưới
                // if([13].includes(i)){
                //     ws.cell(i*2 - 1 + vi_tri_bd, 4 ).style(styleRight) 
                //     ws.cell(i*2 + vi_tri_bd, 4 ).style(styleRight) 
                //     ws.cell(i*2 + 1 + vi_tri_bd, 4 ).style(styleRight) 
                // }
                
                // 3 ô trên 
                if([1].includes(i)){
                    ws.cell(i*2 + vi_tri_bd, 4 ).style(styleRight) 
                    ws.cell(i*2 + 1 + vi_tri_bd, 4 ).style(styleRight) 
                    ws.cell(i*2 + 2 + vi_tri_bd, 4 ).style(styleRight) 
                }

                // 4 ô 
                if([5,9,13].includes(i)){
                    ws.cell(i*2 - 1 + vi_tri_bd, 4 ).style(styleRight) 
                    ws.cell(i*2 + vi_tri_bd, 4 ).style(styleRight) 
                    ws.cell(i*2 + 1 + vi_tri_bd, 4 ).style(styleRight) 
                    ws.cell(i*2 + 2 + vi_tri_bd, 4 ).style(styleRight) 
                }

                for(let j =8 ; j <16;j++){
                    ws.cell(j, 5).style(styleRight) 
                }
                for(let j =24 ; j <32;j++){
                    ws.cell(j, 5).style(styleRight) 
                }
                for(let j =12 ; j <28;j++){
                    ws.cell(j, 6).style(styleRight) 
                }

            }else{
                 // vào vòng trong
                if([1,2,3,4,5,6,7,8,9,10,11,12,13,14].includes(i)){
                    if([1,3,5,7,9,11,13].includes(i)){
                        ws.cell(i*2 + vi_tri_bd, 4).style(styleBottom) 
                    }
                }else{
                    ws.cell(i*2 -1 + vi_tri_bd, 4).style(styleBottom) 
                }
                // bán kết
                ws.cell(9, 5).style(styleBottom) 
                ws.cell(17, 5).style(styleBottom) 
                ws.cell(25, 5).style(styleBottom) 
                ws.cell(32, 5 ).style(styleBottom) 
                // chung kết
                ws.cell(11, 6 ).style(styleBottom) 
                ws.cell(27, 6 ).style(styleBottom) 
                ws.cell(19, 7 ).style(styleBottom)

                // tạo border 
                if([1,3,5,7,9,11,13].includes(i)){
                    ws.cell(i*2 + vi_tri_bd, 3 ).style(styleRight) 
                    ws.cell(i*2 + 1 + vi_tri_bd, 3 ).style(styleRight) 
                }
                // 3 ô dưới
                if([14].includes(i)){
                    ws.cell(i*2 - 1 + vi_tri_bd, 4 ).style(styleRight) 
                    ws.cell(i*2 + vi_tri_bd, 4 ).style(styleRight) 
                    ws.cell(i*2 + 1 + vi_tri_bd, 4 ).style(styleRight) 
                }
                
                // // 3 ô trên 
                // if([1].includes(i)){
                //     ws.cell(i*2 + vi_tri_bd, 4 ).style(styleRight) 
                //     ws.cell(i*2 + 1 + vi_tri_bd, 4 ).style(styleRight) 
                //     ws.cell(i*2 + 2 + vi_tri_bd, 4 ).style(styleRight) 
                // }

                // 4 ô 
                if([2,6,10].includes(i)){
                    ws.cell(i*2 - 1 + vi_tri_bd, 4 ).style(styleRight) 
                    ws.cell(i*2 + vi_tri_bd, 4 ).style(styleRight) 
                    ws.cell(i*2 + 1 + vi_tri_bd, 4 ).style(styleRight) 
                    ws.cell(i*2 + 2 + vi_tri_bd, 4 ).style(styleRight) 
                }

                for(let j =9 ; j <18;j++){
                    ws.cell(j, 5).style(styleRight) 
                }
                for(let j =26 ; j <33 ;j++){
                    ws.cell(j, 5).style(styleRight) 
                }
                for(let j =12 ; j <28;j++){
                    ws.cell(j, 6).style(styleRight) 
                }
            }

        } else if ( soluong == 16){
            //khỏi tạo tên - đơn vị :
            const item = danhsach[i-1] 
            if(item){
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                }
            }else{
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).style(styleBottom) 
                }
            }
            // vào vòng trong
            if([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].includes(i)){
                if([1,3,5,7,9,11,13,15].includes(i)){
                    ws.cell(i*2 + vi_tri_bd, 4).style(styleBottom) 
                }
            }else{
                ws.cell(i*2 -1 + vi_tri_bd, 4).style(styleBottom) 
            }

            // bán kết
            ws.cell(9, 5).style(styleBottom) 
            ws.cell(17, 5).style(styleBottom) 
            ws.cell(25, 5).style(styleBottom) 
            ws.cell(33, 5 ).style(styleBottom) 
            // chung kết
            ws.cell(13, 6 ).style(styleBottom) 
            ws.cell(29, 6 ).style(styleBottom) 
            ws.cell(19, 7 ).style(styleBottom)

            // tạo border 
            if([1,3,5,7,9,11,13,15].includes(i)){
                ws.cell(i*2 + vi_tri_bd, 3 ).style(styleRight) 
                ws.cell(i*2 + 1 + vi_tri_bd, 3 ).style(styleRight) 
            }
            // 4 ô 
            if([1,5,9,13].includes(i)){
                ws.cell(i*2 + 1 + vi_tri_bd, 4 ).style(styleRight) 
                ws.cell(i*2 + 2 + vi_tri_bd, 4 ).style(styleRight) 
                ws.cell(i*2 + 3 + vi_tri_bd, 4 ).style(styleRight) 
                ws.cell(i*2 + 4 + vi_tri_bd, 4 ).style(styleRight) 
            }

            for(let j =10 ; j <18;j++){
                ws.cell(j, 5).style(styleRight) 
            }
            for(let j =26 ; j <34 ;j++){
                ws.cell(j, 5).style(styleRight) 
            }
            for(let j =14 ; j <30;j++){
                ws.cell(j, 6).style(styleRight) 
            }

        } else if ( soluong == 17){
            //khỏi tạo tên - đơn vị :
            const item = danhsach[i-1] 
            if(item){
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                }
            }else{
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).style(styleBottom) 
                }
            }
            // vào vòng 1
            if([13,14].includes(i)){
                if([13].includes(i)){
                    ws.cell(i*2 + vi_tri_bd, 4).style(styleBottom) 
                }
            }else{
                ws.cell(i*2 -1 + vi_tri_bd, 4).style(styleBottom) 
            }

            // vào vòng 2
            if(i%2 == 1 && i < 13){
                ws.cell(i*2 + vi_tri_bd, 5).style(styleBottom) 
            }else if (i%2 == 1 && i > 15){
                ws.cell(i*2-2 + vi_tri_bd, 5).style(styleBottom) 

            }else if([14].includes(i)){
                ws.cell(i*2 -1 + vi_tri_bd, 5).style(styleBottom) 
            }
            
            // vòng 3
            if([2,6,10].includes(i)){
                ws.cell(i*2 + vi_tri_bd, 6).style(styleBottom) 
            }else if ([15].includes(i)){
                ws.cell(i*2-1 + vi_tri_bd, 6).style(styleBottom) 
            }

            // bán kết
            ws.cell(13, 7).style(styleBottom) 
            ws.cell(30, 7).style(styleBottom) 
            //chung kết
            ws.cell(21, 8).style(styleBottom) 

            // border
            //cấp 3
            if([13].includes(i)){
                ws.cell(i*2 + vi_tri_bd, 3).style(styleRight) 
                ws.cell(i*2+1 + vi_tri_bd, 3).style(styleRight) 
            }

            //cấp 4
            if(i%2 == 1 && ![13,15,17].includes(i) || [16].includes(i)){
                ws.cell(i*2 + vi_tri_bd, 4).style(styleRight) 
                ws.cell(i*2+1 + vi_tri_bd, 4).style(styleRight) 
            }
            if([13].includes(i)){
                ws.cell(i*2+1 + vi_tri_bd, 4).style(styleRight) 
                ws.cell(i*2 +2+ vi_tri_bd, 4).style(styleRight) 
                ws.cell(i*2+3 + vi_tri_bd, 4).style(styleRight) 
            }


            // cấp 5
            if([2,6,10].includes(i)){
                const _j=i*2-1+vi_tri_bd
                const _lenght=_j + 4
                for(let j =_j ; j <_lenght;j++){
                    ws.cell(j, 5).style(styleRight) 
                }
            }else if ([14].includes(i)){
                const _j=i*2+ vi_tri_bd  
                const _lenght=_j + 5
                for(let j =_j ; j <_lenght;j++){
                    ws.cell(j, 5).style(styleRight) 
                }
            }
            //cấp 6

            for(let j =10 ; j <18;j++){
                ws.cell(j, 6).style(styleRight) 
            }
            for(let j =26 ; j <35 ;j++){
                ws.cell(j, 6).style(styleRight) 
            }
            for(let j =14 ; j <31;j++){
                ws.cell(j, 7).style(styleRight) 
            }

        } else if ( soluong == 18){
            //khỏi tạo tên - đơn vị :
            const item = danhsach[i-1] 
            if(item){
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                }
            }else{
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).style(styleBottom) 
                }
            }

        } else if ( soluong == 19){
            //khỏi tạo tên - đơn vị :
            const item = danhsach[i-1] 
            if(item){
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                }
            }else{
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).style(styleBottom) 
                }
            }

        } else if ( soluong == 20){
            //khỏi tạo tên - đơn vị :
            const item = danhsach[i-1] 
            if(item){
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                }
            }else{
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).style(styleBottom) 
                }
            }

        } else if ( soluong == 21){
            //khỏi tạo tên - đơn vị :
            const item = danhsach[i-1] 
            if(item){
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                }
            }else{
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).style(styleBottom) 
                }
            }

        } else if ( soluong == 22){
            //khỏi tạo tên - đơn vị :
            const item = danhsach[i-1] 
            if(item){
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                }
            }else{
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).style(styleBottom) 
                }
            }

        } else if ( soluong == 23){
            //khỏi tạo tên - đơn vị :
            const item = danhsach[i-1] 
            if(item){
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                }
            }else{
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).style(styleBottom) 
                }
            }

        } else if ( soluong == 24){
            //khỏi tạo tên - đơn vị :
            const item = danhsach[i-1] 
            if(item){
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                }
            }else{
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).style(styleBottom) 
                }
            }

        } else if ( soluong == 25){
            //khỏi tạo tên - đơn vị :
            const item = danhsach[i-1] 
            if(item){
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                }
            }else{
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).style(styleBottom) 
                }
            }
        } else if ( soluong == 26){
            //khỏi tạo tên - đơn vị :
            const item = danhsach[i-1] 
            if(item){
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                }
            }else{
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).style(styleBottom) 
                }
            }
        } else if ( soluong == 27){
            //khỏi tạo tên - đơn vị :
            const item = danhsach[i-1] 
            if(item){
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                }
            }else{
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).style(styleBottom) 
                }
            }
        } else if ( soluong == 28){
            //khỏi tạo tên - đơn vị :
            const item = danhsach[i-1] 
            if(item){
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                }
            }else{
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).style(styleBottom) 
                }
            }
        } else if ( soluong == 29){
            //khỏi tạo tên - đơn vị :
            const item = danhsach[i-1] 
            if(item){
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                }
            }else{
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).style(styleBottom) 
                }
            }
        } else if ( soluong == 30){
            //khỏi tạo tên - đơn vị :
            const item = danhsach[i-1] 
            if(item){
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                }
            }else{
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).style(styleBottom) 
                }
            }
        } else if ( soluong == 31){
            //khỏi tạo tên - đơn vị :
            const item = danhsach[i-1] 
            if(item){
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                }
            }else{
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).style(styleBottom) 
                }
            }
        } else if ( soluong == 32){
            //khỏi tạo tên - đơn vị :
            const item = danhsach[i-1] 
            if(item){
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).string(item.hoten).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).string(item.donvi).style(styleBottom) 
                }
            }else{
                if(i == 1){
                    ws.cell(i + vi_tri_bd, 3).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i + vi_tri_bd, 1).string(i+".")
                } else{
                    ws.cell(i*2 -1 + vi_tri_bd, 1).string(i+".")
                    ws.cell(i*2 -1 + vi_tri_bd, 2).style(styleBottom) 
                    ws.cell(i*2 -1 + vi_tri_bd, 3).style(styleBottom) 
                }
            }
        } 
    }
    // xuất file excel
    const linkExcel = './exports/'+removeVietnameseTones(noidung) +'.xlsx'
    wb.write(linkExcel)
    wb.write(linkExcel, res)
    // let listImage =[]
    // try {
    //     // // Excel to PNG in Nodejs 
    //     // var aspose = aspose || {};
    //     // aspose.cells = require("aspose.cells");
    //     // // Create a workbook object and load the source file 
    //     // var workbook = new aspose.cells.Workbook(linkExcel);
    //     // // Instantiate an instance of the ImageOrPrintOptions class to access additional image creation options 
    //     // var imgOptions = new aspose.cells.ImageOrPrintOptions();
    //     // // Set Horizontal Resolution
    //     // imgOptions.HorizontalResolution = 300;

    //     // // Set Vertical Resolution
    //     // imgOptions.VerticalResolution = 300;
    //     // // Set the image type by calling setImageType method  
    //     // imgOptions.setImageType(aspose.cells.ImageType.PNG);
    //     // // Invoke the get(index) method to get the first worksheet. 
    //     // var sheet = workbook.getWorksheets().get(0);
    //     // // Create a SheetRender object for the target sheet  
    //     // var sr = new aspose.cells.SheetRender(sheet, imgOptions);
    //     // for (var j = 0; j < sr.getPageCount(); j++) {
    //     //     // Invoke the toImage method to generate an image for the worksheet 
    //     //     let linkfile = "./exports/" + removeVietnameseTones(noidung)  + ".png"
    //     //     // let filename = "./exports/" + removeVietnameseTones(noidung)  + ".png"
    //     //     await sr.toImage(j, linkfile);
    //     //     const base64 = base64_encode(linkfile)
    //     //     listImage.push({
    //     //         filename: removeVietnameseTones(noidung) + ".png",
    //     //         base64: base64  
    //     //     })
    //     // } 
    //     return []
    // } catch (error) {
    //     console.log('error: ', error);
    //     return []
    // }
}

// di chuyển vào service
const thongtin_caidat =(soluong)=>{
    // input số lượng thành viên 1 nội dung
    // 1: là miễn vòng loại
    // 2: là thi đấu vòng loại
    if(!soluong||soluong <= 0) return null
    const ketqua = caidat_thongso[`${soluong}`]
    return {
        vong_loai: ketqua.level[`${2}`],
        vong_trong: ketqua.level[`${1}`],
        so_tran: ketqua.so_tran,
    }
}

// không quá 32 trân
const caidat_thongso = {
    '3': {
        so_tran:3,
        level:{
            '1': 1,// được miễn
            '2': 2
        },
    },
    '4': {
        so_tran:3,
        level:{
            '1': 4,
            '2': 0
        }
    },
    '5': { // 4 cấp
        so_tran:4,
        level:{
            '1': 3,
            '2': 2,
        }
    },
    '6': { // 4 cấp
        so_tran:4,
        level:{
            '1': 2,
            '2': 4,
        }
    }, 
    '7': { // 4 cấp
        so_tran:4,
        level:{
            '1': 1,
            '2': 6,
        }
    },
    '8': { // 4 cấp
        so_tran:4,
        level:{
            '1': 4,
            '2': 0,
        }
    },
    '9': { // 5 cấp
        level:{
            '1': 7,
            '2': 2,
        }
    },
    '10': { // 5 cấp
        so_tran:5,
        level:{
            '1': 6,
            '2': 4,
        }
    },
    '11': { // 5 cấp
        so_tran:5,
        level:{
            '1': 5,
            '2': 6,
        }
    },
    '12': { // 5 cấp
        so_tran:5,
        level:{
            '1': 4,
            '2': 8,
        }
    },
    '13': { // 5 cấp
        so_tran:5,
        level:{
            '1': 3,
            '2': 10,
        }
    },
    '14': { // 5 cấp
        so_tran:5,
        level:{
            '1': 2,
            '2': 12,
        }
    },
    '15': { // 5 cấp
        so_tran:5,
        level:{
            '1': 1,
            '2': 14,
        }
    },
    '16': { // 5 cấp
        so_tran:5,
        level:{
            '1': 16,
            '2': 0,
        }
    },
    '17': { // 5 cấp
        so_tran:6,
        level:{
            '1': 15,
            '2': 2,
        }
    },
    '18': { // 5 cấp
        so_tran:6,
        level:{
            '1': 14,
            '2': 4,
        }
    },
    '19': { // 5 cấp
        so_tran:6,
        level:{
            '1': 13,
            '2': 6,
        }
    },
    '20': { // 5 cấp
        so_tran:6,
        level:{
            '1': 12,
            '2': 8,
        }
    },
    '21': { // 5 cấp
        level:{
            '1': 11,
            '2': 10,
        }
    },
    '22': { // 5 cấp
        so_tran:6,
        level:{
            '1': 10,
            '2': 12,
        }
    },
    '23': { // 5 cấp
        level:{
            '1': 9,
            '2': 14,
        }
    },
    '24': { // 5 cấp
        so_tran:6,
        level:{
            '1': 8,
            '2': 16,
        }
    },
    '25': { // 5 cấp
        so_tran:6,
        level:{
            '1': 7,
            '2': 18,
        }
    },
    '26': { // 5 cấp
        so_tran:6,
        level:{
            '1': 6,
            '2': 20,
        }
    },
    '27': { // 5 cấp
        so_tran:6,
        level:{
            '1': 5,
            '2': 22,
        }
    },
    '28': { // 5 cấp
        so_tran:6,
        level:{
            '1': 4,
            '2': 24,
        }
    },
    '29': { // 5 cấp
        so_tran:6,
        level:{
            '1': 3,
            '2': 26,
        }
    },
    '30': { // 5 cấp
        so_tran:6,
        level:{
            '1': 2,
            '2': 28,
        }
    },
    '31': { // 5 cấp
        so_tran:6,
        level:{
            '1': 1,
            '2': 30,
        }
    },
    '32': { // 5 cấp
        so_tran:6,
        level:{
            '1': 32,
            '2': 28,
        }
    }
}

// chuyển tiếng việt không đấu
const removeVietnameseTones=(str) =>{
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
    str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
    str = str.replace(/đ/g,"d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    // Some system encode vietnamese combining accent as individual utf-8 characters
    // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
    // Remove extra spaces
    // Bỏ các khoảng trắng liền nhau
    str = str.replace(/ + /g," ");
    str = str.trim();
    // Remove punctuations
    // Bỏ dấu câu, kí tự đặc biệt
    str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g," ");
    return str;
}
module.exports = {
    exportExcel,
    thongtin_excel_mau
};