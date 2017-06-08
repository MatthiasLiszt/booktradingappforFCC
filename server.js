// server.js

// set up ======================================================================
// get all the tools we need

var express  = require('express');
var app      = express();
var port     = process.env.PORT || 5000;
var mongoose = require('mongoose');

var url = process.env.MONGODBURL || 'mongodb://localhost:27017/booktrade'// for accessing database

var dbase = require('./dbase')
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var path = require('path')

//database schemas and models

var userSchema = mongoose.Schema({    username: String,
                                      pw: String,
                                      fullname: String,
                                      city: String,
                                      state: String
                                    });
   

var User=mongoose.model('User',userSchema);

var bookSchema = mongoose.Schema({ title: String,
                                   owner: String,
                                   pix: String
                                 });

var Book=mongoose.model('Book',bookSchema);

var tradeSchema = mongoose.Schema({ title: String,
                                    owner: String,
                                    pix: String,
                                    requester: String 
                                 });

var Trade=mongoose.model('Trade',tradeSchema);

  
// configuration ===============================================================


// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
    secret: 'makingtheplanetgreatagain', // session secret
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


// launch ======================================================================
app.listen(port);
console.log('server runs on port  ' + port);


// routing ===============================

var authenticated=false; 
var token=0;
var uname="nobody"
var cpw="unknown"; //current password
var verifier=0;

var Res;

var books;

app.get('/', function(req, res) {
        Res=res
        console.log('index.ejs')
        console.log("user "+uname+" pw "+cpw);  
        //if(oll !== undefined){console.log(oll[0])}else{console.log('oll still undefined')}
        //res.render('index.ejs',{authenticated: authenticated});   
        dbase.getBooks(Book,authenticated,res);
       });

app.get('/login', function(req, res) {
        Res=res
          console.log('login.ejs')
        //if(oll !== undefined){console.log(oll[0])}else{console.log('oll still undefined')}
        if(authenticated)
         {//res.render('index.ejs',{authenticated: authenticated});
          dbase.getBooks(Book,authenticated,res);
         } 
        else  
         {res.render('login.ejs',{authenticated: authenticated});}
       });

app.get('/dologin',function(req,res){
    authenticated=true;
    console.log("user "+uname+" pw "+cpw);
    //res.render('index.ejs',{authenticated: authenticated});
    dbase.getBooks(Book,authenticated,res);
});


app.get('/logout',function(req,res){
    authenticated=false;
    uname="nobody";
    cpw="unknown";
    console.log("user "+uname+" pw "+cpw);
    //res.render('index.ejs',{authenticated: authenticated});
    dbase.getBooks(Book,authenticated,res);
});

app.get('/falselog',function(req,res){
    var m="Sorry, but you probably provided false login data";
    uname="nobody";
    cpw="unknown";
    console.log("user "+uname+" pw "+cpw);
    res.render('generalpurpose.ejs',{message: m});
});

app.post('/logincheck',function(req,res){
        var logcheck={username: req.body.username, pw: req.body.password};
        console.log("searching for "+JSON.stringify(logcheck));
        uname=logcheck.username;
        cpw=logcheck.pw;
        dbase.checkLogin(User,logcheck,res);
        /*
        if(authenticated)
         {res.render('index.ejs',{authenticated: authenticated});} 
        else  
         {var m="Sorry, but you probably provided false login data";
          res.render('generalpurpose.ejs',{message: m});}
        */
});             
              
app.get('/register',function(req,res){
      res.render('register.ejs');
});

app.post('/registercheck',function(req,res){
    var newuser={username: req.body.username, pw: req.body.password,
                 fullname: req.body.fullname, city: req.body.city, 
                 state: req.body.state};
    console.log(JSON.stringify(newuser));
    dbase.newUser(User,newuser,res);
    
});

app.get('/update',function(req,res){
      res.render('update.ejs');
});

app.post('/updatecheck',function(req,res){
    var olduser={username: uname, pw: cpw,
                 fullname: req.body.fullname, city: req.body.city, 
                 state: req.body.state};
    console.log(JSON.stringify(olduser));
    dbase.updateUserData(User,olduser);
    //res.render('index.ejs',{authenticated: authenticated});
    dbase.getBooks(Book,authenticated,res); 
});

app.get('/addbook',function(req,res){
   var bookdata={title: req.query.addnewbook, owner: uname};
   if(authenticated)
    {dbase.addBook(Book,bookdata,res);}
   else
    {var m="you must first login or register to add a book";
     res.render('generalpurpose.ejs',{message: m});
    } 
});

app.get('/userinfo/:user',function(req,res){
    var user=req.params.user;
    console.log("/user/"+user);
    dbase.getUserData(User,user,res); 
});

app.get('/book/:book',function(req,res){
    var booq=req.params.book;
    console.log("/book/"+booq);
    dbase.getBookInfo(Book,booq,uname,authenticated,res);    
});

app.get('/deletebook',function(req,res){
    var booq=req.query.book;
    console.log(booq+" to delete");
    dbase.deleteBook(Book,booq,uname,res);
});

app.get('/tradebook',function(req,res){
    var booq=req.query.book;
    var owner=req.query.owner;
    var m;
    m=owner+"'s "+booq+" to trade";
    console.log(m);
    var tradedata={title: booq, owner: owner, pix: undefined, requester: uname};
    console.log(JSON.stringify(tradedata));
    dbase.tradeBook(Trade,tradedata,res);
    //res.render('generalpurpose.ejs',{message: m});
});

app.get('/trades',function(req,res){
    dbase.getTrades(Trade,uname,res);
});

app.post('/accept',function(req,res){
    var r=req.body.requester,o=req.body.owner,t=req.body.book;
    var d={title: t,owner: o,requester: r};
    var m=JSON.stringify(d);
    console.log("accepted trade "+m);
    dbase.makeDeal(Book,Trade,d,res);
    //res.render('generalpurpose.ejs',{message: m});  
});

app.post('/deny',function(req,res){
    var r=req.body.requester,o=req.body.owner,t=req.body.book;
    var d={title: t,owner: o,requester: r};
    var m=JSON.stringify(d);
    console.log("trade denied "+m);
    dbase.deleteTrade(Trade,d,res);
    //res.render('generalpurpose.ejs',{message: m});  
});


// database initalisation

mongoose.connect(url);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we are connected");
});




