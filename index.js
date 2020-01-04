const http = require("http");
var express = require("express");
var path = require('path');
var app = express();
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var querystring = require('querystring');
var cors = require('cors');
var _router = express.Router();
var multer = require('multer');
/////////////////////////WebSocket//////////////////////
var server = require('ws').Server;
var s = new server({port: 5000});
const util = require('util');
/////////////////////////websocket//////////////////////






app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(session({
    key: 'user_sid',
    secret: 'somerandonstuffs',
    resave: true,
    saveUninitialized: true,
    cookie: {
        expires: 600000
    }
}));
app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');
    }
    next();
});
app.use((req, res, next)=>{
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  next();
});
// middleware function to check for logged-in users
var auth = function(req, res, next) {
if (req.session){
return next();
}
else {
return res.sendStatus(404);
}
};
///////////////////////////////////////////////////image upload///////////////////////////////////////////////

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null,  '/media/arsh/B0BCBDA7BCBD688C/BRS DATA/Cleaning Robot/original_code/asset/img/brs/complain');
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + '.' + path.extname(file.originalname));
    }
});
let upload = multer({storage: storage});

app.post('/api/upload',upload.single('image'), function (req, res) {
    console.log("hey");
    console.log(req.file);
    if (!req.file) {
        console.log("No file received");
        return res.send({
          success: false
        });

      } else {
        console.log('file received');
        return res.send({
          success: true
        })
      }
});

// function fileFilter (req, file, cb) {

//     cb(null, false)
//     cb(null, true)
//     cb(new Error('I don\'t have a clue!'))

//   }


// app.post('/profile', function (req, res) {
//   upload(req, res, function (err) {
//     if (err instanceof multer.MulterError) {
//       // A Multer error occurred when uploading.
//     } else if (err) {
//       // An unknown error occurred when uploading.
//     }

//     // Everything went fine.
//   })
// })
////////////////////////////////////////////////image upload complete///////////////////////////////////////
///////////////////////////////////////post and get api///////////////////////////////////////////////////////
var sesemail;

app.post("/login", (req, res)=>{
  //console.log("hey");
  var  username = req.body.username;
   var password = req.body.password;
   console.log(username);
   console.log(password);
   if(!req.body.username || !req.body.password){
    res.send('fill all inputs');
  }else {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("brs_cleaning_robot");
      dbo.collection("login").findOne({Username:username}, function(err, result) {
        if(err)throw err;
       console.log(result);
         //  console.log(req.session);
       if(result){
         if(password === result.Password){
          req.session.email = result.Email;
          req.session.user = result.Username;
          req.session.image = result.image;
          req.session.client = result.Client;
          req.session.Cid = result.Cid;
          req.session.fm = true;
          sesemail = req.session.email;
          req.session.save((err) => {
                if (!err) {
                    console.log(req.session);
                    //res.redirect("/");
                }
              });
        // console.log(req.session);
          var success = [{mssg: "Success", username: req.session.user,image:req.session.image,client:req.session.client,Cid:req.session.Cid}];
          res.send(success);
         }
         else{
             var error = [{mssg: "Wrong Password"}];
           res.send(error);
         }
       }
       else{
         var error = [{mssg: "Username doesn't exits"}];
       res.send(error);
       }
        db.close();
      });
    });
  }
   });

 

   app.post('/savedata', function(req, res) {
    var  cordinate = req.body.data1;
    var per = req.body.data2;
    var data3 = req.body.data3;
    var count;
   
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("brs_cleaning_robot");
        dbo.collection('activity_list').aggregate([
          {$count: 's'}
        ]).toArray(function(err, result) {
          if (err) throw err;
         // console.log(result[0].s);
          count = result[0].s;
          db.close();

         // console.log(count);
   
          var Map_id = req.body.Map_id;
          var Zone_id = req.body.Zone_id;
          var Robot_id = req.body.Robot_id; 
          var Start_time = req.body.Start_time;
          var End_time = req.body.End_time;
          var Total_time = req.body.Total_time;
          var Total_area = req.body.Total_area;
          var Date = req.body.Date;
          var username = req.body.username;
          var Cid = req.body.Cid;
          var Client = req.body.Client;
          var Mcid = req.body.Mcid;
        
            console.log(req.body.Date);
            console.log(per);
        
         MongoClient.connect(url, function(err, db) {
          if (err) throw err;
          var dbo = db.db("brs_cleaning_robot");
        
          var myobj = {Activity_id:count+1,Map_id:Map_id,Zone_id:Zone_id,Robot_id:Robot_id,percent_complete:per,Start_time:Start_time,End_time:End_time,Total_cleaning_time:Total_time,Total_area:Total_area,Date:Date,username:username,data:cordinate,map_zone_data:data3,Cid:Cid,Client:Client,Mcid:Mcid};
           
          
        
          dbo.collection("activity_list").insertOne(myobj, function(err, result) {
            if (err) throw err;
            console.log("1 document inserted");
           
            db.close();
            var success = [{mssg: "success"}];
            res.send(success);
          });
        });
        });
      });
   


    });
   

app.get("/forgetpassword", (req, res)=>{
    var  email = req.query.email;
     console.log(email);
     if(!req.query.email){
      var error = [{mssg: "Fill email!"}];
      res.send(error);
    }else {
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("brs_cleaning_robot");
        dbo.collection("login").findOne({Email:email}, function(err, result) {
          if(err)throw err;
         console.log(result);
           //  console.log(req.session);
           var otp = Math.floor((Math.random() * 10000) + 1);
         if(result){
        
          var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: 'ahteshamaziz@gmail.com', // generated ethereal user
                pass: 'virtualroom7'  // generated ethereal password
            },
            tls:{
              rejectUnauthorized:false
            }
          });
        
          var mailOptions = {
            from: 'ahteshamaziz@gmail.com',
            to: email,
            subject: 'Change Password!',
            text: 'OTP of password change : '+otp+'.'
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
              MongoClient.connect(url, function(err, db) {
                if (err) throw err;
                var dbo = db.db("brs_cleaning_robot");
                var myquery = { Email: email };
                var newvalues = {$set:{ OTP: otp}};
                dbo.collection("login").updateOne(myquery, newvalues, function(err, results) {
                  if (err) throw err;
                  console.log("1 document updated");
                  var m = [{mssg: "otp_sent"}];
                  console.log(otp);
                  db.close();

                 var error = [{mssg: "Otp_sent"}];
                 res.send(error);
                
                });
              });

            }
          });
         }
         else{
         var error = [{mssg: "Email doesn't exits"}];
         res.send(error);
         }
          db.close();
        });
      });
    }
     });


     

     app.get('/match_otp', function(req, res) {
      var da = req.query.otp.split(',');
      var otp = parseInt(da[0],10);
      var email = da[1];
     

          MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("brs_cleaning_robot");
            dbo.collection('login').aggregate([
              {$match: {Email: email, OTP:otp}}
            ]).toArray(function(err, result) {
              if (err) throw err;
              var success = [{mssg: "success"}];
              res.send(success);
              db.close();
            });
          });
      });

 
      app.get('/changepassone', function(req, res) {
        var da = req.query.data.split(',');
        var pass = da[0];
        var email = da[1];

        MongoClient.connect(url, function(err, db) {
          if (err) throw err;
          var dbo = db.db("brs_cleaning_robot");
          var myquery = { Email: email };
          var newvalues = {$set:{ Password: pass}};
          dbo.collection("login").updateOne(myquery, newvalues, function(err, results) {
            if (err) throw err;
            console.log("1 document updated");
            var m = [{mssg: "success"}];
            res.send(m)
            //console.log(otp);
            db.close();
          });
        });

        });

        app.get('/changepasstwo', function(req, res) {
            var da = req.query.data.split(',');
            var pass = da[0];
            var username = da[1];
            var cid = parseInt(da[2],10);

           
            console.log(pass);
            console.log(username);
            console.log(cid);
  
          MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("brs_cleaning_robot");
            var myquery = { Username: username, Cid: cid };
            var newvalues = {$set:{ Password: pass}};
            dbo.collection("login").updateOne(myquery, newvalues, function(err, results) {
              if (err) throw err;
              console.log(results);
              console.log("1 document updated");
              var m = [{mssg: "success"}];
              res.send(m)
              
              db.close();
            });
          });
         });

      

          app.get('/checkpassword', function(req, res) {
            var da = req.query.data.split(',');
            var pass = da[0];
            var username = da[1];
            var cid = parseInt(da[2],10);
            console.log(username);
            console.log(pass);
            console.log(cid);
                MongoClient.connect(url, function(err, db) {
                  if (err) throw err;
                  var dbo = db.db("brs_cleaning_robot");
                  dbo.collection('login').aggregate([
                    {$match: {Username:username, Password:pass, Cid:cid}}
                  ]).toArray(function(err, result) {
                    if (err) throw err;
                    console.log(result.length);
                    if(result.length){
                      var error = [{mssg: "true"}];
                      res.send(error);
                    }
                    else{
                      var error = [{mssg: "false"}];
                      res.send(error);
                    }
                    db.close();
                  });
                });
            });


app.get('/map_data', function(req, res) {
//console.log("mapdata email2:"+sesemail);
console.log(req.query.username);
var da = req.query.username.split(',');
console.log(da);
var username = da[0];
var client = da[1];
    var data = req.session.user;
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("brs_cleaning_robot");
      dbo.collection('map_selection').aggregate([
        {$match: {FmName: username, Client:client}},
        {$sort: {
          Map_id: 1
        }}
      ]).toArray(function(err, result) {
        if (err) throw err;
        res.send(result);
        db.close();
      });
    });
});

app.get('/zone_data', function(req, res) {
    console.log(req.query.id);
    var da = req.query.id.split(',');
    var id = parseInt(da[0],10);
    console.log(typeof id);
    var c = da[1];
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("brs_cleaning_robot");
      dbo.collection('select_zone').aggregate([
        {$match: {Map_id: id,Client: c}},{
          $lookup: {
            from: 'map_selection',
            localField: 'Map_cid',
            foreignField: 'Map_cid',
            as: 'string1'
          }
        }
      ]).toArray(function(err, result) {
        if (err) throw err;
        console.log(result);
        res.send(result);
        db.close();
      });
    });
});

app.get('/alignimg', function(req, res) {
  
  var da = req.query.id.split(',');
  var cox = parseInt(da[0],10);
  var coy = parseInt(da[1],10);
  var cid = da[2];

  console.log(cox);
  console.log(coy);
  console.log(cid);

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("brs_cleaning_robot");
    dbo.collection('camera_img').aggregate([
      {$match: { x:cox,y:coy,Map_cid:cid }}
    ]).toArray(function(err, result) {
      if (err) throw err;
      console.log(result);
      res.send(result);
      db.close();
    });
  });
});


app.get('/activity_data', function(req, res) {
    console.log(req.query.cid);
    var cid = req.query.cid;
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("brs_cleaning_robot");
      dbo.collection("activity_list").aggregate([
        {$match: {Cid: cid}},{
          $sort:{
            Activity_id: -1
          }
        }
      ]).toArray(function(err, result) {
        if (err) throw err;
        console.log(result);
        res.send(result);
        db.close();
      });
    });
});

app.get('/activity_data_wrtr', function(req, res) {
  console.log(req.query.rid);
  var rid = parseInt(req.query.rid,10);
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("brs_cleaning_robot");
    dbo.collection("activity_list").aggregate([
      {$match: {Robot_id: rid}},{
        $sort:{
          Activity_id: -1
        }
      }
    ]).toArray(function(err, result) {
      if (err) throw err;
      console.log(result);
      res.send(result);
      db.close();
    });
  });
});
 
app.get('/userrobot_data', function(req,res){
  var username = req.query.username;
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("brs_cleaning_robot");
    dbo.collection('login').aggregate([
      {$match: {Username: username}}, {
        $unwind: '$Robot'
      }, {
        $lookup: {
          from: 'robots',
          localField: 'Robot',
          foreignField: 'Robot_id',
          as: 'string1'
        }
      },{ $unwind: '$string1'},
      {
        $lookup: {
          from: 'robot_master',
          localField: 'string1.Master_id',
          foreignField: 'Id',
          as: 'string1.string2'
        }
      }
    ]).toArray(function(err, result) {
      if (err) throw err;
      console.log(result);
      res.send(result);
      db.close();
    });
  });
});


app.get('/robot_data', function(req, res) {
    console.log(req.query.client);
    var da = req.query.client;
  
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("brs_cleaning_robot");
      dbo.collection('robots').aggregate([
        {$match: {Client: da}},{
          $lookup:{
            from: 'robot_master',
            localField: 'Master_id',
            foreignField: 'Id',
            as: 'robot'
          }
        }, {
          $lookup: {
            from: 'map_selection',
            localField: 'Map_id',
            foreignField: 'Map_id',
            as: 'map'
          }
        },
        {
          $lookup:{
            from: 'select_zone',
            localField: 'Zone_id',
            foreignField: 'Zone_Mid',
            as: 'zone'
          }
        }
      ]).toArray(function(err, result) {
        if (err) throw err;
        console.log(result);
        res.send(result);
        db.close();
      });
    });
});


app.get('/activity_id_data', function(req, res) {
    //console.log(req.query.id);
    var id = parseInt(req.query.id,10);
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("brs_cleaning_robot");
      dbo.collection('activity_list').aggregate([
        {$match: {Activity_id: id}},{
          $lookup: {
            from: 'robots',
            localField: 'Robot_id',
            foreignField: 'Robot_id',
            as: 'string1'
          }
        },{
          $lookup: {
            from: 'select_zone',
            localField: 'Mcid',
            foreignField: 'Map_cid',
            as: 'string2'
          }
        }
      ]).toArray(function(err, result) {
        if (err) throw err;
        console.log(result);
        res.send(result);
        db.close();
      });
    });
});



app.get('/clientdetail', function(req, res) {
  //console.log(req.query.id);
  var cid = parseInt(req.query.cid,10);
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("brs_cleaning_robot");
    dbo.collection('client').aggregate([
      {$match: {Client_id: cid}}
    ]).toArray(function(err, result) {
      if (err) throw err;
      console.log(result);
      res.send(result);
      db.close();
    });
  });
});

app.get('/singleRobot', function(req, res) {
    console.log(req.query.id);
    var id = parseInt(req.query.id,10);
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("brs_cleaning_robot");
      dbo.collection('robots').aggregate([
        {$match: {Robot_id: id}},
        {
          $lookup:{
            from: 'robot_master',
            localField: 'Master_id',
            foreignField: 'Id',
            as: 'string'
          }
        }
      ]).toArray(function(err, result) {
        if (err) throw err;
        console.log(result);
        res.send(result);
        db.close();
      });
    });
});



app.post('/map_zone', function(req, res) {
  console.log(req.body);
   res.send(req.body);
})

app.get('/zone',function(req,res){
    var arr1 = [];
    var robarray = [];
    MongoClient.connect(url, function(err, db){
         if (err) throw err;
         var dbo = db.db("brs_cleaning_robot");
         /*Return only the documents with the address "Park Lane 38":*/
         dbo.collection("select_zone").find({ Zone_id: { $in: [1,2,3] } }).toArray(function(err, result) {
           if (err) throw err;
           console.log(result);
           res.send(result);
           db.close();
         });
       });
});

app.get('/zone_clean', function(req, res){
  console.log("here data");
  console.log(req.query.id);
  var zn = req.query.id.split('/');
  console.log(zn);
  var zonesString = zn[0];
  var mapid = parseInt(zn[2],10);
 // console.log(zonesString.length);
  console.log(zonesString[0]);
  var cli = zn[1];
  console.log(cli);
  var arr = [];
  for(var i=0; i<zonesString.length; i++){
    arr.push(parseInt(zonesString[i],10));
  }

  MongoClient.connect(url, function(err, db){
       if (err) throw err;
       var dbo = db.db("brs_cleaning_robot");
       /*Return only the documents with the address "Park Lane 38":*/
       dbo.collection("select_zone").aggregate([
         {$match: { Zone_id: {$in:arr},Client:cli,Map_id:mapid }}, {
          $lookup:{
          from: 'robots',
          localField: 'Robot_id',
          foreignField: 'Robot_id',
          as: 'string1'
        }}, {
           $unwind: '$string1'
         },{
          $lookup:{
          from: 'robot_master',
          localField: 'string1.Master_id',
          foreignField: 'Id',
          as: 'string.s'
        }},
        {
          $lookup:{
            from: 'map_selection',
            localField: 'Map_cid',
            foreignField: 'Map_cid',
            as: 'string2'
          }
        }
       ]).toArray(function(err, result) {
         if (err) throw err;
         console.log(result);
         res.send(result);
         db.close();
       });
     });

//  res.send(req.body);
})


app.get('/logout',function (req, res) {
  req.session.destroy();
  console.log("logout");
  var success = [{mssg: "Success logout" }];
  res.send(success);
})


























/////////////////////////////////////////////////////G......S......P////////////////////////////////////////


var clientname = 'Banglore_Airport';
var Gmapname = '';
var Gzonename = '';

app.post("/gsplogin", (req, res)=>{
  //console.log("hey");
  var  username = req.body.username;
   var password = req.body.password;
   console.log(username);
   console.log(password);
   if(!req.body.username || !req.body.password){
    res.send('fill all inputs');
  }else {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("brs_cleaning_robot");
      dbo.collection("admin_login").findOne({adminUsername:username}, function(err, result) {
        if(err)throw err;
       console.log(result);
         //  console.log(req.session);
       if(result){
         if(password === result.adminPassword){
          req.session.username = username;
          req.session.save((err) => {
                if (!err) {
                    console.log(req.session);
                    //res.redirect("/");
                }
              });
        // console.log(req.session);
          var success = [{mssg: "Success", username: req.session.username}];
          res.send(success);
         }
         else{
             var error = [{mssg: "Wrong Password"}];
           res.send(error);
         }
       }
       else{
         var error = [{mssg: "Email doesn't exits"}];
       res.send(error);
       }
        db.close();
      });
    });
  }
   });



app.get('/getcustomer',function(req,res){
 MongoClient.connect(url, function(err, db){
       if (err) throw err;
       var dbo = db.db("brs_cleaning_robot");
       /*Return only the documents with the address "Park Lane 38":*/
       dbo.collection("client").find({}).toArray(function(err, result) {
         if (err) throw err;
         console.log(result);
         res.send(result);
         db.close();
       });
     });
});


app.get('/getsinglecustomer',function(req,res){
  var cid = parseInt(req.query.cid,10);
  console.log(cid);
  MongoClient.connect(url, function(err, db){
        if (err) throw err;
        var dbo = db.db("brs_cleaning_robot");
        /*Return only the documents with the address "Park Lane 38":*/
        dbo.collection("client").aggregate([
          {$match: { Client_id:cid}}]).toArray(function(err, result) {
          if (err) throw err;
          console.log(result);
          res.send(result);
          db.close();
        });
      });
 });


 app.get('/getmultiplemapcustomer',function(req,res){
  var mid = req.query.mid.split(",");
  console.log(mid);
  MongoClient.connect(url, function(err, db){
        if (err) throw err;
        var dbo = db.db("brs_cleaning_robot");
        /*Return only the documents with the address "Park Lane 38":*/
        dbo.collection("map_selection").find({ Map_cid: { $in: mid } } ).toArray(function(err, result)  {
          if (err) throw err;
          console.log(result);
          res.send(result);
          db.close();
        });
      });
 });


 app.get('/getmultiplezonecustomer',function(req,res){
  var mcid = req.query.mcid;
  console.log(mcid);
  MongoClient.connect(url, function(err, db){
        if (err) throw err;
        var dbo = db.db("brs_cleaning_robot");
        /*Return only the documents with the address "Park Lane 38":*/
        dbo.collection("select_zone").find({ Map_cid: mcid } ).toArray(function(err, result)  {
          if (err) throw err;
          console.log(result);
          res.send(result);
          db.close();
        });
      });
 });


 app.get('/getmultiplerobotcustomer',function(req,res){
  var rid = req.query.rid.split(",");
   var arr = new Array();
  for(var i =0;i<rid.length;i++){
    arr.push(parseInt(rid[i],10));
  }
  console.log(arr.length);
  MongoClient.connect(url, function(err, db){
        if (err) throw err;
        var dbo = db.db("brs_cleaning_robot");
        /*Return only the documents with the address "Park Lane 38":*/
        dbo.collection("robots").find({ Robot_id: { $in: arr } } ).toArray(function(err, result)  {
          if (err) throw err;
          console.log(result);
          res.send(result);
          db.close();
        });
      });
 });

app.get('/getrobots', function(req,res){
  var id = parseInt(req.query.id,10);
  console.log(id);
  
  MongoClient.connect(url, function(err, db){
    if (err) throw err;
    var dbo = db.db("brs_cleaning_robot");
    dbo.collection("client").aggregate([
      {$match: { Client_id:id}},{
        $unwind: '$Robots'
      },
      {
       $lookup:{
        from: 'robots',
        localField: 'Robots',
        foreignField: 'Robot_id',
        as: 'robot_data'
     }},{
       $lookup:{
        from: 'robot_master',
        localField: 'robot_data.Master_id',
        foreignField: 'Id',
        as: 'robot_master_data'
     }},{
       $lookup:{
        from: 'map_selection',
        localField: 'robot_data.Cid',
        foreignField: 'Map_cid',
        as: 'map_data'
       }
     },{
      $lookup:{
       from: 'select_zone',
       localField: 'robot_data.Zone_id',
       foreignField: 'Zone_Mid',
       as: 'zone_data'
      }
    }
    ]).toArray(function(err, result) {
      if (err) throw err;
      console.log(result);
      res.send(result);
      db.close();
    });

  });

});



app.get('/findsortcutomer',function(req,res){
   
    
    MongoClient.connect(url, function(err, db){
      if (err) throw err;
      var dbo = db.db("brs_cleaning_robot");
      dbo.collection("client").aggregate([
        {$sort: { Client_id:-1}}
      ]).toArray(function(err, result) {
        if (err) throw err;
        console.log(result);
        res.send(result);
        db.close();
      });
  
    });
  
  });


  

  app.get('/findsortmap',function(req,res){
    
    
    MongoClient.connect(url, function(err, db){
      if (err) throw err;
      var dbo = db.db("brs_cleaning_robot");
      dbo.collection("map_selection").aggregate([
        {$sort: { Map_id:-1}}
      ]).toArray(function(err, result) {
        if (err) throw err;
        console.log(result);
        res.send(result);
        db.close();
      });
  
    });
  
  });

  app.get('/findsortrobot',function(req,res){
    
    
    MongoClient.connect(url, function(err, db){
      if (err) throw err;
      var dbo = db.db("brs_cleaning_robot");
      dbo.collection("robots").aggregate([
        {$sort: { Robot_id:-1}}
      ]).toArray(function(err, result) {
        if (err) throw err;
        console.log(result);
        res.send(result);
        db.close();
      });
  
    });
  
  });

  
  app.get('/findsortlogin',function(req,res){
    
    
    MongoClient.connect(url, function(err, db){
      if (err) throw err;
      var dbo = db.db("brs_cleaning_robot");
      dbo.collection("login").aggregate([
        {$sort: { Login_id:-1}}
      ]).toArray(function(err, result) {
        if (err) throw err;
        console.log(result);
        res.send(result);
        db.close();
      });
  
    });
  
  });


  app.get('/findmasterrobot',function(req,res){
    MongoClient.connect(url, function(err, db){
      if (err) throw err;
      var dbo = db.db("brs_cleaning_robot");
      dbo.collection("robot_master").find({}).toArray(function(err, result) {
        if (err) throw err;
        console.log(result);
        res.send(result);
        db.close();
      });
  
    });
  
  });
  


  

app.post("/addcutomer", (req, res)=>{
  //console.log("hey");
    var Client_id = req.body.Client_id;
    var  Address = req.body.Address;
    var CustomerName = req.body.CustomerName;
    var  Pin = req.body.Pin;
    var Country = req.body.Country;
    var  State = req.body.State;
    var City = req.body.City;
    var  Contact = req.body.Contact;
    var Email = req.body.Email;

   console.log(Address);
   console.log(CustomerName);
   console.log(Pin);
   console.log(Country);
   console.log(State);
   console.log(City);
   console.log(Contact);
   console.log(Email);
   
   var sname = CustomerName.split(" ");
   var Name;
  if(sname[1] == undefined){
    Name = sname[0]+'_c';
  }else{
    Name = sname[0]+'_'+sname[1];
  }
   clientname = Name;
   var fs = require('fs');
   var dir = '/media/arsh/B0BCBDA7BCBD688C/BRS DATA/Cleaning Robot/original_code/asset/img/client/'+Name;
   var dirmap = '/media/arsh/B0BCBDA7BCBD688C/BRS DATA/Cleaning Robot/original_code/asset/img/client/'+Name+'/maps';
   var dirzone = '/media/arsh/B0BCBDA7BCBD688C/BRS DATA/Cleaning Robot/original_code/asset/img/client/'+Name+'/zones';
   var dirother = '/media/arsh/B0BCBDA7BCBD688C/BRS DATA/Cleaning Robot/original_code/asset/img/client/'+Name+'/others';

   if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
    }

    if (!fs.existsSync(dirmap)){
      fs.mkdirSync(dirmap);
      }

      if (!fs.existsSync(dirzone)){
        fs.mkdirSync(dirzone);
        }

        if (!fs.existsSync(dirother)){
          fs.mkdirSync(dirother);
          }

   MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("brs_cleaning_robot");

    var myobj = {Client_id:Client_id, Map_cid: [], Name: Name, Address: Address, Customer_Name: CustomerName, Country:Country, State: State, City:City, Email:Email, Robots: [], Pin:Pin, Contact_number: Contact};


    dbo.collection("client").insertOne(myobj, function(err, result) {
      if (err) throw err;
      console.log("1 document inserted");
     
      db.close();
      var success = [{mssg: "success"}];
      res.send(success);
    });
  });


   });



   app.post("/addmap", (req, res)=>{
    //console.log("hey");
      var Map_id = req.body.Map_id;
      var  MapName = req.body.MapName;
      var Mapdesc = req.body.Mapdesc;
      var  X = req.body.X;
      var Y = req.body.Y;
      var  Zoominitial = req.body.Zoominitial;
      var Imagesize = req.body.Imagesize;
      var  Boundx = req.body.Boundx;
      var Boundy = req.body.Boundy;
      var  Phaserx = req.body.Phaserx;
      var Phasery = req.body.Phasery;
      var  Mapposx = req.body.Mapposx;
      var Mapposy = req.body.Mapposy;
      var cname = req.body.cname;
      var mapcid = req.body.mapcid;
      var MapNo = req.body.MapNo;
      
      Gmapname = "Map"+MapNo;
      
  
     console.log(MapName);
     console.log(Mapdesc);
     
    
  
     MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("brs_cleaning_robot");
  
      var myobj = {Map_id:Map_id, Map_name:"Map"+MapNo,MapNumber:MapNo, Map_data: "upicture_"+"Map"+MapNo+".png",Map_blur: "bimage_"+"Map"+MapNo+".png",Map_clear: "cimage_"+"Map"+MapNo+".png", Robot_assign: [], Zone:[], x:X, y: Y, FmName:"", Client:cname, Map_cid:mapcid, Zoominitial:Zoominitial, Imagesize: Imagesize, Boundx:Boundx, Boundy:Boundy, Phaserx:Phaserx, Phasery:Phasery, Mapposx:Mapposx, Mapposy:Mapposy, MapofficialName:MapName, Map_desc:Mapdesc};
     
      
      dbo.collection("map_selection").insertOne(myobj, function(err, result) {
        if (err) throw err;
        console.log("1 document inserted");
       
        db.close();
        var success = [{mssg: "success"}];
        res.send(success);
      });


      var clientiddata = mapcid.split('.');
      console.log(clientiddata);
      var clientId = parseInt(clientiddata[0],10);
      console.log(typeof clientId);
      var myquery = { Client_id: clientId };
      var newvalues = { $push: {
        Map_cid: mapcid
          } 
        };

    dbo.collection("client").updateOne(myquery, newvalues, function(err, res) {
      if (err) throw err;
      console.log("1 document updated");
      db.close();
    });
    });
     });



     app.post("/addzone", (req, res)=>{
      //console.log("hey");
        var  ZoneName = req.body.ZoneName;
        var  ZoneId = req.body.ZoneId;
       // var ZoneData = req.body.ZoneData;
        var  X = req.body.X;
        var Y = req.body.Y;
        var  IX =parseInt(req.body.IX,10);
        var IY = parseInt(req.body.IY,10);
        var  Client = req.body.Client;
        var MapId = parseInt(req.body.MapId,10);
        var Mapcid = parseInt(req.body.mapcid,10);
        Gzonename = Mapcid;
    
       MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("brs_cleaning_robot");
    
        var myobj = {Zone_id:ZoneId, Zone_name:ZoneName, x:X, y: Y, ix:IX, iy:IY, temp_area:"", Client:Client, Map_id: MapId,Map_cid:Mapcid,Robot_id:0,Selected_zone:"zone_s"+Mapcid+".png",Deselected_zone:"zone"+Mapcid+".png",Highlighted_zone:"zone_h"+Mapcid+".png"};
    
        
        dbo.collection("select_zone").insertOne(myobj, function(err, result) {
          if (err) throw err;
          console.log("1 document inserted");
         
          db.close();
          var success = [{mssg: "success"}];
          res.send(success);
        });


        
      
      var myquery = { Map_id: parseInt(MapId,10) };
      var newvalues = { $push: {
        Zone: parseInt(ZoneId,10)
          } 
        };

    dbo.collection("map_selection").updateOne(myquery, newvalues, function(err, res) {
      if (err) throw err;
      console.log("1 document updated");
      db.close();
    });


      });
    
    
       });




       app.post("/addrobot", (req, res)=>{
        //console.log("hey");
          var  RobotName = req.body.RobotName;
          var RobotId = req.body.RobotId;
          var  Status = req.body.Status;
          var MasterId = parseInt(req.body.MasterId,10);
          var  water = req.body.water;
          var Battery = req.body.Battery;
          var  Client = req.body.Client;
          var MapId = req.body.MapId;
          var Mac = req.body.Mac;
          var Ip = req.body.Ip;
          var ProSNO = req.body.ProSNO;
          var Firmware = req.body.Firmware;
          var Os = req.body.Os;
          var mapcid = req.body.mapcid;

          var clientiddata = mapcid.split(".");
          var clientId = clientiddata[0];
         
      
         MongoClient.connect(url, function(err, db) {
          if (err) throw err;
          var dbo = db.db("brs_cleaning_robot");
      
          var myobj = {Robot_id:RobotId, Robot_name:RobotName, Status_of_robot: Status, Master_id:MasterId, Current_water_capacity: water, Current_battery_capacity:Battery, Mac:Mac, Ip:Ip, Client:Client,Map_id:MapId, Zone_id: [],Product_serial_no:ProSNO,Firmware_virsion:Firmware,Os_name:Os,Map_cid : mapcid};
      
          
          dbo.collection("robots").insertOne(myobj, function(err, result) {
            if (err) throw err;
            console.log("1 document inserted");
           
            db.close();
            var success = [{mssg: "success"}];
            res.send(success);
          });
//////////////////map /////////////////
          var myquery = { Map_id: parseInt(MapId,10) };
          var newvalues = { $push: {
            Robot_assign: parseInt(RobotId,10)
              } 
            };
    
        dbo.collection("map_selection").updateOne(myquery, newvalues, function(err, res) {
          if (err) throw err;
          console.log("1 document updated");
          db.close();
        });

////////////client/////////
        var myquery = { Client_id: parseInt(clientId,10) };
        var newvalues = { $push: {
          Robots: parseInt(RobotId,10)
            } 
          };
  
      dbo.collection("client").updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
        console.log("1 document updated");
        db.close();
      });

///////////////zone////////////
   console.log(mapcid);
   console.log(typeof mapcid);
      var myquery = { Map_cid: mapcid  };
      var newvalues = { $set: {Robot_id: parseInt(RobotId,10) } };
      dbo.collection("select_zone").updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
        console.log("1 document updated");
        db.close();
      });



        });
      
      
         });



         app.post("/addfm", (req, res)=>{
          //console.log("hey");
            var Login_id = req.body.Login_id;
            var  fName = req.body.fName;
            var lName = req.body.lName;
            var  Username = req.body.Username;
            var Password = req.body.Password;
            var  email = req.body.email;
            var Mobile = req.body.Mobile;
            var  Client = req.body.Client;
            var Cid = req.body.Cid;
            var Map = req.body.Map;
           
            
           
        
           MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("brs_cleaning_robot");
        
            var myobj = {Login_id:Login_id, Username:Username, Password: Password, Map_ids:[Map], Email: email, image:'pimage.png', Mobile:Mobile, Robot:[1], Client:Client,Cid:Cid, Zone_id: [1],First_name:fName,Last_name:lName};
        
            
            dbo.collection("login").insertOne(myobj, function(err, result) {
              if (err) throw err;
              console.log("1 document inserted");
             
              db.close();
              var success = [{mssg: "success"}];
              res.send(success);
            });
          });
        
        
           });


 app.post("/editcutomer", (req, res)=>{
            //console.log("hey");
              var Client_id = req.body.Client_id;
              var  Customer_Name = req.body.Customer_Name;
              var Email = req.body.email;
              var  City = req.body.City;
              var Country = req.body.Country;
              var  State = req.body.State;
              var Pin = req.body.Pin;
              var  Contact_number = req.body.Contact_number;
              var Name = req.body.Name;
              var Address = req.body.Address;
              var Site = req.body.Site;
             
             
              MongoClient.connect(url, function(err, db) {
              if (err) throw err;
              var dbo = db.db("brs_cleaning_robot");

              var myquery = { Client_id: Client_id };

              var newvalues = { $set: { Customer_Name:Customer_Name, City: City, Country:Country, Email: Email, State:State, Pin:Pin, Contact_number:Contact_number, Name:Name,Address:Address, Site: Site} };

              dbo.collection("client").updateOne(myquery, newvalues, function(err, result){
                if (err) throw err;
                console.log("1 document Update");
                db.close();
                var success = [{mssg: "success"}];
                res.send(success);
              });
            });
           });



  app.post("/editrobot", (req, res)=>{
            //console.log("hey");
              var Robot_id = parseInt(req.body.Robot_id,10);
              var  Robot_name = req.body.Robot_name;
              var Status_of_robot = req.body.Status_of_robot;
              var  Os_name = req.body.Os_name;
              var Product_serial_no = req.body.Product_serial_no;
              var  Firmware_virsion = req.body.Firmware_virsion;
              var Mac = req.body.Mac;
              var  Ip = req.body.Ip;
              var Master_id = req.body.Master_id;
              var Client = req.body.Client;
              var Current_water_capacity = req.body.Current_water_capacity;
              var Current_battery_capacity = req.body.Current_battery_capacity;
              var robcmd = req.body.robcmd;
              var cmid = req.body.cmid;
              var mid = req.body.mid;
              var username = req.body.username;
              var zoneid = req.body.zoneid;
             
              MongoClient.connect(url, function(err, db) {
              if (err) throw err;
              var dbo = db.db("brs_cleaning_robot");

              var myquery = { Robot_id: Robot_id };

              var newvalues = { $set: { Robot_name:Robot_name, Status_of_robot: Status_of_robot, Os_name:Os_name, Product_serial_no: Product_serial_no, Firmware_virsion:Firmware_virsion, Mac:Mac, Ip:Ip, Master_id:Master_id,Client:Client, Current_water_capacity: Current_water_capacity,Current_battery_capacity:Current_battery_capacity,robcmd:robcmd,Cid:cmid, Map_id:mid, Username:username, Zone_id:zoneid } };

              dbo.collection("robots").updateOne(myquery, newvalues, function(err, result){
                if (err) throw err;
                console.log("1 document Update");
                db.close();
                var success = [{mssg: "success"}];
                res.send(success);
              });
            });
           });

 app.post("/editmap", (req, res)=>{
              var Map_id = parseInt(req.body.Map_id,10);
              var Map_name = req.body.Map_name;
              var MapofficialName = req.body.MapofficialName;
              var Map_data = req.body.Map_data;
              var Imagesize = req.body.Imagesize;
              var Client = req.body.Client;
              var Phaserx = req.body.Phaserx;
              var Phasery = req.body.Phasery;
              var Zoominitial = req.body.Zoominitial;
              var Boundx = req.body.Boundx;
              var Boundy = req.body.Boundy;
              var Map_cid = req.body.Map_cid;
              var Mapposx = req.body.Mapposx;
              var Mapposy = req.body.Mapposy;
              var x = req.body.x;
              var y = req.body.y;
              var FmName = req.body.FmName;
              var Robot_assign = req.body.Robot_assign;
   
              MongoClient.connect(url, function(err, db) {
              if (err) throw err;
              var dbo = db.db("brs_cleaning_robot");

              var myquery = { Map_id: Map_id };

              var newvalues = { $set: { Map_name:Map_name, MapofficialName: MapofficialName, Map_data:Map_data, Map_data: Map_data, Imagesize:Imagesize, Phaserx:Phaserx, Phasery:Phasery, Zoominitial:Zoominitial,Client:Client, Boundx: Boundx,Boundy:Boundy,Map_cid:Map_cid,Mapposx:Mapposx, Mapposy:Mapposy, x:x, y:y,FmName:FmName,Robot_assign:Robot_assign } };

              dbo.collection("map_selection").updateOne(myquery, newvalues, function(err, result){
                if (err) throw err;
                console.log("1 document Update");
                db.close();
                var success = [{mssg: "success"}];
                res.send(success);
              });
            });
           });

app.post("/editzone", (req, res)=>{
            var Client = req.body.Client;
            var Deselected_zone = req.body.Deselected_zone;
            var Map_cid = req.body.Map_cid;
            var Map_id = req.body.Map_id;
            var Robot_id = req.body.Robot_id;
            var Selected_zone = req.body.Selected_zone;
            var Zone_Mid = req.body.Zone_Mid;
            var Zone_data = req.body.Zone_data;
            var Zone_id = req.body.Zone_id;
            var Zone_name = req.body.Zone_name;
            var ZoneofficialName = req.body.ZoneofficialName;
            var ix = req.body.ix;
            var iy = req.body.iy;
            var temp_area = req.body.temp_area;
            var x = req.body.x;
            var y = req.body.y;
 
            MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("brs_cleaning_robot");

            var myquery = { Zone_Mid: Zone_Mid };

            var newvalues = { $set: { Client:Client, Deselected_zone: Deselected_zone, Map_cid:Map_cid, Map_id: Map_id, Robot_id:Robot_id, Selected_zone:Selected_zone, Zone_data:Zone_data, Zone_id:Zone_id,Zone_name:Zone_name, ZoneofficialName: ZoneofficialName,ix:ix,iy:iy,temp_area:temp_area, x:x, y:y} };

            dbo.collection("select_zone").updateOne(myquery, newvalues, function(err, result){
              if (err) throw err;
              console.log("1 document Update");
              db.close();
              var success = [{mssg: "success"}];
              res.send(success);
            });
          });
         });

                                     ///////////////image and file upload///////////////
   


    let storage2 = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null,  '/media/arsh/B0BCBDA7BCBD688C/BRS DATA/Cleaning Robot/original_code/asset/img/client/'+clientname+'/maps');
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname  + Gmapname + path.extname(file.originalname));
    }
});
let upload2 = multer({storage: storage2});

let storage3 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null,  '/media/arsh/B0BCBDA7BCBD688C/BRS DATA/Cleaning Robot/original_code/asset/img/client/'+clientname+'/zones');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '_' + Gzonename + path.extname(file.originalname));
  }
});
let upload3 = multer({storage: storage3});

let storage4 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null,  '/media/arsh/B0BCBDA7BCBD688C/BRS DATA/Cleaning Robot/original_code/asset/img/client/'+clientname+'/others');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + path.extname(file.originalname));
  }
});
let upload4 = multer({storage: storage4});

app.post('/api/mapcimage',upload2.single('cimage'), function (req, res) {
    console.log(req.file);
    if (!req.file) {
        console.log("No file received");
        return res.send({
          success: false
        });

      } else {
        console.log('file received');
        return res.send({
          success: true
        })
      }
});



app.post('/api/mapbimage',upload2.single('bimage'), function (req, res) {
  console.log(req.file);
  if (!req.file) {
      console.log("No file received");
      return res.send({
        success: false
      });

    } else {
      console.log('file received');
      return res.send({
        success: true
      })
    }
});

app.post('/api/mapjson',upload2.single('json'), function (req, res) {
  console.log(req.file);
  if (!req.file) {
      console.log("No file received");
      return res.send({
        success: false
      });

    } else {
      console.log('file received');
      return res.send({
        success: true
      })
    }
});


app.post('/api/mapupicture',upload2.single('upicture'), function (req, res) {
  console.log(req.file);
  if (!req.file) {
      console.log("No file received");
      return res.send({
        success: false
      });

    } else {
      console.log('file received');
      return res.send({
        success: true
      })
    }
});

app.post('/api/zonecimage',upload3.single('zone'), function (req, res) {
  console.log(req.file);
  if (!req.file) {
      console.log("No file received");
      return res.send({
        success: false
      });

    } else {
      console.log('file received');
      return res.send({
        success: true
      })
    }
});

app.post('/api/zonehimage',upload3.single('zone_h'), function (req, res) {
  console.log(req.file);
  if (!req.file) {
      console.log("No file received");
      return res.send({
        success: false
      });

    } else {
      console.log('file received');
      return res.send({
        success: true
      })
    }
});

app.post('/api/zonesimage',upload3.single('zone_s'), function (req, res) {
  console.log(req.file);
  if (!req.file) {
      console.log("No file received");
      return res.send({
        success: false
      });

    } else {
      console.log('file received');
      return res.send({
        success: true
      })
    }
});



app.post('/api/fmpimage',upload4.single('pimage'), function (req, res) {
  console.log(req.file);
  if (!req.file) {
      console.log("No file received");
      return res.send({
        success: false
      });

    } else {
      console.log('file received');
      return res.send({
        success: true
      })
    }
});

                                    ////////////////image and file upload////////////////

/////////////////////////////////////////////////////G.......S......P/////////////////////////////////////////
































///////////////////////////////////////////////////////////Server port/////////////////////////////////////////////////////
app.listen(8080, function () {
  console.log("Use portno 8080");
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////







////////////////////////////////ws connection /////////////////////////////////////////////////////////////////////////////
   var arr = [];
   //var status = 'pause';
s.on('connection', function(ws, msg){
   console.log("New connection");
   ws.on('message', function(message){
   var obj = JSON.parse(message);
  ////////////////robot connection/////////////

        if(obj.messagetype == "robot"){
          console.log('robot');
            arr.push(obj.data);
            ws.clientId = obj.data;
              var id = parseInt(obj.data,10);
              MongoClient.connect(url, function(err, db){
                  if (err) throw err;
                  var dbo = db.db("brs_cleaning_robot");


                  var myquery = { Robot_id: id };
                      var newvalues = { $set: {Status_of_robot: "Online" } };
                      dbo.collection("robots").updateOne(myquery, newvalues, function(err, res) {
                        if (err) throw err;
                       // console.log("1 document updated");
                        db.close();
                      });
                });
                s.clients.forEach(function e(client){
                  if(client.clientId == obj.robid){
                  //console.log( ws.clientId);
                  client.send(JSON.stringify({
                    messagetype: obj.messagetype,
                    message: arr,
                    messageSend : "open"
                  }));
                return;
                  }
              });
            }
    

            if(obj.messagetype == "Input meassage"){
              console.log('input');
              var robData = obj.message.split("|");
              if(robData[1] == 'xy'){
                  s.clients.forEach(function e(client){
                    //console.log(obj.message);
                    if(client.clientId == obj.robid){
                    client.send(JSON.stringify({
                      messagetype: obj.messagetype,
                      message: obj.message,
                      messageSend : "open",
                      robid:obj.robid
                    }));
                    return;
                  }
                });
              }
              if(robData[1] == 'manual'){
                console.log('manual0');
                s.clients.forEach(function e(client){
                  if(client.clientId == obj.robid){
                 // console.log(obj.message);
                  client.send(JSON.stringify({
                    messagetype: obj.messagetype,
                    message: obj.message,
                    messageSend : "open",
                    robid:obj.robid
                  }));
                  return;
                }
                  });
              }
                }

            if(obj.messagetype == "Manual Mode"){
              console.log('manual');
                    s.clients.forEach(function e(client){
                      if(client.clientId != obj.robid){
                      console.log(client.clientId);
                    }else{
                      client.send(JSON.stringify({
                        messagetype: obj.messagetype,
                        message: obj.message,
                        robid: obj.robid,
                        messageSend : "open"
                      }));
                      return;
                    }
                  });
                }

           if(obj.messagetype == "Auto Mode"){

                    console.log('auto');
                    s.clients.forEach(function e(client){
                      if(client.clientId == obj.robid){
                      client.send(JSON.stringify({
                        messagetype: obj.messagetype,
                        message: obj.message,
                        robid: obj.robid,
                        messageSend : "open"
                      }));
                     return;
                    }
                  });
               }
     });





      ////////////////robot connection close/////////////
     ws.on('close', function() {
     console.log("I lost a client");

     console.log(ws.clientId);
     var id = parseInt(ws.clientId,10);
     console.log(typeof ws.clientId);
     MongoClient.connect(url, function(err, db){
          if (err) throw err;
          var dbo = db.db("brs_cleaning_robot");
          /*Return only the documents with the address "Park Lane 38":*/
          var myquery = { Robot_id: id };
             var newvalues = { $set: {Status_of_robot: "Offline" } };
             dbo.collection("robots").updateOne(myquery, newvalues, function(err, res) {
               if (err) throw err;
                //console.log(res);
               console.log("1 document updated");
               db.close();
             });
        });
     for( var i = 0; i < arr.length; i++){
          if ( arr[i] === ws.clientId) {
            arr.splice(i, 1);
          }
        }

     console.log('length'+arr.length);

        s.clients.forEach(function e(client){
          // if(client.clientId != id){
          //   //console.log(client.clientId);
          // }
          // else{
            client.send(JSON.stringify({
              messagetype: 'close connection',
              message: arr,
              messageSend : "close"
            }));
           return;
         // }
      });
    });
   });

   //////////////////////////////////ws close//////////////////////////////////////////////////////
