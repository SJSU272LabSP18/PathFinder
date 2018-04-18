var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var users= require('./users.js');
//database connection
var mongoose = require('mongoose');
var proj=require('../models/postproject.js')
var bid1=require('../models/bid.js')
var db='mongodb://shahakshat:Axtshah14@ds223509.mlab.com:23509/freelancer';
mongoose.Promise=global.Promise;
mongoose.connect(db,function(err)
{
  if(err)
  {
    console.log("Error" +err);
  }
  else{
    console.log("Connected to Mongodb");
  }
})




router.get('/', function(req, res, next) {
  res.send('willing to post a project');
});

//Post Bid for a particular project
router.post('/projbids', function(req,res)
{
  if(req.session.email)
  {
  console.log("Post bid API called");
   console.log(req.body);
  var newbid1=new bid1();
  newbid1.proj_id=req.body.id;
  newbid1.proj_name=req.body.proj_details.proj_name;
  console.log(newbid.proj_name);
  newbid1.bid_amt=req.body.bid_amt;
  newbid1.bid_days=req.body.bid_days;
  newbid1.email_address=req.session.email;
  //var upper=req.body.proj_details.upper;
  //var lower=req.body.proj_details.lower;
  
    //console.log("condition satisfied");
    newbid1.save(function(err, insertedbid)
{
  if(err)
  {
    var result="Bid post failed";
    res.json(result);
    console.log(result);
    console.log(err);
  }
  else
  {
    console.log("Bid posted successfully");
    //console.log(insertedbid);
     var result="Bid posted successfully";
    res.json("Bid posted successfully");
    console.log(result);
    
  }
})
}
else{
  res.json("Login First");
}

  
});

router.post('/projectbid',function(req,res)
{
 
  console.log("Post bid API called");
   console.log(req.body);
  var newbid=new bid1();
  newbid.proj_id=req.body.id;
  newbid.email_address=req.session.email;
  //newbid.proj_name=req.body.proj_name;
  newbid.bid_amt=req.body.bid_amt;
  newbid.bid_days=req.body.bid_days;
  
  //var upper=req.body.upper;
  //var lower=req.body.lower;

    newbid.save(function(err, insertedbid)
{
  if(err)
  {
    var result="Bid post failed";
    res.json(result);
    console.log(result);
    console.log(err);
  }
  else
  {
    
     var result="Bid posted successfully";
    res.json("Bid posted successfully");
    console.log(result);
  }
})

  


  
});

//Post Project API
router.post('/project_post', function(req,res)
{
  
  console.log("Post Project API called");
 

 
  //var email= req.param('email_address'); 
  var newproj=new proj();  
  newproj.proj_name= req.body.proj_name;      
  newproj.proj_details= req.body.proj_desc;      
  newproj.skill1= req.body.skills1; 
  newproj.skill2= req.body.skills2; 
  newproj.skill3= req.body.skills3;     
  newproj.pay= req.body.payment;          
  newproj.lower=req.body.lower_range;     
  newproj.upper=req.body.upper_range; 
  newproj.email_address=req.body.email_address;      
  newproj.status=req.body.status; 
  newproj.save(function(err, insertedproj)
{
  if(err)
  {
    console.log("Data not inserted into project collection");
    res.json("Project Posted unsuccessfully");
  }
  else
  {
    res.json("Project Posted successfully")
  }
})
      


});

//Retreive self projects API
router.get('/selfprojects',function(req,res)
{
  
 if(req.session.email)
 {
   console.log(req.session.email);
   newproj=new proj();
   //newproj.email_address=req.body.email_address;
   console.log(newproj.email_address);

  console.log('Retreive Self Projects request API called');
  proj.find({'email_address':req.session.email})
  .exec(function(err,proj)
{
  if(err)
  {
    console.log("error in finding data from the users");
  }
  console.log(proj);
    res.json(proj);
})
 }
 else
 {
   res.json("Login First");
 }
  
  
}
)

//Retreive relevant projects API
router.get('/relevantprojects',function(req,res)
{
  console.log('Retreive Self Projects request API called');
 if(req.session.email)
 {
   console.log(req.session.email);
   newproj=new proj();
   //newproj.email_address=req.body.email_address;
   //console.log(newproj.email_address);

  
  proj.find({'email_address':req.session.email})
  .exec(function(err,proj)
{
  if(err)
  {
    console.log("error in finding data from the users");
  }
  console.log(proj);
    res.json(proj);
})
 }
 else
 {
   res.json("Login First");
 }
  
  
}
)



  //Retreive open projects API
router.get('/openprojects',function(req,res)
{
  

 if(req.session.email)
 {

 
   console.log(req.session.email);
   newproj=new proj();
  //newproj.email_address=req.body.email_address;
   console.log(newproj.email_address);

  console.log('Retreive Open Projects request API called');
  proj.find({'email_address':{$ne:req.session.email}})
  .exec(function(err,proj)
{
  if(err)
  {
    console.log("error in finding data from the users");
  }
  else if(req.body.relevantprojects){
    proj.find()
  }
  console.log(proj);
    res.json(proj);
})
 }

else
{
res.json("Login First");
}
}
  
  

);

  //Retreive individual project Details API
  router.post('/projectdetails',function(req,res)
  {
    
  if(req.session.email)
  {
   
  
    console.log("Retreive individual project Details API");
    console.log(req.body);
     console.log(req.session.email);
     newproj=new proj();
    
     console.log(newproj.email_address);
  
    console.log('Retreive Open Projects request API called');
    proj.findOne({'_id':req.body.id})
    .exec(function(err,proj)
  {
    if(err)
    {
      console.log("error in finding data from the users");
    }
    console.log(proj);
      res.json(proj);
  })
}
else{
  console.log("Login First");
  res.json("Login First");
}
   
  
  
  }
  );

//Retreive self projects API
router.post('/particularprojects',function(req,res)
{
  console.log("Hit particular project API ");
 if(req.session.email)
 {
   console.log(req.body);
   console.log(req.session.email);
   var newproj1=new proj();
   newproj1.xyz=req.body.xyz;
   //newproj1.skill1=req.body.skill1;
   //newproj1.skill2=req.body.skill2;
   //newproj1.skill3=req.body.skill3;
   //console.log(req.body.proj_name);
  
   //newproj.email_address=req.body.email_address;
   //console.log(newproj.email_address);

  console.log('Retreive Particular Project request API called');
  proj.find({$or:[{'proj_name':req.body.xyz},{'skill1':req.body.xyz},{'skill2':req.body.xyz},{'skill3':req.body.xyz}]})
  .exec(function(err,proj)
{
  if(err)
  {
    console.log("error in finding data from the particular project");
    res.json("Error finding particular project")
  }
  else{
  console.log(proj);
    res.json(proj);
  }
})
 }
 else
 {
   res.json("Login First");
 }
  
  
}
)
  
 
router.post('/testparticularprojects',function(req,res)
{
  console.log("Hit particular project API ");
 
 
   console.log(req.body);
   //console.log(req.session.email);
   var newproj1=new proj();
   //newproj1.proj_name=req.body.xyz;

   //newproj1.skill1=req.body.skill1;
   //newproj1.skill2=req.body.skill2;
   //newproj1.skill3=req.body.skill3;
   //console.log(req.body.proj_name);
  
   //newproj.email_address=req.body.email_address;
   //console.log(newproj.email_address);

  console.log('Retreive Particular Project request API called');
  proj.find({$or:[{'proj_name':req.body.xyz},{'skill1':req.body.xyz},{'skill2':req.body.xyz},{'skill3':req.body.xyz}]})
  .exec(function(err,proj)
{
  if(err)
  {
    console.log("error in finding data from the users");
    res.json("Error finding particular project")
  }
  else{
  console.log(proj);
    res.json(proj);
  }
})
 
 
  
  
}
)
 
 


    
    







module.exports = router;