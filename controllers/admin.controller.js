var connection = require('../connection.js');

module.exports = {

    home: (req, res) => {
        res.render('page/home',{
            title:"Home | Admin"
        });
    },

    select: (req, res) => {
        connection.query("SELECT * FROM `" + req.params.table + "`", (err, rows) => {
            if (err) throw err;
            res.send(rows);
        })
    },
    select_addSV: (req, res) => {
        var sql = "SELECT `sinh_vien`.*,`lop`.`ten_lop` FROM `sinh_vien`,`lop` WHERE sinh_vien.ma_lop = lop.id AND `msv` NOT IN(SELECT `ma_sinh_vien` FROM `ct_lop_hp`,`lop_hoc_phan` WHERE ct_lop_hp.`ma_lop_hp`= lop_hoc_phan.ma_lop_hp AND lop_hoc_phan.ma_mon_hoc = '"+req.params.ma_mon_hoc+"')";
        connection.query(sql, (err, rows) => {
            if (err) throw err;
            res.send(rows);
        })
    },

    insert_addSV: (req, res) => {
        var sql = "INSERT INTO `ct_lop_hp`(`ma_lop_hp`, `ma_sinh_vien`) VALUES ";
        console.log(req.body);
        var listmsv = req.body.msv.split(",");
        var s = [];
        var s2 = [];
        for (var i = 0; i < listmsv.length;i++) {
            s.push("('"+req.body.ma_lop_hp+"','"+listmsv[i]+"')");
            s2.push("('"+req.body.mmh+"','"+listmsv[i]+"')");
        }
        connection.query(sql+s.toString(),(err, rows) => {
            if (err) throw err;
            var sql_diem = "INSERT INTO `diem_hp`(`ma_mon_hoc`, `ma_sinh_vien`) VALUES "
            connection.query(sql_diem+s2.toString(),(error, results) => {
                if (error) throw error;
                res.send(true);
            })
        })
    },

    editSV_lhp: (req, res) => {
        console.log(req.body);
        var sql = "UPDATE `ct_lop_hp` SET `ma_lop_hp`='"+req.body.ma_lop_hp+"' WHERE `id`= "+ req.body.id;
        connection.query(sql, (err, rows) => {
            if (err) throw err;
            res.send(true);
        })
    },

    lop: (req, res) => {

        connection.query("SELECT * FROM `lop`", (err, rows) => {
            if (err) throw err;
            res.render('page/lop', {
                title: 'Lop',
                user: res.locals.user,
                classes: rows,
            })
        })
    },

    lop_student: (req, res) => {
        var sql = "SELECT sinh_vien.*,lop.ten_lop FROM `sinh_vien`,`lop` WHERE sinh_vien.ma_lop = lop.id AND lop.ten_lop ='"+req.params.lop+"'"
        connection.query(sql, (err, rows) => {
            if (err) throw err;
            var sql = "SELECT * FROM `lop`";
            connection.query(sql, (loi,lop) => {
                if (loi) throw loi;
                res.render('page/listStudentClass', {
                    title: req.params.lop,
                    user: res.locals.user,
                    students: rows,
                    classes: lop,
                    ten_lop: req.params.lop,
                })
            })
        })
    },

    account: (req, res) => {

        connection.query("SELECT * FROM `tai_khoan`", (err, rows) => {
            if (err) throw err;
            res.render('page/account', {
                title: 'Account',
                user: res.locals.user,
                accounts: rows,
            })

        })
    },

    edit: (req, res) => {
        console.log(req.body);
        var sql = "UPDATE `lop` SET `ma_lop`= '" + req.body.ma_lop + "',`ten_lop`='" + req.body.tenlop + "' WHERE `id`=" + req.body.edit
        connection.query(sql, (err, rows) => {
            if (err) throw err;
            res.redirect("/admin/class");
        })
    },

    add_class: (req, res) => {
        var sql = "INSERT INTO `lop`(`ma_lop`, `ten_lop`) VALUES ('" + req.body.ma_lop + "','" + req.body.ten_lop + "')";
        connection.query(sql, (err, rows) => {
            if (err) throw err;
            res.redirect("/admin/class");
        })
    },

    delete_class: (req, res) => {
        var sql = "DELETE FROM `lop` WHERE `id`=" + req.params.id;
        connection.query(sql, (err, rows) => {
            if (err) throw err;
            res.redirect("/admin/class");
        })
    },

    delete: (req, res) => {
        var sql = "DELETE FROM `" + req.params.table + "` WHERE `"+req.params.col+"`=" + req.params.id;
        if (req.params.table == "sinh_vien" | req.params.table == "giao_vien") {
            sql = "DELETE `tai_khoan`,`" + req.params.table + "` FROM `tai_khoan`,`" + req.params.table + "` WHERE tai_khoan.id = " +
                req.params.table + ".ma_tai_khoan AND " + req.params.table + ".id = '" + req.params.id + "'";
        }
        console.log(sql)
        connection.query(sql, (err, rows) => {
            if (err) throw err;
            res.send(true);
        })
    },

    student: (req, res) => {
        var sql = "SELECT sinh_vien.*,lop.ten_lop FROM `sinh_vien`,`lop` WHERE sinh_vien.ma_lop=lop.id";
        connection.query(sql, (err, rows) => {
            if (err) throw err;
            connection.query("SELECT * FROM `lop`", (err, classes) => {
                if (err) throw err;
                res.render('page/student', {
                    title: 'Student',
                    user: res.locals.user,
                    students: rows,
                    classes: classes,
                })
            })
        })

    },

    update_student: (req, res) => {
        var student = {
            msv: req.body.msv,
            ten: req.body.ten,
            ngay_sinh: req.body.ngay_sinh,
            gioi_tinh: req.body.gt,
            email: req.body.email,
            sdt: req.body.sdt,
            dia_chi: req.body.dia_chi,
            ma_lop: req.body.ma_lop,
        }
        var sql = "UPDATE sinh_vien SET ? WHERE id =" + req.body.edit;
        connection.query(sql, student, (error, results, fields) => {
            if (error) throw error;
            var sql_account = "UPDATE `tai_khoan` SET `ten_tai_khoan`='" + student.email + "' WHERE `ten_tai_khoan`='" + req.body.email_old + "'";
            connection.query(sql_account, (err, rows) => {
                if (error) throw error;
                if(req.body.path != null) {
                    res.redirect(req.body.path);
                    return;
                }
                res.redirect("/admin/student");
            })

        })
    },

    insert_student: (req, res) => {
        var sql_account = "INSERT INTO `tai_khoan`(`ten_tai_khoan`, `mat_khau`, `vai_tro`) VALUES ('" + req.body.email + "','123','1')";
        connection.query(sql_account, (err, rows) => {
            if (err) throw err;
            var sql = "INSERT INTO `sinh_vien`(`msv`, `ten`, `ngay_sinh`, `gioi_tinh`, `email`, `sdt`, `dia_chi`, `ma_lop`, `ma_tai_khoan`) VALUES (?,?,?,?,?,?,?,?,?)";
            var student = [
                req.body.msv,
                req.body.ten,
                req.body.ngay_sinh,
                req.body.gt,
                req.body.email,
                req.body.sdt,
                req.body.dia_chi,
                req.body.ma_lop,
                rows.insertId
            ];
            connection.query(sql, student, (err, result) => {
                if (err) throw err;
                res.redirect("/admin/student");
            })
        })
    },

    teacher: (req, res) => {
        var sql = "SELECT * FROM `giao_vien`";
        connection.query(sql, (err, rows) => {
            if (err) throw err;
            res.render('page/teacher', {
                title: 'Teacher',
                user: res.locals.user,
                teachers: rows,
            })
        })
    },

    insert_teacher: (req, res) => {
        var sql_account = "INSERT INTO `tai_khoan`(`ten_tai_khoan`, `mat_khau`, `vai_tro`) VALUES ('" + req.body.email + "','123','0')";
        connection.query(sql_account, (err, rows) => {
            if (err) throw err;
            var sql = "INSERT INTO `giao_vien`(`mgv`, `ten`, `sdt`, `email`, `ma_tai_khoan`) VALUES (?,?,?,?,?)";
            var teacher = [
                req.body.mgv,
                req.body.ten,
                req.body.sdt,
                req.body.email,
                rows.insertId
            ];
            connection.query(sql, teacher, (err, result) => {
                if (err) throw err;
                res.redirect("/admin/teacher");
            })
        })
    },

    update_teacher: (req, res) => {
        var teacher = {
            mgv: req.body.mgv,
            ten: req.body.ten,
            sdt: req.body.sdt,
            email: req.body.email,
        }
        var sql = "UPDATE giao_vien SET ? WHERE id =" + req.body.edit;
        connection.query(sql, teacher, (error, results, fields) => {
            if (error) throw error;
            var sql_account = "UPDATE `tai_khoan` SET `ten_tai_khoan`='" + teacher.email + "' WHERE `ten_tai_khoan`='" + req.body.email_old + "'";
            connection.query(sql_account, (err, rows) => {
                if (error) throw error;
                res.redirect("/admin/teacher");
            })

        })
    },

    subject: (req, res) => {
        var sql = "SELECT * FROM `mon_hoc`";
        connection.query(sql, (err, rows) => {
            if (err) throw err;
            res.render('page/subject', {
                title: 'Subject',
                user: res.locals.user,
                subjects: rows,
            })
        })
    },

    update_subject: (req, res) => {
        var sql = "UPDATE mon_hoc SET ? WHERE id =" + req.body.id;
        connection.query(sql, req.body, (error, results, fields) => {
            if (error) throw error;
            res.redirect("/admin/subject");
        })
    },

    insert_subject: (req, res) => {
        var sql_account = "INSERT INTO `mon_hoc`( `ma_mon_hoc`, `ten_mon_hoc`, `bat_dau`, `ket_thuc`) VALUES (?,?,?,?)";
        console.log(req.body);
        var Subject = [
            req.body.ma_mon_hoc,
            req.body.ten_mon_hoc,
            req.body.bat_dau,
            req.body.ket_thuc,
        ];
        connection.query(sql_account, Subject, (err, rows) => {
            if (err) throw err;
            res.redirect("/admin/subject");
        })
    },

    lop_hoc_phan: (req, res) => {
        var sql = "SELECT `lop_hoc_phan`.*,`mon_hoc`.`ten_mon_hoc` FROM  `lop_hoc_phan`,`mon_hoc` where mon_hoc.`ma_mon_hoc` = lop_hoc_phan.`ma_mon_hoc`";
        connection.query(sql, (err, rows) => {
            if (err) throw err;
            var sql = "SELECT * FROM `mon_hoc`";
            connection.query(sql, (err, subject) => {
                if (err) throw err;
                res.render('page/classStudy', {
                    title: 'Modules',
                    user: res.locals.user,
                    classStudies: rows,
                    subjects: subject
                })
            })
        })
    },

    add_lop_hp: (req, res) => {
        var lop_hoc_phan = [
            req.body.ma_lop_hp,
            req.body.ten_lop_hp,
            req.body.mon_hoc
        ];
        console.log(lop_hoc_phan);
        var sql = "INSERT INTO `lop_hoc_phan`(`ma_lop_hp`, `ten_lop_hp`, `ma_mon_hoc`) VALUES (?,?,?)";
        connection.query(sql, lop_hoc_phan, (err, rows) => {
            if (err) throw err;
            res.redirect("/admin/modules");
        })
    },

    update_lop_hp: (req, res) => {
        var sql = "UPDATE lop_hoc_phan SET ? WHERE id =" + req.body.id;
        connection.query(sql, req.body, (error, results, fields) => {
            if (error) throw error;
            res.redirect("/admin/modules");
        })
    },

    show_lop_hp: (req, res) => {
        var sql = "SELECT ct_lop_hp.*,sinh_vien.ten,lop.ten_lop FROM `lop_hoc_phan`,`ct_lop_hp`,`sinh_vien`,`lop` "
        +"WHERE lop_hoc_phan.ma_lop_hp = ct_lop_hp.ma_lop_hp AND ct_lop_hp.ma_sinh_vien = sinh_vien.msv AND sinh_vien.ma_lop = lop.id AND ct_lop_hp.ma_lop_hp='"+req.params.lop+"'";
        connection.query(sql, (error, results) => {
            if (error) throw error;
            var sql_lhp = "SELECT * FROM `lop_hoc_phan` where ma_lop_hp='"+req.params.lop+"'";
            connection.query(sql_lhp, (err, rows) => {
                if (err) throw err;
                var sql_allclass = "SELECT * FROM `lop_hoc_phan` where ma_mon_hoc='"+rows[0].ma_mon_hoc+"'";
                connection.query(sql_allclass, (err, lhp) => {
                    if (err) throw err;
                    res.render('page/listStudentmodules', {
                        title: 'Module | '+rows[0].ten_lop_hp,
                        user: res.locals.user,
                        liststudent: results,
                        lop_hp: rows,
                        list_lhp: lhp
                    })
                })
            })
        })
    },

    calendar: (req, res) => {
        var sql = "SELECT * FROM `giao_vien` AS gv,`lich_hoc` as lh,`lop_hoc_phan` as lhp,`phong_hoc` where phong_hoc.ma_phong=lh.ma_phong AND lh.`ma_lop_hp` = lhp.`ma_lop_hp` AND lh.mgv = gv.mgv;";
        connection.query(sql, (err, rows) => {
            if (err) throw err;
            var sql_mh = "SELECT * FROM `mon_hoc`"
            connection.query(sql_mh, (err, mon_hoc) => {
                if (err) throw err;
                var listDate = [
                    ['T2','Thứ Hai'],['T3','Thứ Ba'],
                    ['T4','Thứ Tư'],['T5','Thứ Năm'],
                    ['T6','Thứ Sáu'],['T7','Thứ Bảy'],
                    ['CN','Chủ Nhật']
                ];
                var sql = "SELECT * FROM `phong_hoc`";
                connection.query(sql, (err,phong) => {
                    if (err) throw err;
                    res.render('page/calendar', {
                        title: 'Calendar',
                        user: res.locals.user,
                        calendars: rows,
                        subjects : mon_hoc,
                        listDate:listDate,
                        rooms: phong
                    })
                })
            })
        })
    },

    select_col: (req, res) => {
        var sql = "SELECT * FROM `"+req.params.table+"` WHERE "+req.params.col+"='"+req.params.val+"'";
        console.log(sql);
        connection.query(sql, (err, rows) => {
            if (err) throw err;
            res.send(rows);
        })
    },

    calendar_add: (req,res) => {
        var sql = "INSERT INTO `lich_hoc`(`tiet_hoc`, `thoi_gian`, `ma_phong`, `ma_lop_hp`, `mgv`) VALUES (?,?,?,?,?)";
        var calendar = [
            req.body.bat_dau+"->"+req.body.ket_thuc,
            req.body.thuadd,
            req.body.phong,
            req.body.lop_hp,
            req.body.giao_vien,
        ];
        connection.query(sql,calendar,(err,result) => {
            if (err) throw err;
            res.redirect("/admin/calendar");
        })
    },

    calendar_edit: (req,res) => {
        console.log(req.body);
        var sql = "UPDATE lich_hoc SET ? WHERE ma_lich =" + req.body.id;
        var calendar = {
            tiet_hoc: req.body.bat_dau+"->"+req.body.ket_thuc,
            thoi_gian: req.body.thu,
            ma_phong: req.body.phong,
            ma_lop_hp: req.body.lop_hp,
            mgv: req.body.giao_vien,
        };
        connection.query(sql,calendar,(err,result) => {
            if (err) throw err;
            res.redirect("/admin/calendar");
        })
    },
}