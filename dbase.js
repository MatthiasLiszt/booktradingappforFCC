
function hello(){console.log('hello');}

function newUser(user,newuser,Render){
 var s={username: newuser.username};
 user.find(s,function(e,d){
   if(!d.length)
    {console.log("user not in database");
     user.create(newuser,function(e,d){
      if (e) return handleError(e);
      Render.redirect('/');
     });
    }
   else
    {var m="error - user in database";
     console.log(m);
     Render.render('generalpurpose.ejs',{message: m});
    }
 });
}

function checkLogin(user,cl,Render){
 user.find(cl,function(e,d){
   var authenticated=false; 
       
   //console.log(d.pw);
   //console.log(d[0].pw);
   //console.log(cl.pw);
   //if(d.pw==cl.pw){authenticated=true;}
   if(d.length){authenticated=true;}
   if(authenticated)
    {Render.redirect('/dologin');}
   else
     {Render.redirect('/falselog');}
  });
}

function updateUserData(user,olduser){
  var s={username: olduser.username, pw: olduser.pw}; 
  user.remove(s,function(e,d){
    if (e) return handleError(e);
    user.create(olduser,function(e,d){
      if (e) return handleError(e);
      console.log(olduser.username+" updated");      
    });  
  });
}

function addBook(book,bookdata,Render){
 var s=bookdata;
 book.find(s,function(e,d){
   if(!d.length)
    {console.log("book not in database");
     book.create(bookdata,function(e,d){   
      if (e) return handleError(e);
      console.log(bookdata.title+" added");
      //Render.render('index.ejs',{authenticated: true});
      getBooks(book,true,Render);
     });
    }
   else
    {var m="error - book already in database";
     console.log(m);
     Render.render('generalpurpose.ejs',{message: m});
    }
 });
}

function getBooks(book,a,Render){
  var all={};
  var books;
  console.log("getBooks executing");
  book.find(all,function(e,d){
   if (e) return handleError(e);
   if(d.length)
    {books=formatBookList(d);
     Render.render('index.ejs',{authenticated: a, books: books});
    }
   else
    {Render.render('index.ejs',{authenticated: a, books: "" });}
  });
}

function formatBookList(d){
 var i;
 var htmlcode,h=[];

 for(i=0;i<d.length;++i)
  {h[i]="<a href='/book/"+d[i].title+"'>"+d[i].title+"</a>&nbsp;";
  }
 htmlcode=h.join();
 console.log(htmlcode);
 return htmlcode;
}

function getBookInfo(book,title,user,a,Render){
  var s={title: title};
  var data;  
  console.log("getBookInfo executing");
  book.findOne(s,function(e,d){
     if (e) return handleError(e);
     data=formatBookData(d);
     Render.render('bookinfo.ejs',{bookinfo: data, user: user, a: a, bookowner: d.owner, title: d.title});   
  });
}

function formatBookData(d){
  var h;
  h="<ul><li>title = "+d.title+"</li>"+"<li>owned by <a href='/userinfo/"+d.owner+"'>"+
    d.owner+"</a></li>"+"</ul>";
  console.log(h);
  return h;
}

function getUserData(u,user,Render){
  var s={username: user};
  u.findOne(s,function(e,d){
    if (e) return handleError(e);
    console.log(JSON.stringify(d));
    Render.render('userdata.ejs',{udata: d});
  });
}

function deleteBook(book,title,owner,Render){
  var s={title: title, owner: owner};
  book.remove(s,function(e,d){
       if (e) return handleError(e);
       console.log(title+" deleted");
       Render.redirect("/");    
  });
}

function tradeBook(trade,tradedata,Render){
  console.log("executing tradeBook");
  trade.create(tradedata,function(e,d){
     if (e) return handleError(e);
     console.log(tradedata.title+" put to trade");
     Render.redirect("/");  
   });
}

function getTrades(trade,user,Render){
  var s={owner: user};
  var trades;
  console.log("getTrades executing");
  trade.find(s,function(e,d){
   if (e) return handleError(e);
   if(d.length)
    {trades=formatTradeList(d);
     Render.render('trades.ejs',{trades: trades});
    }
   else
    {Render.render('trades.ejs',{trades: "<strong>no trade requests</strong>" });}
  });
}

function formatTradeList(d){
  var r=[],h,b1a,b1d,b2l,b3b,b3o,b3r,b4e,b5a,b5d,be;
  var ff=[],aB=[],dB=[];

  b1a="<form action='/accept' method=post>";
  b1d="<form action='/deny' method=post>";
  b2l="<label for='book'></label><label for='owner'></label><label for='requester'></label>";
  b3b="<input type='hidden' name='book' value='";
  b3o="<input type='hidden' name='owner' value='";
  b3r="<input type='hidden' name='requester' value='";
  b4e="'></input>";
  b5a="<button>accept</button>";
  b5d="<button>deny</button>";
  be="</form>";

  for(var i=0;i<d.length;++i)
   {ff[i]=b2l+b3b+d[i].title+b4e+b3o+d[i].owner+b4e+b3r+d[i].requester+b4e;
    aB[i]=b1a+ff[i]+b5a+be;
    dB[i]=b1d+ff[i]+b5d+be;

    r[i]="<li>"+d[i].requester+" wants to have "+d[i].title+"&nbsp;"+aB[i]+dB[i]+"</li>";
   }
  h=r.join('');
  console.log("formated Trade List\n"+h);
  return h;
}

function deleteTrade(trade,data,Render){
 console.log("executing deleteTrade");
 trade.remove(data,function(e,d){
       console.log("trade removed");
       Render.redirect("/");
  });
}

function makeDeal(book,trade,data,Render){
 var booq={title: data.title, owner: data.owner};
 trade.remove(data,function(e,d){
       console.log("trade removed");
       book.remove(booq,function(e,d){
            console.log("book removed");
            Render.redirect("/");
       });
  });
}

module.exports=({newUser: newUser, checkLogin: checkLogin, 
                 updateUserData: updateUserData, addBook: addBook, 
                 getBooks: getBooks, getBookInfo: getBookInfo, 
                 getUserData: getUserData, deleteBook: deleteBook, 
                 tradeBook: tradeBook, getTrades: getTrades, deleteTrade: deleteTrade, makeDeal: makeDeal});
 
